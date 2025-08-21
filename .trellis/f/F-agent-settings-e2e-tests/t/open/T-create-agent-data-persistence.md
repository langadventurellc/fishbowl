---
id: T-create-agent-data-persistence
title: Create Agent Data Persistence Tests
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
created: 2025-08-21T00:33:16.044Z
updated: 2025-08-21T00:33:16.044Z
---

# Create Agent Data Persistence Tests

## Context

Create comprehensive end-to-end tests for agent data persistence functionality, covering data storage, retrieval, file system verification, and cross-session data integrity. This test file focuses specifically on ensuring agent data persists correctly across various scenarios.

## Implementation Requirements

### File to Create

**`tests/desktop/features/settings/agents/agent-persistence.spec.ts`**

Follow the established pattern from general settings persistence tests but adapted for agents.json file management and agent-specific data structures.

## Test Scenarios to Implement

### 1. Basic Data Persistence

```typescript
test("persists agent data to agents.json file", async () => {
  const window = testSuite.getWindow();

  // Create test agent
  const mockAgent = createMockAgentData();
  await createTestAgent(window, mockAgent);

  // Verify data is written to file system
  const userDataPath = await testSuite
    .getElectronApp()
    .evaluate(async ({ app }) => {
      return app.getPath("userData");
    });
  const agentsPath = path.join(userDataPath, "agents.json");

  // Verify file exists and contains agent data
  const agentsContent = await fs.readFile(agentsPath, "utf-8");
  const agentsData = JSON.parse(agentsContent);

  expect(agentsData).toHaveProperty("agents");
  expect(Array.isArray(agentsData.agents)).toBe(true);
  expect(agentsData.agents.length).toBe(1);

  const savedAgent = agentsData.agents[0];
  expect(savedAgent.name).toBe(mockAgent.name);
  expect(savedAgent.role).toBe(mockAgent.role);
  expect(savedAgent.personality).toBe(mockAgent.personality);
  expect(savedAgent.model).toBe(mockAgent.model);
  expect(savedAgent.description).toBe(mockAgent.description);
});

test("maintains data structure integrity in agents.json", async () => {
  // Create multiple agents
  // Verify JSON structure follows schema
  // Test required fields are present
  // Verify timestamps and metadata
});
```

### 2. Cross-Session Persistence

```typescript
test("loads agent data after modal close and reopen", async () => {
  const window = testSuite.getWindow();

  // Create test agent
  const mockAgent = createMockAgentData();
  await createTestAgent(window, mockAgent);

  // Close settings modal
  await window.evaluate(() => {
    window.testHelpers!.closeSettingsModal();
  });
  await expect(
    window.locator('[data-testid="settings-modal"]'),
  ).not.toBeVisible();

  // Reopen settings modal and navigate to agents
  await openAgentsSection(window);

  // Verify agent is still displayed
  await waitForAgentsList(window, true);
  const agentCard = window
    .locator('[data-testid="agent-card"]')
    .filter({ hasText: mockAgent.name });
  await expect(agentCard).toBeVisible();

  // Verify agent data integrity
  await verifyAgentCardData(window, agentCard, mockAgent);
});

test("maintains agent data across app restart simulation", async () => {
  // Create agents
  // Simulate app restart by checking file persistence
  // Verify data survives between sessions
});
```

### 3. Multiple Agent Persistence

```typescript
test("persists multiple agents correctly", async () => {
  const window = testSuite.getWindow();

  // Create multiple test agents
  const agents = [
    createMockAnalystAgent(),
    createMockWriterAgent(),
    createMockTechnicalAgent(),
  ];

  for (const agent of agents) {
    await createTestAgent(window, agent);
  }

  // Verify all agents in file system
  const agentsData = await readAgentsFile(testSuite);
  expect(agentsData.agents.length).toBe(3);

  // Verify each agent's data
  for (const expectedAgent of agents) {
    const savedAgent = agentsData.agents.find(
      (a: any) => a.name === expectedAgent.name,
    );
    expect(savedAgent).toBeDefined();
    expect(savedAgent.role).toBe(expectedAgent.role);
    expect(savedAgent.personality).toBe(expectedAgent.personality);
  }

  // Verify all agents display in UI
  await openAgentsSection(window);
  await waitForAgentsList(window, true);
  for (const agent of agents) {
    const agentCard = window
      .locator('[data-testid="agent-card"]')
      .filter({ hasText: agent.name });
    await expect(agentCard).toBeVisible();
  }
});

test("maintains correct agent order in persistence", async () => {
  // Create agents in specific order
  // Verify order is preserved in file and UI
});
```

### 4. Agent Updates and Persistence

```typescript
test("persists agent updates correctly", async () => {
  const window = testSuite.getWindow();

  // Create initial agent
  const originalAgent = createMockAgentData();
  await createTestAgent(window, originalAgent);

  // Edit agent
  await openAgentsSection(window);
  const agentCard = window.locator('[data-testid="agent-card"]').first();
  const editButton = agentCard.locator('[data-testid="edit-agent-button"]');
  await editButton.click();
  await waitForAgentModal(window, true);

  // Update agent data
  const updatedName = "Updated Agent Name";
  await window.locator('[data-testid="agent-name-input"]').fill(updatedName);
  const saveButton = window.locator('[data-testid="save-agent-button"]');
  await saveButton.click();
  await waitForAgentModal(window, false);

  // Verify updated data in file system
  const agentsData = await readAgentsFile(testSuite);
  const updatedAgent = agentsData.agents.find(
    (a: any) => a.name === updatedName,
  );
  expect(updatedAgent).toBeDefined();
  expect(updatedAgent.name).toBe(updatedName);

  // Verify no duplicate entries
  expect(agentsData.agents.length).toBe(1);
});

test("maintains data consistency during concurrent updates", async () => {
  // Test data integrity during rapid updates
  // Verify no data corruption or loss
});
```

### 5. File System Edge Cases

```typescript
test("handles missing agents.json file gracefully", async () => {
  const window = testSuite.getWindow();

  // Ensure no agents.json file exists (should be clean from beforeEach)
  await openAgentsSection(window);

  // Verify empty state is displayed
  await expect(
    window.locator('[data-testid="empty-agents-state"]'),
  ).toBeVisible();

  // Create first agent
  const mockAgent = createMockAgentData();
  await createTestAgent(window, mockAgent);

  // Verify file is created with correct structure
  const agentsData = await readAgentsFile(testSuite);
  expect(agentsData).toHaveProperty("agents");
  expect(agentsData.agents.length).toBe(1);
});

test("handles corrupted agents.json file", async () => {
  // Create corrupted JSON file
  // Verify graceful error handling
  // Test recovery mechanisms
});

test("handles file permission issues", async () => {
  // Test read-only file scenarios
  // Verify appropriate error handling
});
```

### 6. Data Migration and Compatibility

```typescript
test("handles agents.json with missing optional fields", async () => {
  // Create agents.json with minimal data
  // Verify app handles missing optional fields
  // Test backward compatibility
});

test("maintains data format consistency", async () => {
  // Verify timestamps format
  // Test ID generation consistency
  // Verify schema compliance
});
```

### 7. Performance and Large Datasets

```typescript
test("handles large number of agents efficiently", async () => {
  const window = testSuite.getWindow();

  // Create many agents (within reasonable test limits)
  const agentCount = 20;
  const agents = Array.from({ length: agentCount }, (_, i) =>
    createMockAgentData({ name: `Agent ${i + 1}` }),
  );

  for (const agent of agents) {
    await createTestAgent(window, agent);
  }

  // Verify all agents persist correctly
  const agentsData = await readAgentsFile(testSuite);
  expect(agentsData.agents.length).toBe(agentCount);

  // Verify UI can handle the load
  await openAgentsSection(window);
  await waitForAgentsList(window, true);
  const agentCards = window.locator('[data-testid="agent-card"]');
  expect(await agentCards.count()).toBe(agentCount);
});
```

## Technical Implementation

### Test Structure Pattern

```typescript
import { expect, test } from "@playwright/test";
import { readFile, writeFile } from "fs/promises";
import path from "path";
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

test.describe("Feature: Agent Management - Data Persistence", () => {
  const testSuite = setupAgentsTestSuite();

  test.describe("Scenario: Basic Persistence", () => {
    // Test implementations here
  });

  test.describe("Scenario: Cross-Session Data", () => {
    // Test implementations here
  });

  test.describe("Scenario: Multiple Agents", () => {
    // Test implementations here
  });

  test.describe("Scenario: File System Edge Cases", () => {
    // Test implementations here
  });
});
```

### Helper Functions to Implement Within File

```typescript
const readAgentsFile = async (testSuite: any) => {
  const userDataPath = await testSuite
    .getElectronApp()
    .evaluate(async ({ app }) => {
      return app.getPath("userData");
    });
  const agentsPath = path.join(userDataPath, "agents.json");
  const agentsContent = await readFile(agentsPath, "utf-8");
  return JSON.parse(agentsContent);
};

const writeCorruptedAgentsFile = async (testSuite: any) => {
  const userDataPath = await testSuite
    .getElectronApp()
    .evaluate(async ({ app }) => {
      return app.getPath("userData");
    });
  const agentsPath = path.join(userDataPath, "agents.json");
  await writeFile(agentsPath, '{"invalid": json}', "utf-8");
};

const verifyAgentCardData = async (
  window: TestWindow,
  agentCard: any,
  expectedData: AgentFormData,
) => {
  // Verify agent card displays correct data
  await expect(agentCard).toContainText(expectedData.name);
  await expect(agentCard).toContainText(expectedData.role);
  await expect(agentCard).toContainText(expectedData.personality);
  // Add other field verifications as needed
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
  // Small delay for file operations to complete
  await window.waitForTimeout(100);
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
```

## Acceptance Criteria

### Functional Requirements

- ✅ Persists agent data to agents.json with correct structure
- ✅ Maintains data integrity across modal close/reopen
- ✅ Handles multiple agents with correct ordering
- ✅ Persists agent updates and edits correctly
- ✅ Handles missing agents.json file gracefully
- ✅ Provides appropriate error handling for file system issues
- ✅ Supports reasonable numbers of agents efficiently

### Technical Requirements

- ✅ Follow established test patterns from general settings persistence tests
- ✅ Use proper async/await patterns for file operations
- ✅ Include appropriate timeouts for file system operations
- ✅ Use proper path handling for cross-platform compatibility
- ✅ Verify JSON structure and schema compliance
- ✅ Handle edge cases like corrupted files or permissions

### Integration Requirements

- ✅ Works with setupAgentsTestSuite infrastructure
- ✅ Uses navigation and modal helpers appropriately
- ✅ Integrates with mock data generators
- ✅ Supports clean test isolation between runs
- ✅ Provides clear test descriptions and error messages

## Implementation Guidance

### File Location

- `tests/desktop/features/settings/agents/agent-persistence.spec.ts`

### Dependencies to Study

- `/tests/desktop/features/settings/general-settings.spec.ts` (persistence patterns)
- `/tests/desktop/features/settings/roles/roles-creation.spec.ts` (file system verification)
- Existing agent repository patterns in codebase

### File System Verification

- Read and parse agents.json file
- Verify JSON structure matches expected schema
- Test file creation, updates, and error handling
- Ensure proper cleanup between tests

## Security Considerations

- File system operations limited to test userData directory
- Verify no sensitive data is stored in plain text
- Test file permission handling appropriately
- Ensure test data doesn't leak between runs

## Performance Requirements

- Each test should complete within 30 seconds
- File operations should be efficient and reliable
- Support reasonable numbers of agents for testing
- Focus on functionality verification, not performance benchmarking

## Notes

This test file ensures that agent data persistence is reliable and maintains data integrity across all usage scenarios. The tests should thoroughly verify that agent data survives application restarts and various edge cases.
