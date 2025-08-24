# Database Migrations

This directory contains SQL migration files for the Fishbowl application database schema. The migration system provides a robust, forward-only approach to database schema management with automatic discovery, execution tracking, and cross-platform support.

## Overview

The migration system is built around three core services:

- **MigrationService**: Orchestrates migration execution and provides the main API
- **MigrationDiscovery**: Discovers and validates migration files from the filesystem
- **MigrationTracking**: Tracks which migrations have been applied to prevent duplicate execution

### Key Features

- **Forward-only migrations**: No rollback support for simplicity and reliability
- **Automatic discovery**: Migration files are automatically discovered from the migrations directory
- **Execution tracking**: Applied migrations are recorded to prevent re-execution
- **Idempotent SQL**: All migrations use `IF NOT EXISTS` patterns for safe re-runs
- **Cross-platform support**: Works with both desktop (Electron) and mobile (Expo) SQLite
- **Comprehensive logging**: Detailed logging for debugging and monitoring

## Migration Files

### Naming Convention

Migration files must follow the strict naming pattern: `XXX_description.sql`

- `XXX`: 3-digit zero-padded order number (001, 002, 003, etc.)
- `_`: Single underscore separator
- `description`: Human-readable description using underscores for spaces
- `.sql`: File extension

**Examples:**

```
001_create_conversations.sql
002_add_user_preferences.sql
003_create_message_attachments.sql
010_add_performance_indexes.sql
```

### File Structure

```
migrations/
├── 001_create_conversations.sql    # Initial conversations table
├── 002_add_user_table.sql          # Future user management
├── 003_create_indexes.sql          # Performance optimizations
├── README.md                       # This documentation
└── __tests__/
    ├── 001_create_conversations.test.ts
    └── README.test.ts
```

## Writing Migrations

### SQL Standards and Best Practices

#### 1. Idempotency Requirements

All SQL statements MUST use `IF NOT EXISTS` or equivalent constructs:

```sql
-- ✅ Correct - idempotent
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL
);

-- ✅ Correct - idempotent
CREATE INDEX IF NOT EXISTS idx_conversations_created_at
ON conversations(created_at DESC);

-- ❌ Incorrect - will fail on re-run
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL
);
```

#### 2. SQL Formatting Standards

- Use consistent indentation (4 spaces)
- Terminate all statements with semicolons
- Include descriptive comments explaining purpose
- Use UPPERCASE for SQL keywords
- Use lowercase for table/column names

#### 3. SQLite Compatibility

- Use `TEXT` for UUID storage (36 characters)
- Use `DATETIME DEFAULT CURRENT_TIMESTAMP` for timestamps
- Leverage triggers for automatic timestamp updates
- Consider performance implications of indexes

### Migration Example

Here's the complete `001_create_conversations.sql` migration as a reference:

```sql
-- Migration: Create conversations table
-- Description: Initial table for storing chat conversation metadata
-- This migration establishes the foundational conversations table with proper
-- indexing and triggers for the Fishbowl application database schema.

-- Create conversations table for storing chat sessions
-- Each conversation represents a multi-agent chat session with a user-defined title
-- UUIDs are stored as TEXT following SQLite best practices for cross-platform compatibility
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,                              -- UUID stored as text (36 characters)
    title TEXT NOT NULL,                              -- Human-readable conversation title
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,    -- ISO 8601 format timestamp
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP     -- Auto-updated on changes
);

-- Index for efficient date-based queries (newest conversations first)
-- This supports the common use case of displaying recent conversations
-- in the application UI with optimal query performance
CREATE INDEX IF NOT EXISTS idx_conversations_created_at
ON conversations(created_at DESC);

-- Trigger to automatically update updated_at timestamp on any row modification
-- Ensures accurate tracking of when conversations were last modified
-- without requiring application-level timestamp management
CREATE TRIGGER IF NOT EXISTS update_conversations_updated_at
AFTER UPDATE ON conversations
FOR EACH ROW
BEGIN
    UPDATE conversations
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;
```

### Common Patterns

#### Table Creation

```sql
CREATE TABLE IF NOT EXISTS table_name (
    id TEXT PRIMARY KEY,                           -- UUID as TEXT
    name TEXT NOT NULL,                           -- Required fields
    description TEXT,                             -- Optional fields
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Index Creation

```sql
-- Single column index
CREATE INDEX IF NOT EXISTS idx_table_column
ON table_name(column_name);

-- Composite index
CREATE INDEX IF NOT EXISTS idx_table_multi
ON table_name(column1, column2 DESC);
```

#### Triggers for Timestamps

```sql
CREATE TRIGGER IF NOT EXISTS update_table_updated_at
AFTER UPDATE ON table_name
FOR EACH ROW
BEGIN
    UPDATE table_name
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;
```

## Migration Execution

### Automatic Discovery and Execution

The MigrationService automatically:

1. **Discovers** migration files in the `/migrations` directory
2. **Validates** file naming and SQL syntax
3. **Determines** which migrations need to be applied
4. **Executes** pending migrations in order
5. **Records** successful applications in the `migrations` table

### Execution Order

Migrations are executed in numeric order based on the filename prefix:

```
001_create_conversations.sql     # Executed first
002_add_users.sql               # Executed second
010_add_indexes.sql             # Executed third (numeric, not lexical)
```

### Transaction Behavior

- Each migration runs in its own transaction
- Failed migrations are rolled back automatically
- Successful migrations are immediately committed
- Partial failures don't affect other migrations

### Migration Tracking

Applied migrations are recorded in a special `migrations` table:

```sql
CREATE TABLE migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    checksum TEXT,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Integration with Application

### Desktop Application (Electron)

Migrations run automatically during application startup in the main process:

```typescript
// Main process initialization
const services = new MainProcessServices();
await services.migrationService.applyPendingMigrations();
```

### Mobile Application (Expo)

Similar integration for mobile startup:

```typescript
// Mobile app initialization
const services = new MobileServices();
await services.migrationService.applyPendingMigrations();
```

### Development Workflow

1. **Create migration file** with proper naming convention
2. **Write idempotent SQL** with comprehensive comments
3. **Test migration** by running application startup
4. **Verify schema changes** in SQLite database
5. **Commit migration file** to version control

### Manual Execution

For development and debugging, migrations can be run manually:

```bash
# Run all pending migrations
pnpm db:migrate

# Verify migration status (when implemented)
pnpm db:migrate --status
```

## Platform Support

### Desktop (Electron)

- **Database**: Native SQLite integration via `better-sqlite3`
- **Storage Location**: User data directory
- **Process**: Main process only (security restriction)

### Mobile (React Native/Expo)

- **Database**: `expo-sqlite` integration
- **Storage Location**: App-specific database directory
- **Process**: JavaScript thread with native SQLite binding

### Shared Implementation

- **Business Logic**: `packages/shared/src/services/migrations/`
- **Platform Abstraction**: Database bridge pattern
- **Type Safety**: Comprehensive TypeScript interfaces

## Error Handling and Troubleshooting

### Common Migration Issues

#### 1. Syntax Errors

```
Error: SQL syntax error near line 15
Solution: Validate SQL syntax, check semicolons and keywords
```

#### 2. Constraint Violations

```
Error: UNIQUE constraint failed: conversations.id
Solution: Ensure proper IF NOT EXISTS usage
```

#### 3. Missing Dependencies

```
Error: Table 'users' doesn't exist
Solution: Check migration order, ensure prerequisite migrations exist
```

### Debugging Migration Issues

1. **Check application logs** for migration service output
2. **Verify file naming** follows XXX_description.sql pattern
3. **Validate SQL syntax** using SQLite command line tools
4. **Review migration order** and dependencies
5. **Check database state** using SQLite browser tools

### Recovery Procedures

#### Corrupted Migration State

1. Backup database file
2. Manually remove entries from `migrations` table
3. Re-run application startup to re-apply migrations

#### Failed Migration

1. Review error logs for specific SQL failure
2. Fix SQL syntax or logic errors
3. Delete migration record from `migrations` table
4. Re-run migration with corrected SQL

## Performance Considerations

### Migration File Size

- Keep individual migrations under 1KB for quick execution
- Large schema changes should be split into multiple migrations
- Consider impact on application startup time

### Index Strategy

- Add indexes in separate migrations after table creation
- Test index impact on write performance
- Use composite indexes for multi-column queries

### Database Locking

- Migrations run synchronously to prevent schema conflicts
- Long-running migrations may block application startup
- Consider background migration strategies for large datasets

## Security Considerations

### SQL Injection Prevention

- Migration files are static SQL (no user input)
- No dynamic SQL construction in migration system
- Parameterized queries used for migration tracking

### Access Control

- Migration execution requires database write permissions
- Production databases should restrict migration access
- Migration files should not contain sensitive data

### Data Protection

- Never include actual user data in migrations
- Use placeholder data for testing only
- Sensitive schema elements should be documented separately

## Testing Migration Files

### Unit Test Structure

Each migration should have corresponding unit tests:

```typescript
// migrations/__tests__/001_create_conversations.test.ts
import { readFileSync } from "fs";
import { join } from "path";

describe("001_create_conversations migration", () => {
  const migrationPath = join(__dirname, "..", "001_create_conversations.sql");
  const migrationSql = readFileSync(migrationPath, "utf-8");

  it("should exist and be readable", () => {
    expect(migrationSql).toBeTruthy();
    expect(migrationSql.length).toBeGreaterThan(0);
  });

  it("should contain required table definition", () => {
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS conversations");
    expect(migrationSql).toContain("id TEXT PRIMARY KEY");
    expect(migrationSql).toContain("title TEXT NOT NULL");
  });

  it("should use idempotent patterns", () => {
    expect(migrationSql).toContain("IF NOT EXISTS");
    expect(migrationSql).not.toContain("CREATE TABLE conversations (");
  });
});
```

### Test Requirements

- [ ] Migration file exists and is readable
- [ ] SQL syntax is valid (parse test)
- [ ] Contains expected table/index definitions
- [ ] Uses idempotent patterns (IF NOT EXISTS)
- [ ] Follows formatting standards
- [ ] Comments are comprehensive

## Future Enhancements

### Planned Features

- Migration rollback support (if needed)
- Schema versioning and compatibility checks
- Migration performance monitoring
- Automated migration generation tools

### Extension Points

- Custom migration validators
- Platform-specific migration adapters
- Integration with CI/CD pipelines
- Schema drift detection
