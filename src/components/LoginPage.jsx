// src/components/LoginPage.jsx
import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setError('');
    
    // Validate inputs
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    
    if (!password) {
      setError('Please enter your password');
      return;
    }
    
    // Show loading state
    setLoading(true);
    
    try {
      // Determine if we're doing login or registration
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      if (isRegister) {
        // If registration was successful, switch to login mode
        setIsRegister(false);
        setError('');
        setPassword('');
        setLoading(false);
        // Show success message
        setError('Account created successfully! Please log in.');
        return;
      }
      
      // For login, pass the user data to the parent component
      const userData = {
        username: data.user?.username || username,
        rememberMe,
        // Add any other user properties returned from your API
      };
      
      onLogin(userData);
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    // Clear form and errors when switching modes
    setError('');
    setIsRegister(!isRegister);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegister ? 'Create Account' : 'Log In'}</h2>
        <p className="login-subtitle">
          {isRegister 
            ? 'Sign up to create a new account' 
            : 'Log in to access your account'}
        </p>
        
        {error && <div className={`login-message ${error.includes('successfully') ? 'success' : 'error'}`}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          
          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              Remember me
            </label>
          </div>
          
          <button
            type="submit"
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading 
              ? (isRegister ? 'Creating Account...' : 'Logging In...') 
              : (isRegister ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            {isRegister 
              ? 'Already have an account? ' 
              : "Don't have an account? "}
            <button 
              type="button" 
              className="toggle-btn"
              onClick={toggleMode}
              disabled={loading}
            >
              {isRegister ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;