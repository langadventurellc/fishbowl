import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SecureStorage } from '../../../../src/main/secure-storage/SecureStorage';
import { SecureStorageError } from '../../../../src/shared/types/errors';
import keytar from 'keytar';

// Mock keytar
vi.mock('keytar', () => ({
  default: {
    getPassword: vi.fn(),
    setPassword: vi.fn(),
    deletePassword: vi.fn(),
    findCredentials: vi.fn(),
    findPassword: vi.fn(),
  },
}));

describe('SecureStorage', () => {
  let secureStorage: SecureStorage;
  const mockKeytar = keytar as any;

  beforeEach(() => {
    secureStorage = new SecureStorage();
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should retrieve password successfully', async () => {
      const testPassword = 'test-password';
      mockKeytar.getPassword.mockResolvedValue(testPassword);

      const result = await secureStorage.get('test-service', 'test-account');

      expect(result).toBe(testPassword);
      expect(mockKeytar.getPassword).toHaveBeenCalledWith('test-service', 'test-account');
    });

    it('should return null when password not found', async () => {
      mockKeytar.getPassword.mockResolvedValue(null);

      const result = await secureStorage.get('test-service', 'test-account');

      expect(result).toBeNull();
    });

    it('should throw SecureStorageError when keytar fails', async () => {
      const error = new Error('Keytar error');
      mockKeytar.getPassword.mockRejectedValue(error);

      await expect(secureStorage.get('test-service', 'test-account')).rejects.toThrow(
        SecureStorageError,
      );
    });
  });

  describe('set', () => {
    it('should set password successfully', async () => {
      mockKeytar.setPassword.mockResolvedValue(undefined);

      await secureStorage.set('test-service', 'test-account', 'test-password');

      expect(mockKeytar.setPassword).toHaveBeenCalledWith(
        'test-service',
        'test-account',
        'test-password',
      );
    });

    it('should throw SecureStorageError when keytar fails', async () => {
      const error = new Error('Keytar error');
      mockKeytar.setPassword.mockRejectedValue(error);

      await expect(
        secureStorage.set('test-service', 'test-account', 'test-password'),
      ).rejects.toThrow(SecureStorageError);
    });
  });

  describe('delete', () => {
    it('should delete password successfully', async () => {
      mockKeytar.deletePassword.mockResolvedValue(true);

      await secureStorage.delete('test-service', 'test-account');

      expect(mockKeytar.deletePassword).toHaveBeenCalledWith('test-service', 'test-account');
    });

    it('should throw SecureStorageError when password not found', async () => {
      mockKeytar.deletePassword.mockResolvedValue(false);

      await expect(secureStorage.delete('test-service', 'test-account')).rejects.toThrow(
        SecureStorageError,
      );
    });

    it('should throw SecureStorageError when keytar fails', async () => {
      const error = new Error('Keytar error');
      mockKeytar.deletePassword.mockRejectedValue(error);

      await expect(secureStorage.delete('test-service', 'test-account')).rejects.toThrow(
        SecureStorageError,
      );
    });
  });

  describe('findCredentials', () => {
    it('should find credentials successfully', async () => {
      const mockCredentials = [
        { account: 'account1', password: 'password1' },
        { account: 'account2', password: 'password2' },
      ];
      mockKeytar.findCredentials.mockResolvedValue(mockCredentials);

      const result = await secureStorage.findCredentials('test-service');

      expect(result).toEqual(mockCredentials);
      expect(mockKeytar.findCredentials).toHaveBeenCalledWith('test-service');
    });

    it('should throw SecureStorageError when keytar fails', async () => {
      const error = new Error('Keytar error');
      mockKeytar.findCredentials.mockRejectedValue(error);

      await expect(secureStorage.findCredentials('test-service')).rejects.toThrow(
        SecureStorageError,
      );
    });
  });

  describe('findPassword', () => {
    it('should find password successfully', async () => {
      const testPassword = 'test-password';
      mockKeytar.findPassword.mockResolvedValue(testPassword);

      const result = await secureStorage.findPassword('test-service');

      expect(result).toBe(testPassword);
      expect(mockKeytar.findPassword).toHaveBeenCalledWith('test-service');
    });

    it('should return null when password not found', async () => {
      mockKeytar.findPassword.mockResolvedValue(null);

      const result = await secureStorage.findPassword('test-service');

      expect(result).toBeNull();
    });

    it('should throw SecureStorageError when keytar fails', async () => {
      const error = new Error('Keytar error');
      mockKeytar.findPassword.mockRejectedValue(error);

      await expect(secureStorage.findPassword('test-service')).rejects.toThrow(SecureStorageError);
    });
  });
});
