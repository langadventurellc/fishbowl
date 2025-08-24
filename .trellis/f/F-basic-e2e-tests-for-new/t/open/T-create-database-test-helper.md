---
id: T-create-database-test-helper
title: Create Database Test Helper Functions
status: open
priority: high
parent: F-basic-e2e-tests-for-new
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T03:40:02.831Z
updated: 2025-08-24T03:40:02.831Z
---

# Create Database Test Helper Functions

## Context

This task creates reusable database helper functions for E2E tests in the Fishbowl desktop application. The helpers will enable test isolation by resetting the database between tests and allow verification of database changes during testing.

**Related Feature**: F-basic-e2e-tests-for-new - Basic E2E Tests for New Conversation Button
**Dependencies**: None - this establishes the foundation for database testing

## Implementation Requirements

### 1. Database Reset Helper Function

**File**: `/tests/desktop/helpers/database/resetDatabase.ts`

Create a general-purpose helper to completely reset the SQLite database between tests:

```typescript
import { promises as fs } from "fs";
import path from "path";
import type { TestElectronApplication } from "../TestElectronApplication";

/**
 * Resets the test database by deleting the database file
 * Allows app to recreate database with fresh migrations on restart
 */
export async function resetDatabase(
  electronApp: TestElectronApplication,
): Promise<void> {
  const userDataPath = await electronApp.evaluate(async ({ app }) => {
    return app.getPath("userData");
  });

  const dbPath = path.join(userDataPath, "fishbowl.db");

  try {
    await fs.unlink(dbPath);
  } catch (error) {
    // Database might not exist, that's fine for test initialization
  }
}
```

### 2. Database Query Helper Function

**File**: `/tests/desktop/helpers/database/queryDatabase.ts`

Create a helper to execute SQLite queries for test verification:

```typescript
import Database from "better-sqlite3";
import path from "path";
import type { TestElectronApplication } from "../TestElectronApplication";

/**
 * Executes a SELECT query on the test database and returns results
 */
export async function queryDatabase<T = unknown>(
  electronApp: TestElectronApplication,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const userDataPath = await electronApp.evaluate(async ({ app }) => {
    return app.getPath("userData");
  });

  const dbPath = path.join(userDataPath, "fishbowl.db");

  let db: Database.Database | null = null;
  try {
    db = new Database(dbPath, { readonly: true });
    const stmt = db.prepare(sql);
    const results = stmt.all(...params) as T[];
    return results;
  } finally {
    if (db) {
      db.close();
    }
  }
}

/**
 * Convenience function to query conversations table
 */
export async function queryConversations(
  electronApp: TestElectronApplication,
): Promise<
  Array<{ id: string; title: string; created_at: string; updated_at: string }>
> {
  return queryDatabase(
    electronApp,
    "SELECT * FROM conversations ORDER BY created_at DESC",
  );
}
```

### 3. Helper Exports and Barrel File

**File**: `/tests/desktop/helpers/database/index.ts`

Create a barrel export for clean imports:

```typescript
export { resetDatabase } from "./resetDatabase";
export { queryDatabase, queryConversations } from "./queryDatabase";
```

**Update**: `/tests/desktop/helpers/index.ts`

Add database helpers to main helpers export:

```typescript
// Add to existing exports
export * from "./database";
```

## Technical Implementation Details

### Database Path Resolution

- Use the same pattern as existing settings tests: `app.getPath("userData")`
- Database file is always `fishbowl.db` within user data directory
- Follow existing patterns in `/tests/desktop/features/settings/` test files

### Error Handling

- `resetDatabase`: Ignore ENOENT errors (file doesn't exist)
- `queryDatabase`: Properly close database connections in finally block
- Handle database-not-found scenarios gracefully

### TypeScript Types

- Import existing types from test helpers: `TestElectronApplication`
- Use generic types for query results to support different table schemas
- Include proper return type annotations for all functions

## Acceptance Criteria

### Functional Requirements

- ✅ `resetDatabase()` successfully deletes the database file when it exists
- ✅ `resetDatabase()` handles gracefully when database file doesn't exist
- ✅ `queryDatabase()` successfully connects to existing database and executes queries
- ✅ `queryDatabase()` properly closes database connections after queries
- ✅ `queryConversations()` returns conversations in correct format with all required fields
- ✅ Helper functions can be imported cleanly from `tests/desktop/helpers/database`

### Technical Requirements

- ✅ Functions work with Electron's user data path resolution
- ✅ Database operations are read-only for query functions (no data modification)
- ✅ Proper TypeScript types and error handling
- ✅ Compatible with existing test patterns and Playwright setup

### Integration Requirements

- ✅ Functions integrate with existing `TestElectronApplication` type
- ✅ Database path matches production path (`userData/fishbowl.db`)
- ✅ Helper functions follow existing code patterns in the test suite
- ✅ No new dependencies required (uses existing better-sqlite3)

## Testing Requirements

### Manual Testing

Test the helpers by:

1. Running a simple test that uses `resetDatabase()`
2. Verifying database file is deleted
3. Running a test that uses `queryConversations()` after creating a conversation
4. Verifying query returns the expected conversation data

### Error Scenarios

- Database file doesn't exist (fresh test run)
- Database file is locked by another process
- Invalid SQL queries (should throw appropriate errors)

## Dependencies and Prerequisites

- Requires existing `TestElectronApplication` type from test helpers
- Requires existing better-sqlite3 dependency (already available)
- Must be completed before E2E test implementation task

## Future Extensibility

- Database helpers are designed for reuse across different table types
- `queryDatabase()` generic function can be extended for other tables
- Reset helper is not conversation-specific and can be used for any database testing

This task establishes the foundation for database testing in the E2E test suite while maintaining simplicity and reusability.
