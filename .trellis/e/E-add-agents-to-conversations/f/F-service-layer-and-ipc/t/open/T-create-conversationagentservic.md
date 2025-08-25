---
id: T-create-conversationagentservic
title: Create ConversationAgentService business logic implementation
status: open
priority: high
parent: F-service-layer-and-ipc
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T05:17:04.782Z
updated: 2025-08-25T05:17:04.782Z
---

# Create ConversationAgentService business logic implementation

## Context

Implement the ConversationAgentService class that provides business logic for conversation-agent operations with data population. This service bridges the repository layer and the IPC layer, handling agent configuration population and validation.

## Reference Implementation Patterns

- **Service Pattern**: Follow `FileStorageService` constructor dependency injection pattern
- **Repository Integration**: Use existing `ConversationAgentsRepository` (already implemented in epic)
- **Agent Population**: Use settings store pattern for populating agent configurations
- **Error Handling**: Follow existing service error patterns with structured logging

## Technical Approach

Create service class in `packages/shared/src/services/conversationAgents/ConversationAgentService.ts` following existing service patterns with dependency injection for testability.

## Implementation Requirements

### Service Class Structure

```typescript
// packages/shared/src/services/conversationAgents/ConversationAgentService.ts
export class ConversationAgentService {
  private readonly logger: StructuredLogger;

  constructor(
    private readonly conversationAgentsRepository: ConversationAgentsRepository,
    private readonly agentSettingsProvider: AgentSettingsProvider, // Interface to be defined
  ) {
    this.logger = createLoggerSync({
      context: { metadata: { component: "ConversationAgentService" } },
    });
  }

  // Implementation methods...
}
```

### Core Business Methods

**1. getAgentsForConversation Method**

- **Input**: `conversationId: string`
- **Output**: `Promise<ConversationAgentViewModel[]>`
- **Logic**:
  - Call `conversationAgentsRepository.findByConversationId()`
  - For each ConversationAgent, populate agent config from settings
  - Transform to ConversationAgentViewModel array
  - Handle missing agent configurations gracefully (log warning, exclude from results)
  - Return ordered by `display_order` ASC, `added_at` ASC

**2. addAgentToConversation Method**

- **Input**: `{ conversationId: string, agentId: string, displayOrder?: number }`
- **Output**: `Promise<ConversationAgentViewModel>`
- **Logic**:
  - Validate agent exists in settings using `agentSettingsProvider`
  - Call `conversationAgentsRepository.create()` with input data
  - Populate created ConversationAgent with agent config
  - Return populated ConversationAgentViewModel
  - Include comprehensive error handling for validation and duplicate scenarios

**3. removeAgentFromConversation Method**

- **Input**: `{ conversationId: string, agentId: string }`
- **Output**: `Promise<void>`
- **Logic**:
  - Find existing association using `conversationAgentsRepository.existsAssociation()`
  - Get the association record to obtain the database ID
  - Call `conversationAgentsRepository.delete()` with the association ID
  - Handle not found scenarios gracefully

**4. validateAgentExists Method (private)**

- **Input**: `agentId: string`
- **Output**: `Promise<boolean>`
- **Logic**: Check if agent configuration exists in settings

### Agent Settings Provider Interface

Create interface for dependency injection:

```typescript
// packages/shared/src/services/conversationAgents/interfaces/AgentSettingsProvider.ts
export interface AgentSettingsProvider {
  getAgent(agentId: string): Promise<AgentSettingsViewModel | null>;
  getAllAgents(): Promise<AgentSettingsViewModel[]>;
}
```

### Data Population Logic

**Agent Configuration Population**:

- Transform `ConversationAgent` to `ConversationAgentViewModel`
- Populate `agent` field with full `AgentSettingsViewModel` from settings
- Handle missing configurations by logging warning and excluding from results
- Maintain consistent data transformation patterns

### Error Handling Requirements

- Use structured logging for all operations
- Preserve original error types from repository (ConversationAgentNotFoundError, etc.)
- Add service-level context to errors
- Log business logic decisions (missing agents, validation failures)
- Follow existing error serialization patterns for IPC transport

### Testing Requirements

**Unit Tests in same task** (following project patterns):

- Test all public methods with valid inputs
- Test error handling scenarios (missing agents, repository errors)
- Test data population logic with mock settings
- Test validation logic for agent existence
- Mock ConversationAgentsRepository and AgentSettingsProvider dependencies
- Verify logging calls for business operations

**Test file**: `packages/shared/src/services/conversationAgents/__tests__/ConversationAgentService.test.ts`

### Barrel Export Integration

**Update exports**:

- `packages/shared/src/services/conversationAgents/index.ts` - export service and interface
- `packages/shared/src/services/index.ts` - export conversationAgents module

## Dependencies

- ConversationAgentsRepository (already implemented)
- ConversationAgent and related types (already implemented)
- ConversationAgentViewModel (already implemented)
- AgentSettingsViewModel (existing ui-shared type)
- Structured logging utilities (existing)

## Acceptance Criteria

- [ ] ConversationAgentService class implemented with dependency injection
- [ ] AgentSettingsProvider interface defined for testability
- [ ] getAgentsForConversation method populates agent configurations
- [ ] addAgentToConversation method validates and creates associations
- [ ] removeAgentFromConversation method handles deletion by conversation/agent IDs
- [ ] Missing agent configurations handled gracefully with logging
- [ ] Comprehensive error handling preserving repository error types
- [ ] Structured logging for all business operations
- [ ] Unit tests covering all methods and error scenarios
- [ ] Proper barrel exports and integration
- [ ] Service follows existing dependency injection patterns

## Implementation Notes

- This service provides the business logic layer between IPC and repository
- Agent configuration population is crucial for UI display
- The AgentSettingsProvider interface enables clean separation from settings implementation
- Error handling must preserve specific error types for proper IPC serialization
- Service will be instantiated in MainProcessServices with proper dependencies
