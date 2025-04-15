// src/components/ItemForm.jsx
import { useState, useEffect } from 'react';
import React from "react";

function ItemForm({ onRefresh, editingItem, onCancelEdit }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (editingItem) {
            setTitle(editingItem.title);
            setDescription(editingItem.description);
            setPrice(editingItem.price);
            setCategory(editingItem.category);
            setImage(null);
        } else {
            setTitle('');
            setDescription('');
            setPrice('');
            setCategory('');
            setImage(null);
        }
    }, [editingItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Build item data; parse price as float.
        const itemData = {
            title,
            description,
            price: parseFloat(price),
            category
        };

        // If an image file is selected, convert it to a base64 string.
        if (image) {
            const base64Image = await convertToBase64(image);
            itemData.image = base64Image;
        }

        if (editingItem) {
            // Update existing item using PUT /items/:id
            fetch(`http://localhost:3000/items/${editingItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Item updated: ", data);
                    onRefresh();
                    onCancelEdit();
                })
                .catch(err => console.error("Error updating item: ", err));
        } else {
            // Create new item using POST /items
            fetch("http://localhost:3000/items", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Item created: ", data);
                    onRefresh();
                })
                .catch(err => console.error("Error creating item: ", err));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    // Helper function to convert a File to a base64 string.
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]); // remove the data URI prefix
            reader.onerror = error => reject(error);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="item-form">
            <h2>{editingItem ? "Update Item" : "Add New Item"}</h2>
            <div>
                <label>Title:</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Description:</label>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                ></textarea>
            </div>
            <div>
                <label>Price:</label>
                <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                    step="0.01"
                />
            </div>
            <div>
                <label>Category:</label>
                <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Image:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
            <div className="form-buttons">
                <button type="submit">{editingItem ? "Update Item" : "Add Item"}</button>
                {editingItem && <button type="button" onClick={onCancelEdit}>Cancel</button>}
            </div>
        </form>
    );
}

export default ItemForm;
