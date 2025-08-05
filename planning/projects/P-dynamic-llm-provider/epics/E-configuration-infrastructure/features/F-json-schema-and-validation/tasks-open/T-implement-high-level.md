---
kind: task
id: T-implement-high-level
title: Implement high-level configuration validator service
status: open
priority: normal
prerequisites:
  - T-create-error-formatting-and
  - T-implement-schema-inference-and
created: "2025-08-05T01:34:32.766516"
updated: "2025-08-05T01:34:32.766516"
schema_version: "1.1"
parent: F-json-schema-and-validation
---

## Task: Implement high-level configuration validator service

Create the main validation service that provides high-level validation functions for provider configurations, integrating all schemas and utilities.

### Implementation Steps:

1. Create `packages/shared/src/types/llm-providers/validation/validationService.ts`

2. Import all schemas and utilities:

   ```typescript
   import {
     LlmProvidersFileSchema,
     LlmProviderConfigSchema,
     validateConfigurationValues,
   } from "./";
   import { buildValidationResult, zodToFieldErrors } from "./zodErrorUtils";
   import type {
     LlmValidationResult,
     LlmProviderDefinition,
     LlmConfigurationValues,
   } from "../";
   import type { LlmFieldValidationError } from "./LlmFieldValidationError";
   import {
     createFieldError,
     createInvalidResult,
     createValidResult,
   } from "./";
   ```

3. Implement file validation:

   ```typescript
   export class LlmProviderConfigurationValidator {
     /**
      * Validate a complete provider configuration file
      */
     static validateFile(data: unknown): LlmValidationResult {
       const result = LlmProvidersFileSchema.safeParse(data);
       return buildValidationResult(result);
     }

     /**
      * Validate with detailed error reporting
      */
     static validateFileWithDetails(data: unknown): {
       result: LlmValidationResult;
       providers?: Array<{ id: string; valid: boolean; errors: string[] }>;
     } {
       const result = this.validateFile(data);

       if (!result.valid || !isProvidersFile(data)) {
         return { result };
       }

       // Validate each provider individually for detailed feedback
       const providers = data.providers.map((provider) => ({
         id: provider.id,
         ...this.validateProvider(provider),
       }));

       return { result, providers };
     }
   }
   ```

4. Implement provider validation:

   ```typescript
   /**
    * Validate a single provider configuration
    */
   static validateProvider(data: unknown): LlmValidationResult {
     const result = LlmProviderConfigSchema.safeParse(data);
     return buildValidationResult(result);
   }

   /**
    * Validate provider with business rules
    */
   static validateProviderWithRules(
     provider: LlmProviderDefinition
   ): LlmValidationResult {
     // Schema validation
     const schemaResult = this.validateProvider(provider);
     if (!schemaResult.valid) return schemaResult;

     // Business rule validation
     const errors: LlmFieldValidationError[] = [];

     // Check for duplicate field IDs
     const fieldIds = provider.configuration.fields.map(f => f.id);
     const duplicates = fieldIds.filter((id, i) => fieldIds.indexOf(id) !== i);
     if (duplicates.length > 0) {
       errors.push(createFieldError({
         fieldId: '',
         code: 'DUPLICATE_FIELD_ID',
         message: `Duplicate field IDs: ${duplicates.join(', ')}`
       }));
     }

     // More business rules...

     return errors.length > 0
       ? createInvalidResult(errors)
       : createValidResult();
   }
   ```

5. Implement incremental validation:

   ```typescript
   /**
    * Validate configuration values against provider fields
    */
   static validateValues(
     values: LlmConfigurationValues,
     provider: LlmProviderDefinition
   ): LlmValidationResult {
     return validateConfigurationValues(values, provider.configuration.fields);
   }

   /**
    * Validate partial update
    */
   static validatePartialValues(
     updates: Partial<LlmConfigurationValues>,
     currentValues: LlmConfigurationValues,
     provider: LlmProviderDefinition
   ): LlmValidationResult {
     const merged = { ...currentValues, ...updates };
     const errors: LlmFieldValidationError[] = [];

     // Only validate updated fields
     for (const [fieldId, value] of Object.entries(updates)) {
       const field = provider.configuration.fields.find(f => f.id === fieldId);
       if (!field) {
         errors.push(createFieldError({
           fieldId,
           code: 'UNKNOWN_FIELD',
           message: `Unknown field: ${fieldId}`
         }));
         continue;
       }

       // Validate individual field
       const fieldResult = this.validateFieldValue(value, field);
       if (!fieldResult.valid) {
         errors.push(...fieldResult.errors);
       }
     }

     return errors.length > 0
       ? createInvalidResult(errors)
       : createValidResult();
   }
   ```

6. Add development helpers:

   ```typescript
   /**
    * Development-time validation with console output
    */
   static validateWithLogging(
     data: unknown,
     context: string = 'Validation'
   ): LlmValidationResult {
     const result = this.validateFile(data);

     if (!result.valid && process.env.NODE_ENV === 'development') {
       console.error(`[${context}] Validation failed:`);
       result.errors.forEach(error => {
         console.error(`  - ${error.fieldId}: ${error.message}`);
       });
     }

     return result;
   }
   ```

7. Update the existing barrel export at `packages/shared/src/types/llm-providers/validation/index.ts`:
   ```typescript
   // Add to existing exports
   export * from "./validationService";
   ```

### Technical Approach:

- Provide multiple validation levels (file, provider, values)
- Support partial validation for updates
- Include detailed error reporting
- Add development-time helpers
- Keep validator stateless and pure

### Acceptance Criteria:

- ✓ Complete file validation with all rules
- ✓ Individual provider validation
- ✓ Configuration values validation
- ✓ Partial update validation
- ✓ Detailed error reporting mode
- ✓ Development helpers
- ✓ Performance < 10ms for typical files
- ✓ Comprehensive unit tests

### Testing:

Create `packages/shared/src/types/llm-providers/validation/__tests__/validationService.test.ts`:

- Valid configuration files
- Invalid files with various errors
- Provider-level validation
- Value validation against fields
- Partial updates
- Large files performance
- Error detail reporting

### Documentation:

Include JSDoc with examples:

- Basic validation usage
- Partial validation patterns
- Error handling strategies
- Development vs production usage

### Related:

- All schemas and utilities from previous tasks
- Existing validation types
- Pattern: `packages/shared/src/repositories/settings/SettingsRepository.ts`

### Log
