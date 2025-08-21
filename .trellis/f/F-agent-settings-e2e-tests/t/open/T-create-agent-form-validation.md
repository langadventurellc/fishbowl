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

Create comprehensive end-to-end tests for agent form validation functionality, covering all validation rules, error handling, and form state management for both creation and editing scenarios. This test file focuses specifically on validation behavior and error states.

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
  await openAgentsSection(window);
  const createButton = window.locator('[data-testid="create-agent-button"]');
  await createButton.click();
  await waitForAgentModal(window, true);

  // Try to save without entering name
  const saveButton = window.locator('[data-testid="save-agent-button"]');
  await expect(saveButton).toBeDisabled();

  // Enter name and verify save button enables
  await window.locator('[data-testid="agent-name-input"]').fill("Test Agent");
  await expect(saveButton).toBeEnabled();

  // Clear name and verify validation error
  await window.locator('[data-testid="agent-name-input"]').fill("");
  await expect(window.locator('[data-testid="name-error"]')).toBeVisible();
  await expect(saveButton).toBeDisabled();
});

test("validates role selection is required", async () => {
  // Test role field validation
  // Verify save button state
});

test("validates personality selection is required", async () => {
  // Test personality field validation
  // Verify save button state
});

test("validates model selection is required", async () => {
  // Test model field validation
  // Verify save button state
});
```

### 2. Name Uniqueness Validation

```typescript
test("prevents duplicate agent names during creation", async () => {
  const window = testSuite.getWindow();

  // Create first agent
  const firstAgent = createMockAgentData({ name: "Unique Agent" });
  await createTestAgent(window, firstAgent);

  // Try to create second agent with same name
  await openAgentsSection(window);
  const createButton = window.locator('[data-testid="create-agent-button"]');
  await createButton.click();
  await waitForAgentModal(window, true);

  // Fill form with duplicate name
  await window.locator('[data-testid="agent-name-input"]').fill("Unique Agent");
  await fillRequiredFields(window);

  // Verify validation error appears
  await expect(
    window.locator('[data-testid="duplicate-name-error"]'),
  ).toBeVisible();
  await expect(
    window.locator('[data-testid="save-agent-button"]'),
  ).toBeDisabled();
});

test("prevents duplicate agent names during editing", async () => {
  // Create two agents
  // Edit one to have the same name as the other
  // Verify validation prevents save
});

test("allows keeping same name when editing existing agent", async () => {
  // Edit agent without changing name
  // Verify no validation error for same name
});
```

### 3. Input Length and Format Validation

```typescript
test("validates agent name length limits", async () => {
  const window = testSuite.getWindow();

  await openCreateModal(window);

  // Test maximum length validation
  const longName = "A".repeat(101); // Assuming 100 char limit
  await window.locator('[data-testid="agent-name-input"]').fill(longName);

  // Verify error message or character limit handling
  await expect(
    window.locator('[data-testid="name-length-error"]'),
  ).toBeVisible();
});

test("validates description length limits", async () => {
  // Test description field length validation
  // Verify appropriate error handling
});

test("handles special characters in agent name", async () => {
  // Test various special characters
  // Verify allowed vs disallowed characters
});

test("trims whitespace from agent name", async () => {
  // Test leading/trailing whitespace handling
  // Verify normalization behavior
});
```

### 4. Dropdown Selection Validation

```typescript
test("validates role selection from available options", async () => {
  const window = testSuite.getWindow();

  await openCreateModal(window);

  // Open role dropdown
  const roleDropdown = window.locator('[data-testid="role-select"]');
  await roleDropdown.click();

  // Verify available options are valid
  const roleOptions = window.locator('[data-testid="role-option"]');
  const optionCount = await roleOptions.count();
  expect(optionCount).toBeGreaterThan(0);

  // Select invalid option (if possible) and verify handling
  // Test required selection validation
});

test("validates personality selection consistency", async () => {
  // Test personality dropdown validation
  // Verify personality options are available
});

test("validates model selection from available models", async () => {
  // Test model dropdown validation
  // Verify model options are current
});
```

### 5. Form State Management

```typescript
test("manages save button state based on form validity", async () => {
  const window = testSuite.getWindow();

  await openCreateModal(window);
  const saveButton = window.locator('[data-testid="save-agent-button"]');

  // Initially disabled
  await expect(saveButton).toBeDisabled();

  // Fill required fields one by one and test state
  await window.locator('[data-testid="agent-name-input"]').fill("Test Agent");
  await expect(saveButton).toBeDisabled(); // Still missing other fields

  await selectRole(window, "analyst");
  await expect(saveButton).toBeDisabled(); // Still missing other fields

  await selectPersonality(window, "professional");
  await expect(saveButton).toBeDisabled(); // Still missing model

  await selectModel(window, "claude-3-sonnet");
  await expect(saveButton).toBeEnabled(); // All required fields filled
});

test("clears validation errors when user corrects input", async () => {
  // Trigger validation error
  // Correct the input
  // Verify error message disappears
});

test("validates form on blur events", async () => {
  // Test validation triggers when fields lose focus
  // Verify immediate feedback behavior
});
```

### 6. Validation Error Messages

```typescript
test("displays clear validation error messages", async () => {
  const window = testSuite.getWindow();

  await openCreateModal(window);

  // Test various validation scenarios
  await window.locator('[data-testid="agent-name-input"]').fill("");
  await window.locator('[data-testid="agent-name-input"]').blur();

  // Verify error message is clear and helpful
  const errorMessage = window.locator('[data-testid="name-error"]');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toContainText("Agent name is required");
});

test("shows multiple validation errors simultaneously", async () => {
  // Create multiple validation errors
  // Verify all errors display appropriately
  // Test error priority and display order
});

test("announces validation errors to screen readers", async () => {
  // Test accessibility of error messages
  // Verify ARIA attributes and announcements
});
```

### 7. Cross-field Validation

```typescript
test("validates role and personality compatibility", async () => {
  // Test if certain role/personality combinations are restricted
  // Verify appropriate validation feedback
});

test("validates model availability for selected configuration", async () => {
  // Test if certain models are restricted based on other selections
  // Verify dynamic validation behavior
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

### Helper Functions to Implement Within File

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

const createTestAgent = async (
  window: TestWindow,
  agentData: AgentFormData,
) => {
  await openAgentsSection(window);
  const createButton = window.locator('[data-testid="create-agent-button"]');
  await createButton.click();
  await waitForAgentModal(window, true);
  await fillAgentForm(window, agentData);
  const saveButton = window.locator('[data-testid="save-agent-button"]');
  await saveButton.click();
  await waitForAgentModal(window, false);
};
```

## Acceptance Criteria

### Functional Requirements

- ✅ Validates all required fields (name, role, personality, model)
- ✅ Prevents duplicate agent names during creation and editing
- ✅ Validates input length limits and format requirements
- ✅ Manages save button state based on form validity
- ✅ Displays clear, helpful validation error messages
- ✅ Clears errors when user corrects input
- ✅ Supports both creation and editing validation scenarios

### Technical Requirements

- ✅ Follow established test patterns from LLM setup validation tests
- ✅ Use proper async/await patterns for all interactions
- ✅ Include appropriate timeouts and error handling
- ✅ Use accessibility-compliant selectors (data-testid)
- ✅ Test validation state changes reliably
- ✅ Handle form blur and focus events appropriately

### Integration Requirements

- ✅ Works with setupAgentsTestSuite infrastructure
- ✅ Uses navigation and modal helpers appropriately
- ✅ Integrates with mock data generators (including invalid data)
- ✅ Supports clean test isolation between runs
- ✅ Provides clear test descriptions and error messages

## Implementation Guidance

### File Location

- `tests/desktop/features/settings/agents/agent-validation.spec.ts`

### Dependencies to Study

- `/tests/desktop/features/settings/llm-setup/form-validation-error-handling.spec.ts`
- `/tests/desktop/features/settings/roles/roles-creation.spec.ts` (for validation patterns)
- `/tests/desktop/features/settings/personalities/personalities-creation.spec.ts` (for validation patterns)

### Selector Strategy

- `[data-testid="agent-form-modal"]` - Agent form modal
- `[data-testid="agent-name-input"]` - Agent name input field
- `[data-testid="role-select"]` - Role selection dropdown
- `[data-testid="personality-select"]` - Personality selection dropdown
- `[data-testid="model-select"]` - Model selection dropdown
- `[data-testid="save-agent-button"]` - Save/create button
- `[data-testid="name-error"]` - Name validation error message
- `[data-testid="duplicate-name-error"]` - Duplicate name error
- `[data-testid="name-length-error"]` - Name length validation error

## Security Considerations

- Test XSS prevention in input fields
- Verify input sanitization works correctly
- Test that validation errors don't expose sensitive information
- Ensure validation prevents malicious input patterns

## Performance Requirements

- Each test should complete within 30 seconds
- Total test file should complete within 3-5 minutes
- Focus on functionality verification, not performance benchmarking

## Notes

This test file ensures that agent form validation provides a robust, user-friendly experience while maintaining data integrity. The tests should comprehensively cover all validation scenarios to prevent invalid data entry and provide clear guidance to users.
