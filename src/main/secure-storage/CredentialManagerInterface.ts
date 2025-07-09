import type { AiProvider, CredentialInfo } from '../../shared/types';

/**
 * Interface for credential management operations
 */
export interface CredentialManagerInterface {
  getCredential(provider: AiProvider): Promise<CredentialInfo | null>;
  setCredential(
    provider: AiProvider,
    apiKey: string,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
  deleteCredential(provider: AiProvider): Promise<void>;
  listCredentials(): Promise<CredentialInfo[]>;
  hasCredential(provider: AiProvider): Promise<boolean>;
}
