// src/components/ItemList.jsx
import React from "react";

function ItemList({ items, onEdit, onRefresh }) {
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

    return (
        <div className="item-list">
            <h2>Items</h2>
            {items.length === 0 ? <p>No items found.</p> :
                <ul>
                    {items.map(item => (
                        <li key={item.id} className="item">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            <p>Price: ${item.price}</p>
                            <p>Category: {item.category}</p>
                            {item.image &&
                                <img
                                    src={`data:image/jpeg;base64,${item.image}`}
                                    alt={item.title}
                                    style={{ width: "150px", height: "auto" }}
                                />
                            }
                            <div className="item-actions">
                                <button onClick={() => onEdit(item)}>Edit</button>
                                <button onClick={() => handleDelete(item.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            }
        </div>
    );
}

export default ItemList;
