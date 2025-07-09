import type { IpcMainInvokeEvent } from 'electron';
import type { AiProvider } from '../../../shared/types';
import { credentialManager } from '../../secure-storage';
import { SecureStorageError } from '../../../shared/types/errors';

export const secureCredentialsDeleteHandler = async (
  _event: IpcMainInvokeEvent,
  provider: AiProvider,
): Promise<void> => {
  try {
    await credentialManager.deleteCredential(provider);
  } catch (error) {
    throw new SecureStorageError(
      `Failed to delete credentials for provider ${provider}`,
      'deleteCredentials',
      'secure:credentials',
      error,
    );
  }
};
