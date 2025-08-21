---
id: T-create-agent-empty-state-tests
title: Create Agent Empty State Tests
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
created: 2025-08-21T00:34:22.865Z
updated: 2025-08-21T00:34:22.865Z
---

# Create Agent Empty State Tests

## Context

Create basic end-to-end tests for agent empty state functionality, covering the display of empty state when no agents exist and basic first agent creation flow. This test file focuses on essential empty state behavior.

## Implementation Requirements

### File to Create

**`tests/desktop/features/settings/agents/agent-empty-state.spec.ts`**

Follow the established pattern from LLM setup tests like `empty-state-interaction.spec.ts` but adapted for agent empty state workflows.

## Test Scenarios to Implement

### 1. Basic Empty State Display

```typescript
test("displays empty state when no agents exist", async () => {
  const window = testSuite.getWindow();

  // Navigate to agents section (should be empty from beforeEach cleanup)
  await openAgentsSection(window);

  // Verify empty state is displayed
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).toBeVisible();

  // Verify create agent button is available in empty state
  await expect(
    window.locator('[data-testid="create-first-agent-button"]'),
  ).toBeVisible();

  // Verify no agent cards are displayed
  await expect(window.locator('[data-testid="agent-card"]')).not.toBeVisible();
});
```

### 2. First Agent Creation Flow

```typescript
test("creates first agent from empty state", async () => {
  const window = testSuite.getWindow();

  // Start from empty state
  await openAgentsSection(window);
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).toBeVisible();

  // Click create first agent button
  const createFirstButton = window.locator(
    '[data-testid="create-first-agent-button"]',
  );
  await createFirstButton.click();

  // Verify agent form modal opens
  await waitForAgentModal(window, true);

  // Create agent
  const mockAgent = createMockAgentData();
  await fillAgentForm(window, mockAgent);
  const saveButton = window.locator('[data-testid="save-agent-button"]');
  await saveButton.click();

  // Verify modal closes and empty state disappears
  await waitForAgentModal(window, false);
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).not.toBeVisible();

  // Verify agent card appears
  await waitForAgentsList(window, true);
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: mockAgent.name });
  await expect(agentCard).toBeVisible();
});

test("handles canceling first agent creation", async () => {
  const window = testSuite.getWindow();

  // Start from empty state
  await openAgentsSection(window);

  // Click create first agent button
  const createFirstButton = window.locator(
    '[data-testid="create-first-agent-button"]',
  );
  await createFirstButton.click();
  await waitForAgentModal(window, true);

  // Cancel agent creation
  const cancelButton = window.locator('[data-testid="cancel-button"]');
  await cancelButton.click();

  // Verify modal closes and empty state returns
  await waitForAgentModal(window, false);
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).toBeVisible();
});
```

## Technical Implementation

### Test Structure Pattern

```typescript
import { expect, test } from "@playwright/test";
import { access } from "fs/promises";
import path from "path";
import {
  setupAgentsTestSuite,
  openAgentsSection,
  createMockAgentData,
  waitForAgentModal,
  waitForAgentsList,
} from "../../../helpers/settings";

test.describe("Feature: Agent Management - Empty State", () => {
  const testSuite = setupAgentsTestSuite();

  test.describe("Scenario: Initial Empty State", () => {
    // Test implementations here
  });

  test.describe("Scenario: First Agent Creation", () => {
    // Test implementations here
  });

  test.describe("Scenario: State Transitions", () => {
    // Test implementations here
  });

  test.describe("Scenario: Return to Empty", () => {
    // Test implementations here
  });
});
```

### Helper Functions (Already Available)

The following helper functions are already available in `tests/desktop/helpers/` and should be imported instead of being created within the test file:

- `fillAgentForm` - Fills the agent creation/edit form with provided data
- `createMockAgentData` - Creates mock agent data for testing

Import these from the helpers module:

```typescript
import {
  setupAgentsTestSuite,
  openAgentsSection,
  createMockAgentData,
  waitForAgentModal,
  waitForAgentsList,
  fillAgentForm,
} from "../../../helpers";
```

### Additional Helper Functions to Implement Within File

```typescript
const createFirstAgent = async (window: TestWindow) => {
  // Create first agent from empty state
  const createFirstButton = window.locator(
    '[data-testid="create-first-agent-button"]',
  );
  await createFirstButton.click();
  await waitForAgentModal(window, true);

  const mockAgent = createMockAgentData();
  await fillAgentForm(window, mockAgent);

  const saveButton = window.locator('[data-testid="save-agent-button"]');
  await saveButton.click();
  await waitForAgentModal(window, false);

  return mockAgent;
};

const createAdditionalAgent = async (window: TestWindow) => {
  // Create additional agent when not in empty state
  const createButton = window.locator('[data-testid="create-agent-button"]');
  await createButton.click();
  await waitForAgentModal(window, true);

  const mockAgent = createMockAgentData({
    name: `Agent ${Date.now()}`, // Unique name
  });
  await fillAgentForm(window, mockAgent);

  const saveButton = window.locator('[data-testid="save-agent-button"]');
  await saveButton.click();
  await waitForAgentModal(window, false);

  return mockAgent;
};

const verifyEmptyStateContent = async (window: TestWindow) => {
  const emptyState = window.locator('[data-testid="empty-agents-state"]');
  await expect(emptyState).toBeVisible();
  await expect(
    window.locator('[data-testid="empty-state-title"]'),
  ).toBeVisible();
  await expect(
    window.locator('[data-testid="empty-state-description"]'),
  ).toBeVisible();
  await expect(
    window.locator('[data-testid="create-first-agent-button"]'),
  ).toBeVisible();
};
```

## Acceptance Criteria

### Basic Functional Requirements

- ✅ Displays empty state when no agents exist
- ✅ Creates first agent from empty state successfully
- ✅ Handles canceling first agent creation gracefully
- ✅ Transitions from empty to populated state correctly

### Technical Requirements

- ✅ Follow established test patterns from other empty state tests
- ✅ Use proper async/await patterns for interactions
- ✅ Works with setupAgentsTestSuite infrastructure
- ✅ Uses existing helper functions appropriately

## Implementation Guidance

### File Location

- `tests/desktop/features/settings/agents/agent-empty-state.spec.ts`

### Dependencies to Study

- `/tests/desktop/features/settings/llm-setup/empty-state-interaction.spec.ts`
- Existing empty state patterns in other settings sections

## Notes

This test file ensures basic empty state functionality works correctly. The tests verify that the empty state displays properly and that users can create their first agent from the empty state.
