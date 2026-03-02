import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, Button } from './ui';

export function ContactsView() {
  const { 
    contacts, 
    openModal, 
    removeContact, 
    blockContact, 
    unblockContact,
    setActiveChat, 
    chats, 
    currentUser, 
    setActiveTab, 
    showToast,
    createChat,
    clearChat,
    deleteChat
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);

  const handleChat = (contact: any) => {
    const existingChat = chats.find(c => c.key === contact.connectionKey);
    if (existingChat) {
      setActiveChat(existingChat);
      setActiveTab('chats');
    } else {
      const newChat = {
        id: `chat_${contact.id}_${Date.now()}`,
        name: contact.name,
        avatar: contact.avatar,
        type: 'direct' as const,
        key: contact.connectionKey,
        online: Math.random() > 0.5,
        createdAt: new Date().toISOString(),
        unread: 0,
      };
      setActiveChat(newChat);
      setActiveTab('chats');
      showToast(`Chat with ${contact.name} created!`, 'success');
    }
  };

  const handleClearChat = (contact: any) => {
    const chat = chats.find(c => c.key === contact.connectionKey);
    if (chat) {
      if (confirm(`Clear all messages with ${contact.name}?`)) {
        clearChat(chat.id);
        showToast('Chat cleared!', 'success');
      }
    } else {
      showToast('No chat found with this contact', 'info');
    }
  };

  const handleBlock = (contactId: string) => {
    blockContact(contactId);
    showToast('Contact blocked', 'info');
    setSelectedContact(null);
  };

  const handleUnblock = (contactId: string) => {
    unblockContact(contactId);
    showToast('Contact unblocked', 'success');
  };

  const handleRemove = (contactId: string) => {
    if (confirm('Are you sure you want to remove this contact?')) {
      removeContact(contactId);
      showToast('Contact removed', 'success');
      setSelectedContact(null);
    }
  };

  const friends = contacts.filter(c => c.status === 'friend');
  const pending = contacts.filter(c => c.status === 'pending');
  const blocked = contacts.filter(c => c.status === 'blocked');

  const filteredFriends = friends.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.connectionKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlocked = blocked.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="contacts-view">
      <div className="contacts-header">
        <h2><i className="fas fa-address-book" /> Contacts</h2>
        <Button onClick={() => openModal('addContact')}>
          <i className="fas fa-user-plus" /> Add
        </Button>
      </div>

      <div className="contacts-search">
        <i className="fas fa-search" />
        <input 
          type="text" 
          placeholder="Search contacts..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="contacts-content">
        {selectedContact ? (
          <ContactDetail 
            contact={selectedContact} 
            onBack={() => setSelectedContact(null)}
            onChat={() => handleChat(selectedContact)}
            onBlock={() => handleBlock(selectedContact.id)}
            onUnblock={() => handleUnblock(selectedContact.id)}
            onRemove={() => handleRemove(selectedContact.id)}
            onClearChat={() => handleClearChat(selectedContact)}
            chats={chats}
            showToast={showToast}
          />
        ) : (
          <>
            <div className="contacts-stats">
              <div className="stat-item" onClick={() => setSearchTerm('')}>
                <i className="fas fa-user-friends" />
                <span className="stat-num">{friends.length}</span>
                <span className="stat-label">Friends</span>
              </div>
              <div className="stat-item" onClick={() => setSearchTerm('')}>
                <i className="fas fa-clock" />
                <span className="stat-num">{pending.length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-item" onClick={() => setSearchTerm('')}>
                <i className="fas fa-ban" />
                <span className="stat-num">{blocked.length}</span>
                <span className="stat-label">Blocked</span>
              </div>
            </div>

            {pending.length > 0 && (
              <div className="contacts-section">
                <h3><i className="fas fa-user-clock" /> Pending Requests ({pending.length})</h3>
                <div className="contacts-grid">
                  {pending.map(contact => (
                    <div key={contact.id} className="contact-card pending" onClick={() => setSelectedContact(contact)}>
                      <Avatar src={contact.avatar} alt={contact.name} size="lg" />
                      <div className="contact-card-info">
                        <span className="contact-card-name">{contact.name}</span>
                        <span className="contact-card-status">
                          <i className="fas fa-clock" /> Pending
                        </span>
                      </div>
                      <div className="contact-card-actions" onClick={e => e.stopPropagation()}>
                        <button className="btn-accept" title="Accept">
                          <i className="fas fa-check" />
                        </button>
                        <button className="btn-decline" title="Decline">
                          <i className="fas fa-times" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredFriends.length > 0 ? (
              <div className="contacts-section">
                <h3><i className="fas fa-user-friends" /> Friends ({filteredFriends.length})</h3>
                <div className="contacts-grid">
                  {filteredFriends.map(contact => (
                    <div key={contact.id} className="contact-card" onClick={() => setSelectedContact(contact)}>
                      <Avatar src={contact.avatar} alt={contact.name} online={Math.random() > 0.3} size="lg" />
                      <div className="contact-card-info">
                        <span className="contact-card-name">{contact.name}</span>
                        <span className="contact-card-key">{contact.connectionKey}</span>
                      </div>
                      <div className="contact-card-actions" onClick={e => e.stopPropagation()}>
                        <button className="action-btn primary" onClick={() => handleChat(contact)} title="Chat">
                          <i className="fas fa-comment" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : friends.length === 0 && (
              <div className="empty-state full-width">
                <i className="fas fa-user-friends" />
                <h3>{searchTerm ? 'No contacts found' : 'No contacts yet'}</h3>
                <p>{searchTerm ? 'Try a different search term' : 'Add friends using their connection key to start chatting!'}</p>
                {!searchTerm && (
                  <Button onClick={() => openModal('addContact')}>
                    <i className="fas fa-user-plus" /> Add Contact
                  </Button>
                )}
              </div>
            )}

            {filteredBlocked.length > 0 && (
              <div className="contacts-section">
                <h3><i className="fas fa-ban" /> Blocked ({filteredBlocked.length})</h3>
                <div className="contacts-grid">
                  {filteredBlocked.map(contact => (
                    <div key={contact.id} className="contact-card blocked" onClick={() => setSelectedContact(contact)}>
                      <Avatar src={contact.avatar} alt={contact.name} size="lg" />
                      <div className="contact-card-info">
                        <span className="contact-card-name">{contact.name}</span>
                        <span className="contact-card-status blocked">
                          <i className="fas fa-ban" /> Blocked
                        </span>
                      </div>
                      <div className="contact-card-actions" onClick={e => e.stopPropagation()}>
                        <button className="action-btn" onClick={() => handleUnblock(contact.id)} title="Unblock">
                          <i className="fas fa-unlock" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ContactDetail({ 
  contact, 
  onBack, 
  onChat, 
  onBlock, 
  onUnblock,
  onRemove, 
  onClearChat,
  chats,
  showToast
}: { 
  contact: any; 
  onBack: () => void;
  onChat: () => void;
  onBlock: () => void;
  onUnblock: () => void;
  onRemove: () => void;
  onClearChat: () => void;
  chats: any[];
  showToast: any;
}) {
  const isOnline = Math.random() > 0.3;
  const hasChat = chats.some(c => c.key === contact.connectionKey);
  const isBlocked = contact.status === 'blocked';
  
  const handleCopyKey = () => {
    navigator.clipboard.writeText(contact.connectionKey);
    showToast('Key copied!', 'success');
  };

  return (
    <div className="contact-detail">
      <div className="contact-detail-header">
        <button className="back-btn" onClick={onBack}>
          <i className="fas fa-arrow-left" />
        </button>
        <h3>Contact Info</h3>
      </div>

      <div className="contact-detail-profile">
        <Avatar src={contact.avatar} alt={contact.name} size="xl" online={isOnline && !isBlocked} />
        <h2>{contact.name}</h2>
        <span className={`status-badge ${isBlocked ? 'blocked' : isOnline ? 'online' : 'offline'}`}>
          <i className="fas fa-circle" /> {isBlocked ? 'Blocked' : isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="contact-detail-info">
        <div className="info-row" onClick={handleCopyKey}>
          <i className="fas fa-key" />
          <div className="info-content">
            <span className="info-label">Connection Key</span>
            <span className="info-value">{contact.connectionKey}</span>
          </div>
          <button className="copy-btn">
            <i className="fas fa-copy" />
          </button>
        </div>
        <div className="info-row">
          <i className="fas fa-calendar-plus" />
          <div className="info-content">
            <span className="info-label">Added</span>
            <span className="info-value">{new Date(contact.addedAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
        {contact.status && (
          <div className="info-row">
            <i className={`fas fa-${contact.status === 'friend' ? 'user-check' : contact.status === 'pending' ? 'clock' : 'ban'}`} />
            <div className="info-content">
              <span className="info-label">Status</span>
              <span className="info-value">{contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="contact-detail-actions">
        {!isBlocked && (
          <>
            <button className="action-card" onClick={onChat}>
              <div className="action-icon chat">
                <i className="fas fa-comment" />
              </div>
              <span>{hasChat ? 'Open Chat' : 'Send Message'}</span>
            </button>
            
            {hasChat && (
              <button className="action-card" onClick={onClearChat}>
                <div className="action-icon clear">
                  <i className="fas fa-trash-alt" />
                </div>
                <span>Clear Chat</span>
              </button>
            )}
          </>
        )}

        {isBlocked ? (
          <button className="action-card" onClick={onUnblock}>
            <div className="action-icon unblock">
              <i className="fas fa-unlock" />
            </div>
            <span>Unblock</span>
          </button>
        ) : (
          <button className="action-card" onClick={onBlock}>
            <div className="action-icon block">
              <i className="fas fa-ban" />
            </div>
            <span>Block</span>
          </button>
        )}

        <button className="action-card danger" onClick={onRemove}>
          <div className="action-icon remove">
            <i className="fas fa-user-minus" />
          </div>
          <span>Remove</span>
        </button>
      </div>
    </div>
  );
}
