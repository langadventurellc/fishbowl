---
kind: task
id: T-create-standardized-validation
parent: F-data-validation-layer
status: done
title: Create standardized validation error handling
priority: high
prerequisites:
  - T-implement-core-zod-schemas-for
created: "2025-08-07T01:36:46.921192"
updated: "2025-08-07T02:33:04.837166"
schema_version: "1.1"
worktree: null
---

# Create Standardized Validation Error Handling

## Context

This task implements standardized error types, error formatting, and error aggregation for LLM configuration validation. This ensures consistent error reporting across the application and provides clear feedback to users.

## Technical Approach

Create validation error utilities in `packages/shared/src/types/llmConfig/validationErrors.ts`:

### 1. Validation Error Types

```typescript
/**
 * Standard validation error structure
 */
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any; // The invalid value (excluding sensitive data)
}

/**
 * Aggregated validation result
 */
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
}

/**
 * Error codes for different types of validation failures
 */
export enum ValidationErrorCode {
  REQUIRED = "REQUIRED",
  INVALID_FORMAT = "INVALID_FORMAT",
  INVALID_LENGTH = "INVALID_LENGTH",
  INVALID_ENUM = "INVALID_ENUM",
  DUPLICATE_NAME = "DUPLICATE_NAME",
  PROVIDER_SPECIFIC = "PROVIDER_SPECIFIC",
  INVALID_URL = "INVALID_URL",
  API_KEY_FORMAT = "API_KEY_FORMAT",
}
```

### 2. Error Formatting Functions

```typescript
/**
 * Converts Zod error to standardized validation errors
 */
export function formatZodErrors(zodError: ZodError): ValidationError[] {
  return zodError.issues.map((issue) => ({
    field: issue.path.join("."),
    code: getErrorCode(issue),
    message: issue.message,
    value: sanitizeValue(issue.path[0] as string, (issue as any).received),
  }));
}

/**
 * Maps Zod issue codes to our error codes
 */
function getErrorCode(issue: ZodIssue): ValidationErrorCode {
  switch (issue.code) {
    case "invalid_type":
      return issue.received === "undefined"
        ? ValidationErrorCode.REQUIRED
        : ValidationErrorCode.INVALID_FORMAT;
    case "invalid_string":
      return ValidationErrorCode.INVALID_FORMAT;
    case "too_small":
    case "too_big":
      return ValidationErrorCode.INVALID_LENGTH;
    case "invalid_enum_value":
      return ValidationErrorCode.INVALID_ENUM;
    default:
      return ValidationErrorCode.INVALID_FORMAT;
  }
}

/**
 * Sanitizes values to prevent exposure of sensitive data
 */
function sanitizeValue(fieldName: string, value: any): any {
  // Never include API keys in error messages
  if (fieldName === "apiKey") {
    return "[HIDDEN]";
  }

  // Truncate long strings
  if (typeof value === "string" && value.length > 50) {
    return value.substring(0, 47) + "...";
  }

  return value;
}
```

### 3. Error Aggregation

```typescript
/**
 * Creates validation error for custom business rules
 */
export function createValidationError(
  field: string,
  code: ValidationErrorCode,
  message: string,
  value?: any,
): ValidationError {
  return {
    field,
    code,
    message,
    value: sanitizeValue(field, value),
  };
}

/**
 * Aggregates multiple validation results
 */
export function aggregateValidationErrors(
  ...results: Array<ValidationResult | ValidationError[]>
): ValidationError[] {
  const allErrors: ValidationError[] = [];

  for (const result of results) {
    if (Array.isArray(result)) {
      allErrors.push(...result);
    } else if (!result.success) {
      allErrors.push(...result.errors);
    }
  }

  return allErrors;
}

/**
 * Creates validation result from errors
 */
export function createValidationResult<T>(
  data?: T,
  errors: ValidationError[] = [],
): ValidationResult<T> {
  return {
    success: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    errors,
  };
}
```

### 4. User-Friendly Error Messages

```typescript
/**
 * Generates user-friendly summary of validation errors
 */
export function getValidationSummary(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return "";
  }

  if (errors.length === 1) {
    return errors[0].message;
  }

  const fieldErrors = groupErrorsByField(errors);
  const fieldCount = Object.keys(fieldErrors).length;

  if (fieldCount === 1) {
    const field = Object.keys(fieldErrors)[0];
    const fieldName = getFieldDisplayName(field);
    return `${fieldName} has ${errors.length} errors`;
  }

  return `${fieldCount} fields have validation errors`;
}

/**
 * Groups errors by field name
 */
function groupErrorsByField(
  errors: ValidationError[],
): Record<string, ValidationError[]> {
  return errors.reduce(
    (groups, error) => {
      const field = error.field;
      groups[field] = groups[field] || [];
      groups[field].push(error);
      return groups;
    },
    {} as Record<string, ValidationError[]>,
  );
}

/**
 * Converts technical field names to user-friendly names
 */
function getFieldDisplayName(field: string): string {
  const displayNames: Record<string, string> = {
    customName: "Configuration Name",
    provider: "Provider",
    apiKey: "API Key",
    baseUrl: "Base URL",
    useAuthHeader: "Use Auth Header",
  };

  return displayNames[field] || field;
}
```

## Implementation Requirements

### File Structure

```
packages/shared/src/types/llmConfig/
├── validationErrors.ts        # Error types and utilities
└── __tests__/
    └── validationErrors.test.ts   # Unit tests
```

### Error Handling Features

- **Standardized Error Structure**: Consistent error format across validation
- **Sensitive Data Protection**: API keys never exposed in error messages
- **Error Aggregation**: Multiple validation errors combined into single result
- **User-Friendly Messages**: Technical errors converted to actionable feedback
- **Error Categorization**: Clear error codes for different failure types

## Unit Tests to Implement

Test scenarios in `__tests__/validationErrors.test.ts`:

1. **Error Formatting**:
   - Zod errors correctly converted to standard format
   - Error codes mapped correctly
   - Sensitive data sanitization works

2. **Error Aggregation**:
   - Multiple validation results combined correctly
   - Empty results handled properly
   - Mixed error types aggregated

3. **Error Messages**:
   - Single error messages are clear
   - Multiple error summaries are informative
   - Field names are user-friendly

4. **Data Sanitization**:
   - API keys are never exposed in errors
   - Long values are truncated appropriately
   - Safe values are preserved

## Acceptance Criteria

- ✓ ValidationError interface defines consistent error structure
- ✓ ValidationResult interface supports both success and failure states
- ✓ Zod errors are converted to standardized ValidationError format
- ✓ API keys are never included in error messages or values
- ✓ Error codes categorize different types of validation failures
- ✓ Multiple validation errors are aggregated into single result
- ✓ Error messages are user-friendly and actionable
- ✓ Field names in errors are converted to display-friendly format
- ✓ Long values in errors are truncated to prevent noise
- ✓ Unit tests cover all error handling scenarios with 100% coverage
- ✓ All error utilities are properly exported

## Dependencies

- **T-implement-core-zod-schemas-for**: Needs Zod schemas for error conversion

## File Locations

- Implementation: `packages/shared/src/types/llmConfig/validationErrors.ts`
- Tests: `packages/shared/src/types/llmConfig/__tests__/validationErrors.test.ts`

### Log

**2025-08-07T07:56:20.212253Z** - Implemented comprehensive standardized validation error handling system for LLM configurations with complete Zod integration, security-focused data sanitization, and user-friendly error formatting. The system provides structured error tracking with field-level details, categorized error codes, and seamless conversion between Zod validation errors and business rule violations. Key security features include automatic redaction of API keys and sensitive data in all error contexts. All components follow the project's strict "one export per file" architecture and include comprehensive unit test coverage. Quality checks pass with full TypeScript type safety and linting compliance.

- filesChanged: ["packages/shared/src/types/llmConfig/ValidationError.ts", "packages/shared/src/types/llmConfig/ValidationErrorCode.ts", "packages/shared/src/types/llmConfig/StandardizedValidationResult.ts", "packages/shared/src/types/llmConfig/sanitizeValue.ts", "packages/shared/src/types/llmConfig/mapZodIssueToErrorCode.ts", "packages/shared/src/types/llmConfig/formatZodErrors.ts", "packages/shared/src/types/llmConfig/createValidationError.ts", "packages/shared/src/types/llmConfig/createValidationResult.ts", "packages/shared/src/types/llmConfig/aggregateValidationErrors.ts", "packages/shared/src/types/llmConfig/groupErrorsByField.ts", "packages/shared/src/types/llmConfig/getFieldDisplayName.ts", "packages/shared/src/types/llmConfig/getValidationSummary.ts", "packages/shared/src/types/llmConfig/formatErrorsForDisplay.ts", "packages/shared/src/types/llmConfig/validateWithErrors.ts", "packages/shared/src/types/llmConfig/index.ts", "packages/shared/src/types/llmConfig/__tests__/standardizedValidation.test.ts"]
