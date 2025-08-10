---
id: T-create-validation-helper
title: Create validation helper functions for common scenarios
status: open
priority: medium
parent: F-schema-validation-integration
prerequisites:
  - T-create-validaterolesdata
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-10T03:03:57.905Z
updated: 2025-08-10T03:03:57.905Z
---

# Create Validation Helper Functions for Common Scenarios

## Context

Create convenient helper functions for common roles validation scenarios that will be used throughout the application. These functions provide easy-to-use validation for specific use cases while maintaining consistency with the core validation infrastructure.

## Implementation Requirements

### Helper Functions Location

- `packages/shared/src/services/storage/utils/rolesValidationHelpers.ts`

### Core Helper Functions

#### 1. Single Role Validation

```typescript
export function validateSingleRole(
  roleData: unknown,
  context?: string,
): PersistedRoleData {
  // Validate individual role object against persistedRoleSchema
}
```

#### 2. Form Data Validation

```typescript
export function validateRoleFormData(formData: {
  name: string;
  description: string;
  systemPrompt: string;
}): { isValid: boolean; errors: ValidationError[] } {
  // Validate form input before saving (UI-focused validation)
}
```

#### 3. Roles Array Validation

```typescript
export function validateRolesArray(
  rolesArray: unknown,
  allowPartialFailure?: boolean,
): { validRoles: PersistedRoleData[]; errors: ValidationError[] } {
  // Validate array of roles with optional partial failure handling
}
```

#### 4. Quick Validation Check

```typescript
export function isValidRolesData(data: unknown): boolean {
  // Fast boolean check without detailed error information
}
```

#### 5. Schema Compatibility Check

```typescript
export function checkRolesSchemaCompatibility(data: unknown): {
  compatible: boolean;
  issues: string[];
} {
  // Check if data is compatible with current schema version
}
```

### Specialized Validation Helpers

#### Field-Specific Validation

- `validateRoleName(name: string): ValidationResult`
- `validateRoleDescription(description: string): ValidationResult`
- `validateSystemPrompt(prompt: string): ValidationResult`
- `validateRoleId(id: string): ValidationResult`

#### Timestamp Handling

- `normalizeTimestamps(roleData: Partial<PersistedRoleData>): PersistedRoleData`
- `isValidTimestamp(timestamp: unknown): boolean`
- `addDefaultTimestamps(roleData: RoleFormData): PersistedRoleData`

#### Batch Operations

- `validateMultipleRoles(roles: unknown[]): BatchValidationResult`
- `filterValidRoles(roles: unknown[]): PersistedRoleData[]`
- `reportBatchValidationResults(results: BatchValidationResult): string`

## Detailed Acceptance Criteria

### Single Role Validation

- [ ] **Individual role validation**: Validate single role objects against schema
- [ ] **Form data validation**: Validate UI form data before persistence
- [ ] **Context-aware validation**: Include context information for better error messages
- [ ] **Type safety**: Full TypeScript type safety with proper return types
- [ ] **Error handling**: Proper error handling following existing patterns

### Array and Batch Validation

- [ ] **Array validation**: Validate complete roles arrays with detailed reporting
- [ ] **Partial failure handling**: Continue validation when some roles are invalid
- [ ] **Batch results**: Clear reporting of batch validation outcomes
- [ ] **Performance**: Efficient validation of large role arrays
- [ ] **Memory management**: Proper memory usage during batch operations

### Field-Level Validation

- [ ] **Individual field validation**: Validate each role field independently
- [ ] **Character limit validation**: Proper handling of field length constraints
- [ ] **Required field validation**: Clear identification of missing required fields
- [ ] **Type validation**: Proper type checking for all field types
- [ ] **Custom validation rules**: Any business logic specific to role fields

### Utility Functions

- [ ] **Quick validation checks**: Fast boolean validation without detailed errors
- [ ] **Schema compatibility**: Version compatibility checking for future migrations
- [ ] **Timestamp normalization**: Consistent timestamp handling across all scenarios
- [ ] **Helper consistency**: All helpers follow same patterns and conventions

## Integration Requirements

### With Core Validation

- Use `validateRolesData()` as the foundation for more specific validations
- Integrate with error formatting functions for consistent error reporting
- Leverage existing validation infrastructure for all operations

### With Error Handling

- Use existing `SettingsValidationError` for all error scenarios
- Format errors using roles-specific error formatting functions
- Provide context information for better error debugging

### With Recovery Mechanisms

- Work with recovery functions to handle validation failures gracefully
- Support partial validation scenarios with recovery options
- Provide validation results in formats suitable for recovery processing

## Performance Requirements

- [ ] **Single role validation**: Complete within 5ms for typical role data
- [ ] **Array validation**: Handle 100+ roles within 50ms
- [ ] **Memory efficiency**: Minimal memory overhead for validation operations
- [ ] **Caching**: Reuse validation results where appropriate for performance

## Testing Requirements

### Unit Testing

- Test each helper function with valid and invalid data
- Test all field-level validation functions with edge cases
- Test performance requirements under various data sizes
- Test error handling and error message quality

### Integration Testing

- Test helpers with core validation functions
- Test error handling integration
- Test batch validation with mixed valid/invalid data
- Test performance with realistic data sizes

### Edge Case Testing

- Test with null/undefined inputs
- Test with malformed data structures
- Test with extreme values (very long strings, special characters)
- Test concurrent usage of helper functions

## Code Quality Requirements

- [ ] **TypeScript coverage**: 100% TypeScript coverage with no `any` types
- [ ] **JSDoc documentation**: Complete documentation for all public functions
- [ ] **Error handling**: Comprehensive error handling for all scenarios
- [ ] **Code consistency**: Follow existing code patterns and naming conventions
- [ ] **Testability**: Functions designed for easy unit testing

## Dependencies

- Uses core validation functions from previous tasks
- Integrates with existing schema definitions
- Uses existing error handling infrastructure
- Follows patterns from existing validation helper utilities

## Usage Examples

The functions should be designed for easy consumption:

```typescript
// Quick validation check
if (!isValidRolesData(userInput)) {
  // Handle invalid data
}

// Form validation
const { isValid, errors } = validateRoleFormData(formData);
if (!isValid) {
  displayErrors(errors);
}

// Batch processing
const { validRoles, errors } = validateRolesArray(importedRoles, true);
console.log(
  `Processed ${validRoles.length} valid roles, ${errors.length} errors`,
);
```
