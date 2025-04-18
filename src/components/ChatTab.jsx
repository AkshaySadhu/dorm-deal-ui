// src/components/ChatTab.jsx
import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import './ChatTab.css';

function ChatTab({ chats, onCloseChat }) {
    const [activeChat, setActiveChat] = useState(null);
    
    const handleChatSelect = (chatId) => {
        const selected = chats.find(chat => chat.id === chatId);
        setActiveChat(selected);
    };
    
    const handleCloseActiveChat = () => {
        setActiveChat(null);
    };
    
    // Get the last message from each chat for preview
    const getLastMessage = (messages) => {
        if (!messages || messages.length === 0) return "No messages yet";
        const lastMsg = messages[messages.length - 1];
        return lastMsg.sender === 'user' ? 
            `You: ${lastMsg.text}` : 
            `Seller: ${lastMsg.text}`;
    };
    
    // Format timestamp for chat list
    const formatTime = (date) => {
        if (!date) return '';
        
        const now = new Date();
        const messageDate = new Date(date);
        
        // If today, show time
        if (messageDate.toDateString() === now.toDateString()) {
            return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        // If within last 7 days, show day name
        const daysAgo = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
        if (daysAgo < 7) {
            return messageDate.toLocaleDateString([], { weekday: 'short' });
        }
        
        // Otherwise show date
        return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };
    
    return (
        <div className="chat-tab">
            <h2>Your Conversations</h2>
            
            {chats.length === 0 ? (
                <div className="no-chats">
                    <div className="no-chats-icon">💬</div>
                    <p>You don't have any conversations yet.</p>
                    <p className="no-chats-subtitle">Connect with sellers to start chatting!</p>
                </div>
            ) : (
                <div className="chat-list">
                    {chats.map(chat => {
                        const lastMessage = chat.messages[chat.messages.length - 1];
                        const lastMessageTime = lastMessage ? lastMessage.timestamp : null;
                        
                        return (
                            <div 
                                key={chat.id}
                                className={`chat-item ${activeChat && activeChat.id === chat.id ? 'active' : ''}`}
                                onClick={() => handleChatSelect(chat.id)}
                            >
                                <div className="chat-item-avatar">
                                    {chat.item.title.charAt(0).toUpperCase()}
                                </div>
                                <div className="chat-item-content">
                                    <div className="chat-item-header">
                                        <span className="chat-item-title">{chat.item.title}</span>
                                        <span className="chat-item-time">{formatTime(lastMessageTime)}</span>
                                    </div>
                                    <div className="chat-item-message">
                                        {getLastMessage(chat.messages)}
                                    </div>
                                </div>
                                <button 
                                    className="chat-item-close" 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent triggering the parent onClick
                                        onCloseChat(chat.id);
                                    }}
                                    title="Close conversation"
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {activeChat && (
                <ChatWindow 
                    seller="Item Owner"
                    item={activeChat.item}
                    messages={activeChat.messages}
                    chatId={activeChat.id}
                    onClose={handleCloseActiveChat}
                    isEmbedded={true}
                />
            )}
        </div>
    );
}

export default ChatTab;