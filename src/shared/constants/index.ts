/**
 * Shared constants for the Fishbowl application
 */

// Application information
export const APP_NAME = 'Fishbowl';
export const APP_DESCRIPTION = 'Multi-Agent AI Conversations';
export const APP_VERSION = '1.0.0';

// Window configuration
export const WINDOW_CONFIG = {
  DEFAULT_WIDTH: 1200,
  DEFAULT_HEIGHT: 800,
  MIN_WIDTH: 800,
  MIN_HEIGHT: 600,
  MAX_WIDTH: 2560,
  MAX_HEIGHT: 1440,
} as const;

// Development configuration
export const DEV_CONFIG = {
  RENDERER_PORT: 5173,
  HOT_RELOAD_ENABLED: true,
  DEV_TOOLS_ENABLED: true,
} as const;

// IPC channel names
export const IPC_CHANNELS = {
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_FOCUS: 'window:focus',
  WINDOW_BLUR: 'window:blur',
  APP_GET_VERSION: 'app:getVersion',
} as const;

// File paths
export const PATHS = {
  RENDERER_HTML: 'src/renderer/index.html',
  PRELOAD_SCRIPT: 'src/preload/index.js',
  ASSETS: 'assets',
  DIST: 'dist',
  DIST_MAIN: 'dist/main',
  DIST_RENDERER: 'dist/renderer',
} as const;

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  DOCUMENTS: ['.pdf', '.txt', '.md', '.doc', '.docx'],
  AUDIO: ['.mp3', '.wav', '.flac', '.aac'],
  VIDEO: ['.mp4', '.avi', '.mov', '.mkv'],
} as const;

// Theme configuration
export const THEME_CONFIG = {
  THEMES: ['light', 'dark', 'system'] as const,
  DEFAULT_THEME: 'system' as const,
};

// Agent configuration (placeholder for future implementation)
export const AGENT_CONFIG = {
  MAX_AGENTS_PER_ROOM: 10,
  MAX_NAME_LENGTH: 50,
  MAX_PERSONALITY_LENGTH: 500,
  DEFAULT_ROLES: [
    'assistant',
    'analyst',
    'creative',
    'critic',
    'facilitator',
  ] as const,
};

// Message configuration (placeholder for future implementation)
export const MESSAGE_CONFIG = {
  MAX_MESSAGE_LENGTH: 10000,
  MAX_MESSAGES_PER_ROOM: 1000,
  TYPING_INDICATOR_TIMEOUT: 3000,
};

// Error codes
export const ERROR_CODES = {
  WINDOW_CREATE_FAILED: 'WINDOW_CREATE_FAILED',
  PRELOAD_SCRIPT_ERROR: 'PRELOAD_SCRIPT_ERROR',
  IPC_COMMUNICATION_ERROR: 'IPC_COMMUNICATION_ERROR',
  CONFIG_LOAD_ERROR: 'CONFIG_LOAD_ERROR',
  CONFIG_SAVE_ERROR: 'CONFIG_SAVE_ERROR',
  AGENT_CREATE_ERROR: 'AGENT_CREATE_ERROR',
  AGENT_UPDATE_ERROR: 'AGENT_UPDATE_ERROR',
  AGENT_DELETE_ERROR: 'AGENT_DELETE_ERROR',
  MESSAGE_SEND_ERROR: 'MESSAGE_SEND_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Time constants
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;
