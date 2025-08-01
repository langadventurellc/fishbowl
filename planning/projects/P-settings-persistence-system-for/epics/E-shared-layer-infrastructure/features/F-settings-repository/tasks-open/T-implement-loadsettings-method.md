---
kind: task
id: T-implement-loadsettings-method
title: Implement loadSettings method with default creation and error handling
status: open
priority: high
prerequisites:
  - T-create-settingsrepository
created: "2025-07-31T19:00:56.323646"
updated: "2025-07-31T19:00:56.323646"
schema_version: "1.1"
parent: F-settings-repository
---

# Implement loadSettings Method with Default Creation and Error Handling

## Context

Implement the `loadSettings()` method in SettingsRepository that loads settings from disk, creates default settings file if none exists, and handles various error scenarios gracefully.

**Prerequisites**:

- T-create-settingsrepository: Requires SettingsRepository class and interface

**Existing Infrastructure**:

- FileStorageService handles file I/O operations and atomic writes
- FileStorageError types for specific error handling
- persistedSettingsSchema for data validation
- createDefaultPersistedSettings() for generating defaults

## Implementation Requirements

### 1. Load Settings Method Implementation

Add to `SettingsRepository` class:

```typescript
async loadSettings(): Promise<PersistedSettings> {
  try {
    // Attempt to load existing settings file
    const rawSettings = await this.fileStorage.readJsonFile(this.settingsPath);

    // Validate and parse the loaded data
    return this.validateSettings(rawSettings);
  } catch (error) {
    // Handle FileNotFoundError by creating defaults
    if (this.isFileNotFoundError(error)) {
      return await this.createDefaultSettingsFile();
    }

    // Handle validation errors with detailed context
    if (this.isValidationError(error)) {
      throw new SettingsValidationError(
        `Invalid settings file at ${this.settingsPath}`,
        [error.message],
        error
      );
    }

    // Re-throw other file system errors with context
    throw new Error(`Failed to load settings from ${this.settingsPath}: ${error.message}`);
  }
}
```

### 2. Default Settings File Creation

Implement private helper method:

```typescript
private async createDefaultSettingsFile(): Promise<PersistedSettings> {
  const defaultSettings = this.getDefaultSettings();

  try {
    await this.fileStorage.writeJsonFile(this.settingsPath, defaultSettings);
    return defaultSettings;
  } catch (error) {
    // Log warning but return defaults anyway for graceful degradation
    console.warn(`Warning: Could not create default settings file at ${this.settingsPath}:`, error);
    return defaultSettings;
  }
}
```

### 3. Error Detection Helper Methods

```typescript
private isFileNotFoundError(error: unknown): boolean {
  return error instanceof Error &&
         (error.message.includes('ENOENT') || error.message.includes('not found'));
}

private isValidationError(error: unknown): boolean {
  return error instanceof Error && error.name === 'ZodError';
}
```

### 4. Schema Validation Integration

The `validateSettings()` method will be implemented in the next task, but for now add a placeholder:

```typescript
validateSettings(settings: unknown): PersistedSettings {
  // Will be implemented in next task
  throw new Error("validateSettings not yet implemented");
}
```

## Detailed Acceptance Criteria

### Functional Behavior

- ✓ `loadSettings()` loads and validates existing settings file successfully
- ✓ `loadSettings()` creates default settings file when none exists
- ✓ `loadSettings()` returns default settings even if file creation fails
- ✓ Created default settings file has proper JSON formatting and permissions
- ✓ File system errors are wrapped with helpful context messages
- ✓ Validation errors include original error details and file path

### Error Handling Requirements

- ✓ Missing settings file triggers default file creation
- ✓ File creation failures log warnings but don't throw errors
- ✓ Corrupted JSON files throw SettingsValidationError with context
- ✓ Permission errors propagate with clear error messages
- ✓ Disk full errors during default creation handled gracefully
- ✓ Unknown errors wrapped with context and file path information

### Integration Requirements

- ✓ Uses existing FileStorageService for all file operations
- ✓ Leverages FileStorageService atomic write capabilities
- ✓ Compatible with FileStorageService error types and patterns
- ✓ Follows existing error handling patterns from FileStorageService
- ✓ Uses createDefaultPersistedSettings() for generating defaults

### Unit Testing Requirements

Add tests to `packages/shared/src/services/settings/__tests__/SettingsRepository.test.ts`:

**Happy Path Tests**:

- ✓ Load existing valid settings file returns parsed settings
- ✓ Load non-existent file creates defaults and returns them
- ✓ Created default file contains expected schema version and structure
- ✓ Multiple calls to loadSettings return consistent results

**Error Scenario Tests**:

- ✓ Corrupted JSON file throws SettingsValidationError with details
- ✓ Permission denied errors propagate with file path context
- ✓ Default file creation failure logs warning but returns defaults
- ✓ File system errors during load provide helpful error messages
- ✓ Disk full during default creation handled without throwing

**Mock Configuration**:

- ✓ Mock FileStorageService to simulate different error conditions
- ✓ Mock file system errors (ENOENT, EACCES, ENOSPC)
- ✓ Verify correct FileStorageService method calls and parameters
- ✓ Mock console.warn to verify warning messages for failed default creation

### Performance Requirements

- ✓ Default creation happens only once per missing file
- ✓ No unnecessary file operations on successful loads
- ✓ Error detection uses efficient error type checking

## Technical Implementation Notes

### Error Handling Strategy

1. **File Not Found**: Create defaults, save to disk, return defaults
2. **Permission Errors**: Propagate with context for user action
3. **Validation Errors**: Wrap in SettingsValidationError with details
4. **Default Creation Failures**: Log warning, continue with in-memory defaults
5. **Unknown Errors**: Wrap with context and propagate

### File Operations Flow

1. Attempt to read existing settings file
2. If successful, validate and return
3. If file not found, create and save defaults
4. If validation fails, throw detailed error
5. If other errors, propagate with context

### Integration Points

- FileStorageService.readJsonFile() for reading settings
- FileStorageService.writeJsonFile() for creating defaults
- SettingsValidationError for validation failures
- Console.warn for non-fatal default creation warnings

This task implements robust settings loading with graceful default handling.

### Log
