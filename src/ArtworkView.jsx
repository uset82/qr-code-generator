import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchArtworkById, saveQRCodeVisit } from './supabaseClient';

// Fallback artwork data in case Supabase connection fails
const fallbackArtworkData = {
  "student1-artwork1": {
    title: "Sunset Painting",
    student: "Alice",
    studentId: "student1",
    imageUrl: "https://via.placeholder.com/300x200.png?text=Sunset+Painting",
  },
  "student2-artwork2": {
    title: "Ocean Waves",
    student: "Bob",
    studentId: "student2",
    imageUrl: "https://via.placeholder.com/300x200.png?text=Ocean+Waves",
  },
};

function ArtworkView({ studentId, artworkId }) {
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadArtwork() {
      if (!artworkId) {
        setError('No artwork ID provided');
        setLoading(false);
        return;
      }

      try {
        // Try to fetch from Supabase first
        const data = await fetchArtworkById(artworkId);
        
        if (data) {
          setArtwork(data);
          // Record the visit
          await saveQRCodeVisit(artworkId, {
            referrer: document.referrer,
            userAgent: navigator.userAgent
          });
        } else if (fallbackArtworkData[artworkId]) {
          // Use fallback data if available
          setArtwork(fallbackArtworkData[artworkId]);
        } else {
          setError('Artwork not found');
        }
      } catch (err) {
        console.error('Error loading artwork:', err);
        setError('Error loading artwork. Please try again.');
        
        // Try to use fallback data
        if (fallbackArtworkData[artworkId]) {
          setArtwork(fallbackArtworkData[artworkId]);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    }
    
    loadArtwork();
  }, [artworkId]);

  return (
    <div>
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🎨</span>
          QR Møllebakken
        </div>
      </header>
      <div className="container">
        <Link to="/" className="back-button">
          ← Back to Generator
        </Link>
        
        {loading ? (
          <div className="loading">Loading artwork...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : artwork ? (
          <div className="artwork-view">
            <img 
              src={artwork.imageUrl} 
              alt={artwork.title} 
              className="artwork-image"
            />
            <div className="artwork-details">
              <h2 className="artwork-title">{artwork.title}</h2>
              <p className="artwork-student">By {artwork.student}</p>
              <p>{artwork.description}</p>
            </div>
          </div>
        ) : (
          <div className="error">No artwork data available</div>
        )}
      </div>
    </div>
  );
}

export default ArtworkView;