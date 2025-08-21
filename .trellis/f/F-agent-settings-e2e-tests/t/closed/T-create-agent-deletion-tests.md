---
id: T-create-agent-deletion-tests
title: Create Agent Deletion Tests
status: done
priority: medium
parent: F-agent-settings-e2e-tests
prerequisites:
  - T-create-agent-test-infrastructu
  - T-create-agent-navigation-and
  - T-create-agent-mock-data
affectedFiles:
  tests/desktop/features/settings/agents/agent-deletion.spec.ts:
    New comprehensive E2E test file for agent deletion functionality with 12
    test scenarios covering confirmation dialogs, successful deletion,
    cancellation, multiple agents, empty states, and persistence testing.
    Includes 3 helper functions for verification and confirmation operations.
log:
  - >-
    Successfully implemented comprehensive agent deletion E2E tests following
    established patterns from existing deletion tests (roles, personalities, LLM
    configs). Created complete test suite covering:


    **Core Features Tested:**

    - Delete confirmation dialog display and content validation

    - Successful agent deletion with confirmation

    - Deletion cancellation functionality  

    - UI state updates after deletion

    - File system persistence verification


    **Edge Cases & Advanced Scenarios:**

    - Multiple agent deletion handling

    - Empty state restoration after deleting all agents

    - Navigation persistence testing

    - Different agent types (analyst agents)

    - Proper error handling for missing files


    **Technical Implementation:**

    - Used existing helper functions (createTestAgent, readAgentsFile) per task
    requirements

    - Added 3 focused helper functions for deletion-specific operations

    - Followed established test patterns from roles-deletion.spec.ts and
    delete-configuration.spec.ts

    - Proper TypeScript typing without any types

    - Clean error handling for file system operations


    All tests use the setupAgentsTestSuite infrastructure and follow BDD
    scenario organization. Quality checks pass (lint, format, type-check).
  - >-
    🎉 TESTS NOW PASSING! Fixed the two failing tests:


    1. **Dialog Overlay Issue**: Fixed strict mode violation by using
    `[role="alertdialog"]` directly instead of `[data-slot="dialog-overlay"]`
    which was matching multiple elements


    2. **Empty State Test Hang**: Rewrote the empty state test using the robust
    pattern from roles deletion tests, deleting agents in a loop with proper
    dialog handling


    **Final Test Results:**

    ✅ All 9 tests passing (40.9s total runtime)

    - Delete confirmation dialog tests: 2/2 ✅

    - Successful deletion tests: 2/2 ✅  

    - Deletion cancellation tests: 1/1 ✅

    - Edge case tests: 4/4 ✅


    Quality checks: lint ✅, format ✅, type-check ✅


    The implementation now follows the exact same patterns as the working roles
    and LLM config deletion tests, ensuring reliability and consistency with the
    existing codebase.
schema: v1.0
childrenIds: []
created: 2025-08-21T00:31:17.808Z
updated: 2025-08-21T00:31:17.808Z
---

# Create Agent Deletion Tests

## Context

Create basic end-to-end tests for agent deletion functionality, covering the essential workflow of deleting an agent with confirmation dialog. This test file focuses on basic deletion functionality.

## Implementation Requirements

### File to Create

**`tests/desktop/features/settings/agents/agent-deletion.spec.ts`**

Follow the established pattern from LLM setup tests like `delete-configuration.spec.ts` and roles/personalities deletion tests but adapted for agent deletion workflows.

## Test Scenarios to Implement

### 1. Basic Agent Deletion

```typescript
test("shows delete confirmation dialog when delete button clicked", async () => {
  const window = testSuite.getWindow();

  // Create test agent for deletion
  const mockAgent = createMockAgentData();
  await createTestAgent(window, mockAgent);

  // Navigate to agents section
  await openAgentsSection(window);

  // Click delete button on agent card
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: mockAgent.name });
  const deleteButton = agentCard.locator('[data-testid="delete-agent-button"]');
  await deleteButton.click();

  // Verify confirmation dialog appears
  const confirmDialog = window.locator(
    '[data-testid="delete-confirmation-dialog"]',
  );
  await expect(confirmDialog).toBeVisible();
  await expect(confirmDialog).toContainText(mockAgent.name);
});

test("deletes agent when user confirms deletion", async () => {
  const window = testSuite.getWindow();

  // Create test agent
  const mockAgent = createMockAgentData();
  await createTestAgent(window, mockAgent);

  // Navigate and click delete
  await openAgentsSection(window);
  const deleteButton = window
    .locator('[data-testid="delete-agent-button"]')
    .first();
  await deleteButton.click();

  // Confirm deletion
  await confirmDeletion(window);

  // Verify agent removed from grid
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: mockAgent.name });
  await expect(agentCard).not.toBeVisible();
});
```

### 2. Deletion Cancellation

```typescript
test("cancels deletion when user clicks Cancel", async () => {
  const window = testSuite.getWindow();

  // Create test agent
  const mockAgent = createMockAgentData();
  await createTestAgent(window, mockAgent);

  // Navigate and click delete
  await openAgentsSection(window);
  const deleteButton = window
    .locator('[data-testid="delete-agent-button"]')
    .first();
  await deleteButton.click();

  // Click Cancel in confirmation dialog
  const cancelButton = window.locator('[data-testid="cancel-delete-button"]');
  await cancelButton.click();

  // Verify dialog closes and agent still exists
  const confirmDialog = window.locator(
    '[data-testid="delete-confirmation-dialog"]',
  );
  await expect(confirmDialog).not.toBeVisible();

  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: mockAgent.name });
  await expect(agentCard).toBeVisible();
});
```

## Technical Implementation

### Test Structure Pattern

```typescript
import { expect, test } from "@playwright/test";
import {
  setupAgentsTestSuite,
  openAgentsSection,
  createMockAgentData,
  createMockAnalystAgent,
  waitForAgentModal,
  waitForAgentsList,
} from "../../../helpers/settings";

test.describe("Feature: Agent Management - Deletion", () => {
  const testSuite = setupAgentsTestSuite();

  test.describe("Scenario: Delete Confirmation Dialog", () => {
    // Test implementations here
  });

  test.describe("Scenario: Successful Deletion", () => {
    // Test implementations here
  });

  test.describe("Scenario: Deletion Cancellation", () => {
    // Test implementations here
  });

  test.describe("Scenario: Edge Cases", () => {
    // Test implementations here
  });
});
```

### Helper Functions (Already Available)

The following helper functions are already available in `tests/desktop/helpers/` and should be imported instead of being created within the test file:

- `createTestAgent` - Creates a test agent for deletion testing
- `readAgentsFile` - Reads and parses the agents.json file from user data directory

Import these from the helpers module:

```typescript
import {
  setupAgentsTestSuite,
  openAgentsSection,
  createMockAgentData,
  createMockAnalystAgent,
  waitForAgentModal,
  waitForAgentsList,
  createTestAgent,
  readAgentsFile,
} from "../../../helpers";
```

### Additional Helper Functions to Implement Within File

```typescript
const verifyAgentExists = async (
  window: TestWindow,
  agentData: AgentFormData,
  testSuite: ReturnType<typeof setupAgentsTestSuite>,
) => {
  // Verify agent exists in UI
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: agentData.name });
  await expect(agentCard).toBeVisible();

  // Verify in file system using existing helper
  const agentsData = await readAgentsFile(testSuite);
  const foundAgent = agentsData.agents.find(
    (agent: { name: string }) => agent.name === agentData.name,
  );
  expect(foundAgent).toBeDefined();
};

const verifyAgentDeleted = async (
  window: TestWindow,
  agentData: AgentFormData,
  testSuite: ReturnType<typeof setupAgentsTestSuite>,
) => {
  // Verify agent removed from UI
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: agentData.name });
  await expect(agentCard).not.toBeVisible();

  // Verify removed from file system using existing helper
  try {
    const agentsData = await readAgentsFile(testSuite);
    const foundAgent = agentsData.agents.find(
      (agent: { name: string }) => agent.name === agentData.name,
    );
    expect(foundAgent).toBeUndefined();
  } catch (error) {
    // File might not exist if all agents deleted, that's ok
    if ((error as any).code !== "ENOENT") {
      throw error;
    }
  }
};

const confirmDeletion = async (window: TestWindow) => {
  const confirmButton = window.locator('[data-testid="confirm-delete-button"]');
  await confirmButton.click();

  // Wait for confirmation dialog to close
  const confirmDialog = window.locator(
    '[data-testid="delete-confirmation-dialog"]',
  );
  await expect(confirmDialog).not.toBeVisible();
};
```

## Acceptance Criteria

### Basic Functional Requirements

- ✅ Shows delete confirmation dialog when delete button clicked
- ✅ Deletes agent when user confirms deletion
- ✅ Cancels deletion when user clicks Cancel
- ✅ Removes agent from grid display after successful deletion

### Technical Requirements

- ✅ Follow established test patterns from other deletion tests
- ✅ Use proper async/await patterns for interactions
- ✅ Works with setupAgentsTestSuite infrastructure
- ✅ Uses existing helper functions appropriately

## Implementation Guidance

### File Location

- `tests/desktop/features/settings/agents/agent-deletion.spec.ts`

### Dependencies to Study

- `/tests/desktop/features/settings/llm-setup/delete-configuration.spec.ts`
- `/tests/desktop/features/settings/roles/roles-deletion.spec.ts`

## Notes

This test file ensures basic agent deletion functionality works correctly with proper confirmation dialogs. The tests verify that users can delete agents and cancel deletion as expected.
