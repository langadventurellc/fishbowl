/**
 * Shared constants for the Fishbowl application
 */
export declare const APP_NAME = 'Fishbowl';
export declare const APP_DESCRIPTION = 'Multi-Agent AI Conversations';
export declare const APP_VERSION = '1.0.0';
export declare const WINDOW_CONFIG: {
  readonly DEFAULT_WIDTH: 1200;
  readonly DEFAULT_HEIGHT: 800;
  readonly MIN_WIDTH: 800;
  readonly MIN_HEIGHT: 600;
  readonly MAX_WIDTH: 2560;
  readonly MAX_HEIGHT: 1440;
};
export declare const DEV_CONFIG: {
  readonly RENDERER_PORT: 5173;
  readonly HOT_RELOAD_ENABLED: true;
  readonly DEV_TOOLS_ENABLED: true;
};
export declare const IPC_CHANNELS: {
  readonly WINDOW_MINIMIZE: 'window:minimize';
  readonly WINDOW_MAXIMIZE: 'window:maximize';
  readonly WINDOW_CLOSE: 'window:close';
  readonly WINDOW_FOCUS: 'window:focus';
  readonly WINDOW_BLUR: 'window:blur';
  readonly APP_GET_VERSION: 'app:getVersion';
};
export declare const PATHS: {
  readonly RENDERER_HTML: 'src/renderer/index.html';
  readonly PRELOAD_SCRIPT: 'src/preload/index.js';
  readonly ASSETS: 'assets';
  readonly DIST: 'dist';
  readonly DIST_MAIN: 'dist/main';
  readonly DIST_RENDERER: 'dist/renderer';
};
export declare const SUPPORTED_FILE_TYPES: {
  readonly IMAGES: readonly ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  readonly DOCUMENTS: readonly ['.pdf', '.txt', '.md', '.doc', '.docx'];
  readonly AUDIO: readonly ['.mp3', '.wav', '.flac', '.aac'];
  readonly VIDEO: readonly ['.mp4', '.avi', '.mov', '.mkv'];
};
export declare const THEME_CONFIG: {
  THEMES: readonly ['light', 'dark', 'system'];
  DEFAULT_THEME: 'system';
};
export declare const AGENT_CONFIG: {
  MAX_AGENTS_PER_ROOM: number;
  MAX_NAME_LENGTH: number;
  MAX_PERSONALITY_LENGTH: number;
  DEFAULT_ROLES: readonly ['assistant', 'analyst', 'creative', 'critic', 'facilitator'];
};
export declare const MESSAGE_CONFIG: {
  MAX_MESSAGE_LENGTH: number;
  MAX_MESSAGES_PER_ROOM: number;
  TYPING_INDICATOR_TIMEOUT: number;
};
export declare const ERROR_CODES: {
  readonly WINDOW_CREATE_FAILED: 'WINDOW_CREATE_FAILED';
  readonly PRELOAD_SCRIPT_ERROR: 'PRELOAD_SCRIPT_ERROR';
  readonly IPC_COMMUNICATION_ERROR: 'IPC_COMMUNICATION_ERROR';
  readonly CONFIG_LOAD_ERROR: 'CONFIG_LOAD_ERROR';
  readonly CONFIG_SAVE_ERROR: 'CONFIG_SAVE_ERROR';
  readonly AGENT_CREATE_ERROR: 'AGENT_CREATE_ERROR';
  readonly AGENT_UPDATE_ERROR: 'AGENT_UPDATE_ERROR';
  readonly AGENT_DELETE_ERROR: 'AGENT_DELETE_ERROR';
  readonly MESSAGE_SEND_ERROR: 'MESSAGE_SEND_ERROR';
  readonly UNKNOWN_ERROR: 'UNKNOWN_ERROR';
};
export declare const TIME_CONSTANTS: {
  readonly SECOND: 1000;
  readonly MINUTE: number;
  readonly HOUR: number;
  readonly DAY: number;
  readonly WEEK: number;
};
