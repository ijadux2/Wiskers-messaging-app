# Whisker Chat - Agent Guidelines

## Build & Development Commands

```bash
# Install dependencies
bun install

# Start development server (hot reload)
bun run dev

# Start production server
bun run start

# Build for production
bun run build
```

The build command outputs to `./dist` directory using Bun's browser target.

---

## Project Structure

```
src/
├── components/     # React components
│   ├── ui.tsx          # Reusable UI primitives (Button, Avatar, Modal, Input)
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── ChatView.tsx    # Chat/messaging view
│   ├── BlogView.tsx    # Blog feed
│   ├── ContactsView.tsx# Contacts management
│   ├── RightPanel.tsx  # Info panel
│   └── Modals.tsx      # All modal components
├── context/
│   └── AppContext.tsx  # Main state management (React Context)
├── hooks/
│   └── useDatabase.ts  # SQLite hook (sql.js)
├── types/
│   └── index.ts        # TypeScript interfaces
├── utils/
│   └── helpers.ts      # Utility functions
├── styles/
│   ├── main.css        # Theme variables & global styles
│   └── components.css  # Component-specific styles
├── App.tsx             # Root component
└── index.tsx          # Entry point

server.ts               # Bun HTTP server
index.html              # HTML entry
```

---

## Code Style Guidelines

### TypeScript

- Use **TypeScript interfaces** for all data structures (see `src/types/index.ts`)
- Avoid `any` - use proper types or create interfaces
- Use strict typing for function parameters and return types
- Example:

```typescript
interface User {
  id: string;
  name: string;
  avatar: string;
  status?: "online" | "offline" | "away";
}
```

### Naming Conventions

- **Components**: PascalCase (`ChatView`, `ProfileModal`)
- **Functions/variables**: camelCase (`setActiveChat`, `handleSubmit`)
- **Interfaces**: PascalCase with descriptive names (`AppContextType`)
- **Constants**: SCREAMING_SNAKE_CASE for config (`CONNECTION_KEY`)
- **Files**: kebab-case for components, camelCase for utilities

### React Patterns

- Use **functional components** with hooks
- Use **React.Context** for global state (AppContext pattern)
- Destructure props for clarity
- Use explicit return types for complex functions
- Example:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  return <button className={`btn btn-${variant}`} {...props}>{children}</button>;
}
```

### Imports

- Order imports: React → external libs → internal components → hooks → utils → types
- Use absolute imports from `../types`, not relative paths to parent directories
- Group by type with blank lines between groups

### CSS & Styling

- CSS variables defined in `src/styles/main.css` (Catppuccin Mocha theme)
- Component styles in `src/styles/components.css`
- Use CSS custom properties: `var(--accent)`, `var(--surface0)`, `var(--text)`
- Follow BEM-like naming: `.component-name__element--modifier`
- Use existing color palette (no hardcoded hex unless brand new)

### Error Handling

- Use try-catch for async operations (localStorage, file operations)
- Show user-friendly error messages via `showToast()`
- Example:

```typescript
try {
  localStorage.setItem("whisker_user", JSON.stringify(user));
} catch (e) {
  console.error("Error saving user:", e);
  showToast("Failed to save", "error");
}
```

### State Management

- Use React Context for app-wide state (AppContext)
- Keep state in AppContext, not individual components
- Persist important data to localStorage in `saveToStorage()`
- Load from localStorage on app init in `loadFromLocalStorage()`

### File Organization

- One component per file (except grouped modals)
- Co-locate related files when possible
- Keep types in central `types/index.ts`
- Keep utilities in `utils/helpers.ts`

---

## Testing

- No formal test framework currently configured
- For single-component testing, use manual browser testing at `http://localhost:3000`
- Use browser DevTools for debugging React components

---

## Data Persistence

- **localStorage** for user data, chats, messages, contacts, blogs, theme
- Keys: `whisker_user`, `whisker_chats`, `whisker_messages`, `whisker_contacts`, `whisker_blogs`, `whisker_theme`
- Data is JSON serialized
- App loads defaults if no localStorage data exists

---

## External APIs

- **Dicebear** (catppuccin avatars): `https://api.dicebear.com/7.x/catppuccin/svg?seed={seed}`
- **Font Awesome** icons: loaded via CDN in index.html

---

## Common Tasks

### Adding a new feature modal

1. Add to `ModalType` in `src/types/index.ts`
2. Create component in `src/components/Modals.tsx`
3. Import and render in `src/App.tsx`
4. Open via `openModal('modalName')` from AppContext

### Adding theme colors

1. Add variable to `src/styles/main.css` under `:root`
2. Update `applyTheme()` in `src/context/AppContext.tsx` if dynamic

### Adding new state to AppContext

1. Add to `AppState` interface in `src/types/index.ts`
2. Initialize in `useState` in `AppProvider`
3. Add to `AppContextType` interface
4. Implement function in `AppProvider`
5. Provide in `AppContext.Provider value={{ ... }}`
