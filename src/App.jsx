// src/App.jsx
import React from "react";
import { useState, useEffect } from 'react';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';
import './App.css';

function App() {
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    // Used to trigger refreshes of the item list.
    const [refresh, setRefresh] = useState(false);

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
    }

    const handleCancelEdit = () => {
        setEditingItem(null);
    }

    return (
        <div className="App">
            <h1>Marketplace</h1>
            <ItemForm
                onRefresh={handleRefresh}
                editingItem={editingItem}
                onCancelEdit={handleCancelEdit}
            />
            <ItemList
                items={items}
                onEdit={handleEdit}
                onRefresh={handleRefresh}
            />
        </div>
    );
}

export default App;
