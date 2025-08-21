---
id: F-agent-settings-e2e-tests
title: Agent Settings E2E Tests
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
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
