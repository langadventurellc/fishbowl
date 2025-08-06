---
kind: task
id: T-implement-file-storage
parent: F-storage-services-implementation
status: done
title: Implement file storage integration for configuration metadata
priority: high
prerequisites:
  - T-create-storage-types-and
created: "2025-08-06T15:42:58.805957"
updated: "2025-08-06T16:08:18.979985"
schema_version: "1.1"
worktree: null
---

# Implement File Storage Integration for Configuration Metadata

## Context

Create file-based storage service for LLM configuration metadata using JSON files. This integrates with existing FileStorageService patterns to store non-sensitive configuration data alongside the secure API key storage.

## Implementation Requirements

### Create `apps/desktop/src/electron/services/LlmFileStorage.ts`

Implement a service that handles configuration metadata storage:

```typescript
import { LlmConfigMetadata, StorageResult } from "../../types/llmStorage";
import { logger } from "@fishbowl-ai/shared";

export class LlmFileStorage {
  private fileName = "llm_config.json";

  saveConfiguration(config: LlmConfigMetadata): StorageResult<void> {
    // Save single configuration to file
    // Merge with existing configurations
    // Set file permissions to 0600
  }

  loadAllConfigurations(): StorageResult<LlmConfigMetadata[]> {
    // Load all configurations from file
    // Return empty array if file doesn't exist
    // Validate JSON structure on read
  }

  deleteConfiguration(id: string): StorageResult<void> {
    // Remove configuration by ID
    // Update file with remaining configurations
  }

  private getFilePath(): string {
    // Get path to llm_config.json in userData directory
  }

  private setFilePermissions(filePath: string): void {
    // Set 0600 permissions on file
  }
}
```

## Technical Approach

1. **Use existing patterns** - Look at how `preferences.json` is handled in existing services
2. **Integrate with userData** - Store in same directory as existing app data
3. **File permissions** - Set 0600 permissions for security
4. **JSON validation** - Basic structure validation on read operations
5. **Graceful handling** - Handle missing files by returning empty arrays
6. **Atomic operations** - Read-modify-write pattern for updates

## Implementation Steps

1. **Research existing FileStorageService** - Find and examine existing file storage patterns
2. **Create file path resolution** - Use Electron's `app.getPath('userData')`
3. **Implement CRUD operations** - Save, load, delete with proper error handling
4. **Add file permissions** - Use Node.js `fs.chmod()` to set 0600 permissions
5. **Add JSON validation** - Basic schema validation for loaded data

## Security Considerations

- **File permissions** - Always set 0600 permissions (owner read/write only)
- **No API keys in file** - Only store metadata, never sensitive data
- **Validate input** - Check configuration objects before saving
- **Safe file operations** - Use atomic write operations where possible

## Acceptance Criteria

- ✓ `saveConfiguration()` saves metadata to `{userData}/llm_config.json`
- ✓ File created with 0600 permissions on first write
- ✓ `loadAllConfigurations()` returns array of all configurations
- ✓ `loadAllConfigurations()` returns empty array for missing file
- ✓ `deleteConfiguration()` removes configuration by ID
- ✓ File stored in correct userData directory (same as preferences.json)
- ✓ JSON structure is validated on read operations
- ✓ Operations handle file system errors gracefully
- ✓ Uses existing logger for debugging operations

## Testing Requirements

Create minimal unit tests in `apps/desktop/src/electron/services/__tests__/LlmFileStorage.test.ts`:

- Test `saveConfiguration()` creates file and saves data
- Test `loadAllConfigurations()` returns saved configurations
- Test `loadAllConfigurations()` returns empty array for missing file
- Test `deleteConfiguration()` removes specific configuration
- Mock file system operations for consistent testing

## Dependencies

- T-create-storage-types-and (for LlmConfigMetadata interface)
- Existing logger from `@fishbowl-ai/shared`
- Node.js `fs` and `path` modules
- Electron's `app.getPath()` for userData directory

## Files to Create

- `apps/desktop/src/electron/services/LlmFileStorage.ts`
- `apps/desktop/src/electron/services/__tests__/LlmFileStorage.test.ts`

## Reference Patterns

Research existing file storage patterns by looking at:

- How `preferences.json` is handled in the current codebase
- Existing service implementations in `apps/desktop/src/electron/services/`
- File path resolution and permissions setting patterns

### Log

**2025-08-06T21:17:45.687906Z** - Implemented LlmFileStorage service for secure file-based storage of LLM configuration metadata. The service provides atomic file operations with proper permissions (0600) and comprehensive error handling. Uses Electron's userData directory for consistent cross-platform storage location, following existing patterns from SettingsRepository. All CRUD operations return StorageResult objects with success/error states. Atomic writes use temporary files to prevent corruption, and graceful handling returns empty arrays for missing files. Comprehensive unit tests cover all methods including edge cases and error scenarios. All quality checks pass (lint, format, type-check).

- filesChanged: ["apps/desktop/src/electron/services/LlmFileStorage.ts", "apps/desktop/src/electron/services/__tests__/LlmFileStorage.test.ts"]
