import { z } from 'zod';

/**
 * Zod schema for AI provider types
 */
export const AiProviderSchema = z.enum(['openai', 'anthropic', 'google', 'groq', 'ollama']);

/**
 * Zod schema for credential operations
 */
export const CredentialOperationSchema = z.enum(['get', 'set', 'delete', 'list']);

/**
 * Zod schema for storing a credential
 */
export const SetCredentialSchema = z.object({
  provider: AiProviderSchema,
  apiKey: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

/**
 * Zod schema for retrieving a credential
 */
export const GetCredentialSchema = z.object({
  provider: AiProviderSchema,
});

/**
 * Zod schema for deleting a credential
 */
export const DeleteCredentialSchema = z.object({
  provider: AiProviderSchema,
});

/**
 * Zod schema for credential information (without API key)
 */
export const CredentialInfoSchema = z.object({
  provider: AiProviderSchema,
  hasApiKey: z.boolean(),
  lastUpdated: z.number(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Zod schema for secure storage service names
 */
export const SecureStorageServiceSchema = z.enum(['fishbowl-ai-keys', 'fishbowl-config']);

/**
 * Zod schema for keytar operations
 */
export const KeytarOperationSchema = z.object({
  service: SecureStorageServiceSchema,
  account: z.string().min(1),
  password: z.string().optional(),
});
