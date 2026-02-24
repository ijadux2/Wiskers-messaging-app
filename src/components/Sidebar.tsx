import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, Button, Input, IconButton } from './ui';

export function Sidebar() {
  const { 
    currentUser, 
    chats, 
    activeTab, 
    setActiveTab, 
    setActiveChat, 
    openModal, 
    sidebarOpen,
    toggleSidebar,
    searchQuery = ''
  } = useApp();
  
  const [search, setSearch] = useState('');

  const filteredChats = chats.filter(chat => {
    if (activeTab === 'chats') return chat.type === 'direct';
    if (activeTab === 'groups') return chat.type === 'group';
    return false;
  }).filter(chat => 
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={toggleSidebar} />
      <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="sidebar-header">
          {currentUser && (
            <div className="user-profile-card" onClick={() => openModal('profile')}>
              <Avatar src={currentUser.avatar} alt={currentUser.name} online />
              <div className="user-info">
                <span className="username">{currentUser.name}</span>
                <span className="status">Online</span>
              </div>
            </div>
          )}
        </div>

        <div className="search-container">
          <i className="fas fa-search" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <nav className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            <i className="fas fa-comments" />
            <span>Chats</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            <i className="fas fa-users" />
            <span>Groups</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'blogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            <i className="fas fa-book-open" />
            <span>Blogs</span>
          </button>
        </nav>

        <div className="contacts-list">
          {filteredChats.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox" />
              <p>No {activeTab} yet</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <ContactItem key={chat.id} chat={chat} onClick={() => {
                setActiveChat(chat);
                toggleSidebar();
              }} />
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <IconButton onClick={() => openModal('newChat')}>
            <i className="fas fa-plus-circle" />
          </IconButton>
          <IconButton onClick={() => openModal('settings')}>
            <i className="fas fa-cog" />
          </IconButton>
        </div>
      </aside>
    </>
  );
}

function ContactItem({ chat, onClick }: { chat: any; onClick: () => void }) {
  const { messages, activeChat } = useApp();
  const chatMessages = messages[chat.id] || [];
  const lastMessage = chatMessages[chatMessages.length - 1];
  const isActive = activeChat?.id === chat.id;

  return (
    <div className={`contact-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <Avatar src={chat.avatar} alt={chat.name} online={chat.online} size="sm" />
      <div className="contact-info">
        <span className="contact-name">{chat.name}</span>
        <span className="contact-preview">
          {lastMessage ? lastMessage.text : 'No messages yet'}
        </span>
      </div>
      <div className="contact-meta">
        <span className="contact-time">
          {lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </span>
        {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
      </div>
    </div>
  );
}
