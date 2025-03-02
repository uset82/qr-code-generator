import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './lib/AuthContext';
import './TraeTheme.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!email || !password) {
      setMessage({ text: 'Please fill in all fields', type: 'error' });
      return;
    }

    try {
      let result;
      
      if (isSignUp) {
        result = await signUp(email, password);
        if (result.error) {
          throw new Error(result.error);
        }
        setMessage({ 
          text: 'Registration successful! You can now sign in.', 
          type: 'success' 
        });
        // Clear form after successful signup
        setEmail('');
        setPassword('');
        // Switch to sign in mode
        setIsSignUp(false);
      } else {
        result = await signIn(email, password);
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Check if user is teacher (based on email domain)
        if (email.endsWith('@mollebakken.no')) {
          navigate('/teacher');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
      setMessage({ text: error.message, type: 'error' });
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setMessage({ text: '', type: '' });
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo">
          <span className="logo-icon">🎨</span>
          QR Møllebakken
        </div>
        
        <h2>{isSignUp ? 'Create an Account' : 'Sign In'}</h2>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              required
              minLength={6}
            />
            <div className="password-requirements">
              Password must be at least 6 characters long
            </div>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        
        <p className="auth-toggle">
          {isSignUp ? 'Already have an account?' : 'Need an account?'}
          <button
            className="toggle-button"
            onClick={toggleAuthMode}
            disabled={loading}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login; 