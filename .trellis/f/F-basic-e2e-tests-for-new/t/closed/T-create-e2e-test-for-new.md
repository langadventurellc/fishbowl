---
id: T-create-e2e-test-for-new
title: Create E2E Test for New Conversation Button
status: done
priority: high
parent: F-basic-e2e-tests-for-new
prerequisites:
  - T-create-database-test-helper
affectedFiles:
  tests/desktop/features/conversations/new-conversation-button.spec.ts:
    Created comprehensive E2E test file with multiple test scenarios for New
    Conversation button functionality, including UI verification, database
    validation, loading state testing, and proper test isolation with database
    reset between tests
log:
  - >-
    Successfully implemented comprehensive E2E tests for the New Conversation
    Button functionality. Created robust test scenarios that verify both UI
    behavior and database operations with proper test isolation and error
    handling.


    Key Features Implemented:

    - **Basic Conversation Creation Test**: Validates button click creates
    conversation in both UI and database

    - **Multiple Conversation Handling**: Tests creating multiple conversations
    and verifies unique IDs

    - **Button State Management**: Verifies loading states during async
    operations

    - **Database Isolation**: Ensures each test starts with clean database state

    - **Comprehensive Database Validation**: Checks UUID format, timestamps, and
    data integrity

    - **UI Integration Testing**: Uses flexible selectors to verify conversation
    display


    The test follows existing patterns from the settings tests, uses the
    database helper functions created in the prerequisite task, and includes
    proper TypeScript type safety. All tests properly wait for async operations
    and verify both UI state changes and database persistence.
schema: v1.0
childrenIds: []
created: 2025-08-24T03:40:52.292Z
updated: 2025-08-24T03:40:52.292Z
---

# Create E2E Test for New Conversation Button

## Context

This task implements the actual end-to-end test that verifies the New Conversation button properly creates conversations in both the UI and database. The test follows existing patterns from the settings tests and uses the database helper functions.

**Related Feature**: F-basic-e2e-tests-for-new - Basic E2E Tests for New Conversation Button
**Prerequisite**: T-create-database-test-helper (database helper functions must exist first)

## Implementation Requirements

### Main Test File

**File**: `/tests/desktop/features/conversations/new-conversation-button.spec.ts`

Create the E2E test following existing patterns from settings tests:

```typescript
import { expect, test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import {
  createElectronApp,
  type TestElectronApplication,
  type TestWindow,
} from "../../helpers";
import { resetDatabase, queryConversations } from "../../helpers/database";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Feature: New Conversation Button", () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;

  test.beforeAll(async () => {
    // Launch Electron app with test environment
    const electronPath = path.join(
      __dirname,
      "../../../../apps/desktop/dist-electron/electron/main.js",
    );
    electronApp = await createElectronApp(electronPath);

    window = electronApp.window;
    await window.waitForLoadState("domcontentloaded");

    // Wait for the app to fully initialize
    await window.waitForLoadState("networkidle");
  });

  test.beforeEach(async () => {
    // Reset database to ensure clean state for each test
    await resetDatabase(electronApp);

    // Wait for app to reinitialize with fresh database
    await window.reload();
    await window.waitForLoadState("networkidle");
  });

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test.describe("Scenario: Basic Conversation Creation", () => {
    test("creates conversation in UI and database when button clicked", async () => {
      // Given - App is loaded with clean database and sidebar is visible
      await window.waitForLoadState("networkidle");

      // Verify we start with no conversations
      const initialConversations = await queryConversations(electronApp);
      expect(initialConversations).toHaveLength(0);

      // Verify the New Conversation button is present and enabled
      const newConversationButton = window.locator(
        '[data-testid="new-conversation-button"]',
      );
      await expect(newConversationButton).toBeVisible();
      await expect(newConversationButton).not.toBeDisabled();

      // When - New Conversation button is clicked
      await newConversationButton.click();

      // Wait for button to show loading state
      await expect(newConversationButton).toHaveText("Creating...");

      // Wait for creation to complete (button returns to normal state)
      await expect(newConversationButton).toHaveText("New Conversation");
      await expect(newConversationButton).not.toBeDisabled();

      // Then - Conversation appears in the UI list
      // Look for conversation items in the sidebar
      const conversationItems = window.locator(
        '[data-testid*="conversation-item"], .conversation-item, [class*="conversation"]',
      );
      await expect(conversationItems).toHaveCount(1);

      // And - Conversation exists in database
      const conversations = await queryConversations(electronApp);
      expect(conversations).toHaveLength(1);

      const conversation = conversations[0];
      expect(conversation.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
      expect(conversation.title).toBe("New Conversation"); // Default title
      expect(conversation.created_at).toBeTruthy();
      expect(conversation.updated_at).toBeTruthy();

      // Verify timestamps are valid dates
      expect(new Date(conversation.created_at).getTime()).toBeGreaterThan(0);
      expect(new Date(conversation.updated_at).getTime()).toBeGreaterThan(0);
    });

    test("handles multiple conversation creation", async () => {
      // Given - App is loaded with clean database
      await window.waitForLoadState("networkidle");

      const newConversationButton = window.locator(
        '[data-testid="new-conversation-button"]',
      );

      // When - Button is clicked twice
      await newConversationButton.click();
      await expect(newConversationButton).toHaveText("New Conversation"); // Wait for first to complete

      await newConversationButton.click();
      await expect(newConversationButton).toHaveText("New Conversation"); // Wait for second to complete

      // Then - Two conversations exist in database
      const conversations = await queryConversations(electronApp);
      expect(conversations).toHaveLength(2);

      // Verify they have different IDs
      expect(conversations[0].id).not.toBe(conversations[1].id);

      // And - Two conversations are visible in UI
      const conversationItems = window.locator(
        '[data-testid*="conversation-item"], .conversation-item, [class*="conversation"]',
      );
      await expect(conversationItems).toHaveCount(2);
    });
  });

  test.describe("Scenario: Button State Management", () => {
    test("button shows correct loading states during creation", async () => {
      // Given - App is loaded
      await window.waitForLoadState("networkidle");

      const newConversationButton = window.locator(
        '[data-testid="new-conversation-button"]',
      );

      // Then - Initial state shows correct text and is enabled
      await expect(newConversationButton).toHaveText("New Conversation");
      await expect(newConversationButton).not.toBeDisabled();

      // When - Button is clicked
      await newConversationButton.click();

      // Then - Button shows loading state
      await expect(newConversationButton).toHaveText("Creating...");
      await expect(newConversationButton).toBeDisabled();

      // And - Eventually returns to normal state
      await expect(newConversationButton).toHaveText("New Conversation");
      await expect(newConversationButton).not.toBeDisabled();
    });
  });
});
```

## Technical Implementation Details

### Test Structure

- Follow the exact pattern from existing settings tests
- Use `test.describe` for grouping scenarios
- Use proper `beforeAll`, `beforeEach`, and `afterAll` lifecycle hooks
- Include database reset in `beforeEach` for test isolation

### Selectors and UI Verification

- Use `data-testid="new-conversation-button"` selector (already exists in component)
- Look for conversation items using flexible selectors since exact class names may vary
- Wait for loading states to ensure async operations complete

### Database Verification

- Use the `queryConversations` helper created in prerequisite task
- Verify conversation structure matches database schema
- Validate UUID format using regex pattern
- Check timestamps are valid date strings

### Error Handling

- Handle cases where database might not exist yet
- Wait for proper app initialization after database reset
- Use appropriate timeouts for async operations

## Acceptance Criteria

### Functional Requirements

- ✅ Test passes when New Conversation button creates a conversation
- ✅ UI shows new conversation in the sidebar list after creation
- ✅ Database contains new conversation record with correct structure
- ✅ Test handles multiple conversation creation properly
- ✅ Button loading states are verified during creation process

### Database Verification

- ✅ Database record has valid UUID in `id` field
- ✅ Database record has default title "New Conversation"
- ✅ Database record has valid `created_at` and `updated_at` timestamps
- ✅ Multiple conversations have unique IDs

### Test Isolation

- ✅ Each test starts with clean database (no existing conversations)
- ✅ Tests don't interfere with each other
- ✅ Database reset works properly before each test

### UI Integration

- ✅ Test waits for proper app initialization
- ✅ Button loading states are properly handled
- ✅ Conversation items appear in UI after creation
- ✅ UI count matches database count

## Testing Requirements

### Manual Testing

Run the test suite to verify:

1. Test passes consistently
2. Database operations work correctly
3. UI interactions function as expected
4. Test cleanup works properly

### Error Scenarios

Test should handle:

- App startup delays
- Database initialization time
- Network-idle states
- Button disabled states

## Dependencies and Prerequisites

- **Requires**: T-create-database-test-helper (database helper functions)
- **Requires**: Existing `createElectronApp` helper
- **Requires**: Existing `NewConversationButton` component with `data-testid`
- **Requires**: Existing conversation creation infrastructure

## Performance Expectations

- Test should complete in under 30 seconds
- Database operations should complete in under 5 seconds
- UI interactions should be responsive within 2 seconds

This task creates a comprehensive but focused E2E test that validates the core functionality of the New Conversation button while establishing patterns for future database-related testing.
