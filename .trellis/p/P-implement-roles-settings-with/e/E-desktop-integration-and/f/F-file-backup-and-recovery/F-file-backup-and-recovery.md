---
id: F-file-backup-and-recovery
title: File Backup and Recovery
status: wont-do
priority: medium
parent: E-desktop-integration-and
prerequisites:
  - F-initial-roles-data-creation
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T01:20:27.655Z
updated: 2025-08-12T01:20:27.655Z
---

# File Backup and Recovery

## Purpose and Functionality

Implement robust backup and recovery mechanisms for the roles.json file to protect user data from corruption, failed writes, and validation errors. This feature ensures data integrity by creating automatic backups before risky operations and providing recovery options when corruption is detected.

## Key Components to Implement

### Backup Operations (`apps/desktop/src/data/backup/`)

- **BackupService**: Service for creating and managing role file backups
- **Backup Strategy**: Timestamp-based backup naming with rotation policy
- **Recovery Logic**: Automated and manual recovery from backup files
- **Cleanup Policy**: Remove old backups to prevent disk space issues

### Integration with RolesRepository

- **Pre-write Backup**: Create backup before any save operation
- **Validation Failure Backup**: Backup corrupted files before recovery attempts
- **Recovery Flow**: Restore from most recent valid backup
- **Backup Metadata**: Track backup creation time and reason

## Detailed Acceptance Criteria

### Backup Creation Requirements

- [ ] **Automatic Backup Triggers**:
  - Before every save operation (if file exists)
  - When corruption is detected during load
  - Before file deletion/reset operations
  - When validation errors occur on existing files

- [ ] **Backup File Management**:
  - Use timestamp format: `roles.json.YYYY-MM-DD-HH-mm-ss.bak`
  - Store in same directory as roles.json
  - Maintain maximum of 5 backup files
  - Rotate oldest backups when limit exceeded
  - Include backup reason in metadata file

- [ ] **Backup Validation**:
  - Verify backup file was created successfully
  - Validate backup contents match original
  - Check file permissions are correct
  - Log backup operations for debugging

### Recovery Operations

- [ ] **Automatic Recovery Scenarios**:
  - When roles.json is corrupted but backup exists
  - After failed save operation with data loss
  - When schema validation fails on load
  - During application crash recovery

- [ ] **Recovery Process**:
  - Identify most recent valid backup
  - Validate backup file before restoration
  - Create safety backup of corrupted file
  - Restore from backup with atomic operation
  - Log recovery details for troubleshooting

- [ ] **User Notification**:
  - Inform user when recovery was performed
  - Provide details about data that was recovered
  - Show timestamp of recovered data
  - Option to manually choose backup file

### Backup Rotation and Cleanup

- [ ] **Rotation Policy**:
  - Keep maximum 5 backup files
  - Delete oldest when creating new backup
  - Preserve backups from last 7 days minimum
  - Special handling for corruption backups

- [ ] **Cleanup Operations**:
  - Remove backups older than 30 days
  - Clean temporary files from failed operations
  - Provide manual cleanup option
  - Log cleanup operations

### Error Handling

- [ ] **Backup Failure Handling**:
  - Continue with operation if backup fails
  - Log detailed error information
  - Don't block save operations
  - Fall back to simpler backup method

- [ ] **Recovery Failure Handling**:
  - Try multiple backup files if first fails
  - Provide manual recovery instructions
  - Create diagnostic report for support
  - Never lose user data silently

## Implementation Guidance

### File Structure

```
apps/desktop/src/data/backup/
├── RolesBackupService.ts       # Main backup service
├── BackupStrategy.ts           # Backup naming and rotation
├── RecoveryManager.ts          # Recovery operations
├── types.ts                    # Backup-related types
└── __tests__/
    └── RolesBackupService.test.ts
```

### Technical Approach

- Use existing FileStorageService for file operations
- Implement atomic operations for backup/restore
- Use try-catch with detailed error logging
- Follow existing backup patterns from settings
- Integrate seamlessly with RolesRepository

### Integration with Existing Code

```typescript
// In RolesRepository
async saveRoles(roles: PersistedRolesSettingsData): Promise<void> {
  // Create backup before save
  await this.backupService.createBackup(this.filePath);

  try {
    // Existing save logic
    await this.fileStorageService.writeJsonFile(this.filePath, roles);
  } catch (error) {
    // Attempt recovery if save failed
    await this.backupService.recoverFromBackup(this.filePath);
    throw error;
  }
}
```

## Testing Requirements

- Unit tests for backup creation and naming
- Integration tests for backup/restore cycle
- Tests for rotation policy enforcement
- Corruption recovery scenario tests
- Performance tests with large backup files
- Concurrent backup operation tests

## Security Considerations

- Set restrictive permissions on backup files
- Don't expose backup file paths to users
- Validate backup contents before restoration
- Prevent backup file injection attacks
- Secure deletion of old backup files
- Encrypt sensitive data in backups if needed

## Performance Requirements

- Backup creation < 50ms for typical files
- Recovery operation < 100ms
- Non-blocking backup operations
- Efficient file rotation algorithm
- Minimal disk I/O during cleanup
- Smart caching of backup metadata

## Dependencies

- Requires F-initial-roles-data-creation (to handle initial state)
- Uses existing FileStorageService
- Integrates with RolesRepository
- Uses shared validation utilities
- Depends on existing logger infrastructure

## Success Metrics

- Zero data loss from corruption or failed saves
- Successful recovery rate > 99% for corrupted files
- Backup operations don't impact save performance
- Disk space usage remains controlled
- Clear audit trail of backup/recovery operations
- User confidence in data safety improved
