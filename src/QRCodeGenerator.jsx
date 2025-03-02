import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { fetchAllArtworks, fetchArtworksByStudentId, withRetry } from './supabaseClient';
import StudentList, { students } from './StudentList.jsx';
import { useAuth } from './lib/AuthContext';
import config from './config';
import { supabase } from './lib/supabaseClient';

// Fallback student artwork data for offline mode
const generateFallbackData = (students) => {
  const fallbackData = {};
  students.forEach(student => {
    fallbackData[student.id] = {
      name: student.name,
      id: student.id,
      portfolioUrl: `/student/${student.id}`
    };
  });
  return fallbackData;
};

function QRCodeGenerator() {
  const { user } = useAuth();
  const [qrUrl, setQrUrl] = useState('');
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState({});
  const [studentArtworks, setStudentArtworks] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [qrSize, setQrSize] = useState(256);
  const [qrMode, setQrMode] = useState('portfolio'); // 'portfolio' or 'artwork'
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showDirectLink, setShowDirectLink] = useState(false);

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

  // Fetch student data when component mounts
  useEffect(() => {
    async function loadStudentData() {
      if (isOffline) {
        // Use fallback data when offline
        const fallbackData = generateFallbackData(students || []);
        setStudentData(fallbackData);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Get the student list from StudentList
        const studentsFromList = students || [];
        const studentInfo = {};
        
        // Get artwork counts for each student
        await Promise.all(
          studentsFromList.map(async (student) => {
            try {
              // Try to fetch student's artworks to get counts
              const artworks = await withRetry(() => fetchArtworksByStudentId(student.id), 2, 1000);
              
              studentInfo[student.id] = {
                name: student.name,
                id: student.id,
                artworkCount: artworks?.length || 0,
                portfolioUrl: `/student/${student.id}`,
                hasArtwork: artworks?.length > 0
              };
            } catch (err) {
              console.warn(`Failed to fetch artworks for ${student.name}:`, err);
              // Still add student even if artwork fetch fails
              studentInfo[student.id] = {
                name: student.name,
                id: student.id,
                artworkCount: 0,
                portfolioUrl: `/student/${student.id}`,
                hasArtwork: false,
                fetchError: true
              };
            }
          })
        );
        
        setStudentData(studentInfo);
      } catch (err) {
        console.error('Failed to load student data:', err);
        setError(`Failed to load student data: ${err.message || 'Unknown error'}. Using fallback data.`);
        
        // Use fallback data on error
        const fallbackData = generateFallbackData(students || []);
        setStudentData(fallbackData);
      } finally {
        setLoading(false);
      }
    }
    
    loadStudentData();
  }, [isOffline]);

  // Fetch student artworks when a student is selected
  useEffect(() => {
    if (!selectedStudent) {
      setStudentArtworks([]);
      return;
    }
    
    async function fetchArtworks() {
      if (isOffline) {
        // Check for cached artworks in localStorage
        try {
          const cachedArtworks = JSON.parse(localStorage.getItem(`artworks_${selectedStudent.id}`)) || [];
          setStudentArtworks(cachedArtworks);
        } catch (err) {
          console.error('Error retrieving cached artworks:', err);
          setStudentArtworks([]);
        }
        return;
      }
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .eq('student_id', selectedStudent.folder_name)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data to include proper URLs and types
        const transformedData = data.map(artwork => ({
          ...artwork,
          file_type: artwork.type || 'image',
          file_url: artwork.image_url
        }));

        setStudentArtworks(transformedData);
        
        // Cache artworks in localStorage for offline use
        localStorage.setItem(`artworks_${selectedStudent.id}`, JSON.stringify(transformedData));
      } catch (err) {
        console.error('Error fetching student artworks:', err);
        setError('Failed to fetch student artworks. Please try again later.');
        
        // Try to use cached artworks if available
        try {
          const cachedArtworks = JSON.parse(localStorage.getItem(`artworks_${selectedStudent.id}`)) || [];
          setStudentArtworks(cachedArtworks);
        } catch (cacheErr) {
          console.error('Error retrieving cached artworks:', cacheErr);
          setStudentArtworks([]);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchArtworks();
  }, [selectedStudent, isOffline]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSelectedArtwork(null);
    setError(null);
    
    // Reset QR code
    setQrUrl('');
    setQrData(null);
    setShowDirectLink(false);
  };

  const handleSelectArtwork = (artwork) => {
    setSelectedArtwork(artwork);
    setError(null);
    
    // Reset QR code
    setQrUrl('');
    setQrData(null);
    setShowDirectLink(false);
  };

  const generateQRCode = async () => {
    if (!selectedStudent) {
      setError('Please select a student first');
      return;
    }
    
    if (qrMode === 'artwork' && !selectedArtwork) {
      setError('Please select an artwork first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let url;
      
      if (qrMode === 'portfolio') {
        // Generate QR code for student portfolio
        const studentId = encodeURIComponent(selectedStudent.id);
        url = `${config.BASE_URL}/student/${studentId}`;
        
        // Set QR data
        setQrUrl(url);
        setQrData({
          student: selectedStudent,
          url: url,
          timestamp: new Date().toISOString(),
          generatedBy: user?.email || 'anonymous',
          type: 'portfolio'
        });
      } else {
        // Generate QR code for specific artwork
        const artworkId = encodeURIComponent(selectedArtwork.id);
        url = `${config.BASE_URL}/share/${artworkId}`;
        
        // Set QR data
        setQrUrl(url);
        setQrData({
          student: selectedStudent,
          artwork: selectedArtwork,
          url: url,
          timestamp: new Date().toISOString(),
          generatedBy: user?.email || 'anonymous',
          type: 'artwork'
        });
      }
      
      // Show direct link option
      setShowDirectLink(true);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Error generating QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    
    try {
      const canvas = document.getElementById('qr-code-canvas');
      if (!canvas) {
        setError('Could not find QR code canvas for download');
        return;
      }
      
      // Create a temporary link to download the image
      const link = document.createElement('a');
      // Convert canvas to data URL
      link.href = canvas.toDataURL('image/png');
      
      // Set filename with appropriate info
      let filename = 'qr-mollebakken';
      
      if (qrMode === 'portfolio') {
        filename += `-${selectedStudent?.name.toLowerCase().replace(/\s+/g, '-') || 'student'}`;
      } else {
        filename += `-${selectedStudent?.name.toLowerCase().replace(/\s+/g, '-') || 'student'}-${selectedArtwork?.title.toLowerCase().replace(/\s+/g, '-') || 'artwork'}`;
      }
      
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading QR code:', err);
      setError('Failed to download QR code. Please try again.');
    }
  };

  const copyDirectLink = () => {
    if (!qrUrl) return;
    
    try {
      navigator.clipboard.writeText(qrUrl);
      alert('Direct link copied to clipboard!');
    } catch (err) {
      console.error('Error copying link:', err);
      setError('Failed to copy link. Please try manually selecting and copying the URL.');
    }
  };

  const renderArtworkThumbnail = (artwork) => {
    const isImage = artwork.type === 'image';
    const isVideo = artwork.type === 'video';
    const isAudio = artwork.type === 'audio';
    const isSelected = selectedArtwork && selectedArtwork.id === artwork.id;
    
    return (
      <div 
        key={artwork.id} 
        className={`artwork-thumbnail ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSelectArtwork(artwork)}
      >
        <div className="thumbnail-media">
          {isImage && (
            <img 
              src={artwork.image_url} 
              alt={artwork.title}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<div class="media-error">!</div>';
              }}
            />
          )}
          {isVideo && <div className="media-icon">▶</div>}
          {isAudio && <div className="media-icon">♪</div>}
        </div>
        <div className="thumbnail-title">{artwork.title}</div>
      </div>
    );
  };

  return (
    <div className="qr-generator">
      {isOffline && (
        <div className="offline-notice">
          <span className="offline-icon">📵</span>
          You are currently offline. Limited functionality is available.
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="generator-content">
        <div className="selection-panel">
          <h2>Generate QR Codes</h2>
          
          <div className="qr-mode-toggle">
            <button 
              className={qrMode === 'portfolio' ? 'active' : ''}
              onClick={() => setQrMode('portfolio')}
            >
              Student Portfolio
            </button>
            <button 
              className={qrMode === 'artwork' ? 'active' : ''}
              onClick={() => setQrMode('artwork')}
              disabled={!selectedStudent || studentArtworks.length === 0}
            >
              Individual Artwork
            </button>
          </div>
          
          <p className="instructions">
            {qrMode === 'portfolio' 
              ? 'Select a student to generate a QR code that links to their complete portfolio. This QR code can be shared with parents to access their child\'s artwork.'
              : 'Select a specific artwork to generate a QR code that links directly to it. This allows sharing individual pieces with a dedicated view.'}
          </p>
          
          <StudentList onSelectStudent={handleSelectStudent} />
          
          {selectedStudent && qrMode === 'artwork' && (
            <div className="artwork-selection">
              <h3>Select an Artwork</h3>
              {loading ? (
                <div className="loading-spinner"></div>
              ) : studentArtworks.length > 0 ? (
                <div className="artwork-thumbnails">
                  {studentArtworks.map(renderArtworkThumbnail)}
                </div>
              ) : (
                <p className="no-artworks">No artworks available for this student</p>
              )}
            </div>
          )}
          
          {selectedStudent && (
            <div className="selected-student-info">
              <h3>Selected: {selectedStudent.name}</h3>
              {qrMode === 'portfolio' && studentData[selectedStudent.id]?.artworkCount > 0 && (
                <p>Artwork count: {studentData[selectedStudent.id].artworkCount}</p>
              )}
              {qrMode === 'artwork' && selectedArtwork && (
                <p>Artwork: {selectedArtwork.title}</p>
              )}
              {studentData[selectedStudent.id]?.fetchError && (
                <p className="data-note">Artwork status is unavailable offline</p>
              )}
              <button 
                onClick={generateQRCode} 
                disabled={loading || !selectedStudent || (qrMode === 'artwork' && !selectedArtwork)}
                className="generate-button"
              >
                {loading ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>
          )}
        </div>
        
        {qrUrl && (
          <div className="qr-display">
            <div className="qr-code">
              <QRCodeCanvas 
                id="qr-code-canvas"
                value={qrUrl} 
                size={qrSize}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: './favicon.ico',
                  excavate: true,
                  width: 24,
                  height: 24
                }}
              />
            </div>
            
            <div className="qr-info">
              {qrMode === 'portfolio' ? (
                <>
                  <h3>Portfolio QR Code for {selectedStudent.name}</h3>
                  <p>Scan this code to view the student's complete portfolio</p>
                </>
              ) : (
                <>
                  <h3>Artwork QR Code: {selectedArtwork.title}</h3>
                  <p>By {selectedStudent.name}</p>
                  <p>Scan this code to view and share this specific artwork</p>
                </>
              )}
              
              <div className="qr-actions">
                <button 
                  onClick={handleDownloadQR} 
                  className="download-button"
                >
                  Download QR Code
                </button>
                
                {showDirectLink && (
                  <div className="direct-link-section">
                    <h4>Option 2: Direct URL Link</h4>
                    <div className="direct-link-container">
                      <input 
                        type="text" 
                        value={qrUrl} 
                        readOnly 
                        className="direct-link-input"
                        onClick={(e) => e.target.select()}
                      />
                      <button 
                        onClick={copyDirectLink}
                        className="copy-link-button"
                      >
                        Copy Link
                      </button>
                    </div>
                    <p className="direct-link-info">
                      Share this direct link with parents to access {qrMode === 'portfolio' ? 
                        `${selectedStudent.name}'s complete portfolio` : 
                        `this specific artwork by ${selectedStudent.name}`}
                    </p>
                  </div>
                )}
                
                <div className="portfolio-link">
                  <Link 
                    to={qrData && qrData.url ? qrData.url : '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-link"
                  >
                    Preview Link
                  </Link>
                </div>
                
                <div className="size-controls">
                  <label>QR Size:</label>
                  <button 
                    onClick={() => setQrSize(Math.max(128, qrSize - 32))}
                    disabled={qrSize <= 128}
                  >-</button>
                  <span>{qrSize}px</span>
                  <button 
                    onClick={() => setQrSize(Math.min(400, qrSize + 32))}
                    disabled={qrSize >= 400}
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QRCodeGenerator;
