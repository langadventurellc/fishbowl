---
id: F-universal-configuration
title: Universal Configuration Access Protection
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T06:04:03.027Z
updated: 2025-08-12T06:04:03.027Z
---

# Universal Configuration Access Protection

## Purpose and Functionality

Implement a comprehensive, type-safe file locking and synchronization system for ALL JSON configuration files (preferences.json, LLM config files, roles.json) to safely handle concurrent access from multiple application instances, external editors, and background processes. This feature prevents data corruption, lost updates, and race conditions across the entire configuration system.

## Key Components to Implement

### Universal File Locking System (`packages/shared/src/services/storage/locking/`)

- **ConfigurationLockManager**: Generic, type-safe locking service for any configuration file
- **Cross-Platform Lock Strategies**: Windows (LockFileEx), Unix (flock), and PID-based fallback
- **Lock Coordination**: Exclusive and shared locks with timeout and retry logic
- **Deadlock Prevention**: Detection and recovery from stuck locks across all config files

### Change Detection & Synchronization

- **UniversalFileWatcher**: Monitor external changes to any configuration file
- **Change Notification System**: Alert specific repositories when their files change
- **Smart Merge Strategy**: Handle concurrent modifications for different config types
- **Conflict Resolution Engine**: Type-aware conflict resolution for each configuration schema

### Repository Integration Layer

- **SettingsRepository**: Add locking to preferences.json operations
- **LlmConfigRepository**: Add locking to LLM configuration operations
- **RolesRepository**: Add locking to roles.json operations
- **Unified Access Pattern**: Consistent locking interface across all repositories

## Detailed Acceptance Criteria

### Universal Locking Requirements

- [ ] **Generic Lock Implementation**:
  - Platform-appropriate locking (flock on Unix, LockFileEx on Windows)
  - Create `.{filename}.lock` files as fallback mechanism (e.g., `.preferences.json.lock`)
  - Include process ID, timestamp, and configuration type in lock metadata
  - Support both exclusive (write) and shared (read) locks
  - Type-safe lock acquisition: `ConfigurationLockManager<TConfig>`

- [ ] **Lock Acquisition Process**:
  - Configurable timeout per repository (default: 5 seconds)
  - Exponential backoff retry logic (3 attempts default)
  - Queue operations if lock unavailable with priority system
  - Clear progress feedback during lock wait
  - Separate lock files for each configuration type

- [ ] **Lock Release & Cleanup**:
  - Immediate release after operation completion
  - Automatic release on process termination or crash
  - Timeout-based release for stuck locks (configurable: 30s default)
  - Comprehensive cleanup on application shutdown
  - Orphaned lock detection and removal

- [ ] **Multi-Configuration Support**:
  - Independent locking per configuration file
  - No cross-configuration blocking (preferences lock doesn't block roles)
  - Unified lock status monitoring across all config types
  - Configurable locking behavior per repository

### Change Detection System

- [ ] **Universal File Monitoring**:
  - Watch all configuration files: preferences.json, roles.json, LLM configs
  - Use fs.watch with chokidar fallback for cross-platform reliability
  - Detect changes within 500ms across all monitored files
  - Differentiate between internal writes and external modifications
  - Batch multiple rapid changes to prevent notification spam

- [ ] **Smart Change Notification**:
  - Repository-specific notification: only notify relevant repository
  - Non-intrusive UI notifications with file-specific context
  - Provide reload/merge options appropriate to each config type
  - Comprehensive audit logging of all detected changes
  - Integration with existing store/state management patterns

- [ ] **Configuration-Aware Reloading**:
  - File timestamp validation before any operation
  - Type-safe reloading with schema validation for each config
  - Preserve unsaved in-memory changes during external reload
  - Intelligent merging based on configuration structure and semantics

### Repository-Specific Integration

- [ ] **SettingsRepository Integration**:
  - Lock acquisition before preferences.json read/write operations
  - Merge external changes with pending preference updates
  - Handle deep merge conflicts in nested preference objects
  - Preserve user's current session state during external changes

- [ ] **LlmConfigRepository Integration**:
  - Lock coordination for both metadata file and secure storage operations
  - Handle concurrent API key updates safely
  - Detect external configuration additions/removals
  - Maintain consistency between file storage and secure storage

- [ ] **RolesRepository Integration**:
  - Replace existing roles-specific locking with universal system
  - Preserve current validation and error handling patterns
  - Handle role array conflicts intelligently (addition/removal/modification)
  - Support migration from existing role-specific locking

### Concurrent Operation Handling

- [ ] **Write Coordination**:
  - Serialize write operations per configuration file
  - Cross-repository write operations can proceed in parallel
  - Queue pending writes with timeout and cancellation support
  - Batch rapid successive writes to reduce lock contention
  - Maintain strict write order consistency per file

- [ ] **Read Performance Optimization**:
  - Use shared locks for read operations
  - Smart caching with invalidation on external changes
  - Read-your-writes consistency guarantees
  - Concurrent reads across different configuration files
  - Cache coordination across multiple application instances

- [ ] **Advanced Conflict Resolution**:
  - Configuration-type-aware conflict detection
  - Three-way merge for each configuration schema
  - User-friendly conflict resolution UI per config type
  - Automatic backup creation before conflict resolution
  - Rollback capability for failed merge operations

### Error Handling & Recovery

- [ ] **Lock Timeout Management**:
  - Configuration-specific timeout settings
  - Clear user feedback with file context (e.g., "preferences.json is locked")
  - Retry, cancel, or force-unlock options based on configuration type
  - Operation queuing with user-visible progress
  - Detailed logging for timeout analysis

- [ ] **Stale Lock Recovery**:
  - Cross-platform process existence validation
  - Safe removal of locks from terminated processes
  - Configurable stale lock timeout per configuration type
  - Emergency lock breaking with user confirmation
  - Comprehensive audit trail for lock recovery

- [ ] **Network Storage Support**:
  - Extended timeouts for network-mounted configuration directories
  - Graceful degradation when advanced locking unavailable
  - Fallback strategies for unsupported network filesystems
  - Clear error messaging for network-specific issues
  - Performance optimization for network latency

## Implementation Guidance

### File Structure

```
packages/shared/src/services/storage/locking/
├── ConfigurationLockManager.ts      # Main generic locking service
├── strategies/
│   ├── WindowsLockStrategy.ts       # Windows LockFileEx implementation
│   ├── UnixLockStrategy.ts          # macOS/Linux flock implementation
│   └── FallbackLockStrategy.ts      # PID-based cross-platform fallback
├── UniversalFileWatcher.ts          # Multi-file change detection
├── ConflictResolutionEngine.ts      # Type-aware conflict resolution
├── LockCoordinator.ts               # Multi-file lock coordination
├── types.ts                         # Locking interfaces and types
├── index.ts                         # Barrel exports
└── __tests__/
    ├── ConfigurationLockManager.test.ts
    ├── integration/
    │   ├── multiProcess.test.ts     # Multi-process locking tests
    │   ├── crossPlatform.test.ts    # Platform-specific behavior
    │   └── repositories.test.ts     # Repository integration tests
    └── strategies/
        ├── WindowsLockStrategy.test.ts
        ├── UnixLockStrategy.test.ts
        └── FallbackLockStrategy.test.ts
```

### Technical Approach

```typescript
// Generic lock manager with type safety
class ConfigurationLockManager<TConfig = unknown> {
  async withLock<TResult>(
    filePath: string,
    operation: () => Promise<TResult>,
    options?: LockOptions,
  ): Promise<TResult>;

  async acquireSharedLock(filePath: string): Promise<Lock>;
  async acquireExclusiveLock(filePath: string): Promise<Lock>;
}

// Repository integration pattern
class SettingsRepository {
  private lockManager = new ConfigurationLockManager<PersistedSettingsData>({
    lockTimeout: 5000,
    maxRetries: 3,
    conflictResolver: this.resolveSettingsConflicts.bind(this),
  });

  async saveSettings(settings: Partial<PersistedSettingsData>): Promise<void> {
    return this.lockManager.withLock(this.settingsFilePath, async () => {
      // existing save logic with automatic locking
    });
  }
}

// Type-safe conflict resolution
interface ConflictResolver<TConfig> {
  canAutoResolve(current: TConfig, incoming: TConfig): boolean;
  autoResolve(current: TConfig, incoming: TConfig): TConfig;
  requiresUserInput(
    current: TConfig,
    incoming: TConfig,
  ): ConflictDescriptor<TConfig>;
}
```

### Configuration Schema

```typescript
interface LockConfiguration {
  lockTimeout?: number; // Default: 5000ms
  maxRetries?: number; // Default: 3
  staleLockTimeout?: number; // Default: 30000ms
  enableFileWatching?: boolean; // Default: true
  batchWriteDelay?: number; // Default: 100ms
  networkTimeout?: number; // Default: 15000ms
}

interface LockMetadata {
  processId: number;
  timestamp: string;
  configurationType: "settings" | "llmConfig" | "roles" | "custom";
  lockType: "shared" | "exclusive";
  platform: "windows" | "unix" | "fallback";
}
```

## Testing Requirements

### Unit Tests

- Lock manager functionality with all strategies
- Cross-platform lock behavior verification
- Timeout and retry logic validation
- Conflict resolution for each configuration type
- File watching and change detection accuracy

### Integration Tests

- Multi-process concurrent access simulation
- Repository integration with real configuration files
- Network storage behavior testing
- Platform-specific locking verification
- Performance testing with rapid concurrent operations

### End-to-End Tests

- Full application startup with multiple instances
- External editor modification scenarios
- System restart and lock recovery testing
- User conflict resolution workflows
- Cross-configuration-type operation testing

## Security Considerations

- **Lock File Security**: Validate ownership and prevent tampering of lock files
- **Process Validation**: Secure verification of process existence for stale lock detection
- **Privilege Boundaries**: Handle different user privilege levels accessing same config files
- **Audit Trail**: Comprehensive logging of all locking operations for security analysis
- **Race Condition Prevention**: Atomic lock file creation and validation
- **Information Disclosure**: Avoid exposing sensitive process or system information

## Performance Requirements

- **Lock Acquisition**: < 100ms for local files, < 1000ms for network storage
- **Single Instance Overhead**: < 5ms additional latency for uncontended operations
- **Memory Usage**: < 1MB additional memory for lock coordination system
- **File Watching**: < 10ms CPU time per configuration file change detection
- **Concurrent Scaling**: Support up to 10 concurrent application instances efficiently
- **Lock Recovery**: < 500ms to detect and recover from stale locks

## Dependencies

- **Platform APIs**: Windows LockFileEx, Unix flock system calls
- **File Watching**: chokidar library or native fs.watch capabilities
- **Existing Infrastructure**: FileStorageService, logger, existing repository patterns
- **Type System**: Integration with existing configuration schemas and validation
- **Error Handling**: Existing error hierarchy and storage exception patterns

## Success Metrics

- **Data Integrity**: Zero configuration corruption incidents from concurrent access
- **Lock Success Rate**: > 98% successful lock acquisition under normal conditions
- **Performance Impact**: < 10% increase in configuration operation latency
- **Conflict Resolution**: > 90% of conflicts auto-resolved without user intervention
- **System Reliability**: Zero deadlocks or permanent lock conditions in production
- **User Experience**: Clear, actionable feedback for all concurrent access scenarios

## Breaking Changes & Migration

- **Zero Breaking Changes**: All repository public APIs remain unchanged
- **Transparent Integration**: Locking happens automatically within existing repository methods
- **Progressive Rollout**: Can be enabled per-repository for gradual deployment
- **Fallback Support**: Graceful degradation when advanced locking features unavailable
- **Migration Strategy**: Smooth transition from existing roles-specific locking system
- **Backward Compatibility**: Support for existing lock files during transition period
