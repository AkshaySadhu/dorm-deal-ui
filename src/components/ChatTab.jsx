// src/components/ChatTab.jsx
import React, { useState, useEffect } from 'react';
import './ChatTab.css'; // You'll need to create this CSS file

function ChatTab({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  // Fetch messages when component mounts
  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/chat/messages', {
      });

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !receiver.trim()) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const credentials = btoa(`${user.username}:${user.password}`);
      const response = await fetch('http://localhost:3000/chat/send', {
        method: 'POST',
        body: JSON.stringify({
          username: user.username,
          receiver: receiver,
          message: newMessage
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      // Clear the input
      setNewMessage('');
      // Refresh messages
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const replyToMessage = async (messageIndex, replyText) => {
    if (!replyText.trim()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const credentials = btoa(`${user.username}:${user.password}`);
      const response = await fetch('http://localhost:3000/chat/reply', {
        method: 'POST',
        body: JSON.stringify({
          messageIndex: messageIndex,
          reply: replyText
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send reply');
      }
      
      // Clear the input
      setNewMessage('');
      
      // Refresh messages
      fetchMessages();
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-tab">
      <h2>Your Messages</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="chat-container">
        <div className="chat-sidebar">
          <h3>Conversations</h3>
          {loading && <div className="loading-spinner"></div>}
          
          {/* Group messages by sender */}
          {messages.length > 0 ? (
            <ul className="chat-list">
              {Array.from(new Set(messages.map(msg => msg.senderName))).map(sender => (
                <li 
                  key={sender} 
                  className={`chat-item ${activeChat === sender ? 'active' : ''}`}
                  onClick={() => setActiveChat(sender)}
                >
                  <div className="chat-item-content">
                    <span className="chat-item-name">{sender}</span>
                    <span className="chat-item-preview">
                      {messages.filter(msg => msg.senderName === sender)[0].message.substring(0, 20)}...
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-messages">
              {loading ? 'Loading messages...' : 'No messages yet'}
            </div>
          )}
          
          <div className="new-chat-form">
            <h4>Send New Message</h4>
            <input
              type="text"
              placeholder="Recipient username"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="recipient-input"
            />
          </div>
        </div>
        
        <div className="chat-content">
          {activeChat ? (
            <>
              <div className="chat-header">
                <h3>Chat with {activeChat}</h3>
              </div>
              
              <div className="messages-container">
                {messages
                  .filter(msg => msg.senderName === activeChat)
                  .map((msg, index) => (
                    <div key={index} className="message">
                      <div className="message-header">
                        <span className="message-sender">{msg.senderName}</span>
                        <span className="message-time">
                          {new Date(msg.timestamp || Date.now()).toLocaleString()}
                        </span>
                      </div>
                      <div className="message-body">{msg.message}</div>
                    </div>
                  ))}
              </div>
              
              <div className="message-input-container">
                <textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="message-input"
                />
                <button 
                  onClick={() => replyToMessage(
                    messages.findIndex(msg => msg.senderName === activeChat),
                    newMessage
                  )}
                  disabled={loading || !newMessage.trim()}
                  className="send-button"
                >
                  {loading ? 'Sending...' : 'Reply'}
                </button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Select a conversation from the sidebar or start a new one</p>
            </div>
          )}
          
          {!activeChat && (
            <div className="new-message-container">
              <textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="message-input"
              />
              <button 
                onClick={sendMessage}
                disabled={loading || !newMessage.trim() || !receiver.trim()}
                className="send-button"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <button 
        onClick={fetchMessages} 
        disabled={loading}
        className="refresh-button"
      >
        {loading ? 'Refreshing...' : 'Refresh Messages'}
      </button>
    </div>
  );
}

export default ChatTab;