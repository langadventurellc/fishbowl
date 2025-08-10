---
id: T-document-validation-patterns
title: Document validation patterns and create integration examples
status: open
priority: low
parent: F-schema-validation-integration
prerequisites:
  - T-create-validaterolesdata
  - T-create-roles-specific-error
  - T-create-validation-helper
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
childrenIds: []
created: 2025-08-10T03:04:34.106Z
updated: 2025-08-10T03:04:34.106Z
---

# Document Validation Patterns and Create Integration Examples

## Context

Create comprehensive documentation for the roles validation integration patterns to ensure consistent usage across the application and provide clear guidance for other developers working with the roles validation system.

## Documentation Requirements

### Primary Documentation File

- **Location**: `packages/shared/src/services/storage/utils/README-roles-validation.md`
- **Purpose**: Complete guide to using roles validation functions
- **Audience**: Developers working with roles data in any part of the application

### Documentation Sections

#### 1. Overview and Architecture

- Explanation of roles validation integration with existing patterns
- Relationship to `SettingsValidationError` and existing validation infrastructure
- Integration points with `rolesSettingsSchema` and file persistence layers
- Performance characteristics and limitations

#### 2. Function Reference

- Complete API documentation for all validation functions
- Parameter descriptions and return value specifications
- Error scenarios and exception handling
- Performance expectations and usage guidelines

#### 3. Usage Patterns

- Common validation scenarios with code examples
- Best practices for error handling and user feedback
- Integration with UI components and form validation
- Batch validation and recovery scenarios

#### 4. Error Handling Guide

- Complete error handling patterns and examples
- User-friendly error message formatting
- Recovery scenarios and fallback strategies
- Debugging validation issues

#### 5. Performance Guidelines

- Performance expectations for different data sizes
- Memory usage considerations
- Optimization strategies for large role datasets
- Monitoring and profiling validation performance

### Code Examples and Integration Patterns

#### Example 1: Basic Role Validation

```typescript
// File loading scenario
try {
  const rolesData = await loadRolesFromFile(filePath);
  const validatedRoles = validateRolesData(
    rolesData,
    persistedRolesSettingsSchema,
    filePath,
    "fileLoad",
  );
  return validatedRoles;
} catch (error) {
  if (error instanceof SettingsValidationError) {
    // Handle validation errors with user-friendly messages
    showValidationErrors(error.fieldErrors);
  }
  throw error;
}
```

#### Example 2: Form Validation Integration

```typescript
// UI form validation
const validateRoleForm = (formData: RoleFormData) => {
  const { isValid, errors } = validateRoleFormData(formData);

  if (!isValid) {
    // Display field-specific errors in UI
    errors.forEach((error) => {
      highlightFieldError(error.field, error.message);
    });
    return false;
  }

  return true;
};
```

#### Example 3: Batch Processing with Recovery

```typescript
// Import validation with partial recovery
const processImportedRoles = async (importData: unknown[]) => {
  const { validRoles, errors } = validateRolesArray(importData, true);

  if (errors.length > 0) {
    // Show summary of validation issues
    const summary = createRolesValidationSummary(errors);
    showImportSummary(validRoles.length, errors.length, summary);
  }

  // Continue with valid roles
  await saveRoles(validRoles);
  return { imported: validRoles.length, skipped: errors.length };
};
```

### Integration Documentation

#### With File Persistence Layer

- How validation integrates with file loading/saving operations
- Error propagation patterns from validation to file operation callers
- Recovery scenarios when file data is partially corrupted
- Performance considerations for file validation operations

#### With UI Components

- Integration patterns for form validation and error display
- Real-time validation during user input
- Error message formatting for UI consumption
- Loading states and progress indication during validation

#### With State Management

- Validation integration with Zustand stores and state updates
- Error handling in store operations and state consistency
- Optimistic updates with validation rollback strategies
- Cache invalidation and state cleanup after validation errors

## Acceptance Criteria

### Documentation Quality

- [ ] **Complete coverage**: All validation functions documented with examples
- [ ] **Clear explanations**: Technical concepts explained clearly for different skill levels
- [ ] **Practical examples**: Real-world usage scenarios with complete code examples
- [ ] **Error scenarios**: All error conditions documented with handling strategies
- [ ] **Performance guidance**: Clear expectations and optimization recommendations

### Integration Patterns

- [ ] **Consistent patterns**: All examples follow established application patterns
- [ ] **Error handling consistency**: Error handling matches existing application standards
- [ ] **Type safety examples**: All examples demonstrate proper TypeScript usage
- [ ] **Testing examples**: Include examples of how to test validation integration
- [ ] **Best practices**: Clear guidance on validation best practices

### Developer Experience

- [ ] **Easy to find**: Documentation easily discoverable in codebase
- [ ] **Quick reference**: Summary sections for quick lookup during development
- [ ] **Copy-paste examples**: Code examples that can be directly used or adapted
- [ ] **Troubleshooting**: Common issues and solutions clearly documented
- [ ] **Migration guide**: If updating existing code, provide migration examples

### Technical Documentation

- [ ] **API reference**: Complete function signatures and parameter documentation
- [ ] **Performance specs**: Documented performance expectations and limits
- [ ] **Dependencies**: Clear documentation of required imports and dependencies
- [ ] **Version compatibility**: Any version-specific considerations documented
- [ ] **Testing approach**: Guidance on testing code that uses validation functions

## Additional Documentation Files

### JSDoc Comments

- Complete JSDoc documentation for all public functions
- Parameter descriptions with types and constraints
- Return value documentation with possible error conditions
- Usage examples in JSDoc comments for complex functions

### Type Definitions Documentation

- TypeScript interface documentation for all validation types
- Generic type parameter explanations where applicable
- Union type usage and discrimination patterns
- Integration with existing type hierarchies

### Testing Documentation

- Examples of how to write tests for code using validation functions
- Mock strategies for testing validation error scenarios
- Performance testing approaches for validation code
- Integration testing patterns with validation functions

## Maintenance Considerations

- [ ] **Keep documentation current**: Process for updating docs when validation functions change
- [ ] **Example validation**: Ensure all code examples remain working and current
- [ ] **Performance updates**: Update performance expectations if optimization changes occur
- [ ] **Error message updates**: Keep error handling examples current with actual error messages

## Dependencies

- References all validation functions created in previous tasks
- Integrates with existing documentation patterns in the codebase
- Uses examples that align with application architecture and patterns
- Coordinates with any existing validation documentation
