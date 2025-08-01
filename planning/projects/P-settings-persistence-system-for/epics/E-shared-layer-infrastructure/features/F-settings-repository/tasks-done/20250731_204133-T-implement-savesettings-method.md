---
kind: task
id: T-implement-savesettings-method
parent: F-settings-repository
status: done
title: Implement saveSettings method with partial updates and deep merge
priority: high
prerequisites:
  - T-implement-loadsettings-method
  - T-implement-validatesettings
created: "2025-07-31T19:02:21.010911"
updated: "2025-07-31T20:40:32.725961"
schema_version: "1.1"
worktree: null
---

# Implement saveSettings Method with Partial Updates and Deep Merge

## Context

Implement the `saveSettings(settings: Partial<PersistedSettings>): Promise<void>` method that merges partial updates with existing settings, validates the result, and atomically saves to disk.

**Prerequisites**:

- T-implement-loadsettings-method: Requires loadSettings() to get current settings
- T-implement-validatesettings: Requires validateSettings() to validate merged result

**Key Features**:

- Partial updates that merge with existing settings
- Deep merge for nested configuration objects
- Full validation before persistence
- Atomic write operations to prevent corruption

## Implementation Requirements

### 1. Save Settings Method Implementation

Add to `SettingsRepository` class:

```typescript
async saveSettings(settingsUpdate: Partial<PersistedSettings>): Promise<void> {
  try {
    // Load current settings to merge with
    const currentSettings = await this.loadSettings();

    // Deep merge partial update with current settings
    const mergedSettings = this.deepMergeSettings(currentSettings, settingsUpdate);

    // Validate merged result before persistence
    const validatedSettings = this.validateSettings(mergedSettings);

    // Atomically save validated settings
    await this.fileStorage.writeJsonFile(this.settingsPath, validatedSettings);
  } catch (error) {
    // Wrap errors with context for better debugging
    if (error instanceof SettingsValidationError) {
      throw new SettingsValidationError(
        `Failed to save settings: validation failed`,
        error.validationErrors,
        settingsUpdate
      );
    }

    throw new Error(`Failed to save settings to ${this.settingsPath}: ${error.message}`);
  }
}
```

### 2. Deep Merge Implementation

Implement sophisticated merge logic that handles nested objects correctly:

```typescript
private deepMergeSettings(
  current: PersistedSettings,
  update: Partial<PersistedSettings>
): PersistedSettings {
  return {
    // Schema version from update or keep current
    schemaVersion: update.schemaVersion ?? current.schemaVersion,

    // Deep merge settings categories
    general: this.mergeNestedObject(current.general, update.general),
    appearance: this.mergeNestedObject(current.appearance, update.appearance),
    advanced: this.mergeNestedObject(current.advanced, update.advanced),

    // Always update timestamp for any save operation
    lastUpdated: new Date().toISOString(),
  };
}

private mergeNestedObject<T extends Record<string, any>>(
  current: T,
  update: Partial<T> | undefined
): T {
  if (!update) {
    return current;
  }

  const result = { ...current };

  for (const [key, value] of Object.entries(update)) {
    if (value !== undefined) {
      if (this.isPlainObject(value) && this.isPlainObject(current[key])) {
        // Recursively merge nested objects
        result[key] = this.mergeNestedObject(current[key], value);
      } else {
        // Replace primitive values and arrays entirely
        result[key] = value;
      }
    }
  }

  return result;
}

private isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' &&
         value !== null &&
         !Array.isArray(value) &&
         value.constructor === Object;
}
```

### 3. Transaction-like Behavior

Add backup creation for safety during updates:

```typescript
private async createBackup(): Promise<string | null> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${this.settingsPath}.backup-${timestamp}`;

    // Read current file and save as backup
    const currentContent = await this.fileStorage.readJsonFile(this.settingsPath);
    await this.fileStorage.writeJsonFile(backupPath, currentContent);

    return backupPath;
  } catch (error) {
    // Backup creation is optional - log but don't fail
    console.warn(`Could not create settings backup: ${error.message}`);
    return null;
  }
}
```

### 4. Enhanced Save with Backup Support

Update saveSettings to optionally create backups:

```typescript
async saveSettings(
  settingsUpdate: Partial<PersistedSettings>,
  createBackup = false
): Promise<void> {
  let backupPath: string | null = null;

  try {
    // Optional backup creation
    if (createBackup) {
      backupPath = await this.createBackup();
    }

    // Load, merge, validate, and save
    const currentSettings = await this.loadSettings();
    const mergedSettings = this.deepMergeSettings(currentSettings, settingsUpdate);
    const validatedSettings = this.validateSettings(mergedSettings);

    await this.fileStorage.writeJsonFile(this.settingsPath, validatedSettings);

    // Clean up successful backup if created
    if (backupPath) {
      console.log(`Settings saved successfully. Backup created at: ${backupPath}`);
    }
  } catch (error) {
    // Handle save failures with context
    if (error instanceof SettingsValidationError) {
      throw new SettingsValidationError(
        `Failed to save settings: ${error.message}`,
        error.validationErrors,
        settingsUpdate
      );
    }

    throw new Error(`Failed to save settings to ${this.settingsPath}: ${error.message}`);
  }
}
```

## Detailed Acceptance Criteria

### Partial Update Behavior

- ✓ Partial general settings merge with existing general settings correctly
- ✓ Partial appearance settings preserve unmodified appearance fields
- ✓ Partial advanced settings update only specified advanced fields
- ✓ Undefined fields in partial update are ignored (not set to undefined)
- ✓ Null values in partial update explicitly set fields to null
- ✓ Schema version can be updated through partial update

### Deep Merge Requirements

- ✓ Nested objects merge recursively (e.g., partial general object)
- ✓ Arrays in partial updates replace entire arrays (not element-wise merge)
- ✓ Primitive values in partial updates replace existing values
- ✓ Missing nested objects in partial update leave existing objects unchanged
- ✓ Complex nested structures merge correctly at all levels

### Validation and Safety

- ✓ Merged result validated before persistence using validateSettings()
- ✓ Validation failures prevent file write and throw SettingsValidationError
- ✓ Invalid partial updates result in clear error messages with context
- ✓ File corruption prevented through FileStorageService atomic writes
- ✓ Backup creation works correctly when requested
- ✓ lastUpdated timestamp always updated during save operations

### Error Handling Requirements

- ✓ Current settings load failures propagate with context
- ✓ Validation errors include both original and merged data context
- ✓ File write errors propagate with file path information
- ✓ Backup creation failures log warnings but don't prevent saves
- ✓ Partial update with invalid data provides helpful error messages

### Unit Testing Requirements

Add comprehensive tests to `packages/shared/src/services/settings/__tests__/SettingsRepository.test.ts`:

**Partial Update Tests**:

- ✓ Save partial general settings updates only general fields
- ✓ Save partial appearance settings preserves existing general and advanced
- ✓ Save partial advanced settings updates only advanced configuration
- ✓ Multiple partial saves accumulate changes correctly
- ✓ Undefined fields in partial update ignored (existing values preserved)

**Deep Merge Tests**:

- ✓ Nested object merge preserves existing fields while updating specified ones
- ✓ Array replacement works correctly (arrays not merged element-wise)
- ✓ Primitive value updates replace existing values completely
- ✓ Multi-level nested updates work correctly
- ✓ Empty partial update object results in no changes (except lastUpdated)

**Validation Integration Tests**:

- ✓ Invalid partial update prevents file write and throws SettingsValidationError
- ✓ Validation error messages include context about partial update data
- ✓ Valid partial update with validation-fixed defaults saves correctly
- ✓ Merged result validation catches type mismatches in combined data

**Error Scenario Tests**:

- ✓ Failed loadSettings() during save propagates error with context
- ✓ File write failures during save provide helpful error messages
- ✓ Backup creation failures logged but don't prevent successful saves
- ✓ Concurrent access scenarios handled safely by FileStorageService

**Backup Feature Tests**:

- ✓ Backup creation when requested works correctly
- ✓ Backup files have timestamp-based names to avoid conflicts
- ✓ Backup creation failures logged but save operation continues
- ✓ Successful backup creation logs informative message

### Integration Requirements

- ✓ Uses loadSettings() to get current state for merging
- ✓ Uses validateSettings() to validate merged result before persistence
- ✓ Leverages FileStorageService atomic write capabilities
- ✓ Compatible with existing PersistedSettings type structure
- ✓ Follows error handling patterns established in other methods

## Technical Implementation Notes

### Merge Strategy Details

1. **Top-level Fields**: Direct replacement or preservation
2. **Settings Categories**: Deep merge of nested objects
3. **Arrays**: Complete replacement (not element-wise merge)
4. **Primitives**: Direct replacement
5. **Undefined**: Ignored (preserves existing values)
6. **Null**: Explicit null assignment

### Performance Considerations

- Load current settings only once per save operation
- Deep merge performs shallow copies where possible
- Validation happens on merged result only (not intermediate states)
- Backup creation is optional and can be skipped for performance

### Atomic Operation Flow

1. Load current settings from disk
2. Deep merge with partial update
3. Validate merged result
4. Optionally create backup
5. Atomically write validated settings
6. Handle success/failure appropriately

This task implements safe, atomic partial updates with comprehensive validation.

### Log

**2025-08-01T01:41:33.785427Z** - Task was already completed - saveSettings method fully implemented with partial updates, deep merge, validation, and atomic operations as specified in requirements.
