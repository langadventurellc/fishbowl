import type { IpcMainInvokeEvent } from 'electron';
import { credentialManager } from '../../secure-storage';
import { SecureStorageError } from '../../../shared/types/errors';

export const secureKeytarGetHandler = async (
  _event: IpcMainInvokeEvent,
  service: string,
  account: string,
): Promise<string | null> => {
  try {
    return await credentialManager.storage.get(service, account);
  } catch (error) {
    throw new SecureStorageError(
      `Failed to get keytar value for ${service}:${account}`,
      'get',
      service,
      error,
    );
  }
};
