---
id: E-data-layer-persistence
title: Data Layer & Persistence
status: in-progress
priority: medium
parent: P-implement-agent-management
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
  - F-agent-data-types-validation
  - F-agent-ipc-communication
  - F-agent-repository-file-storage
  - F-agent-store-implementation
created: 2025-08-18T22:54:30.854Z
updated: 2025-08-18T22:54:30.854Z
---

## Purpose and Goals

Implement the data layer and persistence infrastructure for the agent management system, following the exact patterns established by the roles and personalities implementations. This epic establishes the foundation for storing, retrieving, and managing agent configurations.

## Major Components and Deliverables

### Shared Package Types & Schemas

- Agent data types matching roles/personalities pattern
- Zod validation schema for agent data
- Persistence data types for JSON storage
- Mapping utilities between UI and persistence formats

### Zustand Store Implementation

- Agent store with CRUD operations
- State management following roles/personalities pattern
- Auto-save with debouncing (500ms)
- Error handling and rollback support

### Persistence Layer

- AgentsRepository class following roles/personalities pattern
- IPC handlers for main/renderer communication
- JSON file storage with atomic writes
- Repository manager for singleton access

## Detailed Acceptance Criteria

### Data Types

- ✅ AgentFormData type created with all required fields (name, model, role, personality, temperature, maxTokens, topP, systemPrompt)
- ✅ AgentViewModel type extends AgentFormData with id and timestamps
- ✅ PersistedAgentsSettingsData type for JSON storage
- ✅ All types exported through proper barrel files

### Validation Schema

- ✅ agentSchema validates all fields with proper constraints
- ✅ Name validation: 2-100 characters, alphanumeric with spaces/hyphens/underscores
- ✅ Model, role, personality fields required
- ✅ Temperature: 0-2 range validation
- ✅ Max tokens: 1-4000 range validation
- ✅ Top P: 0-1 range validation
- ✅ System prompt: optional, max 5000 characters

### Zustand Store

- ✅ useAgentsStore follows exact pattern from useRolesStore/usePersonalitiesStore
- ✅ CRUD operations: create, update, delete, loadAll
- ✅ Unique name validation (excluding current agent on edit)
- ✅ Auto-save with 500ms debounce
- ✅ Rollback on save failure
- ✅ Loading and error state management

### Persistence Implementation

- ✅ AgentsRepository class mirrors PersonalitiesRepository pattern
- ✅ File path: userData/agents.json
- ✅ Atomic writes using FileStorageService
- ✅ Default empty state on first load
- ✅ Validation of loaded data with schema
- ✅ Error handling with proper logging

### IPC Communication

- ✅ IPC channels: agents:load, agents:save, agents:reset
- ✅ Handlers follow personalitiesHandlers.ts pattern
- ✅ Error serialization for renderer process
- ✅ Repository manager for singleton pattern

## Technical Considerations

- Follow existing patterns exactly - no new patterns or optimizations
- Use existing utilities (FileStorageService, ConsoleLogger, etc.)
- Maintain consistency with roles/personalities implementations
- Keep code simple and straightforward

## Dependencies

None - this is the foundational epic

## Estimated Scale

- 3-4 features covering types, store, persistence, and IPC
- Each feature broken into 2-3 focused tasks
- Total: ~10-12 tasks
