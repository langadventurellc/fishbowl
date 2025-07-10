import type { IpcMainInvokeEvent } from 'electron';
import { credentialManager } from '../../secure-storage';
import { SecureStorageError } from '../../../shared/types/errors';

export const secureKeytarDeleteHandler = async (
  _event: IpcMainInvokeEvent,
  service: string,
  account: string,
): Promise<void> => {
  try {
    await credentialManager.storage.delete(service, account);
  } catch (error) {
    throw new SecureStorageError(
      `Failed to delete keytar value for ${service}:${account}`,
      'delete',
      service,
      error,
    );
  }
};
