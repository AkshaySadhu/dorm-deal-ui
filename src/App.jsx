// src/App.jsx
import React from "react";
import { useState, useEffect } from 'react';
import NavigationBar from './components/NavigationBar';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';
import './App.css';

function App() {
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');

    useEffect(() => {
        // Fetch items from your API
        fetch("http://localhost:3000/items")
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(err => console.error("Error fetching items: ", err));
    }, [refresh]);

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

    // Render the appropriate content based on the current page
    const renderContent = () => {
        switch (currentPage) {
            case 'home':
                return (
                    <ItemList
                        items={items}
                        onEdit={handleEdit}
                        onRefresh={handleRefresh}
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
                    />
                );
            case 'login':
                // You would implement a login component here
                return <div className="login-placeholder">Login Form (not implemented)</div>;
            default:
                return <ItemList items={items} onEdit={handleEdit} onRefresh={handleRefresh} />;
        }
    };

    return (
        <div className="App">
            <NavigationBar onNavigate={handleNavigate} />
            <div className="content-container">
                {renderContent()}
            </div>
        </div>
    );
}

export default App;