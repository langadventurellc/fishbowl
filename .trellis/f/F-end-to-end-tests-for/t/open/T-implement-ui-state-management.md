---
id: T-implement-ui-state-management
title: Implement UI State Management Tests for Conversation Agents
status: open
priority: medium
parent: F-end-to-end-tests-for
prerequisites:
  - T-create-database-helper
  - T-create-ui-interaction-helper
  - T-create-test-setup-helper
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T23:43:57.924Z
updated: 2025-08-25T23:43:57.924Z
---

# Task: Implement UI State Management Tests for Conversation Agents

## Context

Create end-to-end tests that verify UI state management rules for conversation agents, focusing on Add Agent button behavior, modal states, and proper UI feedback under different conditions.

## Reference Patterns

- Button state testing from agent creation tests (`agent-creation.spec.ts`)
- Modal state management from settings tests
- Create conversation test helpers `tests/desktop/helpers/conversations/createConversation.ts`
- UI state verification patterns from existing test suites
- Error state testing from LLM configuration tests

## Key UI Components to Interact With

When developing this task, you should examine these UI components to understand exactly how they work instead of making assumptions:

### Primary State Management Components

- **AgentLabelsContainerDisplay** (`apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`)
  - Add Agent button that changes state based on conditions
  - Container that shows/hides agents based on conversation selection
- **AddAgentToConversationModal** (`apps/desktop/src/components/modals/AddAgentToConversationModal.tsx`)
  - Modal that displays different states (loading, empty, populated)
  - Shows "No available agents" message when appropriate
- **NewConversationButton** (`apps/desktop/src/components/conversations/NewConversationButton.tsx`)
  - Button that affects conversation selection state

### Settings Components (for prerequisites)

- **LlmSetupSection** (`apps/desktop/src/components/settings/llm-setup/LlmSetupSection.tsx`)
  - LLM provider section that affects agent button availability
- **EmptyLlmState** (`apps/desktop/src/components/settings/llm-setup/EmptyLlmState.tsx`)
  - Empty state shown when no LLM providers configured
- **AgentsSection** (`apps/desktop/src/components/settings/agents/AgentsSection.tsx`)
  - Agent management section that affects available agents
- **EmptyLibraryState** (`apps/desktop/src/components/settings/agents/EmptyLibraryState.tsx`)
  - Empty state shown when no agents configured

### UI State Components

- **Button** (`apps/desktop/src/components/ui/button.tsx`)
  - Base button component with disabled/enabled states
- **Dialog** (`apps/desktop/src/components/ui/dialog.tsx`)
  - Modal component that handles open/closed states
- **Select** (`apps/desktop/src/components/ui/select.tsx`)
  - Dropdown that can show empty states and disabled options

### Layout Components

- **ConversationLayoutDisplay** (`apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx`)
  - Layout that manages conversation selection state
- **SidebarContainerDisplay** (`apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx`)
  - Sidebar that affects conversation selection state

## Test Coverage Requirements

This test file implements **Acceptance Criteria AC2 and AC5** from the feature specification:

### AC2: UI State Management Rules

- Add Agent button is only visible when conversation is selected
- Add Agent button is disabled (or isn't visible) when no conversation is selected
- Modal shows "No available agents" (see `apps/desktop/src/components/modals/AddAgentToConversationModal.tsx` for actual text) when no agents are configured
- Modal excludes agents already added to current conversation
- Agent pills display correctly in AgentLabelsContainerDisplay

### AC5: Prerequisites and Error States

- Cannot add agents without configured LLM provider (prerequisite)
- Cannot add agents without created agents in settings (prerequisite)
- Cannot add agents without created conversation (prerequisite)
- Modal gracefully handles empty agent list state
- Error states display appropriate user messaging

## Implementation Requirements

### 1. Create UI State Test File

**File Path**: `tests/desktop/features/conversation-agents/conversation-agent-ui-states.spec.ts`

### 2. Test Structure

```typescript
import { expect, test } from "@playwright/test";
import {
  // Setup helpers
  setupConversationAgentTestSuite,
  setupConversationAgentTest,

  // UI helpers
  checkAddAgentButtonState,
  clickAddAgentButton,
  waitForAddAgentModal,
  selectAgentInModal,

  // Settings helpers
  openAgentsSection,
  createLlmConfigForAgentTests,
  fillAgentForm,
  createMockAgentData,
} from "../../../helpers";

test.describe("Feature: Conversation Agent UI State Management", () => {
  const testSuite = setupConversationAgentTestSuite();

  // Test scenarios
});
```

### 3. Test Scenarios to Implement

#### Scenario 1: Add Agent Button Visibility Rules

- **Given**: Application loaded with no conversation selected
- **When**: User observes Add Agent button state
- **Then**: Button is not visible or disabled
- **And When**: User creates/selects conversation
- **Then**: Button becomes visible and enabled

#### Scenario 2: Add Agent Button State Based on Prerequisites

- **Given**: Various prerequisite completion states
- **When**: User attempts to access Add Agent functionality
- **Then**: Button state reflects prerequisite completion
- **Cases to Test**:
  - No LLM config: Button disabled/invisible
  - No agents configured: Button enabled but modal shows empty state
  - All prerequisites met: Button fully functional

#### Scenario 3: Modal Empty State Handling

- **Given**: Conversation exists but no agents configured in settings
- **When**: User clicks Add Agent button
- **Then**: Modal opens with "No available agents" message
- **And**: Add button in modal is disabled
- **And**: Appropriate user guidance displayed

#### Scenario 4: Modal Agent Filtering

- **Given**: Multiple agents configured and some already added to conversation
- **When**: User opens Add Agent modal
- **Then**: Modal excludes agents already in current conversation
- **And**: Only available agents shown in dropdown
- **And**: Dropdown shows appropriate agents for selection

#### Scenario 5: Loading and Feedback States

- **Given**: User initiates agent addition
- **When**: Operation is in progress
- **Then**: UI shows appropriate loading indicators
- **And**: Buttons show loading states (disabled with spinner)
- **And**: User receives clear feedback about operation status

#### Scenario 6: Error State Display and Recovery

- **Given**: Agent addition fails due to system error
- **When**: User attempts to add agent
- **Then**: Error message displays clearly
- **And**: User can retry operation
- **And**: Error state doesn't prevent further attempts

### 4. Implementation Details

#### Button State Verification

```typescript
// Test Add Agent button state changes
const { visible, enabled } = await checkAddAgentButtonState(window);
expect(visible).toBe(false); // When no conversation selected

// After conversation creation
await createNewConversation(window);
const { visible: visibleAfter, enabled: enabledAfter } =
  await checkAddAgentButtonState(window);
expect(visibleAfter).toBe(true);
expect(enabledAfter).toBe(true);
```

#### Modal State Testing

```typescript
// Test modal empty state
await clickAddAgentButton(window);
await waitForAddAgentModal(window, true);

// Verify empty state message
const emptyMessage = window.locator("text=No available agents");
await expect(emptyMessage).toBeVisible();

// Verify add button disabled
const addButton = window.locator("button").filter({ hasText: "Add Agent" });
await expect(addButton).toBeDisabled();
```

#### Error State Verification

```typescript
// Test prerequisite error states
const button = await checkAddAgentButtonState(window);
expect(button.enabled).toBe(false);

// Test error messaging
const errorIndicator = window.locator("[role='alert']");
await expect(errorIndicator).toContainText("Configure LLM provider first");
```

## Technical Approach

### State Testing Strategy

- Test UI states in isolation from business logic
- Use comprehensive state verification helpers
- Cover all possible prerequisite combinations
- Test state transitions thoroughly

### Edge Case Coverage

- Test boundary conditions (no data, single item, many items)
- Test error recovery scenarios
- Test concurrent user interactions
- Test state persistence across UI navigation

### Accessibility Testing

- Verify ARIA labels and roles
- Test keyboard navigation
- Check screen reader compatibility
- Validate focus management

## Acceptance Criteria

### Functional Requirements

- ✅ Add Agent button visibility rules work correctly
- ✅ Modal empty state displays appropriate messaging
- ✅ Agent filtering excludes already-added agents correctly
- ✅ Loading states provide clear user feedback
- ✅ Error states display helpful messaging with recovery options
- ✅ All prerequisite validations work as expected

### UI/UX Requirements

- ✅ Button states are visually clear and accessible
- ✅ Modal interactions are smooth and responsive
- ✅ Error messages are helpful and actionable
- ✅ Loading indicators don't block user understanding
- ✅ State transitions happen at appropriate speeds

### Quality Requirements

- ✅ Tests are reliable and handle UI timing issues
- ✅ State verification is comprehensive and accurate
- ✅ Error scenarios are properly isolated and testable
- ✅ Tests serve as documentation of UI behavior expectations

## Dependencies

- All helper functions from prerequisite tasks
- AgentLabelsContainerDisplay component implementation
- AddAgentToConversationModal component implementation
- Settings integration for LLM and agent configuration
- Error handling and user feedback systems

## Integration Points

- Connects with prerequisite setup (LLM config, agent creation)
- Integrates with conversation creation functionality
- Uses database state for verification
- Validates against modal and button component implementations
