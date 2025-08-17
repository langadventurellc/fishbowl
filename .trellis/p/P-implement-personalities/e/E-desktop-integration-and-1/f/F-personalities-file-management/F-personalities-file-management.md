---
id: F-personalities-file-management
title: Personalities File Management System
status: open
priority: medium
parent: E-desktop-integration-and-1
prerequisites:
  - F-electron-ipc-personalities
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T02:08:19.715Z
updated: 2025-08-17T02:08:19.715Z
---

# Personalities File Management System

## Purpose and Functionality

Implement comprehensive file management for personalities including default data creation, file corruption recovery, backup operations, and first-run initialization. This feature ensures reliable file operations and data integrity for the personalities persistence system.

## Key Components to Implement

- Default personalities file creation and management
- File corruption detection and recovery mechanisms
- Backup system for safe reset operations
- First-run initialization with default personalities
- Atomic file operations to prevent data corruption
- Integration with existing FileStorageService patterns

## Detailed Acceptance Criteria

### Default Personalities Management

- **Default File Creation**: `personalities.json` created automatically on first application launch
- **Default Data Loading**: Bundled default personalities loaded if no existing file found
- **Schema Validation**: Default personalities validate against current schema requirements
- **Customizable Defaults**: Easy modification of default personalities without code changes

### File Corruption Recovery

- **Corruption Detection**: Automatic detection of malformed JSON or invalid data structures
- **Backup Recovery**: Ability to restore from automatic backup if primary file corrupted
- **Graceful Fallback**: Load default personalities if both primary and backup files corrupted
- **User Notification**: Clear messaging when recovery operations occur

### Backup System Implementation

- **Automatic Backups**: Create backup before destructive operations (reset, major updates)
- **Backup Rotation**: Maintain multiple backup files with timestamp-based naming
- **Backup Validation**: Ensure backup files are valid before relying on them for recovery
- **Cleanup Management**: Remove old backup files to prevent disk space issues

### First-Run Experience

- **Initial Setup**: Seamless creation of personalities.json with default data on first launch
- **Directory Creation**: Ensure user data directory exists before file operations
- **Permission Handling**: Graceful handling of file permission issues during setup
- **Migration Support**: Handle future schema version upgrades smoothly

### Atomic Operations

- **Write Safety**: Use write-then-rename pattern to prevent partial file corruption
- **Lock Handling**: Prevent concurrent file modifications from corrupting data
- **Transaction Support**: Rollback capability for failed multi-step operations
- **Error Recovery**: Restore previous state if save operations fail partway through

### Performance Requirements

- Default personalities loading completes within 100ms
- Backup operations complete within 300ms without blocking UI
- Corruption detection and recovery completes within 500ms
- Support up to 100 personalities without performance degradation

## Implementation Guidance

### Technical Approach

```typescript
// Default personalities management
export async function ensurePersonalitiesFile(): Promise<void> {
  const filePath = getPersonalitiesFilePath();

  try {
    // Check if file exists and is valid
    const existingData = await loadPersonalitiesFile();
    if (existingData) {
      return; // File exists and is valid
    }
  } catch (error) {
    logger.warn("Personalities file missing or corrupted", {
      error: error.message,
    });
  }

  // Try to restore from backup
  if (await attemptBackupRecovery()) {
    return;
  }

  // Fall back to creating default file
  await createDefaultPersonalitiesFile();
}

// Backup system
export async function createPersonalitiesBackup(): Promise<void> {
  const sourcePath = getPersonalitiesFilePath();
  const backupPath = getPersonalitiesBackupPath();

  try {
    await fs.copyFile(sourcePath, backupPath);
    logger.info("Personalities backup created successfully");
  } catch (error) {
    logger.error("Failed to create personalities backup", {
      error: error.message,
    });
    throw new Error(`Backup creation failed: ${error.message}`);
  }
}

// Atomic save operations
export async function savePersonalitiesAtomically(
  data: PersistedPersonalitiesSettingsData,
): Promise<void> {
  const filePath = getPersonalitiesFilePath();
  const tempPath = `${filePath}.tmp`;

  try {
    // Write to temporary file first
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");

    // Verify the written file is valid
    await validatePersonalitiesFile(tempPath);

    // Atomically move to final location
    await fs.rename(tempPath, filePath);

    logger.info("Personalities saved atomically");
  } catch (error) {
    // Clean up temporary file if it exists
    try {
      await fs.unlink(tempPath);
    } catch {}

    throw new Error(`Atomic save failed: ${error.message}`);
  }
}
```

### File Path Management

```typescript
export function getPersonalitiesFilePath(): string {
  return path.join(app.getPath("userData"), "personalities.json");
}

export function getPersonalitiesBackupPath(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(
    app.getPath("userData"),
    `personalities.backup.${timestamp}.json`,
  );
}

export function getDefaultPersonalitiesPath(): string {
  return path.join(app.getAppPath(), "assets", "defaultPersonalities.json");
}
```

### Error Recovery Strategies

- Primary file corrupted → Try backup recovery
- Backup file corrupted → Use bundled defaults
- Write operation fails → Preserve existing file, report error
- Permission denied → Provide clear user guidance
- Disk full → Clean up old backups, retry operation

## Testing Requirements

### Unit Tests (Required)

- Test default personalities file creation on first run
- Test file corruption detection with various malformed files
- Test backup creation and restoration functionality
- Test atomic save operations with simulated failures
- Test directory creation and permission handling
- Test backup cleanup and rotation mechanisms

### Error Simulation Tests (Required)

- Test behavior when primary file is corrupted JSON
- Test behavior when backup file is also corrupted
- Test behavior when file permissions prevent reading/writing
- Test behavior when disk space is insufficient for operations
- Test recovery from partial write failures

### File System Tests (Required)

- Test concurrent access scenarios with file locking
- Test atomic operations prevent corruption during power loss simulation
- Test backup file validation before restoration
- Verify no data loss during normal operation cycles

### Test Coverage Requirements

- 100% code coverage for all file operation functions
- All error paths tested with simulated file system failures
- Mock file system operations for deterministic testing

**IMPORTANT**: Do not create integration or performance tests for this feature.

## Security Considerations

### File System Security

- All file operations restricted to user data directory only
- No symbolic link following to prevent unauthorized access
- Input validation prevents path traversal attacks
- File permissions set appropriately for user-only access

### Data Integrity Security

- Schema validation prevents malformed data from corrupting system
- Backup verification ensures reliable recovery mechanisms
- Atomic operations prevent partial corruption during concurrent access
- No logging of sensitive personality data in plain text

### Error Handling Security

- File paths not exposed in user-facing error messages
- Detailed errors logged securely for debugging only
- No information disclosure through error message content
- Proper cleanup of temporary files prevents data leakage

## Dependencies

- **Prerequisites**: Requires Electron IPC handlers for secure file operations
- **Integration Points**: Works with FileStorageService and desktop adapter
- **File System**: Requires user data directory access and write permissions
- **Schema Validation**: Depends on personalities schemas from shared package

## Implementation Notes

### File Management Best Practices

- Use consistent file naming conventions across the application
- Implement proper file locking to prevent concurrent corruption
- Follow established patterns from existing file management features
- Consider cross-platform file system differences

### Backup Strategy

- Balance backup frequency with disk space usage
- Implement configurable backup retention policies
- Consider compression for long-term backup storage
- Provide manual backup/restore capabilities for advanced users

### Future Extensibility

- Design file format to support schema versioning
- Implement migration system for future data structure changes
- Consider export/import functionality for user data portability
- Plan for integration with cloud backup services
