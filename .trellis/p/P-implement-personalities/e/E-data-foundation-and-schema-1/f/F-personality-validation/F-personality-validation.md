---
id: F-personality-validation
title: Personality Validation Utilities
status: in-progress
priority: medium
parent: E-data-foundation-and-schema-1
prerequisites:
  - F-persistence-schema-and-type
affectedFiles:
  packages/shared/src/services/storage/utils/personalities/PersonalityValidationErrorCode.ts:
    Created comprehensive error code enumeration with 22 specific validation
    error codes covering all aspects of personality validation
  packages/shared/src/services/storage/utils/personalities/PersonalityValidationError.ts:
    Created interface for detailed validation errors with field context,
    messages, values, suggestions, and error codes
  packages/shared/src/services/storage/utils/personalities/PersonalityValidationWarning.ts:
    Created interface for non-critical validation warnings to improve data
    quality
  packages/shared/src/services/storage/utils/personalities/ValidationOptions.ts:
    Created interface for customizing validation behavior with configurable
    options
  packages/shared/src/services/storage/utils/personalities/PersonalityValidationResult.ts:
    Created interface for comprehensive validation results including errors,
    warnings, and performance metrics
  packages/shared/src/services/storage/utils/personalities/BulkValidationResult.ts:
    Created interface for bulk validation operations with aggregated results and
    summary statistics
  packages/shared/src/services/storage/utils/personalities/ValidationContext.ts: Created interface for validation context and audit information
  packages/shared/src/services/storage/utils/personalities/ExtendedValidationResult.ts:
    Created extended validation result interface for operations requiring
    detailed logging
  packages/shared/src/services/storage/utils/personalities/index.ts: Created barrel file exporting all validation types and interfaces
  packages/shared/src/services/storage/utils/personalities/__tests__/types.test.ts:
    Created comprehensive test suite with 19 test cases covering all type
    definitions, edge cases, and integration scenarios
log: []
schema: v1.0
childrenIds:
  - T-create-big-five-traits
  - T-create-complete-personalities
  - T-create-single-personality
  - T-create-validation-types-and
created: 2025-08-15T18:03:48.272Z
updated: 2025-08-15T18:03:48.272Z
---

# Personality Validation Utilities

## Purpose

Create comprehensive validation utilities for personality data integrity, including Big Five traits validation, behavior traits validation, and data consistency checks with clear error messaging.

## Key Components to Implement

### Validation Functions (`packages/shared/src/services/storage/utils/personalities/`)

- `validatePersonalitiesData.ts` - Complete personalities file validation
- `validateSinglePersonality.ts` - Individual personality validation
- `validateBigFiveTraits.ts` - Big Five specific validation
- `validateBehaviorTraits.ts` - Behavior traits validation
- `validatePersonalityUniqueness.ts` - ID and name uniqueness checks

### Error Handling Utilities

- Detailed validation error types
- User-friendly error messages
- Validation result aggregation
- Recovery suggestions for common issues

## Detailed Acceptance Criteria

### Big Five Traits Validation

- [ ] Each trait validates as number between 0-100 (inclusive)
- [ ] All five traits required (openness, conscientiousness, extraversion, agreeableness, neuroticism)
- [ ] Non-numeric values rejected with clear error message
- [ ] Decimal values accepted and properly handled
- [ ] Out-of-range values rejected with specific range information

### Behavior Traits Validation

- [ ] Record structure validates (string keys, number values)
- [ ] All values between 0-100 (inclusive)
- [ ] Empty behaviors object accepted
- [ ] Invalid behavior names handled gracefully
- [ ] Unknown behavior types logged but not rejected
- [ ] Decimal values accepted for behavior scores

### Personality Data Validation

- [ ] ID uniqueness enforced across all personalities
- [ ] Name uniqueness enforced (case-insensitive)
- [ ] Required fields presence checked
- [ ] Custom instructions length limit enforced (500 chars)
- [ ] Timestamp format validation (ISO datetime or null)
- [ ] Schema version compatibility checked

### Validation Error Reporting

- [ ] Specific error messages for each validation failure
- [ ] Field-level error identification
- [ ] Aggregated validation results
- [ ] User-friendly error descriptions
- [ ] Recovery suggestions included in error messages

## Implementation Guidance

### Validation Function Structure

```typescript
// validateSinglePersonality.ts
export interface PersonalityValidationResult {
  isValid: boolean;
  errors: PersonalityValidationError[];
  warnings: PersonalityValidationWarning[];
}

export interface PersonalityValidationError {
  field: string;
  message: string;
  value: any;
  suggestion?: string;
}

export function validateSinglePersonality(
  personality: unknown,
): PersonalityValidationResult {
  // Implementation using schema validation
  // + additional business logic validation
}
```

### Error Message Examples

- Big Five: "Openness must be between 0-100, received: 105"
- Behaviors: "Behavior 'analytical' must be between 0-100, received: -5"
- Name: "Personality name 'Creative Thinker' already exists"
- Custom Instructions: "Custom instructions exceed 500 character limit (current: 523)"

### Dependencies on Schema

- Leverage Zod schemas for base validation
- Add business logic validation on top
- Maintain consistency with schema error formats
- Use schema validation as foundation, not replacement

## Testing Requirements

- [ ] Unit tests for all validation functions
- [ ] Test valid data passes validation
- [ ] Test all error conditions trigger appropriate messages
- [ ] Test edge cases (empty strings, null values, extreme numbers)
- [ ] Test error message clarity and usefulness
- [ ] Test validation performance with large datasets
- [ ] 100% test coverage for validation logic

### Test Cases Coverage

- Valid personality data
- Invalid Big Five values (negative, over 100, non-numeric)
- Invalid behavior values
- Duplicate IDs and names
- Empty/null required fields
- Custom instructions over limit
- Invalid timestamp formats
- Corrupted JSON structures

## Security Considerations

- Input sanitization for custom instructions
- Protection against injection attacks through validation
- Safe handling of malformed data
- No sensitive information in error messages
- Validation of data types prevents type confusion attacks

## Performance Requirements

- Single personality validation completes within 5ms
- Bulk validation (100 personalities) completes within 100ms
- Efficient error aggregation without memory leaks
- Minimal CPU usage for validation operations
- Lazy validation where appropriate to avoid unnecessary work

## Integration Requirements

- Seamless integration with persistence schemas
- Compatible with existing UI validation patterns
- Usable from both desktop and shared packages
- Clear separation from UI-specific validation
- Consistent error format across all validation utilities

## Error Recovery Guidance

- Provide specific suggestions for fixing validation errors
- Include examples of correct data formats in error messages
- Guide users toward valid ranges and formats
- Suggest alternative values when appropriate
- Clear instructions for manual JSON editing scenarios
