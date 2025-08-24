---
id: F-basic-e2e-tests-for-new
title: Basic E2E Tests for New Conversation Button
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T03:35:24.465Z
updated: 2025-08-24T03:35:24.465Z
---

# Basic E2E Tests for New Conversation Button

## Purpose

Create very basic end-to-end tests to validate that the New Conversation button in the sidebar properly:

1. Adds a new conversation entry to the UI (visible in the conversation list)
2. Creates a corresponding entry in the SQLite database

This feature creates minimal, focused tests without performance testing, edge cases, or comprehensive validation - just the core functionality.

## Key Components to Implement

### 1. Database Reset Helper Function

- **Location**: `/tests/desktop/helpers/database/resetDatabase.ts`
- **Purpose**: General-purpose helper to completely reset the database between tests
- **Functionality**:
  - Delete the entire database file (`userData/fishbowl.db`)
  - Allow migrations to recreate the database on app startup
  - NOT specific to conversations - reusable for future tests
  - Should be called in test setup to ensure clean state

### 2. Conversation Button E2E Test

- **Location**: `/tests/desktop/features/conversations/new-conversation-button.spec.ts`
- **Purpose**: Test the new conversation button functionality
- **Test Coverage**:
  - Button click creates UI entry in conversation list
  - Button click creates database entry
  - Database is properly reset between tests

### 3. Database Query Helper

- **Location**: `/tests/desktop/helpers/database/queryDatabase.ts`
- **Purpose**: Helper to query the SQLite database from tests
- **Functionality**:
  - Connect to the test database file
  - Execute SELECT queries to verify data
  - Return results in usable format for test assertions

## Detailed Acceptance Criteria

### Functional Behavior

- **UI Verification**: After clicking "New Conversation" button, a new conversation appears in the sidebar list
- **Database Verification**: After clicking "New Conversation" button, a new record exists in the conversations table
- **Database Reset**: Each test starts with a completely clean database (no existing conversations)
- **Test Isolation**: Tests do not interfere with each other due to proper database cleanup

### Technical Requirements

- **Database Path**: Use `userData/fishbowl.db` path (following existing patterns)
- **Reset Mechanism**: Delete entire database file, let app recreate it with migrations
- **Test Framework**: Use Playwright with existing `createElectronApp` helper
- **Query Interface**: Direct SQLite queries using better-sqlite3 or similar
- **Error Handling**: Graceful handling if database doesn't exist or queries fail

### UI Integration Requirements

- **Button Location**: Test the button in `SidebarContainerDisplay` component
- **Button Selector**: Use appropriate data-testid or existing selectors
- **List Verification**: Verify conversation appears in the rendered conversation list
- **Loading State**: Handle button loading/disabled states during creation

### Database Schema Requirements

- **Table**: Query the `conversations` table created by migrations
- **Fields**: Verify `id`, `title`, `created_at`, `updated_at` fields exist
- **Data Types**: Ensure ID is UUID format, timestamps are valid dates
- **Constraints**: Validate required fields are populated

## Implementation Guidance

### Database Reset Pattern

```typescript
// General purpose - not conversation-specific
export async function resetDatabase(
  electronApp: TestElectronApplication,
): Promise<void> {
  const userDataPath = await electronApp.evaluate(async ({ app }) => {
    return app.getPath("userData");
  });

  const dbPath = path.join(userDataPath, "fishbowl.db");

  try {
    await fs.unlink(dbPath);
  } catch {
    // Database might not exist, that's fine
  }
}
```

### Database Query Pattern

```typescript
export async function queryConversations(electronApp: TestElectronApplication) {
  const userDataPath = await electronApp.evaluate(async ({ app }) => {
    return app.getPath("userData");
  });

  const dbPath = path.join(userDataPath, "fishbowl.db");
  // Execute SELECT query and return results
}
```

### Test Structure Pattern

```typescript
test.describe("Feature: New Conversation Button", () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;

  test.beforeAll(async () => {
    electronApp = await createElectronApp(electronPath);
    window = electronApp.window;
  });

  test.beforeEach(async () => {
    await resetDatabase(electronApp); // Clean database before each test
    // Wait for app to initialize with fresh database
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test("creates conversation in UI and database when button clicked", async () => {
    // Given: App is loaded with clean database
    // When: New conversation button is clicked
    // Then: Conversation appears in UI list
    // And: Conversation exists in database
  });
});
```

## Testing Requirements

### Manual Testing

- Run test suite to verify:
  - Database resets properly between tests
  - Button click creates UI entry
  - Database entry is created with correct data
  - Tests pass consistently

### Automated Testing

- **Unit Tests**: Not required for this feature (focuses on E2E only)
- **Integration Tests**: The E2E tests serve as integration tests
- **Performance Tests**: Explicitly excluded from scope

## Security Considerations

- **Database Access**: Use read-only queries for verification (no DELETE/UPDATE in tests except cleanup)
- **File System**: Proper handling of file deletion/creation in test environment
- **Test Isolation**: Ensure test database operations don't affect production data

## Performance Requirements

- **Test Speed**: Tests should complete in under 30 seconds total
- **Database Reset**: Reset operation should complete in under 5 seconds
- **Query Performance**: Database queries should return in under 1 second

## Dependencies

- **Existing Code**: Uses existing `NewConversationButton`, `SidebarContainerDisplay`, and database infrastructure
- **Test Infrastructure**: Uses existing Playwright setup and `createElectronApp` helper
- **Database**: Relies on existing SQLite database and migration system
- **No New Dependencies**: Should not require additional npm packages

## Future Extensibility

- **Reusable Helpers**: Database reset function designed for use by future database tests
- **Query Helper**: Database query helper can be extended for other table queries
- **Test Patterns**: Established patterns can be followed for testing other UI-database interactions

This feature establishes the foundation for database testing in the E2E test suite while keeping the implementation minimal and focused on the specific requirement.
