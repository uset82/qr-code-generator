import React from 'react';
import QRCodeGenerator from './QRCodeGenerator';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './lib/AuthContext';
import './TraeTheme.css';

function App() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>QR Møllebakken Art Project</h1>
        <nav>
          <Link to="/teacher" className="teacher-portal-link">Teacher Portal</Link>
          {user ? (
            <button onClick={handleSignOut}>Sign Out</button>
          ) : (
            <Link to="/login">Sign In</Link>
          )}
        </nav>
      </header>
      <main className="main-container">
        <h2>QR Møllebakken Art Project</h2>
        <QRCodeGenerator />
      </main>
    </div>
  );
}

export default App;
