// src/components/ItemList.jsx
import React, { useState, useEffect, useRef } from "react";

function ItemList({ items, onEdit, onRefresh }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortOption, setSortOption] = useState('default');
    const [hoveredItem, setHoveredItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const objectUrlsRef = useRef([]);
    
    // Cleanup function for blob URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            // Clean up any created object URLs when component unmounts
            objectUrlsRef.current.forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, []);

    // Extract unique categories from items
    const categories = ['all', ...new Set(items.map(item => item.category))];

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            fetch(`http://localhost:3000/items/${id}`, {
                method: 'DELETE'
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Item deleted: ", data);
                    onRefresh();
                })
                .catch(err => console.error("Error deleting item: ", err));
        }
    };

    // Filter items by selected category, search query, and price range
    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        
        const matchesSearch = !searchQuery || 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesMinPrice = priceRange.min === '' || item.price >= parseFloat(priceRange.min);
        const matchesMaxPrice = priceRange.max === '' || item.price <= parseFloat(priceRange.max);
        
        return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
    });

    // Sort items based on the selected option
    const sortedItems = [...filteredItems].sort((a, b) => {
        switch (sortOption) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });

    // Function to truncate description
    const truncateDescription = (text, maxLength = 100) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    };

    return (
        <div className="item-list-container">
            <div className="item-list-header">
                <h2>Marketplace Items</h2>
                
                <div className="item-list-search">
                    <div className="search-input-container">
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button 
                                className="clear-search-btn"
                                onClick={() => setSearchQuery('')}
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="item-list-filters">
                    <div className="filter-group">
                        <label htmlFor="category-filter">Category:</label>
                        <select 
                            id="category-filter"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="filter-select"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label htmlFor="sort-options">Sort by:</label>
                        <select 
                            id="sort-options"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="filter-select"
                        >
                            <option value="default">Default</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="title-asc">Title: A-Z</option>
                            <option value="title-desc">Title: Z-A</option>
                        </select>
                    </div>
                    
                    <div className="filter-group price-filter-group">
                        <button 
                            className={`price-filter-toggle ${showPriceFilter ? 'active' : ''}`}
                            onClick={() => setShowPriceFilter(!showPriceFilter)}
                        >
                            Price Range {showPriceFilter ? '▲' : '▼'}
                        </button>
                        
                        {showPriceFilter && (
                            <div className="price-filter-dropdown">
                                <div className="price-inputs">
                                    <div className="price-input-field">
                                        <label htmlFor="min-price">Min $:</label>
                                        <input
                                            id="min-price"
                                            type="number"
                                            placeholder="Min"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="price-input-field">
                                        <label htmlFor="max-price">Max $:</label>
                                        <input
                                            id="max-price"
                                            type="number"
                                            placeholder="Max"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="price-filter-actions">
                                    <button 
                                        onClick={() => {
                                            setPriceRange({ min: '', max: '' });
                                        }}
                                        className="clear-price-btn"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="item-count">
                {sortedItems.length === 0 ? (
                    <span>No items found</span>
                ) : (
                    <span>
                        Showing {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'items'}
                        {selectedCategory !== 'all' ? ` in "${selectedCategory}"` : ''}
                        {searchQuery ? ` matching "${searchQuery}"` : ''}
                        {priceRange.min && priceRange.max ? ` priced ${priceRange.min}-${priceRange.max}` : 
                         priceRange.min ? ` priced from ${priceRange.min}` : 
                         priceRange.max ? ` priced up to ${priceRange.max}` : ''}
                    </span>
                )}
            </div>
            
            {sortedItems.length === 0 ? (
                <div className="no-items">
                    <div className="no-items-icon">🔍</div>
                    <p>
                        {searchQuery || priceRange.min || priceRange.max
                            ? `No items found matching your filters`
                            : selectedCategory !== 'all'
                                ? `No items found in the "${selectedCategory}" category`
                                : 'No items found. Add some items to get started!'}
                    </p>
                    {(searchQuery || selectedCategory !== 'all' || priceRange.min || priceRange.max) && (
                        <button 
                            className="reset-filters-btn"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                                setPriceRange({ min: '', max: '' });
                            }}
                        >
                            Reset All Filters
                        </button>
                    )}
                </div>
            ) : (
                <ul className="items-grid">
                    {sortedItems.map(item => (
                        <li 
                            key={item.id} 
                            className="item-card"
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <div className="item-card-inner">
                                <div className="item-image-container">
                                    {item.image ? (
                                        <img
                                            className="item-image"
                                            src={(() => {
                                                if (typeof item.image === 'string') {
                                                    return `data:image/jpeg;base64,${item.image}`;
                                                } else {
                                                    // Create a blob URL for binary data
                                                    const bytes = Object.values(item.image).map(byte => byte);
                                                    const blob = new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' });
                                                    const url = URL.createObjectURL(blob);
                                                    // Store URL for cleanup
                                                    objectUrlsRef.current.push(url);
                                                    return url;
                                                }
                                            })()}
                                            alt={item.title}
                                        />
                                    ) : (
                                        <div className="item-image-placeholder">
                                            <span>No Image</span>
                                        </div>
                                    )}
                                    <div className="item-badge">{item.category}</div>
                                </div>
                                
                                <div className="item-details">
                                    <h3 className="item-title">{item.title}</h3>
                                    <div className="item-price-container">
                                        <span className="price-label">Price:</span>
                                        <span className="item-price">${item.price.toFixed(2)}</span>
                                    </div>
                                    <div className="item-description">
                                        {truncateDescription(item.description)}
                                    </div>
                                </div>
                                
                                <div className={`item-actions ${hoveredItem === item.id ? 'visible' : ''}`}>
                                    <button 
                                        className="view-details-btn"
                                        onClick={() => alert(`Viewing details for ${item.title}`)}
                                    >
                                        View Details
                                    </button>
                                    <div className="action-buttons">
                                        <button 
                                            className="edit-btn" 
                                            onClick={() => onEdit(item)}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            className="delete-btn" 
                                            onClick={() => handleDelete(item.id)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ItemList;