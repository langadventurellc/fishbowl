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

import * as keytar from 'keytar';

// Import the handlers we want to test
import '@main/ipc/handlers';

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  app: {
    getName: vi.fn(() => 'fishbowl-test'),
  },
}));

describe('IPC Secure Storage Integration Tests', () => {
  const mockIpcHandlers = new Map<string, (...args: unknown[]) => Promise<unknown>>();
  const testProviders = ['openai', 'anthropic', 'google', 'groq', 'ollama'] as const;

  beforeEach(async () => {
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

    // Re-register handlers
    await import('../../src/main/ipc/handlers');
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

      vi.mocked(keytar.setPassword).mockResolvedValueOnce();
      const setResult = await setHandler!({}, service, account, password);

      expect(setResult).toBeUndefined(); // setHandler returns void
      expect(keytar.setPassword).toHaveBeenCalledWith(service, account, password);

      // Get password
      const getHandler = mockIpcHandlers.get('secure:keytar:get');
      expect(getHandler).toBeDefined();

      vi.mocked(keytar.getPassword).mockResolvedValueOnce(password);
      const getResult = await getHandler!({}, service, account);

      expect(getResult).toBe(password);
      expect(keytar.getPassword).toHaveBeenCalledWith(service, account);

      // Delete password
      const deleteHandler = mockIpcHandlers.get('secure:keytar:delete');
      expect(deleteHandler).toBeDefined();

      vi.mocked(keytar.deletePassword).mockResolvedValueOnce(true);
      const deleteResult = await deleteHandler!({}, service, account);

      expect(deleteResult).toBe(true);
      expect(keytar.deletePassword).toHaveBeenCalledWith(service, account);

      // Verify deletion
      vi.mocked(keytar.getPassword).mockResolvedValueOnce(null);
      const getDeletedResult = await getHandler!({}, service, account);

      expect(getDeletedResult).toBeNull();
    });

    it('should validate keytar input parameters', async () => {
      const setHandler = mockIpcHandlers.get('secure:keytar:set');

      // Test empty service - should throw SecureStorageError
      await expect(setHandler!({}, '', 'test-account', 'test-password')).rejects.toThrow();

      // Test empty account - should throw SecureStorageError
      await expect(setHandler!({}, 'test-service', '', 'test-password')).rejects.toThrow();

      // Test empty password - should throw SecureStorageError
      await expect(setHandler!({}, 'test-service', 'test-account', '')).rejects.toThrow();
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

      vi.mocked(keytar.setPassword).mockResolvedValue();
      const setResult = await setHandler!({}, provider, credentials.apiKey, metadata);

      expect(setResult).toBeUndefined(); // setHandler returns void
      expect(keytar.setPassword).toHaveBeenCalledTimes(2); // credentials + metadata

      // Get credential
      const getHandler = mockIpcHandlers.get('secure:credentials:get');
      expect(getHandler).toBeDefined();

      const credentialsJson = JSON.stringify(credentials);
      const metadataJson = JSON.stringify(metadata);

      vi.mocked(keytar.getPassword)
        .mockResolvedValueOnce(credentialsJson)
        .mockResolvedValueOnce(metadataJson);

      const getResult = (await getHandler!({}, provider)) as any;

      expect(getResult).toBeDefined();
      expect(getResult.provider).toBe(provider);
      expect(getResult.hasApiKey).toBe(true);
      expect(getResult.metadata).toEqual(metadata);

      // List credentials
      const listHandler = mockIpcHandlers.get('secure:credentials:list');
      expect(listHandler).toBeDefined();

      vi.mocked(keytar.findCredentials).mockResolvedValueOnce([
        { account: `fishbowl-credentials-${provider}`, password: credentialsJson },
      ]);
      vi.mocked(keytar.getPassword).mockResolvedValueOnce(metadataJson);

      const listResult = (await listHandler!({})) as any[];

      expect(listResult).toBeDefined();
      expect(listResult).toHaveLength(1);
      expect(listResult[0].provider).toBe(provider);

      // Delete credential
      const deleteHandler = mockIpcHandlers.get('secure:credentials:delete');
      expect(deleteHandler).toBeDefined();

      vi.mocked(keytar.deletePassword).mockResolvedValue(true);
      const deleteResult = await deleteHandler!({}, provider);

      expect(deleteResult).toBe(true);
      expect(keytar.deletePassword).toHaveBeenCalledTimes(2); // credentials + metadata
    });

    it('should validate AI provider types', async () => {
      const setHandler = mockIpcHandlers.get('secure:credentials:set');

      // Test invalid provider - should throw SecureStorageError
      await expect(
        setHandler!({}, 'invalid-provider' as any, 'test-key', {
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

      vi.mocked(keytar.setPassword).mockResolvedValue();

      // Set all credentials
      for (const { provider, credentials, metadata } of providerCredentials) {
        const result = await setHandler!({}, provider, credentials.apiKey, metadata);
        expect(result).toBeUndefined(); // setHandler returns void
      }

      // Verify all can be retrieved
      for (const { provider, credentials, metadata } of providerCredentials) {
        vi.mocked(keytar.getPassword)
          .mockResolvedValueOnce(JSON.stringify(credentials))
          .mockResolvedValueOnce(JSON.stringify(metadata));

        const result = (await getHandler!({}, provider)) as any;
        expect(result).toBeDefined();
        expect(result.provider).toBe(provider);
        expect(result.metadata).toEqual(metadata);
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle keytar failures gracefully', async () => {
      const setHandler = mockIpcHandlers.get('secure:keytar:set');

      // Mock keytar failure
      const keytarError = new Error('Keychain access denied');
      vi.mocked(keytar.setPassword).mockRejectedValueOnce(keytarError);

      // Should throw SecureStorageError
      await expect(
        setHandler!({}, 'test-service', 'test-account', 'test-password'),
      ).rejects.toThrow('Keychain access denied');
    });

    it('should handle credential manager failures', async () => {
      const setHandler = mockIpcHandlers.get('secure:credentials:set');

      // Mock keytar failure for credential manager
      const keytarError = new Error('System keychain unavailable');
      vi.mocked(keytar.setPassword).mockRejectedValueOnce(keytarError);

      // Should throw SecureStorageError
      await expect(
        setHandler!({}, 'openai', 'test-key', {
          displayName: 'Test',
          createdAt: new Date().toISOString(),
        }),
      ).rejects.toThrow('System keychain unavailable');
    });

    it('should handle corrupted credential data', async () => {
      const getHandler = mockIpcHandlers.get('secure:credentials:get');

      // Mock corrupted JSON data
      vi.mocked(keytar.getPassword)
        .mockResolvedValueOnce('invalid-json')
        .mockResolvedValueOnce('{}');

      // Should throw SecureStorageError
      await expect(getHandler!({}, 'openai')).rejects.toThrow();
    });
  });

  describe('Security Integration', () => {
    it('should not leak sensitive data in error messages', async () => {
      const setHandler = mockIpcHandlers.get('secure:keytar:set');

      const sensitivePassword = 'super-secret-password-123';

      // Mock keytar failure
      vi.mocked(keytar.setPassword).mockRejectedValueOnce(new Error('Storage failed'));

      try {
        await setHandler!({}, 'test-service', 'test-account', sensitivePassword);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).not.toContain(sensitivePassword);
      }
    });

    it('should validate credential structure without exposing values', async () => {
      const setHandler = mockIpcHandlers.get('secure:credentials:set');

      const invalidCredentials = '';
      const sensitiveData = 'sensitive-information';

      try {
        await setHandler!({}, 'openai', invalidCredentials, {
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

      vi.mocked(keytar.setPassword).mockResolvedValue();

      const operations = testProviders.map(
        (provider: (typeof testProviders)[number], index: number) =>
          setHandler!({}, provider, `key-${index}`, {
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
