// src/components/ItemForm.jsx
import { useState, useEffect } from 'react';
import React from "react";

function ItemForm({ onRefresh, editingItem, onCancelEdit }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (editingItem) {
            setTitle(editingItem.title);
            setDescription(editingItem.description);
            setPrice(editingItem.price);
            setCategory(editingItem.category);
            setImage(null);
            
            // If editing an item with an existing image, create preview
            if (editingItem.image) {
                setPreviewUrl(`data:image/jpeg;base64,${editingItem.image}`);
            } else {
                setPreviewUrl('');
            }
        } else {
            setTitle('');
            setDescription('');
            setPrice('');
            setCategory('');
            setImage(null);
            setPreviewUrl('');
        }
    }, [editingItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear any existing messages
        setShowSuccess(false);
        setShowError(false);
        
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
        } else if (editingItem && editingItem.image && !previewUrl) {
            // If editing and image was removed
            itemData.image = null;
        } else if (editingItem && editingItem.image) {
            // Keep the existing image if not changed
            itemData.image = editingItem.image;
        }

        if (editingItem) {
            // Update existing item using PUT /items/:id
            // Update existing item using PUT /items/:id
fetch(`http://localhost:3000/items/${editingItem.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
})
    .then(res => {
        if (!res.ok) {
            throw new Error(`Server responded with status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        console.log("Item updated: ", data);
        
        // Show success message
        setSuccessMessage("Item updated successfully!");
        setShowSuccess(true);
        
        // Call onRefresh to update the list in the background
        onRefresh();
        
        // Delay the redirect to allow the user to see the success message
        setTimeout(() => {
            // Hide the message and redirect
            setShowSuccess(false);
            onCancelEdit();
        }, 2000); // 2 seconds delay before redirect
    })
    .catch(err => {
        console.error("Error updating item: ", err);
        // Show error message
        setErrorMessage(`Failed to update item: ${err.message}`);
        setShowError(true);
        
        // Hide error message after 5 seconds
        setTimeout(() => {
            setShowError(false);
        }, 5000);
    });

            
        } else {
            // Create new item using POST /items
            fetch("http://localhost:3000/items", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Server responded with status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    console.log("Item created: ", data);
                    
                    // Show success message
                    setSuccessMessage("Item added successfully!");
                    setShowSuccess(true);
                    
                    // Hide success message after 3 seconds
                    setTimeout(() => {
                        setShowSuccess(false);
                    }, 3000);
                    
                    onRefresh();
                    
                    // Clear the form
                    setTitle('');
                    setDescription('');
                    setPrice('');
                    setCategory('');
                    setImage(null);
                    setPreviewUrl('');
                })
                .catch(err => {
                    console.error("Error creating item: ", err);
                    
                    // Show error message
                    setErrorMessage(`Failed to add item: ${err.message}`);
                    setShowError(true);
                    
                    // Hide error message after 5 seconds
                    setTimeout(() => {
                        setShowError(false);
                    }, 5000);
                });
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setImage(selectedFile);
            
            // Create preview URL for the selected image
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreviewUrl('');
    };

    // Helper function to convert a File to a base64 string.
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Extract just the base64 data (without the data URI prefix)
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="item-form">
            <h2>{editingItem ? "Update Item" : "Add New Item"}</h2>
            
            {/* Success Alert */}
            {showSuccess && (
                <div className="alert success-alert">
                    <span className="alert-icon">✓</span>
                    {successMessage}
                </div>
            )}
            
            {/* Error Alert */}
            {showError && (
                <div className="alert error-alert">
                    <span className="alert-icon">⚠</span>
                    {errorMessage}
                </div>
            )}
            
            <div>
                <label htmlFor="title">Title:</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder="Enter item title"
                />
            </div>
            <div>
                <label htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    placeholder="Enter item description"
                ></textarea>
            </div>
            <div>
                <label htmlFor="price">Price ($):</label>
                <input
                    id="price"
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                />
            </div>
            <div>
                <label htmlFor="category">Category:</label>
                <input
                    id="category"
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    required
                    placeholder="Enter item category"
                />
            </div>
            <div>
                <label htmlFor="image">Image:</label>
                <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                {previewUrl && (
                    <div className="image-preview">
                        <img 
                            src={previewUrl} 
                            alt="Preview" 
                            style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }} 
                        />
                        <button 
                            type="button" 
                            onClick={handleRemoveImage}
                            className="remove-image-btn"
                        >
                            Remove Image
                        </button>
                    </div>
                )}
            </div>
            <div className="form-buttons">
                <button type="submit">
                    {editingItem ? "Update Item" : "Add Item"}
                </button>
                {editingItem && (
                    <button 
                        type="button" 
                        onClick={onCancelEdit}
                        className="cancel-btn"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

export default ItemForm;