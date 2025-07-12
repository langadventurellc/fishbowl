import { z } from 'zod';
import { IpcChannelSchema } from './ipcChannelSchema';

/**
 * Zod schema for IPC request envelope
 */
export const IpcRequestSchema = z.object({
  channel: IpcChannelSchema,
  data: z.any().optional(),
  requestId: z.string().uuid().optional(),
});
