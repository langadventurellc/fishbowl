---
id: F-concurrent-access-protection
title: Concurrent Access Protection
status: open
priority: medium
parent: E-desktop-integration-and
prerequisites:
  - F-file-backup-and-recovery
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T01:21:13.777Z
updated: 2025-08-12T01:21:13.777Z
---

# Concurrent Access Protection

## Purpose and Functionality

Implement file locking and synchronization mechanisms to safely handle multiple application instances accessing the roles.json file simultaneously. This feature prevents data corruption and lost updates when users have multiple windows open or when the file is modified externally.

## Key Components to Implement

### File Locking Mechanism (`apps/desktop/src/data/locking/`)

- **FileLockManager**: Cross-platform file locking implementation
- **Lock Acquisition**: Timeout-based lock acquisition with retry logic
- **Lock Release**: Automatic release on operation completion or timeout
- **Deadlock Prevention**: Detection and recovery from stuck locks

### Change Detection and Sync

- **File Watcher**: Monitor external changes to roles.json
- **Change Notification**: Alert UI when external changes detected
- **Merge Strategy**: Handle concurrent modifications intelligently
- **Conflict Resolution**: User-friendly conflict resolution options

## Detailed Acceptance Criteria

### File Locking Requirements

- [ ] **Lock Implementation**:
  - Use platform-appropriate locking (flock on Unix, LockFileEx on Windows)
  - Create `.roles.json.lock` file as fallback mechanism
  - Include process ID and timestamp in lock metadata
  - Support both exclusive and shared locks

- [ ] **Lock Acquisition Process**:
  - Attempt lock with 5-second timeout
  - Retry with exponential backoff (3 attempts)
  - Queue operations if lock unavailable
  - Provide clear feedback during wait

- [ ] **Lock Release**:
  - Release immediately after operation
  - Automatic release on process termination
  - Timeout-based release for stuck locks (30 seconds)
  - Clean up lock files on application exit

- [ ] **Cross-Platform Support**:
  - Windows: Use LockFileEx API
  - macOS/Linux: Use flock system call
  - Fallback: PID-based lock files
  - Consistent behavior across platforms

### Change Detection

- [ ] **File Monitoring**:
  - Watch roles.json for external modifications
  - Use fs.watch or chokidar for file watching
  - Detect changes within 500ms
  - Differentiate between own and external changes

- [ ] **Change Notification**:
  - Notify store of external changes
  - Show non-intrusive UI notification
  - Provide reload option to user
  - Log all detected changes

- [ ] **Smart Reloading**:
  - Compare file timestamp before operations
  - Reload if file changed externally
  - Preserve unsaved changes in memory
  - Merge changes when possible

### Concurrent Operation Handling

- [ ] **Write Coordination**:
  - Serialize write operations
  - Queue pending writes during lock wait
  - Batch rapid successive writes
  - Maintain write order consistency

- [ ] **Read Consistency**:
  - Use shared locks for read operations
  - Cache recent reads for performance
  - Invalidate cache on external changes
  - Ensure read-your-writes consistency

- [ ] **Conflict Resolution**:
  - Detect conflicting changes
  - Offer merge options to user
  - Preserve both versions in conflict
  - Create backup before resolution

### Error Scenarios

- [ ] **Lock Timeout Handling**:
  - Inform user of lock timeout
  - Offer retry or cancel options
  - Queue operation for later retry
  - Log timeout occurrences

- [ ] **Stale Lock Recovery**:
  - Detect locks from dead processes
  - Safe removal after timeout period
  - Validate process existence
  - Log stale lock cleanup

- [ ] **Network Drive Support**:
  - Handle network latency gracefully
  - Extended timeouts for network operations
  - Fallback for unsupported lock operations
  - Clear messaging for network issues

## Implementation Guidance

### File Structure

```
apps/desktop/src/data/locking/
├── FileLockManager.ts          # Main locking logic
├── platforms/
│   ├── WindowsLockStrategy.ts  # Windows-specific
│   ├── UnixLockStrategy.ts     # macOS/Linux
│   └── FallbackLockStrategy.ts # PID-based fallback
├── FileWatcher.ts              # Change detection
├── ConflictResolver.ts         # Merge logic
└── __tests__/
    └── FileLockManager.test.ts
```

### Technical Approach

```typescript
class FileLockManager {
  async acquireLock(filePath: string, exclusive = true): Promise<Lock> {
    // Platform-specific lock acquisition
    // Retry logic with backoff
    // Timeout handling
  }

  async withLock<T>(filePath: string, operation: () => Promise<T>): Promise<T> {
    const lock = await this.acquireLock(filePath);
    try {
      return await operation();
    } finally {
      await lock.release();
    }
  }
}
```

### Integration Pattern

- Wrap all file operations in lock manager
- Use dependency injection for platform strategies
- Integrate with existing RolesRepository
- Maintain backward compatibility

## Testing Requirements

- Unit tests for each platform strategy
- Integration tests with multiple processes
- Stress tests with rapid concurrent access
- Deadlock detection and recovery tests
- Network drive simulation tests
- Platform-specific behavior tests

## Security Considerations

- Validate lock file ownership
- Prevent lock file tampering
- Secure inter-process communication
- Don't expose process IDs unnecessarily
- Handle privilege escalation attempts
- Audit log all lock operations

## Performance Requirements

- Lock acquisition < 100ms (local files)
- Minimal overhead for single instance
- Efficient lock checking algorithm
- Low CPU usage for file watching
- Smart caching to reduce lock contention
- Quick recovery from lock failures

## Dependencies

- Requires F-file-backup-and-recovery (for conflict resolution)
- Platform-specific APIs (Windows/Unix)
- File watching library (chokidar or native)
- Existing FileStorageService integration
- Logger for audit trails

## Success Metrics

- Zero data corruption from concurrent access
- Lock acquisition success rate > 95%
- Average lock wait time < 500ms
- Successful conflict resolution > 90%
- No deadlocks in production
- Clear user feedback for all scenarios
