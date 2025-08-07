---
kind: task
id: T-integrate-validation-layer-with
title: Integrate validation layer with service operations
status: open
priority: normal
prerequisites:
  - T-implement-core-zod-schemas-for
  - T-implement-provider-specific
  - T-create-standardized-validation
created: "2025-08-07T01:37:25.506632"
updated: "2025-08-07T01:37:25.506632"
schema_version: "1.1"
parent: F-data-validation-layer
---

# Integrate Validation Layer with Service Operations

## Context

This task integrates the validation layer into the LLM configuration service operations. Since this involves the service layer which is desktop-specific (Electron main process), the integration code belongs in the desktop app rather than shared packages.

## Technical Approach

Create validation integration utilities in `apps/desktop/src/validation/llmConfigValidation.ts`:

### 1. Service Validation Functions

```typescript
import {
  llmConfigInputSchema,
  llmConfigSchema,
  ValidationResult,
  ValidationError,
  ValidationErrorCode,
  formatZodErrors,
  createValidationError,
  aggregateValidationErrors,
  createValidationResult,
} from "@fishbowl-ai/shared/types/llmConfig";
import {
  validateApiKey,
  validateUniqueConfigName,
  validateProviderRequirements,
  getApiKeyValidationError,
} from "@fishbowl-ai/shared/types/llmConfig";

/**
 * Validates input data for creating LLM configuration
 */
export async function validateCreateInput(
  input: unknown,
  existingConfigs: any[] = [],
): Promise<ValidationResult<LlmConfigInput>> {
  // Step 1: Zod schema validation
  const schemaResult = llmConfigInputSchema.safeParse(input);

  if (!schemaResult.success) {
    return createValidationResult(
      undefined,
      formatZodErrors(schemaResult.error),
    );
  }

  const validInput = schemaResult.data;

  // Step 2: Custom business rule validation
  const businessRuleErrors = await validateBusinessRules(
    validInput,
    existingConfigs,
  );

  if (businessRuleErrors.length > 0) {
    return createValidationResult(undefined, businessRuleErrors);
  }

  return createValidationResult(validInput);
}

/**
 * Validates input data for updating LLM configuration
 */
export async function validateUpdateInput(
  input: unknown,
  currentConfig: any,
  existingConfigs: any[] = [],
): Promise<ValidationResult<Partial<LlmConfigInput>>> {
  // Create partial schema for updates
  const partialSchema = llmConfigInputSchema.partial();
  const schemaResult = partialSchema.safeParse(input);

  if (!schemaResult.success) {
    return createValidationResult(
      undefined,
      formatZodErrors(schemaResult.error),
    );
  }

  const validInput = schemaResult.data;

  // Merge with current config for full validation context
  const mergedConfig = { ...currentConfig, ...validInput };

  // Custom business rule validation
  const businessRuleErrors = await validateBusinessRules(
    mergedConfig,
    existingConfigs,
    currentConfig.id,
    currentConfig.customName,
  );

  if (businessRuleErrors.length > 0) {
    return createValidationResult(undefined, businessRuleErrors);
  }

  return createValidationResult(validInput);
}
```

### 2. Business Rule Validation

```typescript
/**
 * Applies custom business rules validation
 */
async function validateBusinessRules(
  config: any,
  existingConfigs: any[] = [],
  currentId?: string,
  currentName?: string,
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // API key format validation
  if (!validateApiKey(config.apiKey, config.provider)) {
    errors.push(
      createValidationError(
        "apiKey",
        ValidationErrorCode.API_KEY_FORMAT,
        getApiKeyValidationError(config.provider),
        "[HIDDEN]",
      ),
    );
  }

  // Unique name validation
  const existingNames = existingConfigs.map((c) => c.customName);
  const nameValidation = validateUniqueConfigName(
    config.customName,
    existingNames,
    currentId,
    currentName,
  );

  if (!nameValidation.isValid) {
    errors.push(
      createValidationError(
        "customName",
        ValidationErrorCode.DUPLICATE_NAME,
        nameValidation.error!,
        config.customName,
      ),
    );
  }

  // Provider-specific requirements
  const providerValidation = validateProviderRequirements(
    config.provider,
    config,
  );
  if (!providerValidation.isValid) {
    for (const error of providerValidation.errors) {
      errors.push(
        createValidationError(
          "provider",
          ValidationErrorCode.PROVIDER_SPECIFIC,
          error,
          config.provider,
        ),
      );
    }
  }

  return errors;
}
```

### 3. Service Integration Example

```typescript
/**
 * Example of how validation integrates with service methods
 * (This shows the pattern - actual service integration happens in separate tasks)
 */
export class LlmConfigValidationService {
  /**
   * Validates configuration before creation
   */
  async validateForCreate(
    input: unknown,
    existingConfigs: any[] = [],
  ): Promise<ValidationResult<LlmConfigInput>> {
    return validateCreateInput(input, existingConfigs);
  }

  /**
   * Validates configuration before update
   */
  async validateForUpdate(
    input: unknown,
    currentConfig: any,
    existingConfigs: any[] = [],
  ): Promise<ValidationResult<Partial<LlmConfigInput>>> {
    return validateUpdateInput(input, currentConfig, existingConfigs);
  }

  /**
   * Validates complete configuration data
   */
  validateComplete(config: unknown): ValidationResult<LlmConfig> {
    const schemaResult = llmConfigSchema.safeParse(config);

    if (!schemaResult.success) {
      return createValidationResult(
        undefined,
        formatZodErrors(schemaResult.error),
      );
    }

    return createValidationResult(schemaResult.data);
  }
}
```

### 4. Validation Error Types for Service Layer

```typescript
/**
 * Custom error class for validation failures in service layer
 */
export class LlmConfigValidationError extends Error {
  public readonly errors: ValidationError[];
  public readonly validationSummary: string;

  constructor(message: string, errors: ValidationError[]) {
    super(message);
    this.name = "LlmConfigValidationError";
    this.errors = errors;
    this.validationSummary = getValidationSummary(errors);
  }
}

/**
 * Throws validation error if validation result has errors
 */
export function throwIfValidationFailed<T>(result: ValidationResult<T>): T {
  if (!result.success) {
    throw new LlmConfigValidationError(
      "LLM configuration validation failed",
      result.errors,
    );
  }

  return result.data!;
}
```

## Implementation Requirements

### File Structure

```
apps/desktop/src/validation/
├── llmConfigValidation.ts         # Service validation integration
└── __tests__/
    └── llmConfigValidation.test.ts    # Unit tests
```

### Integration Features

- **Input Validation**: Validates raw input before service operations
- **Business Rules**: Applies custom validation rules beyond schema
- **Error Handling**: Standardized error types for service layer
- **Update Support**: Handles partial updates with merged validation
- **Service Ready**: Ready to integrate with actual service implementations

## Unit Tests to Implement

Test scenarios in `__tests__/llmConfigValidation.test.ts`:

1. **Create Validation**:
   - Valid input passes validation
   - Invalid schema data fails with correct errors
   - Business rule violations are caught
   - Multiple errors are aggregated

2. **Update Validation**:
   - Partial updates work correctly
   - Current config data is considered
   - Name uniqueness respects current name
   - Merged validation applies all rules

3. **Error Integration**:
   - Validation errors are thrown appropriately
   - Error messages are user-friendly
   - Sensitive data is not exposed

4. **Service Integration**:
   - Validation service methods work correctly
   - Complete configuration validation works
   - Error types integrate with service patterns

## Acceptance Criteria

- ✓ validateCreateInput function validates complete input data
- ✓ validateUpdateInput function handles partial updates correctly
- ✓ Business rules are applied after schema validation
- ✓ API key format validation is enforced per provider
- ✓ Configuration name uniqueness is enforced
- ✓ Provider-specific requirements are validated
- ✓ Validation results include clear error messages
- ✓ LlmConfigValidationError provides structured error info
- ✓ Multiple validation errors are aggregated correctly
- ✓ Sensitive data (API keys) is never exposed in errors
- ✓ Integration is ready for service layer implementation
- ✓ Unit tests cover all validation scenarios with 100% coverage

## Dependencies

- **T-implement-core-zod-schemas-for**: Core schemas for validation
- **T-implement-provider-specific**: Custom validators for business rules
- **T-create-standardized-validation**: Error handling utilities

## File Locations

- Implementation: `apps/desktop/src/validation/llmConfigValidation.ts`
- Tests: `apps/desktop/src/validation/__tests__/llmConfigValidation.test.ts`

## Integration Notes

This validation layer will be used by the LLM Configuration Service (from a different feature) to validate all CRUD operations before they reach the storage layer.

### Log
