---
id: T-create-conversationagentservic
title: Create ConversationAgentService with business logic and unit tests
status: open
priority: high
parent: F-service-layer-and-ipc
prerequisites:
  - T-create-conversationagentviewmo
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T04:36:10.622Z
updated: 2025-08-25T04:36:10.622Z
---

# Create ConversationAgentService with business logic and unit tests

## Context

Create the service layer component that handles business logic for conversation-agent operations. This service will coordinate between the ConversationAgentsRepository (database) and AgentStore (settings) to provide populated agent data.

## Technical Approach

Follow the existing service pattern used by other services in the codebase. The service should use dependency injection and follow the same error handling patterns as ConversationsRepository.

## Implementation Requirements

### Service Class Structure

- Create `packages/shared/src/services/conversationAgents/ConversationAgentService.ts`
- Follow constructor injection pattern with ConversationAgentsRepository and logger dependencies
- Include comprehensive JSDoc documentation for all public methods
- Use structured logging with appropriate context metadata

### Core Business Methods

Implement these methods with full validation and error handling:

1. **`getAgentsForConversation(conversationId: string): Promise<ConversationAgentViewModel[]>`**
   - Fetch conversation agents from repository using `findByConversationId`
   - Populate each agent with configuration data from settings
   - Handle missing agent configurations gracefully (log warning, exclude from results)
   - Return ConversationAgentViewModel with complete agent details
   - Include comprehensive error handling and logging

2. **`addAgentToConversation(conversationId: string, agentId: string): Promise<ConversationAgentViewModel>`**
   - Validate that agent configuration exists in settings
   - Use repository.create() to add association
   - Handle DuplicateAgentError and rethrow appropriately
   - Return populated ConversationAgentViewModel
   - Log successful addition with relevant IDs

3. **`removeAgentFromConversation(conversationId: string, agentId: string): Promise<void>`**
   - Find existing association using repository methods
   - Delete association using repository.delete()
   - Handle ConversationAgentNotFoundError appropriately
   - Log successful removal with relevant IDs

4. **`validateAgentExists(agentId: string): Promise<boolean>`**
   - Check if agent configuration exists in settings
   - Return boolean without throwing errors
   - Used internally by addAgentToConversation

### Data Population Logic

- Transform ConversationAgent entities to ConversationAgentViewModel
- Fetch agent settings data and merge with database data
- Handle cases where agent settings have been deleted but database references remain
- Use logger.warn for missing configurations, don't fail the entire operation

### Error Handling

- Catch and handle repository-specific errors (DuplicateAgentError, ConversationAgentNotFoundError)
- Provide meaningful error messages for business logic failures
- Use structured logging for all operations
- Follow existing error handling patterns from other services

### Unit Tests

Create comprehensive test suite at `packages/shared/src/services/conversationAgents/__tests__/ConversationAgentService.test.ts`:

- **Dependency injection tests**: Verify proper initialization with mocked dependencies
- **getAgentsForConversation tests**:
  - Successfully returns populated agents
  - Handles empty results gracefully
  - Excludes agents with missing configurations
  - Logs warnings for missing agent data
- **addAgentToConversation tests**:
  - Successfully adds valid agent
  - Throws error for non-existent agent configuration
  - Handles DuplicateAgentError correctly
  - Validates input parameters
- **removeAgentFromConversation tests**:
  - Successfully removes existing association
  - Handles non-existent associations
  - Validates input parameters
- **validateAgentExists tests**:
  - Returns true for existing agents
  - Returns false for non-existent agents
  - Handles edge cases (empty string, null)
- **Error handling tests**: Verify proper error transformation and logging

### File Structure

```
packages/shared/src/services/conversationAgents/
├── ConversationAgentService.ts
├── __tests__/
│   └── ConversationAgentService.test.ts
└── index.ts (barrel export)
```

## Dependencies

- ConversationAgentsRepository from `packages/shared/src/repositories/conversationAgents`
- AgentSettingsViewModel type from existing agent types
- ConversationAgentViewModel type (will be created in parallel task)
- Existing error classes from conversation agent types
- Structured logging utilities

## Acceptance Criteria

- [ ] Service class follows existing constructor injection patterns
- [ ] All four core methods implemented with proper validation
- [ ] Agent configuration data properly populated from settings
- [ ] Missing agent configurations handled gracefully (warn + exclude)
- [ ] Comprehensive error handling with meaningful messages
- [ ] All business logic covered by unit tests (>90% coverage)
- [ ] JSDoc documentation for all public methods
- [ ] Follows existing logging patterns with structured context
- [ ] Barrel export file created for service module

## Testing Strategy

Include unit tests in the same task as implementation. Mock all dependencies (repository, logger) and test all success paths, error conditions, and edge cases. Ensure tests validate both business logic and proper dependency usage.

## Implementation Notes

- Use the same dependency injection pattern as existing services
- Agent settings population should be resilient to missing configurations
- Follow the error handling patterns established in ConversationAgentsRepository
- The service acts as the business logic layer between IPC handlers and data access
