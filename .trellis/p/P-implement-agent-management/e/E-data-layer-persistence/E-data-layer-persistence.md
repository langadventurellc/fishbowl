---
id: E-data-layer-persistence
title: Data Layer & Persistence
status: open
priority: medium
parent: P-implement-agent-management
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
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
