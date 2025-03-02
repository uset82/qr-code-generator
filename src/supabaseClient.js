import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
}

// Configure Supabase client with timeout and retry options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  global: {
    fetch: (url, options) => {
      const timeout = 30000; // 30 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      })
        .then(response => {
          clearTimeout(timeoutId);
          return response;
        })
        .catch(error => {
          clearTimeout(timeoutId);
          console.error('Supabase fetch error:', error);
          // Return a more graceful error response instead of throwing
          if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your network connection and try again.');
          }
          throw error;
        });
    }
  }
});

// Helper function to handle retries for Supabase operations
export async function withRetry(operation, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}):`, error);
      lastError = error;
      
      // Check for specific errors that shouldn't be retried
      if (error.message && (
          error.message.includes('not found') ||
          error.message.includes('permission denied') ||
          error.message.includes('invalid input')
      )) {
        console.error('Non-retriable error encountered:', error.message);
        break; // Don't retry client errors
      }
      
      // Only delay if we're going to retry
      if (attempt < maxRetries - 1) {
        // Exponential backoff with jitter
        const jitter = Math.random() * 0.3 + 0.85; // Random between 0.85-1.15
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(1.5, attempt) * jitter));
      }
    }
  }
  
  // Enhance error message with more context
  if (lastError) {
    console.error('All retry attempts failed:', lastError);
    if (lastError.message) {
      lastError.message = `After ${maxRetries} attempts: ${lastError.message}`;
    }
  }
  
  throw lastError || new Error('Operation failed after multiple attempts');
}

// Helper function to fetch artwork data by ID
export async function fetchArtworkById(artworkId) {
  try {
    // Use withRetry for better resilience
    const { data, error } = await withRetry(async () => {
      return await supabase
        .from('artworks')
        .select('*')
        .eq('id', artworkId)
        .single();
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching artwork:', error);
    // Provide more context in the UI
    throw new Error(`Could not retrieve artwork details: ${error.message || 'Unknown error'}`);
  }
}

// Helper function to fetch all artworks
export async function fetchAllArtworks() {
  try {
    // Use withRetry for better resilience
    const { data, error } = await withRetry(async () => {
      return await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching artworks:', error);
    // Return empty array but log the error for debugging
    return [];
  }
}

// Helper function to save a new QR code visit
export async function saveQRCodeVisit(artworkId, metadata = {}) {
  try {
    const { data, error } = await supabase
      .from('qr_visits')
      .insert([
        {
          artwork_id: artworkId,
          visited_at: new Date().toISOString(),
          metadata
        }
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving QR code visit:', error);
    return null;
  }
}

// Helper function to fetch artworks by student ID
export async function fetchArtworksByStudentId(studentId) {
  try {
    // Use withRetry to handle potential network issues
    const { data, error } = await withRetry(async () => {
      const result = await supabase
        .from('artworks')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      
      if (result.error) throw result.error;
      return result;
    }, 3, 1000); // 3 retries with 1 second base delay

    if (error) throw error;

    // If no data from Supabase, try local storage
    if (!data || data.length === 0) {
      const localArtworksString = localStorage.getItem(`artworks_${studentId}`);
      if (localArtworksString) {
        const localArtworks = JSON.parse(localArtworksString);
        return localArtworks;
      }
    }

    // Combine Supabase data with local storage data
    const localArtworksString = localStorage.getItem(`artworks_${studentId}`);
    const localArtworks = localArtworksString ? JSON.parse(localArtworksString) : [];
    
    // Combine and remove duplicates based on ID
    const allArtworks = [...(data || []), ...localArtworks];
    const uniqueArtworks = Array.from(
      new Map(allArtworks.map(item => [item.id, item])).values()
    );

    return uniqueArtworks;
  } catch (error) {
    console.error('Error fetching student artworks:', error);
    
    // Fallback to local storage on error
    const localArtworksString = localStorage.getItem(`artworks_${studentId}`);
    if (localArtworksString) {
      const localArtworks = JSON.parse(localArtworksString);
      return localArtworks;
    }
    return [];
  }
}

// Helper function to upload a new artwork
export async function uploadArtwork(artwork) {
  try {
    // First upload the file to storage if there's a file
    let fileUrl = artwork.image_url;

    if (artwork.file) {
      const fileName = `${Date.now()}-${artwork.file.name.replace(/\s+/g, '-')}`;
      const filePath = `students/${artwork.student_id}/${artwork.type}s/${fileName}`;

      // Use retry logic for file upload which is most likely to timeout
      const { data: fileData, error: fileError } = await withRetry(async () => {
        const result = await supabase.storage
          .from('artworks')
          .upload(filePath, artwork.file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (result.error) throw result.error;
        return result;
      }, 3, 2000); // 3 retries with 2 second base delay

      if (fileError) throw fileError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(filePath);
        
      fileUrl = publicUrl;
    }

    // Then insert the artwork record with retry logic
    const { data, error } = await withRetry(async () => {
      const result = await supabase
        .from('artworks')
        .insert([
          {
            id: artwork.id || `${artwork.student_id}-${Date.now()}`,
            title: artwork.title,
            student: artwork.student,
            student_id: artwork.student_id,
            image_url: fileUrl,
            file_path: artwork.file_path || '',
            type: artwork.type || 'image',
            created_by: artwork.created_by
          }
        ]);
      
      if (result.error) throw result.error;
      return result;
    });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading artwork:', error);
    return null;
  }
}

