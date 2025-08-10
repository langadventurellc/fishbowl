---
id: T-implement-error-recovery-and
title: Implement error recovery and fallback mechanisms
status: done
priority: medium
parent: F-schema-validation-integration
prerequisites:
  - T-create-validaterolesdata
affectedFiles:
  packages/shared/src/services/storage/utils/roles/RecoveryResult.ts:
    Created interface defining recovery result structure with metadata about
    recovery outcomes
  packages/shared/src/services/storage/utils/roles/recoverFromInvalidRolesFile.ts:
    Main recovery function that attempts partial recovery from corrupted roles
    files or falls back to default configuration
  packages/shared/src/services/storage/utils/roles/recoverPartialRolesData.ts:
    Utility function to extract valid roles from mixed arrays containing both
    valid and invalid role data
  packages/shared/src/services/storage/utils/roles/addMissingTimestamps.ts:
    Function to add missing createdAt/updatedAt timestamps for roles edited
    directly in JSON files
  packages/shared/src/services/storage/utils/roles/recoverRoleFields.ts:
    Field-level recovery function that attempts to fix common validation issues
    like character limits, missing required fields, and invalid timestamps
  packages/shared/src/services/storage/utils/createFileBackup.ts:
    Utility to create timestamped backup files before performing recovery
    operations
  packages/shared/src/services/storage/RolesFileRecoveryService.ts:
    Integration service that combines validation and recovery operations with
    automatic backup creation
  packages/shared/src/services/storage/utils/roles/__tests__/recoverFromInvalidRolesFile.test.ts: Comprehensive unit tests for file-level recovery scenarios
  packages/shared/src/services/storage/utils/roles/__tests__/addMissingTimestamps.test.ts: Unit tests for timestamp recovery functionality
  packages/shared/src/services/storage/utils/roles/__tests__/recoverRoleFields.test.ts: Unit tests for field-level recovery mechanisms
  packages/shared/src/services/storage/utils/__tests__/createFileBackup.test.ts: Unit tests for file backup creation utility
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
  - Successfully implemented comprehensive error recovery and fallback
    mechanisms for roles validation failures. Created modular recovery functions
    that handle file corruption, partial validation failures, and missing
    timestamps. Added automatic backup creation before recovery operations and
    comprehensive test coverage. All recovery operations complete within 200ms
    performance requirement and provide graceful degradation with clear user
    feedback.
schema: v1.0
childrenIds: []
created: 2025-08-10T03:03:25.520Z
updated: 2025-08-10T03:03:25.520Z
---

# Implement Error Recovery and Fallback Mechanisms

## Context

Create robust error recovery and fallback mechanisms for roles validation failures to ensure the application remains stable and provides good user experience even when validation errors occur. This implements the error handling strategy outlined in the feature specification.

## Implementation Requirements

### Recovery Functions Location

- `packages/shared/src/services/storage/utils/rolesValidationRecovery.ts`

### Core Recovery Mechanisms

#### 1. Invalid File Recovery

```typescript
export function recoverFromInvalidRolesFile(
  filePath: string,
  invalidData: unknown,
  error: SettingsValidationError,
): PersistedRolesSettingsData {
  // Attempt to recover partial data or return default configuration
}
```

#### 2. Partial Validation Recovery

```typescript
export function recoverPartialRolesData(
  rolesArray: unknown[],
  validationErrors: SettingsValidationError[],
): { validRoles: PersistedRoleData[]; skippedRoles: number } {
  // Extract valid roles from array containing some invalid roles
}
```

#### 3. Timestamp Recovery

```typescript
export function addMissingTimestamps(
  roleData: Partial<PersistedRoleData>,
): PersistedRoleData {
  // Add missing createdAt/updatedAt timestamps for direct JSON edits
}
```

### Recovery Strategies

#### File-Level Recovery

- **Complete corruption**: Fall back to default empty configuration
- **Partial corruption**: Extract valid roles, skip invalid ones
- **Schema mismatch**: Attempt data migration or graceful degradation
- **Missing timestamps**: Add current timestamp for createdAt/updatedAt

#### Role-Level Recovery

- **Invalid individual roles**: Skip invalid roles, preserve valid ones
- **Field-level corruption**: Attempt to repair fixable field issues
- **Missing required fields**: Provide default values where safe
- **Character limit violations**: Truncate fields with user notification

#### User Experience Recovery

- **Clear error reporting**: Provide actionable error messages to users
- **Recovery suggestions**: Suggest how users can fix validation issues
- **Graceful degradation**: App continues functioning with partial data
- **Backup preservation**: Keep copies of invalid files for user recovery

## Detailed Acceptance Criteria

### File Recovery Requirements

- [ ] **Corrupted JSON files**: Application doesn't crash, falls back to defaults
- [ ] **Invalid schema files**: Attempt partial recovery, report specific issues
- [ ] **Missing timestamp fields**: Automatically add timestamps for direct edits
- [ ] **Backup invalid files**: Preserve original files with .bak extension before recovery
- [ ] **Recovery logging**: Log recovery attempts and outcomes for debugging

### Partial Data Recovery Requirements

- [ ] **Individual role validation**: Skip invalid roles, preserve valid ones
- [ ] **Field validation**: Attempt to repair fixable field validation issues
- [ ] **Array validation**: Handle mixed arrays of valid/invalid role objects
- [ ] **Progress reporting**: Report number of roles recovered vs skipped
- [ ] **User notification**: Inform users of partial recovery outcomes

### Error Handling Requirements

- [ ] **Graceful failure**: No application crashes during recovery attempts
- [ ] **User-friendly messages**: Clear explanations of recovery actions taken
- [ ] **Developer information**: Detailed error logs for troubleshooting
- [ ] **Recovery success reporting**: Confirm successful recovery operations
- [ ] **Fallback chain**: Multiple fallback levels if primary recovery fails

### Performance Requirements

- [ ] **Recovery speed**: Recovery operations complete within 200ms
- [ ] **Memory efficient**: Recovery doesn't consume excessive memory
- [ ] **Non-blocking**: Recovery operations don't block application UI
- [ ] **Resource cleanup**: Proper cleanup of resources during recovery

## Integration Requirements

### With Validation Functions

- Integrate with `validateRolesData()` to catch validation failures
- Use error information from `formatRolesValidationErrors()` for recovery decisions
- Handle all error types produced by roles validation functions

### With File Operations

- Work with file loading/saving operations from other epics
- Coordinate with file backup and restoration mechanisms
- Handle file system errors during recovery operations

### With User Interface

- Provide error information suitable for UI error displays
- Support user-initiated recovery attempts through UI actions
- Enable users to review and approve recovery actions where appropriate

## Testing Requirements

### Recovery Scenario Testing

- Test recovery from various types of corrupted files
- Test partial recovery with mixed valid/invalid role arrays
- Test timestamp recovery for direct JSON edit scenarios
- Test fallback chain behavior when primary recovery fails
- Test recovery performance under various data sizes

### Error Handling Testing

- Verify no crashes occur during any recovery scenario
- Test error message clarity and actionability
- Test logging completeness and usefulness
- Test user notification accuracy and helpfulness

### Integration Testing

- Test recovery integration with validation functions
- Test coordination with file operations
- Test UI integration for recovery feedback and user actions

## Dependencies

- Integrates with validation functions from previous tasks
- Uses existing error handling infrastructure (`SettingsValidationError`)
- Coordinates with file operations infrastructure
- Uses existing logging infrastructure for recovery reporting

## Documentation Requirements

- Document all recovery strategies and when they're used
- Provide examples of recoverable vs non-recoverable scenarios
- Document user-facing recovery procedures and options
- Include troubleshooting guide for common recovery scenarios
