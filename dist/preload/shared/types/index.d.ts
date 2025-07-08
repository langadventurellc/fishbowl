/**
 * Shared type definitions for the Fishbowl application
 */
export interface IpcChannels {
  'window:minimize': () => void;
  'window:maximize': () => void;
  'window:close': () => void;
  'window:focus': () => void;
  'window:blur': () => void;
  'app:getVersion': () => Promise<string>;
}
export interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
}
export interface AppConfig {
  window: WindowState;
  theme: 'light' | 'dark' | 'system';
  autoUpdater: {
    enabled: boolean;
    checkInterval: number;
  };
}
export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}
export interface Message {
  id: string;
  agentId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
  metadata?: Record<string, unknown>;
}
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
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: number;
}
export type AppEvent =
  | {
      type: 'WINDOW_FOCUS';
    }
  | {
      type: 'WINDOW_BLUR';
    }
  | {
      type: 'WINDOW_RESIZE';
      payload: {
        width: number;
        height: number;
      };
    }
  | {
      type: 'AGENT_CREATED';
      payload: Agent;
    }
  | {
      type: 'AGENT_UPDATED';
      payload: Agent;
    }
  | {
      type: 'AGENT_DELETED';
      payload: {
        id: string;
      };
    }
  | {
      type: 'MESSAGE_SENT';
      payload: Message;
    }
  | {
      type: 'MESSAGE_RECEIVED';
      payload: Message;
    }
  | {
      type: 'ERROR_OCCURRED';
      payload: AppError;
    };
