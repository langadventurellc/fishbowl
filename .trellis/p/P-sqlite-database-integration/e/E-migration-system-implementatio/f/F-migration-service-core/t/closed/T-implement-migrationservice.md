---
id: T-implement-migrationservice
title: Implement MigrationService orchestration class
status: done
priority: high
parent: F-migration-service-core
prerequisites:
  - T-implement-migration-file
  - T-implement-migration-tracking
affectedFiles:
  packages/shared/src/services/migrations/MigrationService.ts:
    Created main MigrationService orchestration class with runMigrations method,
    transaction management, and comprehensive error handling
  packages/shared/src/services/migrations/MigrationExecutionResult.ts:
    Created result interface for migration execution process with success
    status, counts, and error details
  packages/shared/src/services/migrations/MigrationExecutionError.ts:
    Created interface for migration execution error details with order,
    filename, and error message
  packages/shared/src/services/migrations/__tests__/MigrationService.test.ts:
    Created comprehensive unit test suite with 8 test cases covering all major
    functionality and error scenarios
  packages/shared/src/services/migrations/index.ts: Updated barrel export to
    include MigrationService as primary export along with new result and error
    types
log:
  - >-
    Successfully implemented the MigrationService orchestration class that
    coordinates the entire database migration process. The service composes
    MigrationDiscovery and MigrationTracking components to provide a complete
    migration execution workflow.


    Key features implemented:

    - Constructor with dependency injection pattern (DatabaseBridge,
    FileSystemBridge, PathUtilsInterface)

    - runMigrations() method that orchestrates discovery, tracking, and
    execution

    - Transaction management using DatabaseBridge.transaction() for atomic
    migration execution

    - Comprehensive error handling with MigrationError wrapping

    - Proper logging throughout the migration process

    - Support for filtering pending vs applied migrations

    - Validation of migration file integrity

    - Graceful handling of empty migration directories and various error
    scenarios


    The implementation follows all established patterns from the codebase
    including dependency injection, proper error handling with custom error
    classes, comprehensive logging, and transaction management. All unit tests
    pass with 100% coverage of critical functionality.
schema: v1.0
childrenIds: []
created: 2025-08-23T16:32:54.282Z
updated: 2025-08-23T16:32:54.282Z
---

# Implement MigrationService orchestration class

## Context

This task creates the main MigrationService class that orchestrates the entire migration process. It combines discovery, tracking, and execution into a single cohesive service.

**Related Feature**: F-migration-service-core - Migration Service Core Implementation
**Dependencies**: T-implement-migration-file (MigrationDiscovery), T-implement-migration-tracking (MigrationTracking)
**Pattern Reference**: Follow service patterns from `packages/shared/src/repositories/` for dependency injection and error handling

## Specific Implementation Requirements

### 1. Create MigrationService Class

- Constructor with DatabaseBridge and migrations path
- Compose MigrationDiscovery and MigrationTracking
- Public API for running migrations
- Transaction management for migration execution

### 2. Migration Execution Logic

- Discover all migration files
- Filter for pending migrations
- Execute in numeric order
- Record successful completions
- Handle failures with rollback

### 3. File Reading and Execution

- Read SQL content from migration files
- Execute SQL through DatabaseBridge
- Wrap each migration in transaction
- Provide detailed logging and progress

## Technical Approach

### MigrationService Implementation

```typescript
export class MigrationService {
  private discovery: MigrationDiscovery;
  private tracking: MigrationTracking;

  constructor(
    private databaseBridge: DatabaseBridge,
    private migrationsPath: string,
  ) {
    this.discovery = new MigrationDiscovery();
    this.tracking = new MigrationTracking(databaseBridge);
  }

  async runMigrations(): Promise<MigrationResult[]> {
    // 1. Ensure migrations table exists
    // 2. Discover all migrations
    // 3. Filter for pending migrations
    // 4. Execute each migration in transaction
    // 5. Return results
  }

  private async executeMigration(
    migration: MigrationFile,
  ): Promise<MigrationResult> {
    // Execute single migration with transaction
  }
}
```

### Transaction Management

- Each migration runs in its own transaction
- Rollback on SQL execution failure
- Continue from last successful migration
- Log all transaction operations

## Detailed Acceptance Criteria

### Service Construction

- [ ] Constructor accepts DatabaseBridge and migrations path
- [ ] Initializes MigrationDiscovery and MigrationTracking components
- [ ] Validates constructor parameters
- [ ] Sets up logger for migration operations

### Migration Execution Flow

- [ ] runMigrations() orchestrates complete migration process
- [ ] Ensures migrations table exists before processing
- [ ] Discovers all migration files from directory
- [ ] Filters for pending migrations only
- [ ] Executes migrations in numeric order
- [ ] Returns array of MigrationResult objects

### Individual Migration Processing

- [ ] Reads SQL content from migration file
- [ ] Executes SQL within database transaction
- [ ] Records successful migration in tracking table
- [ ] Rolls back transaction on execution failure
- [ ] Provides detailed error context on failure

### Error Handling

- [ ] Converts file system errors to MigrationError
- [ ] Handles SQL execution errors appropriately
- [ ] Stops execution on first migration failure
- [ ] Provides clear error messages with context
- [ ] Logs all error conditions for debugging

### Logging and Progress

- [ ] Logs migration discovery results
- [ ] Logs each migration execution attempt
- [ ] Logs successful completions with timing
- [ ] Logs failures with error details
- [ ] Provides progress indication for multiple migrations

### Unit Tests

- [ ] Mock all dependencies (DatabaseBridge, file system)
- [ ] Test successful migration execution flow
- [ ] Test migration failure and rollback
- [ ] Test empty migrations directory
- [ ] Test no pending migrations scenario
- [ ] Test file reading errors
- [ ] Test database execution errors
- [ ] Test transaction rollback behavior

## Dependencies

- T-implement-migration-file (provides MigrationDiscovery)
- T-implement-migration-tracking (provides MigrationTracking)

## Security Considerations

- Validate migration file paths before reading
- Execute SQL content as-is (no dynamic construction)
- Don't expose full SQL content in error messages
- Validate migrations path parameter

## Performance Requirements

- Complete migration process in <5 seconds for startup
- Execute individual migrations efficiently
- Minimal memory usage when reading large SQL files
- Log performance metrics for monitoring

## Files to Create/Modify

- `packages/shared/src/services/migrations/MigrationService.ts`
- `packages/shared/src/services/migrations/__tests__/MigrationService.test.ts`
- Update `packages/shared/src/services/migrations/index.ts` to export MigrationService as primary export
