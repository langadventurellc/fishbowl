---
id: F-end-to-end-tests-for
title: End-to-End Tests for Conversation Agent Creation
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  tests/desktop/helpers/database/queryConversationAgents.ts: Database helper
    function to query conversation_agents table with optional conversation ID
    filtering
  tests/desktop/helpers/database/waitForConversationAgentInDb.ts:
    Database helper function to wait for conversation agent records with
    configurable timeout and polling
  tests/desktop/helpers/database/ConversationAgentDbRow.ts: TypeScript interface
    defining the structure of conversation_agents database rows
  tests/desktop/helpers/database/index.ts: Updated exports to include new
    conversation agent helper functions and interface
  tests/desktop/helpers/conversationAgentUiHelpers.ts: "Created comprehensive UI
    interaction helpers with 11 functions: clickAddAgentButton,
    waitForAddAgentModal, selectAgentInModal, verifyAgentPillExists,
    checkAddAgentButtonState, waitForAgentInConversationDisplay,
    waitForNoAvailableAgentsState, clickAddButtonInModal,
    clickCancelButtonInModal, waitForModalError. All functions include proper
    error handling, timeout management, and follow existing test patterns."
  tests/desktop/helpers/index.ts: Added export statement for
    conversationAgentUiHelpers to make all functions available to test files
log: []
schema: v1.0
childrenIds:
  - T-create-test-setup-helper
  - T-create-ui-interaction-helper
  - T-implement-database-integrity
  - T-implement-happy-path
  - T-implement-multi-conversation
  - T-implement-ui-state-management
  - T-create-database-helper
created: 2025-08-25T23:35:55.904Z
updated: 2025-08-25T23:35:55.904Z
---

# Feature: End-to-End Tests for Conversation Agent Creation

## Purpose

Create comprehensive end-to-end tests to verify the complete workflow of adding agents to conversations, ensuring proper integration between LLM setup, agent configuration, conversation creation, and conversation agent management.

## Scope

Test the complete happy path workflow for conversation agent creation:

1. LLM provider configuration (prerequisite)
2. Agent creation in settings (prerequisite)
3. Conversation creation (prerequisite)
4. Adding agents to conversations via UI
5. Database persistence verification
6. UI state management across conversation switching

## Key Components to Test

### Core Workflow Components:

- **AgentLabelsContainerDisplay**: Add Agent button visibility and behavior
- **AddAgentToConversationModal**: Agent selection and addition functionality
- **Conversation Agent Database**: conversation_agents table operations
- **Settings Integration**: LLM and agent configuration prerequisites

### Database Schema:

```sql
-- conversation_agents table structure
CREATE TABLE conversation_agents (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,  -- References agent config ID from settings
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    UNIQUE(conversation_id, agent_id)
);
```

## Detailed Acceptance Criteria

### AC1: Complete Happy Path Workflow

**Given** the application is launched with clean state
**When** user completes the full conversation agent setup workflow:

1. Configure LLM provider in settings
2. Create agent in settings
3. Exit settings and create new conversation
4. Click Add Agent button in AgentLabelsContainerDisplay
5. Select agent in AddAgentToConversationModal
6. Confirm agent addition

**Then:**

- Agent appears in conversation's agent labels display
- Database contains conversation_agents record with correct relationship
- Agent can be successfully added to conversation
- UI reflects the agent association immediately

### AC2: UI State Management Rules

**Given** conversation agent functionality is active
**When** testing UI state behavior:

**Then:**

- Add Agent button is only visible when conversation is selected
- Add Agent button is disabled when no conversation is selected
- Modal shows "No available agents" when no agents are configured
- Modal excludes agents already added to current conversation
- Agent pills display correctly in AgentLabelsContainerDisplay

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

### AC4: Database Integrity and Cleanup

**Given** conversation agents are created
**When** testing data persistence and cleanup:

**Then:**

- conversation_agents records persist correctly in database
- Conversation deletion cascade-deletes associated conversation_agents
- Database queries return correct agent associations
- No orphaned records remain after cleanup operations

### AC5: Prerequisites and Error States

**Given** various prerequisite states
**When** testing error conditions:

**Then:**

- Cannot add agents without configured LLM provider (prerequisite)
- Cannot add agents without created agents in settings (prerequisite)
- Cannot add agents without created conversation (prerequisite)
- Modal gracefully handles empty agent list state
- Error states display appropriate user messaging

## Test Structure Requirements

### Test Organization:

```
tests/desktop/features/conversation-agents/
├── conversation-agent-creation.spec.ts        # Main happy path tests
├── conversation-agent-ui-states.spec.ts       # UI state management tests
├── conversation-agent-multi-conversation.spec.ts # Multiple conversation scenarios
└── conversation-agent-database.spec.ts        # Database integrity tests
```

### Helper Functions Required:

```typescript
// Database helpers
queryConversationAgents(electronApp, conversationId?) // Query conversation_agents table
waitForConversationAgentInDb(electronApp, conversationId, agentId) // Wait for DB record

// UI interaction helpers
clickAddAgentButton(window) // Click add agent button in labels container
waitForAddAgentModal(window, shouldBeVisible) // Wait for modal state
selectAgentInModal(window, agentName) // Select agent from dropdown
verifyAgentPillExists(window, agentName) // Verify agent pill in UI

// Test setup helpers
setupConversationAgentTest() // Complete setup: LLM + Agent + Conversation
createMultipleConversationsWithAgents(window, configs) // Complex test data setup
```

## Implementation Guidance

### Testing Pattern:

- Follow existing patterns from conversation tests and agent settings tests
- Use database helpers for verification like `queryConversations`
- Implement setup helpers similar to `createLlmConfigForAgentTests`
- Use modal interaction patterns from agent creation tests
- Include proper cleanup in beforeEach/afterEach hooks

### Database Testing:

- Query conversation_agents table directly for verification
- Test cascade deletion when conversations are deleted
- Verify unique constraints prevent duplicate agent assignments
- Check foreign key relationships maintain data integrity

### UI Testing Strategy:

- Test Add Agent button visibility rules
- Verify modal behavior with different agent availability states
- Test conversation switching updates agent display correctly
- Verify loading states during agent addition operations

### Integration Points:

- LLM configuration from existing test helpers
- Agent creation using existing settings test patterns
- Conversation creation using existing conversation test helpers
- Database operations using existing database test utilities

## Security Considerations

- Agent IDs reference configuration data, not database foreign keys
- Conversation-agent associations respect conversation ownership
- UI prevents unauthorized agent additions through proper state management
- Database constraints prevent invalid or duplicate associations

## Testing Requirements

- All tests must pass consistently in isolated execution
- Database cleanup ensures test isolation between runs
- Error conditions tested with appropriate user feedback verification
- Integration testing covers complete end-to-end workflows without mocking
