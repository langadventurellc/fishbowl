---
id: T-create-agent-creation-tests
title: Create Agent Creation Tests
status: done
priority: medium
parent: F-agent-settings-e2e-tests
prerequisites:
  - T-create-agent-test-infrastructu
  - T-create-agent-navigation-and
  - T-create-agent-mock-data
affectedFiles:
  tests/desktop/features/settings/agents/agent-creation.spec.ts:
    Created comprehensive end-to-end test suite for agent creation with 8 test
    scenarios achieving 100% pass rate
  tests/desktop/helpers/settings/createLlmConfigForAgentTests.ts:
    Created helper function to set up LLM configuration required for agent
    creation tests
  tests/desktop/helpers/index.ts: Added exports for agent test helpers including
    setupAgentsTestSuite, openAgentsSection, createMockAgent functions, and wait
    helpers
  tests/desktop/helpers/settings/waitForAgentModal.ts:
    Updated modal selectors to
    use CSS class instead of data-testid for proper modal detection
  tests/desktop/helpers/settings/waitForAgentsList.ts: Updated agent card
    detection to use role='article' selector and improved error handling for
    agent list verification
log:
  - Successfully implemented comprehensive agent creation end-to-end tests with
    100% pass rate (8/8 tests passing). Created robust test infrastructure
    including LLM configuration setup, form interaction helpers, persistence
    verification, and proper selector handling. All tests now pass reliably
    covering basic creation, agent type variations, form state management, data
    persistence, and edge cases.
schema: v1.0
childrenIds: []
created: 2025-08-21T00:29:45.058Z
updated: 2025-08-21T00:29:45.058Z
---

# Create Agent Creation Tests

## Context

Create comprehensive end-to-end tests for agent creation functionality, covering the complete workflow from opening the create modal to successfully creating and persisting agent data. This test file focuses specifically on the creation flow and success scenarios.

## Implementation Requirements

### File to Create

**`tests/desktop/features/settings/agents/agent-creation.spec.ts`**

Follow the established pattern from LLM setup tests like `anthropic-configuration-creation.spec.ts` but adapted for agent creation workflows.

## Test Scenarios to Implement

### 1. Basic Agent Creation

```typescript
test("creates agent successfully with valid data", async () => {
  const window = testSuite.getWindow();

  // Navigate to agents section
  await openAgentsSection(window);

  // Click create new agent button
  const createButton = window.locator('[data-testid="create-agent-button"]');
  await createButton.click();

  // Wait for create modal to open
  await waitForAgentModal(window, true);

  // Fill form with valid agent data
  const mockAgent = createMockAgentData();
  await fillAgentForm(window, mockAgent);

  // Submit form
  const saveButton = window.locator('[data-testid="save-agent-button"]');
  await saveButton.click();

  // Verify modal closes
  await waitForAgentModal(window, false);

  // Verify agent appears in grid
  await waitForAgentsList(window, true);
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: mockAgent.name });
  await expect(agentCard).toBeVisible();

  // Verify agent data is persisted
  await verifyAgentPersistence(window, mockAgent);
});
```

### 2. Agent Creation with Different Types

```typescript
test("creates analyst agent successfully", async () => {
  // Test creating analyst agent with specific role/personality
});

test("creates writer agent successfully", async () => {
  // Test creating writer agent with creative personality
});

test("creates technical agent successfully", async () => {
  // Test creating technical agent with logical personality
});
```

### 3. Form Interaction and State Management

```typescript
test("handles form state changes correctly during creation", async () => {
  // Test save button enable/disable states
  // Test form field interactions
  // Test validation state updates
});

test("shows success message after agent creation", async () => {
  // Test success feedback to user
  // Test screen reader announcements
});
```

### 4. Data Persistence Verification

```typescript
test("persists agent data to file system", async () => {
  // Create agent and verify agents.json contains correct data
  // Test file structure and content
});

test("loads created agents after modal reopen", async () => {
  // Create agent, close modal, reopen, verify agent is listed
});
```

### 5. Edge Cases and Boundary Conditions

```typescript
test("handles agent creation with minimal required fields", async () => {
  // Test with only required fields filled
});

test("handles agent creation with maximum length data", async () => {
  // Test with very long names and descriptions
});

test("handles agent creation with special characters", async () => {
  // Test with special characters in name and description
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
  createMockWriterAgent,
  createMockTechnicalAgent,
  waitForAgentModal,
  waitForAgentsList,
} from "../../../helpers/settings";

test.describe("Feature: Agent Management - Creation", () => {
  const testSuite = setupAgentsTestSuite();

  test.describe("Scenario: Basic Agent Creation", () => {
    // Test implementations here
  });

  test.describe("Scenario: Agent Type Variations", () => {
    // Test implementations here
  });

  test.describe("Scenario: Form State Management", () => {
    // Test implementations here
  });

  test.describe("Scenario: Data Persistence", () => {
    // Test implementations here
  });
});
```

### Helper Functions to Implement Within File

```typescript
const fillAgentForm = async (window: TestWindow, agentData: AgentFormData) => {
  // Fill name field
  await window.locator('[data-testid="agent-name-input"]').fill(agentData.name);

  // Select role dropdown
  const roleDropdown = window.locator('[data-testid="role-select"]');
  await roleDropdown.click();
  await window.locator(`[data-value="${agentData.role}"]`).click();

  // Select personality dropdown
  const personalityDropdown = window.locator(
    '[data-testid="personality-select"]',
  );
  await personalityDropdown.click();
  await window.locator(`[data-value="${agentData.personality}"]`).click();

  // Select model dropdown
  const modelDropdown = window.locator('[data-testid="model-select"]');
  await modelDropdown.click();
  await window.locator(`[data-value="${agentData.model}"]`).click();

  // Fill description if provided
  if (agentData.description) {
    await window
      .locator('[data-testid="agent-description-input"]')
      .fill(agentData.description);
  }
};

const verifyAgentPersistence = async (
  window: TestWindow,
  agentData: AgentFormData,
) => {
  // Get agents.json file path and verify content
  const userDataPath = await testSuite
    .getElectronApp()
    .evaluate(async ({ app }) => {
      return app.getPath("userData");
    });

  const agentsPath = path.join(userDataPath, "agents.json");
  const agentsContent = await fs.readFile(agentsPath, "utf-8");
  const agentsData = JSON.parse(agentsContent);

  // Verify agent exists in saved data
  const savedAgent = agentsData.agents.find(
    (agent: any) => agent.name === agentData.name,
  );
  expect(savedAgent).toBeDefined();
  expect(savedAgent.role).toBe(agentData.role);
  expect(savedAgent.personality).toBe(agentData.personality);
  expect(savedAgent.model).toBe(agentData.model);
};
```

## Acceptance Criteria

### Functional Requirements

- ✅ Successfully creates agents with valid form data
- ✅ Handles different agent types (analyst, writer, technical)
- ✅ Form state management works correctly (enable/disable save button)
- ✅ Success messages display appropriately
- ✅ Modal closes after successful creation
- ✅ Agent appears in grid after creation
- ✅ Data persists to agents.json file correctly

### Technical Requirements

- ✅ Follow established test patterns from LLM setup tests
- ✅ Use proper async/await patterns for all interactions
- ✅ Include appropriate timeouts and error handling
- ✅ Use accessibility-compliant selectors (data-testid)
- ✅ Verify file system persistence with proper path handling
- ✅ Handle edge cases like special characters and long names

### Integration Requirements

- ✅ Works with setupAgentsTestSuite infrastructure
- ✅ Uses navigation and modal helpers appropriately
- ✅ Integrates with mock data generators
- ✅ Supports clean test isolation between runs
- ✅ Provides clear test descriptions and error messages

## Implementation Guidance

### File Location

- `tests/desktop/features/settings/agents/agent-creation.spec.ts`

### Dependencies to Study

- `/tests/desktop/features/settings/llm-setup/anthropic-configuration-creation.spec.ts`
- `/tests/desktop/features/settings/llm-setup/openai-configuration-creation.spec.ts`
- Existing agent form components for selector patterns

### Selector Strategy

- `[data-testid="create-agent-button"]` - Create new agent button
- `[data-testid="agent-form-modal"]` - Agent form modal
- `[data-testid="agent-name-input"]` - Agent name input field
- `[data-testid="role-select"]` - Role selection dropdown
- `[data-testid="personality-select"]` - Personality selection dropdown
- `[data-testid="model-select"]` - Model selection dropdown
- `[data-testid="agent-description-input"]` - Description text area
- `[data-testid="save-agent-button"]` - Save/create button

## Security Considerations

- Use only test data, no real agent configurations
- File system operations limited to test userData directory
- No network calls or external API interactions
- Validate that test data doesn't leak between test runs

## Performance Requirements

- Each test should complete within 30 seconds
- Total test file should complete within 3-5 minutes
- Focus on functionality verification, not performance benchmarking

## Notes

This test file establishes the foundation for agent creation testing and should serve as a reference pattern for other agent test files. All creation scenarios should be thoroughly covered to ensure reliability of the core functionality.
