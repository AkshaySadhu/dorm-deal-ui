// src/components/NavigationBar.jsx
import React, { useState } from 'react';
import './NavigationBar.css';

function NavigationBar({ onNavigate, unreadChats = 0, onLogout, username }) {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h1 onClick={() => onNavigate('home')}>DormDeal</h1>
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
                <button 
                    className="nav-link chat-nav-link" 
                    onClick={() => onNavigate('chats')}
                >
                    Chats
                    {unreadChats > 0 && <span className="chat-badge">{unreadChats}</span>}
                </button>
                <div className="user-menu">
                    <span className="username">{username}</span>
                    <button 
                        className="nav-link logout" 
                        onClick={onLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default NavigationBar;