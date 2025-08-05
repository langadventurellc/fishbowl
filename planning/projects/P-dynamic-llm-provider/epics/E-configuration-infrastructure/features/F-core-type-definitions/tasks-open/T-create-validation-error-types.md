---
kind: task
id: T-create-validation-error-types
title: Create validation error types for configuration validation
status: open
priority: normal
prerequisites:
  - T-create-field-configuration-types
created: "2025-08-04T19:48:17.803495"
updated: "2025-08-04T19:48:17.803495"
schema_version: "1.1"
parent: F-core-type-definitions
---

## Task Description

Create validation error types in `validation.types.ts` to support comprehensive error handling for LLM provider configuration validation.

## Implementation Steps

1. **Create Field Validation Error Type**:

   ```typescript
   export interface LlmFieldValidationError {
     fieldId: string; // Field that failed validation
     message: string; // Human-readable error message
     code: LlmValidationErrorCode; // Error code for programmatic handling
     value?: unknown; // The invalid value (optional for security)
   }
   ```

2. **Create Validation Error Codes**:

   ```typescript
   export enum LlmValidationErrorCode {
     // Field-level errors
     REQUIRED_FIELD_MISSING = "REQUIRED_FIELD_MISSING",
     INVALID_FIELD_TYPE = "INVALID_FIELD_TYPE",
     PATTERN_MISMATCH = "PATTERN_MISMATCH",
     VALUE_TOO_SHORT = "VALUE_TOO_SHORT",
     VALUE_TOO_LONG = "VALUE_TOO_LONG",

     // Provider errors
     INVALID_PROVIDER_ID = "INVALID_PROVIDER_ID",
     PROVIDER_NOT_FOUND = "PROVIDER_NOT_FOUND",

     // Configuration errors
     INVALID_CONFIGURATION = "INVALID_CONFIGURATION",
     DUPLICATE_INSTANCE_ID = "DUPLICATE_INSTANCE_ID",

     // Security errors
     INSECURE_VALUE = "INSECURE_VALUE",
     ENCRYPTION_FAILED = "ENCRYPTION_FAILED",
   }
   ```

3. **Create Validation Result Type**:

   ```typescript
   export interface LlmValidationResult {
     valid: boolean;
     errors: LlmFieldValidationError[];
   }
   ```

4. **Create Provider Validation Error**:

   ```typescript
   export interface LlmProviderValidationError {
     providerId: string;
     message: string;
     code: LlmValidationErrorCode;
     fieldErrors?: LlmFieldValidationError[];
   }
   ```

5. **Create Validation Context Type**:

   ```typescript
   export interface LlmValidationContext {
     providerId: string;
     fields: readonly LlmFieldConfig[];
     values: LlmConfigurationValues;
     mode: "create" | "update";
   }
   ```

6. **Create Custom Error Class**:

   ```typescript
   export class LlmConfigurationError extends Error {
     constructor(
       message: string,
       public code: LlmValidationErrorCode,
       public fieldErrors?: LlmFieldValidationError[],
     ) {
       super(message);
       this.name = "LlmConfigurationError";
     }
   }
   ```

7. **Create Type Guards for Errors**:

   ```typescript
   export const isLlmConfigurationError = (
     error: unknown,
   ): error is LlmConfigurationError => {
     return error instanceof LlmConfigurationError;
   };

   export const hasFieldErrors = (result: LlmValidationResult): boolean => {
     return !result.valid && result.errors.length > 0;
   };
   ```

## Error Handling Patterns

- Field-level validation for individual inputs
- Provider-level validation for configuration completeness
- Security validation for sensitive fields
- Graceful error messages for user display

## Acceptance Criteria

- ✓ Comprehensive error code enumeration
- ✓ Type-safe error structures
- ✓ Support for field-level and provider-level errors
- ✓ Custom error class extends native Error
- ✓ Type guards for error checking
- ✓ JSDoc documentation for all types
- ✓ Unit tests for type guards and error class

## Testing

- Unit tests for custom error class
- Tests for type guard functions
- Verify error serialization for logging

## File Location

`packages/shared/src/types/llm-providers/validation.types.ts`

### Log
