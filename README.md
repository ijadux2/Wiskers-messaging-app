# Whisker Chat

A browser-based messaging application with SQLite storage, featuring chats, group conversations, and blog posts.

## Features

- **Chat** - Send and receive messages with auto-reply
- **Group Chats** - Create and manage group conversations
- **Blog** - Share posts with the community
- **Profile** - Customizable profile with avatar upload
- **Clear Chat** - Delete all messages in a conversation
- **Settings** - Organized settings panel with export functionality

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- SQLite (sql.js) for local database
- LocalStorage for data persistence

## Getting Started

1. Open `index.html` in a browser
2. The app initializes a local SQLite database automatically

## Configuration

Edit `.env` file to customize:

```env
CONNECTION_KEY=whisker_secret_2024
API_GATEWAY=https://api.whiskerchat.local
PROFILE_NAME=ijadux2
PROFILE_BIO=Coder and Developer 😺
```

## Theme

Catppuccin Mocha color scheme applied throughout.

## Data Storage

All data (messages, contacts, blogs, profile) is stored locally in the browser using SQLite. No backend required.

## Files

- `index.html` - Main application
- `styles.css` - Styling
- `app.js` - Application logic
- `.env` - Configuration
- `SPEC.md` - Project specification
