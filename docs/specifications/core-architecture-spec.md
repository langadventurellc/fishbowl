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
│   │   ├── components/                # UI components (shared)
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
│   │   │   └── useBridge.ts          # Platform-agnostic bridge hook
│   │   ├── services/                  # Abstract service interfaces
│   │   │   ├── interfaces/           # Service contracts
│   │   │   │   ├── BridgeService.ts
│   │   │   │   ├── DatabaseService.ts
│   │   │   │   ├── StorageService.ts
│   │   │   │   ├── PlatformService.ts
│   │   │   │   ├── FileService.ts
│   │   │   │   └── ConfigService.ts
│   │   │   ├── ServiceFactory.ts     # Service instance factory
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
│   │   ├── platforms/                # Platform-specific implementations
│   │   │   ├── electron/
│   │   │   │   ├── ElectronBridge.ts
│   │   │   │   ├── ElectronDatabase.ts
│   │   │   │   ├── ElectronStorage.ts
│   │   │   │   ├── ElectronPlatform.ts
│   │   │   │   ├── ElectronFile.ts
│   │   │   │   └── ElectronConfig.ts
│   │   │   └── capacitor/           # Future mobile implementations
│   │   │       └── .gitkeep
│   │   ├── store/
│   │   │   ├── index.ts              # Zustand store setup
│   │   │   ├── slices/
│   │   │   │   ├── conversation.ts   # Conversation state
│   │   │   │   ├── agents.ts         # Agent state
│   │   │   │   ├── ui.ts             # UI state
│   │   │   │   └── settings.ts       # Settings state
│   │   │   └── types.ts
│   │   ├── utils/
│   │   │   ├── platform.ts           # Platform detection
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
│   ├── shared/                        # Shared between platforms
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
│   │   ├── database/
│   │   │   ├── schema.sql            # Shared schema definition
│   │   │   └── migrations/           # Platform-agnostic migrations
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
  emit(event: 'agent:responded', data: { agentId: string; message: string }): void;
  emit(event: 'agent:skipped', data: { agentId: string }): void;
  emit(event: 'agent:error', data: { agentId: string; error: Error }): void;
  emit(event: 'conversation:updated', data: { conversationId: string }): void;
  emit(event: 'mode:changed', data: { autoMode: boolean }): void;
  emit(event: 'mention:detected', data: { agentName: string; messageId: string }): void;
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

## Mobile-Ready Architecture Patterns

### Service Abstraction Layer

All platform-specific functionality is abstracted behind interfaces to enable future mobile support:

#### Service Factory Pattern

```typescript
// services/ServiceFactory.ts
import { Platform } from '@/utils/platform';
import type {
  BridgeService,
  DatabaseService,
  StorageService,
  PlatformService,
  FileService,
  ConfigService,
} from './interfaces';

export class ServiceFactory {
  private static instances = new Map<string, any>();

  static getBridgeService(): BridgeService {
    return this.getInstance('bridge', () => {
      if (Platform.isElectron()) {
        return new ElectronBridge();
      }
      // Future: return new CapacitorBridge();
      throw new Error('Platform not supported');
    });
  }

  static getDatabaseService(): DatabaseService {
    return this.getInstance('database', () => {
      if (Platform.isElectron()) {
        return new ElectronDatabase();
      }
      // Future: return new CapacitorDatabase();
      throw new Error('Platform not supported');
    });
  }

  static getStorageService(): StorageService {
    return this.getInstance('storage', () => {
      if (Platform.isElectron()) {
        return new ElectronStorage();
      }
      // Future: return new CapacitorStorage();
      throw new Error('Platform not supported');
    });
  }

  private static getInstance<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
    }
    return this.instances.get(key);
  }
}
```

#### Platform Detection

```typescript
// utils/platform.ts
export const Platform = {
  isElectron: (): boolean => {
    return !!(window as any).electron;
  },

  isCapacitor: (): boolean => {
    return !!(window as any).Capacitor;
  },

  isMobile: (): boolean => {
    if ((window as any).Capacitor) {
      const platform = (window as any).Capacitor.getPlatform();
      return platform === 'ios' || platform === 'android';
    }
    return false;
  },

  isWeb: (): boolean => {
    return !Platform.isElectron() && !Platform.isCapacitor();
  },

  getPlatform: (): 'electron' | 'capacitor' | 'web' | 'unknown' => {
    if (Platform.isElectron()) return 'electron';
    if (Platform.isCapacitor()) return 'capacitor';
    if (Platform.isWeb()) return 'web';
    return 'unknown';
  },
};
```

### Service Interfaces

#### Bridge Service (IPC Abstraction)

```typescript
// services/interfaces/BridgeService.ts
export interface BridgeService {
  // Invoke a command on the native side
  invoke<T = any>(channel: string, ...args: any[]): Promise<T>;

  // Listen for events from native side
  on(channel: string, callback: (...args: any[]) => void): void;

  // Remove event listener
  off(channel: string, callback: (...args: any[]) => void): void;

  // One-time event listener
  once(channel: string, callback: (...args: any[]) => void): void;
}
```

#### Database Service

```typescript
// services/interfaces/DatabaseService.ts
export interface DatabaseService {
  // Execute a query that returns results
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;

  // Execute a command (INSERT, UPDATE, DELETE)
  execute(sql: string, params?: any[]): Promise<void>;

  // Run multiple commands in a transaction
  transaction<T>(callback: (db: DatabaseService) => Promise<T>): Promise<T>;

  // Get the last inserted row ID
  getLastInsertId(): Promise<number>;

  // Run migrations
  migrate(migrations: Migration[]): Promise<void>;
}

export interface Migration {
  version: number;
  sql: string;
}
```

#### Storage Service (Secure Storage)

```typescript
// services/interfaces/StorageService.ts
export interface StorageService {
  // Store a secure value
  setSecure(key: string, value: string): Promise<void>;

  // Retrieve a secure value
  getSecure(key: string): Promise<string | null>;

  // Delete a secure value
  deleteSecure(key: string): Promise<void>;

  // Store a regular value
  set(key: string, value: any): Promise<void>;

  // Retrieve a regular value
  get<T = any>(key: string): Promise<T | null>;

  // Delete a regular value
  delete(key: string): Promise<void>;

  // Clear all storage
  clear(): Promise<void>;
}
```

#### Platform Service

```typescript
// services/interfaces/PlatformService.ts
export interface PlatformService {
  // App lifecycle
  minimizeApp(): void;
  maximizeApp(): void;
  closeApp(): void;
  restartApp(): void;

  // System info
  getVersion(): Promise<string>;
  getPlatform(): string;
  getSystemInfo(): Promise<SystemInfo>;

  // Notifications
  showNotification(title: string, body: string, options?: NotificationOptions): void;

  // Platform capabilities
  canMinimizeToTray(): boolean;
  canShowBadge(): boolean;
  canUseNativeMenus(): boolean;

  // Open external links
  openExternal(url: string): Promise<void>;
}

export interface SystemInfo {
  os: string;
  version: string;
  arch: string;
  memory: number;
}
```

#### File Service

```typescript
// services/interfaces/FileService.ts
export interface FileService {
  // Read a file
  readFile(path: string): Promise<string>;
  readFileBuffer(path: string): Promise<Uint8Array>;

  // Write a file
  writeFile(path: string, data: string | Uint8Array): Promise<void>;

  // File operations
  exists(path: string): Promise<boolean>;
  delete(path: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;

  // Directory operations
  createDir(path: string): Promise<void>;
  readDir(path: string): Promise<FileInfo[]>;

  // Get special directories
  getUserDataPath(): Promise<string>;
  getTempPath(): Promise<string>;
  getDownloadsPath(): Promise<string>;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  modified: Date;
}
```

#### Config Service

```typescript
// services/interfaces/ConfigService.ts
export interface ConfigService {
  // Load configuration files
  loadModels(): Promise<ModelConfig>;
  loadPersonalities(): Promise<PersonalityConfig[]>;
  loadRoles(): Promise<RoleConfig[]>;

  // Save configuration
  saveUserPreferences(prefs: UserPreferences): Promise<void>;
  loadUserPreferences(): Promise<UserPreferences>;

  // Get configuration paths
  getConfigPath(): Promise<string>;
}
```

### Platform Implementation Example

#### Electron Bridge Implementation

```typescript
// platforms/electron/ElectronBridge.ts
import type { BridgeService } from '@/services/interfaces/BridgeService';

export class ElectronBridge implements BridgeService {
  async invoke<T>(channel: string, ...args: any[]): Promise<T> {
    // Use Electron's IPC
    return window.api[channel](...args);
  }

  on(channel: string, callback: (...args: any[]) => void): void {
    window.api.on(channel, callback);
  }

  off(channel: string, callback: (...args: any[]) => void): void {
    window.api.off(channel, callback);
  }

  once(channel: string, callback: (...args: any[]) => void): void {
    window.api.once(channel, callback);
  }
}
```

### Usage in Components

Components should never directly access platform APIs:

```typescript
// components/Chat/ChatRoom.tsx
import { useEffect } from 'react';
import { ServiceFactory } from '@/services/ServiceFactory';

export function ChatRoom() {
  const bridge = ServiceFactory.getBridgeService();
  const database = ServiceFactory.getDatabaseService();

  useEffect(() => {
    // Load messages using abstracted service
    const loadMessages = async () => {
      const messages = await database.query<Message>(
        'SELECT * FROM messages WHERE conversation_id = ?',
        [conversationId],
      );
      setMessages(messages);
    };

    loadMessages();
  }, [conversationId]);

  const saveMessage = async (content: string) => {
    // Save through abstracted service
    await database.execute('INSERT INTO messages (content, conversation_id) VALUES (?, ?)', [
      content,
      conversationId,
    ]);
  };

  // Component logic using only abstracted services
}
```

### Mobile-Ready Guidelines

1. **Always use async APIs** - Even if Electron implementation is synchronous
2. **Abstract all native features** - No direct window.api or electron references in components
3. **Use responsive design** - Components should work on all screen sizes
4. **Touch-friendly targets** - Minimum 44x44px for interactive elements
5. **Platform-aware UI** - Use Platform utility to conditionally render platform-specific UI
6. **Bundle configurations** - JSON configs should be bundleable for mobile

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
