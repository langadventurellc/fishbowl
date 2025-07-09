import { z } from 'zod';

/**
 * Validate IPC channel name
 */
const channelNameSchema = z.string().regex(/^[a-zA-Z0-9:_-]+$/);

export const validateChannelName = (channel: string): boolean => {
  try {
    channelNameSchema.parse(channel);
    return true;
  } catch {
    return false;
  }
};
