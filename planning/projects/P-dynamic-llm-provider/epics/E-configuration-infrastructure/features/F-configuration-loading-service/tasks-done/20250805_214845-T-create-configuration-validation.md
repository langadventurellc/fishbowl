---
kind: task
id: T-create-configuration-validation
parent: F-configuration-loading-service
status: done
title:
  Create configuration validation layer integrating existing schemas with detailed
  error reporting
priority: high
prerequisites: []
created: "2025-08-05T17:39:03.537815"
updated: "2025-08-05T21:21:46.713154"
schema_version: "1.1"
worktree: null
---

## Context

Build a validation layer that integrates the existing comprehensive validation schemas from `types/llm-providers/validation/` with the configuration loading service. This provides detailed error reporting and validation pipeline for loaded configurations.

**Note: Integration and performance tests are not to be created for this task.**

## Implementation Requirements

### File Location

- Create `packages/shared/src/services/llm-providers/validation/ConfigurationValidator.ts`
- Create `packages/shared/src/services/llm-providers/validation/ValidationErrorFormatter.ts`
- Create `packages/shared/src/services/llm-providers/validation/index.ts` barrel export

### ConfigurationValidator Class

```typescript
export class ConfigurationValidator {
  private validator: LlmProviderConfigurationValidator;
  private errorFormatter: ValidationErrorFormatter;

  constructor(options: ValidationOptions = {}) {
    this.validator = new LlmProviderConfigurationValidator();
    this.errorFormatter = new ValidationErrorFormatter(options);
  }

  // Main validation methods
  async validateConfiguration(data: unknown): Promise<ValidationResult>;
  async validateConfigurationFile(filePath: string): Promise<ValidationResult>;
  validateProvider(provider: unknown): ValidationResult;

  // Detailed error reporting
  formatValidationErrors(errors: ZodError): FormattedValidationError[];
  createUserFriendlyError(error: ValidationError): string;

  // Schema validation
  private validateSchema(data: unknown): ValidationResult;
  private validateProviderIds(providers: LlmProviderConfig[]): ValidationResult;
  private validateProviderReferences(
    providers: LlmProviderConfig[],
  ): ValidationResult;
}
```

### ValidationResult Interface

```typescript
export interface ValidationResult {
  isValid: boolean;
  data?: LlmProviderConfig[];
  errors?: FormattedValidationError[];
  warnings?: ValidationWarning[];
  metadata?: ValidationMetadata;
}

export interface FormattedValidationError {
  path: string;
  field: string;
  message: string;
  code: string;
  value: unknown;
  expectedType?: string;
}

export interface ValidationWarning {
  type: "deprecation" | "compatibility" | "performance";
  message: string;
  path?: string;
}
```

### ValidationErrorFormatter Class

```typescript
export class ValidationErrorFormatter {
  constructor(private options: FormatterOptions = {}) {}

  formatZodError(error: ZodError): FormattedValidationError[];
  formatJsonError(
    error: SyntaxError,
    content: string,
  ): FormattedValidationError;
  formatFileError(error: Error, filePath: string): FormattedValidationError;

  createDeveloperMessage(errors: FormattedValidationError[]): string;
  createUserMessage(errors: FormattedValidationError[]): string;

  private extractLineNumber(error: SyntaxError, content: string): number;
  private highlightErrorContext(content: string, line: number): string;
}
```

### Integration with Existing Schemas

- Use `LlmProviderConfigurationValidator` from existing validation service
- Import and utilize `LlmProvidersFileSchema` for file-level validation
- Leverage `LlmProviderConfigSchema` for individual provider validation
- Apply field-level validation rules from existing schemas

### Error Types and Reporting

1. **Schema Validation Errors**: Field type mismatches, required fields
2. **File Format Errors**: Invalid JSON syntax with line numbers
3. **Semantic Errors**: Duplicate provider IDs, invalid references
4. **Compatibility Warnings**: Deprecated fields, version mismatches

### Development vs Production Error Handling

```typescript
export interface ValidationOptions {
  mode: "development" | "production";
  includeStackTrace?: boolean;
  includeRawData?: boolean;
  maxErrorCount?: number;
  enableWarnings?: boolean;
}
```

### Error Context Enhancement

- **Line numbers**: For JSON syntax errors
- **Field paths**: Detailed paths to invalid fields (e.g., `providers[0].configuration.apiKey`)
- **Expected vs actual**: Clear indication of what was expected
- **Suggestions**: Helpful hints for common validation errors

## Acceptance Criteria

- ✓ Validates complete configuration files using existing schemas
- ✓ Provides detailed field-level error reporting with paths
- ✓ Formats JSON syntax errors with line number context
- ✓ Detects duplicate provider IDs and invalid references
- ✓ Generates user-friendly error messages in production
- ✓ Includes detailed developer information in development
- ✓ Returns validated and typed LlmProviderConfig arrays
- ✓ Handles partial validation for hot-reload scenarios
- ✓ Unit tests cover all validation scenarios and error formatting

## Testing Requirements

Create comprehensive unit tests in `__tests__/ConfigurationValidator.test.ts`:

- Valid configuration validation and typing
- Schema validation error handling and formatting
- JSON syntax error parsing with line numbers
- Duplicate provider ID detection
- Error message formatting for different modes
- Integration with existing validation schemas
- Edge cases: empty files, malformed structures

**Note: Integration or performance tests are not to be created.**

### Log

**2025-08-06T02:48:45.242277Z** - Successfully implemented comprehensive configuration validation layer with detailed error reporting. Created ConfigurationValidator class that integrates existing Zod schemas with enhanced error formatting, metadata collection, and warning detection. Added ValidationErrorFormatter for context-aware error messages in development vs production modes. Updated LlmConfigurationLoader to use new validation system. All unit tests passing and quality checks successful.

- filesChanged: ["packages/shared/src/services/llm-providers/validation/ConfigurationValidator.ts", "packages/shared/src/services/llm-providers/validation/ValidationErrorFormatter.ts", "packages/shared/src/services/llm-providers/validation/ValidationOptions.ts", "packages/shared/src/services/llm-providers/validation/ValidationResult.ts", "packages/shared/src/services/llm-providers/validation/FormattedValidationError.ts", "packages/shared/src/services/llm-providers/validation/ValidationWarning.ts", "packages/shared/src/services/llm-providers/validation/ValidationMetadata.ts", "packages/shared/src/services/llm-providers/validation/FormatterOptions.ts", "packages/shared/src/services/llm-providers/validation/index.ts", "packages/shared/src/services/llm-providers/LlmConfigurationLoader.ts", "packages/shared/src/services/llm-providers/__tests__/LlmConfigurationLoader.test.ts", "packages/shared/src/services/llm-providers/validation/__tests__/ConfigurationValidator.test.ts", "packages/shared/src/services/llm-providers/validation/__tests__/ValidationErrorFormatter.test.ts"]
