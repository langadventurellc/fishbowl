import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock IPC main handlers
import { ipcMain } from 'electron';

// Mock keytar
vi.mock('keytar', () => ({
  setPassword: vi.fn(),
  getPassword: vi.fn(),
  deletePassword: vi.fn(),
  findCredentials: vi.fn(),
  findPassword: vi.fn(),
}));

// Mock database system
vi.mock('better-sqlite3', () => {
  const mockDb = {
    pragma: vi.fn(),
    prepare: vi.fn(),
    exec: vi.fn(),
    close: vi.fn(),
    transaction: vi.fn(),
  };
  return {
    default: vi.fn(() => mockDb),
  };
});

// Mock database connection
vi.mock('../../src/main/database/connection', () => {
  const mockDb = {
    pragma: vi.fn(),
    prepare: vi.fn(),
    exec: vi.fn(),
    close: vi.fn(),
    transaction: vi.fn(),
  };
  return {
    initializeDatabase: vi.fn(() => mockDb),
    getDatabase: vi.fn(() => mockDb),
    closeDatabase: vi.fn(),
  };
});

// Mock database state
vi.mock('../../src/main/database/connection/state', () => ({
  databaseState: {
    getInstance: vi.fn(),
    setInstance: vi.fn(),
  },
}));

// Mock file system operations
vi.mock('fs', () => ({
  default: {},
  existsSync: vi.fn(() => false),
  readFileSync: vi.fn(() => '{}'),
  writeFileSync: vi.fn(),
}));

// Mock credential manager
vi.mock('../../src/main/secure-storage', () => ({
  credentialManager: {
    storage: {
      set: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      find: vi.fn(),
    },
    setCredential: vi.fn(),
    getCredential: vi.fn(),
    deleteCredential: vi.fn(),
    listCredentials: vi.fn(),
  },
}));

import * as keytar from 'keytar';
import { credentialManager } from '../../src/main/secure-storage';
import type { AiProvider } from '../../src/shared/types';

// Import the handlers we want to test
import { setupIpcHandlers } from '@main/ipc/handlers';

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  app: {
    getName: vi.fn(() => 'fishbowl-test'),
    getPath: vi.fn((name: string) => `/tmp/test-${name}`),
    isPackaged: false,
  },
}));

describe('IPC Secure Storage Integration Tests', () => {
  const mockIpcHandlers = new Map<string, (...args: unknown[]) => Promise<unknown>>();
  const testProviders = ['openai', 'anthropic', 'google', 'groq', 'ollama'] as const;

  beforeEach(() => {
    // Reset handler map
    mockIpcHandlers.clear();

    // Mock ipcMain.handle to capture registered handlers
    vi.mocked(ipcMain.handle).mockImplementation(
      (channel: string, handler: (event: any, ...args: any[]) => any) => {
        // Wrap handler to match expected signature
        mockIpcHandlers.set(channel, (...args: unknown[]) => {
          return Promise.resolve(handler({}, ...args));
        });
      },
    );

    // Reset keytar mocks
    vi.mocked(keytar.setPassword).mockResolvedValue();
    vi.mocked(keytar.getPassword).mockResolvedValue(null);
    vi.mocked(keytar.deletePassword).mockResolvedValue(true);
    vi.mocked(keytar.findCredentials).mockResolvedValue([]);

    // Reset credential manager mocks
    vi.mocked(credentialManager.storage.set).mockResolvedValue(undefined);
    vi.mocked(credentialManager.storage.get).mockResolvedValue(null);
    vi.mocked(credentialManager.storage.delete).mockResolvedValue(undefined);
    vi.mocked(credentialManager.setCredential).mockResolvedValue(undefined);
    vi.mocked(credentialManager.getCredential).mockResolvedValue(null);
    vi.mocked(credentialManager.deleteCredential).mockResolvedValue(undefined);
    vi.mocked(credentialManager.listCredentials).mockResolvedValue([]);

    // Register handlers
    setupIpcHandlers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Keytar Operations Integration', () => {
    it('should handle complete keytar lifecycle through IPC', async () => {
      const service = 'test-service';
      const account = 'test-account';
      const password = 'test-password';

      // Set password
      const setHandler = mockIpcHandlers.get('secure:keytar:set');
      expect(setHandler).toBeDefined();

      vi.mocked(credentialManager.storage.set).mockResolvedValueOnce(undefined);
      const setResult = await setHandler!(service, account, password);

      expect(setResult).toBeUndefined(); // setHandler returns void
      expect(credentialManager.storage.set).toHaveBeenCalledWith(service, account, password);

      // Get password
      const getHandler = mockIpcHandlers.get('secure:keytar:get');
      expect(getHandler).toBeDefined();

      vi.mocked(credentialManager.storage.get).mockResolvedValueOnce(password);
      const getResult = await getHandler!(service, account);

      expect(getResult).toBe(password);
      expect(credentialManager.storage.get).toHaveBeenCalledWith(service, account);

      // Delete password
      const deleteHandler = mockIpcHandlers.get('secure:keytar:delete');
      expect(deleteHandler).toBeDefined();

      vi.mocked(credentialManager.storage.delete).mockResolvedValueOnce(undefined);
      const deleteResult = await deleteHandler!(service, account);

      expect(deleteResult).toBeUndefined();
      expect(credentialManager.storage.delete).toHaveBeenCalledWith(service, account);

      // Verify deletion
      vi.mocked(credentialManager.storage.get).mockResolvedValueOnce(null);
      const getDeletedResult = await getHandler!(service, account);

      expect(getDeletedResult).toBeNull();
    });

    it('should validate keytar input parameters', async () => {
      const setHandler = mockIpcHandlers.get('secure:keytar:set');

      // Mock validation failures
      vi.mocked(credentialManager.storage.set).mockImplementation((service, account, password) => {
        if (!service || !account || !password) {
          return Promise.reject(new Error('Invalid parameters'));
        }
        return Promise.resolve();
      });

      // Test empty service - should throw SecureStorageError
      await expect(setHandler!('', 'test-account', 'test-password')).rejects.toThrow();

      // Test empty account - should throw SecureStorageError
      await expect(setHandler!('test-service', '', 'test-password')).rejects.toThrow();

      // Test empty password - should throw SecureStorageError
      await expect(setHandler!('test-service', 'test-account', '')).rejects.toThrow();
    });
  });

  describe('Credential Manager Operations Integration', () => {
    it('should handle AI provider credential lifecycle', async () => {
      const provider = 'openai';
      const credentials = {
        apiKey: 'sk-test-key-123',
        organizationId: 'org-test',
      };
      const metadata = {
        displayName: 'OpenAI Test Account',
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        environment: 'test',
      };

      // Set credential
      const setHandler = mockIpcHandlers.get('secure:credentials:set');
      expect(setHandler).toBeDefined();

      vi.mocked(credentialManager.setCredential).mockResolvedValue(undefined);
      const setResult = await setHandler!(provider, credentials.apiKey, metadata);

      expect(setResult).toBeUndefined(); // setHandler returns void
      expect(credentialManager.setCredential).toHaveBeenCalledWith(
        provider,
        credentials.apiKey,
        metadata,
      );

      // Get credential
      const getHandler = mockIpcHandlers.get('secure:credentials:get');
      expect(getHandler).toBeDefined();

      const credentialInfo = {
        provider: provider as AiProvider,
        hasApiKey: true,
        lastUpdated: Date.now(),
        metadata,
      };

      vi.mocked(credentialManager.getCredential).mockResolvedValueOnce(credentialInfo);

      const getResult = (await getHandler!(provider)) as any;

      expect(getResult).toBeDefined();
      expect(getResult.provider).toBe(provider);
      expect(getResult.hasApiKey).toBe(true);
      expect(getResult.metadata).toEqual(metadata);

      // List credentials
      const listHandler = mockIpcHandlers.get('secure:credentials:list');
      expect(listHandler).toBeDefined();

      vi.mocked(credentialManager.listCredentials).mockResolvedValueOnce([credentialInfo]);

      const listResult = (await listHandler!()) as any[];

      expect(listResult).toBeDefined();
      expect(listResult).toHaveLength(1);
      expect(listResult[0].provider).toBe(provider);

      // Delete credential
      const deleteHandler = mockIpcHandlers.get('secure:credentials:delete');
      expect(deleteHandler).toBeDefined();

      vi.mocked(credentialManager.deleteCredential).mockResolvedValue(undefined);
      const deleteResult = await deleteHandler!(provider);

      expect(deleteResult).toBeUndefined();
      expect(credentialManager.deleteCredential).toHaveBeenCalledWith(provider);
    });

    it('should validate AI provider types', async () => {
      const setHandler = mockIpcHandlers.get('secure:credentials:set');

      // Mock validation failures for invalid providers
      vi.mocked(credentialManager.setCredential).mockImplementation(
        (provider, apiKey, _metadata) => {
          const validProviders = ['openai', 'anthropic', 'google', 'groq', 'ollama'];
          if (!validProviders.includes(provider)) {
            return Promise.reject(new Error('Invalid provider'));
          }
          if (!apiKey) {
            return Promise.reject(new Error('API key is required'));
          }
          return Promise.resolve();
        },
      );

      // Test invalid provider - should throw SecureStorageError
      await expect(
        setHandler!('invalid-provider' as any, 'test-key', {
          displayName: 'Test',
          createdAt: new Date().toISOString(),
        }),
      ).rejects.toThrow();
    });

    it('should handle multiple provider credentials', async () => {
      const setHandler = mockIpcHandlers.get('secure:credentials:set');
      const getHandler = mockIpcHandlers.get('secure:credentials:get');

      // Set credentials for multiple providers
      const providerCredentials = [
        {
          provider: 'openai' as const,
          credentials: { apiKey: 'sk-openai-key' },
          metadata: {
            provider: 'openai' as const,
            displayName: 'OpenAI Account',
            createdAt: new Date().toISOString(),
          },
        },
        {
          provider: 'anthropic' as const,
          credentials: { apiKey: 'sk-ant-key' },
          metadata: {
            provider: 'anthropic' as const,
            displayName: 'Anthropic Account',
            createdAt: new Date().toISOString(),
          },
        },
      ];

      vi.mocked(credentialManager.setCredential).mockResolvedValue(undefined);

      // Set all credentials
      for (const { provider, credentials, metadata } of providerCredentials) {
        const result = await setHandler!(provider, credentials.apiKey, metadata);
        expect(result).toBeUndefined(); // setHandler returns void
      }

      // Verify all can be retrieved
      for (const { provider, metadata } of providerCredentials) {
        const credentialInfo = {
          provider: provider as AiProvider,
          hasApiKey: true,
          lastUpdated: Date.now(),
          metadata,
        };
        vi.mocked(credentialManager.getCredential).mockResolvedValueOnce(credentialInfo);

        const result = (await getHandler!(provider)) as any;
        expect(result).toBeDefined();
        expect(result.provider).toBe(provider);
        expect(result.metadata).toEqual(metadata);
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle keytar failures gracefully', async () => {
      const setHandler = mockIpcHandlers.get('secure:keytar:set');

      // Mock credential manager failure
      const storageError = new Error('Keychain access denied');
      vi.mocked(credentialManager.storage.set).mockRejectedValueOnce(storageError);

      // Should throw SecureStorageError
      await expect(setHandler!('test-service', 'test-account', 'test-password')).rejects.toThrow(
        'Failed to set keytar value',
      );
    });

    it('should handle credential manager failures', async () => {
      const setHandler = mockIpcHandlers.get('secure:credentials:set');

      // Mock credential manager failure
      const credentialError = new Error('System keychain unavailable');
      vi.mocked(credentialManager.setCredential).mockRejectedValueOnce(credentialError);

      // Should throw SecureStorageError
      await expect(
        setHandler!('openai', 'test-key', {
          displayName: 'Test',
          createdAt: new Date().toISOString(),
        }),
      ).rejects.toThrow('Failed to set credentials');
    });

    it('should handle corrupted credential data', async () => {
      const getHandler = mockIpcHandlers.get('secure:credentials:get');

      // Mock corrupted credential data
      const corruptedError = new Error('Invalid credential data');
      vi.mocked(credentialManager.getCredential).mockRejectedValueOnce(corruptedError);

      // Should throw SecureStorageError
      await expect(getHandler!('openai')).rejects.toThrow('Failed to get credentials');
    });
  });

  describe('Security Integration', () => {
    it('should not leak sensitive data in error messages', async () => {
      const setHandler = mockIpcHandlers.get('secure:keytar:set');

      const sensitivePassword = 'super-secret-password-123';

      // Mock credential manager failure
      vi.mocked(credentialManager.storage.set).mockRejectedValueOnce(new Error('Storage failed'));

      try {
        await setHandler!('test-service', 'test-account', sensitivePassword);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).not.toContain(sensitivePassword);
      }
    });

    it('should validate credential structure without exposing values', async () => {
      const setHandler = mockIpcHandlers.get('secure:credentials:set');

      const invalidCredentials = '';
      const sensitiveData = 'sensitive-information';

      // Mock credential manager failure
      vi.mocked(credentialManager.setCredential).mockRejectedValueOnce(
        new Error('Invalid credentials'),
      );

      try {
        await setHandler!('openai', invalidCredentials, {
          displayName: 'Test',
          createdAt: new Date().toISOString(),
          secretData: sensitiveData,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).not.toContain(sensitiveData);
      }
    });
  });

  describe('Performance Integration', () => {
    it('should handle concurrent credential operations', async () => {
      const setHandler = mockIpcHandlers.get('secure:credentials:set');

      vi.mocked(credentialManager.setCredential).mockResolvedValue(undefined);

      const operations = testProviders.map(
        (provider: (typeof testProviders)[number], index: number) =>
          setHandler!(provider, `key-${index}`, {
            displayName: `${provider} Account`,
            createdAt: new Date().toISOString(),
          }),
      );

      const startTime = performance.now();
      const results = await Promise.all(operations);
      const endTime = performance.now();

      // All operations should succeed (return undefined)
      results.forEach((result: any) => {
        expect(result).toBeUndefined();
      });

      // Performance should be reasonable
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
