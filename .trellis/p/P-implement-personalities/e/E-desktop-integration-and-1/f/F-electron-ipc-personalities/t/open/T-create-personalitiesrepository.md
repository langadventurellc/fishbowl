---
id: T-create-personalitiesrepository
title: Create PersonalitiesRepository with FileStorageService integration
status: open
priority: high
parent: F-electron-ipc-personalities
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T02:59:23.387Z
updated: 2025-08-17T02:59:23.387Z
---

# Create PersonalitiesRepository with FileStorageService integration

## Context and Purpose

Create a `PersonalitiesRepository` class that handles personalities data persistence, following the exact pattern established by `RolesRepository`. This repository will integrate with the existing `FileStorageService` to provide secure file operations for personalities data.

## Implementation Requirements

### File Location

- Create `apps/desktop/src/data/repositories/PersonalitiesRepository.ts`
- Follow the exact structure and patterns from `apps/desktop/src/data/repositories/RolesRepository.ts`

### Class Structure

```typescript
export class PersonalitiesRepository {
  private readonly fileStorageService: FileStorageService;
  private readonly filePath: string;
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "PersonalitiesRepository" } },
  });

  constructor(userDataPath: string) {
    // Follow RolesRepository constructor pattern
    this.filePath = pathJoin(userDataPath, "personalities.json");
    this.fileStorageService = new FileStorageService();
    // Same parameters as RolesRepository
  }

  async loadPersonalities(): Promise<PersistedPersonalitiesSettingsData | null>;
  async savePersonalities(
    personalities: PersistedPersonalitiesSettingsData,
  ): Promise<void>;
  async resetPersonalities(): Promise<void>;
}
```

### Required Methods

**loadPersonalities():**

- Load personalities from file using `fileStorageService.readJsonFile()`
- Return `null` if file doesn't exist (ENOENT error)
- Validate loaded data against personalities schema
- Handle file corruption by returning `null` (log error)
- Throw meaningful errors for other failures

**savePersonalities():**

- Validate input data against personalities schema before saving
- Use `fileStorageService.writeJsonFile()` for atomic save operation
- Create directory if it doesn't exist
- Handle permission errors with descriptive messages
- Log successful operations at debug level

**resetPersonalities():**

- Load default personalities using `createDefaultPersonalitiesSettings()`
- Save defaults using `savePersonalities()` method
- Log reset operation at info level
- Handle errors gracefully with proper error propagation

### Integration Requirements

- Import and use existing `FileStorageService` from `@fishbowl-ai/shared`
- Import personalities types from `@fishbowl-ai/shared`
- Import `createDefaultPersonalitiesSettings` utility function
- Use same dependency injection pattern as RolesRepository
- Follow exact error handling patterns from RolesRepository

### Security and Validation

- Validate all input data using personalities schema before file operations
- Use secure file permissions (handled by FileStorageService)
- Prevent directory traversal attacks (handled by FileStorageService)
- Log security-relevant events for audit trail

## Unit Tests Requirements

Create comprehensive unit tests in `apps/desktop/src/data/repositories/__tests__/PersonalitiesRepository.test.ts`:

**Test Coverage Required:**

- Successful load operation with valid data
- Load operation returning null for missing file
- Load operation handling corrupted data gracefully
- Successful save operation with valid personalities data
- Save operation validation rejecting invalid data
- Save operation handling file permission errors
- Successful reset operation creating defaults
- Reset operation error handling
- All error scenarios with proper error types
- Schema validation for both load and save operations

**Test Structure:**

- Mock `FileStorageService` following the RolesRepository test pattern
- Mock `createDefaultPersonalitiesSettings` function
- Test all success and error paths
- Verify proper logging calls
- Test concurrent operation handling

## Dependencies

- `FileStorageService` from `@fishbowl-ai/shared`
- `PersistedPersonalitiesSettingsData` type from `@fishbowl-ai/shared`
- `createDefaultPersonalitiesSettings` utility function
- `personalitiesSettingsSchema` for validation
- Logging utilities from `@fishbowl-ai/shared`

## Acceptance Criteria

- [ ] PersonalitiesRepository class created following RolesRepository pattern exactly
- [ ] All three methods (load, save, reset) implemented with proper error handling
- [ ] FileStorageService integration working with correct file path
- [ ] Schema validation implemented for all data operations
- [ ] Comprehensive unit tests with 100% code coverage
- [ ] All tests passing with proper mocking
- [ ] Security best practices followed for file operations
- [ ] Logging implemented at appropriate levels

**File References:**

- Pattern: `apps/desktop/src/data/repositories/RolesRepository.ts:21-153`
- Tests: `apps/desktop/src/data/repositories/__tests__/RolesRepository.test.ts`
