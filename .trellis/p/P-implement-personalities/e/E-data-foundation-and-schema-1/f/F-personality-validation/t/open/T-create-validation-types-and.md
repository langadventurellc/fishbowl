---
id: T-create-validation-types-and
title: Create validation types and error interfaces
status: open
priority: high
parent: F-personality-validation
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-15T18:07:54.159Z
updated: 2025-08-15T18:07:54.159Z
---

# Create Validation Types and Error Interfaces

## Context

Establish the foundational type definitions for personality validation, including error types, warning types, and validation result interfaces that will be used across all validation utilities.

## Implementation Requirements

### Directory: `packages/shared/src/services/storage/utils/personalities/`

Create the directory structure and foundational types file.

### File: `packages/shared/src/services/storage/utils/personalities/types.ts`

Create comprehensive validation types:

```typescript
/**
 * Result of personality validation containing status and any issues found
 */
export interface PersonalityValidationResult {
  isValid: boolean;
  errors: PersonalityValidationError[];
  warnings: PersonalityValidationWarning[];
}

/**
 * Specific validation error with field context and recovery suggestions
 */
export interface PersonalityValidationError {
  field: string;
  message: string;
  value: any;
  suggestion?: string;
  errorCode?: string;
}

/**
 * Non-critical validation warning for data quality issues
 */
export interface PersonalityValidationWarning {
  field: string;
  message: string;
  value: any;
  suggestion?: string;
}

/**
 * Options for customizing validation behavior
 */
export interface ValidationOptions {
  allowUnknownBehaviors?: boolean;
  strictTimestamps?: boolean;
  maxCustomInstructionsLength?: number;
}

/**
 * Result of bulk validation for multiple personalities
 */
export interface BulkValidationResult {
  isValid: boolean;
  validPersonalities: number;
  totalPersonalities: number;
  personalityResults: Map<string, PersonalityValidationResult>;
  globalErrors: PersonalityValidationError[];
}
```

## Acceptance Criteria

- [ ] Directory created at: `packages/shared/src/services/storage/utils/personalities/`
- [ ] Types file created with all required interfaces
- [ ] `PersonalityValidationResult` includes isValid flag, errors, and warnings
- [ ] `PersonalityValidationError` includes field, message, value, and optional suggestion
- [ ] `PersonalityValidationWarning` for non-critical issues
- [ ] `ValidationOptions` for customizing validation behavior
- [ ] `BulkValidationResult` for validating multiple personalities
- [ ] Comprehensive JSDoc documentation on all exported types
- [ ] Error codes enumeration for programmatic error handling
- [ ] TypeScript compilation successful with no errors
- [ ] All types properly exported from barrel file

## Testing Requirements (include in this task)

- Test type definitions compile correctly
- Test interfaces accept expected data structures
- Test error and warning interfaces have required properties
- Verify types integrate properly with TypeScript type checking
