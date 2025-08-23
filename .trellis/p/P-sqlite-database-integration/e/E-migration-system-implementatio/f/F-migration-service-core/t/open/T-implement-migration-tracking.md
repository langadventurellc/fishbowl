---
id: T-implement-migration-tracking
title: Implement migration tracking database operations
status: open
priority: high
parent: F-migration-service-core
prerequisites:
  - T-create-migration-types-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T16:32:28.874Z
updated: 2025-08-23T16:32:28.874Z
---

# Implement migration tracking database operations

## Context

This task implements the database operations for tracking which migrations have been applied. It manages the migrations table and provides methods to query migration status.

**Related Feature**: F-migration-service-core - Migration Service Core Implementation
**Dependencies**: T-create-migration-types-and (requires AppliedMigration type)
**Pattern Reference**: Follow patterns from `packages/shared/src/repositories/conversations/ConversationsRepository.ts` for database operations

## Specific Implementation Requirements

### 1. Create Migration Tracking Service

- Automatic migrations table creation
- Query applied migrations from database
- Check pending status for specific migrations
- Record completed migrations

### 2. Database Schema Management

- Create migrations table if not exists
- Handle database connection errors
- Use parameterized queries for safety
- Transaction support for consistency

### 3. Integration with DatabaseBridge

- Use dependency injection pattern
- Support both SQLite implementations
- Handle database errors gracefully
- Follow existing error handling patterns

## Technical Approach

### Migration Tracking Class

```typescript
class MigrationTracking {
  constructor(private databaseBridge: DatabaseBridge) {}

  async ensureMigrationsTable(): Promise<void> {
    // Create table if not exists
  }

  async getAppliedMigrations(): Promise<AppliedMigration[]> {
    // Query all applied migrations
  }

  async isPending(filename: string): Promise<boolean> {
    // Check if migration needs to run
  }

  async recordMigration(filename: string, checksum?: string): Promise<void> {
    // Record successful migration
  }
}
```

### Database Operations

- Use DatabaseBridge.execute() for table creation
- Use DatabaseBridge.query() for reading data
- Handle DatabaseError types properly
- Log all database operations

## Detailed Acceptance Criteria

### Table Management

- [ ] ensureMigrationsTable() creates table with correct schema
- [ ] Uses CREATE TABLE IF NOT EXISTS for idempotency
- [ ] Handles database connection failures gracefully
- [ ] Logs table creation success/failure

### Migration Queries

- [ ] getAppliedMigrations() returns all applied migrations
- [ ] Sorts results by applied_at timestamp
- [ ] Maps database rows to AppliedMigration objects
- [ ] Handles empty result sets correctly

### Status Checking

- [ ] isPending() checks if migration was already applied
- [ ] Uses parameterized queries for filename lookup
- [ ] Returns boolean result clearly
- [ ] Handles database query errors

### Recording Migrations

- [ ] recordMigration() inserts new migration record
- [ ] Includes filename and current timestamp
- [ ] Optional checksum parameter for future use
- [ ] Uses parameterized queries for safety
- [ ] Handles duplicate filename errors

### Error Handling

- [ ] Converts DatabaseError to MigrationError
- [ ] Provides clear error messages
- [ ] Logs database operations for debugging
- [ ] Never exposes sensitive database details

### Unit Tests

- [ ] Mock DatabaseBridge for all tests
- [ ] Test table creation success and failure
- [ ] Test querying applied migrations
- [ ] Test pending status checking
- [ ] Test recording new migrations
- [ ] Test duplicate migration handling
- [ ] Test database error conversion

## Dependencies

- T-create-migration-types-and (provides AppliedMigration type and MigrationError)

## Security Considerations

- Use parameterized queries to prevent SQL injection
- Validate input parameters before database operations
- Don't log sensitive database connection details
- Handle database permissions appropriately

## Performance Requirements

- Migration queries should complete in <50ms
- Batch operations where possible
- Efficient indexes on filename column
- Minimal memory usage for large result sets

## Files to Create/Modify

- `packages/shared/src/services/migrations/MigrationTracking.ts`
- `packages/shared/src/services/migrations/__tests__/MigrationTracking.test.ts`
- Update `packages/shared/src/services/migrations/index.ts` to export MigrationTracking
