---
id: T-create-mainprocesschatorchestr
title: Create MainProcessChatOrchestrationService integrating all dependencies
status: open
priority: high
parent: F-chat-orchestration-service
prerequisites:
  - T-implement-chatorchestrationser
  - T-implement-main-process
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T19:41:36.789Z
updated: 2025-08-29T19:41:36.789Z
---

# Create MainProcessChatOrchestrationService integrating all dependencies

## Context

Create the main process wrapper that instantiates the `ChatOrchestrationService` with all required dependencies and integrates it into `MainProcessServices`. This follows the established pattern of creating service instances with proper dependency injection seen in the `MainProcessServices` constructor.

## Technical Approach

Follow the dependency injection patterns in `MainProcessServices`:

- Use existing repository instances from `MainProcessServices`
- Create `SystemPromptFactory` with proper resolvers
- Inject `MainProcessLlmBridge` as the platform-specific implementation
- Follow service factory pattern for clean instantiation

## Implementation Requirements

### System Prompt Resolvers (`apps/desktop/src/main/services/chat/MainProcessSystemPromptResolvers.ts`)

```typescript
export class MainProcessSystemPromptResolvers implements SystemPromptResolvers {
  constructor() {}

  async resolveRole(roleId: string): Promise<PersistedRoleData>;
  async resolvePersonality(
    personalityId: string,
  ): Promise<PersistedPersonalityData>;
}
```

### Service Factory (`apps/desktop/src/main/services/chat/ChatOrchestrationServiceFactory.ts`)

```typescript
export class ChatOrchestrationServiceFactory {
  static create(mainServices: MainProcessServices): ChatOrchestrationService {
    // Create system prompt factory with resolvers
    // Create agents resolver using agentsRepositoryManager
    // Create LLM bridge instance
    // Instantiate ChatOrchestrationService with all dependencies
  }
}
```

### MainProcessServices Integration

Add to `MainProcessServices` class:

```typescript
/**
 * Chat orchestration service for multi-agent message processing.
 */
readonly chatOrchestrationService: ChatOrchestrationService;
```

Initialize in constructor using factory pattern.

## Acceptance Criteria

### Dependency Resolution

- **GIVEN** MainProcessServices instantiation
- **WHEN** creating chat orchestration service
- **THEN** it should:
  - Use existing `messagesRepository` and `conversationAgentsRepository` instances
  - Create `SystemPromptFactory` with `MainProcessSystemPromptResolvers`
  - Create agents resolver using `agentsRepositoryManager.get()`
  - Use `rolesRepositoryManager` and `personalitiesRepositoryManager` for prompt resolvers
  - Inject `MainProcessLlmBridge` instance
  - Create `MessageFormatterService` instance
  - Successfully instantiate `ChatOrchestrationService` with all dependencies

### System Prompt Integration

- **GIVEN** system prompt generation is needed
- **WHEN** `SystemPromptResolvers` methods are called
- **THEN** it should:
  - Use `rolesRepositoryManager.get().getRole(roleId)` for role resolution
  - Use `personalitiesRepositoryManager.get().getPersonality(personalityId)` for personality resolution
  - Handle repository errors gracefully with structured logging
  - Return properly formatted role and personality data

### Agent Resolution

- **GIVEN** agent details are needed for context building
- **WHEN** agents resolver function is called
- **THEN** it should:
  - Use `agentsRepositoryManager.get().getAgent(agentId)` for agent lookup
  - Handle agent not found errors appropriately
  - Return complete `PersistedAgentData` with all required fields
  - Support efficient caching if needed for performance

### Service Lifecycle

- **GIVEN** MainProcessServices initialization and cleanup
- **WHEN** managing chat orchestration service
- **THEN** it should:
  - Initialize successfully during `MainProcessServices` constructor
  - Be accessible via `mainServices.chatOrchestrationService`
  - Handle initialization errors gracefully
  - Follow existing service initialization patterns

## Implementation Files

Create these new files:

1. `apps/desktop/src/main/services/chat/MainProcessSystemPromptResolvers.ts` - System prompt resolvers implementation
2. `apps/desktop/src/main/services/chat/ChatOrchestrationServiceFactory.ts` - Service factory
3. Update `apps/desktop/src/main/services/MainProcessServices.ts` - Add service integration

## Dependencies

### Internal Dependencies

- `ChatOrchestrationService` (from prerequisite task)
- `MainProcessLlmBridge` (from prerequisite task)
- Existing repositories from `MainProcessServices`
- `agentsRepositoryManager`, `rolesRepositoryManager`, `personalitiesRepositoryManager` (existing)
- `SystemPromptFactory`, `MessageFormatterService` (existing)

### Template Dependency

- System prompt template (investigate existing template source or create default)

## Testing Requirements

### Unit Tests (`apps/desktop/src/main/services/chat/__tests__/`)

```typescript
describe("MainProcessSystemPromptResolvers", () => {
  it("should resolve roles using rolesRepositoryManager");
  it("should resolve personalities using personalitiesRepositoryManager");
  it("should handle repository errors gracefully");
});

describe("ChatOrchestrationServiceFactory", () => {
  it("should create service with all dependencies injected");
  it("should handle repository manager initialization errors");
  it("should create functional service instance");
});

describe("MainProcessServices integration", () => {
  it("should initialize chat orchestration service successfully");
  it("should provide accessible service instance");
  it("should handle initialization failures gracefully");
});
```

## Performance Requirements

- Service instantiation within 100ms during app startup
- Efficient dependency injection without circular references
- Repository manager access optimized for repeated calls

## Security Considerations

### Access Control

- Service only accessible from main process
- Proper encapsulation of repository managers
- No sensitive data exposure through service interfaces

This implementation provides the complete dependency injection setup needed for the chat orchestration service to operate in the Electron main process environment.
