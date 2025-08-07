import {
  type StandardizedValidationResult,
  type LlmConfigInput,
  type LlmConfig,
} from "@fishbowl-ai/shared";
import { validateCreateInput } from "./validateCreateInput";
import { validateUpdateInput } from "./validateUpdateInput";
import { validateComplete } from "./validateComplete";
import { throwIfValidationFailed } from "./throwIfValidationFailed";

/**
 * Service class for LLM configuration validation
 *
 * Provides a clean interface for validation operations with both
 * result-returning and exception-throwing methods.
 */
export class LlmConfigValidationService {
  /**
   * Validates configuration before creation
   */
  async validateForCreate(
    input: unknown,
    existingConfigs: LlmConfig[] = [],
  ): Promise<StandardizedValidationResult<LlmConfigInput>> {
    return validateCreateInput(input, existingConfigs);
  }

  /**
   * Validates configuration before update
   */
  async validateForUpdate(
    input: unknown,
    currentConfig: LlmConfig,
    existingConfigs: LlmConfig[] = [],
  ): Promise<StandardizedValidationResult<Partial<LlmConfigInput>>> {
    return validateUpdateInput(input, currentConfig, existingConfigs);
  }

  /**
   * Validates complete configuration data
   */
  validateComplete(config: unknown): StandardizedValidationResult<LlmConfig> {
    return validateComplete(config);
  }

  /**
   * Validates and throws on error (for simple integration)
   */
  async validateAndThrowForCreate(
    input: unknown,
    existingConfigs: LlmConfig[] = [],
  ): Promise<LlmConfigInput> {
    const result = await this.validateForCreate(input, existingConfigs);
    return throwIfValidationFailed(result);
  }

  /**
   * Validates and throws on error for updates
   */
  async validateAndThrowForUpdate(
    input: unknown,
    currentConfig: LlmConfig,
    existingConfigs: LlmConfig[] = [],
  ): Promise<Partial<LlmConfigInput>> {
    const result = await this.validateForUpdate(
      input,
      currentConfig,
      existingConfigs,
    );
    return throwIfValidationFailed(result);
  }
}
