/**
 * Return type for useLlmConfig hook.
 *
 * @module hooks/types/UseLlmConfigHook
 */

import type {
  LlmConfig,
  LlmConfigInput,
  LlmConfigMetadata,
} from "@fishbowl-ai/shared";

export interface UseLlmConfigHook {
  // Data
  configurations: LlmConfigMetadata[];
  isLoading: boolean;
  error: string | null;

  // Operations
  createConfiguration: (config: LlmConfigInput) => Promise<LlmConfig>;
  updateConfiguration: (
    id: string,
    updates: Partial<LlmConfigInput>,
  ) => Promise<LlmConfig>;
  deleteConfiguration: (id: string) => Promise<void>;
  getConfiguration: (id: string) => Promise<LlmConfig | null>;
  refreshConfigurations: () => Promise<void>;

  // UI State helpers
  clearError: () => void;
}
