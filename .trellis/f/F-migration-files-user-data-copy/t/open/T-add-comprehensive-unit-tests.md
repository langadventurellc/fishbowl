---
id: T-add-comprehensive-unit-tests
title: Add comprehensive unit tests for migration copying functionality
status: open
priority: medium
parent: F-migration-files-user-data-copy
prerequisites:
  - T-integrate-migration-copying
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T06:09:47.486Z
updated: 2025-08-24T06:09:47.486Z
---

# Add comprehensive unit tests for migration copying functionality

## Context

This task creates comprehensive unit tests for all migration copying functionality, ensuring robustness across different scenarios and environments. Tests will be added to the existing MainProcessServices test suite.

**Related Feature**: F-migration-files-user-data-copy - Migration Files User Data Copy
**File Location**: `apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts`
**Prerequisites**: T-integrate-migration-copying (complete implementation)

## Implementation Requirements

### Test Structure Organization

Add comprehensive test suites for the new migration copying methods:

```typescript
describe("Migration File Copying", () => {
  describe("getSourceMigrationsPath", () => {
    // Test path resolution logic
  });

  describe("ensureMigrationsInUserData", () => {
    // Test lazy initialization logic
  });

  describe("copyMigrationsToUserData", () => {
    // Test file copying operations
  });

  describe("runDatabaseMigrations integration", () => {
    // Test integration with existing migration flow
  });
});
```

### Mock Setup Requirements

Set up comprehensive mocks for all dependencies:

```typescript
// Mock Electron app APIs
const mockApp = {
  getPath: jest.fn(),
  getAppPath: jest.fn(),
  isPackaged: false, // Test both true/false states
};

// Mock FileSystemBridge operations
const mockFileSystemBridge = {
  exists: jest.fn(),
  readdir: jest.fn(),
  copyFile: jest.fn(),
  ensureDir: jest.fn(),
};

// Mock logger for verification
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
```

### Test Coverage Requirements

#### Path Resolution Tests

- Test getSourceMigrationsPath() with app.isPackaged = true (bundled resources)
- Test getSourceMigrationsPath() with app.isPackaged = false (development)
- Test getMigrationsPath() always returns userData path
- Test path validation with various inputs

#### Lazy Initialization Tests

- Test ensureMigrationsInUserData() skips when files exist
- Test ensureMigrationsInUserData() copies when directory empty
- Test ensureMigrationsInUserData() copies when directory missing
- Test ensureMigrationsInUserData() handles existing directory with no .sql files

#### File Copying Tests

- Test copyMigrationsToUserData() with typical migration file set
- Test copyMigrationsToUserData() filters only .sql files matching pattern
- Test copyMigrationsToUserData() preserves file names and order
- Test copyMigrationsToUserData() creates destination directory

#### Error Handling Tests

- Test behavior when source directory doesn't exist (warning, no crash)
- Test behavior when file copy operations fail
- Test behavior when destination directory creation fails
- Test error message formatting and logging

#### Integration Tests

- Test runDatabaseMigrations() calls ensureMigrationsInUserData()
- Test copy failure prevents migration execution
- Test successful copy allows migration execution to proceed
- Test error handling integration between copy and migration phases

## Technical Approach

1. **Extend existing test file**: Add to MainProcessServices.test.ts
2. **Mock all external dependencies**: Electron APIs, FileSystemBridge, logger
3. **Test both success and failure paths**: Comprehensive error scenario coverage
4. **Verify logging behavior**: Ensure appropriate log messages at correct levels
5. **Test performance characteristics**: Verify timing and resource usage patterns
6. **Isolated testing**: Each test method mocks dependencies for isolated testing

## Acceptance Criteria

### Test Coverage Requirements

- **AC1**: All new methods have >95% line coverage
- **AC2**: All code paths (success/failure) are tested
- **AC3**: Both app.isPackaged states are tested
- **AC4**: All error handling scenarios have test coverage
- **AC5**: Integration with runDatabaseMigrations() is tested

### Mock Verification Requirements

- **AC6**: FileSystemBridge method calls are verified with correct parameters
- **AC7**: Logger calls are verified for appropriate log levels and messages
- **AC8**: Electron app API calls are mocked and verified
- **AC9**: Mock state properly reset between test runs

### Error Scenario Coverage

- **AC10**: Missing source directory scenario tested
- **AC11**: File copy failure scenarios tested
- **AC12**: Directory creation failure scenarios tested
- **AC13**: Partial copy scenarios tested
- **AC14**: Permission error scenarios tested

### Performance Test Coverage

- **AC15**: Copy operation timing is verified to be reasonable
- **AC16**: Lazy initialization performance (skip case) is tested
- **AC17**: Memory usage patterns are validated

## Dependencies

- **Prerequisites**: T-integrate-migration-copying (complete implementation)
- **Uses**: Existing MainProcessServices test infrastructure
- **Testing frameworks**: Jest, existing test patterns in the desktop app

## Security Considerations

- Test path validation logic prevents directory traversal
- Verify error messages don't expose sensitive file paths
- Test that only expected file patterns are copied
- Validate secure file operations through mocked FileSystemBridge

## Testing Approach

### Unit Test Structure

```typescript
describe("getSourceMigrationsPath", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return bundled path when app is packaged", () => {
    mockApp.isPackaged = true;
    mockApp.getAppPath.mockReturnValue("/app/bundle");

    const result = mainProcessServices.getSourceMigrationsPath();

    expect(result).toBe("/app/bundle/migrations");
  });

  it("should return project root path when app is not packaged", () => {
    mockApp.isPackaged = false;
    mockApp.getAppPath.mockReturnValue("/dev/fishbowl/apps/desktop/dist");

    const result = mainProcessServices.getSourceMigrationsPath();

    expect(result).toBe("/dev/fishbowl/migrations");
  });
});
```

### Error Testing Patterns

```typescript
it("should handle copy failures gracefully", async () => {
  mockFileSystemBridge.copyFile.mockRejectedValue(
    new Error("Permission denied"),
  );

  await expect(mainProcessServices.copyMigrationsToUserData()).rejects.toThrow(
    "Migration file copying failed: Permission denied",
  );

  expect(mockLogger.error).toHaveBeenCalledWith(
    "Failed to copy migration files",
    expect.any(Error),
  );
});
```

## Implementation Notes

- Follow existing test patterns in MainProcessServices.test.ts
- Use Jest mocking patterns consistent with the desktop app test suite
- Ensure test isolation and proper mock cleanup between tests
- Include both positive and negative test cases for comprehensive coverage
- Test timing and performance characteristics where relevant
