import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import API_BASE_URL from '../config';

// Connect to the backend
const socket = io(API_BASE_URL); 

export default function Chat({ currentUser }) {
  const [targetEmail, setTargetEmail] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');

  // Listen for incoming messages
  useEffect(() => {
    socket.on('receive_message', (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    return () => socket.off('receive_message');
  }, []);

  // Initiate chat via email
  const startChat = async () => {
    const response = await axios.post(`${API_BASE_URL}/api/chat/start`, {
      targetEmail,
      currentUserId: currentUser.id
    });
    
    const { conversationId } = response.data;
    setActiveChatId(conversationId);
    
    // Join the WebSocket room for this specific chat
    socket.emit('join_chat', conversationId);
  };

  const sendMessage = () => {
    if (currentMessage !== '') {
      const messageData = {
        conversationId: activeChatId,
        senderId: currentUser.id,
        text: currentMessage,
      };
      
      // Send to server
      socket.emit('send_message', messageData);
      
      // Update local UI immediately
      setMessages((prev) => [...prev, messageData]);
      setCurrentMessage('');
    }
  };

  return (
    <div className="chat-container">
      {/* Email Search Bar */}
      <div className="chat-start">
        <input 
          type="email" 
          placeholder="Enter user's email to chat..." 
          value={targetEmail}
          onChange={(e) => setTargetEmail(e.target.value)}
        />
        <button onClick={startChat}>Start Chat</button>
      </div>

      {/* Chat Window */}
      {activeChatId && (
        <div className="chat-window">
          <div className="messages-list">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.senderId === currentUser.id ? 'sent' : 'received'}>
                {msg.text}
              </div>
            ))}
          </div>
          
          <div className="message-input">
            <input 
              type="text" 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}