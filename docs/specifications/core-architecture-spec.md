# Core Application Architecture Specification

## Overview

The application is built using Electron with a clear separation between main and renderer processes. It uses React with TypeScript for the UI, Zustand for state management, and follows a feature-based folder structure for maintainability.

## Technology Stack

### Core Technologies

- **Framework**: Electron (latest stable)
- **UI Library**: React 18+ with TypeScript
- **State Management**: Zustand
- **Build Tool**: Vite
- **Language**: TypeScript (strict mode)
- **Database**: SQLite via better-sqlite3
- **AI Integration**: Vercel AI SDK
- **Styling**: CSS Modules + CSS Variables for theming

### Additional Libraries

- **IPC**: Electron's built-in IPC with type-safe wrappers
- **Secure Storage**: keytar (for API keys)
- **Icons**: Lucide React
- **Utilities**: date-fns, nanoid

## Process Architecture

### Main Process

Responsible for system-level operations and secure data handling.

**Core Responsibilities:**

- Window lifecycle management
- Database operations (SQLite)
- File system access (config files)
- Secure credential storage
- Application menu and shortcuts
- System tray integration (future)
- Auto-updater (future)

### Renderer Process

Handles all UI rendering and user interactions.

**Core Responsibilities:**

- React application rendering
- State management via Zustand
- AI provider API calls
- Real-time UI updates
- Theme management

### IPC Communication

Type-safe IPC bridge between processes:

```typescript
// Shared IPC types
interface IPCChannels {
  // Database
  'db:query': (query: DBQuery) => DBResult;
  'db:execute': (operation: DBOperation) => void;

  // Configuration
  'config:get': (key: string) => any;
  'config:set': (key: string, value: any) => void;
  'config:load-models': () => ModelConfig;

  // Secure Storage
  'keys:get': (provider: string) => string | null;
  'keys:set': (provider: string, key: string) => void;
  'keys:delete': (provider: string) => void;

  // Window
  'window:minimize': () => void;
  'window:maximize': () => void;
  'window:close': () => void;

  // Application
  'app:get-version': () => string;
}
```

## File Structure

```
ai-collaborators/
├── src/
│   ├── main/                          # Main process code
│   │   ├── index.ts                   # Main entry point
│   │   ├── window.ts                  # BrowserWindow management
│   │   ├── menu.ts                    # Application menu
│   │   ├── database/
│   │   │   ├── connection.ts          # SQLite connection
│   │   │   ├── migrations.ts          # Schema migrations
│   │   │   ├── queries/
│   │   │   │   ├── conversations.ts
│   │   │   │   ├── messages.ts
│   │   │   │   └── agents.ts
│   │   │   └── types.ts
│   │   ├── config/
│   │   │   ├── manager.ts             # Config file management
│   │   │   ├── defaults.ts            # Default configurations
│   │   │   └── schema.ts              # Config validation
│   │   ├── security/
│   │   │   └── keystore.ts            # Keytar wrapper
│   │   └── ipc/
│   │       ├── handlers.ts            # IPC handler registration
│   │       └── validator.ts           # IPC input validation
│   │
│   ├── renderer/                      # Renderer process code
│   │   ├── index.tsx                  # Renderer entry point
│   │   ├── App.tsx                    # Root component
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   │   ├── ChatRoom.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageItem.tsx
│   │   │   │   ├── InputArea.tsx
│   │   │   │   ├── AgentResponse.tsx
│   │   │   │   └── PendingResponses.tsx
│   │   │   ├── Agents/
│   │   │   │   ├── AgentLabelBar.tsx
│   │   │   │   ├── AgentLabel.tsx
│   │   │   │   ├── AgentSelector.tsx
│   │   │   │   └── AgentConfig.tsx
│   │   │   ├── Conversations/
│   │   │   │   ├── ConversationSidebar.tsx
│   │   │   │   ├── ConversationList.tsx
│   │   │   │   └── ConversationItem.tsx
│   │   │   ├── Settings/
│   │   │   │   ├── SettingsModal.tsx
│   │   │   │   ├── GeneralSettings.tsx
│   │   │   │   ├── APISettings.tsx
│   │   │   │   ├── AgentSettings.tsx
│   │   │   │   ├── PersonalitySettings.tsx
│   │   │   │   └── RoleSettings.tsx
│   │   │   └── Common/
│   │   │       ├── Button.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Toast.tsx
│   │   │       └── Icons.tsx
│   │   ├── hooks/
│   │   │   ├── useAgent.ts
│   │   │   ├── useConversation.ts
│   │   │   ├── useAutoMode.ts
│   │   │   └── useIPC.ts
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── provider.ts       # AI provider abstraction
│   │   │   │   ├── openai.ts
│   │   │   │   ├── anthropic.ts
│   │   │   │   ├── google.ts
│   │   │   │   └── formatter.ts      # Message formatting
│   │   │   ├── agents/
│   │   │   │   ├── manager.ts        # Agent lifecycle
│   │   │   │   ├── personality.ts    # Personality system
│   │   │   │   ├── turn-manager.ts   # Turn taking logic
│   │   │   │   └── skip-detector.ts  # Skip evaluation
│   │   │   └── conversation/
│   │   │       ├── manager.ts        # Conversation state
│   │   │       ├── context.ts        # Context window mgmt
│   │   │       └── mentions.ts       # @ mention parsing
│   │   ├── store/
│   │   │   ├── index.ts              # Zustand store setup
│   │   │   ├── slices/
│   │   │   │   ├── conversation.ts   # Conversation state
│   │   │   │   ├── agents.ts         # Agent state
│   │   │   │   ├── ui.ts             # UI state
│   │   │   │   └── settings.ts       # Settings state
│   │   │   └── types.ts
│   │   ├── utils/
│   │   │   ├── ipc.ts                # Type-safe IPC wrapper
│   │   │   ├── format.ts             # Text formatting
│   │   │   ├── tokens.ts             # Token counting
│   │   │   └── errors.ts             # Error handling
│   │   └── styles/
│   │       ├── global.css
│   │       ├── variables.css         # CSS variables
│   │       └── themes/
│   │           ├── light.css
│   │           └── dark.css
│   │
│   ├── shared/                        # Shared between processes
│   │   ├── types/
│   │   │   ├── agent.ts
│   │   │   ├── conversation.ts
│   │   │   ├── message.ts
│   │   │   ├── personality.ts
│   │   │   └── settings.ts
│   │   ├── constants/
│   │   │   ├── models.ts
│   │   │   ├── defaults.ts
│   │   │   └── limits.ts
│   │   └── utils/
│   │       └── validation.ts
│   │
│   └── preload/                       # Preload scripts
│       └── index.ts                   # Secure IPC bridge
│
├── config/                            # User-editable configs
│   ├── models.json
│   ├── personalities.json
│   └── roles.json
│
├── assets/
│   ├── icons/
│   └── fonts/
│
├── tests/                             # Test files
│   ├── unit/
│   └── integration/
│
├── electron-builder.yml               # Build configuration
├── vite.config.ts                     # Vite configuration
├── tsconfig.json                      # TypeScript config
├── package.json
└── README.md
```

## State Management (Zustand)

### Store Structure

```typescript
interface AppState {
  // Conversation State
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  pendingResponses: PendingResponse[];

  // Agent State
  agents: Agent[];
  agentStates: Map<string, AgentState>;
  turnQueue: TurnQueue;

  // UI State
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  settingsOpen: boolean;
  autoMode: boolean;

  // Settings
  apiKeys: Record<string, boolean>; // Just track if set
  generalSettings: GeneralSettings;

  // Actions
  actions: {
    // Conversation actions
    createConversation: () => void;
    selectConversation: (id: string) => void;
    addMessage: (message: Message) => void;

    // Agent actions
    addAgent: (agent: Agent) => void;
    removeAgent: (agentId: string) => void;
    toggleAgentParticipation: (agentId: string) => void;

    // UI actions
    toggleSidebar: () => void;
    toggleAutoMode: () => void;
    setTheme: (theme: Theme) => void;
  };
}
```

### Store Implementation

```typescript
// store/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useStore = create<AppState>()(
  devtools(
    persist(
      immer(set => ({
        // Initial state
        conversations: [],
        activeConversationId: null,
        // ... other state

        actions: {
          createConversation: () =>
            set(state => {
              const newConversation = createNewConversation();
              state.conversations.push(newConversation);
              state.activeConversationId = newConversation.id;
            }),
          // ... other actions
        },
      })),
      {
        name: 'ai-collaborators-storage',
        partialize: state => ({
          // Only persist UI preferences
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          generalSettings: state.generalSettings,
        }),
      },
    ),
  ),
);
```

## Event System

### Agent Event Bus

```typescript
class AgentEventBus extends EventEmitter {
  // Event types
  emit(event: 'agent:thinking', data: { agentId: string }): void;
  emit(
    event: 'agent:responded',
    data: { agentId: string; message: string },
  ): void;
  emit(event: 'agent:skipped', data: { agentId: string }): void;
  emit(event: 'agent:error', data: { agentId: string; error: Error }): void;
  emit(event: 'conversation:updated', data: { conversationId: string }): void;
  emit(event: 'mode:changed', data: { autoMode: boolean }): void;
  emit(
    event: 'mention:detected',
    data: { agentName: string; messageId: string },
  ): void;
}

// Global instance
export const agentEvents = new AgentEventBus();
```

### React Integration

```typescript
// hooks/useAgentEvents.ts
export function useAgentEvents() {
  useEffect(() => {
    const handleThinking = data => {
      useStore.getState().actions.setAgentThinking(data.agentId, true);
    };

    agentEvents.on('agent:thinking', handleThinking);
    return () => agentEvents.off('agent:thinking', handleThinking);
  }, []);
}
```

## Build Configuration

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/renderer',
    rollupOptions: {
      external: ['electron'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./src/renderer/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}
```

## Security Considerations

### Content Security Policy

```typescript
// main/window.ts
const mainWindow = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
  },
});
```

### API Key Handling

- Never store API keys in renderer process
- Use IPC to request AI operations
- Keys stored in system keychain via keytar
- Keys never included in logs or error messages

## Performance Optimizations

### React Optimizations

- Virtual scrolling for long message lists
- Memoized message components
- Debounced search and filter operations
- Lazy loading for settings panels

### Database Optimizations

- Indexed columns for quick queries
- Prepared statements for common operations
- Connection pooling (if needed)
- Periodic VACUUM operations

## Development Workflow

### Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:main\" \"npm run dev:renderer\"",
    "dev:main": "tsc -w -p tsconfig.main.json",
    "dev:renderer": "vite",
    "build": "npm run build:main && npm run build:renderer && electron-builder",
    "build:main": "tsc -p tsconfig.main.json",
    "build:renderer": "vite build",
    "test": "vitest",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

### Hot Reload

- Renderer: Vite HMR
- Main: Electron-reload for development
- State persistence during development
