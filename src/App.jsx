// src/App.jsx
import React from "react";
import { useState, useEffect } from 'react';
import NavigationBar from './components/NavigationBar';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';
import './App.css';
import ChatTab from './components/ChatTab';
import LoginPage from './components/LoginPage';

function App() {
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');
    const [chats, setChats] = useState([]);
    const [unreadChats, setUnreadChats] = useState(0);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Remove the temporary bypass login code
    // const SKIP_LOGIN_TEMPORARILY = true;

    // Remove the temporary auto-login effect
    // useEffect(() => {
    //   // Auto-login with test user code removed
    // }, []);

    // Initial user check from localStorage
    useEffect(() => {
        // Check if user is saved in localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            // If no saved user, redirect to login page
            setCurrentPage('login');
        }
        setIsLoading(false);
    }, []);
  
    // Fetch items when user is authenticated or refresh is triggered
    useEffect(() => {
        if (user) {
            // Fetch items from your API
            fetch("http://localhost:3000/items")
                .then(res => res.json())
                .then(data => {
                    console.log("Items received from server:", data);
                    setItems(data);
                })
                .catch(err => console.error("Error fetching items: ", err));
        }
    }, [refresh, user]);

    const handleRefresh = () => {
        setRefresh(prev => !prev);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setCurrentPage('add');
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    const handleNavigate = (page) => {
        setCurrentPage(page);
        if (page === 'home') {
            handleRefresh(); // Refresh the items when navigating to home
            setEditingItem(null); // Clear any editing state
        }
    };

    const handleStartChat = (item) => {
        // Check if chat with this item already exists
        const existingChat = chats.find(chat => chat.item.id === item.id);
        
        if (existingChat) {
            // If chat exists, navigate to chat tab and highlight this chat
            setCurrentPage('chats');
            return existingChat.id;
        } else {
            // Create a new chat
            const newChat = {
                id: Date.now().toString(), // Simple way to generate unique ID
                item: item,
                messages: [{
                    sender: 'system',
                    text: `You are now connected with the seller of "${item.title}".`,
                    timestamp: new Date()
                }]
            };
            
            // Add new chat to chats array
            setChats(prevChats => [...prevChats, newChat]);
            
            // Increment unread count
            setUnreadChats(prev => prev + 1);
            
            // Navigate to chat tab
            setCurrentPage('chats');
            
            return newChat.id;
        }
    };
    
    // Add this function to handle chat messages
    const handleChatMessage = (chatId, message) => {
        setChats(prevChats => 
            prevChats.map(chat => 
                chat.id === chatId 
                    ? { ...chat, messages: [...chat.messages, message] }
                    : chat
            )
        );
    };
    
    // Add this function to close a chat
    const handleCloseChat = (chatId) => {
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    };
    
    const handleLogin = (userData) => {
        setUser(userData);
        
        // Navigate to home page after login
        setCurrentPage('home');
        
        // If you want to remember the user between page reloads (when "remember me" is checked)
        if (userData.rememberMe) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
    };

    const handleLogout = () => {
        // Clear user data from state
        setUser(null);
        
        // Clear user data from storage
        localStorage.removeItem('user');
        
        // Navigate to login page
        setCurrentPage('login');
    };

    const renderContent = () => {
        // Show loading indicator while checking auth status
        if (isLoading) {
            return <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>;
        }
        
        // If user is not logged in, show login page regardless of current page
        if (!user) {
            return <LoginPage onLogin={handleLogin} />;
        }
        
        // User is logged in, show content based on current page
        switch (currentPage) {
            case 'login':
                // If somehow on login page but already logged in, redirect to home
                return <ItemList
                    items={items}
                    onEdit={handleEdit}
                    onRefresh={handleRefresh}
                    onStartChat={handleStartChat}
                    user={user}
                />;
            case 'home':
                return (
                    <ItemList
                        items={items}
                        onEdit={handleEdit}
                        onRefresh={handleRefresh}
                        onStartChat={handleStartChat}
                        user={user}
                    />
                );
            case 'add':
                return (
                    <ItemForm
                        onRefresh={handleRefresh}
                        editingItem={editingItem}
                        onCancelEdit={() => {
                            handleCancelEdit();
                            setCurrentPage('home');
                        }}
                        user={user}
                    />
                );
            case 'chats':
                // Reset unread count when navigating to chats
                // setUnreadChats(0);
                return (
                    <ChatTab 
                        chats={chats}
                        onCloseChat={handleCloseChat}
                        onChatMessage={handleChatMessage}
                        user={user}
                    />
                );
            default:
                return <ItemList 
                    items={items} 
                    onEdit={handleEdit} 
                    onRefresh={handleRefresh} 
                    onStartChat={handleStartChat}
                    user={user}
                />;
        }
    };

    return (
        <div className="App">
            {user && (
                <NavigationBar 
                    onNavigate={handleNavigate} 
                    unreadChats={unreadChats}
                    onLogout={handleLogout}
                    username={user.username}
                />
            )}
            <div className="content-container">
                {renderContent()}
            </div>
        </div>
    );
}

export default App;