import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { User, Chat, Message, Blog, Contact, AppState, ModalType, BlogComment, Group, GroupMember, Theme, DEFAULT_THEMES } from '../types';
import { generateId, generateConnectionKey, getRandomAvatar, getRandomReply, formatTime } from '../utils/helpers';

interface AppContextType extends AppState {
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  activeModal: ModalType;
  setActiveTab: (tab: 'chats' | 'groups' | 'blogs' | 'contacts') => void;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (text: string, type?: 'text' | 'image' | 'file') => void;
  createChat: (key: string) => void;
  createGroup: (name: string, description: string, avatar?: string) => void;
  createBlog: (title: string, content: string, image: string, tags: string[]) => void;
  updateProfile: (name: string, bio: string, avatar?: string) => void;
  clearChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  likeBlog: (blogId: string) => void;
  bookmarkBlog: (blogId: string) => void;
  addContact: (key: string) => void;
  removeContact: (contactId: string) => void;
  blockContact: (contactId: string) => void;
  unblockContact: (contactId: string) => void;
  addComment: (blogId: string, content: string) => void;
  reactToMessage: (messageId: string, emoji: string) => void;
  clearAllData: () => void;
  exportData: () => void;
  setupConnection: (key: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  selectedBlog: Blog | null;
  setSelectedBlog: (blog: Blog | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: Theme) => void;
  themes: Theme[];
}

const AppContext = createContext<AppContextType | null>(null);

const CONFIG = {
  CONNECTION_KEY: 'whisker_secret_2024',
  PROFILE_NAME: 'Whisker User',
  PROFILE_BIO: 'Welcome to Whisker Chat! 😺',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    chats: [],
    messages: {},
    blogs: [],
    contacts: [],
    groups: [],
    activeChat: null,
    activeTab: 'chats',
    connectionKey: null,
    isLoading: true,
    notifications: [],
    typingUsers: {},
    theme: DEFAULT_THEMES[0],
  });
  
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [comments, setComments] = useState<Record<string, BlogComment[]>>({});

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const saveToStorage = useCallback(() => {
    if (state.currentUser) {
      localStorage.setItem('whisker_user', JSON.stringify(state.currentUser));
    }
    localStorage.setItem('whisker_chats', JSON.stringify(state.chats));
    localStorage.setItem('whisker_messages', JSON.stringify(state.messages));
    localStorage.setItem('whisker_blogs', JSON.stringify(state.blogs));
    localStorage.setItem('whisker_contacts', JSON.stringify(state.contacts));
    localStorage.setItem('whisker_groups', JSON.stringify(state.groups));
    localStorage.setItem('whisker_comments', JSON.stringify(comments));
  }, [state, comments]);

  const loadFromLocalStorage = () => {
    try {
      const savedUser = localStorage.getItem('whisker_user');
      const savedChats = localStorage.getItem('whisker_chats');
      const savedBlogs = localStorage.getItem('whisker_blogs');
      const savedMessages = localStorage.getItem('whisker_messages');
      const savedContacts = localStorage.getItem('whisker_contacts');
      const savedGroups = localStorage.getItem('whisker_groups');
      const savedComments = localStorage.getItem('whisker_comments');
      const savedTheme = localStorage.getItem('whisker_theme');
      
      const userId = generateId();
      const connectionKey = generateConnectionKey();
      
      const defaultUser: User = {
        id: userId,
        name: CONFIG.PROFILE_NAME,
        bio: CONFIG.PROFILE_BIO,
        avatar: `https://api.dicebear.com/7.x/catppuccin/svg?seed=${userId}`,
        connectionKey: connectionKey,
        createdAt: new Date().toISOString(),
        status: 'online',
      };
      
      const defaultChats: Chat[] = [
        { id: 'chat1', name: 'Whiskers', avatar: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=whiskers123', type: 'direct', key: 'WHISK-1234', online: true, createdAt: new Date().toISOString(), unread: 0 },
        { id: 'chat2', name: 'Mittens', avatar: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=mittens456', type: 'direct', key: 'WHISK-5678', online: false, createdAt: new Date().toISOString(), unread: 2 },
        { id: 'chat3', name: 'Shadow', avatar: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=shadow789', type: 'direct', key: 'WHISK-9012', online: true, createdAt: new Date().toISOString(), unread: 0 },
        { id: 'chat4', name: 'Luna', avatar: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=luna321', type: 'direct', key: 'WHISK-3456', online: true, createdAt: new Date().toISOString(), unread: 5 },
        { id: 'g1', name: 'Cat Lovers Group', avatar: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=catlovers', type: 'group', key: 'WHISK-CATS', online: true, createdAt: new Date().toISOString(), unread: 3, description: 'A group for all cat lovers!', members: [userId, 'other1', 'other2'], admins: [userId] },
      ];
      
      const defaultMessages: Record<string, Message[]> = {
        'chat1': [
          { id: 'm1', chatId: 'chat1', text: 'Hey! How are you?', senderId: 'other', senderName: 'Whiskers', sent: false, status: 'read', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'text' },
          { id: 'm2', chatId: 'chat1', text: "I'm good! 😺 How about you?", senderId: userId, senderName: CONFIG.PROFILE_NAME, sent: true, status: 'read', timestamp: new Date(Date.now() - 3500000).toISOString(), type: 'text' },
          { id: 'm3', chatId: 'chat1', text: 'Nice! Let me know if you need anything.', senderId: 'other', senderName: 'Whiskers', sent: false, status: 'read', timestamp: new Date(Date.now() - 3400000).toISOString(), type: 'text' },
        ],
        'chat2': [
          { id: 'm4', chatId: 'chat2', text: 'Hey there! 👋', senderId: 'other', senderName: 'Mittens', sent: false, status: 'read', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'text' },
          { id: 'm5', chatId: 'chat2', text: 'What are you doing?', senderId: 'other', senderName: 'Mittens', sent: false, status: 'read', timestamp: new Date(Date.now() - 7100000).toISOString(), type: 'text' },
        ],
        'chat3': [
          { id: 'm6', chatId: 'chat3', text: 'What are you up to?', senderId: 'other', senderName: 'Shadow', sent: false, status: 'read', timestamp: new Date(Date.now() - 1800000).toISOString(), type: 'text' },
        ],
        'g1': [
          { id: 'm7', chatId: 'g1', text: 'Welcome to Cat Lovers Group! 🎉', senderId: 'other1', senderName: 'Whiskers', sent: false, status: 'read', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'text' },
          { id: 'm8', chatId: 'g1', text: 'Thanks! Happy to be here! 😺', senderId: 'other2', senderName: 'Mittens', sent: false, status: 'read', timestamp: new Date(Date.now() - 86300000).toISOString(), type: 'text' },
          { id: 'm9', chatId: 'g1', text: 'Hello everyone!', senderId: userId, senderName: CONFIG.PROFILE_NAME, sent: true, status: 'read', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'text' },
        ],
      };
      
      const defaultBlogs: Blog[] = [
        { id: 'b1', title: 'First Post', content: 'Hello world! This is my first post on Whisker! Excited to be here and share amazing content with everyone. Stay tuned for more updates! 🌟', image: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=blog1cover', authorId: userId, authorName: CONFIG.PROFILE_NAME, authorAvatar: `https://api.dicebear.com/7.x/catppuccin/svg?seed=${userId}`, tags: ['hello', 'first', 'introduction'], likes: 23, comments: 5, createdAt: new Date().toISOString() },
        { id: 'b2', title: 'Cat Life', content: 'Being a cat is the best! Sleep all day, eat, repeat. Here are some tips for living your best cat life. Nap often, demand treats, and always look adorable! 😺', image: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=blog2cover', authorId: 'other1', authorName: 'Whiskers', authorAvatar: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=whiskers123', tags: ['cats', 'lifestyle', 'funny'], likes: 45, comments: 12, createdAt: new Date().toISOString() },
        { id: 'b3', title: 'Coding Tips', content: 'Always comment your code. Future you will thank present you! Here are some best practices for writing clean, maintainable code that will save you headaches later. 💻', image: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=blog3cover', authorId: 'other2', authorName: 'Mittens', authorAvatar: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=mittens456', tags: ['coding', 'tips', 'development'], likes: 67, comments: 8, createdAt: new Date().toISOString() },
        { id: 'b4', title: 'Weekend Adventures', content: 'Just had an amazing weekend! Exploring new places, meeting new people, and making memories. Life is beautiful when you take time to enjoy it. 🌟✨', image: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=blog4cover', authorId: userId, authorName: CONFIG.PROFILE_NAME, authorAvatar: `https://api.dicebear.com/7.x/catppuccin/svg?seed=${userId}`, tags: ['travel', 'lifestyle', 'adventure'], likes: 89, comments: 15, createdAt: new Date().toISOString() },
      ];

      const defaultContacts: Contact[] = [
        { id: 'c1', userId: 'other', name: 'Whiskers', avatar: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=whiskers123', connectionKey: 'WHISK-1234', status: 'friend', addedAt: new Date().toISOString(), unreadCount: 0 },
        { id: 'c2', userId: 'other2', name: 'Mittens', avatar: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=mittens456', connectionKey: 'WHISK-5678', status: 'friend', addedAt: new Date().toISOString(), unreadCount: 0 },
        { id: 'c3', userId: 'other3', name: 'Shadow', avatar: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=shadow789', connectionKey: 'WHISK-9012', status: 'friend', addedAt: new Date().toISOString(), unreadCount: 0 },
      ];

      const defaultComments: Record<string, BlogComment[]> = {
        'b1': [
          { id: 'cm1', blogId: 'b1', authorId: 'other', authorName: 'Whiskers', authorAvatar: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=whiskers123', content: 'Welcome! Great first post! 👏', createdAt: new Date(Date.now() - 1800000).toISOString(), likes: 5 },
          { id: 'cm2', blogId: 'b1', authorId: 'other2', authorName: 'Mittens', authorAvatar: 'https://api.dicebear.com/7.x/catppuccin/svg?seed=mittens456', content: 'So excited to have you here! 😺', createdAt: new Date(Date.now() - 900000).toISOString(), likes: 3 },
        ],
        'b2': [
          { id: 'cm3', blogId: 'b2', authorId: userId, authorName: CONFIG.PROFILE_NAME, authorAvatar: `https://api.dicebear.com/7.x/catppuccin/svg?seed=${userId}`, content: 'Haha so true! 🐱', createdAt: new Date(Date.now() - 3600000).toISOString(), likes: 8 },
        ],
      };
      
      setComments(savedComments ? JSON.parse(savedComments) : defaultComments);
      
      setState({
        currentUser: savedUser ? JSON.parse(savedUser) : defaultUser,
        chats: savedChats ? JSON.parse(savedChats) : defaultChats,
        messages: savedMessages ? JSON.parse(savedMessages) : defaultMessages,
        blogs: savedBlogs ? JSON.parse(savedBlogs) : defaultBlogs,
        contacts: savedContacts ? JSON.parse(savedContacts) : defaultContacts,
        groups: savedGroups ? JSON.parse(savedGroups) : [],
        activeChat: null,
        activeTab: 'chats',
        connectionKey: connectionKey,
        isLoading: false,
        notifications: [],
        typingUsers: {},
        theme: savedTheme ? JSON.parse(savedTheme) : DEFAULT_THEMES[0],
      });
      
      if (savedTheme) {
        applyTheme(JSON.parse(savedTheme));
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const openModal = (modal: ModalType) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);
  
  const setActiveTab = (tab: 'chats' | 'groups' | 'blogs' | 'contacts') => {
    setState(prev => ({ ...prev, activeTab: tab, activeChat: null }));
  };
  
  const setActiveChat = (chat: Chat | null) => {
    setState(prev => {
      const updatedChats = prev.chats.map(c => 
        c.id === chat?.id ? { ...c, unread: 0 } : c
      );
      return { ...prev, activeChat: chat, chats: updatedChats };
    });
    saveToStorage();
  };

  const sendMessage = useCallback((text: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!state.activeChat || !state.currentUser || !text.trim()) return;

    const message: Message = {
      id: generateId(),
      chatId: state.activeChat.id,
      text: text.trim(),
      senderId: state.currentUser.id,
      senderName: state.currentUser.name,
      senderAvatar: state.currentUser.avatar,
      sent: true,
      status: 'sent',
      timestamp: new Date().toISOString(),
      type,
    };

    setState(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [message.chatId]: [...(prev.messages[message.chatId] || []), message],
      },
    }));
    saveToStorage();

    // Auto reply after delay
    setTimeout(() => {
      const reply: Message = {
        id: generateId(),
        chatId: state.activeChat!.id,
        text: getRandomReply(),
        senderId: 'other',
        senderName: state.activeChat!.name,
        sent: false,
        status: 'delivered',
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [reply.chatId]: [...(prev.messages[reply.chatId] || []), reply],
        },
      }));
      saveToStorage();
    }, 1500 + Math.random() * 2000);
  }, [state.activeChat, state.currentUser, saveToStorage]);

  const createChat = (key: string) => {
    if (!key.trim()) return;
    
    const existing = state.chats.find(c => c.key === key);
    if (existing) {
      setActiveChat(existing);
      closeModal();
      return;
    }

    const chat: Chat = {
      id: generateId(),
      name: `User ${key.slice(-4)}`,
      avatar: `https://api.dicebear.com/7.x/catppuccin/svg?seed=${key}`,
      type: 'direct',
      key: key.toUpperCase(),
      online: Math.random() > 0.3,
      createdAt: new Date().toISOString(),
      unread: 0,
    };

    setState(prev => ({
      ...prev,
      chats: [chat, ...prev.chats],
      messages: { ...prev.messages, [chat.id]: [] },
    }));
    setActiveChat(chat);
    saveToStorage();
    closeModal();
  };

  const createGroup = (name: string, description: string, avatar?: string) => {
    if (!name.trim() || !state.currentUser) return;

    const groupKey = generateConnectionKey();
    const group: Chat = {
      id: generateId(),
      name,
      avatar: avatar || `https://api.dicebear.com/7.x/catppuccin/svg?seed=${name}`,
      type: 'group',
      key: groupKey,
      online: true,
      createdAt: new Date().toISOString(),
      unread: 0,
      description,
      members: [state.currentUser.id],
      admins: [state.currentUser.id],
    };

    setState(prev => ({
      ...prev,
      chats: [group, ...prev.chats],
      messages: { ...prev.messages, [group.id]: [] },
    }));
    setActiveChat(group);
    saveToStorage();
    closeModal();
  };

  const createBlog = (title: string, content: string, image: string, tags: string[]) => {
    if (!state.currentUser || !title.trim() || !content.trim()) return;

    const blog: Blog = {
      id: generateId(),
      title,
      content,
      image: image || `https://api.dicebear.com/7.x/catppuccin/svg?seed=${generateId()}`,
      authorId: state.currentUser.id,
      authorName: state.currentUser.name,
      authorAvatar: state.currentUser.avatar,
      tags,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
    };

    setState(prev => ({ ...prev, blogs: [blog, ...prev.blogs] }));
    saveToStorage();
    closeModal();
  };

  const updateProfile = (name: string, bio: string, avatar?: string) => {
    if (!state.currentUser || !name.trim()) return;

    setState(prev => ({
      ...prev,
      currentUser: prev.currentUser ? {
        ...prev.currentUser,
        name,
        bio,
        avatar: avatar || prev.currentUser.avatar,
      } : null,
    }));
    saveToStorage();
    closeModal();
  };

  const clearChat = (chatId: string) => {
    setState(prev => ({
      ...prev,
      messages: { ...prev.messages, [chatId]: [] },
    }));
    saveToStorage();
    closeModal();
  };

  const deleteChat = (chatId: string) => {
    setState(prev => ({
      ...prev,
      chats: prev.chats.filter(c => c.id !== chatId),
      messages: { ...prev.messages, [chatId]: [] },
      activeChat: prev.activeChat?.id === chatId ? null : prev.activeChat,
    }));
    saveToStorage();
  };

  const likeBlog = (blogId: string) => {
    if (!state.currentUser) return;
    
    setState(prev => ({
      ...prev,
      blogs: prev.blogs.map(b => 
        b.id === blogId 
          ? { ...b, likes: b.liked ? b.likes - 1 : b.likes + 1, liked: !b.liked }
          : b
      ),
    }));
    saveToStorage();
  };

  const bookmarkBlog = (blogId: string) => {
    setState(prev => ({
      ...prev,
      blogs: prev.blogs.map(b => 
        b.id === blogId ? { ...b, bookmarked: !b.bookmarked } : b
      ),
    }));
    saveToStorage();
  };

  const addContact = (key: string) => {
    if (!key.trim() || !state.currentUser) return;
    
    const existing = state.contacts.find(c => c.connectionKey === key);
    if (existing) {
      showToast('Contact already exists!', 'error');
      return;
    }

    const contact: Contact = {
      id: generateId(),
      userId: generateId(),
      name: `User ${key.slice(-4)}`,
      avatar: `https://api.dicebear.com/7.x/catppuccin/svg?seed=${key}`,
      connectionKey: key.toUpperCase(),
      status: 'friend',
      addedAt: new Date().toISOString(),
      unreadCount: 0,
    };

    setState(prev => ({ ...prev, contacts: [...prev.contacts, contact] }));
    createChat(key);
    saveToStorage();
  };

  const removeContact = (contactId: string) => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== contactId),
    }));
    saveToStorage();
  };

  const blockContact = (contactId: string) => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.map(c => 
        c.id === contactId ? { ...c, status: 'blocked' } : c
      ),
    }));
    saveToStorage();
  };

  const unblockContact = (contactId: string) => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.map(c => 
        c.id === contactId ? { ...c, status: 'friend' } : c
      ),
    }));
    saveToStorage();
  };

  const addComment = (blogId: string, content: string) => {
    if (!state.currentUser || !content.trim()) return;

    const comment: BlogComment = {
      id: generateId(),
      blogId,
      authorId: state.currentUser.id,
      authorName: state.currentUser.name,
      authorAvatar: state.currentUser.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    setComments(prev => ({
      ...prev,
      [blogId]: [...(prev[blogId] || []), comment],
    }));

    setState(prev => ({
      ...prev,
      blogs: prev.blogs.map(b => 
        b.id === blogId ? { ...b, comments: b.comments + 1 } : b
      ),
    }));
    saveToStorage();
  };

  const reactToMessage = (messageId: string, emoji: string) => {
    // Simplified - could be expanded to track reactions
    showToast(`Reacted with ${emoji}`, 'info');
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      user: state.currentUser,
      chats: state.chats,
      messages: state.messages,
      blogs: state.blogs,
      contacts: state.contacts,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whisker_backup.json';
    a.click();
  };

  const setTheme = (theme: Theme) => {
    setState(prev => ({ ...prev, theme }));
    localStorage.setItem('whisker_theme', JSON.stringify(theme));
    applyTheme(theme);
  };

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--base', theme.background);
    root.style.setProperty('--surface0', theme.surface);
    root.style.setProperty('--surface1', adjustColor(theme.surface, 10));
    root.style.setProperty('--text', theme.text);
  };

  const adjustColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.min(255, Math.max(0, parseInt(hex.slice(0, 2), 16) + amount));
    const g = Math.min(255, Math.max(0, parseInt(hex.slice(2, 4), 16) + amount));
    const b = Math.min(255, Math.max(0, parseInt(hex.slice(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const setupConnection = (key: string) => {
    if (!key.trim()) return;
    setState(prev => ({ ...prev, connectionKey: key }));
    closeModal();
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleRightPanel = () => setRightPanelOpen(prev => !prev);

  return (
    <AppContext.Provider value={{
      ...state,
      openModal,
      closeModal,
      activeModal,
      setActiveTab,
      setActiveChat,
      sendMessage,
      createChat,
      createGroup,
      createBlog,
      updateProfile,
      clearChat,
      deleteChat,
      likeBlog,
      bookmarkBlog,
      addContact,
      removeContact,
      blockContact,
      unblockContact,
      addComment,
      reactToMessage,
      clearAllData,
      exportData,
      setupConnection,
      showToast,
      toggleSidebar,
      toggleRightPanel,
      sidebarOpen,
      rightPanelOpen,
      selectedBlog,
      setSelectedBlog,
      searchQuery,
      setSearchQuery,
      setTheme,
      themes: DEFAULT_THEMES,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
