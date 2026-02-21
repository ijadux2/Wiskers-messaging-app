// Whisker Chat - Instagram/Snapchat Style Messaging App

let db = null;
let SQL = null;

const CONFIG = {
  CONNECTION_KEY: "whisker_secret_2024",
  PROFILE_NAME: "Whisker User",
  PROFILE_BIO: "Welcome to Whisker Chat! 😺",
};

const state = {
  currentUser: null,
  connectionKey: null,
  activeChat: null,
  chats: [],
  blogs: [],
  messages: {},
};

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initSQL();
    await initDatabase();
    loadUserData();
    initializeApp();
  } catch (error) {
    console.error("Init error:", error);
    loadFromStorageFallback();
    initializeApp();
  }
});

async function initSQL() {
  SQL = await initSqlJs({
    locateFile: (file) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
  });
}

async function initDatabase() {
  const savedDb = localStorage.getItem("whisker_db");

  if (savedDb) {
    const uint8Array = new Uint8Array(JSON.parse(savedDb));
    db = new SQL.Database(uint8Array);
  } else {
    db = new SQL.Database();
    createTables();
    insertSampleData();
  }
}

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        name TEXT,
        bio TEXT,
        avatar TEXT,
        connection_key TEXT,
        created_at TEXT
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        name TEXT,
        avatar TEXT,
        type TEXT,
        key TEXT,
        is_online INTEGER,
        created_at TEXT,
        unread INTEGER DEFAULT 0
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT,
        text TEXT,
        sender_id TEXT,
        is_sent INTEGER,
        status TEXT,
        created_at TEXT
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS blogs (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        image TEXT,
        author_id TEXT,
        author_name TEXT,
        author_avatar TEXT,
        tags TEXT,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        created_at TEXT
    )`);

  saveDatabase();
}

function insertSampleData() {
  const userId = generateId();
  const connectionKey = CONFIG.CONNECTION_KEY;

  db.run(
    `INSERT INTO user (id, name, bio, avatar, connection_key, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      CONFIG.PROFILE_NAME,
      CONFIG.PROFILE_BIO,
      `https://api.dicebear.com/7.x/catppuccin/svg?seed=${userId}`,
      connectionKey,
      new Date().toISOString(),
    ],
  );

  const sampleChats = [
    {
      id: "chat1",
      name: "Whiskers",
      avatar: "https://api.dicebear.com/7.x/catppuccin/svg?seed=whiskers",
      type: "direct",
      key: "WHISK-1234",
      is_online: 1,
    },
    {
      id: "chat2",
      name: "Mittens",
      avatar: "https://api.dicebear.com/7.x/catppuccin/svg?seed=mittens",
      type: "direct",
      key: "WHISK-5678",
      is_online: 0,
    },
    {
      id: "chat3",
      name: "Shadow",
      avatar: "https://api.dicebear.com/7.x/catppuccin/svg?seed=shadow",
      type: "direct",
      key: "WHISK-9012",
      is_online: 1,
    },
  ];

  sampleChats.forEach((chat) => {
    db.run(
      `INSERT INTO chats (id, name, avatar, type, key, is_online, created_at, unread) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        chat.id,
        chat.name,
        chat.avatar,
        chat.type,
        chat.key,
        chat.is_online,
        new Date().toISOString(),
        0,
      ],
    );
  });

  const sampleMessages = [
    { chat_id: "chat1", text: "Hey! How are you?", is_sent: 0 },
    { chat_id: "chat1", text: "I'm good! 😺", is_sent: 1 },
    {
      chat_id: "chat1",
      text: "Nice! Let me know if you need anything.",
      is_sent: 0,
    },
  ];

  sampleMessages.forEach((msg) => {
    db.run(
      `INSERT INTO messages (id, chat_id, text, sender_id, is_sent, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        msg.chat_id,
        msg.text,
        msg.is_sent ? userId : "other",
        msg.is_sent,
        "read",
        new Date().toISOString(),
      ],
    );
  });

  const sampleBlogs = [
    {
      title: "First Post",
      content: "Hello world! This is my first post on Whisker!",
      tags: "hello,first",
    },
    {
      title: "Cat Life",
      content: "Being a cat is the best! Sleep all day, eat, repeat.",
      tags: "cats,lifestyle",
    },
    {
      title: "Coding Tips",
      content: "Always comment your code. Future you will thank present you!",
      tags: "coding,tips",
    },
  ];

  sampleBlogs.forEach((blog) => {
    db.run(
      `INSERT INTO blogs (id, title, content, image, author_id, author_name, author_avatar, tags, likes, comments, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        blog.title,
        blog.content,
        `https://api.dicebear.com/7.x/catppuccin/svg?seed=${generateId()}`,
        userId,
        CONFIG.PROFILE_NAME,
        `https://api.dicebear.com/7.x/catppuccin/svg?seed=${userId}`,
        blog.tags,
        Math.floor(Math.random() * 50),
        0,
        new Date().toISOString(),
      ],
    );
  });

  saveDatabase();
}

function saveDatabase() {
  const data = db.export();
  const arr = Array.from(data);
  localStorage.setItem("whisker_db", JSON.stringify(arr));
}

function loadUserData() {
  const userResult = db.exec("SELECT * FROM user LIMIT 1");
  if (userResult.length > 0 && userResult[0].values.length > 0) {
    const row = userResult[0].values[0];
    state.currentUser = {
      id: row[0],
      name: row[1],
      bio: row[2],
      avatar: row[3],
      connectionKey: row[4],
    };
    state.connectionKey = row[4];
  }

  loadChats();
  loadBlogs();
  loadMessages();
}

function loadChats() {
  const result = db.exec("SELECT * FROM chats ORDER BY created_at DESC");
  if (result.length > 0) {
    state.chats = result[0].values.map((row) => ({
      id: row[0],
      name: row[1],
      avatar: row[2],
      type: row[3],
      key: row[4],
      online: row[5] === 1,
      createdAt: row[6],
      unread: row[7] || 0,
    }));
  }
}

function loadBlogs() {
  const result = db.exec("SELECT * FROM blogs ORDER BY created_at DESC");
  if (result.length > 0) {
    state.blogs = result[0].values.map((row) => ({
      id: row[0],
      title: row[1],
      content: row[2],
      image: row[3],
      authorId: row[4],
      authorName: row[5],
      authorAvatar: row[6],
      tags: row[7] ? row[7].split(",") : [],
      likes: row[8] || 0,
      comments: row[9] || 0,
      createdAt: row[10],
    }));
  }
}

function loadMessages() {
  state.chats.forEach((chat) => {
    const result = db.exec(
      `SELECT * FROM messages WHERE chat_id = '${chat.id}' ORDER BY created_at ASC`,
    );
    if (result.length > 0) {
      state.messages[chat.id] = result[0].values.map((row) => ({
        id: row[0],
        chatId: row[1],
        text: row[2],
        senderId: row[3],
        sent: row[4] === 1,
        status: row[5],
        timestamp: row[6],
      }));
    } else {
      state.messages[chat.id] = [];
    }
  });
}

function loadFromStorageFallback() {
  state.currentUser = JSON.parse(localStorage.getItem("whisker_user")) || {
    id: generateId(),
    name: CONFIG.PROFILE_NAME,
    bio: CONFIG.PROFILE_BIO,
    avatar: `https://api.dicebear.com/7.x/catppuccin/svg?seed=fallback`,
  };
  state.connectionKey = CONFIG.CONNECTION_KEY;
  state.chats = JSON.parse(localStorage.getItem("whisker_chats")) || [];
  state.blogs = JSON.parse(localStorage.getItem("whisker_blogs")) || [];
}

function initializeApp() {
  updateProfileUI();
  renderChatsList();
  renderPostsGrid();
  renderMyPosts();
  updateStats();
  updateSettings();
}

// Navigation
function switchView(view) {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });

  document.querySelectorAll(".view-section").forEach((section) => {
    section.classList.toggle("active", section.id === view + "View");
  });

  // Close chat panel when switching views
  document.getElementById("chatDetailPanel").classList.remove("active");
}

function openProfile() {
  switchView("profile");
  updateProfileUI();
}

// Render Functions
function updateProfileUI() {
  const user = state.currentUser;
  if (!user) return;

  document.getElementById("profileAvatarLarge").src = user.avatar;
  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileBio").textContent = user.bio || "No bio yet";
  document.getElementById("editAvatarModal").src = user.avatar;
  document.getElementById("editName").value = user.name;
  document.getElementById("editBio").value = user.bio || "";
  document.getElementById("settingsUsername").value = user.name;
  document.getElementById("settingsKey").textContent =
    state.connectionKey || CONFIG.CONNECTION_KEY;
}

function renderChatsList() {
  const container = document.getElementById("chatsList");
  container.innerHTML = "";

  state.chats.forEach((chat) => {
    const messages = state.messages[chat.id] || [];
    const lastMsg = messages[messages.length - 1];

    const el = document.createElement("div");
    el.className = "chat-item-insta";
    el.innerHTML = `
            <div class="avatar-wrapper">
                <img src="${chat.avatar}" alt="${chat.name}" class="avatar-small">
                ${chat.online ? '<span class="online-dot"></span>' : ""}
            </div>
            <div class="chat-info">
                <div class="chat-name">${chat.name}</div>
                <div class="chat-preview">${lastMsg ? lastMsg.text : "No messages yet"}</div>
            </div>
            <span class="chat-time">${lastMsg ? formatTime(lastMsg.timestamp) : ""}</span>
            ${chat.unread > 0 ? `<span class="unread-count">${chat.unread}</span>` : ""}
        `;
    el.onclick = () => openChat(chat);
    container.appendChild(el);
  });

  document.getElementById("chatBadge").textContent = state.chats.reduce(
    (sum, c) => sum + (c.unread || 0),
    0,
  );
}

function renderPostsGrid() {
  const container = document.getElementById("postsGrid");
  container.innerHTML = "";

  state.blogs.forEach((blog) => {
    const el = document.createElement("div");
    el.className = "post-thumbnail";
    el.innerHTML = `
            <img src="${blog.image || `https://api.dicebear.com/7.x/catppuccin/svg?seed=${blog.id}`}" alt="${blog.title}">
            <div class="post-overlay">
                <span><i class="fas fa-heart"></i> ${blog.likes}</span>
                <span><i class="fas fa-comment"></i> ${blog.comments}</span>
            </div>
        `;
    el.onclick = () => viewPost(blog);
    container.appendChild(el);
  });
}

function renderMyPosts() {
  const container = document.getElementById("myPostsGrid");
  container.innerHTML = "";

  const myBlogs = state.blogs.filter(
    (b) => b.authorId === state.currentUser?.id,
  );

  myBlogs.forEach((blog) => {
    const el = document.createElement("div");
    el.className = "post-thumbnail";
    el.innerHTML = `
            <img src="${blog.image || `https://api.dicebear.com/7.x/catppuccin/svg?seed=${blog.id}`}" alt="${blog.title}">
            <div class="post-overlay">
                <span><i class="fas fa-heart"></i> ${blog.likes}</span>
            </div>
        `;
    container.appendChild(el);
  });
}

function viewPost(blog) {
  showToast(`${blog.title}\n${blog.content}`, "info");
}

// Chat Functions
function openChat(chat) {
  state.activeChat = chat;

  document.getElementById("chatDetailPanel").classList.add("active");
  document.getElementById("chatDetailAvatar").src = chat.avatar;
  document.getElementById("chatDetailName").textContent = chat.name;
  document.getElementById("chatDetailStatus").textContent = chat.online
    ? "Online"
    : "Offline";

  renderChatMessages();

  // Clear unread
  chat.unread = 0;
  db.run(`UPDATE chats SET unread = 0 WHERE id = ?`, [chat.id]);
  saveDatabase();
  renderChatsList();
}

function closeChat() {
  document.getElementById("chatDetailPanel").classList.remove("active");
  state.activeChat = null;
}

function renderChatMessages() {
  const container = document.getElementById("chatMessages");
  container.innerHTML = "";

  const messages = state.messages[state.activeChat.id] || [];

  if (messages.length === 0) {
    container.innerHTML = '<p class="empty-text">No messages yet. Say hi!</p>';
    return;
  }

  messages.forEach((msg) => {
    const el = document.createElement("div");
    el.className = `message-insta ${msg.sent ? "sent" : "received"}`;
    el.innerHTML = `
            ${escapeHtml(msg.text)}
            <span class="message-time">${formatTime(msg.timestamp)}</span>
        `;
    container.appendChild(el);
  });

  container.scrollTop = container.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (!text || !state.activeChat) return;

  const message = {
    id: generateId(),
    chatId: state.activeChat.id,
    text: text,
    senderId: state.currentUser.id,
    sent: true,
    status: "sent",
    timestamp: new Date().toISOString(),
  };

  db.run(
    `INSERT INTO messages (id, chat_id, text, sender_id, is_sent, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      message.id,
      message.chatId,
      message.text,
      message.senderId,
      1,
      message.status,
      message.timestamp,
    ],
  );

  if (!state.messages[state.activeChat.id]) {
    state.messages[state.activeChat.id] = [];
  }
  state.messages[state.activeChat.id].push(message);

  saveDatabase();
  renderChatMessages();
  renderChatsList();

  input.value = "";

  // Auto reply
  setTimeout(() => simulateReply(), 1500);
}

function simulateReply() {
  if (!state.activeChat) return;

  const replies = [
    "That's awesome! 😺",
    "I agree!",
    "Cool!",
    "Haha funny!",
    "Sure thing!",
    "Thanks! 😄",
  ];

  const msg = {
    id: generateId(),
    chatId: state.activeChat.id,
    text: replies[Math.floor(Math.random() * replies.length)],
    senderId: "other",
    sent: false,
    status: "received",
    timestamp: new Date().toISOString(),
  };

  db.run(
    `INSERT INTO messages (id, chat_id, text, sender_id, is_sent, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [msg.id, msg.chatId, msg.text, msg.senderId, 0, msg.status, msg.timestamp],
  );

  state.messages[state.activeChat.id].push(msg);
  saveDatabase();
  renderChatMessages();
  renderChatsList();
}

// Profile Functions
function saveProfile() {
  const name = document.getElementById("editName").value.trim();
  const bio = document.getElementById("editBio").value.trim();

  if (!name) {
    showToast("Name required", "error");
    return;
  }

  db.run(`UPDATE user SET name = ?, bio = ? WHERE id = ?`, [
    name,
    bio,
    state.currentUser.id,
  ]);
  saveDatabase();

  state.currentUser.name = name;
  state.currentUser.bio = bio;

  updateProfileUI();
  renderChatsList();
  showToast("Profile updated!", "success");
  closeModal(null, "profileModal");
}

function updateAvatar(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const avatar = e.target.result;
      db.run(`UPDATE user SET avatar = ? WHERE id = ?`, [
        avatar,
        state.currentUser.id,
      ]);
      saveDatabase();
      state.currentUser.avatar = avatar;
      updateProfileUI();
      showToast("Avatar updated!", "success");
    };
    reader.readAsDataURL(file);
  }
}

// Blog/Post Functions
function createPost() {
  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();
  const tags = document
    .getElementById("postTags")
    .value.split(",")
    .map((t) => t.trim())
    .filter((t) => t);

  if (!title || !content) {
    showToast("Title and content required", "error");
    return;
  }

  const blog = {
    id: generateId(),
    title,
    content,
    image:
      postCoverImage ||
      `https://api.dicebear.com/7.x/catppuccin/svg?seed=${generateId()}`,
    authorId: state.currentUser.id,
    authorName: state.currentUser.name,
    authorAvatar: state.currentUser.avatar,
    tags,
    likes: 0,
    comments: 0,
    createdAt: new Date().toISOString(),
  };

  db.run(
    `INSERT INTO blogs (id, title, content, image, author_id, author_name, author_avatar, tags, likes, comments, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      blog.id,
      blog.title,
      blog.content,
      blog.image,
      blog.authorId,
      blog.authorName,
      blog.authorAvatar,
      blog.tags.join(","),
      blog.likes,
      blog.comments,
      blog.createdAt,
    ],
  );

  saveDatabase();
  state.blogs.unshift(blog);

  showToast("Post created!", "success");
  closeModal(null, "blogModal");

  document.getElementById("postTitle").value = "";
  document.getElementById("postContent").value = "";
  document.getElementById("postTags").value = "";
  postCoverImage = null;

  renderPostsGrid();
  renderMyPosts();
  updateStats();
}

let postCoverImage = null;

function previewPostCover(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      postCoverImage = e.target.result;
      const preview = document.getElementById("postCoverPreview");
      const upload = document.querySelector(".post-cover-upload");
      preview.src = e.target.result;
      upload.classList.add("has-image");
    };
    reader.readAsDataURL(file);
  }
}

// Chat Management
function startNewChat() {
  const key = document.getElementById("newChatKey").value.trim().toUpperCase();

  if (!key) {
    showToast("Enter connection key", "error");
    return;
  }

  const existing = state.chats.find((c) => c.key === key);
  if (existing) {
    openChat(existing);
    closeModal(null, "newChatModal");
    return;
  }

  const newChat = {
    id: generateId(),
    name: `User ${key.slice(-4)}`,
    avatar: `https://api.dicebear.com/7.x/catppuccin/svg?seed=${key}`,
    type: "direct",
    key: key,
    is_online: Math.random() > 0.5,
    createdAt: new Date().toISOString(),
    unread: 0,
  };

  db.run(
    `INSERT INTO chats (id, name, avatar, type, key, is_online, created_at, unread) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newChat.id,
      newChat.name,
      newChat.avatar,
      newChat.type,
      newChat.key,
      newChat.is_online ? 1 : 0,
      newChat.createdAt,
      0,
    ],
  );

  state.chats.unshift(newChat);
  state.messages[newChat.id] = [];
  saveDatabase();

  showToast("Chat created!", "success");
  closeModal(null, "newChatModal");
  renderChatsList();
  openChat(newChat);
}

function clearChat() {
  if (!state.activeChat) return;
  openModal("clearChatModal");
}

function confirmClearChat() {
  if (!state.activeChat) return;

  db.run(`DELETE FROM messages WHERE chat_id = ?`, [state.activeChat.id]);
  state.messages[state.activeChat.id] = [];
  saveDatabase();

  renderChatMessages();
  showToast("Chat cleared!", "success");
  closeModal(null, "clearChatModal");
}

// Settings
function showSettingsSection(section) {
  document
    .querySelectorAll(".settings-option")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.closest(".settings-option").classList.add("active");

  document
    .querySelectorAll(".settings-section")
    .forEach((sec) => sec.classList.remove("active"));
  document.getElementById(`section-${section}`).classList.add("active");
}

function updateStats() {
  const chats = state.chats.length;
  const blogs = state.blogs.length;
  const messages = Object.values(state.messages).flat().length;

  document.getElementById("postsCount").textContent = blogs;
  document.getElementById("chatsCount").textContent = chats;
  document.getElementById("messagesCount").textContent = messages;
  document.getElementById("dataChats").textContent = chats;
  document.getElementById("dataBlogs").textContent = blogs;
  document.getElementById("dataMessages").textContent = messages;
}

function updateSettings() {
  document.getElementById("dataChats").textContent = state.chats.length;
  document.getElementById("dataBlogs").textContent = state.blogs.length;
  document.getElementById("dataMessages").textContent = Object.values(
    state.messages,
  ).flat().length;
}

function exportData() {
  const data = db.export();
  const blob = new Blob([data], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "whisker_backup.db";
  a.click();
  showToast("Data exported!", "success");
}

function clearAllData() {
  if (
    confirm("Are you sure you want to delete all data? This cannot be undone.")
  ) {
    localStorage.removeItem("whisker_db");
    location.reload();
  }
}

function copyKey() {
  navigator.clipboard.writeText(state.connectionKey || CONFIG.CONNECTION_KEY);
  showToast("Key copied!", "success");
}

// Modal Functions
function openModal(id) {
  document.getElementById("modalOverlay").classList.add("show");
  document.getElementById(id).style.display = "block";
}

function closeModal(event, id) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById("modalOverlay").classList.remove("show");
  document
    .querySelectorAll(".modal")
    .forEach((m) => (m.style.display = "none"));
}

// Input Handlers
function handleEnter(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function toggleEmojiPicker() {
  document.getElementById("emojiPicker").classList.toggle("show");
}

function insertEmoji(emoji) {
  const input = document.getElementById("messageInput");
  input.value += emoji;
  input.focus();
  document.getElementById("emojiPicker").classList.remove("show");
}

// Utilities
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "Now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Close emoji picker on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest(".emoji-picker") && !e.target.closest(".fa-smile")) {
    document.getElementById("emojiPicker").classList.remove("show");
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal(null);
});
