---
id: T-create-agent-form-validation
title: Create Agent Form Validation Tests
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
created: 2025-08-21T00:32:14.730Z
updated: 2025-08-21T00:32:14.730Z
---

# Create Agent Form Validation Tests

## Context

Create basic end-to-end tests for agent form validation functionality, covering essential validation rules and form state management. This test file focuses on basic validation behavior to ensure required fields are validated.

## Implementation Requirements

### File to Create

**`tests/desktop/features/settings/agents/agent-validation.spec.ts`**

Follow the established pattern from LLM setup tests like `form-validation-error-handling.spec.ts` but adapted for agent form validation workflows.

## Test Scenarios to Implement

### 1. Required Field Validation

```typescript
test("validates agent name is required", async () => {
  const window = testSuite.getWindow();

  // Navigate to agents section and open create modal
  await openCreateModal(window);

  // Initially save button should be disabled
  const saveButton = window.locator('[data-testid="save-agent-button"]');
  await expect(saveButton).toBeDisabled();

  // Enter name and verify save button state
  await window.locator('[data-testid="agent-name-input"]').fill("Test Agent");
  // Still disabled until all required fields filled
  await expect(saveButton).toBeDisabled();
});

test("validates all required fields before enabling save", async () => {
  const window = testSuite.getWindow();

  await openCreateModal(window);
  const saveButton = window.locator('[data-testid="save-agent-button"]');

  // Initially disabled
  await expect(saveButton).toBeDisabled();

  // Fill required fields one by one and test state
  await fillRequiredFields(window, "model"); // Fill all except model
  await expect(saveButton).toBeDisabled(); // Still missing model

  await selectModel(window, "claude-3-sonnet");
  await expect(saveButton).toBeEnabled(); // All required fields filled
});
```

### 2. Basic Name Validation

```typescript
test("prevents duplicate agent names during creation", async () => {
  const window = testSuite.getWindow();

  // Create first agent
  const firstAgent = createMockAgentData({ name: "Unique Agent" });
  await createTestAgent(window, firstAgent);

  // Try to create second agent with same name
  await openCreateModal(window);

  // Fill form with duplicate name
  await window.locator('[data-testid="agent-name-input"]').fill("Unique Agent");
  await fillRequiredFields(window, "name");

  // Verify save button is disabled due to validation
  const saveButton = window.locator('[data-testid="save-agent-button"]');
  await expect(saveButton).toBeDisabled();
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
  createInvalidAgentData,
  waitForAgentModal,
  waitForAgentsList,
} from "../../../helpers/settings";

test.describe("Feature: Agent Management - Form Validation", () => {
  const testSuite = setupAgentsTestSuite();

  test.describe("Scenario: Required Field Validation", () => {
    // Test implementations here
  });

  test.describe("Scenario: Name Uniqueness", () => {
    // Test implementations here
  });

  test.describe("Scenario: Input Format Validation", () => {
    // Test implementations here
  });

  test.describe("Scenario: Form State Management", () => {
    // Test implementations here
  });
});
```

### Helper Functions (Already Available)

The following helper functions are already available in `tests/desktop/helpers/` and should be imported instead of being created within the test file:

- `createTestAgent` - Creates a test agent for validation testing
- `fillAgentForm` - Fills the agent creation/edit form with provided data
- `createMockAgentData` - Creates mock agent data for testing
- `createInvalidAgentData` - Creates invalid agent data for validation testing

Import these from the helpers module:

```typescript
import {
  setupAgentsTestSuite,
  openAgentsSection,
  createMockAgentData,
  createInvalidAgentData,
  waitForAgentModal,
  waitForAgentsList,
  createTestAgent,
  fillAgentForm,
} from "../../../helpers";
```

### Additional Helper Functions to Implement Within File

```typescript
const openCreateModal = async (window: TestWindow) => {
  await openAgentsSection(window);
  const createButton = window.locator('[data-testid="create-agent-button"]');
  await createButton.click();
  await waitForAgentModal(window, true);
};

const fillRequiredFields = async (
  window: TestWindow,
  excludeField?: string,
) => {
  if (excludeField !== "name") {
    await window.locator('[data-testid="agent-name-input"]').fill("Test Agent");
  }
  if (excludeField !== "role") {
    await selectRole(window, "analyst");
  }
  if (excludeField !== "personality") {
    await selectPersonality(window, "professional");
  }
  if (excludeField !== "model") {
    await selectModel(window, "claude-3-sonnet");
  }
};

const selectRole = async (window: TestWindow, role: string) => {
  const roleDropdown = window.locator('[data-testid="role-select"]');
  await roleDropdown.click();
  await window.locator(`[data-value="${role}"]`).click();
};

const selectPersonality = async (window: TestWindow, personality: string) => {
  const personalityDropdown = window.locator(
    '[data-testid="personality-select"]',
  );
  await personalityDropdown.click();
  await window.locator(`[data-value="${personality}"]`).click();
};

const selectModel = async (window: TestWindow, model: string) => {
  const modelDropdown = window.locator('[data-testid="model-select"]');
  await modelDropdown.click();
  await window.locator(`[data-value="${model}"]`).click();
};
```

## Acceptance Criteria

### Basic Functional Requirements

- ✅ Validates all required fields (name, role, personality, model)
- ✅ Prevents duplicate agent names during creation
- ✅ Manages save button state based on form validity

### Technical Requirements

- ✅ Follow established test patterns from other validation tests
- ✅ Use proper async/await patterns for interactions
- ✅ Works with setupAgentsTestSuite infrastructure
- ✅ Uses existing helper functions appropriately

## Implementation Guidance

### File Location

- `tests/desktop/features/settings/agents/agent-validation.spec.ts`

### Dependencies to Study

- `/tests/desktop/features/settings/llm-setup/form-validation-error-handling.spec.ts`
- `/tests/desktop/features/settings/roles/roles-creation.spec.ts` (for validation patterns)

## Notes

This test file ensures basic form validation functionality works correctly. The tests verify that required fields are validated and save button state is managed properly based on form validity.
