/**
 * Type guard to validate IPC channel names
 */

import type { IpcChannels } from '../../types';

export const isValidChannel = (channel: string): channel is keyof IpcChannels => {
  const validChannels: (keyof IpcChannels)[] = [
    'window:minimize',
    'window:maximize',
    'window:close',
    'app:getVersion',
    'system:getInfo',
    'system:platform',
    'system:arch',
    'system:version',
    'config:get',
    'config:set',
    'theme:get',
    'theme:set',
    'dev:isDev',
    'dev:openDevTools',
    'dev:closeDevTools',
  ];
  return validChannels.includes(channel as keyof IpcChannels);
};
