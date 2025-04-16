// src/components/NavigationBar.jsx
import React from "react";
import { useState } from 'react';
import './NavigationBar.css';

function NavigationBar({ onNavigate }) {
    const [isLoggedIn, setIsLoggedIn] = useState(true); // For demonstration purposes
    
    const handleLogout = () => {
        // Add actual logout logic here
        setIsLoggedIn(false);
        alert("Logged out successfully!");
        // You would typically redirect to login page here
    };
    
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h1 onClick={() => onNavigate('home')}>Marketplace</h1>
            </div>
            <div className="navbar-links">
                <button 
                    className="nav-link" 
                    onClick={() => onNavigate('home')}
                >
                    Home
                </button>
                <button 
                    className="nav-link" 
                    onClick={() => onNavigate('add')}
                >
                    Add Item
                </button>
                {isLoggedIn ? (
                    <button 
                        className="nav-link logout" 
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                ) : (
                    <button 
                        className="nav-link" 
                        onClick={() => onNavigate('login')}
                    >
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
}

export default NavigationBar;