import type { LlmConfig, LlmConfigInput } from "@fishbowl-ai/shared";

/**
 * Interface for the LLM Configuration Service providing all CRUD operations
 * for managing LLM provider configurations with business logic enforcement.
 */
export interface LlmConfigServiceInterface {
  create(input: LlmConfigInput): Promise<LlmConfig>;
  read(id: string): Promise<LlmConfig | null>;
  update(id: string, updates: Partial<LlmConfigInput>): Promise<LlmConfig>;
  delete(id: string): Promise<void>;
  list(): Promise<LlmConfig[]>;
  initialize(): Promise<void>;
}
