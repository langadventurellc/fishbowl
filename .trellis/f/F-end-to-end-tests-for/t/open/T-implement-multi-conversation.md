---
id: T-implement-multi-conversation
title: Implement Multi-Conversation Agent Management Tests
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
created: 2025-08-25T23:44:35.448Z
updated: 2025-08-25T23:44:35.448Z
---

# Task: Implement Multi-Conversation Agent Management Tests

## Context

Create end-to-end tests that verify complex scenarios involving multiple conversations and agents, ensuring that conversation switching correctly updates agent displays and that agents can be reused across different conversations.

## Reference Patterns

- Multi-conversation patterns from conversation creation tests
- Complex test data setup from agent settings tests
- Create conversation test helpers `tests/desktop/helpers/conversations/createConversation.ts`
- Sidebar conversation selection patterns
- Database verification for complex relationships

## Key UI Components to Interact With

When developing this task, you should examine these UI components to understand exactly how they work instead of making assumptions:

### Conversation Management Components

- **SidebarContainerDisplay** (`apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx`)
  - Main sidebar container with conversation switching functionality
- **ConversationListDisplay** (`apps/desktop/src/components/sidebar/ConversationListDisplay.tsx`)
  - List of conversations in the sidebar
- **ConversationItemDisplay** (`apps/desktop/src/components/sidebar/ConversationItemDisplay.tsx`)
  - Individual conversation items that can be clicked to switch
- **NewConversationButton** (`apps/desktop/src/components/conversations/NewConversationButton.tsx`)
  - Button to create multiple conversations

### Agent Display Components

- **AgentLabelsContainerDisplay** (`apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`)
  - Shows agents for the currently selected conversation
- **AddAgentToConversationModal** (`apps/desktop/src/components/modals/AddAgentToConversationModal.tsx`)
  - Modal that should filter agents based on current conversation
- **AgentPill** (`apps/desktop/src/components/chat/AgentPill.tsx`)
  - Individual agent pills that should update when switching conversations

### Layout Components

- **ConversationLayoutDisplay** (`apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx`)
  - Main layout that handles conversation state
- **MainContentPanelDisplay** (`apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`)
  - Content panel that updates based on conversation selection

### UI Components

- **Select** (`apps/desktop/src/components/ui/select.tsx`)
  - Dropdown in modal that should show filtered agents
- **Dialog** (`apps/desktop/src/components/ui/dialog.tsx`)
  - Modal components for agent selection

## Test Coverage Requirements

This test file implements **Acceptance Criteria AC3** from the feature specification:

### AC3: Multi-Conversation Agent Management

**Given** multiple conversations and agents exist  
**When** user manages agents across different conversations:

1. Create conversation A and add agent X
2. Create conversation B and add agent X and Y
3. Create conversation C and add only agent Y
4. Switch between conversations in sidebar

**Then:**

- Each conversation displays only its associated agents
- Agent selection modal correctly filters already-added agents per conversation
- Database maintains separate conversation_agents records
- UI updates immediately when switching conversations

## Implementation Requirements

### 1. Create Multi-Conversation Test File

**File Path**: `tests/desktop/features/conversation-agents/conversation-agent-multi-conversation.spec.ts`

### 2. Test Structure

```typescript
import { expect, test } from "@playwright/test";
import {
  // Setup helpers
  setupConversationAgentTestSuite,
  createMultipleConversationsWithAgents,

  // UI helpers
  clickAddAgentButton,
  waitForAddAgentModal,
  selectAgentInModal,
  verifyAgentPillExists,

  // Database helpers
  queryConversationAgents,

  // Conversation helpers
  selectConversationInSidebar,

  // Agent helpers
  createMockAgentData,
  fillAgentForm,
} from "../../../helpers";

test.describe("Feature: Multi-Conversation Agent Management", () => {
  const testSuite = setupConversationAgentTestSuite();

  // Test scenarios
});
```

### 3. Test Scenarios to Implement

#### Scenario 1: Agent Reuse Across Multiple Conversations

- **Setup**: Create 2 conversations and 2 agents
- **Action**: Add agent A to conversation 1, then add agent A to conversation 2
- **Verification**:
  - Database contains separate conversation_agents records for same agent
  - Each conversation displays the shared agent correctly
  - Agent filtering works correctly in each conversation's modal

#### Scenario 2: Conversation-Specific Agent Display

- **Setup**: Create complex scenario with 3 conversations and 3 agents
  - Conversation A: Agent X
  - Conversation B: Agent X, Agent Y
  - Conversation C: Agent Y, Agent Z
- **Action**: Switch between conversations in sidebar
- **Verification**:
  - Each conversation displays only its specific agents
  - Agent pills update immediately when conversation changes
  - No cross-contamination of agent displays

#### Scenario 3: Agent Selection Modal Filtering Per Conversation

- **Setup**: Same complex scenario as Scenario 2
- **Action**: Open Add Agent modal in each conversation
- **Verification**:
  - Conversation A modal excludes Agent X (already added)
  - Conversation B modal excludes Agent X and Y (already added)
  - Conversation C modal excludes Agent Y and Z (already added)
  - Available agents list is different for each conversation

#### Scenario 4: Database Integrity Across Multiple Assignments

- **Setup**: Complex multi-conversation, multi-agent scenario
- **Action**: Add various agents to various conversations
- **Verification**:
  - Database contains correct number of conversation_agents records
  - Each record has correct conversation_id and agent_id pairing
  - No duplicate assignments (unique constraint respected)
  - Foreign key relationships maintained correctly

#### Scenario 5: Conversation Deletion Impact on Agent Assignments

- **Setup**: Create conversations with agent assignments
- **Action**: Delete one conversation
- **Verification**:
  - Conversation_agents records cascade-delete correctly
  - Other conversations' agent assignments unaffected
  - No orphaned records remain in database
  - UI updates correctly after deletion

### 4. Implementation Details

#### Complex Setup Pattern

```typescript
// Setup multiple conversations with different agent combinations
const testConfig = [
  { conversationTitle: "Analysis Chat", agentNames: ["Data Analyst"] },
  {
    conversationTitle: "Tech Discussion",
    agentNames: ["Data Analyst", "Code Reviewer"],
  },
  {
    conversationTitle: "Writing Session",
    agentNames: ["Code Reviewer", "Content Writer"],
  },
];

const { conversations, agents, assignments } =
  await createMultipleConversationsWithAgents(window, testConfig);
```

#### Conversation Switching Verification

```typescript
// Switch to specific conversation and verify agent display
await selectConversationInSidebar(window, conversations[0].title);
await verifyAgentPillExists(window, agents[0].name);

// Verify other conversation's agents are not shown
const otherAgentPill = window.locator(`[data-agent-name="${agents[1].name}"]`);
await expect(otherAgentPill).not.toBeVisible();
```

#### Database Relationship Verification

```typescript
// Verify complex database relationships
const allConversationAgents = await queryConversationAgents(electronApp);
expect(allConversationAgents).toHaveLength(5); // Total assignments across all conversations

// Verify specific conversation has correct agents
const conv1Agents = await queryConversationAgents(
  electronApp,
  conversations[0].id,
);
expect(conv1Agents).toHaveLength(1);
expect(conv1Agents[0].agent_id).toBe(agents[0].id);
```

#### Modal Filtering Verification

```typescript
// Verify modal filtering per conversation
await selectConversationInSidebar(window, conversations[1].title); // Has 2 agents already
await clickAddAgentButton(window);
await waitForAddAgentModal(window, true);

// Should only show agents not already in this conversation
const availableOptions = window.locator('[role="option"]');
const optionCount = await availableOptions.count();
expect(optionCount).toBe(1); // Only 1 agent not yet added to this conversation
```

## Technical Approach

### Complex Data Management

- Use helper functions to create predictable test data
- Maintain clear mapping between conversations, agents, and assignments
- Verify data integrity at multiple levels (UI, database, relationships)

### UI State Verification

- Test conversation switching with comprehensive state checking
- Verify immediate UI updates without delays
- Check both positive (what should be shown) and negative (what shouldn't) cases

### Performance Considerations

- Minimize setup time while maintaining test isolation
- Use efficient database queries for verification
- Optimize conversation switching operations

## Acceptance Criteria

### Functional Requirements

- ✅ Agents can be successfully reused across multiple conversations
- ✅ Each conversation displays only its associated agents
- ✅ Conversation switching immediately updates agent display
- ✅ Agent selection modal correctly filters by conversation
- ✅ Database maintains accurate conversation-agent relationships
- ✅ Conversation deletion properly cleans up agent assignments

### Data Integrity Requirements

- ✅ No duplicate agent assignments within same conversation
- ✅ Foreign key relationships maintained across all operations
- ✅ Cascade deletion works correctly for conversation cleanup
- ✅ Database state matches UI state at all times

### Performance Requirements

- ✅ Conversation switching happens smoothly (< 1 second)
- ✅ Agent modal filtering is responsive
- ✅ Complex scenarios complete within reasonable time (< 45 seconds)
- ✅ Database operations are efficient with proper indexing

## Dependencies

- All helper functions from prerequisite tasks
- Conversation selection functionality in sidebar
- AgentLabelsContainerDisplay conversation-aware behavior
- AddAgentToConversationModal filtering logic
- Database cascade deletion setup

## Integration Points

- Relies on conversation creation and management functionality
- Integrates with agent configuration from settings
- Uses database relationship management
- Connects with UI state management for conversation switching
