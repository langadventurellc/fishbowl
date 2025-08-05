---
kind: task
id: T-create-error-formatting-and
parent: F-json-schema-and-validation
status: done
title: Create error formatting and validation message utilities
priority: normal
prerequisites:
  - T-create-runtime-configuration
created: "2025-08-05T01:33:51.672697"
updated: "2025-08-05T13:07:02.603460"
schema_version: "1.1"
worktree: null
---

## Task: Create error formatting and validation message utilities

Implement utilities for formatting Zod validation errors into user-friendly messages that integrate with the existing validation error system.

### Implementation Steps:

1. Create `packages/shared/src/types/llm-providers/validation/zodErrorUtils.ts`

2. Import validation types and Zod:

   ```typescript
   import { z } from "zod";
   import {
     LlmFieldValidationError,
     LlmValidationErrorCode,
     createFieldError,
     getDefaultErrorMessage,
   } from "./";
   import type { LlmFieldConfig } from "../LlmFieldConfig";
   import type { LlmValidationResult } from "./LlmValidationResult";
   import { createValidResult, createInvalidResult } from "./";
   ```

3. Implement Zod to validation error converter:

   ```typescript
   export function zodToFieldErrors(
     zodError: z.ZodError,
     fieldConfigs?: LlmFieldConfig[],
   ): LlmFieldValidationError[] {
     return zodError.issues.map((issue) => {
       const fieldId = issue.path[issue.path.length - 1]?.toString() || "";
       const field = fieldConfigs?.find((f) => f.id === fieldId);

       return createFieldError({
         fieldId,
         code: mapZodCodeToErrorCode(issue.code),
         message: formatZodMessage(issue, field),
         value: issue.input,
       });
     });
   }
   ```

4. Create error code mapping:

   ```typescript
   function mapZodCodeToErrorCode(zodCode: string): LlmValidationErrorCode {
     switch (zodCode) {
       case "too_small":
         return "REQUIRED_FIELD_MISSING";
       case "invalid_type":
         return "INVALID_FIELD_TYPE";
       case "invalid_string":
         return "INVALID_FIELD_FORMAT";
       default:
         return "VALIDATION_FAILED";
     }
   }
   ```

5. Implement custom message formatting:

   ```typescript
   export function formatZodMessage(
     issue: z.ZodIssue,
     field?: LlmFieldConfig,
   ): string {
     // Provide field-specific messages
     if (field) {
       switch (issue.code) {
         case z.ZodIssueCode.too_small:
           if (field.type === "text" || field.type === "secure-text") {
             return `${field.label} is required`;
           }
           break;
         case z.ZodIssueCode.invalid_type:
           return `${field.label} must be a ${issue.expected}`;
       }
     }

     // Fall back to default messages
     return issue.message;
   }
   ```

6. Create path formatting utilities:

   ```typescript
   export function formatFieldPath(path: (string | number)[]): string {
     return path
       .map((segment) =>
         typeof segment === "number" ? `[${segment}]` : `.${segment}`,
       )
       .join("")
       .replace(/^\./, "");
   }

   export function getFieldFromPath(
     path: (string | number)[],
     fields: LlmFieldConfig[],
   ): LlmFieldConfig | undefined {
     // Extract field ID from nested paths like ['providers', 0, 'configuration', 'fields', 1, 'id']
     const fieldIndex = path.indexOf("fields");
     if (fieldIndex !== -1 && path[fieldIndex + 2] === "id") {
       const id = path[fieldIndex + 3];
       return fields.find((f) => f.id === id);
     }
     return undefined;
   }
   ```

7. Create validation result builder:

   ```typescript
   export function buildValidationResult(
     zodResult: z.SafeParseReturnType<any, any>,
     fieldConfigs?: LlmFieldConfig[],
   ): LlmValidationResult {
     if (zodResult.success) {
       return createValidResult();
     }

     return createInvalidResult(
       zodToFieldErrors(zodResult.error, fieldConfigs),
     );
   }
   ```

8. Update the existing barrel export at `packages/shared/src/types/llm-providers/validation/index.ts`:
   ```typescript
   // Add to existing exports
   export * from "./zodErrorUtils";
   ```

### Technical Approach:

- Map Zod error codes to existing validation error codes
- Provide context-aware error messages
- Support nested path resolution
- Integrate with existing error utilities

### Acceptance Criteria:

- ✓ Zod errors converted to LlmFieldValidationError
- ✓ Error codes properly mapped
- ✓ Custom messages use field labels
- ✓ Nested paths handled correctly
- ✓ Integration with existing error system
- ✓ Unit tests for all scenarios
- ✓ Helpful error messages for users

### Testing:

Create `packages/shared/src/types/llm-providers/validation/__tests__/zodErrorUtils.test.ts`:

- All Zod error types
- Field-specific message formatting
- Nested path resolution
- Array validation errors
- Custom refinement errors
- Integration with validation result

### User Experience:

- Error messages reference field labels, not IDs
- Clear indication of what's wrong
- Actionable error messages
- Consistent with existing error patterns

### Related:

- Validation types: `packages/shared/src/types/llm-providers/validation/`
- Error utilities: Already implemented in validation subdirectory
- Pattern: `packages/shared/src/services/storage/utils/createFieldErrors.ts`

### Log

**2025-08-05T18:38:38.627833Z** - Implemented utilities for formatting Zod validation errors into user-friendly messages that integrate with the existing validation error system. Created separate files following project conventions (one export per file) and comprehensive test coverage. All utilities provide field-specific error messages using field labels instead of IDs, with proper error code mapping and support for nested field paths.

- filesChanged: ["packages/shared/src/types/llm-providers/validation/mapZodCodeToErrorCode.ts", "packages/shared/src/types/llm-providers/validation/formatZodMessage.ts", "packages/shared/src/types/llm-providers/validation/zodToFieldErrors.ts", "packages/shared/src/types/llm-providers/validation/formatFieldPath.ts", "packages/shared/src/types/llm-providers/validation/getFieldFromPath.ts", "packages/shared/src/types/llm-providers/validation/buildValidationResult.ts", "packages/shared/src/types/llm-providers/validation/index.ts", "packages/shared/src/types/llm-providers/validation/__tests__/zodErrorUtils.test.ts"]
