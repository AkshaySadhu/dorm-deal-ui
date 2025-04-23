
import React, { useState, useEffect, useRef } from 'react';
import './ChatWindow.css';

function ChatWindow({ seller, item, onClose }) {
    const [messages, setMessages] = useState([
        {
            sender: 'system',
            text: `You are now connected with the seller of "${item.title}".`,
            timestamp: new Date()
        }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;


        const userMessage = {
            sender: 'user',
            text: newMessage,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');

        setTimeout(() => {
            const sellerResponse = {
                sender: 'seller',
                text: `Thanks for your interest in ${item.title}. How can I help you?`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, sellerResponse]);
        }, 1000);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-window-overlay">
            <div className="chat-window">
                <div className="chat-header">
                    <div className="chat-title">
                        <h3>Chat with Seller</h3>
                        <p>About: {item.title}</p>
                    </div>
                    <button className="close-chat-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`message ${msg.sender === 'user' ? 'user-message' : msg.sender === 'seller' ? 'seller-message' : 'system-message'}`}
                        >
                            {msg.sender === 'system' ? (
                                <div className="system-message-content">{msg.text}</div>
                            ) : (
                                <>
                                    <div className="message-content">{msg.text}</div>
                                    <div className="message-time">{formatTime(msg.timestamp)}</div>
                                </>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="chat-input"
                    />
                    <button type="submit" className="send-message-btn">Send</button>
                </form>
            </div>
        </div>
    );
}

export default ChatWindow;