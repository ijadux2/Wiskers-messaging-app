import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, Button, Avatar, Input, TextArea } from './ui';
import { copyToClipboard } from '../utils/helpers';

export function ProfileModal() {
  const { activeModal, closeModal, currentUser, updateProfile, showToast, connectionKey } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (activeModal === 'profile') {
      setName(currentUser?.name || '');
      setBio(currentUser?.bio || '');
      setAvatar(currentUser?.avatar || '');
      setHasChanges(false);
    }
  }, [activeModal, currentUser]);

  useEffect(() => {
    if (activeModal === 'profile') {
      const changed = 
        name !== (currentUser?.name || '') ||
        bio !== (currentUser?.bio || '') ||
        avatar !== (currentUser?.avatar || '');
      setHasChanges(changed);
    }
  }, [name, bio, avatar, activeModal, currentUser]);

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
    closeModal();
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Discard them?')) {
        closeModal();
      }
    } else {
      closeModal();
    }
  };

  const handleCopyKey = async () => {
    if (await copyToClipboard(connectionKey || '')) {
      showToast('Key copied!', 'success');
    }
  };

  return (
    <Modal isOpen={activeModal === 'profile'} onClose={handleCancel}>
      <div className="profile-modal-content">
        <div className="profile-cover">
          <i className="fas fa-cat" />
        </div>
        <button className="close-btn" onClick={handleCancel}>&times;</button>
        
        <div className="profile-body">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <Avatar src={avatar || currentUser?.avatar || ''} alt={name} size="xl" />
              <label className="avatar-upload-btn">
                <i className="fas fa-camera" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              </label>
            </div>
            <h2 className="profile-name">{name || currentUser?.name}</h2>
            <p className="profile-bio">{bio || currentUser?.bio || 'No bio yet'}</p>
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
          <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={!hasChanges}><i className="fas fa-save" /> Save</Button>
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

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, Button, Avatar, Input, TextArea } from './ui';
import { copyToClipboard } from '../utils/helpers';

export function SettingsModal() {
  const { activeModal, closeModal, chats, blogs, messages, clearAllData, exportData, connectionKey, theme, setTheme, themes } = useApp();
  const [activeTab, setActiveTab] = useState<'appearance' | 'data' | 'connection' | 'danger'>('appearance');
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

        <div className="settings-tabs">
          <button className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`} onClick={() => setActiveTab('appearance')}>
            <i className="fas fa-palette" /> Appearance
          </button>
          <button className={`settings-tab ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>
            <i className="fas fa-database" /> Data
          </button>
          <button className={`settings-tab ${activeTab === 'connection' ? 'active' : ''}`} onClick={() => setActiveTab('connection')}>
            <i className="fas fa-link" /> Connection
          </button>
          <button className={`settings-tab ${activeTab === 'danger' ? 'active' : ''}`} onClick={() => setActiveTab('danger')}>
            <i className="fas fa-exclamation-triangle" /> Danger
          </button>
        </div>

        <div className="settings-body">
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3><i className="fas fa-palette" /> Theme</h3>
              <p className="settings-description">Choose a color theme for your app</p>
              <div className="theme-grid">
                {themes.map((t) => (
                  <button
                    key={t.name}
                    className={`theme-card ${theme.name === t.name ? 'active' : ''}`}
                    onClick={() => setTheme(t)}
                  >
                    <div className="theme-preview">
                      <div className="theme-colors">
                        <div className="theme-color" style={{ background: t.background }} />
                        <div className="theme-color" style={{ background: t.surface }} />
                        <div className="theme-color accent" style={{ background: t.accent }} />
                      </div>
                    </div>
                    <span className="theme-name">{t.name}</span>
                    {theme.name === t.name && <i className="fas fa-check-circle theme-check" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="settings-section">
              <h3><i className="fas fa-database" /> Database</h3>
              <p className="settings-description">Manage your app data</p>
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
              <Button fullWidth onClick={exportData} style={{ marginTop: '16px' }}>
                <i className="fas fa-download" /> Export Data
              </Button>
            </div>
          )}

          {activeTab === 'connection' && (
            <div className="settings-section">
              <h3><i className="fas fa-link" /> Connection</h3>
              <p className="settings-description">Your unique connection details</p>
              <div className="api-key-section">
                <span>Your Connection Key</span>
                <div className="api-key-display">
                  <code>{connectionKey}</code>
                  <Button onClick={() => copyToClipboard(connectionKey || '')}>
                    <i className="fas fa-copy" />
                  </Button>
                </div>
                <p className="settings-hint">Share this key with others so they can add you as a contact</p>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="settings-section danger-section">
              <h3><i className="fas fa-exclamation-triangle" /> Danger Zone</h3>
              <p className="settings-description">Irreversible actions - proceed with caution</p>
              <Button variant="danger" fullWidth onClick={clearAllData}>
                <i className="fas fa-trash" /> Clear All Data
              </Button>
              <p className="settings-hint warning">This will delete all your chats, blogs, contacts, and settings. This action cannot be undone.</p>
            </div>
          )}
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

export function AddContactModal() {
  const { activeModal, closeModal, addContact, showToast } = useApp();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!key.trim()) {
      showToast('Please enter a connection key', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      addContact(key);
      setLoading(false);
      setKey('');
      showToast('Contact added successfully!', 'success');
    }, 500);
  };

  return (
    <Modal isOpen={activeModal === 'addContact'} onClose={closeModal}>
      <div className="chat-modal-content">
        <div className="chat-header-icon">
          <i className="fas fa-user-plus" />
        </div>
        <h2>Add Contact</h2>
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
            <small style={{color: 'var(--subtext)', marginTop: '8px', display: 'block'}}>
              Ask your friend for their connection key
            </small>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin" /> : <><i className="fas fa-user-plus" /> Add</>}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function BlogDetailModal() {
  const { activeModal, closeModal, selectedBlog, likeBlog, bookmarkBlog, addComment, currentUser, showToast } = useApp();
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  if (!selectedBlog) return null;

  const handleLike = () => {
    likeBlog(selectedBlog.id);
  };

  const handleBookmark = () => {
    bookmarkBlog(selectedBlog.id);
    showToast(selectedBlog.bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks', 'success');
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    addComment(selectedBlog.id, comment);
    setComment('');
    showToast('Comment added!', 'success');
  };

  return (
    <Modal isOpen={activeModal === 'viewBlog'} onClose={closeModal} size="lg">
      <div className="blog-detail-modal">
        <div className="blog-detail-cover">
          <img src={selectedBlog.image} alt={selectedBlog.title} />
          <button className="close-btn" onClick={closeModal}>&times;</button>
        </div>
        
        <div className="blog-detail-content">
          <div className="blog-detail-header">
            <div className="blog-detail-author">
              <Avatar src={selectedBlog.authorAvatar} alt={selectedBlog.authorName} size="md" />
              <div>
                <span className="author-name">{selectedBlog.authorName}</span>
                <span className="post-date">{new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="blog-detail-tags">
              {selectedBlog.tags.map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          </div>

          <h1 className="blog-detail-title">{selectedBlog.title}</h1>
          
          <div className="blog-detail-body">
            {selectedBlog.content}
          </div>

          <div className="blog-detail-actions">
            <button className={`action-btn ${selectedBlog.liked ? 'active' : ''}`} onClick={handleLike}>
              <i className={`fas fa-heart ${selectedBlog.liked ? 'liked' : ''}`} />
              {selectedBlog.likes}
            </button>
            <button className={`action-btn ${selectedBlog.bookmarked ? 'active' : ''}`} onClick={handleBookmark}>
              <i className={`fas fa-bookmark ${selectedBlog.bookmarked ? 'bookmarked' : ''}`} />
              Save
            </button>
            <button className="action-btn" onClick={() => setShowComments(!showComments)}>
              <i className="fas fa-comment" />
              {selectedBlog.comments} Comments
            </button>
            <button className="action-btn" onClick={() => navigator.share?.({ title: selectedBlog.title, url: window.location.href }) || showToast('Share link copied!', 'info')}>
              <i className="fas fa-share" />
              Share
            </button>
          </div>

          {showComments && (
            <div className="blog-comments-section">
              <h3>Comments ({selectedBlog.comments})</h3>
              
              {currentUser && (
                <div className="comment-input">
                  <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
                  <div className="comment-input-field">
                    <input 
                      type="text" 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                    />
                    <button onClick={handleComment} disabled={!comment.trim()}>
                      <i className="fas fa-paper-plane" />
                    </button>
                  </div>
                </div>
              )}

              <div className="comments-list">
                <div className="comment">
                  <Avatar src="https://api.dicebear.com/7.x/catppuccin/svg?seed=whiskers123" alt="Whiskers" size="sm" />
                  <div className="comment-content">
                    <span className="comment-author">Whiskers</span>
                    <p>Great post! 👍</p>
                    <span className="comment-time">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
