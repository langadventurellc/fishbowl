---
id: T-create-ui-interaction-helper
title: Create UI Interaction Helper Functions for Conversation Agent Testing
status: open
priority: high
parent: F-end-to-end-tests-for
prerequisites:
  - T-create-database-helper
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T23:42:00.725Z
updated: 2025-08-25T23:42:00.725Z
---

# Task: Create UI Interaction Helper Functions for Conversation Agent Testing

## Context

The conversation agent end-to-end tests need UI interaction helpers to automate user interactions with the AgentLabelsContainerDisplay component and AddAgentToConversationModal. These helpers should follow existing patterns from agent settings tests and modal interaction patterns.

## Reference Patterns

- Modal interaction patterns from `tests/desktop/helpers/settings/waitForAgentModal.ts`
- UI waiting patterns from `tests/desktop/helpers/settings/waitForAgentsList.ts`
- Button clicking patterns from existing agent settings test helpers
- Component verification patterns from agent creation tests

## Key UI Components to Interact With

When developing this task, you should examine these UI components to understand exactly how they work instead of making assumptions:

### Primary Components

- **AgentLabelsContainerDisplay** (`apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`)
  - Add Agent button with class `.add-agent-button`
  - Agent pills display area
- **AddAgentToConversationModal** (`apps/desktop/src/components/modals/AddAgentToConversationModal.tsx`)
  - Dialog container with role="dialog"
  - Agent selection dropdown
  - Add/Cancel buttons

### Secondary Components

- **AgentPill** (`apps/desktop/src/components/chat/AgentPill.tsx`)
  - Individual agent display components that appear in the labels container
- **Dialog** (`apps/desktop/src/components/ui/dialog.tsx`)
  - Base dialog component used by the modal
- **Select** (`apps/desktop/src/components/ui/select.tsx`)
  - Dropdown component for agent selection
- **Button** (`apps/desktop/src/components/ui/button.tsx`)
  - Button components used in modal actions

## Implementation Requirements

### 1. Create conversationAgentUiHelpers.ts

**File Path**: `tests/desktop/helpers/conversationAgentUiHelpers.ts`

**Functions to Implement**:

```typescript
// Click the Add Agent button in AgentLabelsContainerDisplay
export const clickAddAgentButton = async (window: TestWindow): Promise<void>

// Wait for Add Agent Modal to appear/disappear
export const waitForAddAgentModal = async (
  window: TestWindow,
  shouldBeVisible: boolean
): Promise<void>

// Select agent from dropdown in modal
export const selectAgentInModal = async (
  window: TestWindow,
  agentName: string
): Promise<void>

// Verify agent pill exists in AgentLabelsContainerDisplay
export const verifyAgentPillExists = async (
  window: TestWindow,
  agentName: string
): Promise<void>

// Check if Add Agent button is visible and enabled
export const checkAddAgentButtonState = async (
  window: TestWindow
): Promise<{ visible: boolean; enabled: boolean }>

// Wait for agent to appear in conversation display
export const waitForAgentInConversationDisplay = async (
  window: TestWindow,
  agentName: string,
  timeout: number = 5000
): Promise<void>
```

### 2. Implementation Details

#### clickAddAgentButton Function

- Locate Add Agent button using `.add-agent-button` class
- Verify button is visible and enabled before clicking
- Handle cases where button might be disabled (no conversation selected)
- Include error messaging for debugging

#### waitForAddAgentModal Function

- Use dialog role selector to detect modal
- Support both waiting for modal to appear and disappear
- Include timeout handling (default 5000ms)
- Pattern similar to `waitForAgentModal` from agent settings tests

#### selectAgentInModal Function

- Click agent selection dropdown
- Wait for dropdown options to appear
- Select specific agent by name text matching
- Verify selection was successful
- Handle "No available agents" state

#### verifyAgentPillExists Function

- Look for agent pill components in display area
- Match by agent name text content
- Verify pill is visible and properly rendered
- Support partial name matching for generated agent names

#### checkAddAgentButtonState Function

- Return visibility and enabled state of Add Agent button
- Use for asserting button state based on conversation selection
- Helper for testing UI state management rules

#### waitForAgentInConversationDisplay Function

- Wait for agent pill to appear in conversation labels area
- Use polling pattern with configurable timeout
- Verify agent is properly displayed after addition

### 3. Export Helper Functions

**File Path**: `tests/desktop/helpers/index.ts`

**Addition**:

```typescript
export * from "./conversationAgentUiHelpers";
```

## Technical Approach

### UI Element Detection

- Use robust selectors that won't break with minor UI changes
- Prefer data-testid attributes where available
- Fall back to role-based selectors for accessibility
- Include text-based matching for user-facing elements

### Error Handling

- Provide descriptive error messages for debugging
- Handle timeout scenarios gracefully
- Include element state information in error messages
- Support retry logic for flaky UI interactions

### Consistency with Existing Patterns

- Follow established patterns from agent settings helpers
- Use same timeout values and polling intervals
- Match naming conventions from existing helpers
- Maintain TypeScript type consistency

## Acceptance Criteria

### Functional Requirements

- ✅ clickAddAgentButton successfully clicks Add Agent button when enabled
- ✅ waitForAddAgentModal waits for modal visibility state changes
- ✅ selectAgentInModal selects agents from dropdown correctly
- ✅ verifyAgentPillExists confirms agent pills display properly
- ✅ checkAddAgentButtonState returns accurate button state information
- ✅ waitForAgentInConversationDisplay waits for agent to appear in UI

### Integration Requirements

- ✅ Functions work with existing TestWindow infrastructure
- ✅ Error handling provides useful debugging information
- ✅ Functions handle edge cases (no agents, disabled states)
- ✅ UI interactions are reliable and don't cause flaky tests

### Quality Requirements

- ✅ Functions use robust element selectors
- ✅ Timeout logic prevents test hangs
- ✅ Functions follow existing helper patterns
- ✅ TypeScript provides proper type safety

## Dependencies

- TestWindow type from existing test infrastructure
- AgentLabelsContainerDisplay component implementation
- AddAgentToConversationModal component implementation
- Existing modal interaction patterns from settings tests

## Testing Integration

These helpers will be used by:

- Main conversation agent creation tests
- UI state management tests
- Multi-conversation agent tests
- Error state and prerequisite tests
