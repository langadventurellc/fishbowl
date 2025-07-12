# Feature: AI Services Code Review Improvements

**Implementation Order: 01**

This feature implements the improvements identified in the Gemini code review for Task 7.2 (Message Filtering at Application Layer). The recommendations address dependency injection, security concerns, error handling, and code quality improvements to elevate the AI services from a good implementation to production-hardened, enterprise-quality code.

## Feature Components

- **Dependency Injection Refactoring**: Replace direct service instantiation with constructor injection for better testability and flexibility
- **Security Hardening**: Address prompt injection vulnerabilities and improve system prompt generation
- **Error Handling Enhancement**: Add comprehensive error handling for async operations with specific error types
- **Code Quality Improvements**: Improve encapsulation, ID generation, and type safety

## User Stories

- As a developer, I want AI services to use dependency injection so that I can easily mock dependencies for testing
- As a security-conscious developer, I want system prompts to be protected against prompt injection attacks
- As a developer, I want specific error messages when AI context preparation fails so that I can handle errors appropriately
- As a developer, I want robust unique ID generation for system messages to prevent collisions

## Functional Requirements

### Core Functionality

- FR-1: AgentService must accept its dependencies via constructor injection rather than direct instantiation
- FR-2: System prompt generation must include protection against prompt injection attacks
- FR-3: Unique ID generation must use cryptographically secure random values instead of timestamps

### Data Management

- FR-4: Error handling for async operations must provide specific, actionable error messages
- FR-5: Service encapsulation must be maintained by removing direct access to internal dependencies
- FR-6: Type safety must be improved by using more specific union types where applicable

### Integration Points

- FR-7: Services must integrate with existing error handling patterns in the codebase
- FR-8: Dependency injection must be implemented without breaking existing consumers

## Technical Requirements

### Technology Stack

- TR-1: Use TypeScript strict mode with proper type definitions
- TR-2: Maintain compatibility with Vitest testing framework
- TR-3: Follow existing project patterns for service architecture

### Performance & Scalability

- TR-4: Dependency injection must not impact performance significantly
- TR-5: Error handling must not introduce performance bottlenecks
- TR-6: ID generation must be efficient for high-frequency use

### Security & Compliance

- TR-7: Implement prompt injection protection in system prompt generation
- TR-8: Use secure random number generation for unique IDs
- TR-9: Validate and sanitize all user-provided content in agent properties

## Architecture Context

### System Integration

- AC-1: This feature maintains compatibility with existing AI service consumers
- AC-2: Dependencies on Message, Agent, and other shared types remain unchanged
- AC-3: Integration with existing error handling and logging systems

### Technical Patterns

- AC-4: Use of Constructor Injection pattern for dependency management
- AC-5: Integration with existing service layer patterns
- AC-6: Maintaining the Facade pattern in AgentService

### File Structure Implications

- AC-7: No new directories needed, modifications to existing AI service files
- AC-8: Test files will need updates to accommodate dependency injection

## Acceptance Criteria

### Functional Acceptance

- [ ] AC-1: AgentService accepts dependencies via constructor injection
- [ ] AC-2: System prompt generation includes prompt injection protection
- [ ] AC-3: Unique ID generation uses crypto.randomUUID() instead of Date.now()
- [ ] AC-4: Error handling provides specific error messages for async operations

### Technical Acceptance

- [ ] AC-5: All unit tests passing with updated dependency injection
- [ ] AC-6: No linting or type errors
- [ ] AC-7: Security requirements validated against prompt injection
- [ ] AC-8: Service encapsulation maintained (no direct dependency access)

### Quality Gates

- [ ] AC-9: Code coverage maintained or improved
- [ ] AC-10: Performance benchmarks not regressed
- [ ] AC-11: All existing AI service functionality preserved

## Implementation Hints

Guidance for the planning phase to create appropriate tasks:

### Suggested Task Groupings

1. **Dependency Injection Implementation** (3-4 tasks)
   - Refactor AgentService constructor
   - Update service instantiation patterns
   - Remove direct dependency access methods
   - Update tests for dependency injection

2. **Security Improvements** (2-3 tasks)
   - Implement prompt injection protection
   - Update system prompt generation
   - Add input sanitization

3. **Error Handling Enhancement** (2-3 tasks)
   - Add try/catch blocks for async operations
   - Create specific error types
   - Update error messages

4. **Code Quality Improvements** (2-3 tasks)
   - Replace Date.now() with crypto.randomUUID()
   - Improve type safety with union types
   - Update JSDoc documentation

5. **Testing Updates** (3-4 tasks)
   - Update unit tests for dependency injection
   - Add tests for security improvements
   - Update mocking patterns
   - Verify error handling tests

### Critical Implementation Notes

- Start with dependency injection as it affects all other components
- Maintain backward compatibility for existing consumers
- Consider creating a service factory or container for dependency management
- Test prompt injection protection with various attack vectors

## Constraints & Assumptions

### Technical Constraints

- CA-1: Must maintain compatibility with existing AI service consumers
- CA-2: Cannot modify shared type definitions (Message, Agent, etc.)
- CA-3: Must maintain existing API surface for backward compatibility

### Business Constraints

- CA-4: Feature must be completed without breaking existing functionality
- CA-5: Cannot introduce significant performance overhead

### Assumptions

- CA-6: Agent properties (name, role, personality) may contain user-provided content
- CA-7: System will have crypto.randomUUID() available (modern browser/Node.js)
- CA-8: Existing error handling patterns will be followed

## Risks & Mitigation

### Technical Risks

- Risk 1: Dependency injection breaks existing consumers - Mitigation: Maintain backward compatibility with factory pattern
- Risk 2: Prompt injection protection changes AI behavior - Mitigation: Extensive testing with various prompt formats

### Schedule Risks

- Risk 3: Testing updates take longer than expected - Mitigation: Focus on core functionality first, then comprehensive testing

## Dependencies

### Upstream Dependencies

- Requires completion of: Task 7.2 (Message Filtering at Application Layer)
- Needs review of: Existing error handling patterns in codebase

### Downstream Impact

- Blocks: None (improvement task)
- Enables: Better testability and security for AI services

## Specific Code Changes Required

Based on Gemini's review, the following specific changes are needed:

### 1. Dependency Injection in AgentService

```typescript
// Current (Direct instantiation):
constructor() {
  this.conversationContextService = new ConversationContextService();
  this.messageFormatterService = new MessageFormatterService();
}

// Improved (Constructor injection):
constructor(
  contextService: ConversationContextService,
  formatterService: MessageFormatterService
) {
  this.conversationContextService = contextService;
  this.messageFormatterService = formatterService;
}
```

### 2. Remove Service Accessor Methods

```typescript
// Remove these methods from AgentService:
public getConversationContextService(): ConversationContextService
public getMessageFormatterService(): MessageFormatterService
```

### 3. Improve ID Generation

```typescript
// Current:
id: `system-${Date.now()}`;

// Improved:
id: `system-${crypto.randomUUID()}`;
```

### 4. Prompt Injection Protection

```typescript
// Current:
private buildSystemPromptFromAgent(agent: Agent): string {
  let prompt = `You are ${agent.name}`;
  // ...
}

// Improved:
private buildSystemPromptFromAgent(agent: Agent): string {
  let prompt = `You are an AI assistant. Your assigned name is "${agent.name}".`;
  if (agent.role) {
    prompt += ` Your role is: "${agent.role}".`;
  }
  if (agent.personality) {
    prompt += ` Adhere to the following personality guidelines: "${agent.personality}".`;
  }
  return prompt;
}
```

### 5. Add Error Handling

```typescript
// Add try/catch blocks in async methods:
public async prepareAIContextForConversation(...) {
  try {
    const messages = await getAllMessages(conversationId);
    return this.prepareAIContext(messages, agent, config);
  } catch (error) {
    console.error(`Failed to get messages for conversation ${conversationId}`, error);
    throw new Error(`ContextPreparationError: Could not retrieve messages.`);
  }
}
```

## See Also

### Specifications

- `docs/specifications/core-architecture-spec.md` - Service architecture patterns
- `docs/specifications/implementation-plan.md` - Overall implementation context

### Technical Documentation

- `CLAUDE.md` - Development standards and setup
- `docs/technical/coding-standards.md` - Code quality requirements

### Related Features

- `.tasks/phase-1.2.1/20250711-message-active-state-tasks.md` - Context for Task 7.2
