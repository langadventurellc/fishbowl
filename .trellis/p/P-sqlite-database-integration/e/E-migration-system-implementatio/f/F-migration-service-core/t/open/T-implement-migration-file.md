---
id: T-implement-migration-file
title: Implement migration file discovery and ordering
status: open
priority: high
parent: F-migration-service-core
prerequisites:
  - T-create-migration-types-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T16:32:08.076Z
updated: 2025-08-23T16:32:08.076Z
---

# Implement migration file discovery and ordering

## Context

This task implements the file system scanning logic to discover SQL migration files, parse their numeric ordering, and sort them for execution. This is a critical component that determines which migrations need to run.

**Related Feature**: F-migration-service-core - Migration Service Core Implementation  
**Dependencies**: T-create-migration-types-and (requires MigrationFile type)
**Pattern Reference**: Use Node.js fs/promises for async file operations, similar to file handling in existing codebase

## Specific Implementation Requirements

### 1. Create Migration Discovery Service

- File scanning in migrations directory
- Numeric prefix parsing (001, 002, etc.)
- SQL file filtering and validation
- Sort by numeric order for execution sequence

### 2. File Naming Validation

- Validate XXX_description.sql pattern
- Skip invalid files with warning logs
- Handle edge cases (missing files, invalid names)
- Return sorted array of MigrationFile objects

### 3. Integration Points

- Will be used by MigrationService class
- Must handle both development and production paths
- Support different file system layouts

## Technical Approach

### Discovery Logic

```typescript
class MigrationDiscovery {
  async discoverMigrations(migrationsPath: string): Promise<MigrationFile[]> {
    // 1. Read directory contents
    // 2. Filter for .sql files
    // 3. Parse numeric prefixes
    // 4. Validate naming convention
    // 5. Sort by numeric order
    // 6. Return MigrationFile objects
  }

  private parseOrderFromFilename(filename: string): number | null {
    // Extract 001, 002, etc. from filename
  }

  private isValidMigrationFile(filename: string): boolean {
    // Validate XXX_description.sql pattern
  }
}
```

### File System Operations

- Use fs/promises for async operations
- Handle directory not found gracefully
- Log warnings for invalid files
- Return empty array if no migrations found

## Detailed Acceptance Criteria

### Discovery Implementation

- [ ] discoverMigrations() method scans directory for .sql files
- [ ] Parses numeric prefixes correctly (001, 002, 003, etc.)
- [ ] Sorts migrations by numeric order (not alphabetical)
- [ ] Returns MigrationFile objects with filename, order, path
- [ ] Handles empty directories gracefully

### File Validation

- [ ] Validates XXX_description.sql naming pattern
- [ ] Skips files that don't match pattern with warning logs
- [ ] Handles files without numeric prefix
- [ ] Prevents duplicate order numbers
- [ ] Logs validation issues clearly

### Error Handling

- [ ] Handles directory not found gracefully
- [ ] Handles permission errors with clear messages
- [ ] Continues processing on individual file errors
- [ ] Uses logger for warnings and errors
- [ ] Never throws on invalid files (skip instead)

### Unit Tests

- [ ] Test discovery with valid migration files
- [ ] Test numeric ordering (001, 002, 010, 100)
- [ ] Test invalid file names are skipped
- [ ] Test empty directory handling
- [ ] Test directory not found handling
- [ ] Test file system permission errors
- [ ] Mock fs operations for consistent testing

## Dependencies

- T-create-migration-types-and (provides MigrationFile type)

## Security Considerations

- Validate file paths to prevent directory traversal
- Only read .sql files, ignore other file types
- Don't expose full file system paths in logs

## Performance Requirements

- Directory scan should complete in <100ms
- Handle up to 1000 migration files efficiently
- Minimal memory usage during discovery

## Files to Create/Modify

- `packages/shared/src/services/migrations/MigrationDiscovery.ts`
- `packages/shared/src/services/migrations/__tests__/MigrationDiscovery.test.ts`
- Update `packages/shared/src/services/migrations/index.ts` to export MigrationDiscovery
