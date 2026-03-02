import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { BlogView } from './components/BlogView';
import { ContactsView } from './components/ContactsView';
import { RightPanel } from './components/RightPanel';
import {
  ProfileModal,
  NewChatModal,
  CreateGroupModal,
  BlogModal,
  SettingsModal,
  ClearChatModal,
  SetupModal,
  AddContactModal,
  BlogDetailModal
} from './components/Modals';
import './styles/main.css';
import './styles/components.css';

function AppContent() {
  const { activeTab, toggleSidebar, openModal, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <i className="fas fa-cat" />
        </div>
        <p>Loading Whisker...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <MobileHeader onMenuClick={toggleSidebar} onProfileClick={() => openModal('profile')} />
      <Sidebar />
      <main className="main-content">
        {activeTab === 'blogs' && <BlogView />}
        {activeTab === 'contacts' && <ContactsView />}
        {(activeTab === 'chats' || activeTab === 'groups') && <ChatView />}
      </main>
      <RightPanel />

      <Modals />
      <FAB />
      <ToastContainer />
    </div>
  );
}

function MobileHeader({ onMenuClick, onProfileClick }: { onMenuClick: () => void; onProfileClick: () => void }) {
  return (
    <header className="mobile-header">
      <button className="menu-btn" onClick={onMenuClick}>
        <i className="fas fa-bars" />
      </button>
      <div className="app-logo">
        <i className="fas fa-cat" />
        <span>Whisker</span>
      </div>
      <button className="menu-btn" onClick={onProfileClick}>
        <i className="fas fa-user" />
      </button>
    </header>
  );
}

function Modals() {
  return (
    <div className="modal-overlay-container">
      <ProfileModal />
      <NewChatModal />
      <CreateGroupModal />
      <BlogModal />
      <SettingsModal />
      <ClearChatModal />
      <SetupModal />
      <AddContactModal />
      <BlogDetailModal />
    </div>
  );
}

function FAB() {
  const { openModal, activeTab } = useApp();

  const handleClick = () => {
    if (activeTab === 'blogs') {
      openModal('blog');
    } else if (activeTab === 'contacts') {
      openModal('addContact');
    } else if (activeTab === 'groups') {
      openModal('createGroup');
    } else {
      openModal('newChat');
    }
  };

  return (
    <button className="fab" onClick={handleClick}>
      <i className="fas fa-plus" />
    </button>
  );
}

function ToastContainer() {
  return <div id="toast-container" className="toast-container" />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
