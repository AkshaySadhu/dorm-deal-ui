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


    useEffect(() => {

        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            setCurrentPage('login');
        }
        setIsLoading(false);
    }, []);
  
    useEffect(() => {
        if (user) {
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
            handleRefresh(); 
            setEditingItem(null); 
        }
    };

    const handleStartChat = (item) => {
 
        const existingChat = chats.find(chat => chat.item.id === item.id);
        
        if (existingChat) {
            setCurrentPage('chats');
            return existingChat.id;
        } else {
            const newChat = {
                id: Date.now().toString(), 
                item: item,
                messages: [{
                    sender: 'system',
                    text: `You are now connected with the seller of "${item.title}".`,
                    timestamp: new Date()
                }]
            };
            

            setChats(prevChats => [...prevChats, newChat]);
            
            setUnreadChats(prev => prev + 1);
            
            setCurrentPage('chats');
            
            return newChat.id;
        }
    };
    
    const handleChatMessage = (chatId, message) => {
        setChats(prevChats => 
            prevChats.map(chat => 
                chat.id === chatId 
                    ? { ...chat, messages: [...chat.messages, message] }
                    : chat
            )
        );
    };
    
    const handleCloseChat = (chatId) => {
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    };
    
    const handleLogin = (userData) => {
        setUser(userData);
        
        setCurrentPage('home');
        
        if (userData.rememberMe) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
    };

    const handleLogout = () => {
        setUser(null);
        
        localStorage.removeItem('user');
        
        setCurrentPage('login');
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>;
        }
        
        if (!user) {
            return <LoginPage onLogin={handleLogin} />;
        }
        
        switch (currentPage) {
            case 'login':
             
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