// src/App.jsx
import React from "react";
import {useState, useEffect} from 'react';
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
    const [credentials, setCredentials] = useState(null);
    const [hasDialed, setHasDialed] = useState(false);

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

    useEffect(() => {
        if (currentPage === 'login' && !hasDialed) {
            setHasDialed(true);
            fetch(`http://localhost:3000/dial`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({multiaddr: '/dns4/c7f191ba67d7a6676a99deaeb57322af25b54a77.peerchecker.com/tcp/4003/wss/p2p/12D3KooWLad1CX6M7Y5pyqNb4bQGCLS1noBJNtK5K2dwecb7zW3w'})
            })
                .then(res => {
                    if (!res.ok) throw new Error(`dial failed ${res.status}`);
                    console.log('✅ Peer dialed successfully');
                })
                .catch(err => console.error('⚠️ Error dialing peer:', err));
        }
    }, [currentPage, hasDialed]);

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

    const handleStartChat = async (item) => {
        const sellerName = item.username || item.owner;

        if (!sellerName) {
          console.error("Can't start chat: Item has no seller username");
          return;
        }

        setCurrentPage('chats');

        try {
          const response = await fetch('http://localhost:3000/chat/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${credentials}`
            },
            body: JSON.stringify({
              receiver: sellerName,
              message: `Hi, I'm interested in your item: "${item.title}" for $${item.price}`
            })
          });

          if (!response.ok) {
            throw new Error('Failed to send initial message');
          }
        } catch (err) {
          console.error('Error starting chat:', err);
        }
      };
    
    // Add this function to handle chat messages
    const handleChatMessage = (chatId, message) => {
        setChats(prevChats =>
            prevChats.map(chat =>
                chat.id === chatId
                    ? {...chat, messages: [...chat.messages, message]}
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

        // Store credentials for API calls
        setCredentials(btoa(`${userData.username}:${userData.password}`));

        // Navigate to home page after login
        setCurrentPage('home');
        
        // Store in localStorage if "remember me" is checked
        if (userData.rememberMe) {
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('credentials', btoa(`${userData.username}:${userData.password}`));
        }
      };

      useEffect(() => {
        // Check if user is saved in localStorage
        const savedUser = localStorage.getItem('user');
        const savedCredentials = localStorage.getItem('credentials');

        if (savedUser && savedCredentials) {
          setUser(JSON.parse(savedUser));
          setCredentials(savedCredentials);
        } else {
          // If no saved user, redirect to login page
          setCurrentPage('login');
        }
        setIsLoading(false);
      }, []);

      const handleLogout = () => {
        // Clear user data
        setUser(null);
        setCredentials(null);

        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('credentials');

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
            return <LoginPage onLogin={handleLogin}/>;
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
                        credentials={credentials}
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