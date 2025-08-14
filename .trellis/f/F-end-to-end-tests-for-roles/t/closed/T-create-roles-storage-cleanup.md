---
id: T-create-roles-storage-cleanup
title: Create roles storage cleanup utilities
status: done
priority: high
parent: F-end-to-end-tests-for-roles
prerequisites:
  - T-create-roles-test-suite
affectedFiles: {}
log:
  - Roles storage cleanup utilities were already fully implemented and working
    correctly. The cleanupRolesStorage.ts file exists at
    tests/desktop/features/settings/roles/cleanupRolesStorage.ts with proper
    error handling, retry logic, and integration with the test suite. The
    implementation follows the LLM cleanup pattern exactly with 3 retry
    attempts, ENOENT error handling, and warning logs for debugging. All
    acceptance criteria are met and the utility is already being used by
    setupRolesTestSuite.ts for test isolation.
schema: v1.0
childrenIds: []
created: 2025-08-13T18:16:53.050Z
updated: 2025-08-13T18:16:53.050Z
---

# Create Roles Storage Cleanup Utilities

Implement storage cleanup utilities for roles end-to-end tests to ensure proper test isolation and clean state between test runs.

## Context

- Feature: End-to-End Tests for Roles Section (`F-end-to-end-tests-for-roles`)
- Reference: `tests/desktop/features/settings/llm-setup/cleanupLlmStorage.ts` for patterns
- Location: Create new file at `tests/desktop/features/settings/roles/cleanupRolesStorage.ts`
- Default roles source: `packages/shared/src/data/defaultRoles.json`

## Implementation Requirements

### Create `cleanupRolesStorage.ts`

Following the LLM cleanup pattern, implement utilities for cleaning roles data:

**Core Functions:**

- `cleanupRolesStorage(rolesConfigPath: string)` - Primary cleanup function
- Handle file deletion with proper error handling
- Support both file-based and in-memory cleanup if needed

**Cleanup Operations:**

- Delete roles configuration file if it exists
- Handle file system permissions gracefully
- Log cleanup operations for debugging
- Support cleanup of both custom and default roles scenarios

**Error Handling:**

- Graceful handling of missing files (not an error)
- Proper error logging for actual failures
- Non-blocking cleanup (tests shouldn't fail due to cleanup issues)

## Technical Details

### Expected File Structure

```typescript
import { promises as fs } from "fs";

export const cleanupRolesStorage = async (rolesConfigPath: string) => {
  try {
    // Check if file exists and delete
    await fs.access(rolesConfigPath);
    await fs.unlink(rolesConfigPath);
    console.log(`Cleaned up roles storage: ${rolesConfigPath}`);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Could not cleanup roles storage: ${error.message}`);
    }
  }
};
```

### Storage Investigation

- Investigate where roles are actually stored in the desktop app
- Check if roles use similar storage patterns as LLM configs
- Determine if secure storage is used for any roles data
- Understand default roles vs custom roles storage

### Integration Points

- Used by `setupRolesTestSuite.ts` in beforeEach/afterEach hooks
- Must work with roles adapter/persistence layer
- Should handle the 4 default roles from `defaultRoles.json`

## Acceptance Criteria

- [ ] `cleanupRolesStorage.ts` file created with proper exports
- [ ] Primary cleanup function handles file deletion gracefully
- [ ] Proper error handling for missing files and permissions
- [ ] Logging included for debugging test issues
- [ ] Works with actual roles storage format used by desktop app
- [ ] Non-blocking cleanup (doesn't fail tests)
- [ ] Handles both empty and populated storage states
- [ ] Compatible with setupRolesTestSuite usage patterns
- [ ] TypeScript types properly defined

## Dependencies

- Should be completed alongside or after infrastructure setup task
- May need investigation of actual roles storage implementation
- Used by test suite infrastructure

## Files to Create

- `tests/desktop/features/settings/roles/cleanupRolesStorage.ts`

## Research Required

- Investigate `apps/desktop/src/adapters/desktopRolesAdapter.ts` for storage details
- Check `apps/desktop/src/contexts/RolesProvider.tsx` for data flow
- Understand how default roles are loaded vs custom roles stored
