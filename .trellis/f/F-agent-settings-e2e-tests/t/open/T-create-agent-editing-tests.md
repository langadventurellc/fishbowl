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

Create comprehensive end-to-end tests for agent editing functionality, covering the complete workflow from opening an existing agent for editing to successfully updating and persisting changes. This test file focuses specifically on the edit flow and update scenarios.

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
  await createTestAgent(window, createMockAgentData());

  // Navigate to agents section
  await openAgentsSection(window);

  // Click edit button on agent card
  const agentCard = window.locator('[data-testid="agent-card"]').first();
  const editButton = agentCard.locator('[data-testid="edit-agent-button"]');
  await editButton.click();

  // Verify edit modal opens with existing data
  await waitForAgentModal(window, true);

  // Verify form is populated with existing agent data
  await verifyFormPopulation(window, mockAgent);
});

test("updates agent data successfully", async () => {
  // Create initial agent
  // Open edit modal
  // Modify agent properties
  // Save changes
  // Verify updates persist
});
```

### 2. Form Pre-population and State

```typescript
test("pre-populates edit form with existing agent data", async () => {
  // Test that all form fields show current agent values
  // Test dropdown selections match existing agent
});

test("handles form state changes during editing", async () => {
  // Test save button enable/disable during edits
  // Test validation state updates
  // Test form dirty state tracking
});
```

### 3. Different Types of Edits

```typescript
test("updates agent name successfully", async () => {
  // Test name field modification
  // Test name uniqueness validation during edit
});

test("updates agent role successfully", async () => {
  // Test role selection change
  // Test role-dependent field updates
});

test("updates agent personality successfully", async () => {
  // Test personality selection change
  // Test personality-dependent behavior
});

test("updates agent model successfully", async () => {
  // Test model selection change
  // Test model-dependent configuration
});

test("updates agent description successfully", async () => {
  // Test description field modification
  // Test long description handling
});
```

### 4. Edit Validation and Error Handling

```typescript
test("validates required fields during edit", async () => {
  // Test clearing required fields shows validation errors
  // Test form submission blocked when invalid
});

test("handles duplicate name validation during edit", async () => {
  // Create multiple agents
  // Try to edit one to have duplicate name
  // Verify validation prevents save
});

test("shows validation errors for invalid data", async () => {
  // Test various invalid data scenarios
  // Verify error messages display correctly
});
```

### 5. Edit Cancellation and Discard Changes

```typescript
test("cancels edit without saving changes", async () => {
  // Open edit modal
  // Make changes
  // Click cancel button
  // Verify changes are not saved
  // Verify original data unchanged
});

test("discards changes when closing modal with X button", async () => {
  // Open edit modal
  // Make changes
  // Close modal with X button
  // Verify changes are discarded
});

test("handles unsaved changes warning", async () => {
  // Make changes
  // Attempt to close modal
  // Verify warning dialog if implemented
});
```

### 6. Data Persistence and Verification

```typescript
test("persists edited agent data to file system", async () => {
  // Edit agent
  // Verify agents.json contains updated data
  // Verify timestamps updated appropriately
});

test("loads edited agents correctly after modal reopen", async () => {
  // Edit agent, close modal, reopen
  // Verify edited data persists in UI
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
} from "./index";

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

### Helper Functions to Implement Within File

```typescript
const createTestAgent = async (
  window: TestWindow,
  agentData: AgentFormData,
) => {
  // Helper to create an agent before testing editing
  await openAgentsSection(window);
  const createButton = window.locator('[data-testid="create-agent-button"]');
  await createButton.click();
  await waitForAgentModal(window, true);
  await fillAgentForm(window, agentData);
  const saveButton = window.locator('[data-testid="save-agent-button"]');
  await saveButton.click();
  await waitForAgentModal(window, false);
};

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
) => {
  // Verify agent card shows updated information
  const expectedData = { ...originalData, ...updates };
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: expectedData.name });
  await expect(agentCard).toBeVisible();

  // Verify file system persistence
  await verifyAgentPersistence(window, expectedData);
};
```

## Acceptance Criteria

### Functional Requirements

- ✅ Opens edit modal from agent card with pre-populated data
- ✅ Successfully updates agent name, role, personality, model, and description
- ✅ Validates form fields during editing (required fields, uniqueness)
- ✅ Handles edit cancellation without saving changes
- ✅ Discards changes when modal is closed without saving
- ✅ Shows appropriate validation errors for invalid edits
- ✅ Updates agent data in grid after successful edit

### Technical Requirements

- ✅ Follow established test patterns from LLM setup tests
- ✅ Use proper async/await patterns for all interactions
- ✅ Include appropriate timeouts and error handling
- ✅ Use accessibility-compliant selectors (data-testid)
- ✅ Verify file system persistence with proper path handling
- ✅ Handle form state management correctly

### Integration Requirements

- ✅ Works with setupAgentsTestSuite infrastructure
- ✅ Uses navigation and modal helpers appropriately
- ✅ Integrates with mock data generators
- ✅ Supports clean test isolation between runs
- ✅ Provides clear test descriptions and error messages

## Implementation Guidance

### File Location

- `tests/desktop/features/settings/agents/agent-editing.spec.ts`

### Dependencies to Study

- `/tests/desktop/features/settings/llm-setup/edit-configuration.spec.ts`
- `/tests/desktop/features/settings/roles/roles-editing.spec.ts`
- `/tests/desktop/features/settings/personalities/personalities-editing.spec.ts`

### Selector Strategy

- `[data-testid="agent-card"]` - Agent card in grid
- `[data-testid="edit-agent-button"]` - Edit button on agent card
- `[data-testid="agent-form-modal"]` - Edit form modal
- `[data-testid="agent-name-input"]` - Agent name input field
- `[data-testid="role-select"]` - Role selection dropdown
- `[data-testid="personality-select"]` - Personality selection dropdown
- `[data-testid="model-select"]` - Model selection dropdown
- `[data-testid="save-agent-button"]` - Update/save button
- `[data-testid="cancel-button"]` - Cancel button

## Security Considerations

- Use only test data, no real agent configurations
- File system operations limited to test userData directory
- Validate that original data is preserved when canceling edits
- Ensure test data doesn't leak between test runs

## Performance Requirements

- Each test should complete within 30 seconds
- Total test file should complete within 3-5 minutes
- Focus on functionality verification, not performance benchmarking

## Notes

This test file ensures that agent editing functionality works reliably and maintains data integrity. The tests should cover both successful edit scenarios and various failure/cancellation scenarios to ensure robust functionality.
