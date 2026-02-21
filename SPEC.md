# Messaging App Specification

## Project Overview

- **Project Name**: Whisker Chat
- **Type**: Web-based messaging application
- **Core Functionality**: Real-time messaging with friends/family, group chats, blog posts, and customizable profiles using a unique connection key system
- **Target Users**: Individuals seeking private messaging with friends, family, or communities

## UI/UX Specification

### Layout Structure

**Main Layout (3-Column)**

- **Left Sidebar** (280px): Navigation, user profile, contacts/chats list
- **Main Content** (flex-1): Active chat view or blog feed
- **Right Panel** (300px): Contact info, group details, or blog preview

**Responsive Breakpoints**

- Desktop: Full 3-column layout (>1200px)
- Tablet: 2-column with collapsible sidebar (768px-1200px)
- Mobile: Single column with slide-out sidebar (<768px)

### Visual Design - Catppuccin Mocha Theme

**Color Palette**

- Base: `#1e1e2e` (dark background)
- Mantle: `#181825` (darker panels)
- Crust: `#11111b` (borders, text)
- Text: `#cdd6f4` (primary text)
- Subtext: `#a6adc8` (secondary text)
- Surface0: `#313244`
- Surface1: `#45475a`
- Surface2: `#585b70`
- Overlay: `#6c7086`
- Blue: `#89b4fa` (primary accent)
- Mauve: `#cba6f7` (secondary accent)
- Peach: `#fab387` (warnings)
- Green: `#a6e3a1` (success)
- Red: `#f38ba8` (errors/destructive)
- Yellow: `#f9e2af` (highlights)
- Lavender: `#b4befe`

## **Typography**

- Font Family: 'JetBrains Mono' for code/headers, 'Nunito' for body
- Headings: 24px (h1), 20px (h2), 16px (h3)
- Body: 14px
- Small: 12px

## **Spacing System**

- Base unit: 8px
- Margins: 8px, 16px, 24px, 32px
- Padding: 8px, 12px, 16px, 24px
- Border radius: 8px (small), 12px (medium), 16px (large)

## **Visual Effects**

- Box shadows: `0 4px 24px rgba(0, 0, 0, 0.4)`
- Glassmorphism on modals: `backdrop-filter: blur(12px)`
- Subtle gradients on active elements

### Components

## **1. Sidebar Navigation**

- User profile card with avatar, name, status
- Tab navigation: Chats | Groups | Blogs
- Search bar with icon
- Contact/chat list with avatars, names, last message, timestamp
- Online status indicators (green dot)
- Hover: Surface1 background
- Active: Blue left border accent

## **2. Chat View**

- Message bubbles (sent: blue, received: surface1)
- Timestamp on hover
- Read receipts (checkmarks)
- Typing indicator animation
- Input area with emoji picker, attachment, send button
- Message grouping by time

## **3. Group Chat**

- Group avatar (collage of member avatars)
- Group name, member count
- Admin badge
- Member list panel
- Group settings (for admins)

## **4. Blog Section**

- Card-based blog posts
- Author avatar, name, date
- Blog title, preview text, thumbnail
- Like, comment counts
- Tags/categories
- Read more button

## **5. Profile Section**

- Large avatar with edit overlay
- Username, bio
- Connection key display with copy button
- Stats: friends, messages, posts
- Edit profile modal

## **6. Connection System**

- Custom key generation
- Key input modal for adding friends
- QR code for key sharing
- Connection requests

### Animations

## **Micro-interactions**

- Button hover: scale(1.02), 150ms ease
- Message send: slide up + fade in, 200ms
- New message: slide in from bottom, 250ms
- Tab switch: fade transition, 150ms
- Modal: fade + scale from 0.95, 200ms

## **Loading States**

- Skeleton loaders for chats
- Spinner for sending messages
- Pulse animation for typing indicator

## **Page Transitions**

- Sidebar collapse: width transition, 300ms
- Chat switch: crossfade, 200ms

## Functionality Specification

### Core Features

## **1. Connection System (.env)**

- Load custom API key from .env file
- Key format: alphanumeric, 16 characters
- Connection validation
- Fallback to local storage for demo

## **2. Chat System**

- 1-on-1 messaging
- Message types: text, image, file
- Message status: sent, delivered, read
- Message search
- Emoji support
- Typing indicators
- Unread count badges

## **3. Group Chats**

- Create groups (name, avatar, description)
- Add/remove members
- Admin roles
- Group settings
- Leave group option

## **4. Blogs**

- Create blog posts (title, content, images, tags)
- View blog feed
- Like/unlike posts
- Comment on posts
- Author profiles

## **5. Profiles**

- Customizable avatar (upload or preset)
- Editable username, bio
- Connection key sharing
- Online/offline status

## **6. Contacts/Friends**

- Add via connection key
- Accept/decline requests
- Block users
- Friend list management

### Data Handling

- LocalStorage for persistence
- Session management
- Key validation on load

### Edge Cases

- Invalid connection key handling
- Empty states for new users
- Network error displays
- Long message truncation
- Invalid image uploads

## Acceptance Criteria

1. App loads with catppuccin-mocha theme applied correctly
2. Connection key loads from .env (or shows setup modal)
3. Sidebar displays contacts/groups/blogs tabs
4. Messages can be sent and appear in chat
5. Group creation and management works
6. Blog posts can be created and viewed
7. Profile can be edited with avatar upload
8. Animations are smooth and responsive
9. Mobile responsive layout works
10. All modals and overlays function correctly
