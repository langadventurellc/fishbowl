---
id: F-migration-service-core
title: Migration Service Core Implementation
status: open
priority: medium
parent: E-migration-system-implementatio
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T16:28:17.286Z
updated: 2025-08-23T16:28:17.286Z
---

# Migration Service Core Implementation

## Purpose and Functionality

Implement the core MigrationService class in the shared package that provides the migration runner logic, file discovery, ordering, and tracking capabilities. This service will use the DatabaseBridge interface to execute migrations and track their application status.

## Key Components to Implement

### 1. MigrationService Class

- Location: `packages/shared/src/services/migrations/MigrationService.ts`
- Constructor accepting DatabaseBridge and migration directory path
- Core methods for migration discovery, filtering, and execution
- Transaction management for individual migrations
- Progress tracking and logging

### 2. Migration Tracking Table

- Automatic creation of `migrations` table on first run
- Schema: id, filename, checksum (optional), applied_at
- Methods to query applied migrations and check pending status

### 3. Migration Discovery and Ordering

- File system scanning for SQL files in migrations directory
- Numeric prefix parsing (001, 002, etc.)
- Sorting by numeric order
- Validation of file naming convention

### 4. Migration Execution Logic

- Load SQL content from migration files
- Execute within database transactions
- Record successful migrations in tracking table
- Handle rollback on failure
- Continue from last successful migration

## Detailed Acceptance Criteria

### Migration Service Implementation

- [ ] MigrationService class created with proper TypeScript types
- [ ] Constructor accepts DatabaseBridge and migrations path
- [ ] Unit tests for constructor and initialization

### Migration Discovery

- [ ] `discoverMigrations()` method finds all SQL files in directory
- [ ] Files sorted by numeric prefix (001, 002, etc.)
- [ ] Invalid file names are skipped with warning logs
- [ ] Unit tests for discovery and sorting logic

### Migration Tracking

- [ ] `ensureMigrationsTable()` creates tracking table if not exists
- [ ] `getAppliedMigrations()` returns list of completed migrations
- [ ] `isPending(filename)` checks if migration needs to run
- [ ] Unit tests for tracking methods with mock database

### Migration Execution

- [ ] `runMigrations()` executes all pending migrations in order
- [ ] Each migration wrapped in transaction using DatabaseBridge
- [ ] Success records filename and timestamp in tracking table
- [ ] Failure rolls back transaction and stops execution
- [ ] Clear logging of migration progress and results
- [ ] Unit tests for execution flow with success/failure scenarios

### Error Handling

- [ ] MigrationError class for migration-specific failures
- [ ] Detailed error messages including failed migration filename
- [ ] Proper error propagation to caller
- [ ] Unit tests for error scenarios

## Technical Requirements

### Dependencies

- Uses DatabaseBridge interface from shared package
- File system operations for reading migration files
- Path utilities for migration directory handling
- Logger from shared logging utilities

### File Structure

```
packages/shared/src/services/migrations/
├── MigrationService.ts
├── types.ts (interfaces and types)
├── errors.ts (MigrationError class)
├── index.ts (barrel export)
└── __tests__/
    └── MigrationService.test.ts
```

### Migration Table SQL

```sql
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    checksum TEXT,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Guidance

### Design Patterns

- Dependency injection with DatabaseBridge
- Single responsibility for migration logic
- Clear separation between discovery, tracking, and execution
- Use async/await for all database operations

### Code Quality

- Comprehensive TypeScript types for all methods
- JSDoc documentation for public API
- Follow existing logger patterns in codebase
- Keep implementation under 200 lines of code

## Testing Requirements

### Unit Test Coverage

- Mock DatabaseBridge for all database operations
- Mock file system for migration discovery
- Test happy path: successful migration execution
- Test error cases: failed migrations, invalid files
- Test edge cases: empty directory, no pending migrations
- Verify transaction usage and rollback behavior
- Test migration ordering with various numeric prefixes

## Security Considerations

- Validate migration file paths to prevent directory traversal
- No dynamic SQL construction - execute files as-is
- Ensure migrations run with appropriate database permissions
- Log but don't expose full SQL in error messages

## Performance Requirements

- Migration discovery should complete in <100ms
- Individual migrations should use transactions efficiently
- Batch checking of applied migrations (single query)
- Minimal memory usage when reading large migration files
