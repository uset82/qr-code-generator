import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import App from './App';
import ArtworkView from './ArtworkView';
import TeacherPortal from './TeacherPortal';
import StudentPortfolio from './StudentPortfolio';
import ShareArtwork from './ShareArtwork';
import Login from './Login';
import Unauthorized from './Unauthorized';
import { AuthProvider } from './lib/AuthContext';
import PrivateRoute from './lib/PrivateRoute';

function ArtworkViewWrapper() {
  // Extract parameters from URL
  const { studentId, artworkId } = useParams();
  return <ArtworkView studentId={studentId} artworkId={artworkId} />;
}

function StudentPortfolioWrapper() {
  // Extract student ID from URL
  const { studentId } = useParams();
  
  // Safely decode the student ID from URL to handle special characters
  let decodedStudentId;
  try {
    decodedStudentId = decodeURIComponent(studentId);
  } catch (err) {
    console.error("Error decoding student ID:", err);
    decodedStudentId = studentId; // Fallback to original value
  }
  
  return <StudentPortfolio studentId={decodedStudentId} />;
}

function ShareArtworkWrapper() {
  // Extract artwork ID from URL
  const { artworkId } = useParams();
  
  // Safely decode the artwork ID from URL to handle special characters
  let decodedArtworkId;
  try {
    decodedArtworkId = decodeURIComponent(artworkId);
  } catch (err) {
    console.error("Error decoding artwork ID:", err);
    decodedArtworkId = artworkId; // Fallback to original value
  }
  
  return <ShareArtwork artworkId={decodedArtworkId} />;
}

function AppRouter() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/teacher" element={<TeacherPortal />} />
          
          {/* Artwork viewing routes */}
          <Route path="/artwork/:studentId/:artworkId" element={<ArtworkViewWrapper />} />
          
          {/* Student portfolio route - accessible via QR code or direct link */}
          <Route path="/student/:studentId" element={<StudentPortfolioWrapper />} />
          
          {/* Share artwork route - for sharing individual artworks */}
          <Route path="/share/:artworkId" element={<ShareArtworkWrapper />} />
          
          {/* Protected routes */}
          {/* No protected routes needed for now */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default AppRouter;