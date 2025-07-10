import type { CredentialInfo } from '../../../shared/types';
import { credentialManager } from '../../secure-storage';
import { SecureStorageError } from '../../../shared/types/errors';

export const secureCredentialsListHandler = async (): Promise<CredentialInfo[]> => {
  try {
    return await credentialManager.listCredentials();
  } catch (error) {
    throw new SecureStorageError(
      'Failed to list credentials',
      'listCredentials',
      'secure:credentials',
      error,
    );
  }
};
