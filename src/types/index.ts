export interface User {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  connectionKey: string;
  createdAt: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: string;
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
  typing?: boolean;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  chatId: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  sent: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'voice';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  reactions?: MessageReaction[];
  replyTo?: string;
  edited?: boolean;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
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
  updatedAt?: string;
  liked?: boolean;
  bookmarked?: boolean;
}

export interface BlogComment {
  id: string;
  blogId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  connectionKey: string;
  status: 'friend' | 'pending' | 'blocked';
  addedAt: string;
  lastChat?: string;
  unreadCount: number;
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  description: string;
  members: GroupMember[];
  admins: string[];
  createdAt: string;
  createdBy: string;
  inviteLink: string;
  settings: GroupSettings;
}

export interface GroupMember {
  userId: string;
  name: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
}

export interface GroupSettings {
  allowMemberInvite: boolean;
  allowGroupCall: boolean;
  requireApproval: boolean;
}

export interface AppState {
  currentUser: User | null;
  chats: Chat[];
  messages: Record<string, Message[]>;
  blogs: Blog[];
  contacts: Contact[];
  groups: Group[];
  activeChat: Chat | null;
  activeTab: 'chats' | 'groups' | 'blogs' | 'contacts';
  connectionKey: string | null;
  isLoading: boolean;
  notifications: Notification[];
  typingUsers: Record<string, boolean>;
  theme: Theme;
}

export interface Theme {
  name: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

export const DEFAULT_THEMES: Theme[] = [
  { name: 'Catppuccin Mocha', accent: '#89b4fa', background: '#1e1e2e', surface: '#313244', text: '#cdd6f4' },
  { name: 'Dracula', accent: '#bd93f9', background: '#282a36', surface: '#44475a', text: '#f8f8f2' },
  { name: 'Nord', accent: '#88c0d0', background: '#2e3440', surface: '#3b4252', text: '#eceff4' },
  { name: 'Gruvbox', accent: '#fabd2f', background: '#282828', surface: '#3c3836', text: '#ebdbb2' },
  { name: 'Monokai', accent: '#f92672', background: '#272822', surface: '#3e3d32', text: '#f8f8f2' },
  { name: 'One Dark', accent: '#61afef', background: '#282c34', surface: '#3e4451', text: '#abb2bf' },
  { name: 'Solarized', accent: '#268bd2', background: '#002b36', surface: '#073642', text: '#839496' },
  { name: 'Midnight', accent: '#9d7bea', background: '#1a1b26', surface: '#24283b', text: '#a9b1d6' },
];

export interface Notification {
  id: string;
  type: 'message' | 'friend_request' | 'like' | 'comment' | 'group_invite';
  title: string;
  body: string;
  fromUserId?: string;
  fromUserAvatar?: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export type ModalType = 'profile' | 'newChat' | 'createGroup' | 'blog' | 'settings' | 'clearChat' | 'setup' | 'contacts' | 'addContact' | 'viewBlog' | 'groupInfo' | null;
