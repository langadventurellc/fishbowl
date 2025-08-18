---
id: F-agent-data-types-validation
title: Agent Data Types & Validation
status: in-progress
priority: medium
parent: E-data-layer-persistence
prerequisites: []
affectedFiles:
  packages/ui-shared/src/schemas/agentSchema.ts: Updated agent validation schema
    to match task requirements with flattened structure - name (2-100 chars,
    alphanumeric), model/role/personality (required strings), temperature (0-2),
    maxTokens (1-4000, integer), topP (0-1), systemPrompt (optional, max 5000
    chars)
  packages/ui-shared/src/types/settings/AgentViewModel.ts:
    Created new agent view
    model interface extending AgentFormData with id and timestamp fields
    following RoleViewModel pattern
  packages/ui-shared/src/schemas/__tests__/agentSchema.test.ts:
    Completely rewrote test file to match new schema structure with
    comprehensive coverage of all validation rules, boundary values, edge cases,
    and type inference following roleSchema test patterns
log: []
schema: v1.0
childrenIds:
  - T-create-agent-data-types-and
  - T-create-agent-mapping-utilities
  - T-create-barrel-exports-and
  - T-create-persistence-data-types
created: 2025-08-18T23:04:10.560Z
updated: 2025-08-18T23:04:10.560Z
---

## Purpose and Functionality

Create all TypeScript types, Zod validation schemas, and mapping utilities for the agent management system, following the exact patterns from roles and personalities implementations.

## Key Components to Implement

### Shared Package Types

- `AgentFormData` type with all form fields
- `AgentViewModel` type extending form data with metadata
- `PersistedAgentsSettingsData` type for JSON storage
- Type exports through barrel files

### Validation Schema

- `agentSchema` using Zod with complete field validation
- Name, model, role, personality field constraints
- Temperature, maxTokens, topP range validation
- Optional system prompt validation

### Mapping Utilities

- `mapAgentsPersistenceToUI` function
- `mapAgentsUIToPersistence` function
- Handle optional fields and timestamps correctly

## Detailed Acceptance Criteria

### AgentFormData Type

- ✅ Contains all required fields: name, model, role, personality, temperature, maxTokens, topP, systemPrompt
- ✅ Located in `packages/ui-shared/src/types/settings/AgentFormData.ts`
- ✅ Derived from agentSchema using `z.infer<typeof agentSchema>`
- ✅ Follows exact pattern from RoleFormData and PersonalityFormData

### AgentViewModel Type

- ✅ Extends AgentFormData with id and timestamps
- ✅ Located in `packages/ui-shared/src/types/settings/AgentViewModel.ts`
- ✅ Contains id: string, createdAt?: string, updatedAt?: string
- ✅ Follows exact pattern from RoleViewModel and PersonalityViewModel

### PersistedAgentsSettingsData Type

- ✅ Located in `packages/shared/src/types/agents/PersistedAgentsSettingsData.ts`
- ✅ Contains agents array and metadata
- ✅ Matches structure of PersistedRolesSettingsData and PersistedPersonalitiesSettingsData
- ✅ Includes version field for future schema evolution

### Validation Schema

- ✅ Located in `packages/ui-shared/src/schemas/agentSchema.ts`
- ✅ Name validation: 2-100 characters, alphanumeric with spaces/hyphens/underscores, required
- ✅ Model field: string, required
- ✅ Role field: string, required
- ✅ Personality field: string, required
- ✅ Temperature: number, 0-2 range, step 0.1
- ✅ MaxTokens: number, 1-4000 range, integer
- ✅ TopP: number, 0-1 range, step 0.01
- ✅ SystemPrompt: string, optional, max 5000 characters

### Mapping Functions

- ✅ `mapAgentsPersistenceToUI` in `packages/ui-shared/src/mapping/agents/mapAgentsPersistenceToUI.ts`
- ✅ `mapAgentsUIToPersistence` in `packages/ui-shared/src/mapping/agents/mapAgentsUIToPersistence.ts`
- ✅ Handle timestamp conversion correctly
- ✅ Preserve all data integrity during transformation
- ✅ Follow exact patterns from roles/personalities mapping functions

### Barrel Exports

- ✅ Export all types from `packages/ui-shared/src/types/settings/index.ts`
- ✅ Export schema from `packages/ui-shared/src/schemas/index.ts`
- ✅ Export mapping functions from appropriate barrel files
- ✅ Maintain consistency with existing export patterns

## Implementation Guidance

### Technical Approach

- Copy structure exactly from roles/personalities implementations
- Use identical naming conventions with "Agent" prefix
- Reuse existing validation patterns from roleSchema/personalitySchema
- Follow established file organization patterns

### Code Patterns to Follow

- Use `z.infer<typeof schema>` for deriving form data types
- Use interface extension pattern for view models
- Keep mapping functions simple with clear input/output types
- Use consistent error handling in validation

## Testing Requirements

### Schema Validation Tests

- Test valid agent data passes validation
- Test each field's validation rules (length, type, range)
- Test required vs optional field enforcement
- Test edge cases (empty strings, boundary values)

### Mapping Function Tests

- Test round-trip data integrity (UI → Persistence → UI)
- Test handling of missing optional fields
- Test timestamp preservation and conversion
- Test array handling for multiple agents

### Type Safety Tests

- Verify TypeScript compilation with all types
- Test type compatibility between UI and persistence formats
- Verify proper exports through barrel files

## Security Considerations

### Input Validation

- Sanitize name field to prevent injection attacks
- Validate system prompt content for unsafe scripts
- Ensure temperature/tokens/topP values within safe ranges
- Prevent prototype pollution in object mapping

### Data Protection

- No sensitive data in agent configurations
- System prompt content properly escaped when displayed
- Model/role/personality IDs validated against existing data

## Performance Requirements

### Validation Performance

- Schema validation completes in < 10ms per agent
- Mapping functions handle arrays of 100+ agents efficiently
- No memory leaks in repeated validation operations

### Memory Usage

- Types have minimal runtime overhead
- Mapping functions use efficient data transformation
- Schema compilation cached appropriately

## Dependencies

None - this is the foundational feature for the data layer
