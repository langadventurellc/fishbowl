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
  packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts:
    Created comprehensive Zod schema for agent persistence validation with
    security limits and clear error messages
  packages/shared/src/types/agents/PersistedAgentData.ts: Created type definition for individual agent data derived from schema
  packages/shared/src/types/agents/PersistedAgentsSettingsData.ts: Created type definition for complete agents settings file structure
  packages/shared/src/services/storage/utils/agents/createDefaultAgentsSettings.ts: Created utility function for generating default empty agents settings
  packages/shared/src/services/storage/utils/agents/index.ts: Created barrel export file for agents utilities
  packages/shared/src/services/storage/utils/agents/__tests__/createDefaultAgentsSettings.test.ts: Created comprehensive unit tests for default settings utility
  packages/shared/src/types/agents/__tests__/persistedAgentsSettingsSchema.test.ts:
    Created extensive unit tests for schema validation including edge cases and
    validation failures
  packages/ui-shared/src/mapping/agents/mapAgentsPersistenceToUI.ts:
    Created mapping function to transform persistence agent data to UI view
    models
  packages/ui-shared/src/mapping/agents/mapAgentsUIToPersistence.ts:
    Created mapping function to transform UI agent data to persistence format
    with schema validation
  packages/ui-shared/src/mapping/agents/mapSingleAgentPersistenceToUI.ts:
    Created utility function for mapping individual agents from persistence to
    UI format with field normalization
  packages/ui-shared/src/mapping/agents/mapSingleAgentUIToPersistence.ts:
    Created utility function for mapping individual agents from UI to
    persistence format
  packages/ui-shared/src/mapping/agents/utils/normalizeAgentFields.ts: Created field normalization utility to ensure data constraints and quality
  packages/ui-shared/src/mapping/agents/index.ts: Created barrel export file for all agent mapping functions
  packages/ui-shared/src/mapping/agents/__tests__/mapAgentsPersistenceToUI.test.ts: Created comprehensive unit tests for persistence-to-UI mapping function
  packages/ui-shared/src/mapping/agents/__tests__/mapAgentsUIToPersistence.test.ts: Created unit tests for UI-to-persistence mapping function
  packages/ui-shared/src/mapping/agents/__tests__/roundTripMapping.test.ts:
    Created round-trip data integrity tests to ensure data preservation through
    conversion cycles
  packages/shared/src/types/settings/index.ts: Added exports for agent types and
    schemas to make them available to other packages
log: []
schema: v1.0
childrenIds:
  - T-create-agent-mapping-utilities
  - T-create-barrel-exports-and
  - T-create-agent-data-types-and
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
