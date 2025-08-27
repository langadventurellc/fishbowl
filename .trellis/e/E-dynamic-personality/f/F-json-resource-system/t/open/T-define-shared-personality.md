---
id: T-define-shared-personality
title: Define shared personality definitions service interface and types
status: open
priority: high
parent: F-json-resource-system
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-27T15:41:00.266Z
updated: 2025-08-27T15:41:00.266Z
---

# Define shared personality definitions service interface and types

## Context

Create the shared interface and TypeScript types for the personality definitions service following the Platform Abstraction Pattern. This defines the contract that platform-specific implementations will follow without including any file system operations in the shared package.

## Implementation Requirements

### Interface Definition

- Create `PersonalityDefinitionsService` interface in `packages/shared/src/services/`
- Define method signatures for loading and accessing personality definitions
- Include structured error types for different failure modes

### Type Definitions

- Define `PersonalityDefinitions` type based on the JSON schema (sections/traits/values)
- Create `PersonalitySectionDef`, `PersonalityTraitDef`, and `PersonalityValueMeta` types
- Reuse discrete value types from shared utils (`packages/shared/src/utils/discreteValues.ts`); do not duplicate
- Define structured error types for JSON parsing, file access, and validation failures

### Files to Create

- `packages/shared/src/services/PersonalityDefinitionsService.ts`
- `packages/shared/src/types/personality/PersonalityDefinitions.ts`
- `packages/shared/src/types/personality/PersonalityErrors.ts`
- `packages/shared/src/types/personality/index.ts`

### Technical Approach

1. Study the existing `resources/personality_definitions.json` structure
2. Create TypeScript interfaces that match the JSON schema
3. Define the service interface with async methods for loading definitions
4. Include comprehensive error types for different failure scenarios
5. Follow existing patterns in `packages/shared/src/services/` and `packages/shared/src/types/`

## Acceptance Criteria

- [ ] Shared interface and types defined (no platform code in shared)
- [ ] `PersonalityDefinitionsService` interface includes methods for loading/accessing definitions
- [ ] Type definitions match the structure of `personality_definitions.json`
- [ ] Discrete value types consumed from shared utils (`DiscreteValue`, `DISCRETE_VALUES`)
- [ ] Structured error types defined for different failure modes
- [ ] All types exported via barrel files following project conventions

## Testing Requirements

### Unit Tests

- Test type definitions are properly exported
- Verify discrete value constraints
- Test error type serialization

## Security Considerations

- Interface must not expose file system operations
- Error types must not leak sensitive path information
- Type validation should be safe from injection attacks

## Dependencies

- Must understand the JSON schema structure from `resources/personality_definitions.json`

## Out of Scope

- Platform-specific implementations (separate tasks)
- JSON loading logic (separate task)
- Zod validation schemas (separate task)
