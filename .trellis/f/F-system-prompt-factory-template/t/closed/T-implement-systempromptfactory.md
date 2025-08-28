---
id: T-implement-systempromptfactory
title: Implement SystemPromptFactory with constructor DI
status: done
priority: high
parent: F-system-prompt-factory-template
prerequisites:
  - T-scaffold-shared-system-prompt
  - T-implement-template-renderer
affectedFiles:
  packages/shared/src/prompts/system/SystemPromptFactory.ts: Enhanced
    SystemPromptFactory class with complete createSystemPrompt implementation
    and constructor accepting template parameter
  packages/shared/src/prompts/system/__tests__/SystemPromptFactory.test.ts:
    Created comprehensive unit test suite with 12 tests covering all
    functionality requirements including mocking, validation, and edge cases
log:
  - >-
    Implemented SystemPromptFactory with constructor dependency injection and
    comprehensive unit tests. The factory wires resolvers and the renderer to
    produce final system prompts from PersistedAgentData input.


    Key implementation details:

    - Updated constructor to accept template parameter (as designed - no file
    I/O)

    - Enhanced createSystemPrompt method to resolve personality/role via
    injected resolvers

    - Builds SystemPromptRenderData including agent system prompt, names,
    descriptions, and behaviors

    - Calls renderSystemPrompt with template and data to return final prompt
    string

    - Added input validation with fail-fast error handling for missing
    role/personality

    - Supports behavior overrides from agent configuration

    - All SystemPromptFactory tests passing with 100% coverage including edge
    cases and error conditions
schema: v1.0
childrenIds: []
created: 2025-08-28T00:23:55.560Z
updated: 2025-08-28T00:23:55.560Z
---

Context
Implement the class-based factory that wires resolvers and the renderer to produce a final prompt from a `PersistedAgentData` input.

References

- Feature spec (class shape and DI)
- Shared types: `PersistedAgentData`, `PersistedPersonalityData`, `PersistedRoleData`
- Renderer contract from previous task

Implementation Requirements

- File: `packages/shared/src/prompts/system/SystemPromptFactory.ts`
- Export class `SystemPromptFactory` with:
  - Constructor `(resolvers: SystemPromptResolvers, logger = createLoggerSync(...))`
  - Method `async createSystemPrompt(agent: PersistedAgentData): Promise<string>` that:
    - Resolves personality and role via injected resolvers using `agent.personality` and `agent.role`
    - Builds `SystemPromptRenderData` including: agentSystemPrompt (from agent.systemPrompt), agentName, roleName/description/systemPrompt, personalityName/customInstructions, behaviors
    - Reads the template string via dependency to be provided by caller or kept as parameter for now? Design: keep the renderer template injected into the factory via constructor optional param OR accept as method param? Per feature, the template file is managed in desktop; the shared factory should not read files. Therefore, take the template string as a constructor parameter or via a setter. Choose constructor param: `template: string` to avoid file I/O here.
    - Calls `renderSystemPrompt(template, data)` and returns string
- Update `systemPromptTypes.ts` to include `SystemPromptResolvers` and `SystemPromptRenderData`
- Unit tests (Jest):
  - Mocks resolvers to return a role and personality
  - Verifies output includes correct names and behavior values; respects overrides
  - Ensures factory does not perform file I/O

Acceptance Criteria

- Class compiles and method returns expected string
- Tests pass locally
- No app-layer imports; DI only

Security & Performance

- Validate inputs minimally and fail fast on missing ids

Out of Scope

- Template file discovery or disk access (desktop startup handles file placement)
