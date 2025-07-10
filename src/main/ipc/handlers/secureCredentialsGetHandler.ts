import type { IpcMainInvokeEvent } from 'electron';
import type { AiProvider, CredentialInfo } from '../../../shared/types';
import { credentialManager } from '../../secure-storage';
import { SecureStorageError } from '../../../shared/types/errors';

export const secureCredentialsGetHandler = async (
  _event: IpcMainInvokeEvent,
  provider: AiProvider,
): Promise<CredentialInfo | null> => {
  try {
    return await credentialManager.getCredential(provider);
  } catch (error) {
    throw new SecureStorageError(
      `Failed to get credentials for provider ${provider}`,
      'getCredentials',
      'secure:credentials',
      error,
    );
  }
};
