'use strict';
/**
 * Shared constants for the Fishbowl application
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.TIME_CONSTANTS =
  exports.ERROR_CODES =
  exports.MESSAGE_CONFIG =
  exports.AGENT_CONFIG =
  exports.THEME_CONFIG =
  exports.SUPPORTED_FILE_TYPES =
  exports.PATHS =
  exports.IPC_CHANNELS =
  exports.DEV_CONFIG =
  exports.WINDOW_CONFIG =
  exports.APP_VERSION =
  exports.APP_DESCRIPTION =
  exports.APP_NAME =
    void 0;
// Application information
exports.APP_NAME = 'Fishbowl';
exports.APP_DESCRIPTION = 'Multi-Agent AI Conversations';
exports.APP_VERSION = '1.0.0';
// Window configuration
exports.WINDOW_CONFIG = {
  DEFAULT_WIDTH: 1200,
  DEFAULT_HEIGHT: 800,
  MIN_WIDTH: 800,
  MIN_HEIGHT: 600,
  MAX_WIDTH: 2560,
  MAX_HEIGHT: 1440,
};
// Development configuration
exports.DEV_CONFIG = {
  RENDERER_PORT: 5173,
  HOT_RELOAD_ENABLED: true,
  DEV_TOOLS_ENABLED: true,
};
// IPC channel names
exports.IPC_CHANNELS = {
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_FOCUS: 'window:focus',
  WINDOW_BLUR: 'window:blur',
  APP_GET_VERSION: 'app:getVersion',
};
// File paths
exports.PATHS = {
  RENDERER_HTML: 'src/renderer/index.html',
  PRELOAD_SCRIPT: 'src/preload/index.js',
  ASSETS: 'assets',
  DIST: 'dist',
  DIST_MAIN: 'dist/main',
  DIST_RENDERER: 'dist/renderer',
};
// Supported file types
exports.SUPPORTED_FILE_TYPES = {
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  DOCUMENTS: ['.pdf', '.txt', '.md', '.doc', '.docx'],
  AUDIO: ['.mp3', '.wav', '.flac', '.aac'],
  VIDEO: ['.mp4', '.avi', '.mov', '.mkv'],
};
// Theme configuration
exports.THEME_CONFIG = {
  THEMES: ['light', 'dark', 'system'],
  DEFAULT_THEME: 'system',
};
// Agent configuration (placeholder for future implementation)
exports.AGENT_CONFIG = {
  MAX_AGENTS_PER_ROOM: 10,
  MAX_NAME_LENGTH: 50,
  MAX_PERSONALITY_LENGTH: 500,
  DEFAULT_ROLES: ['assistant', 'analyst', 'creative', 'critic', 'facilitator'],
};
// Message configuration (placeholder for future implementation)
exports.MESSAGE_CONFIG = {
  MAX_MESSAGE_LENGTH: 10000,
  MAX_MESSAGES_PER_ROOM: 1000,
  TYPING_INDICATOR_TIMEOUT: 3000,
};
// Error codes
exports.ERROR_CODES = {
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
};
// Time constants
exports.TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
};
