import type { IpcMainInvokeEvent } from 'electron';
import { credentialManager } from '../../secure-storage';
import { SecureStorageError } from '../../../shared/types/errors';

export const secureKeytarSetHandler = async (
  _event: IpcMainInvokeEvent,
  service: string,
  account: string,
  password: string,
): Promise<void> => {
  try {
    await credentialManager.storage.set(service, account, password);
  } catch (error) {
    throw new SecureStorageError(
      `Failed to set keytar value for ${service}:${account}`,
      'set',
      service,
      error,
    );
  }
};
