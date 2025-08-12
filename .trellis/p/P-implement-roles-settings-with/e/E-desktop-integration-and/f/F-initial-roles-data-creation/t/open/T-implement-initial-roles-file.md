---
id: T-implement-initial-roles-file
title: Implement Initial Roles File Creation Logic
status: open
priority: high
parent: F-initial-roles-data-creation
prerequisites:
  - T-create-example-roles
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T01:24:07.462Z
updated: 2025-08-12T01:24:07.462Z
---

# Implement Initial Roles File Creation Logic

## Context and Purpose

Implement the core logic for detecting first-run scenarios and creating the initial roles.json file with example data. This task creates the foundation for automatic initialization of new installations with demonstration roles.

## Detailed Implementation Requirements

### File Location and Core Function

Create `apps/desktop/src/data/initialization/createInitialRolesFile.ts` with the main initialization function.

### Core Implementation Structure

```typescript
import { logger } from "@fishbowl-ai/shared";
import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";
import { RolesRepository } from "../repositories/RolesRepository";
import { DEFAULT_ROLES, INITIAL_ROLES_METADATA } from "./defaultRoles";

export interface InitializationResult {
  created: boolean;
  error?: string;
  filePath?: string;
}

export async function createInitialRolesFile(
  repository: RolesRepository,
): Promise<InitializationResult> {
  // Implementation here
}
```

### First-Run Detection Logic

- Use `RolesRepository.loadRoles()` to check if file exists
- Return value of `null` indicates file doesn't exist (not an error)
- Log the detection result for debugging purposes

### File Creation Process

When no existing file is detected:

1. **Create Initial Data Structure**:

   ```typescript
   const initialData: PersistedRolesSettingsData = {
     schemaVersion: "1.0.0",
     roles: DEFAULT_ROLES,
     lastUpdated: new Date().toISOString(),
     ...INITIAL_ROLES_METADATA,
   };
   ```

2. **Write File Using Repository**:
   - Use `RolesRepository.saveRoles(initialData)`
   - Let repository handle atomic writes and validation
   - Handle any write failures gracefully

3. **Validate Created File**:
   - Immediately read back the created file
   - Verify it validates against schema
   - Confirm all example roles are present

### Error Handling Requirements

- **File Permission Errors**: Log error, return failure result, don't throw
- **Disk Space Errors**: Log error, return failure result, continue startup
- **Validation Errors**: Log detailed validation failure, return error result
- **Unexpected Errors**: Log full stack trace, return generic error result
- **Never Block Startup**: All errors should be handled gracefully

### Logging Strategy

```typescript
// Success case
logger.info("Created initial roles file", {
  roleCount: DEFAULT_ROLES.length,
  filePath: repository.filePath,
});

// Error cases
logger.error("Failed to create initial roles file", {
  error: error.message,
  filePath: repository.filePath,
  operation: "createInitial",
});
```

## Acceptance Criteria

- [ ] **First-Run Detection Works Correctly**:
  - Accurately detects when roles.json doesn't exist
  - Distinguishes between missing file and other errors
  - Doesn't trigger creation when file already exists
  - Logs detection results for debugging

- [ ] **File Creation Process**:
  - Creates roles.json with proper PersistedRolesSettingsData structure
  - Includes all 5 example roles from defaultRoles.ts
  - Sets correct schema version and metadata
  - Uses current timestamp for lastUpdated field

- [ ] **Validation and Integrity**:
  - Created file validates against existing Zod schemas
  - File can be successfully loaded by RolesRepository
  - All example roles are present and correctly formatted
  - Metadata correctly identifies this as initial system data

- [ ] **Error Handling**:
  - Gracefully handles file permission errors without crashing
  - Handles disk space issues without blocking startup
  - Logs detailed error information for debugging
  - Returns appropriate error results for all failure scenarios
  - Never throws unhandled exceptions

- [ ] **Unit Tests Written and Passing**:
  - Test successful first-run creation
  - Test handling when file already exists
  - Test various error scenarios (permissions, disk space)
  - Test validation of created file
  - Mock RolesRepository for isolated testing

## Testing Requirements

### Unit Tests (`__tests__/createInitialRolesFile.test.ts`)

1. **Successful Creation Tests**:

   ```typescript
   describe("createInitialRolesFile", () => {
     test("creates file when none exists", async () => {
       // Mock repository.loadRoles() to return null
       // Call createInitialRolesFile
       // Verify repository.saveRoles() was called with correct data
       // Verify return result indicates success
     });
   });
   ```

2. **File Existence Tests**:

   ```typescript
   test("skips creation when file already exists", async () => {
     // Mock repository.loadRoles() to return existing data
     // Call createInitialRolesFile
     // Verify repository.saveRoles() was NOT called
     // Verify return result indicates no action needed
   });
   ```

3. **Error Scenario Tests**:
   - Test repository.saveRoles() throwing permission error
   - Test repository.saveRoles() throwing disk space error
   - Test repository.loadRoles() throwing unexpected error
   - Verify all errors are caught and logged appropriately
   - Verify error results are returned (not thrown)

### Mock Repository Pattern

```typescript
const mockRepository = {
  loadRoles: jest.fn(),
  saveRoles: jest.fn(),
  filePath: "/test/path/roles.json",
} as jest.Mocked<RolesRepository>;
```

## Security Considerations

- Validate all data before writing to disk
- Use repository's secure file operations
- Don't expose internal file paths in error messages
- Ensure created file has appropriate permissions
- Log security-relevant events for audit

## Performance Requirements

- Complete initialization in under 50ms for typical case
- Don't block application startup on errors
- Minimize file I/O operations
- Efficient validation of created data
- Fast detection of existing files

## Dependencies

- Uses `DEFAULT_ROLES` and `INITIAL_ROLES_METADATA` from previous task
- Integrates with existing `RolesRepository`
- Uses shared logger configuration
- Relies on existing schema validation

## File Structure Created

```
apps/desktop/src/data/initialization/
├── createInitialRolesFile.ts         # Main implementation
├── __tests__/
│   └── createInitialRolesFile.test.ts # Unit tests
└── types.ts                          # InitializationResult type
```

## Success Metrics

- 100% reliable first-run detection
- Successful file creation in all normal scenarios
- Graceful error handling for all edge cases
- Zero blocking of application startup
- Complete unit test coverage
- Clear logging for debugging and monitoring
