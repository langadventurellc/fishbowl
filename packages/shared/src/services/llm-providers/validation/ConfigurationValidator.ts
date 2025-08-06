import { createLoggerSync } from "../../../logging/createLoggerSync";
import { LlmProviderConfigurationValidator } from "../../../types/llm-providers/validation/validationService";
import { LlmProvidersFileSchema } from "../../../types/llm-providers/validation/file.schema";
import { LlmProviderConfigSchema } from "../../../types/llm-providers/validation/LlmProviderConfigSchema";
import type { InferredLlmProvidersFile } from "../../../types/llm-providers/validation/InferredLlmProvidersFile";
import type { LlmProviderDefinition } from "../../../types/llm-providers/LlmProviderDefinition";
import { FileStorageService } from "../../storage/FileStorageService";
import { ValidationErrorFormatter } from "./ValidationErrorFormatter";
import type { ValidationOptions } from "./ValidationOptions";
import type { ValidationResult } from "./ValidationResult";
import type { ValidationWarning } from "./ValidationWarning";

export class ConfigurationValidator {
  private errorFormatter: ValidationErrorFormatter;
  private fileStorage: FileStorageService;
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "ConfigurationValidator" } },
  });

  constructor(private options: ValidationOptions = { mode: "production" }) {
    this.errorFormatter = new ValidationErrorFormatter(options);
    this.fileStorage = new FileStorageService();
  }

  async validateConfiguration(data: unknown): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      const result = LlmProviderConfigurationValidator.validateFile(data);

      if (result.valid) {
        const validData = LlmProvidersFileSchema.parse(data);
        return {
          isValid: true,
          data: validData,
          warnings: this.options.enableWarnings
            ? this.checkForWarnings(validData)
            : undefined,
          metadata: {
            providerCount: validData.providers.length,
            validationDuration: Date.now() - startTime,
            schemaVersion: validData.version,
          },
        };
      }

      return {
        isValid: false,
        errors: this.errorFormatter.formatValidationErrors(result.errors),
        metadata: {
          validationDuration: Date.now() - startTime,
        },
      };
    } catch (error) {
      this.logger.error(
        "Validation failed with unexpected error",
        error as Error,
      );
      return {
        isValid: false,
        errors: [
          {
            path: "",
            field: "",
            message: "Unexpected validation error",
            code: "UNKNOWN_ERROR",
          },
        ],
      };
    }
  }

  async validateConfigurationFile(filePath: string): Promise<ValidationResult> {
    try {
      const data = await this.fileStorage.readJsonFile(filePath);
      return await this.validateConfiguration(data);
    } catch (error) {
      if ((error as Error).name === "InvalidJsonError") {
        return {
          isValid: false,
          errors: this.errorFormatter.formatJsonError(error as Error, filePath),
        };
      }

      return {
        isValid: false,
        errors: [this.errorFormatter.formatFileError(error as Error, filePath)],
      };
    }
  }

  validateProvider(provider: unknown): ValidationResult {
    const result = LlmProviderConfigurationValidator.validateProvider(provider);

    if (result.valid) {
      return {
        isValid: true,
        data: LlmProviderConfigSchema.parse(provider) as LlmProviderDefinition,
      };
    }

    return {
      isValid: false,
      errors: this.errorFormatter.formatValidationErrors(result.errors),
    };
  }

  createUserFriendlyError(errors: ValidationResult["errors"]): string {
    if (!errors || errors.length === 0) {
      return "Validation successful";
    }

    if (errors.length === 1) {
      return errors[0]?.message || "Validation error";
    }

    return `Configuration has ${errors.length} validation errors. Please check the configuration file.`;
  }

  private checkForWarnings(
    data: InferredLlmProvidersFile,
  ): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check for duplicate provider IDs
    const providerIds = data.providers.map((p) => p.id);
    const duplicates = providerIds.filter(
      (id, i) => providerIds.indexOf(id) !== i,
    );
    if (duplicates.length > 0) {
      warnings.push({
        type: "compatibility",
        message: `Duplicate provider IDs found: ${duplicates.join(", ")}`,
      });
    }

    // Check for providers with no models
    data.providers.forEach((provider, index) => {
      if (Object.keys(provider.models).length === 0) {
        warnings.push({
          type: "compatibility",
          message: `Provider '${provider.id}' has no models defined`,
          path: `providers[${index}]`,
        });
      }
    });

    return warnings;
  }
}
