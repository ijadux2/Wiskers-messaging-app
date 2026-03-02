import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, IconButton } from './ui';
import { formatTime } from '../utils/helpers';

export function ChatView() {
  const { activeChat, messages, sendMessage, toggleRightPanel, showToast, currentUser, setSelectedBlog, openModal } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast('Image upload coming soon!', 'info');
    }
  };

  const emojis = ['😺', '😸', '😹', '😻', '👍', '❤️', '🎉', '🔥', '✨', '💜', '😂', '🥰', '😢', '🤔', '😴', '🥳'];

  return (
    <div className="chat-view">
      <div className="chat-header">
        <div className="chat-header-info">
          <Avatar src={activeChat.avatar} alt={activeChat.name} online={activeChat.online} />
          <div className="chat-user-info">
            <span className="chat-name">
              {activeChat.type === 'group' && <i className="fas fa-users" />}
              {activeChat.name}
            </span>
            <span className="chat-status">
              {activeChat.type === 'group' 
                ? `${activeChat.members?.length || 0} members`
                : (activeChat.online ? 'Online' : 'Offline')
              }
            </span>
          </div>
        </div>
        <div className="chat-actions">
          {activeChat.type === 'group' && (
            <IconButton title="Group Info">
              <i className="fas fa-info-circle" />
            </IconButton>
          )}
          <IconButton onClick={toggleRightPanel} title="Chat Info">
            <i className="fas fa-ellipsis-v" />
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
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                showAvatar={idx === 0 || chatMessages[idx - 1]?.senderId !== msg.senderId}
                isGroup={activeChat.type === 'group'}
              />
            ))
          )}
          {isTyping && (
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="message-input-area">
        <IconButton onClick={() => setShowEmoji(!showEmoji)} title="Emoji">
          <i className="fas fa-smile" />
        </IconButton>
        
        {showEmoji && (
          <div className="emoji-picker">
            {emojis.map(emoji => (
              <button key={emoji} onClick={() => insertEmoji(emoji)}>{emoji}</button>
            ))}
          </div>
        )}
        
        <label className="icon-btn" title="Attach File">
          <i className="fas fa-paperclip" />
          <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
        </label>
        
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

function MessageBubble({ message, showAvatar, isGroup }: { message: any; showAvatar: boolean; isGroup?: boolean }) {
  const { reactToMessage } = useApp();
  const [showActions, setShowActions] = useState(false);

  const reactionEmojis = ['👍', '❤️', '😂', '😢', '😮', '🎉'];

  return (
    <div 
      className={`message ${message.sent ? 'sent' : 'received'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showAvatar && !message.sent && isGroup && (
        <Avatar src={message.senderAvatar || `https://api.dicebear.com/7.x/catppuccin/svg?seed=${message.senderId}`} size="sm" />
      )}
      <div className="message-bubble">
        {isGroup && !message.sent && showAvatar && (
          <span className="sender-name">{message.senderName}</span>
        )}
        <span className="text">{message.text}</span>
        <div className="message-meta">
          <span className="time">{formatTime(message.timestamp)}</span>
          {message.sent && (
            <span className="status">
              <i className={`fas fa-${message.status === 'read' ? 'check-double' : message.status === 'delivered' ? 'check' : 'clock'}`} 
                className={message.status === 'read' ? 'read' : ''}
              />
            </span>
          )}
        </div>
        
        {showActions && (
          <div className="message-actions">
            {reactionEmojis.map(emoji => (
              <button key={emoji} onClick={() => reactToMessage(message.id, emoji)}>{emoji}</button>
            ))}
            <button><i className="fas fa-reply" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
