import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, IconButton } from './ui';

export function Sidebar() {
  const { 
    currentUser, 
    chats, 
    contacts,
    activeTab, 
    setActiveTab, 
    setActiveChat, 
    openModal, 
    sidebarOpen,
    toggleSidebar,
    searchQuery,
    setSearchQuery
  } = useApp();
  
  const filteredChats = chats.filter(chat => {
    if (activeTab === 'chats') return chat.type === 'direct';
    if (activeTab === 'groups') return chat.type === 'group';
    return false;
  }).filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    contact.status !== 'blocked'
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <i className="fas fa-address-book" />
            <span>Contacts</span>
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
          {activeTab === 'blogs' ? (
            <div className="blogs-tab-hint">
              <i className="fas fa-book-open" />
              <p>View blogs in the main area</p>
            </div>
          ) : activeTab === 'contacts' ? (
            filteredContacts.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-user-plus" />
                <p>No contacts yet</p>
                <button className="btn btn-primary btn-sm" onClick={() => openModal('addContact')}>
                  Add Contact
                </button>
              </div>
            ) : (
              filteredContacts.map(contact => (
                <ContactItem 
                  key={contact.id} 
                  contact={contact} 
                  onClick={() => createChatFromContact(contact)}
                />
              ))
            )
          ) : filteredChats.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox" />
              <p>No {activeTab} yet</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <ChatContactItem key={chat.id} chat={chat} onClick={() => {
                setActiveChat(chat);
                toggleSidebar();
              }} />
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <IconButton onClick={() => openModal(activeTab === 'groups' ? 'createGroup' : 'newChat')}>
            <i className="fas fa-plus-circle" />
          </IconButton>
          <IconButton onClick={() => openModal('settings')}>
            <i className="fas fa-cog" />
          </IconButton>
        </div>
      </aside>
    </>
  );

  function createChatFromContact(contact: any) {
    const existingChat = chats.find(c => c.key === contact.connectionKey);
    if (existingChat) {
      setActiveChat(existingChat);
    } else {
      const newChat = {
        id: generateTempId(),
        name: contact.name,
        avatar: contact.avatar,
        type: 'direct' as const,
        key: contact.connectionKey,
        online: Math.random() > 0.5,
        createdAt: new Date().toISOString(),
        unread: 0,
      };
    }
    toggleSidebar();
  }
}

function generateTempId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function ChatContactItem({ chat, onClick }: { chat: any; onClick: () => void }) {
  const { messages, activeChat } = useApp();
  const chatMessages = messages[chat.id] || [];
  const lastMessage = chatMessages[chatMessages.length - 1];
  const isActive = activeChat?.id === chat.id;

  return (
    <div className={`contact-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <Avatar src={chat.avatar} alt={chat.name} online={chat.online} size="sm" />
      <div className="contact-info">
        <span className="contact-name">
          {chat.type === 'group' && <i className="fas fa-users-group" />}
          {chat.name}
        </span>
        <span className="contact-preview">
          {lastMessage ? (lastMessage.text.length > 30 ? lastMessage.text.slice(0, 30) + '...' : lastMessage.text) : (chat.type === 'group' ? 'Group chat' : 'No messages yet')}
        </span>
      </div>
      <div className="contact-meta">
        <span className="contact-time">
          {lastMessage ? formatTimeAgo(lastMessage.timestamp) : ''}
        </span>
        {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
      </div>
    </div>
  );
}

function ContactItem({ contact, onClick }: { contact: any; onClick: () => void }) {
  return (
    <div className="contact-item" onClick={onClick}>
      <Avatar src={contact.avatar} alt={contact.name} online={Math.random() > 0.5} size="sm" />
      <div className="contact-info">
        <span className="contact-name">{contact.name}</span>
        <span className="contact-preview">
          {contact.status === 'pending' ? 'Pending request' : 'Friend'}
        </span>
      </div>
      <div className="contact-meta">
        <span className="contact-status">
          <i className={`fas fa-${contact.status === 'friend' ? 'check-circle' : 'clock'}`} />
        </span>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
