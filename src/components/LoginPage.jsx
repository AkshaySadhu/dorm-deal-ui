// src/components/LoginPage.jsx
import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
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
        
        // In a real app, you would make an API call to your authentication endpoint
        // This is a mock implementation
        setTimeout(() => {
            setLoading(false);
            
            // Mock successful login (in a real app, this would be based on API response)
            // For demo purposes, any username/password combo works
            onLogin({ username, rememberMe });
        }, 1000);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Log In</h2>
                <p className="login-subtitle">Log in to access your account</p>
                
                {error && <div className="login-error">{error}</div>}
                
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
                    </div>
                    
                    <button
                        type="submit"
                        className={`login-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Logging In...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="login-footer">
                    <p>Don't have an account? Reach out to administrator.</p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;