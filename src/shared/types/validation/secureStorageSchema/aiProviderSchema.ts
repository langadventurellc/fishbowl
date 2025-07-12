import { z } from 'zod';

/**
 * Zod schema for AI provider types
 */
export const aiProviderSchema = z.enum(['openai', 'anthropic', 'google', 'groq', 'ollama']);
