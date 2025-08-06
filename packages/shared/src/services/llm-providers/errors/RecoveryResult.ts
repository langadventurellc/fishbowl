import type { LlmProviderDefinition } from "../../../types/llm-providers";

export interface RecoveryResult {
  success: boolean;
  fallbackData?: LlmProviderDefinition[];
  appliedFixes?: string[];
  remainingErrors?: Error[];
}
