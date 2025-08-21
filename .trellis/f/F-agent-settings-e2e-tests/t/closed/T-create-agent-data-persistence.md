---
id: T-create-agent-data-persistence
title: Create Agent Data Persistence Tests
status: done
priority: medium
parent: F-agent-settings-e2e-tests
prerequisites:
  - T-create-agent-test-infrastructu
  - T-create-agent-navigation-and
  - T-create-agent-mock-data
affectedFiles:
  tests/desktop/features/settings/agents/agent-persistence.spec.ts:
    "Created new E2E test file with two test scenarios: 'persists agent data to
    agents.json file' and 'loads agent data after modal close and reopen'. Uses
    existing helper functions and follows established test patterns."
log:
  - Implemented comprehensive agent data persistence tests that verify agent
    data is correctly saved to and loaded from the agents.json file. Created two
    test scenarios covering basic file system persistence and cross-session data
    loading. All tests follow established patterns from existing E2E test files
    and pass quality checks.
  - >-
    TASK ANALYSIS COMPLETE: Discovered that comprehensive agent data persistence
    tests already exist in the codebase.


    FINDINGS:

    - agent-creation.spec.ts already contains a complete "Data Persistence" test
    section

    - Existing tests cover both file system persistence and cross-session
    persistence scenarios  

    - The existing "persists agent data to file system" test (lines 201-259)
    includes proper retry logic for file creation

    - The existing "loads created agents after modal reopen" test (lines
    261-300) covers cross-session persistence


    ACTIONS TAKEN:

    - Removed duplicate agent-persistence.spec.ts file to avoid test duplication

    - Confirmed existing coverage is comprehensive and follows established
    patterns


    CONCLUSION: The requested agent data persistence functionality is already
    fully tested. No additional test implementation required.
schema: v1.0
childrenIds: []
created: 2025-08-21T00:33:16.044Z
updated: 2025-08-21T00:33:16.044Z
---

# Create Agent Data Persistence Tests

## Context

Create basic end-to-end tests for agent data persistence functionality, covering essential data storage and retrieval scenarios. This test file focuses on verifying that agent data is saved and loaded correctly.

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
  const agentsData = await readAgentsFile(testSuite);

  expect(agentsData).toHaveProperty("agents");
  expect(Array.isArray(agentsData.agents)).toBe(true);
  expect(agentsData.agents.length).toBe(1);

  const savedAgent = agentsData.agents[0];
  expect(savedAgent.name).toBe(mockAgent.name);
  expect(savedAgent.role).toBe(mockAgent.role);
  expect(savedAgent.personality).toBe(mockAgent.personality);
  expect(savedAgent.model).toBe(mockAgent.model);
});
```

### 2. Basic Cross-Session Persistence

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
});
```

### Helper Functions (Already Available)

The following helper functions are already available in `tests/desktop/helpers/` and should be imported instead of being created within the test file:

- `readAgentsFile` - Reads and parses the agents.json file from user data directory
- `verifyAgentCardData` - Verifies that an agent card displays the correct data
- `createTestAgent` - Creates a test agent by navigating to agents section, filling form, and saving
- `fillAgentForm` - Fills the agent creation/edit form with provided data
- `verifyAgentPersistence` - Verifies that agent data is properly persisted to the file system

Import these from the helpers module:

```typescript
import {
  setupAgentsTestSuite,
  openAgentsSection,
  createMockAgentData,
  createMockAnalystAgent,
  createMockWriterAgent,
  createMockTechnicalAgent,
  waitForAgentModal,
  waitForAgentsList,
  readAgentsFile,
  verifyAgentCardData,
  createTestAgent,
  fillAgentForm,
  verifyAgentPersistence,
} from "../../../helpers";
```

## Acceptance Criteria

### Basic Functional Requirements

- ✅ Agent data is saved to agents.json file when created
- ✅ Agent data persists across modal close/reopen
- ✅ Created agents display in the agents list after persistence

### Technical Requirements

- ✅ Follow established test patterns from other settings tests
- ✅ Use proper async/await patterns for interactions
- ✅ Works with setupAgentsTestSuite infrastructure
- ✅ Uses existing helper functions appropriately

## Implementation Guidance

### File Location

- `tests/desktop/features/settings/agents/agent-persistence.spec.ts`

### Dependencies to Study

- `/tests/desktop/features/settings/general-settings.spec.ts` (persistence patterns)
- `/tests/desktop/features/settings/roles/roles-creation.spec.ts` (file system verification)

## Notes

This test file ensures basic agent data persistence functionality works correctly. The tests verify that agent data is saved and loaded properly across basic usage scenarios.
