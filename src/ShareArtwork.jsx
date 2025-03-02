import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from './supabaseClient';
import { withRetry } from './lib/utils';
import './ShareArtwork.css';

const ShareArtwork = ({ artworkId }) => {
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [qrSize, setQrSize] = useState(200);
  const [copied, setCopied] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const qrRef = useRef(null);
  const navigate = useNavigate();

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

  // Fetch artwork data
  useEffect(() => {
    const fetchArtworkData = async () => {
      setLoading(true);
      setError(null);

      try {
        // First check if we have the artwork in localStorage
        const cachedArtworks = JSON.parse(localStorage.getItem('cached_artworks') || '{}');
        let foundArtwork = null;
        
        // Search for the artwork in our cached data
        Object.values(cachedArtworks).forEach(studentArtworks => {
          const found = studentArtworks.find(art => art.id === artworkId);
          if (found) foundArtwork = found;
        });

        // If we found it cached and we're offline, use that
        if (foundArtwork && isOffline) {
          setArtwork(foundArtwork);
          
          // Set up the share URL for the artwork's student portfolio
          const baseUrl = window.location.origin;
          setShareUrl(`${baseUrl}/artwork/${encodeURIComponent(foundArtwork.student_id)}/${encodeURIComponent(artworkId)}`);
          
          return;
        }

        // If we're online, fetch from the database
        if (navigator.onLine) {
          const { data, error } = await withRetry(() => 
            supabase
              .from('artworks')
              .select('*, students(name)')
              .eq('id', artworkId)
              .single()
          );

          if (error) throw error;
          
          if (data) {
            // Format the artwork data
            const formattedArtwork = {
              ...data,
              student_name: data.students.name,
              student_id: data.student_id
            };
            
            setArtwork(formattedArtwork);
            
            // Set up the share URL for the artwork
            const baseUrl = window.location.origin;
            setShareUrl(`${baseUrl}/artwork/${encodeURIComponent(formattedArtwork.student_id)}/${encodeURIComponent(artworkId)}`);
            
            // Update cache with this artwork
            if (!cachedArtworks[formattedArtwork.student_id]) {
              cachedArtworks[formattedArtwork.student_id] = [];
            }
            
            // Check if we already have this artwork in cache, update it if we do
            const existingIndex = cachedArtworks[formattedArtwork.student_id]
              .findIndex(art => art.id === formattedArtwork.id);
              
            if (existingIndex >= 0) {
              cachedArtworks[formattedArtwork.student_id][existingIndex] = formattedArtwork;
            } else {
              cachedArtworks[formattedArtwork.student_id].push(formattedArtwork);
            }
            
            localStorage.setItem('cached_artworks', JSON.stringify(cachedArtworks));
          } else {
            setError('Artwork not found');
          }
        } else if (!foundArtwork) {
          // We're offline and didn't find the artwork in cache
          setError('You are offline and this artwork is not available in your local cache');
        }
      } catch (err) {
        console.error('Error fetching artwork:', err);
        setError('Failed to load artwork. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (artworkId) {
      fetchArtworkData();
    } else {
      setError('No artwork ID provided');
      setLoading(false);
    }
  }, [artworkId, isOffline]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        setError('Failed to copy to clipboard');
      });
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;
    
    try {
      const canvas = qrRef.current.querySelector('canvas');
      if (!canvas) {
        setError('QR code not ready yet. Please try again.');
        return;
      }
      
      const dataURL = canvas.toDataURL('image/png');
      const fileName = artwork ? 
        `${artwork.title.replace(/\s+/g, '-').toLowerCase()}-qr.png` : 
        'artwork-qr.png';
      
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading QR code', err);
      setError('Failed to download QR code');
    }
  };

  const changeQRSize = (amount) => {
    const newSize = qrSize + amount;
    if (newSize >= 100 && newSize <= 400) {
      setQrSize(newSize);
    }
  };

  const renderMedia = () => {
    if (!artwork) return null;
    
    if (artwork.file_url && artwork.file_type) {
      const fileType = artwork.file_type.toLowerCase();
      
      if (fileType.includes('image')) {
        return (
          <img 
            src={artwork.file_url} 
            alt={artwork.title}
            className="artwork-media"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML += '<div class="media-error">Image could not be loaded</div>';
            }}
          />
        );
      } else if (fileType.includes('video')) {
        return (
          <video 
            src={artwork.file_url}
            controls
            className="artwork-media"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML += '<div class="media-error">Video could not be loaded</div>';
            }}
          />
        );
      } else if (fileType.includes('audio')) {
        return (
          <div className="audio-container">
            <div className="audio-icon">♪</div>
            <audio 
              src={artwork.file_url}
              controls
              className="artwork-media"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML += '<div class="media-error">Audio could not be loaded</div>';
              }}
            />
          </div>
        );
      }
    }
    
    return <div className="media-error">No media available</div>;
  };

  if (loading) {
    return (
      <div className="share-artwork">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading artwork details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="share-artwork">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="download-button" 
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="share-artwork">
        <div className="error-container">
          <h2>Artwork Not Found</h2>
          <p>The artwork you're looking for doesn't exist or has been removed.</p>
          <button 
            className="download-button" 
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="share-artwork">
      <div className="share-content">
        <h1>Share Artwork</h1>
        
        <div className="artwork-share-container">
          <div className="artwork-preview">
            <h2>{artwork.title}</h2>
            <p className="artwork-student">By {artwork.student_name}</p>
            
            <div className="artwork-media-container">
              {renderMedia()}
            </div>
            
            {artwork.description && (
              <div className="artwork-description">
                <p>{artwork.description}</p>
              </div>
            )}
            
            <Link 
              to={`/student/${encodeURIComponent(artwork.student_id)}`}
              className="download-button" 
              style={{ marginTop: '1rem', textAlign: 'center' }}
            >
              View Student Portfolio
            </Link>
          </div>
          
          <div className="sharing-options">
            <h3>Sharing Options</h3>
            
            <div className="share-qr">
              <h4>QR Code</h4>
              <div className="qr-code" ref={qrRef}>
                <QRCodeCanvas 
                  value={shareUrl}
                  size={qrSize}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="qr-actions">
                <div className="size-controls">
                  <label>Size:</label>
                  <button 
                    onClick={() => changeQRSize(-20)}
                    disabled={qrSize <= 100}
                  >
                    -
                  </button>
                  <span>{qrSize}px</span>
                  <button 
                    onClick={() => changeQRSize(20)}
                    disabled={qrSize >= 400}
                  >
                    +
                  </button>
                </div>
                
                <button 
                  className="download-button" 
                  onClick={downloadQRCode}
                >
                  Download QR Code
                </button>
              </div>
            </div>
            
            <div className="share-link">
              <h4>Share Link</h4>
              <div className="link-container">
                <input 
                  type="text" 
                  value={shareUrl} 
                  readOnly 
                />
                <button 
                  className="copy-button"
                  onClick={copyToClipboard}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            
            <div className="share-instructions">
              <h4>How to Share</h4>
              <ol>
                <li>Download the QR code or copy the link</li>
                <li>Share it via email, text, or social media</li>
                <li>The recipient can scan the QR code or click the link to view this artwork</li>
                <li>They can also explore the student's entire portfolio from the artwork view</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareArtwork; 