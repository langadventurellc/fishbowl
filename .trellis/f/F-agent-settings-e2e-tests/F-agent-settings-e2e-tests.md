---
id: F-agent-settings-e2e-tests
title: Agent Settings E2E Tests
status: done
priority: medium
prerequisites: []
affectedFiles:
  tests/desktop/features/settings/agents/setupAgentsTestSuite.ts:
    Core test suite setup following LLM patterns with Electron app management,
    modal cleanup, and agents.json cleanup
  tests/desktop/helpers/settings/cleanupAgentsStorage.ts: Utility for robust
    agents.json file deletion with retry logic and error handling
  tests/desktop/features/settings/agents/index.ts: Barrel exports for agent test helper functions and infrastructure
  tests/desktop/features/settings/agents/infrastructure-test.spec.ts: Verification test to ensure infrastructure works correctly
  tests/desktop/helpers/settings/openAgentsSection.ts:
    Created new helper function
    for navigating to agents section within settings modal. Handles modal
    opening/closing, navigation to agents tab, and waits for section to load
    completely.
  tests/desktop/helpers/settings/waitForAgentModal.ts: Created helper functions
    for agent form modal interactions including waitForAgentModal for
    create/edit modals, waitForAgentModalToClose for modal dismissal, and
    waitForAgentDeleteDialog for delete confirmations.; Updated modal selectors
    to use CSS class instead of data-testid for proper modal detection
  tests/desktop/helpers/settings/waitForAgentsList.ts: Created helper functions
    for agent list state management including waitForAgentsList for
    populated/empty states, waitForAgentsEmptyState for empty state
    verification, and waitForAgent for specific agent lookup by name.; Updated
    agent card detection to use role='article' selector and improved error
    handling for agent list verification
  tests/desktop/package.json: Added @fishbowl-ai/ui-shared dependency for AgentFormData types
  tests/desktop/helpers/settings/MockAgentData.ts: Created mock agent data interface following established patterns
  tests/desktop/helpers/settings/createMockAgentData.ts: Main mock agent data generator with randomized IDs and realistic defaults
  tests/desktop/helpers/settings/createInvalidAgentData.ts: Invalid agent data generator for testing validation scenarios
  tests/desktop/helpers/settings/createDuplicateNameAgentData.ts: Generator for testing duplicate name validation
  tests/desktop/helpers/settings/createLongTextAgentData.ts: Generator for testing character length limits
  tests/desktop/helpers/settings/createSpecialCharAgentData.ts: Generator for testing special character validation
  tests/desktop/helpers/settings/createMockAnalystAgent.ts: Specialized analyst agent generator
  tests/desktop/helpers/settings/createMockWriterAgent.ts: Specialized writer agent generator
  tests/desktop/helpers/settings/createMockTechnicalAgent.ts: Specialized technical agent generator
  tests/desktop/helpers/settings/createMinimalAgentData.ts: Minimal agent data with only required fields
  tests/desktop/features/settings/agents/agent-creation.spec.ts:
    Created comprehensive end-to-end test suite for agent creation with 8 test
    scenarios achieving 100% pass rate
  tests/desktop/helpers/settings/createLlmConfigForAgentTests.ts:
    Created helper function to set up LLM configuration required for agent
    creation tests
  tests/desktop/helpers/index.ts: Added exports for agent test helpers including
    setupAgentsTestSuite, openAgentsSection, createMockAgent functions, and wait
    helpers
  tests/desktop/features/settings/agents/agent-persistence.spec.ts:
    "Created new E2E test file with two test scenarios: 'persists agent data to
    agents.json file' and 'loads agent data after modal close and reopen'. Uses
    existing helper functions and follows established test patterns."
  tests/desktop/features/settings/agents/agent-deletion.spec.ts:
    New comprehensive E2E test file for agent deletion functionality with 12
    test scenarios covering confirmation dialogs, successful deletion,
    cancellation, multiple agents, empty states, and persistence testing.
    Includes 3 helper functions for verification and confirmation operations.
  tests/desktop/features/settings/agents/agent-editing.spec.ts:
    Created comprehensive E2E test suite for agent editing functionality with
    scenarios for modal opening, data updates, validation, and cancellation
    handling; Fixed selector issues - corrected edit button selector from
    data-testid to aria-label pattern, updated save/cancel button selectors to
    use actual text content instead of non-existent test-ids
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-create-agent-creation-tests
  - T-create-agent-data-persistence
  - T-create-agent-deletion-tests
  - T-create-agent-editing-tests
  - T-create-agent-mock-data
  - T-create-agent-navigation-and
  - T-create-agent-test-infrastructu
created: 2025-08-21T00:25:56.997Z
updated: 2025-08-21T00:25:56.997Z
---

# Agent Settings End-to-End Tests

## Purpose

Create comprehensive desktop end-to-end tests for the agent section of the settings modal, covering basic CRUD functionality, form validation, data persistence, and user interaction flows.

## Scope

Test the core functionality of the agents settings section including:

- Agent creation, editing, and deletion
- Form validation and error handling
- Modal interactions and navigation
- Data persistence across sessions
- Empty state handling
- Grid display and interaction patterns

## Key Components to Test

- **AgentsSection**: Main component with modal state management
- **LibraryTab**: Agent grid display and management interface
- **AgentFormModal**: Create/edit agent form with validation
- **AgentCard**: Individual agent display and action buttons
- **ConfirmationDialog**: Delete confirmation workflow

## Test File Structure

Following the existing pattern from LLM setup tests, split into focused test files:

### Core Test Files

1. **agent-creation.spec.ts** - Agent creation functionality
   - Creating new agents with valid data
   - Form field validation (name, role, personality, model)
   - Success messages and modal closure
   - Data persistence verification

2. **agent-editing.spec.ts** - Agent modification functionality
   - Opening edit modal from agent cards
   - Updating agent properties
   - Validation during editing
   - Changes persistence

3. **agent-deletion.spec.ts** - Agent removal functionality
   - Delete button interaction
   - Confirmation dialog workflow
   - Successful deletion and UI updates
   - Data removal verification

4. **agent-validation.spec.ts** - Form validation testing
   - Required field validation
   - Name uniqueness validation
   - Invalid data handling
   - Error message display

5. **agent-persistence.spec.ts** - Data persistence testing
   - Save and reload agents across sessions
   - Settings modal close/reopen with data intact
   - File system data verification

6. **agent-empty-state.spec.ts** - Empty state testing
   - Initial empty state display
   - First agent creation flow
   - Empty state after all agents deleted

### Helper Infrastructure

1. **index.ts** - Helper function exports and type definitions
2. **setupAgentsTestSuite.ts** - Test suite setup with cleanup
3. **cleanupAgentsStorage.ts** - Agent data cleanup utility
4. **createMockAgentData.ts** - Mock agent data generators
5. **waitForAgentModal.ts** - Modal interaction helpers
6. **waitForAgentsList.ts** - Agent grid waiting utilities
7. **openAgentsSection.ts** - Navigation helpers

## Test Environment Setup

- **beforeAll**: Create single Electron app instance (like general settings)
- **beforeEach**: Delete agents.json from userData directory for clean state
- **afterEach**: Clean up agents.json and close modal if open
- **afterAll**: Close Electron app

## Data Cleanup Pattern

Following the user's guidance, implement data reset similar to general settings:

- Delete `agents.json` file from userData directory between tests
- No need for separate Electron app creation per test (unlike roles/personalities)
- Use standard beforeAll/beforeEach pattern like other settings tests

## Key Testing Scenarios

### Agent Creation

- Valid agent creation with all required fields
- Name validation (required, uniqueness)
- Role and personality selection
- Model configuration
- Success state and persistence

### Agent Editing

- Open edit modal from agent card
- Modify agent properties
- Validation during edit
- Save changes and verify updates
- Cancel edit without saving

### Agent Deletion

- Delete button triggers confirmation
- Confirmation dialog display and interaction
- Cancel deletion (no changes)
- Confirm deletion (agent removed)
- Grid updates after deletion

### Form Validation

- Empty name field validation
- Duplicate name validation
- Required field enforcement
- Error message display and clearing
- Form state management

### Data Persistence

- Agents persist after modal close/reopen
- Agents persist after app restart simulation
- File system verification (agents.json content)
- Load default agents when file missing

### Empty State

- Empty state display when no agents exist
- Create first agent workflow
- Transition from empty to populated state
- Return to empty state after deleting all agents

## Acceptance Criteria

### Functional Requirements

- ✅ Create agents with valid form data
- ✅ Edit existing agents and save changes
- ✅ Delete agents with confirmation workflow
- ✅ Validate form fields and display errors
- ✅ Persist agent data across sessions
- ✅ Handle empty state appropriately
- ✅ Display agents in responsive grid layout

### Technical Requirements

- ✅ Tests use single Electron app instance per suite
- ✅ Clean data state between tests (agents.json cleanup)
- ✅ Proper async/await patterns for all interactions
- ✅ Accessibility-compliant test selectors
- ✅ Error handling and edge case coverage
- ✅ No performance testing (explicitly excluded)

### Test Organization

- ✅ Split into logical, focused test files (max ~200 lines each)
- ✅ Shared helper functions for common operations
- ✅ Clear test descriptions and scenarios
- ✅ Proper beforeAll/beforeEach/afterEach setup
- ✅ Index.ts for helper exports

### Data Management

- ✅ Delete agents.json between tests for isolation
- ✅ Verify file system state in persistence tests
- ✅ Handle missing/corrupt data files gracefully
- ✅ Test default agents loading behavior

## Implementation Guidance

### Test Structure Pattern

Follow the established pattern from LLM setup tests:

```typescript
import { expect, test } from "@playwright/test";
import {
  setupAgentsTestSuite,
  openAgentsSection,
  createMockAgentData,
  waitForAgentModal,
  waitForAgentsList,
} from "./index";

test.describe("Feature: Agent Management - Creation", () => {
  const testSuite = setupAgentsTestSuite();

  test("creates agent successfully", async () => {
    const window = testSuite.getWindow();
    await openAgentsSection(window);
    // Test implementation...
  });
});
```

### Selector Strategy

Use data-testid attributes for reliable element selection:

- `[data-testid="agents-section"]`
- `[data-testid="create-agent-button"]`
- `[data-testid="agent-form-modal"]`
- `[data-testid="agent-card"]`
- `[data-testid="delete-agent-button"]`

### Data Cleanup Implementation

```typescript
// beforeEach cleanup pattern
const userDataPath = await electronApp.evaluate(async ({ app }) => {
  return app.getPath("userData");
});
const agentsPath = path.join(userDataPath, "agents.json");

try {
  await fs.unlink(agentsPath);
} catch {
  // File might not exist, that's fine
}
```

### Helper Function Patterns

- **Navigation**: `openAgentsSection(window)`
- **Data Creation**: `createMockAgentData()`, `createInvalidAgentData()`
- **UI Waiting**: `waitForAgentModal(window)`, `waitForAgentsList(window)`
- **Cleanup**: `cleanupAgentsStorage(agentsPath)`

## Security Considerations

- Tests use mock data only, no real API keys or sensitive information
- File system operations are limited to test userData directory
- No network calls required for these tests
- Form validation includes XSS prevention verification

## Performance Requirements

- Each test should complete within 30 seconds
- Total test suite should complete within 5 minutes
- No performance benchmarking (explicitly excluded per requirements)
- Focus on functionality verification only

## Testing Requirements

- **Browser Compatibility**: Electron renderer testing only
- **Platform Testing**: Desktop app testing only
- **Accessibility**: Test screen reader announcements and keyboard navigation
- **Responsiveness**: Test grid layout adapts to different window sizes

This feature ensures comprehensive coverage of the agent settings functionality while following established testing patterns and maintaining clean, maintainable test code.
