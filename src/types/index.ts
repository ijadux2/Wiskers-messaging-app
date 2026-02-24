export interface User {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  connectionKey: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  type: 'direct' | 'group';
  key: string;
  online: boolean;
  createdAt: string;
  unread: number;
  description?: string;
  members?: string[];
  admins?: string[];
}

export interface Message {
  id: string;
  chatId: string;
  text: string;
  senderId: string;
  sent: boolean;
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  image: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  liked?: boolean;
}

export interface AppState {
  currentUser: User | null;
  chats: Chat[];
  messages: Record<string, Message[]>;
  blogs: Blog[];
  activeChat: Chat | null;
  activeTab: 'chats' | 'groups' | 'blogs';
  connectionKey: string | null;
  isLoading: boolean;
}

export type ModalType = 'profile' | 'newChat' | 'createGroup' | 'blog' | 'settings' | 'clearChat' | 'setup' | null;
