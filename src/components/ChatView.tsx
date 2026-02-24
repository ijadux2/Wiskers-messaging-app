import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, IconButton } from './ui';
import { formatTime } from '../utils/helpers';

export function ChatView() {
  const { activeChat, messages, sendMessage, toggleRightPanel, showToast } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMessages = activeChat ? messages[activeChat.id] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!activeChat) {
    return (
      <div className="welcome-screen">
        <div className="welcome-animation">
          <i className="fas fa-cat" />
        </div>
        <h2>Welcome to Whisker</h2>
        <p>Select a conversation or start a new one</p>
      </div>
    );
  }

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmoji(false);
  };

  const emojis = ['😺', '😸', '😹', '😻', '👍', '❤️', '🎉', '🔥', '✨', '💜', '😂', '🥰'];

  return (
    <div className="chat-view">
      <div className="chat-header">
        <div className="chat-header-info">
          <Avatar src={activeChat.avatar} alt={activeChat.name} online={activeChat.online} />
          <div className="chat-user-info">
            <span className="chat-name">{activeChat.name}</span>
            <span className="chat-status">{activeChat.online ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div className="chat-actions">
          <IconButton onClick={toggleRightPanel}>
            <i className="fas fa-info-circle" />
          </IconButton>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {chatMessages.length === 0 ? (
            <div className="empty-messages">
              <i className="fas fa-comments" />
              <p>No messages yet. Say hi! 👋</p>
            </div>
          ) : (
            chatMessages.map((msg, idx) => (
              <MessageBubble key={msg.id} message={msg} showAvatar={idx === 0 || chatMessages[idx - 1]?.senderId !== msg.senderId} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="message-input-area">
        <IconButton onClick={() => setShowEmoji(!showEmoji)}>
          <i className="fas fa-smile" />
        </IconButton>
        
        {showEmoji && (
          <div className="emoji-picker">
            {emojis.map(emoji => (
              <button key={emoji} onClick={() => insertEmoji(emoji)}>{emoji}</button>
            ))}
          </div>
        )}
        
        <IconButton onClick={() => showToast('File upload coming soon!', 'info')}>
          <i className="fas fa-paperclip" />
        </IconButton>
        
        <input 
          type="text" 
          className="message-input" 
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        
        <button className="send-btn" onClick={handleSend} disabled={!inputValue.trim()}>
          <i className="fas fa-paper-plane" />
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ message, showAvatar }: { message: any; showAvatar: boolean }) {
  return (
    <div className={`message ${message.sent ? 'sent' : 'received'}`}>
      {showAvatar && !message.sent && (
        <Avatar src={`https://api.dicebear.com/7.x/catppuccin/svg?seed=${message.senderId}`} size="sm" />
      )}
      <div className="message-bubble">
        <span className="text">{message.text}</span>
        <span className="time">{formatTime(message.timestamp)}</span>
        {message.sent && (
          <span className="status">
            <i className={`fas fa-check${message.status === 'read' ? '-double' : ''}`} />
          </span>
        )}
      </div>
    </div>
  );
}
