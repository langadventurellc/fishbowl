import keytar from 'keytar';
import { SecureStorageError } from '../../shared/types/errors';
import type { SecureStorageInterface } from './SecureStorageInterface';

/**
 * Secure storage implementation using keytar
 * Handles secure storage operations with error handling
 */
export class SecureStorage implements SecureStorageInterface {
  private readonly serviceName: string;

  constructor(serviceName: string = 'fishbowl') {
    this.serviceName = serviceName;
  }

  /**
   * Get password from secure storage
   */
  async get(service: string, account: string): Promise<string | null> {
    try {
      return await keytar.getPassword(service, account);
    } catch (error) {
      throw new SecureStorageError(
        `Failed to retrieve password for ${service}:${account}`,
        'get',
        service,
        error,
      );
    }
  }

  /**
   * Set password in secure storage
   */
  async set(service: string, account: string, password: string): Promise<void> {
    try {
      await keytar.setPassword(service, account, password);
    } catch (error) {
      throw new SecureStorageError(
        `Failed to store password for ${service}:${account}`,
        'set',
        service,
        error,
      );
    }
  }

  /**
   * Delete password from secure storage
   */
  async delete(service: string, account: string): Promise<void> {
    try {
      const deleted = await keytar.deletePassword(service, account);
      if (!deleted) {
        throw new SecureStorageError(
          `Password not found for ${service}:${account}`,
          'delete',
          service,
        );
      }
    } catch (error) {
      if (error instanceof SecureStorageError) {
        throw error;
      }
      throw new SecureStorageError(
        `Failed to delete password for ${service}:${account}`,
        'delete',
        service,
        error,
      );
    }
  }

  /**
   * Find all credentials for a service
   */
  async findCredentials(service: string): Promise<Array<{ account: string; password: string }>> {
    try {
      return await keytar.findCredentials(service);
    } catch (error) {
      throw new SecureStorageError(
        `Failed to find credentials for service ${service}`,
        'find',
        service,
        error,
      );
    }
  }

  /**
   * Find password for a specific service
   */
  async findPassword(service: string): Promise<string | null> {
    try {
      return await keytar.findPassword(service);
    } catch (error) {
      throw new SecureStorageError(
        `Failed to find password for service ${service}`,
        'findPassword',
        service,
        error,
      );
    }
  }
}
