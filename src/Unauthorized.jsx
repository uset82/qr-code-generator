import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './lib/AuthContext';
import './TraeTheme.css';

function Unauthorized() {
  const { user, signOut } = useAuth();

  return (
    <div className="container">
      <div className="auth-card">
        <div className="logo">
          <span className="logo-icon">🔒</span>
          Access Denied
        </div>
        
        <h2>Unauthorized Access</h2>
        
        <div className="message error">
          You don't have permission to access this page.
        </div>
        
        <p>
          This page is restricted to teacher accounts with an @mollebakken.no email domain.
        </p>
        
        <div className="button-group">
          <Link to="/" className="button primary">
            Go to Home
          </Link>
          
          {user && (
            <button onClick={signOut} className="button secondary">
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Unauthorized; 