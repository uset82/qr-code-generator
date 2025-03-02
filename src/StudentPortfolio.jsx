import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchArtworksByStudentId, withRetry } from './supabaseClient';
import { students } from './StudentList';
import './StudentPortfolio.css';

function StudentPortfolio({ studentId }) {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [activeTab, setActiveTab] = useState('all');

  // Set up online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper function to safely decode student ID
  const safeDecodeURI = (encodedId) => {
    try {
      return decodeURIComponent(encodedId);
    } catch (err) {
      console.error('Error decoding URI:', err);
      return encodedId; // Return the original if decoding fails
    }
  };

  // Get student info from the student list
  useEffect(() => {
    if (!studentId) return;
    
    const decodedStudentId = safeDecodeURI(studentId);
    
    // Try to find the student in the student list first
    const student = students.find(s => s.id === decodedStudentId);
    
    if (student) {
      setStudentInfo(student);
    } else {
      console.warn(`Student with ID ${decodedStudentId} not found in student list`);
      // Create a placeholder student object with the ID
      setStudentInfo({
        id: decodedStudentId,
        name: 'Unknown Student',
        folderName: decodedStudentId
      });
    }
  }, [studentId]);

  // Load student artworks
  useEffect(() => {
    async function loadStudentArtworks() {
      if (!studentId) {
        setError('No student ID provided');
        setLoading(false);
        return;
      }
      
      // Safely decode the student ID from the URL (it may contain special characters)
      const decodedStudentId = safeDecodeURI(studentId);
      console.log('Loading artworks for student ID:', decodedStudentId);

      setLoading(true);
      setError(null);

      try {
        // First try to load from local storage to show something immediately
        let loadedArtworks = [];
        let foundInLocalStorage = false;
        
        try {
          const localArtworksString = localStorage.getItem(`artworks_${decodedStudentId}`);
          if (localArtworksString) {
            const localArtworks = JSON.parse(localArtworksString);
            if (localArtworks && localArtworks.length > 0) {
              loadedArtworks = localArtworks;
              foundInLocalStorage = true;
              console.log('Using local storage artworks initially:', localArtworks);
              
              // Update state early to show something right away
              setArtworks(localArtworks);
              
              // If we're offline, we'll stop here and use only local data
              if (isOffline) {
                setLoading(false);
                return;
              }
            }
          }
        } catch (localError) {
          console.error('Error accessing local storage:', localError);
        }
        
        // Then try to fetch from Supabase if online
        if (!isOffline) {
          try {
            const data = await withRetry(() => fetchArtworksByStudentId(decodedStudentId), 3, 1000);
            
            if (data && data.length > 0) {
              console.log('Fetched artworks from Supabase:', data);
              
              // Merge with local data to ensure we have everything
              // Use a Map to avoid duplicates based on ID
              const artworkMap = new Map();
              
              // Add remote data first
              data.forEach(artwork => {
                artworkMap.set(artwork.id, {
                  ...artwork,
                  dataSource: 'remote'
                });
              });
              
              // Then add local data that doesn't exist in remote
              loadedArtworks.forEach(artwork => {
                if (!artworkMap.has(artwork.id)) {
                  artworkMap.set(artwork.id, {
                    ...artwork,
                    dataSource: 'local'
                  });
                }
              });
              
              // Convert Map back to array and sort by creation date (newest first)
              loadedArtworks = Array.from(artworkMap.values())
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
              
              // Save the merged data back to local storage for future use
              localStorage.setItem(`artworks_${decodedStudentId}`, JSON.stringify(loadedArtworks));
            } else if (!foundInLocalStorage) {
              // Only show an error if we didn't find anything in local storage
              setError('No artworks found for this student');
            }
          } catch (remoteError) {
            console.error('Error fetching from Supabase:', remoteError);
            
            // Only show an error if we didn't find anything in local storage
            if (!foundInLocalStorage) {
              setError('Error loading artworks from server. Showing locally saved artworks if available.');
            }
          }
        }
        
        // Update state with all artworks (from local storage, remote, or merged)
        setArtworks(loadedArtworks);
      } catch (err) {
        console.error('Error in loadStudentArtworks:', err);
        setError('Error loading student portfolio. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadStudentArtworks();
  }, [studentId, isOffline]);

  // Filter artworks by type
  const filteredArtworks = activeTab === 'all' 
    ? artworks 
    : artworks.filter(artwork => artwork.type === activeTab);

  return (
    <div className="student-portfolio">
      {isOffline && (
        <div className="offline-notice">
          <span className="offline-icon">📵</span>
          You are currently offline. Showing locally saved artworks.
        </div>
      )}
      
      <Link to="/" className="back-button">← Back to Home</Link>
      
      <header className="portfolio-header">
        <h1>{studentInfo ? studentInfo.name : 'Student'}'s Portfolio</h1>
        {studentInfo && (
          <div className="student-info">ID: {studentInfo.id}</div>
        )}
      </header>
      
      {loading && artworks.length === 0 ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading student portfolio...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <h3>Error Loading Portfolio</h3>
          <p>{error}</p>
          <p>Please check the student ID and try again.</p>
          <Link to="/" className="button primary">
            Back to Home
          </Link>
        </div>
      ) : (
        <>
          {artworks.length === 0 ? (
            <div className="empty-portfolio">
              <h3>No Artworks Available</h3>
              <p>This student doesn't have any artworks uploaded yet.</p>
              <Link to="/" className="button primary">
                Back to Home
              </Link>
            </div>
          ) : (
            <>
              <div className="portfolio-tabs">
                <button 
                  className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All ({artworks.length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
                  onClick={() => setActiveTab('image')}
                >
                  Images ({artworks.filter(a => a.type === 'image').length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'video' ? 'active' : ''}`}
                  onClick={() => setActiveTab('video')}
                >
                  Videos ({artworks.filter(a => a.type === 'video').length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'audio' ? 'active' : ''}`}
                  onClick={() => setActiveTab('audio')}
                >
                  Audio ({artworks.filter(a => a.type === 'audio').length})
                </button>
              </div>
              
              <div className="portfolio-grid">
                {filteredArtworks.map(artwork => (
                  <div className="portfolio-item" key={artwork.id}>
                    <div className="artwork-container">
                      {artwork.type === 'image' && (
                        <img 
                          src={artwork.image_url} 
                          alt={artwork.title}
                          className="artwork-media"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30,30 L70,70 M30,70 L70,30' stroke='%23cccccc' stroke-width='8'/%3E%3C/svg%3E";
                          }}
                        />
                      )}
                      {artwork.type === 'video' && (
                        <video 
                          src={artwork.image_url}
                          className="artwork-media"
                          controls
                          onError={(e) => {
                            e.target.onerror = null;
                            // Replace with error element
                            const parent = e.target.parentNode;
                            const errorEl = document.createElement('div');
                            errorEl.className = 'media-error';
                            errorEl.innerHTML = "Video unavailable";
                            parent.replaceChild(errorEl, e.target);
                          }}
                        />
                      )}
                      {artwork.type === 'audio' && (
                        <div className="audio-container">
                          <div className="audio-icon">🎵</div>
                          <audio 
                            src={artwork.image_url}
                            className="artwork-media"
                            controls
                            onError={(e) => {
                              e.target.onerror = null;
                              // Replace with error element
                              e.target.parentNode.innerHTML = "<div class='media-error'>Audio unavailable</div>";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="artwork-info">
                      <h3>{artwork.title}</h3>
                      {artwork.description && (
                        <p className="artwork-description">{artwork.description}</p>
                      )}
                      <div className="artwork-meta">
                        <span className="artwork-type">{artwork.type}</span>
                        {artwork.created_at && (
                          <span className="artwork-date">
                            {new Date(artwork.created_at).toLocaleDateString()}
                          </span>
                        )}
                        {artwork.dataSource === 'local' && (
                          <span className="artwork-source">Saved locally</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default StudentPortfolio;