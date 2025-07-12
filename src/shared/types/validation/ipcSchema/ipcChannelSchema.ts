import { z } from 'zod';

/**
 * Zod schema for IPC channel names
 */
export const IpcChannelSchema = z.enum([
  // Window controls
  'window:minimize',
  'window:maximize',
  'window:close',
  // Application
  'app:getVersion',
  // System
  'system:getInfo',
  'system:platform',
  'system:arch',
  'system:version',
  // Configuration
  'config:get',
  'config:set',
  // Theme
  'theme:get',
  'theme:set',
  // Development
  'dev:isDev',
  'dev:openDevTools',
  'dev:closeDevTools',
  // Database operations (new)
  'db:agents:list',
  'db:agents:get',
  'db:agents:create',
  'db:agents:update',
  'db:agents:delete',
  'db:conversations:list',
  'db:conversations:get',
  'db:conversations:create',
  'db:conversations:update',
  'db:conversations:delete',
  'db:messages:list',
  'db:messages:get',
  'db:messages:create',
  'db:messages:delete',
  'db:messages:update-active-state',
  'db:messages:toggle-active-state',
  'db:conversation-agents:list',
  'db:conversation-agents:add',
  'db:conversation-agents:remove',
  // Secure storage operations (new)
  'secure:credentials:get',
  'secure:credentials:set',
  'secure:credentials:delete',
  'secure:credentials:list',
  'secure:keytar:get',
  'secure:keytar:set',
  'secure:keytar:delete',
]);
