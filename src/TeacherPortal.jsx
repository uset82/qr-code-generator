import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { students } from './StudentList';
import { supabase, withRetry } from './supabaseClient';
import { useAuth } from './lib/AuthContext';
import './TeacherPortal.css';

function TeacherPortal() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [studentArtworks, setStudentArtworks] = useState([]);
  const [quotaInfo, setQuotaInfo] = useState({
    images: { used: 0, total: 3 },
    videos: { used: 0, total: 1 },
    audio: { used: 0, total: 1 }
  });

  // Fetch student's existing artworks when a student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentArtworks(selectedStudent.folder_name);
    }
  }, [selectedStudent]);

  // Fetch student's artworks and calculate quota usage
  const fetchStudentArtworks = async (studentId) => {
    try {
      // Try to fetch from Supabase
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('artworks')
          .select('*')
          .eq('student_id', studentId);
      }, 3, 1000);

      if (error) throw error;
      
      // Get any locally stored artworks
      const localArtworksString = localStorage.getItem(`artworks_${studentId}`);
      const localArtworks = localArtworksString ? JSON.parse(localArtworksString) : [];
      
      // Combine Supabase data with local storage data
      const combinedArtworks = [...(data || []), ...localArtworks];
      
      // Remove duplicates (if any) based on id
      const uniqueArtworks = Array.from(new Map(combinedArtworks.map(item => [item.id, item])).values());
      
      setStudentArtworks(uniqueArtworks);

      // Calculate quota usage
      const quotaUsage = {
        images: { used: 0, total: 3 },
        videos: { used: 0, total: 1 },
        audio: { used: 0, total: 1 }
      };

      uniqueArtworks.forEach(artwork => {
        if (artwork.type === 'image') quotaUsage.images.used++;
        if (artwork.type === 'video') quotaUsage.videos.used++;
        if (artwork.type === 'audio') quotaUsage.audio.used++;
      });

      setQuotaInfo(quotaUsage);
    } catch (error) {
      console.error('Error fetching student artworks:', error);
      
      // If Supabase fetch fails, try to use local storage as fallback
      const localArtworksString = localStorage.getItem(`artworks_${studentId}`);
      if (localArtworksString) {
        const localArtworks = JSON.parse(localArtworksString);
        setStudentArtworks(localArtworks);
        
        // Calculate quota usage from local data
        const quotaUsage = {
          images: { used: 0, total: 3 },
          videos: { used: 0, total: 1 },
          audio: { used: 0, total: 1 }
        };
        
        localArtworks.forEach(artwork => {
          if (artwork.type === 'image') quotaUsage.images.used++;
          if (artwork.type === 'video') quotaUsage.videos.used++;
          if (artwork.type === 'audio') quotaUsage.audio.used++;
        });
        
        setQuotaInfo(quotaUsage);
      } else {
        setMessage({ text: 'Failed to load student data', type: 'error' });
      }
    }
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif'],
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg']
    };

    if (!validTypes[mediaType].includes(selectedFile.type)) {
      setMessage({ 
        text: `Invalid file type. Please upload a valid ${mediaType} file.`, 
        type: 'error' 
      });
      return;
    }

    // Validate file size
    const maxSizes = {
      image: 10 * 1024 * 1024, // 10MB
      video: 50 * 1024 * 1024, // 50MB
      audio: 10 * 1024 * 1024  // 10MB
    };

    if (selectedFile.size > maxSizes[mediaType]) {
      setMessage({ 
        text: `File too large. Maximum size for ${mediaType} is ${maxSizes[mediaType] / (1024 * 1024)}MB`, 
        type: 'error' 
      });
      return;
    }

    try {
      // Create a placeholder message while validating
      setMessage({ text: 'Validating file...', type: 'info' });
      
      // For videos, check duration
      if (mediaType === 'video') {
        const isValid = await validateVideoDuration(selectedFile, 20); // 20 seconds max
        if (!isValid) {
          setMessage({ 
            text: 'Video too long. Maximum duration is 20 seconds.', 
            type: 'error' 
          });
          return;
        }
      }

      // For audio, check duration
      if (mediaType === 'audio') {
        const isValid = await validateAudioDuration(selectedFile, 60); // 60 seconds max
        if (!isValid) {
          setMessage({ 
            text: 'Audio too long. Maximum duration is 1 minute.', 
            type: 'error' 
          });
          return;
        }
      }

      setFile(selectedFile);
      setMessage({ text: '', type: '' });
    } catch (error) {
      console.error('Error validating file:', error);
      setMessage({ 
        text: 'Error validating file. Please try again.', 
        type: 'error' 
      });
    }
  };

  // Validate video duration
  const validateVideoDuration = (file, maxSeconds) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration <= maxSeconds);
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(false); // Consider invalid if we can't determine
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  // Validate audio duration
  const validateAudioDuration = (file, maxSeconds) => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      
      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        resolve(audio.duration <= maxSeconds);
      };
      
      audio.onerror = () => {
        window.URL.revokeObjectURL(audio.src);
        resolve(false); // Consider invalid if we can't determine
      };
      
      audio.src = URL.createObjectURL(file);
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      setMessage({ text: 'Please select a student', type: 'error' });
      return;
    }

    if (!file) {
      setMessage({ text: 'Please select a file to upload', type: 'error' });
      return;
    }

    if (!title.trim()) {
      setMessage({ text: 'Please enter a title', type: 'error' });
      return;
    }

    // Check quota
    if (
      (mediaType === 'image' && quotaInfo.images.used >= quotaInfo.images.total) ||
      (mediaType === 'video' && quotaInfo.videos.used >= quotaInfo.videos.total) ||
      (mediaType === 'audio' && quotaInfo.audio.used >= quotaInfo.audio.total)
    ) {
      setMessage({ 
        text: `Quota exceeded for ${mediaType}s. Please delete some existing ${mediaType}s first.`, 
        type: 'error' 
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage({ text: 'Preparing upload...', type: 'info' });

    try {
      // Create file path based on student folder structure
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const safeTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fileName = `${timestamp}-${safeTitle}.${fileExt}`;
      const filePath = `${selectedStudent.folder_name}/${mediaType}s/${fileName}`;
      
      // Create artwork ID that will be consistent across storage and database
      const artworkId = `${selectedStudent.folder_name}-${mediaType}-${timestamp}`;

      setMessage({ text: 'Uploading file...', type: 'info' });
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      
      setUploadProgress(50);
      setMessage({ text: 'File uploaded, getting public URL...', type: 'info' });
      
      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('artworks')
        .getPublicUrl(filePath);
        
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      const publicUrl = urlData.publicUrl;
      setUploadProgress(70);
      
      // Create database record
      const { error: dbError } = await supabase
        .from('artworks')
        .insert([{
          id: artworkId,
          title: title,
          student: selectedStudent.name,
          student_id: selectedStudent.folder_name,
          image_url: publicUrl,
          file_path: filePath,
          type: mediaType,
          description: description || '',
          created_at: new Date().toISOString(),
          created_by: user.id
        }]);

      if (dbError) throw dbError;

      setUploadProgress(100);
      setMessage({ text: 'Upload successful!', type: 'success' });
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      
      // Refresh student artworks
      fetchStudentArtworks(selectedStudent.folder_name);
    } catch (error) {
      console.error('Error uploading:', error);
      setMessage({ 
        text: `Upload failed: ${error.message}. Please try again.`, 
        type: 'error' 
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle artwork deletion
  const handleDeleteArtwork = async (artwork) => {
    if (!confirm(`Are you sure you want to delete "${artwork.title}"?`)) {
      return;
    }

    try {
      setMessage({ text: 'Deleting artwork...', type: 'info' });
      
      let storageDeleted = false;
      
      // Delete file from storage if file_path exists
      if (artwork.file_path && artwork.storage_location === 'supabase') {
        try {
          // Use withRetry for storage deletion
          const { error: storageError } = await withRetry(async () => {
            const result = await supabase.storage
              .from('artworks')
              .remove([artwork.file_path]);
            
            if (result.error) throw result.error;
            return result;
          }, 3, 2000); // 3 retries with 2 second base delay

          if (storageError) {
            console.error('Error deleting from storage:', storageError);
            throw storageError;
          }
          
          storageDeleted = true;
          console.log('Successfully deleted file from storage');
        } catch (storageErr) {
          console.error('Exception when deleting from storage:', storageErr);
          // Continue with deletion process even if storage deletion fails
        }
      }

      // Delete record from database
      if (navigator.onLine) {
        try {
          const { error: dbError } = await withRetry(async () => {
            return await supabase
              .from('artworks')
              .delete()
              .eq('id', artwork.id);
          }, 3, 1000);
  
          if (dbError) {
            console.error('Database deletion error:', dbError);
            throw dbError;
          } else {
            console.log('Successfully deleted record from database');
          }
        } catch (dbErr) {
          console.error('Exception when deleting from database:', dbErr);
          // Continue with local storage update even if database deletion fails
        }
      }

      // Always update local storage to ensure UI consistency
      try {
        const localArtworksString = localStorage.getItem(`artworks_${selectedStudent.folder_name}`);
        if (localArtworksString) {
          const localArtworks = JSON.parse(localArtworksString);
          const updatedArtworks = localArtworks.filter(item => item.id !== artwork.id);
          localStorage.setItem(`artworks_${selectedStudent.folder_name}`, JSON.stringify(updatedArtworks));
          console.log('Successfully updated local storage');
        }
        
        // Remove any pending sync operations for this artwork
        localStorage.removeItem(`pending_upload_${artwork.id}`);
        localStorage.removeItem(`pending_db_sync_${artwork.id}`);
      } catch (localErr) {
        console.error('Error updating local storage:', localErr);
      }

      // Update state immediately to reflect the deletion
      setStudentArtworks(prevArtworks => prevArtworks.filter(item => item.id !== artwork.id));
      
      // Update quota info
      setQuotaInfo(prevQuota => ({
        ...prevQuota,
        [artwork.type + 's']: {
          ...prevQuota[artwork.type + 's'],
          used: Math.max(0, prevQuota[artwork.type + 's'].used - 1)
        }
      }));

      setMessage({ 
        text: `Artwork deleted successfully${!storageDeleted && artwork.file_path ? ' (Note: File may remain in storage)' : ''}`, 
        type: 'success' 
      });
      
      // Refresh student artworks to ensure UI is up-to-date
      fetchStudentArtworks(selectedStudent.folder_name);
    } catch (error) {
      console.error('Error deleting artwork:', error);
      setMessage({ text: 'Failed to delete artwork. Please try again.', type: 'error' });
    }
  };

  // Check for pending uploads/syncs on component mount
  useEffect(() => {
    const syncPendingItems = async () => {
      if (!navigator.onLine) return;
      
      // Find all pending items in localStorage
      const pendingItems = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('pending_upload_') || key.startsWith('pending_db_sync_')) {
          try {
            const itemData = JSON.parse(localStorage.getItem(key));
            pendingItems.push({
              id: key.replace('pending_upload_', '').replace('pending_db_sync_', ''),
              type: key.startsWith('pending_upload_') ? 'upload' : 'db_sync',
              data: itemData
            });
          } catch (e) {
            console.error('Error parsing pending item:', e);
          }
        }
      }
      
      // TODO: Implement syncing logic for pending items
      console.log('Pending items to sync:', pendingItems);
    };
    
    syncPendingItems();
    
    // Listen for online status changes
    window.addEventListener('online', syncPendingItems);
    return () => window.removeEventListener('online', syncPendingItems);
  }, []);

  // Helper function to navigate to the share page for an artwork
  const navigateToSharePage = (artworkId) => {
    navigate(`/share/${encodeURIComponent(artworkId)}`);
  };

  // Render student artwork card
  const renderArtworkCard = (artwork) => {
    const isImage = artwork.file_type && artwork.file_type.includes('image');
    const isVideo = artwork.file_type && artwork.file_type.includes('video');
    const isAudio = artwork.file_type && artwork.file_type.includes('audio');
    const isPending = artwork.uploadStatus === 'pending';
    const hasSyncIssue = artwork.needsSync;

    return (
      <div key={artwork.id} className="artwork-card">
        <div className="artwork-card-header">
          <h3>{artwork.title}</h3>
          {isPending && <span className="sync-status pending">Pending Upload</span>}
          {hasSyncIssue && <span className="sync-status needs-sync">Needs Sync</span>}
        </div>
        
        <div className="artwork-media">
          {isImage && (
            <img 
              src={artwork.file_url} 
              alt={artwork.title}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML += '<div class="media-error">Image unavailable</div>';
              }}
            />
          )}
          {isVideo && (
            <div className="video-container">
              <video 
                src={artwork.file_url} 
                controls 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML += '<div class="media-error">Video unavailable</div>';
                }}
              />
            </div>
          )}
          {isAudio && (
            <div className="audio-container">
              <div className="audio-icon">♪</div>
              <audio 
                src={artwork.file_url} 
                controls 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML += '<div class="media-error">Audio unavailable</div>';
                }}
              />
            </div>
          )}
        </div>
        <p className="artwork-description">{artwork.description}</p>
        <div className="artwork-actions">
          <button 
            className="remove-button" 
            onClick={() => handleDeleteArtwork(artwork)}
          >
            Delete
          </button>
          <button 
            className="share-button" 
            onClick={() => navigateToSharePage(artwork.id)}
            disabled={isPending}
          >
            Share
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="teacher-portal">
      <Link to="/" className="back-button">← Back to Generator</Link>
      <header className="portal-header">
        <h1>Teacher Portal</h1>
        <p>Upload and manage student artwork</p>
        {user && (
          <div className="user-info">
            Logged in as: <strong>{user.email}</strong> 
            <button onClick={signOut} className="logout-button">Sign Out</button>
          </div>
        )}
      </header>

      <div className="portal-content">
        <div className="student-selection">
          <h2>Select Student</h2>
          <div className="student-grid">
            {students.map((student) => (
              <button
                key={student.id}
                className={`student-button ${selectedStudent?.folder_name === student.folder_name ? 'selected' : ''}`}
                onClick={() => setSelectedStudent(student)}
              >
                {student.name}
              </button>
            ))}
          </div>
        </div>

        {selectedStudent && (
          <div className="upload-section">
            <h2>Upload Media for {selectedStudent.name}</h2>
            
            <div className="quota-info">
              <h3>Quota Usage</h3>
              <div className="quota-bars">
                <div className="quota-item">
                  <span>Images: {quotaInfo.images.used}/{quotaInfo.images.total}</span>
                  <div className="quota-bar">
                    <div 
                      className="quota-fill" 
                      style={{ width: `${(quotaInfo.images.used / quotaInfo.images.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="quota-item">
                  <span>Videos: {quotaInfo.videos.used}/{quotaInfo.videos.total}</span>
                  <div className="quota-bar">
                    <div 
                      className="quota-fill" 
                      style={{ width: `${(quotaInfo.videos.used / quotaInfo.videos.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="quota-item">
                  <span>Audio: {quotaInfo.audio.used}/{quotaInfo.audio.total}</span>
                  <div className="quota-bar">
                    <div 
                      className="quota-fill" 
                      style={{ width: `${(quotaInfo.audio.used / quotaInfo.audio.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="upload-form">
              <div className="form-group">
                <label>Media Type</label>
                <div className="media-type-selector">
                  <button 
                    type="button" 
                    className={mediaType === 'image' ? 'active' : ''}
                    onClick={() => setMediaType('image')}
                    disabled={quotaInfo.images.used >= quotaInfo.images.total}
                  >
                    Image
                  </button>
                  <button 
                    type="button" 
                    className={mediaType === 'video' ? 'active' : ''}
                    onClick={() => setMediaType('video')}
                    disabled={quotaInfo.videos.used >= quotaInfo.videos.total}
                  >
                    Video
                  </button>
                  <button 
                    type="button" 
                    className={mediaType === 'audio' ? 'active' : ''}
                    onClick={() => setMediaType('audio')}
                    disabled={quotaInfo.audio.used >= quotaInfo.audio.total}
                  >
                    Audio
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for this artwork"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="file">Upload {mediaType}</label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  accept={mediaType === 'image' ? 'image/jpeg,image/png,image/gif' : 
                          mediaType === 'video' ? 'video/mp4,video/webm,video/quicktime' : 
                          'audio/mpeg,audio/wav,audio/ogg'}
                  required
                />
                {mediaType === 'image' && (
                  <div className="file-requirements">
                    Max size: 10MB | Formats: JPG, PNG, GIF
                  </div>
                )}
                {mediaType === 'video' && (
                  <div className="file-requirements">
                    Max size: 50MB | Max duration: 20 seconds | Formats: MP4, WebM, QuickTime
                  </div>
                )}
                {mediaType === 'audio' && (
                  <div className="file-requirements">
                    Max size: 10MB | Max duration: 1 minute | Formats: MP3, WAV, OGG
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={uploading || !file || !title.trim()}
              >
                {uploading ? 'Uploading...' : 'Upload Media'}
              </button>

              {uploading && (
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
            </form>

            {studentArtworks.length > 0 && (
              <div className="student-artworks">
                <h3>Student Media</h3>
                <div className="artwork-grid">
                  {studentArtworks.map(renderArtworkCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherPortal;