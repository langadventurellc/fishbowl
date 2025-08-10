---
id: F-schema-validation-integration
title: Schema Validation Integration
status: done
priority: medium
parent: E-data-foundation-and-schema
prerequisites:
  - F-legacy-roles-code-cleanup
affectedFiles: {}
log:
  - >-
    ## General-purpose validation utilities consolidated
    (T-consolidate-general-purpose completed)


    The following validation utility files have been moved from scattered
    locations to a centralized validation folder:


    ### Moved Files (Old → New Location):


    **Timestamp/Date Validation:**

    - `packages/shared/src/services/storage/utils/roles/isValidTimestamp.ts` →
    `packages/shared/src/validation/isValidTimestamp.ts`


    **JSON Utilities:**

    - `packages/shared/src/services/storage/utils/isJsonSerializable.ts` →
    `packages/shared/src/validation/isJsonSerializable.ts`

    - `packages/shared/src/services/storage/utils/safeJsonStringify.ts` →
    `packages/shared/src/validation/safeJsonStringify.ts`

    - `packages/shared/src/services/storage/utils/safeJsonParse.ts` →
    `packages/shared/src/validation/safeJsonParse.ts`

    - `packages/shared/src/services/storage/utils/isValidJson.ts` →
    `packages/shared/src/validation/isValidJson.ts`


    **Schema/Version Validation:**

    - `packages/shared/src/services/storage/utils/isValidSchemaVersion.ts` →
    `packages/shared/src/validation/isValidSchemaVersion.ts`

    - `packages/shared/src/services/storage/utils/parseSchemaVersion.ts` →
    `packages/shared/src/validation/parseSchemaVersion.ts`

    - `packages/shared/src/services/storage/utils/validateWithSchema.ts` →
    `packages/shared/src/validation/validateWithSchema.ts`


    **Path/Security Utilities:**

    - `packages/shared/src/services/storage/utils/validatePath.ts` →
    `packages/shared/src/validation/validatePath.ts`

    - `packages/shared/src/services/storage/utils/isPathSafe.ts` →
    `packages/shared/src/validation/isPathSafe.ts`

    - `packages/shared/src/services/storage/utils/sanitizePath.ts` →
    `packages/shared/src/validation/sanitizePath.ts`


    **Object Utilities:**

    - `packages/shared/src/services/storage/utils/deepMerge.ts` →
    `packages/shared/src/validation/deepMerge.ts`


    **Error Handling/Formatting:**

    - `packages/shared/src/types/llmConfig/sanitizeValue.ts` →
    `packages/shared/src/validation/sanitizeValue.ts`

    - `packages/shared/src/types/llmConfig/groupErrorsByField.ts` →
    `packages/shared/src/validation/groupErrorsByField.ts`

    - `packages/shared/src/types/llmConfig/formatZodErrors.ts` →
    `packages/shared/src/validation/formatZodErrors.ts`


    **Validation Types:**

    - `packages/shared/src/types/validation/ValidationResult.ts` →
    `packages/shared/src/validation/ValidationResult.ts`


    ### Created Files:

    - `packages/shared/src/validation/index.ts` - Barrel exports for all
    validation utilities


    ### Impact:

    - All import references updated throughout codebase

    - Improved discoverability of general-purpose validation utilities

    - Centralized location makes code maintenance easier

    - All quality checks pass (lint, format, type-check, tests)
schema: v1.0
childrenIds:
  - T-document-validation-patterns
  - T-implement-error-recovery-and
  - T-create-comprehensive-roles
  - T-create-roles-specific-error
  - T-create-validaterolesdata
  - T-create-validation-helper
created: 2025-08-09T19:39:51.928Z
updated: 2025-08-09T19:39:51.928Z
---

# Schema Validation Integration Feature

## Purpose and Functionality

Integrate the new roles schema validation throughout the application, implement comprehensive error handling for validation failures, and establish patterns for handling both programmatic and direct JSON file edits. This feature ensures the new schema works reliably in all scenarios and provides excellent developer and user experience.

## Key Components to Implement

### Validation Integration

- **Schema Error Handling**: Implement proper error handling for validation failures
- **Null Timestamp Support**: Ensure graceful handling of missing timestamps from direct JSON edits
- **Integration Testing**: Comprehensive tests to verify schema works in all scenarios
- **Pattern Consistency**: Align validation patterns with existing settings implementations

### Error Handling Implementation

- **Validation Error Messages**: User-friendly error messages for schema violations
- **Error Recovery**: Graceful fallbacks when validation fails
- **Debug Information**: Developer-friendly error details for troubleshooting
- **Error Propagation**: Proper error bubbling through application layers

## Detailed Acceptance Criteria

### Schema Validation Integration Requirements

- [ ] **Programmatic Validation**: Schema validates data created through application UI
  - New roles created through forms validate successfully
  - Updated roles pass validation with proper field constraints
  - Generated default configuration validates against schema
  - All CRUD operations produce schema-compliant data

- [ ] **Direct JSON Edit Support**: Schema handles manually edited JSON files gracefully
  - Missing timestamp fields (createdAt, updatedAt) don't cause validation failures
  - Invalid field values produce clear error messages rather than crashes
  - Corrupted JSON structure handled with appropriate error reporting
  - Partial or incomplete role data handled gracefully

- [ ] **Field Constraint Enforcement**: All validation rules properly enforced
  - Name field: Required, 1-100 character limit enforced
  - Description field: 500 character limit enforced
  - SystemPrompt field: 5000 character limit enforced
  - ID field: Required, non-empty string validation
  - Timestamp fields: Optional, valid ISO datetime when present

### Error Handling Requirements

- [ ] **User-Friendly Error Messages**: Validation errors presented clearly to users
  - Field-specific errors identify which field failed validation
  - Character limit errors show current vs maximum character counts
  - Missing required fields clearly identified by name
  - Multiple validation errors presented as organized list

- [ ] **Developer Error Information**: Detailed error context for debugging
  - Schema path information for nested validation failures
  - Original data values that caused validation failures
  - Error codes or types for programmatic error handling
  - Stack trace preservation for unexpected validation errors

- [ ] **Error Recovery and Fallbacks**: Graceful handling of validation failures
  - Invalid roles.json files don't crash application
  - Partial validation failures don't corrupt entire dataset
  - Fallback to default configuration when file completely invalid
  - User prompted with recovery options for fixable validation errors

### Integration Pattern Requirements

- [ ] **Existing Pattern Consistency**: Validation follows established settings patterns
  - Error handling matches general/appearance/advanced settings approach
  - Validation timing consistent with other settings (immediate vs on-save)
  - Error message formatting matches application-wide standards
  - Loading and error states follow existing UI patterns

- [ ] **Performance Requirements**: Validation performs efficiently in all scenarios
  - Large roles files (50+ roles) validate within 100ms
  - Real-time validation during form editing doesn't delay user input
  - Batch validation of multiple roles completes efficiently
  - Memory usage remains reasonable during validation operations

## Implementation Guidance

### Validation Integration Points

- **File Loading**: Validate roles.json during application startup
- **Form Submission**: Validate individual roles before saving
- **Batch Operations**: Validate entire roles array during bulk operations
- **Error Boundaries**: Implement validation at appropriate application boundaries

### Error Handling Strategy

```typescript
// Example error handling approach
try {
  const validatedRoles = rolesSettingsSchema.parse(rawData);
  return validatedRoles;
} catch (error) {
  if (error instanceof ZodError) {
    // Convert to user-friendly format
    return handleSchemaValidationError(error);
  }
  // Handle unexpected errors
  throw new RolesValidationError("Unexpected validation failure", error);
}
```

### Testing Strategy

- Unit tests for schema validation with various data inputs
- Integration tests for error handling across application layers
- Edge case testing with malformed and incomplete data
- Performance testing with large role datasets

## Testing Requirements

### Validation Testing

- [ ] **Valid Data Testing**: All valid role configurations pass validation
  - Complete role objects with all required fields
  - Role objects with optional null timestamps
  - Default configuration from factory function
  - Edge cases like minimum and maximum character limits

- [ ] **Invalid Data Testing**: Invalid configurations produce appropriate errors
  - Missing required fields (id, name)
  - Fields exceeding character limits (name > 100, description > 500, systemPrompt > 5000)
  - Invalid data types (non-strings, non-ISO dates)
  - Empty strings in required fields

- [ ] **Error Message Testing**: Validation errors provide helpful information
  - Error messages reference specific field names
  - Character limit errors include current and maximum counts
  - Multiple errors presented in organized, readable format
  - Error messages actionable for both users and developers

### Integration Testing

- [ ] **Application Integration**: Schema validation works throughout application
  - File loading validation during application startup
  - Form validation during role creation and editing
  - Error handling doesn't crash UI components
  - Loading states properly managed during validation

- [ ] **Performance Testing**: Validation meets performance requirements
  - Large role files validate within specified time limits
  - Real-time validation doesn't impact form responsiveness
  - Memory usage remains stable during validation operations
  - Error generation doesn't significantly impact performance

## Security Considerations

### Input Validation Security

- Prevent injection attacks through system prompt validation
- Validate role names to prevent script injection in UI contexts
- Ensure schema validation can't be bypassed through malformed input
- Handle special characters safely in all role fields

### Error Information Security

- Don't expose sensitive system information in error messages
- Validate that error messages can't reveal file system structure
- Ensure error logs don't contain sensitive user data

## Performance Requirements

### Validation Performance

- Schema validation completes in <10ms for typical role data (1-20 roles)
- Large role files (50+ roles) validate within 100ms
- Real-time validation during form editing responds within 50ms
- Error message generation doesn't significantly impact validation time

### Memory and Resource Usage

- Validation doesn't create memory leaks during repeated operations
- Schema objects reused efficiently without recreation
- Error object creation doesn't consume excessive memory
- Validation process doesn't block main application thread

## Dependencies

- **Prerequisites**: F-legacy-roles-code-cleanup (clean foundation required for integration)
- **Dependents**: Next epic's features will rely on working validation

## Success Metrics

- All schema validation scenarios work correctly (programmatic and direct JSON edits)
- Error messages provide clear, actionable feedback for users and developers
- Validation performance meets requirements under all test conditions
- Integration follows existing application patterns consistently
- No crashes or data corruption when validation fails
- Comprehensive test coverage for all validation scenarios
- User experience smooth even when validation errors occur
