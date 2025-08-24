---
id: T-setup-test-infrastructure-and
title: Setup Test Infrastructure and Directory Structure
status: open
priority: medium
parent: F-basic-e2e-tests-for-new
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T03:41:21.144Z
updated: 2025-08-24T03:41:21.144Z
---

# Setup Test Infrastructure and Directory Structure

## Context

This task creates the necessary directory structure for the new conversation E2E tests and ensures proper integration with the existing test infrastructure. It also adds better-sqlite3 as a dev dependency for the test environment.

**Related Feature**: F-basic-e2e-tests-for-new - Basic E2E Tests for New Conversation Button
**Dependencies**: None - this can be done independently

## Implementation Requirements

### 1. Create Directory Structure

Create the following directories if they don't exist:

**Directories to create:**

```
/tests/desktop/helpers/database/
/tests/desktop/features/conversations/
```

### 2. Update Package Dependencies

**File**: `/tests/desktop/package.json` (or relevant test package.json)

Add better-sqlite3 to devDependencies if not already present:

```json
{
  "devDependencies": {
    "better-sqlite3": "^12.2.0",
    "@types/better-sqlite3": "^7.6.13"
  }
}
```

**Note**: Check if these dependencies are already available at the workspace level before adding.

### 3. Update TypeScript Configuration

**File**: `/tests/desktop/tsconfig.json` (or relevant tsconfig)

Ensure better-sqlite3 types are properly configured:

```json
{
  "compilerOptions": {
    "types": ["@types/better-sqlite3", "playwright"]
  }
}
```

### 4. Create Conversations Test Index

**File**: `/tests/desktop/features/conversations/index.ts`

Create a barrel export file for future conversation tests:

```typescript
/**
 * Conversation feature tests
 *
 * End-to-end tests for conversation functionality including:
 * - New conversation creation
 * - Conversation list management
 * - Database persistence
 */

// Export test utilities if needed in the future
export {};
```

### 5. Update Main Test Helpers Index

**File**: `/tests/desktop/helpers/index.ts`

Ensure the main helpers index file exports the database helpers:

```typescript
// Add to existing exports
export * from "./database";
```

### 6. Verify Existing Test Infrastructure

Check and verify that existing test infrastructure is compatible:

- Confirm `createElectronApp` helper works with database operations
- Verify Playwright configuration supports the test file locations
- Ensure test runner can find the new test files

## Technical Implementation Details

### Directory Structure Verification

- Use existing patterns from `/tests/desktop/features/settings/` directory structure
- Follow the same naming conventions for consistency
- Ensure proper directory permissions for test execution

### Dependency Management

- Check if better-sqlite3 is already available via workspace dependencies
- Only add dependencies if not already available at project root
- Verify version compatibility with existing database infrastructure

### TypeScript Configuration

- Ensure proper type resolution for better-sqlite3
- Maintain compatibility with existing test types
- Add necessary type imports without breaking existing tests

## Acceptance Criteria

### Directory Structure

- ✅ `/tests/desktop/helpers/database/` directory exists
- ✅ `/tests/desktop/features/conversations/` directory exists
- ✅ Directories have proper permissions for test execution

### Dependencies

- ✅ better-sqlite3 is available for test execution (either locally or via workspace)
- ✅ @types/better-sqlite3 is available for TypeScript compilation
- ✅ No duplicate dependencies or version conflicts

### TypeScript Configuration

- ✅ TypeScript can resolve better-sqlite3 types
- ✅ Existing test types are not broken
- ✅ Test files can be compiled without errors

### Integration

- ✅ Test infrastructure can find files in new directories
- ✅ Playwright configuration supports new test locations
- ✅ Helper exports work correctly from new database directory

## Testing Requirements

### Manual Verification

1. Create the directories and verify they exist
2. Check that TypeScript compilation works
3. Verify test runner can discover files in new locations
4. Confirm database dependencies are available

### Integration Testing

- Run existing tests to ensure no regressions
- Verify new directory structure doesn't break test discovery
- Test that helper exports work from new locations

## Dependencies and Prerequisites

- Must be completed before database helper implementation
- Should be completed before E2E test creation
- No external dependencies beyond existing test infrastructure

## Future Considerations

- Directory structure should support additional conversation tests
- Infrastructure should be extensible for other database testing needs
- Configuration should support both local and CI environments

This task establishes the foundation for organizing and running the new E2E tests while maintaining compatibility with existing test infrastructure.
