---
kind: task
id: T-create-field-specific-validators
parent: F-json-schema-and-validation
status: done
title: Create field-specific validators with custom rules
priority: low
prerequisites:
  - T-create-runtime-configuration
created: "2025-08-05T01:35:11.407642"
updated: "2025-08-05T14:18:11.015992"
schema_version: "1.1"
worktree: null
---

## Task: Create field-specific validators with custom rules

Implement validators for specific field types with custom validation rules beyond basic type checking.

### Implementation Steps:

1. Create `packages/shared/src/types/llm-providers/validation/fieldValidators.ts`

2. Import field types and validation utilities:

   ```typescript
   import { z } from "zod";
   import type {
     LlmFieldConfig,
     TextField,
     SecureTextField,
     CheckboxField,
     FieldValueType,
     LlmValidationResult,
   } from "../";
   import {
     createValidResult,
     createFieldError,
     createInvalidResult,
   } from "./";
   import { buildValidationResult } from "./zodErrorUtils";
   import type { LlmFieldValidationError } from "./LlmFieldValidationError";
   ```

3. Implement base field validator:

   ```typescript
   export abstract class BaseFieldValidator<T extends LlmFieldConfig> {
     constructor(protected field: T) {}

     abstract validate(value: unknown): LlmValidationResult;

     protected validateRequired(
       value: unknown,
     ): LlmFieldValidationError | null {
       if (this.field.required && !this.hasValue(value)) {
         return createFieldError({
           fieldId: this.field.id,
           code: "REQUIRED_FIELD_MISSING",
           message: `${this.field.label} is required`,
           value,
         });
       }
       return null;
     }

     protected abstract hasValue(value: unknown): boolean;
   }
   ```

4. Implement text field validator:

   ```typescript
   export class TextFieldValidator extends BaseFieldValidator<TextField> {
     private schema: z.ZodString;

     constructor(field: TextField) {
       super(field);
       this.schema = z.string();

       // Add custom validations based on field config
       if (field.minLength) {
         this.schema = this.schema.min(
           field.minLength,
           `${field.label} must be at least ${field.minLength} characters`,
         );
       }
       if (field.maxLength) {
         this.schema = this.schema.max(
           field.maxLength,
           `${field.label} must be at most ${field.maxLength} characters`,
         );
       }
       if (field.pattern) {
         this.schema = this.schema.regex(
           new RegExp(field.pattern),
           field.patternError || `${field.label} format is invalid`,
         );
       }
     }

     validate(value: unknown): LlmValidationResult {
       // Check required
       const requiredError = this.validateRequired(value);
       if (requiredError) {
         return createInvalidResult([requiredError]);
       }

       // Skip validation if optional and empty
       if (!this.field.required && !this.hasValue(value)) {
         return createValidResult();
       }

       // Validate with schema
       const result = this.schema.safeParse(value);
       if (!result.success) {
         return buildValidationResult(result, [this.field]);
       }

       return createValidResult();
     }

     protected hasValue(value: unknown): boolean {
       return typeof value === "string" && value.trim().length > 0;
     }
   }
   ```

5. Implement secure text validator with additional rules:

   ```typescript
   export class SecureTextFieldValidator extends BaseFieldValidator<SecureTextField> {
     validate(value: unknown): LlmValidationResult {
       // Basic validation same as text
       const textValidator = new TextFieldValidator(this.field as any);
       const result = textValidator.validate(value);
       if (!result.valid) return result;

       // Additional security validations
       if (this.field.validateStrength && typeof value === "string") {
         const strength = this.checkPasswordStrength(value);
         if (strength < 3) {
           return createInvalidResult([
             createFieldError({
               fieldId: this.field.id,
               code: "WEAK_PASSWORD",
               message:
                 "Password is too weak. Use uppercase, lowercase, numbers, and symbols.",
               value: "[REDACTED]",
             }),
           ]);
         }
       }

       return createValidResult();
     }

     private checkPasswordStrength(password: string): number {
       let strength = 0;
       if (password.length >= 8) strength++;
       if (/[a-z]/.test(password)) strength++;
       if (/[A-Z]/.test(password)) strength++;
       if (/[0-9]/.test(password)) strength++;
       if (/[^A-Za-z0-9]/.test(password)) strength++;
       return strength;
     }
   }
   ```

6. Create validator factory:

   ```typescript
   export class FieldValidatorFactory {
     static create(field: LlmFieldConfig): BaseFieldValidator<any> {
       switch (field.type) {
         case "text":
           return new TextFieldValidator(field);
         case "secure-text":
           return new SecureTextFieldValidator(field);
         case "checkbox":
           return new CheckboxFieldValidator(field);
         default:
           throw new Error(`Unknown field type: ${(field as any).type}`);
       }
     }

     static validateField(
       value: unknown,
       field: LlmFieldConfig,
     ): LlmValidationResult {
       const validator = this.create(field);
       return validator.validate(value);
     }
   }
   ```

7. Update the existing barrel export at `packages/shared/src/types/llm-providers/validation/index.ts`:
   ```typescript
   // Add to existing exports
   export * from "./fieldValidators";
   ```

### Technical Approach:

- Use inheritance for shared validation logic
- Factory pattern for validator creation
- Extensible for future field types
- Custom validation rules per field type

### Acceptance Criteria:

- ✓ Base validator with required field logic
- ✓ Text field validator with length/pattern rules
- ✓ Secure text validator with strength checking
- ✓ Checkbox field validator
- ✓ Factory for creating validators
- ✓ Integration with validation result types
- ✓ Unit tests for all validators

### Testing:

Create `packages/shared/src/types/llm-providers/validation/__tests__/fieldValidators.test.ts`:

- Required field validation
- Optional empty fields
- Text length constraints
- Pattern matching
- Password strength rules
- Checkbox boolean validation
- Factory creation logic

### Future Extensions:

- URL validation for text fields
- Email validation patterns
- Number field validators
- Date field validators

### Related:

- Field types: `packages/shared/src/types/llm-providers/field.types.ts`
- Validation types: `packages/shared/src/types/llm-providers/validation/`

### Log

**2025-08-05T21:12:45.868528Z** - Implemented comprehensive field-specific validators with custom validation rules for LLM provider configurations. Created a class-based inheritance architecture using factory pattern for extensible field validation beyond basic type checking.

Key Components Implemented:

- BaseFieldValidator: Abstract base class providing shared required field validation logic
- TextFieldValidator: Handles text fields with minLength, maxLength, and regex pattern validation using Zod schemas
- SecureTextFieldValidator: Extends TextFieldValidator with password strength checking for fields identified by naming conventions (password, secret, pass)
- CheckboxFieldValidator: Boolean validation with null/undefined normalization to false
- FieldValidatorFactory: Factory pattern for creating appropriate validators and direct field validation

Enhanced Error Handling:

- Added WEAK_PASSWORD error code to LlmValidationErrorCode enum
- Updated getDefaultErrorMessage with appropriate password strength message
- Comprehensive error messages with field context

Architecture Features:

- Inheritance-based shared validation logic
- Factory pattern for validator creation
- Extensible design for future field types
- Integration with existing Zod validation infrastructure
- Cross-platform compatibility in shared package

Quality Assurance:

- Comprehensive unit test coverage (28 tests, 100% passing)
- TypeScript strict mode compliance
- All linting, formatting, and type checks passing
- Follows project's single-export-per-file convention
- Fixed validation logic to properly handle type checking for optional fields
- filesChanged: ["packages/shared/src/types/llm-providers/validation/LlmValidationErrorCode.ts", "packages/shared/src/types/llm-providers/validation/getDefaultErrorMessage.ts", "packages/shared/src/types/llm-providers/validation/BaseFieldValidator.ts", "packages/shared/src/types/llm-providers/validation/TextFieldValidator.ts", "packages/shared/src/types/llm-providers/validation/SecureTextFieldValidator.ts", "packages/shared/src/types/llm-providers/validation/CheckboxFieldValidator.ts", "packages/shared/src/types/llm-providers/validation/FieldValidatorFactory.ts", "packages/shared/src/types/llm-providers/validation/fieldValidators.ts", "packages/shared/src/types/llm-providers/validation/index.ts", "packages/shared/src/types/llm-providers/validation/__tests__/fieldValidators.test.ts"]
