import type { InferredLlmProvidersFile } from "../../../types/llm-providers/validation/InferredLlmProvidersFile";
import type { LlmProviderDefinition } from "../../../types/llm-providers/LlmProviderDefinition";
import type { FormattedValidationError } from "./FormattedValidationError";
import type { ValidationWarning } from "./ValidationWarning";
import type { ValidationMetadata } from "./ValidationMetadata";

export interface ValidationResult {
  isValid: boolean;
  data?: InferredLlmProvidersFile | LlmProviderDefinition;
  errors?: FormattedValidationError[];
  warnings?: ValidationWarning[];
  metadata?: ValidationMetadata;
}
