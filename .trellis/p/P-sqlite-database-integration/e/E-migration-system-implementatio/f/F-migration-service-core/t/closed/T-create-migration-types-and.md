---
id: T-create-migration-types-and
title: Create migration types and error classes
status: done
priority: high
parent: F-migration-service-core
prerequisites: []
affectedFiles:
  packages/shared/src/services/migrations/MigrationErrorCode.ts:
    Created comprehensive enum with migration-specific error codes following
    DatabaseErrorCode pattern
  packages/shared/src/services/migrations/MigrationError.ts: Created
    MigrationError class extending Error with filename, context, and
    serialization support
  packages/shared/src/services/migrations/MigrationFile.ts:
    Created interface for
    discovered migration files with filename, order, and path properties
  packages/shared/src/services/migrations/AppliedMigration.ts: Created interface matching database schema for tracking applied migrations
  packages/shared/src/services/migrations/MigrationResult.ts: Created discriminated union type for migration execution results
  packages/shared/src/services/migrations/MigrationStatus.ts: Created enum for
    migration execution states (pending, running, applied, failed, skipped)
  packages/shared/src/services/migrations/MigrationOperation.ts:
    Created enum for migration operation types (apply, rollback, discover,
    validate, initialize)
  packages/shared/src/services/migrations/index.ts: Created barrel export file following database types pattern
  packages/shared/src/services/migrations/__tests__/MigrationError.test.ts: Created comprehensive unit tests for MigrationError class with 100% coverage
  packages/shared/src/services/migrations/__tests__/types.test.ts:
    Created comprehensive unit tests for all migration types and enums with
    integration scenarios
log:
  - Successfully implemented foundational migration types and error classes
    following established project patterns. Created MigrationErrorCode enum with
    comprehensive error codes, MigrationError class extending Error with
    serialization support, and migration types (MigrationFile, AppliedMigration,
    MigrationResult, MigrationStatus, MigrationOperation). All files follow the
    "one export per file" rule, include comprehensive JSDoc documentation, and
    have full unit test coverage. All quality checks pass including linting,
    formatting, and type checking. Ready for MigrationService implementation.
schema: v1.0
childrenIds: []
created: 2025-08-23T16:31:41.645Z
updated: 2025-08-23T16:31:41.645Z
---

# Create migration types and error classes

## Context

This task establishes the foundational types, interfaces, and error classes for the migration system. These types will be used throughout the MigrationService implementation and provide clear contracts for migration operations.

**Related Feature**: F-migration-service-core - Migration Service Core Implementation
**Pattern Reference**: Follow existing error patterns from `packages/shared/src/services/database/types/` and `packages/shared/src/types/conversations/errors/`

## Specific Implementation Requirements

### 1. Create Migration Types (`packages/shared/src/services/migrations/types.ts`)

- `MigrationFile` interface with filename, order, and path properties
- `AppliedMigration` interface matching database schema
- `MigrationResult` type for execution results
- Type definitions for migration status and operations

### 2. Create Migration Error Class (`packages/shared/src/services/migrations/errors.ts`)

- `MigrationError` class extending Error
- Include migration filename and operation context
- Serializable for IPC communication
- Error codes for different failure types

### 3. Create Barrel Export (`packages/shared/src/services/migrations/index.ts`)

- Export all types and interfaces
- Export error classes
- Follow existing patterns from database package

## Technical Approach

### Migration Types Structure

```typescript
interface MigrationFile {
  filename: string;
  order: number;
  path: string;
}

interface AppliedMigration {
  id: number;
  filename: string;
  checksum?: string;
  applied_at: string;
}

type MigrationResult =
  | {
      success: true;
      filename: string;
      executionTime: number;
    }
  | {
      success: false;
      filename: string;
      error: string;
    };
```

### Error Class Implementation

- Extend base Error class
- Include migration-specific context
- Provide clear error messages
- Support error serialization

## Detailed Acceptance Criteria

### Types Implementation

- [ ] MigrationFile interface created with required properties
- [ ] AppliedMigration interface matches database schema
- [ ] MigrationResult discriminated union for success/failure
- [ ] All types properly exported with JSDoc documentation

### Error Class

- [ ] MigrationError class extends Error
- [ ] Includes filename and operation properties
- [ ] Provides toJSON() method for serialization
- [ ] Clear error messages for debugging

### File Organization

- [ ] types.ts contains all interface definitions
- [ ] errors.ts contains error class
- [ ] index.ts exports all types and errors
- [ ] Follow existing package structure patterns

### Unit Tests

- [ ] Test all type definitions compile correctly
- [ ] Test MigrationError construction and properties
- [ ] Test error serialization works properly
- [ ] Test barrel exports are accessible
- [ ] Verify no circular dependencies

## Dependencies

- None - this is foundational work

## Security Considerations

- Error messages should not expose sensitive file paths
- Error serialization should not leak internal state
- Input validation for migration file properties

## Files to Create

- `packages/shared/src/services/migrations/types.ts`
- `packages/shared/src/services/migrations/errors.ts`
- `packages/shared/src/services/migrations/index.ts`
- `packages/shared/src/services/migrations/__tests__/types.test.ts`
- `packages/shared/src/services/migrations/__tests__/errors.test.ts`
