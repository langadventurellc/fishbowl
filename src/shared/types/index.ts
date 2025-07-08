/**
 * Shared type definitions for the Fishbowl application
 */

// IPC Channel definitions
export interface IpcChannels {
  // Window controls
  'window:minimize': () => void;
  'window:maximize': () => void;
  'window:close': () => void;
  'window:focus': () => void;
  'window:blur': () => void;

  // Application
  'app:getVersion': () => Promise<string>;
}

// Window state
export interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
}

// Application configuration
export interface AppConfig {
  window: WindowState;
  theme: 'light' | 'dark' | 'system';
  autoUpdater: {
    enabled: boolean;
    checkInterval: number;
  };
}

// Agent types (placeholder for future implementation)
export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Message types (placeholder for future implementation)
export interface Message {
  id: string;
  agentId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
  metadata?: Record<string, unknown>;
}

// Chat room types (placeholder for future implementation)
export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  agents: Agent[];
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: number;
}

// Event types
export type AppEvent =
  | { type: 'WINDOW_FOCUS' }
  | { type: 'WINDOW_BLUR' }
  | { type: 'WINDOW_RESIZE'; payload: { width: number; height: number } }
  | { type: 'AGENT_CREATED'; payload: Agent }
  | { type: 'AGENT_UPDATED'; payload: Agent }
  | { type: 'AGENT_DELETED'; payload: { id: string } }
  | { type: 'MESSAGE_SENT'; payload: Message }
  | { type: 'MESSAGE_RECEIVED'; payload: Message }
  | { type: 'ERROR_OCCURRED'; payload: AppError };
