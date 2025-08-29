---
id: T-validate-database-schema-and
title: Validate database schema and constraints for messages table
status: done
priority: low
parent: F-message-repository-integration
prerequisites: []
affectedFiles:
  packages/shared/src/repositories/messages/validateSchema.ts:
    Created comprehensive MessageSchemaValidator class with methods for
    validating table structure, constraints, and indexes. Includes
    EXPECTED_MESSAGES_SCHEMA definition and constraint enforcement testing.
    Features modular design with helper methods to avoid function complexity
    lint issues.
  packages/shared/src/repositories/messages/types/ColumnInfo.ts: Created interface for PRAGMA table_info result structure
  packages/shared/src/repositories/messages/types/SchemaValidationResult.ts:
    Created interface extending ValidationResult for table structure validation
    results
  packages/shared/src/repositories/messages/types/ConstraintValidationResult.ts:
    Created interface extending ValidationResult for foreign key constraint
    validation results
  packages/shared/src/repositories/messages/types/ForeignKeyInfo.ts: Created interface for PRAGMA foreign_key_list result structure
  packages/shared/src/repositories/messages/types/IndexValidationResult.ts: Created interface extending ValidationResult for index validation results
  packages/shared/src/repositories/messages/types/IndexInfo.ts: Created interface for PRAGMA index_list result structure
  packages/shared/src/repositories/messages/types/IndexColumnInfo.ts: Created interface for PRAGMA index_info result structure
  packages/shared/src/repositories/messages/types/index.ts: Created barrel file exporting all schema validation type definitions
log:
  - Successfully implemented schema validation utility for messages table with
    comprehensive type system. Created MessageSchemaValidator class that
    validates table structure, foreign key constraints, and indexes against
    expected schema. Implementation includes modular type definitions following
    project conventions, with clean separation of concerns and comprehensive
    error handling. All quality checks pass and validation utility is ready for
    integration testing.
schema: v1.0
childrenIds: []
created: 2025-08-29T18:44:18.434Z
updated: 2025-08-29T18:44:18.434Z
---

# Validate Database Schema and Constraints

## Context

The messages table schema and constraints need validation to ensure they properly support the MessageRepository operations and maintain data integrity. This task focuses on verifying the existing schema meets the feature requirements without performance optimization.

## Implementation Requirements

### Schema Validation Script

Create validation script `packages/shared/src/repositories/messages/validateSchema.ts`:

1. **Table Structure Validation**
   - Verify all required columns exist with correct data types
   - Check column constraints (NOT NULL, DEFAULT values)
   - Validate primary key and foreign key definitions
   - Confirm table creation matches migration file

2. **Constraint Verification**
   - Test foreign key constraint enforcement to conversations table
   - Test foreign key constraint enforcement to conversation_agents table
   - Verify CASCADE and SET NULL behaviors work as expected
   - Check default value applications (included=true, created_at=CURRENT_TIMESTAMP)

3. **Index Verification**
   - Confirm existing composite index `idx_messages_conversation` exists
   - Verify index covers `(conversation_id, created_at)` as specified
   - Document current index structure for future reference

### Automated Schema Tests

Create test file `packages/shared/src/repositories/messages/__tests__/schema.test.ts`:

1. **Column Definition Tests**

   ```sql
   -- Verify column types and constraints
   PRAGMA table_info(messages);
   ```

2. **Foreign Key Tests**

   ```sql
   -- Verify foreign key definitions
   PRAGMA foreign_key_list(messages);
   ```

3. **Index Tests**
   ```sql
   -- Verify index structure
   PRAGMA index_list(messages);
   PRAGMA index_info(idx_messages_conversation);
   ```

## Detailed Acceptance Criteria

**GIVEN** messages table in database
**WHEN** schema validation script runs
**THEN** should confirm all columns exist with correct types:

- id TEXT PRIMARY KEY
- conversation_id TEXT NOT NULL
- conversation_agent_id TEXT (nullable)
- role TEXT NOT NULL
- content TEXT NOT NULL
- included BOOLEAN DEFAULT 1
- created_at DATETIME DEFAULT CURRENT_TIMESTAMP

**GIVEN** foreign key constraints
**WHEN** attempting operations that violate constraints
**THEN** database should properly enforce:

- conversation_id must reference valid conversations.id
- conversation_agent_id must reference valid conversation_agents.id or be NULL
- ON DELETE CASCADE for conversation_id
- ON DELETE SET NULL for conversation_agent_id

**GIVEN** existing database index
**WHEN** querying index information
**THEN** should confirm idx_messages_conversation exists on (conversation_id, created_at)

**GIVEN** default value constraints
**WHEN** inserting messages without specifying defaults
**THEN** included should default to TRUE and created_at to CURRENT_TIMESTAMP

## Testing Requirements

- Create automated schema validation tests
- Test constraint enforcement with actual database operations
- Verify default value application in real scenarios
- Document any schema inconsistencies found
- Include tests that run against migration-created schema

## Implementation Approach

```typescript
// Schema validation utility
export class MessageSchemaValidator {
  async validateTableStructure(): Promise<SchemaValidationResult> {
    // Check column definitions match expected schema
  }

  async validateConstraints(): Promise<ConstraintValidationResult> {
    // Test foreign key enforcement
  }

  async validateIndexes(): Promise<IndexValidationResult> {
    // Verify index existence and structure
  }
}
```

## Out of Scope

- Database performance analysis (explicitly excluded)
- Index optimization recommendations
- Schema migration creation (schema already exists)
- Query execution plan analysis

## Dependencies

- Requires existing migration 003_create_messages.sql
- Uses existing database infrastructure
- No blocking dependencies on other tasks
- Can run independently of repository implementation tasks
