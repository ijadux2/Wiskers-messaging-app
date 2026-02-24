import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, Chat, Message, Blog, AppState, ModalType } from '../types';
import { useDatabase } from '../hooks/useDatabase';
import { generateId, generateConnectionKey, getRandomAvatar, getRandomReply } from '../utils/helpers';

interface AppContextType extends AppState {
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  activeModal: ModalType;
  setActiveTab: (tab: 'chats' | 'groups' | 'blogs') => void;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (text: string) => void;
  createChat: (key: string) => void;
  createGroup: (name: string, description: string, avatar?: string) => void;
  createBlog: (title: string, content: string, image: string, tags: string[]) => void;
  updateProfile: (name: string, bio: string, avatar?: string) => void;
  clearChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  likeBlog: (blogId: string) => void;
  clearAllData: () => void;
  exportData: () => void;
  setupConnection: (key: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const CONFIG = {
  CONNECTION_KEY: 'whisker_secret_2024',
  PROFILE_NAME: 'Whisker User',
  PROFILE_BIO: 'Welcome to Whisker Chat! 😺',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { isReady, runQuery, selectQuery, selectQueryWithParams, saveDatabase } = useDatabase();
  
  const [state, setState] = useState<AppState>({
    currentUser: null,
    chats: [],
    messages: {},
    blogs: [],
    activeChat: null,
    activeTab: 'chats',
    connectionKey: null,
    isLoading: true,
  });
  
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  useEffect(() => {
    if (isReady) {
      loadUserData();
    } else {
      const timer = setTimeout(() => {
        loadFromLocalStorage();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  const loadFromLocalStorage = () => {
    try {
      const savedUser = localStorage.getItem('whisker_user');
      const savedChats = localStorage.getItem('whisker_chats');
      const savedBlogs = localStorage.getItem('whisker_blogs');
      const savedMessages = localStorage.getItem('whisker_messages');
      
      const userId = generateId();
      const connectionKey = generateConnectionKey();
      
      const defaultUser: User = {
        id: userId,
        name: CONFIG.PROFILE_NAME,
        bio: CONFIG.PROFILE_BIO,
        avatar: getRandomAvatar(userId),
        connectionKey: connectionKey,
        createdAt: new Date().toISOString(),
      };
      
      const defaultChats: Chat[] = [
        { id: 'chat1', name: 'Whiskers', avatar: getRandomAvatar('whiskers'), type: 'direct', key: 'WHISK-1234', online: true, createdAt: new Date().toISOString(), unread: 0 },
        { id: 'chat2', name: 'Mittens', avatar: getRandomAvatar('mittens'), type: 'direct', key: 'WHISK-5678', online: false, createdAt: new Date().toISOString(), unread: 2 },
        { id: 'chat3', name: 'Shadow', avatar: getRandomAvatar('shadow'), type: 'direct', key: 'WHISK-9012', online: true, createdAt: new Date().toISOString(), unread: 0 },
      ];
      
      const defaultMessages: Record<string, Message[]> = {
        'chat1': [
          { id: 'm1', chatId: 'chat1', text: 'Hey! How are you?', senderId: 'other', sent: false, status: 'read', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { id: 'm2', chatId: 'chat1', text: "I'm good! 😺", senderId: userId, sent: true, status: 'read', timestamp: new Date(Date.now() - 3500000).toISOString() },
          { id: 'm3', chatId: 'chat1', text: 'Nice! Let me know if you need anything.', senderId: 'other', sent: false, status: 'read', timestamp: new Date(Date.now() - 3400000).toISOString() },
        ],
      };
      
      const defaultBlogs: Blog[] = [
        { id: 'b1', title: 'First Post', content: 'Hello world! This is my first post on Whisker!', image: getRandomAvatar('b1'), authorId: userId, authorName: CONFIG.PROFILE_NAME, authorAvatar: getRandomAvatar(userId), tags: ['hello', 'first'], likes: 23, comments: 5, createdAt: new Date().toISOString() },
        { id: 'b2', title: 'Cat Life', content: 'Being a cat is the best! Sleep all day, eat, repeat.', image: getRandomAvatar('b2'), authorId: userId, authorName: CONFIG.PROFILE_NAME, authorAvatar: getRandomAvatar(userId), tags: ['cats', 'lifestyle'], likes: 45, comments: 12, createdAt: new Date().toISOString() },
        { id: 'b3', title: 'Coding Tips', content: 'Always comment your code. Future you will thank present you!', image: getRandomAvatar('b3'), authorId: userId, authorName: CONFIG.PROFILE_NAME, authorAvatar: getRandomAvatar(userId), tags: ['coding', 'tips'], likes: 67, comments: 8, createdAt: new Date().toISOString() },
      ];
      
      setState({
        currentUser: savedUser ? JSON.parse(savedUser) : defaultUser,
        chats: savedChats ? JSON.parse(savedChats) : defaultChats,
        messages: savedMessages ? JSON.parse(savedMessages) : defaultMessages,
        blogs: savedBlogs ? JSON.parse(savedBlogs) : defaultBlogs,
        activeChat: null,
        activeTab: 'chats',
        connectionKey: connectionKey,
        isLoading: false,
      });
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadUserData = () => {
    const userRows = selectQuery('SELECT * FROM user LIMIT 1');
    
    if (userRows.length > 0) {
      const row = userRows[0];
      const user: User = {
        id: row[0],
        name: row[1],
        bio: row[2],
        avatar: row[3],
        connectionKey: row[4],
        createdAt: row[5],
      };
      
      setState(prev => ({
        ...prev,
        currentUser: user,
        connectionKey: row[4],
        isLoading: false,
      }));
      
      loadChats();
      loadBlogs();
      loadMessages();
    } else {
      insertSampleData();
    }
  };

  const insertSampleData = () => {
    const userId = generateId();
    const connectionKey = generateConnectionKey();
    
    runQuery(
      'INSERT INTO user (id, name, bio, avatar, connection_key, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, CONFIG.PROFILE_NAME, CONFIG.PROFILE_BIO, getRandomAvatar(userId), connectionKey, new Date().toISOString()]
    );

    const sampleChats = [
      { id: 'chat1', name: 'Whiskers', key: 'WHISK-1234', online: true },
      { id: 'chat2', name: 'Mittens', key: 'WHISK-5678', online: false },
      { id: 'chat3', name: 'Shadow', key: 'WHISK-9012', online: true },
    ];

    sampleChats.forEach(chat => {
      runQuery(
        'INSERT INTO chats (id, name, avatar, type, key, is_online, created_at, unread) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [chat.id, chat.name, getRandomAvatar(chat.id), 'direct', chat.key, chat.online ? 1 : 0, new Date().toISOString(), 0]
      );
    });

    const sampleMessages = [
      { chat_id: 'chat1', text: 'Hey! How are you?', is_sent: false },
      { chat_id: 'chat1', text: "I'm good! 😺", is_sent: true },
      { chat_id: 'chat1', text: 'Nice! Let me know if you need anything.', is_sent: false },
    ];

    sampleMessages.forEach(msg => {
      runQuery(
        'INSERT INTO messages (id, chat_id, text, sender_id, is_sent, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [generateId(), msg.chat_id, msg.text, msg.is_sent ? userId : 'other', msg.is_sent ? 1 : 0, 'read', new Date().toISOString()]
      );
    });

    const sampleBlogs = [
      { title: 'First Post', content: 'Hello world! This is my first post on Whisker!', tags: 'hello,first' },
      { title: 'Cat Life', content: 'Being a cat is the best! Sleep all day, eat, repeat.', tags: 'cats,lifestyle' },
      { title: 'Coding Tips', content: 'Always comment your code. Future you will thank present you!', tags: 'coding,tips' },
    ];

    sampleBlogs.forEach(blog => {
      runQuery(
        'INSERT INTO blogs (id, title, content, image, author_id, author_name, author_avatar, tags, likes, comments, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [generateId(), blog.title, blog.content, getRandomAvatar(generateId()), userId, CONFIG.PROFILE_NAME, getRandomAvatar(userId), blog.tags, Math.floor(Math.random() * 50), 0, new Date().toISOString()]
      );
    });

    loadUserData();
  };

  const loadChats = () => {
    const rows = selectQuery('SELECT * FROM chats ORDER BY created_at DESC');
    const chats: Chat[] = rows.map(row => ({
      id: row[0],
      name: row[1],
      avatar: row[2],
      type: row[3],
      key: row[4],
      online: row[5] === 1,
      createdAt: row[6],
      unread: row[7] || 0,
      description: row[8],
      members: row[9] ? row[9].split(',') : undefined,
      admins: row[10] ? row[10].split(',') : undefined,
    }));
    setState(prev => ({ ...prev, chats }));
  };

  const loadBlogs = () => {
    const rows = selectQuery('SELECT * FROM blogs ORDER BY created_at DESC');
    const blogs: Blog[] = rows.map(row => ({
      id: row[0],
      title: row[1],
      content: row[2],
      image: row[3],
      authorId: row[4],
      authorName: row[5],
      authorAvatar: row[6],
      tags: row[7] ? row[7].split(',') : [],
      likes: row[8] || 0,
      comments: row[9] || 0,
      createdAt: row[10],
    }));
    setState(prev => ({ ...prev, blogs }));
  };

  const loadMessages = () => {
    const messages: Record<string, Message[]> = {};
    state.chats.forEach(chat => {
      const rows = selectQueryWithParams('SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC', [chat.id]);
      messages[chat.id] = rows.map(row => ({
        id: row[0],
        chatId: row[1],
        text: row[2],
        senderId: row[3],
        sent: row[4] === 1,
        status: row[5],
        timestamp: row[6],
        type: row[7] || 'text',
        fileUrl: row[8],
      }));
    });
    setState(prev => ({ ...prev, messages }));
  };

  const openModal = (modal: ModalType) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);
  
  const setActiveTab = (tab: 'chats' | 'groups' | 'blogs') => {
    setState(prev => ({ ...prev, activeTab: tab, activeChat: null }));
  };
  
  const setActiveChat = (chat: Chat | null) => {
    setState(prev => ({ ...prev, activeChat: chat }));
    if (chat) {
      runQuery('UPDATE chats SET unread = 0 WHERE id = ?', [chat.id]);
      loadChats();
    }
  };

  const sendMessage = useCallback((text: string) => {
    if (!state.activeChat || !state.currentUser || !text.trim()) return;

    const message: Message = {
      id: generateId(),
      chatId: state.activeChat.id,
      text: text.trim(),
      senderId: state.currentUser.id,
      sent: true,
      status: 'sent',
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    runQuery(
      'INSERT INTO messages (id, chat_id, text, sender_id, is_sent, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [message.id, message.chatId, message.text, message.senderId, 1, message.status, message.timestamp]
    );

    setState(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [message.chatId]: [...(prev.messages[message.chatId] || []), message],
      },
    }));

    setTimeout(() => {
      const reply: Message = {
        id: generateId(),
        chatId: state.activeChat!.id,
        text: getRandomReply(),
        senderId: 'other',
        sent: false,
        status: 'delivered',
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      runQuery(
        'INSERT INTO messages (id, chat_id, text, sender_id, is_sent, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [reply.id, reply.chatId, reply.text, reply.senderId, 0, reply.status, reply.timestamp]
      );

      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [reply.chatId]: [...(prev.messages[reply.chatId] || []), reply],
        },
      }));
    }, 1500);
  }, [state.activeChat, state.currentUser, runQuery]);

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
      avatar: getRandomAvatar(key),
      type: 'direct',
      key: key,
      online: Math.random() > 0.5,
      createdAt: new Date().toISOString(),
      unread: 0,
    };

    runQuery(
      'INSERT INTO chats (id, name, avatar, type, key, is_online, created_at, unread) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [chat.id, chat.name, chat.avatar, chat.type, chat.key, chat.online ? 1 : 0, chat.createdAt, 0]
    );

    setState(prev => ({
      ...prev,
      chats: [chat, ...prev.chats],
      messages: { ...prev.messages, [chat.id]: [] },
    }));
    
    setActiveChat(chat);
    closeModal();
  };

  const createGroup = (name: string, description: string, avatar?: string) => {
    if (!name.trim() || !state.currentUser) return;

    const group: Chat = {
      id: generateId(),
      name,
      avatar: avatar || getRandomAvatar(name),
      type: 'group',
      key: generateConnectionKey(),
      online: true,
      createdAt: new Date().toISOString(),
      unread: 0,
      description,
      members: [state.currentUser.id],
      admins: [state.currentUser.id],
    };

    runQuery(
      'INSERT INTO chats (id, name, avatar, type, key, is_online, created_at, unread, description, members, admins) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [group.id, group.name, group.avatar, group.type, group.key, 1, group.createdAt, 0, group.description, group.members?.join(','), group.admins?.join(',')]
    );

    setState(prev => ({
      ...prev,
      chats: [group, ...prev.chats],
      messages: { ...prev.messages, [group.id]: [] },
    }));
    
    setActiveChat(group);
    closeModal();
  };

  const createBlog = (title: string, content: string, image: string, tags: string[]) => {
    if (!state.currentUser || !title.trim() || !content.trim()) return;

    const blog: Blog = {
      id: generateId(),
      title,
      content,
      image: image || getRandomAvatar(generateId()),
      authorId: state.currentUser.id,
      authorName: state.currentUser.name,
      authorAvatar: state.currentUser.avatar,
      tags,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
    };

    runQuery(
      'INSERT INTO blogs (id, title, content, image, author_id, author_name, author_avatar, tags, likes, comments, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [blog.id, blog.title, blog.content, blog.image, blog.authorId, blog.authorName, blog.authorAvatar, blog.tags.join(','), 0, 0, blog.createdAt]
    );

    setState(prev => ({ ...prev, blogs: [blog, ...prev.blogs] }));
    closeModal();
  };

  const updateProfile = (name: string, bio: string, avatar?: string) => {
    if (!state.currentUser || !name.trim()) return;

    runQuery(
      'UPDATE user SET name = ?, bio = ?, avatar = ? WHERE id = ?',
      [name, bio, avatar || state.currentUser.avatar, state.currentUser.id]
    );

    setState(prev => ({
      ...prev,
      currentUser: prev.currentUser ? {
        ...prev.currentUser,
        name,
        bio,
        avatar: avatar || prev.currentUser.avatar,
      } : null,
    }));
    
    closeModal();
  };

  const clearChat = (chatId: string) => {
    runQuery('DELETE FROM messages WHERE chat_id = ?', [chatId]);
    setState(prev => ({
      ...prev,
      messages: { ...prev.messages, [chatId]: [] },
    }));
    closeModal();
  };

  const deleteChat = (chatId: string) => {
    runQuery('DELETE FROM messages WHERE chat_id = ?', [chatId]);
    runQuery('DELETE FROM chats WHERE id = ?', [chatId]);
    setState(prev => ({
      ...prev,
      chats: prev.chats.filter(c => c.id !== chatId),
      messages: { ...prev.messages, [chatId]: [] },
      activeChat: prev.activeChat?.id === chatId ? null : prev.activeChat,
    }));
  };

  const likeBlog = (blogId: string) => {
    if (!state.currentUser) return;
    
    const existing = selectQueryWithParams('SELECT * FROM blog_likes WHERE blog_id = ? AND user_id = ?', [blogId, state.currentUser.id]);
    
    if (existing.length > 0) {
      runQuery('DELETE FROM blog_likes WHERE blog_id = ? AND user_id = ?', [blogId, state.currentUser.id]);
      runQuery('UPDATE blogs SET likes = likes - 1 WHERE id = ?', [blogId]);
    } else {
      runQuery('INSERT INTO blog_likes (blog_id, user_id) VALUES (?, ?)', [blogId, state.currentUser.id]);
      runQuery('UPDATE blogs SET likes = likes + 1 WHERE id = ?', [blogId]);
    }
    
    loadBlogs();
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      localStorage.removeItem('whisker_db');
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = localStorage.getItem('whisker_db');
    if (data) {
      const blob = new Blob([new Uint8Array(JSON.parse(data))], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'whisker_backup.db';
      a.click();
    }
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
      clearAllData,
      exportData,
      setupConnection,
      showToast,
      toggleSidebar,
      toggleRightPanel,
      sidebarOpen,
      rightPanelOpen,
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
