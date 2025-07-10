import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CredentialManager } from '../../../../src/main/secure-storage/CredentialManager';
import { SecureStorage } from '../../../../src/main/secure-storage/SecureStorage';
import { SecureStorageError } from '../../../../src/shared/types/errors';
import type { SecureStorageCredential } from '../../../../src/shared/types';

// Mock SecureStorage
vi.mock('../../../../src/main/secure-storage/SecureStorage');

describe('CredentialManager', () => {
  let credentialManager: CredentialManager;
  let mockSecureStorage: any;

  beforeEach(() => {
    mockSecureStorage = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      findCredentials: vi.fn(),
    };

    // Mock the SecureStorage constructor
    (SecureStorage as any).mockImplementation(() => mockSecureStorage);

    credentialManager = new CredentialManager();
  });

  describe('getCredential', () => {
    it('should return credential info when credential exists', async () => {
      const mockCredential: SecureStorageCredential = {
        provider: 'openai',
        apiKey: 'test-key',
        metadata: { lastUpdated: 1234567890 },
      };
      mockSecureStorage.get.mockResolvedValue(JSON.stringify(mockCredential));

      const result = await credentialManager.getCredential('openai');

      expect(result).toEqual({
        provider: 'openai',
        hasApiKey: true,
        lastUpdated: 1234567890,
        metadata: { lastUpdated: 1234567890 },
      });
    });

    it('should return null when credential does not exist', async () => {
      mockSecureStorage.get.mockResolvedValue(null);

      const result = await credentialManager.getCredential('openai');

      expect(result).toBeNull();
    });

    it('should throw SecureStorageError when secure storage fails', async () => {
      mockSecureStorage.get.mockRejectedValue(new Error('Storage error'));

      await expect(credentialManager.getCredential('openai')).rejects.toThrow(SecureStorageError);
    });

    it('should throw SecureStorageError when JSON parsing fails', async () => {
      mockSecureStorage.get.mockResolvedValue('invalid-json');

      await expect(credentialManager.getCredential('openai')).rejects.toThrow(SecureStorageError);
    });
  });

  describe('setCredential', () => {
    it('should set credential successfully', async () => {
      mockSecureStorage.set.mockResolvedValue(undefined);

      await credentialManager.setCredential('openai', 'test-key', { custom: 'metadata' });

      expect(mockSecureStorage.set).toHaveBeenCalledWith(
        'fishbowl-ai-keys',
        'openai',
        expect.stringContaining('"provider":"openai"'),
      );
    });

    it('should set credential with default metadata', async () => {
      mockSecureStorage.set.mockResolvedValue(undefined);

      await credentialManager.setCredential('openai', 'test-key');

      expect(mockSecureStorage.set).toHaveBeenCalledWith(
        'fishbowl-ai-keys',
        'openai',
        expect.stringContaining('"lastUpdated"'),
      );
    });

    it('should throw SecureStorageError when secure storage fails', async () => {
      mockSecureStorage.set.mockRejectedValue(new Error('Storage error'));

      await expect(credentialManager.setCredential('openai', 'test-key')).rejects.toThrow(
        SecureStorageError,
      );
    });
  });

  describe('deleteCredential', () => {
    it('should delete credential successfully', async () => {
      mockSecureStorage.delete.mockResolvedValue(undefined);

      await credentialManager.deleteCredential('openai');

      expect(mockSecureStorage.delete).toHaveBeenCalledWith('fishbowl-ai-keys', 'openai');
    });

    it('should throw SecureStorageError when secure storage fails', async () => {
      mockSecureStorage.delete.mockRejectedValue(new Error('Storage error'));

      await expect(credentialManager.deleteCredential('openai')).rejects.toThrow(
        SecureStorageError,
      );
    });
  });

  describe('listCredentials', () => {
    it('should list all credentials successfully', async () => {
      const mockCredentials = [
        {
          account: 'openai',
          password: JSON.stringify({
            provider: 'openai',
            apiKey: 'key1',
            metadata: { lastUpdated: 1234567890 },
          }),
        },
        {
          account: 'anthropic',
          password: JSON.stringify({
            provider: 'anthropic',
            apiKey: 'key2',
            metadata: { lastUpdated: 1234567891 },
          }),
        },
      ];
      mockSecureStorage.findCredentials.mockResolvedValue(mockCredentials);

      const result = await credentialManager.listCredentials();

      expect(result).toEqual([
        {
          provider: 'openai',
          hasApiKey: true,
          lastUpdated: 1234567890,
          metadata: { lastUpdated: 1234567890 },
        },
        {
          provider: 'anthropic',
          hasApiKey: true,
          lastUpdated: 1234567891,
          metadata: { lastUpdated: 1234567891 },
        },
      ]);
    });

    it('should skip invalid credentials', async () => {
      const mockCredentials = [
        {
          account: 'openai',
          password: JSON.stringify({
            provider: 'openai',
            apiKey: 'key1',
            metadata: { lastUpdated: 1234567890 },
          }),
        },
        {
          account: 'invalid',
          password: 'invalid-json',
        },
      ];
      mockSecureStorage.findCredentials.mockResolvedValue(mockCredentials);

      const result = await credentialManager.listCredentials();

      expect(result).toHaveLength(1);
      expect(result[0].provider).toBe('openai');
    });

    it('should throw SecureStorageError when secure storage fails', async () => {
      mockSecureStorage.findCredentials.mockRejectedValue(new Error('Storage error'));

      await expect(credentialManager.listCredentials()).rejects.toThrow(SecureStorageError);
    });
  });

  describe('hasCredential', () => {
    it('should return true when credential exists', async () => {
      const mockCredential: SecureStorageCredential = {
        provider: 'openai',
        apiKey: 'test-key',
        metadata: { lastUpdated: 1234567890 },
      };
      mockSecureStorage.get.mockResolvedValue(JSON.stringify(mockCredential));

      const result = await credentialManager.hasCredential('openai');

      expect(result).toBe(true);
    });

    it('should return false when credential does not exist', async () => {
      mockSecureStorage.get.mockResolvedValue(null);

      const result = await credentialManager.hasCredential('openai');

      expect(result).toBe(false);
    });

    it('should throw SecureStorageError when secure storage fails', async () => {
      mockSecureStorage.get.mockRejectedValue(new Error('Storage error'));

      await expect(credentialManager.hasCredential('openai')).rejects.toThrow(SecureStorageError);
    });
  });

  describe('getApiKey', () => {
    it('should return API key when credential exists', async () => {
      const mockCredential: SecureStorageCredential = {
        provider: 'openai',
        apiKey: 'test-key',
        metadata: { lastUpdated: 1234567890 },
      };
      mockSecureStorage.get.mockResolvedValue(JSON.stringify(mockCredential));

      const result = await credentialManager.getApiKey('openai');

      expect(result).toBe('test-key');
    });

    it('should return null when credential does not exist', async () => {
      mockSecureStorage.get.mockResolvedValue(null);

      const result = await credentialManager.getApiKey('openai');

      expect(result).toBeNull();
    });

    it('should throw SecureStorageError when secure storage fails', async () => {
      mockSecureStorage.get.mockRejectedValue(new Error('Storage error'));

      await expect(credentialManager.getApiKey('openai')).rejects.toThrow(SecureStorageError);
    });
  });

  describe('storage getter', () => {
    it('should return the secure storage instance', () => {
      const storage = credentialManager.storage;
      expect(storage).toBe(mockSecureStorage);
    });
  });
});
