---
id: F-general-configuration-backup
title: General Configuration Backup Service
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T05:56:56.063Z
updated: 2025-08-12T05:56:56.063Z
---

# General Configuration Backup Service

## Purpose and Functionality

Implement a comprehensive, type-safe backup and recovery system for all JSON configuration files (preferences.json, LLM config, roles.json) that provides automatic backup creation, intelligent recovery, and cleanup across the entire application. This replaces the need for file-specific backup solutions and ensures consistent data protection patterns.

## Key Components to Implement

### Core Backup Service (`packages/shared/src/services/storage/backup/`)

- **ConfigurationBackupService**: Generic, type-safe backup service that works with any JSON configuration
- **BackupStrategy**: Configurable backup naming, rotation, and retention policies
- **RecoveryManager**: Intelligent recovery with validation and fallback options
- **BackupMetadata**: Track backup creation reasons, timestamps, and validation status
- **BackupRotationManager**: Automatic cleanup and retention management

### Repository Integration

- **SettingsRepository**: Add backup/recovery to preferences.json operations
- **LlmConfigRepository**: Add backup/recovery to LLM configuration operations
- **RolesRepository**: Replace existing roles-specific backup with general service
- **Unified Error Handling**: Consistent backup failure handling across all repositories

### Type System & Interfaces

- **BackupConfig**: Configuration interface for backup behavior per repository
- **RecoveryResult**: Standardized recovery outcome reporting
- **BackupValidator**: Generic validation interface for different config types
- **BackupServiceInterface**: Contract for backup operations

## Detailed Acceptance Criteria

### Backup Creation Requirements

- [ ] **Automatic Backup Triggers**:
  - Before every save/write operation for all configuration files
  - When file corruption is detected during load operations
  - Before file deletion, reset, or migration operations
  - Configurable per-repository backup frequency (every save vs. time-based)

- [ ] **Backup File Management**:
  - Timestamp format: `{filename}.YYYY-MM-DD-HH-mm-ss.bak`
  - Store backups in same directory as original files
  - Support configurable retention (default: 5 backups per file)
  - Rotation removes oldest backups when limit exceeded
  - Backup metadata stored in companion `.meta` files

- [ ] **Type-Safe Operations**:
  - Generic service: `ConfigurationBackupService<TConfig>`
  - Type validation during backup creation and recovery
  - Compile-time safety for repository integration
  - Schema validation hooks for each configuration type

### Recovery Operations

- [ ] **Intelligent Recovery Scenarios**:
  - Automatic recovery when JSON parsing fails
  - Recovery when schema validation fails
  - Manual recovery option for users
  - Recovery with data migration between schema versions

- [ ] **Recovery Process**:
  - Find most recent valid backup through validation
  - Test backup integrity before restoration
  - Create safety backup of corrupted file
  - Atomic restoration with rollback capability
  - Detailed recovery logging and user notification

- [ ] **Validation Integration**:
  - Use existing schema validators (settings, LLM config, roles)
  - Custom validation hooks for each repository
  - Partial recovery when possible (preserve valid data)
  - Fallback to defaults when no valid backup exists

### Repository Integration Requirements

- [ ] **SettingsRepository Integration**:
  - Backup before every `saveSettings()` call
  - Recovery in `loadSettings()` when file is corrupted
  - Preserve existing deep merge and validation logic
  - No breaking changes to public API

- [ ] **LlmConfigRepository Integration**:
  - Backup before configuration save operations
  - Handle secure storage API keys during backup/recovery
  - Maintain existing transaction semantics
  - Support backup of metadata without sensitive data

- [ ] **RolesRepository Integration**:
  - Replace existing roles-specific backup system
  - Preserve current validation and error handling
  - Maintain compatibility with existing role management features
  - Support migration from old backup format

### Performance & Reliability

- [ ] **Performance Requirements**:
  - Backup creation: < 50ms for typical configuration files
  - Recovery operation: < 100ms including validation
  - Non-blocking async backup operations
  - Memory-efficient file operations for large configs

- [ ] **Reliability Requirements**:
  - Atomic backup operations (all-or-nothing)
  - Corruption-resistant backup format
  - Safe concurrent access across multiple processes
  - Graceful degradation when backup storage fails

## Implementation Guidance

### File Structure

```
packages/shared/src/services/storage/backup/
├── ConfigurationBackupService.ts    # Main generic backup service
├── BackupStrategy.ts                # Backup naming and rotation logic
├── RecoveryManager.ts               # Recovery operations and validation
├── BackupRotationManager.ts         # Cleanup and retention policies
├── BackupValidator.ts               # Validation interface and helpers
├── types.ts                         # Backup-related type definitions
├── index.ts                         # Barrel exports
└── __tests__/
    ├── ConfigurationBackupService.test.ts
    ├── BackupStrategy.test.ts
    ├── RecoveryManager.test.ts
    └── integration.test.ts          # Cross-repository integration tests
```

### Technical Approach

- **Build on existing infrastructure**: Use current `createFileBackup()` and `FileStorageService`
- **Type-safe design**: Generic service with configuration-specific type parameters
- **Dependency injection**: Injectable validators and file system bridges
- **Repository pattern**: Clean integration with existing repository pattern
- **Error boundaries**: Backup failures never break save operations

### Integration Pattern

```typescript
// Generic service usage
class SettingsRepository {
  private backupService = new ConfigurationBackupService<PersistedSettingsData>(
    {
      validator: this.validateSettings.bind(this),
      maxBackups: 5,
      retentionDays: 30,
    },
  );

  async saveSettings(settings: Partial<PersistedSettingsData>): Promise<void> {
    await this.backupService.createBackup(this.settingsFilePath);
    // existing save logic...
  }

  async loadSettings(): Promise<PersistedSettingsData> {
    try {
      // existing load logic...
    } catch (error) {
      return await this.backupService.recoverFromBackup(this.settingsFilePath);
    }
  }
}
```

### Configuration Schema

```typescript
interface BackupConfig {
  maxBackups?: number; // Default: 5
  retentionDays?: number; // Default: 30
  backupOnSave?: boolean; // Default: true
  compressionEnabled?: boolean; // Default: false
  encryptionEnabled?: boolean; // Default: false
}
```

## Testing Requirements

### Unit Tests

- Backup service creation and configuration
- Backup file naming and rotation logic
- Recovery validation and fallback logic
- Error handling and edge cases
- Performance benchmarks for typical file sizes

### Integration Tests

- Repository integration with each configuration type
- Cross-platform file system operations
- Concurrent backup and save operations
- Recovery scenarios with real configuration files
- Migration from existing backup systems

### End-to-End Tests

- Full backup/recovery cycle for each repository
- Application restart recovery scenarios
- User-initiated recovery operations
- Backup rotation and cleanup over time

## Security Considerations

- **File Permissions**: Backup files inherit source file permissions
- **Sensitive Data**: LLM API keys handled through existing secure storage patterns
- **Path Validation**: Strict validation of backup file paths to prevent traversal
- **Atomic Operations**: Prevent partial writes that could leak data
- **Cleanup Security**: Secure deletion of old backup files
- **Access Control**: Backup operations respect existing repository access patterns

## Performance Requirements

- **Backup Creation**: Non-blocking, < 50ms for files up to 1MB
- **Recovery Operations**: < 100ms including validation and restoration
- **Memory Usage**: Stream-based processing for large files
- **Disk Usage**: Configurable retention with automatic cleanup
- **Concurrent Safety**: Multiple processes can safely create backups
- **Cache Efficiency**: Backup metadata cached to avoid repeated file system calls

## Dependencies

- **Existing Infrastructure**: `FileStorageService`, `createFileBackup()`, logger
- **Repository Systems**: `SettingsRepository`, `LlmConfigRepository`, `RolesRepository`
- **Validation**: Existing schema validators and error types
- **File System**: Platform-specific file system bridges
- **Testing**: Jest, existing test utilities and patterns

## Success Metrics

- **Data Safety**: Zero configuration data loss incidents after implementation
- **Recovery Success Rate**: > 99% successful recovery from corrupted files
- **Performance Impact**: < 5% increase in save operation time
- **Storage Efficiency**: Backup storage < 20% of total configuration data size
- **Developer Experience**: Simple integration API with existing repositories
- **User Experience**: Transparent backup operations with clear recovery notifications

## Breaking Changes & Migration

- **No Breaking API Changes**: All repository public APIs remain unchanged
- **Roles Migration**: Smooth transition from existing roles backup system
- **Backward Compatibility**: Existing backup files preserved during migration
- **Progressive Rollout**: Can be enabled per-repository for gradual deployment
