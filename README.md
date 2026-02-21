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

- Bun (runtime & build tool)
- Vanilla JavaScript (ES Modules)
- SQLite (sql.js) for local database
- LocalStorage for data persistence

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Or start the server
bun run start
```

Then open http://localhost:3000 in your browser.

## Project Structure

```
├── index.html          # Main HTML
├── server.js           # Bun server entry point
├── package.json        # Project config
├── .env                # Configuration
├── SPEC.md             # Project specification
├── public/
│   └── styles.css      # Styles
└── src/
    └── app.js          # Application logic
```

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
