---
id: T-create-agent-editing-tests
title: Create Agent Editing Tests
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
created: 2025-08-21T00:30:29.382Z
updated: 2025-08-21T00:30:29.382Z
---

# Create Agent Editing Tests

## Context

Create basic end-to-end tests for agent editing functionality, covering the essential workflow of editing an existing agent and saving changes. This test file focuses on basic edit functionality.

## Implementation Requirements

### File to Create

**`tests/desktop/features/settings/agents/agent-editing.spec.ts`**

Follow the established pattern from LLM setup tests like `edit-configuration.spec.ts` but adapted for agent editing workflows.

## Test Scenarios to Implement

### 1. Basic Agent Editing

```typescript
test("opens edit modal from agent card", async () => {
  const window = testSuite.getWindow();

  // Create initial agent for editing
  const mockAgent = createMockAgentData();
  await createTestAgent(window, mockAgent);

  // Navigate to agents section
  await openAgentsSection(window);

  // Click edit button on agent card
  const agentCard = window.locator('[data-testid="agent-card"]').first();
  const editButton = agentCard.locator('[data-testid="edit-agent-button"]');
  await editButton.click();

  // Verify edit modal opens
  await waitForAgentModal(window, true);
});

test("updates agent name successfully", async () => {
  const window = testSuite.getWindow();

  // Create initial agent
  const originalAgent = createMockAgentData();
  await createTestAgent(window, originalAgent);

  // Open edit modal
  await openAgentsSection(window);
  const editButton = window
    .locator('[data-testid="edit-agent-button"]')
    .first();
  await editButton.click();
  await waitForAgentModal(window, true);

  // Update agent name
  const newName = "Updated Agent Name";
  await updateAgentData(window, { name: newName });

  // Save changes
  const saveButton = window.locator('[data-testid="save-agent-button"]');
  await saveButton.click();
  await waitForAgentModal(window, false);

  // Verify updates in UI
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: newName });
  await expect(agentCard).toBeVisible();
});
```

### 2. Edit Cancellation

```typescript
test("cancels edit without saving changes", async () => {
  const window = testSuite.getWindow();

  // Create initial agent
  const originalAgent = createMockAgentData();
  await createTestAgent(window, originalAgent);

  // Open edit modal and make changes
  await openAgentsSection(window);
  const editButton = window
    .locator('[data-testid="edit-agent-button"]')
    .first();
  await editButton.click();
  await waitForAgentModal(window, true);

  // Make changes
  await updateAgentData(window, { name: "Changed Name" });

  // Cancel edit
  const cancelButton = window.locator('[data-testid="cancel-button"]');
  await cancelButton.click();
  await waitForAgentModal(window, false);

  // Verify original name is still displayed
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: originalAgent.name });
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

test.describe("Feature: Agent Management - Editing", () => {
  const testSuite = setupAgentsTestSuite();

  test.describe("Scenario: Edit Modal Opening", () => {
    // Test implementations here
  });

  test.describe("Scenario: Data Updates", () => {
    // Test implementations here
  });

  test.describe("Scenario: Edit Validation", () => {
    // Test implementations here
  });

  test.describe("Scenario: Cancel and Discard", () => {
    // Test implementations here
  });
});
```

### Helper Functions (Already Available)

The following helper functions are already available in `tests/desktop/helpers/` and should be imported instead of being created within the test file:

- `createTestAgent` - Creates a test agent before testing editing
- `fillAgentForm` - Fills the agent creation/edit form with provided data
- `verifyAgentPersistence` - Verifies that agent data is properly persisted to the file system

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
  fillAgentForm,
  verifyAgentPersistence,
} from "../../../helpers";
```

### Additional Helper Functions to Implement Within File

```typescript
const verifyFormPopulation = async (
  window: TestWindow,
  expectedData: AgentFormData,
) => {
  // Verify form fields show expected values
  const nameInput = window.locator('[data-testid="agent-name-input"]');
  await expect(nameInput).toHaveValue(expectedData.name);

  // Verify dropdown selections
  const roleSelect = window.locator('[data-testid="role-select"]');
  await expect(roleSelect).toHaveText(expectedData.role);

  // Similar verifications for other fields
};

const updateAgentData = async (
  window: TestWindow,
  updates: Partial<AgentFormData>,
) => {
  // Helper to update specific fields in edit form
  if (updates.name) {
    await window.locator('[data-testid="agent-name-input"]').fill(updates.name);
  }
  if (updates.role) {
    const roleDropdown = window.locator('[data-testid="role-select"]');
    await roleDropdown.click();
    await window.locator(`[data-value="${updates.role}"]`).click();
  }
  // Handle other field updates
};

const verifyAgentUpdated = async (
  window: TestWindow,
  originalData: AgentFormData,
  updates: Partial<AgentFormData>,
  testSuite: ReturnType<typeof setupAgentsTestSuite>,
) => {
  // Verify agent card shows updated information
  const expectedData = { ...originalData, ...updates };
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: expectedData.name });
  await expect(agentCard).toBeVisible();

  // Verify file system persistence using existing helper
  await verifyAgentPersistence(window, expectedData, testSuite);
};
```

## Acceptance Criteria

### Basic Functional Requirements

- ✅ Opens edit modal from agent card
- ✅ Successfully updates agent name
- ✅ Handles edit cancellation without saving changes
- ✅ Updates agent data in grid after successful edit

### Technical Requirements

- ✅ Follow established test patterns from other editing tests
- ✅ Use proper async/await patterns for interactions
- ✅ Works with setupAgentsTestSuite infrastructure
- ✅ Uses existing helper functions appropriately

## Implementation Guidance

### File Location

- `tests/desktop/features/settings/agents/agent-editing.spec.ts`

### Dependencies to Study

- `/tests/desktop/features/settings/llm-setup/edit-configuration.spec.ts`
- `/tests/desktop/features/settings/roles/roles-editing.spec.ts`

## Notes

This test file ensures basic agent editing functionality works correctly. The tests verify that users can edit agent properties and save or cancel changes as expected.
