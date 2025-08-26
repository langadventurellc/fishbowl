---
id: T-create-test-setup-helper
title: Create Test Setup Helper Functions for Conversation Agent Testing
status: done
priority: high
parent: F-end-to-end-tests-for
prerequisites:
  - T-create-database-helper
  - T-create-ui-interaction-helper
affectedFiles:
  tests/desktop/helpers/setupConversationAgentTest.ts:
    Complete setup helper that
    combines LLM configuration, agent creation, and conversation creation into
    one function. Returns structured data with llmConfig, agent, and
    conversationId for test verification.
  tests/desktop/helpers/setupMultipleConversationsWithAgents.ts:
    Advanced helper for creating complex test scenarios with multiple
    conversations and agent assignments. Handles agent reuse across
    conversations and returns comprehensive data structure for verification.
  tests/desktop/helpers/conversationAgentTestSuite.ts: Specialized test suite
    setup with proper lifecycle management for conversation agent tests.
    Includes database cleanup, modal state management, and conversation_agents
    table cleanup.
  tests/desktop/helpers/conversationAgentTestData.ts: Standardized test data
    constants and factories including predefined scenarios (single agent,
    multiple agents, agent reuse), agent type configurations, and standard
    naming constants.
  tests/desktop/helpers/index.ts: Updated barrel file exports to include all new
    conversation agent test helper functions and types for easy import in test
    files.
log:
  - >-
    Successfully implemented comprehensive test setup helper functions for
    conversation agent testing. Created 4 new helper modules that streamline
    test preparation by combining existing patterns:


    1. **setupConversationAgentTest.ts** - Complete end-to-end setup combining
    LLM config + agent creation + conversation creation in one function,
    returning structured data for test verification

    2. **setupMultipleConversationsWithAgents.ts** - Advanced helper for complex
    scenarios with multiple conversations and agent assignments, supporting
    reusable agents across conversations

    3. **conversationAgentTestSuite.ts** - Specialized test suite with proper
    lifecycle management, database cleanup including conversation_agents table,
    and modal state management

    4. **conversationAgentTestData.ts** - Standardized test data constants and
    factories providing predefined scenarios (simple, complex, edge cases) and
    agent type configurations


    All functions integrate seamlessly with existing helpers, follow established
    patterns, include comprehensive error handling, and support both simple and
    complex test scenarios. Quality checks pass with proper linting, formatting,
    and type checking.
schema: v1.0
childrenIds: []
created: 2025-08-25T23:42:39.682Z
updated: 2025-08-25T23:42:39.682Z
---

# Task: Create Test Setup Helper Functions for Conversation Agent Testing

## Context

The conversation agent tests require complex setup involving LLM configuration, agent creation, and conversation creation. This task creates reusable setup helpers that combine existing patterns to streamline test preparation and reduce code duplication.

## Reference Patterns

- LLM setup from `createLlmConfigForAgentTests.ts`
- Agent setup from `createMockAgentData.ts` and `fillAgentForm.ts`
- Conversation setup from `new-conversation-button.spec.ts`
- Test suite pattern from `setupAgentsTestSuite.ts`

## Existing Helper Integration

- **LLM Setup**: Use `createLlmConfigForAgentTests` from settings helpers
- **Agent Creation**: Use agent creation patterns from settings helpers
- **Conversation Creation**: Use conversation button clicking from conversation tests
- **Database**: Use `resetDatabase` and conversation query helpers

## Implementation Requirements

### 1. Create setupConversationAgentTest.ts

**File Path**: `tests/desktop/helpers/setupConversationAgentTest.ts`

**Function to Implement**:

```typescript
// Complete setup for conversation agent testing: LLM + Agent + Conversation
export const setupConversationAgentTest = async (
  window: TestWindow
): Promise<{
  llmConfig: MockLlmConfig;
  agent: MockAgentData;
  conversationId: string;
}>
```

**Implementation Steps**:

1. Create LLM configuration using existing `createLlmConfigForAgentTests`
2. Navigate to agents section and create test agent
3. Exit settings and create new conversation
4. Return all created data for test verification

### 2. Create setupMultipleConversationsWithAgents.ts

**File Path**: `tests/desktop/helpers/setupMultipleConversationsWithAgents.ts`

**Function to Implement**:

```typescript
// Create complex test scenarios with multiple conversations and agent assignments
export interface ConversationAgentConfig {
  conversationTitle: string;
  agentNames: string[];  // Names of agents to add to this conversation
}

export const createMultipleConversationsWithAgents = async (
  window: TestWindow,
  configs: ConversationAgentConfig[]
): Promise<{
  conversations: Array<{ id: string; title: string }>;
  agents: MockAgentData[];
  assignments: Array<{ conversationId: string; agentId: string }>;
}>
```

**Implementation Steps**:

1. Setup LLM configuration
2. Create required agents based on config requirements
3. Create each conversation specified in configs
4. Add specified agents to each conversation
5. Return structured data for test verification

### 3. Create conversationAgentTestSuite.ts

**File Path**: `tests/desktop/helpers/conversationAgentTestSuite.ts`

**Function to Implement**:

```typescript
// Test suite setup specifically for conversation agent tests
export const setupConversationAgentTestSuite = () => {
  // Returns suite methods similar to setupAgentsTestSuite
  // Includes proper cleanup for conversation_agents table
  // Integrates database reset with conversation agent cleanup
};
```

**Features**:

- Electron app lifecycle management
- Database cleanup including conversation_agents table
- Settings modal state management
- Conversation agent specific cleanup patterns

### 4. Create conversationAgentTestData.ts

**File Path**: `tests/desktop/helpers/conversationAgentTestData.ts`

**Constants and Factories**:

```typescript
// Predefined test data for common scenarios
export const CONVERSATION_AGENT_TEST_SCENARIOS = {
  singleAgentSingleConversation: {...},
  multipleAgentsMultipleConversations: {...},
  agentReusedAcrossConversations: {...}
};

// Factory for creating test agent configurations
export const createConversationAgentTestConfig = (
  type: 'analyst' | 'technical' | 'writer'
): ConversationAgentConfig
```

## Technical Approach

### Code Reuse Strategy

- Leverage all existing helper functions rather than duplicating code
- Combine existing patterns into higher-level abstractions
- Maintain compatibility with existing test infrastructure
- Use existing cleanup and setup patterns

### Error Handling

- Include comprehensive error handling with context information
- Cleanup partial state on setup failures
- Provide descriptive error messages for debugging
- Handle async operation failures gracefully

### Data Management

- Return structured data that tests can easily verify
- Include all IDs and references needed for assertions
- Support both simple and complex test scenarios
- Enable test isolation through proper cleanup

## Acceptance Criteria

### Functional Requirements

- ✅ setupConversationAgentTest creates complete test environment (LLM + Agent + Conversation)
- ✅ createMultipleConversationsWithAgents handles complex multi-conversation scenarios
- ✅ setupConversationAgentTestSuite provides proper test lifecycle management
- ✅ All setup functions return structured data for test verification
- ✅ Functions integrate seamlessly with existing test helpers

### Integration Requirements

- ✅ Setup functions work with existing database and UI helpers
- ✅ Cleanup properly removes all test data between runs
- ✅ Functions handle partial failure scenarios gracefully
- ✅ Setup is reliable and doesn't cause flaky tests

### Quality Requirements

- ✅ Setup functions are efficient and don't cause slow tests
- ✅ Functions provide comprehensive error handling
- ✅ Code reuses existing patterns rather than duplicating logic
- ✅ Functions support both simple and complex test scenarios

## Dependencies

- Existing LLM configuration helpers (`createLlmConfigForAgentTests`)
- Existing agent creation helpers (`createMockAgentData`, `fillAgentForm`)
- Existing conversation creation patterns
- Database helpers for cleanup and verification
- UI interaction helpers for automation

## Integration Points

These setup helpers will be used by:

- Happy path conversation agent creation tests
- UI state management tests
- Multi-conversation agent management tests
- Database integrity tests
- Prerequisites and error state tests

## Testing Strategy

- Helpers will be validated through integration with main test suites
- Setup reliability verified through multiple test runs
- Cleanup effectiveness verified through test isolation
- Performance impact monitored to prevent slow tests
