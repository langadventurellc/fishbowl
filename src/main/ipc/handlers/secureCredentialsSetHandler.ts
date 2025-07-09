import type { IpcMainInvokeEvent } from 'electron';
import type { AiProvider } from '../../../shared/types';
import { credentialManager } from '../../secure-storage';
import { SecureStorageError } from '../../../shared/types/errors';

export const secureCredentialsSetHandler = async (
  _event: IpcMainInvokeEvent,
  provider: AiProvider,
  apiKey: string,
  metadata?: Record<string, unknown>,
): Promise<void> => {
  try {
    await credentialManager.setCredential(provider, apiKey, metadata);
  } catch (error) {
    throw new SecureStorageError(
      `Failed to set credentials for provider ${provider}`,
      'setCredentials',
      'secure:credentials',
      error,
    );
  }
};
