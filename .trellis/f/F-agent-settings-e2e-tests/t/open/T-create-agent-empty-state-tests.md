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

Create comprehensive end-to-end tests for agent empty state functionality, covering the initial state when no agents exist, first agent creation flow, transitions between empty and populated states, and returning to empty state scenarios. This test file focuses specifically on empty state behavior and user guidance.

## Implementation Requirements

### File to Create

**`tests/desktop/features/settings/agents/agent-empty-state.spec.ts`**

Follow the established pattern from LLM setup tests like `empty-state-interaction.spec.ts` but adapted for agent empty state workflows.

## Test Scenarios to Implement

### 1. Initial Empty State Display

```typescript
test("displays empty state when no agents exist", async () => {
  const window = testSuite.getWindow();

  // Navigate to agents section (should be empty from beforeEach cleanup)
  await openAgentsSection(window);

  // Verify empty state is displayed
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).toBeVisible();

  // Verify empty state content
  await expect(
    window.locator('[data-testid="empty-state-title"]'),
  ).toContainText("No agents configured");
  await expect(
    window.locator('[data-testid="empty-state-description"]'),
  ).toBeVisible();

  // Verify create agent button is available in empty state
  await expect(
    window.locator('[data-testid="create-first-agent-button"]'),
  ).toBeVisible();

  // Verify no agent cards are displayed
  await expect(window.locator('[data-testid="agent-card"]')).not.toBeVisible();
});

test("shows appropriate empty state messaging", async () => {
  const window = testSuite.getWindow();

  await openAgentsSection(window);

  // Verify helpful messaging for users
  const emptyState = window.locator('[data-testid="empty-agents-state"]');
  await expect(emptyState).toContainText("Create your first AI agent");
  await expect(emptyState).toContainText(
    "Configure agents with unique personalities",
  );

  // Verify call-to-action is clear
  const createButton = window.locator(
    '[data-testid="create-first-agent-button"]',
  );
  await expect(createButton).toContainText("Create Agent");
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

  // Verify no agent cards exist
  await expect(window.locator('[data-testid="agent-card"]')).not.toBeVisible();
});
```

### 3. Transition from Empty to Populated

```typescript
test("transitions from empty state to agent grid correctly", async () => {
  const window = testSuite.getWindow();

  // Start from empty state
  await openAgentsSection(window);
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).toBeVisible();

  // Create first agent
  await createFirstAgent(window);

  // Verify transition to populated state
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).not.toBeVisible();
  await expect(window.locator('[data-testid="agents-grid"]')).toBeVisible();
  await expect(window.locator('[data-testid="agent-card"]')).toBeVisible();

  // Verify create agent button changes to standard create button
  await expect(
    window.locator('[data-testid="create-agent-button"]'),
  ).toBeVisible();
  await expect(
    window.locator('[data-testid="create-first-agent-button"]'),
  ).not.toBeVisible();
});

test("maintains proper layout after transition", async () => {
  const window = testSuite.getWindow();

  // Create first agent from empty state
  await openAgentsSection(window);
  await createFirstAgent(window);

  // Verify grid layout is properly initialized
  const agentsGrid = window.locator('[data-testid="agents-grid"]');
  await expect(agentsGrid).toBeVisible();

  // Verify responsive layout classes are applied
  await expect(agentsGrid).toHaveClass(/grid/);

  // Create second agent to verify grid grows properly
  await createAdditionalAgent(window);
  const agentCards = window.locator('[data-testid="agent-card"]');
  expect(await agentCards.count()).toBe(2);
});
```

### 4. Return to Empty State

```typescript
test("returns to empty state when all agents are deleted", async () => {
  const window = testSuite.getWindow();

  // Create single agent
  await openAgentsSection(window);
  await createFirstAgent(window);
  await expect(window.locator('[data-testid="agents-grid"]')).toBeVisible();

  // Delete the only agent
  const agentCard = window.locator('[data-testid="agent-card"]').first();
  const deleteButton = agentCard.locator('[data-testid="delete-agent-button"]');
  await deleteButton.click();

  // Confirm deletion
  const confirmButton = window.locator('[data-testid="confirm-delete-button"]');
  await confirmButton.click();

  // Verify return to empty state
  await expect(
    window.locator('[data-testid="delete-confirmation-dialog"]'),
  ).not.toBeVisible();
  await expect(window.locator('[data-testid="agents-grid"]')).not.toBeVisible();
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).toBeVisible();

  // Verify empty state messaging returns
  await expect(
    window.locator('[data-testid="create-first-agent-button"]'),
  ).toBeVisible();
});

test("returns to empty state when deleting multiple agents", async () => {
  const window = testSuite.getWindow();

  // Create multiple agents
  await openAgentsSection(window);
  await createFirstAgent(window);
  await createAdditionalAgent(window);
  await createAdditionalAgent(window);

  // Verify multiple agents exist
  const agentCards = window.locator('[data-testid="agent-card"]');
  expect(await agentCards.count()).toBe(3);

  // Delete all agents one by one
  while ((await agentCards.count()) > 0) {
    const firstCard = agentCards.first();
    const deleteButton = firstCard.locator(
      '[data-testid="delete-agent-button"]',
    );
    await deleteButton.click();
    const confirmButton = window.locator(
      '[data-testid="confirm-delete-button"]',
    );
    await confirmButton.click();
    await window.waitForTimeout(500); // Wait for deletion to complete
  }

  // Verify return to empty state
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).toBeVisible();
});
```

### 5. Empty State Accessibility and Interaction

```typescript
test("provides accessible empty state experience", async () => {
  const window = testSuite.getWindow();

  await openAgentsSection(window);

  // Verify empty state has proper ARIA attributes
  const emptyState = window.locator('[data-testid="empty-agents-state"]');
  await expect(emptyState).toHaveAttribute("role", "region");
  await expect(emptyState).toHaveAttribute("aria-label");

  // Verify create button is focusable and has proper labeling
  const createButton = window.locator(
    '[data-testid="create-first-agent-button"]',
  );
  await expect(createButton).toBeFocused(); // Should be auto-focused
  await expect(createButton).toHaveAttribute("aria-label");

  // Test keyboard navigation
  await window.keyboard.press("Tab");
  // Should stay on create button or move to next focusable element
});

test("handles keyboard interaction in empty state", async () => {
  const window = testSuite.getWindow();

  await openAgentsSection(window);

  // Focus should be on create button
  const createButton = window.locator(
    '[data-testid="create-first-agent-button"]',
  );
  await createButton.focus();

  // Press Enter to create agent
  await window.keyboard.press("Enter");

  // Verify modal opens
  await waitForAgentModal(window, true);

  // Cancel with Escape
  await window.keyboard.press("Escape");

  // Verify return to empty state
  await waitForAgentModal(window, false);
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).toBeVisible();
});
```

### 6. Empty State Persistence and Loading

```typescript
test("shows empty state after modal reopen when no agents exist", async () => {
  const window = testSuite.getWindow();

  // Navigate to agents (should be empty)
  await openAgentsSection(window);
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).toBeVisible();

  // Close settings modal
  await window.evaluate(() => {
    window.testHelpers!.closeSettingsModal();
  });
  await expect(
    window.locator('[data-testid="settings-modal"]'),
  ).not.toBeVisible();

  // Reopen and navigate to agents
  await openAgentsSection(window);

  // Verify empty state persists
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).toBeVisible();
  await expect(
    window.locator('[data-testid="create-first-agent-button"]'),
  ).toBeVisible();
});

test("loads empty state when agents.json is missing", async () => {
  const window = testSuite.getWindow();

  // Ensure no agents.json file exists (handled by beforeEach)
  await openAgentsSection(window);

  // Verify empty state displays correctly
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).toBeVisible();

  // Verify file system state
  const userDataPath = await testSuite
    .getElectronApp()
    .evaluate(async ({ app }) => {
      return app.getPath("userData");
    });
  const agentsPath = path.join(userDataPath, "agents.json");

  // File should not exist yet
  try {
    await fs.access(agentsPath);
    expect(false).toBe(true); // Should not reach here
  } catch (error) {
    expect((error as any).code).toBe("ENOENT");
  }
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
} from "./index";

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

### Helper Functions to Implement Within File

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

const fillAgentForm = async (window: TestWindow, agentData: AgentFormData) => {
  await window.locator('[data-testid="agent-name-input"]').fill(agentData.name);

  const roleDropdown = window.locator('[data-testid="role-select"]');
  await roleDropdown.click();
  await window.locator(`[data-value="${agentData.role}"]`).click();

  const personalityDropdown = window.locator(
    '[data-testid="personality-select"]',
  );
  await personalityDropdown.click();
  await window.locator(`[data-value="${agentData.personality}"]`).click();

  const modelDropdown = window.locator('[data-testid="model-select"]');
  await modelDropdown.click();
  await window.locator(`[data-value="${agentData.model}"]`).click();

  if (agentData.description) {
    await window
      .locator('[data-testid="agent-description-input"]')
      .fill(agentData.description);
  }
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

### Functional Requirements

- ✅ Displays empty state when no agents exist
- ✅ Shows appropriate messaging and call-to-action
- ✅ Creates first agent from empty state successfully
- ✅ Handles canceling first agent creation gracefully
- ✅ Transitions from empty to populated state correctly
- ✅ Returns to empty state when all agents are deleted
- ✅ Maintains proper layout and accessibility in empty state

### Technical Requirements

- ✅ Follow established test patterns from LLM setup empty state tests
- ✅ Use proper async/await patterns for all interactions
- ✅ Include appropriate timeouts and error handling
- ✅ Use accessibility-compliant selectors (data-testid)
- ✅ Test keyboard navigation and screen reader support
- ✅ Verify file system state consistency

### Integration Requirements

- ✅ Works with setupAgentsTestSuite infrastructure
- ✅ Uses navigation and modal helpers appropriately
- ✅ Integrates with mock data generators
- ✅ Supports clean test isolation between runs
- ✅ Provides clear test descriptions and error messages

## Implementation Guidance

### File Location

- `tests/desktop/features/settings/agents/agent-empty-state.spec.ts`

### Dependencies to Study

- `/tests/desktop/features/settings/llm-setup/empty-state-interaction.spec.ts`
- Empty state components in agent section
- Existing empty state patterns in other settings sections

### Selector Strategy

- `[data-testid="empty-agents-state"]` - Empty state container
- `[data-testid="empty-state-title"]` - Empty state title
- `[data-testid="empty-state-description"]` - Empty state description
- `[data-testid="create-first-agent-button"]` - Create first agent button
- `[data-testid="create-agent-button"]` - Standard create button (non-empty)
- `[data-testid="agents-grid"]` - Agent grid container
- `[data-testid="agent-card"]` - Individual agent cards

## Security Considerations

- No sensitive data handling in empty state
- Verify proper state management prevents data leakage
- Test that empty state doesn't expose system information
- Ensure clean transitions maintain security boundaries

## Performance Requirements

- Each test should complete within 30 seconds
- Empty state should load quickly and responsively
- Transitions should be smooth and not cause UI flicker
- Focus on functionality verification, not performance benchmarking

## Notes

This test file ensures that the empty state provides a welcoming, accessible experience for new users while maintaining proper state management throughout the agent lifecycle. The tests should cover all transition scenarios to ensure robust behavior.
