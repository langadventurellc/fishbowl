/**
 * Validation helpers for IPC arguments
 */

import type { IpcChannels } from '../../types';
import { isValidChannel } from './channel-validator';
import { IpcError } from './ipc-error';

export const validateChannelArgs = <T extends keyof IpcChannels>(
  channel: T,
  args: Parameters<IpcChannels[T]>,
): void => {
  if (!isValidChannel(channel)) {
    const channelStr = String(channel);
    throw new IpcError(`Invalid IPC channel: ${channelStr}`, channelStr);
  }

  // Channel-specific validation
  switch (channel) {
    case 'config:get':
    case 'config:set':
      if (args.length === 0) {
        throw new IpcError(`Missing required arguments for ${channel}`, channel);
      }
      break;
    case 'theme:set':
      if (args.length !== 1 || !['light', 'dark', 'system'].includes(args[0] as string)) {
        throw new IpcError(`Invalid theme value for ${channel}`, channel);
      }
      break;
    default:
      // No specific validation needed for other channels
      break;
  }
};
