---
id: T-create-agent-deletion-tests
title: Create Agent Deletion Tests
status: open
priority: medium
parent: F-agent-settings-e2e-tests
prerequisites:
  - T-create-agent-test-infrastructu
  - T-create-agent-navigation-and
  - T-create-agent-mock-data
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-21T00:31:17.808Z
updated: 2025-08-21T00:31:17.808Z
---

# Create Agent Deletion Tests

## Context

Create comprehensive end-to-end tests for agent deletion functionality, covering the complete workflow from initiating deletion through confirmation dialog interaction to successful removal and data cleanup. This test file focuses specifically on deletion flows and confirmation scenarios.

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

  // Verify dialog shows agent name
  await expect(confirmDialog).toContainText(mockAgent.name);
  await expect(confirmDialog).toContainText("Delete Agent");
});

test("deletes agent when user confirms deletion", async () => {
  // Create test agent
  // Click delete button
  // Confirm deletion in dialog
  // Verify agent removed from grid
  // Verify agent removed from file system
});
```

### 2. Deletion Confirmation Dialog

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

  // Verify dialog closes
  const confirmDialog = window.locator(
    '[data-testid="delete-confirmation-dialog"]',
  );
  await expect(confirmDialog).not.toBeVisible();

  // Verify agent still exists
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: mockAgent.name });
  await expect(agentCard).toBeVisible();

  // Verify agent still in file system
  await verifyAgentExists(window, mockAgent);
});

test("closes dialog when clicking outside or pressing Escape", async () => {
  // Test dialog dismissal without deletion
  // Verify agent remains unchanged
});
```

### 3. Successful Deletion Scenarios

```typescript
test("removes agent from grid after successful deletion", async () => {
  // Delete agent and verify UI updates
  // Test grid layout adjusts properly
});

test("removes agent data from file system", async () => {
  // Delete agent and verify agents.json updated
  // Test file structure remains valid
});

test("shows success message after deletion", async () => {
  // Test success feedback to user
  // Test screen reader announcements
});

test("handles deleting the last remaining agent", async () => {
  // Create single agent
  // Delete it
  // Verify empty state appears
});
```

### 4. Multiple Agent Deletion

```typescript
test("deletes multiple agents sequentially", async () => {
  // Create multiple test agents
  // Delete them one by one
  // Verify each deletion works independently
});

test("maintains grid layout when deleting agents", async () => {
  // Create grid of agents
  // Delete agents from various positions
  // Verify grid reflows correctly
});
```

### 5. Edge Cases and Error Handling

```typescript
test("handles deletion errors gracefully", async () => {
  // Mock file system error during deletion
  // Verify error handling and user feedback
  // Verify agent remains if deletion fails
});

test("prevents multiple deletion attempts on same agent", async () => {
  // Test rapid clicking of delete button
  // Verify only one confirmation dialog appears
  // Test concurrent deletion prevention
});

test("handles deletion with unsaved changes in edit modal", async () => {
  // Open edit modal for agent
  // Click delete from another instance
  // Verify proper state management
});
```

### 6. Data Consistency and Cleanup

```typescript
test("maintains data consistency after deletion", async () => {
  // Delete agent and verify file timestamps
  // Test data integrity of remaining agents
});

test("cleans up all associated agent data", async () => {
  // Verify complete data removal
  // Test no orphaned references remain
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

### Helper Functions to Implement Within File

```typescript
const createTestAgent = async (
  window: TestWindow,
  agentData: AgentFormData,
) => {
  // Helper to create an agent for deletion testing
  await openAgentsSection(window);
  const createButton = window.locator('[data-testid="create-agent-button"]');
  await createButton.click();
  await waitForAgentModal(window, true);
  await fillAgentForm(window, agentData);
  const saveButton = window.locator('[data-testid="save-agent-button"]');
  await saveButton.click();
  await waitForAgentModal(window, false);
  await waitForAgentsList(window, true);
};

const verifyAgentExists = async (
  window: TestWindow,
  agentData: AgentFormData,
) => {
  // Verify agent exists in UI and file system
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: agentData.name });
  await expect(agentCard).toBeVisible();

  // Verify in file system
  const userDataPath = await testSuite
    .getElectronApp()
    .evaluate(async ({ app }) => {
      return app.getPath("userData");
    });
  const agentsPath = path.join(userDataPath, "agents.json");
  const agentsContent = await fs.readFile(agentsPath, "utf-8");
  const agentsData = JSON.parse(agentsContent);

  const foundAgent = agentsData.agents.find(
    (agent: any) => agent.name === agentData.name,
  );
  expect(foundAgent).toBeDefined();
};

const verifyAgentDeleted = async (
  window: TestWindow,
  agentData: AgentFormData,
) => {
  // Verify agent removed from UI
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: agentData.name });
  await expect(agentCard).not.toBeVisible();

  // Verify removed from file system
  const userDataPath = await testSuite
    .getElectronApp()
    .evaluate(async ({ app }) => {
      return app.getPath("userData");
    });
  const agentsPath = path.join(userDataPath, "agents.json");

  try {
    const agentsContent = await fs.readFile(agentsPath, "utf-8");
    const agentsData = JSON.parse(agentsContent);

    const foundAgent = agentsData.agents.find(
      (agent: any) => agent.name === agentData.name,
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

### Functional Requirements

- ✅ Shows delete confirmation dialog when delete button clicked
- ✅ Deletes agent when user confirms deletion
- ✅ Cancels deletion when user clicks Cancel or Escape
- ✅ Removes agent from grid display after successful deletion
- ✅ Removes agent data from file system (agents.json)
- ✅ Shows appropriate success/error messages
- ✅ Handles edge cases like deleting last agent (shows empty state)

### Technical Requirements

- ✅ Follow established test patterns from LLM setup and roles/personalities tests
- ✅ Use proper async/await patterns for all interactions
- ✅ Include appropriate timeouts and error handling
- ✅ Use accessibility-compliant selectors (data-testid)
- ✅ Verify file system changes with proper path handling
- ✅ Handle confirmation dialog interactions reliably

### Integration Requirements

- ✅ Works with setupAgentsTestSuite infrastructure
- ✅ Uses navigation and modal helpers appropriately
- ✅ Integrates with mock data generators
- ✅ Supports clean test isolation between runs
- ✅ Provides clear test descriptions and error messages

## Implementation Guidance

### File Location

- `tests/desktop/features/settings/agents/agent-deletion.spec.ts`

### Dependencies to Study

- `/tests/desktop/features/settings/llm-setup/delete-configuration.spec.ts`
- `/tests/desktop/features/settings/roles/roles-deletion.spec.ts`
- `/tests/desktop/features/settings/personalities/personalities-deletion.spec.ts`
- `/tests/desktop/features/settings/llm-setup/delete-configuration.spec.ts` for delete patterns

### Selector Strategy

- `[data-testid="agent-card"]` - Agent card in grid
- `[data-testid="delete-agent-button"]` - Delete button on agent card
- `[data-testid="delete-confirmation-dialog"]` - Confirmation dialog
- `[data-testid="confirm-delete-button"]` - Confirm deletion button
- `[data-testid="cancel-delete-button"]` - Cancel deletion button
- `[data-testid="empty-agents-state"]` - Empty state when no agents

## Security Considerations

- Use only test data, no real agent configurations
- File system operations limited to test userData directory
- Verify complete data cleanup after deletion
- Ensure test data doesn't leak between test runs

## Performance Requirements

- Each test should complete within 30 seconds
- Total test file should complete within 3-5 minutes
- Focus on functionality verification, not performance benchmarking

## Notes

This test file ensures that agent deletion functionality works reliably with proper confirmation workflows and complete data cleanup. The tests should cover both successful deletion scenarios and cancellation scenarios to ensure robust user experience.
