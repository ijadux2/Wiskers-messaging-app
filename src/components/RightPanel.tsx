import React from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, Button } from './ui';

export function RightPanel() {
  const { activeChat, rightPanelOpen, clearChat, deleteChat, openModal, currentUser } = useApp();

  if (!rightPanelOpen || !activeChat) return null;

  return (
    <aside className="right-panel">
      <div className="panel-content">
        <div className="contact-info-panel">
          <div className="info-header">
            <Avatar src={activeChat.avatar} alt={activeChat.name} size="xl" />
            <h3>{activeChat.name}</h3>
            <span className={`status ${activeChat.online ? 'online' : 'offline'}`}>
              {activeChat.online ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="info-details">
            <div className="detail-item">
              <i className="fas fa-key" />
              <span>Key</span>
              <code>{activeChat.key}</code>
            </div>
            <div className="detail-item">
              <i className="fas fa-calendar-alt" />
              <span>Created</span>
              <span>{new Date(activeChat.createdAt).toLocaleDateString()}</span>
            </div>
            {activeChat.type === 'group' && activeChat.description && (
              <div className="detail-item">
                <i className="fas fa-align-left" />
                <span>Description</span>
                <span>{activeChat.description}</span>
              </div>
            )}
          </div>

          <div className="info-actions">
            <Button variant="secondary" fullWidth onClick={() => openModal('clearChat')}>
              <i className="fas fa-trash" /> Clear Chat
            </Button>
            <Button variant="danger" fullWidth onClick={() => deleteChat(activeChat.id)}>
              <i className="fas fa-user-slash" /> {activeChat.type === 'group' ? 'Leave Group' : 'Block'}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
