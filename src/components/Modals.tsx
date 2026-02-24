import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, Button, Avatar, Input, TextArea } from './ui';
import { copyToClipboard } from '../utils/helpers';

export function ProfileModal() {
  const { activeModal, closeModal, currentUser, updateProfile, showToast, connectionKey } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    updateProfile(name, bio, avatar);
    showToast('Profile updated!', 'success');
  };

  const handleCopyKey = async () => {
    if (await copyToClipboard(connectionKey || '')) {
      showToast('Key copied!', 'success');
    }
  };

  return (
    <Modal isOpen={activeModal === 'profile'} onClose={closeModal}>
      <div className="profile-modal-content">
        <div className="profile-cover">
          <i className="fas fa-cat" />
        </div>
        <button className="close-btn" onClick={closeModal}>&times;</button>
        
        <div className="profile-body">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <Avatar src={avatar || currentUser?.avatar || ''} alt={name} size="xl" />
              <label className="avatar-upload-btn">
                <i className="fas fa-camera" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              </label>
            </div>
            <h2 className="profile-name">{currentUser?.name}</h2>
            <p className="profile-bio">{currentUser?.bio || 'No bio yet'}</p>
          </div>

          <div className="profile-form">
            <Input 
              label={<><i className="fas fa-user" /> Username</>}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <div className="form-group">
              <label><i className="fas fa-align-left" /> Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-key" /> Connection Key</label>
              <div className="key-display">
                <code>{connectionKey}</code>
                <Button onClick={handleCopyKey}><i className="fas fa-copy" /></Button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSave}><i className="fas fa-save" /> Save</Button>
        </div>
      </div>
    </Modal>
  );
}

export function NewChatModal() {
  const { activeModal, closeModal, createChat, openModal } = useApp();
  const [key, setKey] = useState('');

  const handleStart = () => {
    createChat(key.toUpperCase());
    setKey('');
  };

  return (
    <Modal isOpen={activeModal === 'newChat'} onClose={closeModal}>
      <div className="chat-modal-content">
        <div className="chat-header-icon">
          <i className="fas fa-comment-dots" />
        </div>
        <h2>New Conversation</h2>
        <button className="close-btn" onClick={closeModal}>&times;</button>
        
        <div className="modal-body">
          <div className="input-group">
            <label>Enter Connection Key</label>
            <div className="input-with-icon">
              <i className="fas fa-key" />
              <input 
                type="text" 
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                placeholder="WHISK-XXXX-XXXX"
              />
            </div>
          </div>
          
          <div className="divider-text"><span>or</span></div>
          
          <button 
            className="option-card"
            onClick={() => { closeModal(); openModal('createGroup'); }}
          >
            <div className="option-icon group">
              <i className="fas fa-users" />
            </div>
            <div className="option-text">
              <h3>Create Group</h3>
              <p>Start a group chat</p>
            </div>
            <i className="fas fa-chevron-right" />
          </button>
        </div>

        <div className="modal-footer">
          <Button fullWidth onClick={handleStart}>
            <i className="fas fa-paper-plane" /> Start Chat
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function CreateGroupModal() {
  const { activeModal, closeModal, createGroup, showToast } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');

  const handleCreate = () => {
    if (!name.trim()) {
      showToast('Group name is required', 'error');
      return;
    }
    createGroup(name, description, avatar);
    setName('');
    setDescription('');
    setAvatar('');
    showToast('Group created!', 'success');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal isOpen={activeModal === 'createGroup'} onClose={closeModal}>
      <div className="group-modal-content">
        <div className="group-header-bg">
          <i className="fas fa-users" />
        </div>
        <button className="close-btn" onClick={closeModal}>&times;</button>
        
        <div className="group-avatar-upload">
          <div className="avatar-circle">
            <Avatar 
              src={avatar || `https://api.dicebear.com/7.x/catppuccin/svg?seed=${name || 'group'}`} 
              alt="Group" 
              size="lg" 
            />
            <label className="avatar-edit-overlay">
              <i className="fas fa-camera" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </label>
          </div>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label><i className="fas fa-tag" /> Group Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          <div className="form-group">
            <label><i className="fas fa-align-left" /> Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
            />
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleCreate}>
            <i className="fas fa-plus-circle" /> Create Group
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function BlogModal() {
  const { activeModal, closeModal, createBlog, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }
    createBlog(title, content, coverImage, tags.split(',').map(t => t.trim()).filter(Boolean));
    setTitle('');
    setContent('');
    setTags('');
    setCoverImage('');
    showToast('Post published!', 'success');
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCoverImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal isOpen={activeModal === 'blog'} onClose={closeModal} size="lg">
      <div className="blog-modal-content">
        <div className="blog-header-modal">
          <div className="blog-header-content">
            <i className="fas fa-feather-alt" />
            <h2>Create Blog Post</h2>
          </div>
          <button className="close-btn" onClick={closeModal}>&times;</button>
        </div>

        <div className="modal-body">
          <div 
            className={`blog-cover-upload ${coverImage ? 'has-image' : ''}`}
            onClick={() => document.getElementById('blogCoverInput')?.click()}
          >
            {coverImage && <img src={coverImage} alt="Cover" />}
            <div className="blog-cover-placeholder">
              <i className="fas fa-image" />
              <span>Click to add cover image</span>
            </div>
            <input 
              id="blogCoverInput"
              type="file" 
              accept="image/*" 
              onChange={handleCoverChange}
              hidden 
            />
          </div>

          <div className="form-group">
            <label><i className="fas fa-heading" /> Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your amazing title..."
            />
          </div>
          <div className="form-group">
            <label><i className="fas fa-pen" /> Content</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={5}
            />
          </div>
          <div className="form-group">
            <label><i className="fas fa-tags" /> Tags</label>
            <input 
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="lifestyle, cats, fun"
            />
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={handlePublish}>
            <i className="fas fa-paper-plane" /> Publish
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function SettingsModal() {
  const { activeModal, closeModal, chats, blogs, messages, clearAllData, exportData, connectionKey } = useApp();

  const totalMessages = Object.values(messages).flat().length;

  return (
    <Modal isOpen={activeModal === 'settings'} onClose={closeModal} size="lg">
      <div className="settings-modal-content">
        <div className="settings-header">
          <div className="settings-header-content">
            <i className="fas fa-cog" />
            <h2>Settings</h2>
          </div>
          <button className="close-btn" onClick={closeModal}>&times;</button>
        </div>

        <div className="settings-body">
          <div className="settings-card">
            <div className="settings-card-header">
              <i className="fas fa-database" />
              <h3>Database</h3>
            </div>
            <div className="settings-card-body">
              <div className="db-stats-grid">
                <div className="db-stat-item">
                  <i className="fas fa-comments" />
                  <span className="db-num">{chats.length}</span>
                  <span className="db-label">Chats</span>
                </div>
                <div className="db-stat-item">
                  <i className="fas fa-book" />
                  <span className="db-num">{blogs.length}</span>
                  <span className="db-label">Blogs</span>
                </div>
                <div className="db-stat-item">
                  <i className="fas fa-envelope" />
                  <span className="db-num">{totalMessages}</span>
                  <span className="db-label">Messages</span>
                </div>
              </div>
              <Button fullWidth onClick={exportData}>
                <i className="fas fa-download" /> Export Data
              </Button>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-card-header">
              <i className="fas fa-link" />
              <h3>Connection</h3>
            </div>
            <div className="settings-card-body">
              <div className="api-key-section">
                <span>API Key</span>
                <div className="api-key-display">
                  <code>{connectionKey}</code>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-card danger-card">
            <div className="settings-card-header">
              <i className="fas fa-exclamation-triangle" />
              <h3>Danger Zone</h3>
            </div>
            <div className="settings-card-body">
              <Button variant="danger" fullWidth onClick={clearAllData}>
                <i className="fas fa-trash" /> Clear All Data
              </Button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button fullWidth onClick={closeModal}>
            <i className="fas fa-check" /> Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ClearChatModal() {
  const { activeModal, closeModal, clearChat, activeChat } = useApp();

  const handleClear = () => {
    if (activeChat) {
      clearChat(activeChat.id);
    }
  };

  return (
    <Modal isOpen={activeModal === 'clearChat'} onClose={closeModal}>
      <div className="modal-header">
        <h2>Clear Chat</h2>
        <button className="close-btn" onClick={closeModal}>&times;</button>
      </div>
      <div className="modal-body">
        <p>Are you sure you want to clear all messages in this chat? This action cannot be undone.</p>
      </div>
      <div className="modal-footer">
        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
        <Button variant="danger" onClick={handleClear}>Clear</Button>
      </div>
    </Modal>
  );
}

export function SetupModal() {
  const { activeModal, closeModal, setupConnection } = useApp();
  const [key, setKey] = useState('');

  const handleSetup = () => {
    setupConnection(key);
    setKey('');
  };

  return (
    <Modal isOpen={activeModal === 'setup'} onClose={() => {}}>
      <div className="setup-content">
        <div className="setup-icon">
          <i className="fas fa-cat" />
        </div>
        <h2>Welcome to Whisker!</h2>
        <p>Enter your connection key to get started</p>
        <div className="form-group">
          <div className="input-with-icon">
            <i className="fas fa-key" />
            <input 
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="YOUR-KEY-XXXX"
            />
          </div>
        </div>
        <Button fullWidth onClick={handleSetup}>
          <i className="fas fa-rocket" /> Get Started
        </Button>
      </div>
    </Modal>
  );
}
