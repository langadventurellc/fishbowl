import { SecureStorage } from './SecureStorage';
import { SecureStorageError } from '../../shared/types/errors';
import type { AiProvider, CredentialInfo, SecureStorageCredential } from '../../shared/types';
import type { CredentialManagerInterface } from './CredentialManagerInterface';

/**
 * Credential manager for AI provider API keys
 * Handles secure storage of API keys with metadata
 */
export class CredentialManager implements CredentialManagerInterface {
  private readonly secureStorage: SecureStorage;
  private readonly serviceName: string;

  constructor(serviceName: string = 'fishbowl-ai-keys') {
    this.secureStorage = new SecureStorage();
    this.serviceName = serviceName;
  }

  /**
   * Get credential information for a provider (without API key)
   */
  async getCredential(provider: AiProvider): Promise<CredentialInfo | null> {
    try {
      const credential = await this.getFullCredential(provider);
      if (!credential) {
        return null;
      }

      return {
        provider: credential.provider,
        hasApiKey: true,
        lastUpdated: (credential.metadata?.lastUpdated as number) ?? Date.now(),
        metadata: credential.metadata,
      };
    } catch (error) {
      throw new SecureStorageError(
        `Failed to get credential for provider ${provider}`,
        'getCredential',
        this.serviceName,
        error,
      );
    }
  }

  /**
   * Get full credential with API key (for internal use)
   */
  private async getFullCredential(provider: AiProvider): Promise<SecureStorageCredential | null> {
    try {
      const storedData = await this.secureStorage.get(this.serviceName, provider);
      if (!storedData) {
        return null;
      }

      const credential: SecureStorageCredential = JSON.parse(storedData);
      return credential;
    } catch (error) {
      if (error instanceof SecureStorageError) {
        throw error;
      }
      throw new SecureStorageError(
        `Failed to parse credential for provider ${provider}`,
        'parseCredential',
        this.serviceName,
        error,
      );
    }
  }

  /**
   * Set credential for a provider
   */
  async setCredential(
    provider: AiProvider,
    apiKey: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const credential: SecureStorageCredential = {
        provider,
        apiKey,
        metadata: {
          ...metadata,
          lastUpdated: Date.now(),
        },
      };

      const serializedCredential = JSON.stringify(credential);
      await this.secureStorage.set(this.serviceName, provider, serializedCredential);
    } catch (error) {
      throw new SecureStorageError(
        `Failed to set credential for provider ${provider}`,
        'setCredential',
        this.serviceName,
        error,
      );
    }
  }

  /**
   * Delete credential for a provider
   */
  async deleteCredential(provider: AiProvider): Promise<void> {
    try {
      await this.secureStorage.delete(this.serviceName, provider);
    } catch (error) {
      if (error instanceof SecureStorageError) {
        throw error;
      }
      throw new SecureStorageError(
        `Failed to delete credential for provider ${provider}`,
        'deleteCredential',
        this.serviceName,
        error,
      );
    }
  }

  /**
   * List all available credentials
   */
  async listCredentials(): Promise<CredentialInfo[]> {
    try {
      const credentials = await this.secureStorage.findCredentials(this.serviceName);
      const credentialInfos: CredentialInfo[] = [];

      for (const { password } of credentials) {
        try {
          const credential: SecureStorageCredential = JSON.parse(password);
          credentialInfos.push({
            provider: credential.provider,
            hasApiKey: true,
            lastUpdated: (credential.metadata?.lastUpdated as number) ?? Date.now(),
            metadata: credential.metadata,
          });
        } catch {
          // Skip invalid credentials
          continue;
        }
      }

      return credentialInfos;
    } catch (error) {
      throw new SecureStorageError(
        'Failed to list credentials',
        'listCredentials',
        this.serviceName,
        error,
      );
    }
  }

  /**
   * Check if a credential exists for a provider
   */
  async hasCredential(provider: AiProvider): Promise<boolean> {
    try {
      const credential = await this.getFullCredential(provider);
      return credential !== null;
    } catch (error) {
      throw new SecureStorageError(
        `Failed to check credential existence for provider ${provider}`,
        'hasCredential',
        this.serviceName,
        error,
      );
    }
  }

  /**
   * Get API key for a provider (for internal use only)
   */
  async getApiKey(provider: AiProvider): Promise<string | null> {
    try {
      const credential = await this.getFullCredential(provider);
      return credential?.apiKey ?? null;
    } catch (error) {
      throw new SecureStorageError(
        `Failed to get API key for provider ${provider}`,
        'getApiKey',
        this.serviceName,
        error,
      );
    }
  }

  /**
   * Get the underlying secure storage instance for keytar operations
   */
  get storage(): SecureStorage {
    return this.secureStorage;
  }
}
