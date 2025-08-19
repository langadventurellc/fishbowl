---
id: P-implement-agent-management
title: Implement Agent Management System for Settings
status: in-progress
priority: medium
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
  packages/ui-shared/src/types/settings/index.ts:
    Added export for AgentViewModel
    to complete agent type exports; Exported PersonalitySelectProps type for use
    across the application; Added export for RoleSelectProps interface; Added
    exports for new shared types
  packages/ui-shared/src/mapping/index.ts: Added exports for agents and personalities mapping functions
  packages/shared/src/types/agents/index.ts: Created new barrel file exporting agent persistence types and schemas
  packages/shared/src/services/storage/utils/index.ts: Added export for createDefaultAgentsSettings utility function
  packages/ui-shared/src/__tests__/agentExports.test.ts: Created integration tests verifying all agent exports are accessible
  packages/shared/src/__tests__/agentExports.test.ts: Created tests for shared package agent exports
  packages/ui-shared/src/__tests__/agentImportPaths.test.ts: Created tests verifying common import patterns work correctly
  apps/desktop/src/data/repositories/AgentsRepository.ts: Implemented complete
    AgentsRepository class following PersonalitiesRepository pattern with file
    operations, validation, error handling, and logging
  apps/desktop/src/data/repositories/__tests__/AgentsRepository.test.ts:
    Created comprehensive unit test suite with 18 test cases covering all
    repository functionality including edge cases and error scenarios
  apps/desktop/src/components/settings/agents/AgentForm.tsx: Replaced with
    temporary blank component to resolve type conflicts during backend
    implementation phase; Replaced stub component with complete React Hook Form
    implementation using zodResolver, comprehensive field validation, character
    counters, loading states, and unsaved changes detection; Updated imports to
    include RoleSelect and PersonalitySelect components, replaced Input field
    for role with RoleSelect component using FormField and Controller
    integration, replaced Input field for personality with PersonalitySelect
    component using the same pattern, ensuring consistent component integration
    with proper placeholder text and disabled state handling; Updated name field
    and system prompt field to include character counters positioned in label
    area using flex layout, added maxLength attributes (100 for name, 5000 for
    system prompt), and implemented real-time updates using form.watch();
    Updated temperature and topP sliders to use shadcn/ui Slider component with
    real-time descriptions. Updated maxTokens input formatting and description
    display. Added proper imports for getSliderDescription utility. All controls
    now show current values with descriptive text that updates immediately as
    users interact with them.
  apps/desktop/src/data/repositories/agentsRepositoryManager.ts:
    Created new agentsRepositoryManager singleton following exact pattern from
    personalitiesRepositoryManager. Implements get(), initialize(), and reset()
    methods with proper error handling and singleton pattern.
  apps/desktop/src/data/repositories/__tests__/agentsRepositoryManager.test.ts:
    Created comprehensive unit test suite with 17 test cases covering singleton
    behavior, initialization/cleanup lifecycle, error handling, edge cases, and
    integration with AgentsRepository. All tests passing.
  packages/ui-shared/src/types/agents/persistence/AgentsPersistenceAdapter.ts:
    Created persistence interface following RolesPersistenceAdapter pattern with
    save, load, reset methods
  packages/ui-shared/src/types/agents/persistence/AgentsPersistenceError.ts:
    Created error class following RolesPersistenceError pattern for
    operation-specific error handling
  packages/ui-shared/src/types/agents/persistence/index.ts:
    Created barrel export
    for persistence types; Added export for TestAgentsPersistenceAdapter to make
    it available for testing
  packages/ui-shared/src/types/agents/PendingOperation.ts: Created PendingOperation interface for agent async operation tracking
  packages/ui-shared/src/types/agents/index.ts: Created barrel export for all agent types
  packages/ui-shared/src/types/index.ts: Added agents export to main types barrel
  packages/ui-shared/src/stores/AgentsState.ts: Created AgentsState interface following RolesState pattern exactly
  packages/ui-shared/src/stores/AgentsActions.ts:
    Created AgentsActions interface
    following RolesActions pattern with complete CRUD and persistence methods
  packages/ui-shared/src/stores/AgentsStore.ts: Created AgentsStore type composition combining State and Actions
  packages/ui-shared/src/stores/__tests__/AgentsState.test.ts: Created unit tests validating AgentsState interface structure and types
  packages/ui-shared/src/stores/__tests__/AgentsActions.test.ts: Created unit tests validating AgentsActions interface method signatures
  packages/ui-shared/src/stores/__tests__/AgentsStore.test.ts: Created unit tests validating AgentsStore type composition and inheritance
  packages/ui-shared/src/stores/useAgentsStore.ts: Created new Zustand store for
    agent management with complete CRUD operations, auto-save, error handling,
    and persistence integration following established patterns
  packages/ui-shared/src/stores/__tests__/useAgentsStore.test.ts:
    Created comprehensive unit test suite with 35 tests covering store
    initialization, CRUD operations, error handling, validation, and edge cases
  packages/ui-shared/src/types/agents/persistence/TestAgentsPersistenceAdapter.ts:
    Created TestAgentsPersistenceAdapter class with comprehensive test utilities
    including error simulation, call tracking, and data verification methods
  packages/ui-shared/src/stores/index.ts: Added export for useAgentsStore to make it available to consumers
  apps/desktop/src/shared/ipc/agentsConstants.ts: Created agent IPC channel
    constants (AGENTS_CHANNELS) following exact pattern from
    PERSONALITIES_CHANNELS
  apps/desktop/src/shared/ipc/agents/loadRequest.ts: Created AgentsLoadRequest
    type definition for load operation (no parameters required)
  apps/desktop/src/shared/ipc/agents/saveRequest.ts: Created AgentsSaveRequest
    type definition for save operation with PersistedAgentsSettingsData
  apps/desktop/src/shared/ipc/agents/resetRequest.ts: Created AgentsResetRequest
    type definition for reset operation (no parameters required)
  apps/desktop/src/shared/ipc/agents/loadResponse.ts: Created AgentsLoadResponse
    type extending IPCResponse with PersistedAgentsSettingsData
  apps/desktop/src/shared/ipc/agents/saveResponse.ts: Created AgentsSaveResponse type extending IPCResponse with void data type
  apps/desktop/src/shared/ipc/agents/resetResponse.ts:
    Created AgentsResetResponse
    type extending IPCResponse with PersistedAgentsSettingsData
  apps/desktop/src/shared/ipc/index.ts: Updated barrel file to export all agent
    constants and types (constants, request types, response types)
  apps/desktop/src/shared/ipc/__tests__/agentsIPC.test.ts: Created comprehensive
    unit tests for agent IPC constants and type definitions with 9 passing test
    cases
  apps/desktop/src/electron/agentsHandlers.ts: Created new file with
    setupAgentsHandlers function and load handler implementation following
    personalitiesHandlers pattern; Added save handler implementation with
    AgentsSaveRequest validation, repository integration, and error handling;
    Added reset handler following personalitiesHandlers pattern, with
    AgentsResetResponse import, reset IPC handler registration, and
    comprehensive error handling with confirmation logging
  apps/desktop/src/electron/__tests__/agentsHandlers.test.ts: Created
    comprehensive test suite with 5 test cases covering success scenarios, error
    handling, and repository integration; Added comprehensive test coverage for
    save handler including success, validation errors, repository failures, and
    edge cases; Added AgentsResetResponse import, updated mock repository with
    resetAgents method, updated setup test to verify reset handler registration,
    and added comprehensive reset handler test suite covering success, error,
    and repository initialization failure scenarios
  apps/desktop/src/electron/main.ts: Added import for setupAgentsHandlers and
    added function call with proper error handling and logging, following the
    exact pattern from personalities handlers setup
  apps/desktop/src/electron/preload.ts: Added AGENTS_CHANNELS import, agent IPC
    types (AgentsLoadResponse, AgentsSaveRequest, AgentsSaveResponse,
    AgentsResetResponse), PersistedAgentsSettingsData type, and complete agents
    object with load(), save(), and reset() methods following personalities
    pattern
  apps/desktop/src/types/electron.d.ts:
    Added agents interface to ElectronAPI with
    comprehensive JSDoc documentation for load, save, and reset methods with
    proper type signatures
  apps/desktop/src/components/settings/agents/PersonalitySelect.tsx:
    Created PersonalitySelect dropdown component with loading, error, empty, and
    success states using shadcn/ui Select and usePersonalitiesStore integration;
    Added aria-label for accessibility consistency, conditional retry button
    display, and consistent error handling patterns
  packages/ui-shared/src/types/settings/PersonalitySelectProps.ts:
    Added TypeScript interface for PersonalitySelect component props including
    value, onChange, disabled, and placeholder; Updated to extend
    BaseSelectProps interface
  apps/desktop/src/components/settings/agents/__tests__/PersonalitySelect.test.tsx:
    Added comprehensive test suite with 23 tests covering all component states,
    user interactions, accessibility features, and edge cases; Updated test to
    include isRetryable property in error mock to align with consistent error
    handling patterns
  packages/ui-shared/src/types/settings/RoleSelectProps.ts:
    Created interface for
    RoleSelect component props with value, onChange, disabled, and placeholder
    properties; Updated to extend BaseSelectProps interface
  apps/desktop/src/components/settings/agents/RoleSelect.tsx: Created reusable
    RoleSelect dropdown component that integrates with useRolesStore, handles
    all states (loading, error, empty, success), uses shadcn/ui Select
    components, includes ARIA labels and accessibility features, shows role
    names with truncated descriptions
  apps/desktop/src/components/settings/agents/index.ts: Added export for
    RoleSelect component; Added ModelSelect and PersonalitySelect to barrel
    exports
  apps/desktop/src/components/settings/agents/__tests__/RoleSelect.test.tsx:
    Created comprehensive unit tests covering all states, functionality,
    accessibility, edge cases, and component behavior with 100% test coverage
  apps/desktop/src/hooks/useLlmModels.ts:
    Created new hook to fetch and transform
    LLM configurations into model options with provider information
  apps/desktop/src/components/settings/agents/ModelSelect.tsx:
    Created new ModelSelect component following RoleSelect pattern with provider
    grouping and shadcn/ui Select integration; Updated to import types from
    shared package instead of local definition
  apps/desktop/src/hooks/__tests__/useLlmModels.test.tsx:
    Added comprehensive unit
    tests for useLlmModels hook covering all states and functionality
  apps/desktop/src/components/settings/agents/__tests__/ModelSelect.test.tsx:
    Added comprehensive unit tests for ModelSelect component covering loading,
    error, empty, and success states
  packages/ui-shared/src/types/settings/BaseSelectProps.ts: Created shared base
    interface for all selection components with consistent prop structure
  packages/ui-shared/src/types/settings/SelectWithLoadingProps.ts:
    Created extended interface for selection components that handle loading
    states
  packages/ui-shared/src/types/settings/SelectOption.ts: Created generic option structure for consistency across selection components
  packages/ui-shared/src/types/settings/ModelSelectProps.ts: Updated to extend BaseSelectProps interface
  apps/desktop/src/components/settings/agents/__tests__/SelectionComponents.integration.test.tsx:
    Created comprehensive integration test suite verifying consistent behavior
    patterns across all selection components
log: []
schema: v1.0
childrenIds:
  - E-agent-management-features
  - E-data-layer-persistence
  - E-ui-components
created: 2025-08-18T22:42:05.128Z
updated: 2025-08-18T22:42:05.128Z
---

## Executive Summary

Implement a comprehensive agent management system within the settings model that allows users to create, configure, and manage AI agents with specific models, roles, personalities, and LLM configuration parameters. The system will follow established patterns from the existing roles and personalities implementations.

## Functional Requirements

### Agent Data Model

Each agent configuration will store:

- **Name**: Unique identifier for the agent (required, 2-100 characters)
- **LLM Model**: Selected from models available through configured LLM providers
  - Models are determined by the LLM configurations that have been set up in the system
  - Each LLM configuration defines a provider (OpenAI or Anthropic) with its API key
  - The model dropdown should show models from all configured providers
  - Model format should include both the model name and provider (e.g., "GPT-4 (OpenAI)")
- **Role**: Reference to existing role definitions in the system
- **Personality**: Reference to existing personality definitions in the system
- **LLM Configuration**:
  - Temperature (0-2, step 0.1)
  - Max Tokens (1-4000)
  - Top P (0-1, step 0.01)
- **System Prompt**: Optional custom system prompt (max 5000 characters)

### Model Selection Integration

The model selection dropdown must:

- Query the available LLM configurations from the system using `useLlmConfig` hook
- Derive available models based on configured providers:
  - **OpenAI**: GPT-4, GPT-3.5 Turbo, etc.
  - **Anthropic**: Claude 3.5 Sonnet, Claude 3 Haiku, etc.
- Display models only from providers that have been configured with API keys
- Show provider name alongside model name for clarity
- Handle case where no LLM configurations exist (show appropriate message)

### User Interface Structure

The agent section will have two main tabs:

1. **Library Tab**: Display and manage saved agents
   - List view of all agents with cards showing name, model, role
   - Create new agent button
   - Edit and delete functionality for each agent
   - No search functionality (removed from prototype)
2. **Defaults Tab**: Configure default settings for new agents
   - Temperature slider with description
   - Max tokens input field
   - Top P slider with description
   - Reset to defaults button
   - Settings preview panel

### Core Functionality

- **CRUD Operations**: Create, Read, Update, Delete agents
- **Persistence**: Store agents in JSON file in user data directory
- **Validation**: Zod schema validation for all agent data
- **Form Management**: React Hook Form for agent creation/editing
- **State Management**: Zustand store for reactive state
- **IPC Communication**: Electron IPC handlers for main/renderer process communication

## Technical Requirements

### Component Architecture

The agent management system uses a modular component architecture with dedicated selection components:

**Selection Components** (Reusable, single-responsibility):

- **ModelSelect**: Queries LLM configurations and displays available models
- **RoleSelect**: Loads roles from useRolesStore and provides dropdown selection
- **PersonalitySelect**: Loads personalities from usePersonalitiesStore and provides dropdown selection

Each selection component:

- Manages its own data fetching and loading states
- Provides consistent error handling
- Follows the same UI patterns (using shadcn/ui Select components)
- Emits simple onChange events with selected values
- Handles empty states gracefully

**Benefits of this approach**:

- Form components remain simple and focused
- Selection logic is reusable across different forms
- Testing is easier with isolated components
- Consistent behavior across the application

### Architecture Overview

Follow the established three-layer architecture pattern:

```mermaid
graph TD
    UI[UI Layer - React Components]
    Store[State Layer - Zustand Store]
    Persistence[Persistence Layer - JSON File]
    LLMConfig[LLM Config System]

    UI -->|uses| Store
    UI -->|queries| LLMConfig
    Store -->|communicates via IPC| Persistence

    subgraph "Renderer Process"
        UI
        Store
        LLMConfig
    end

    subgraph "Main Process"
        Persistence
    end
```

### Technology Stack

- **Frontend**: React with TypeScript
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation
- **Persistence**: JSON file storage using FileStorageService
- **IPC**: Electron IPC for main/renderer communication
- **Styling**: Tailwind CSS with shadcn/ui components
- **LLM Integration**: useLlmConfig hook for provider/model data

### File Structure Pattern

Following existing patterns from roles and personalities:

```
packages/ui-shared/
├── src/
│   ├── stores/
│   │   ├── useAgentsStore.ts
│   │   ├── AgentsState.ts
│   │   └── AgentsActions.ts
│   ├── types/
│   │   └── settings/
│   │       ├── AgentFormData.ts
│   │       ├── AgentViewModel.ts
│   │       ├── AgentsSectionProps.ts
│   │       ├── RoleSelectProps.ts
│   │       └── PersonalitySelectProps.ts
│   ├── schemas/
│   │   └── agentSchema.ts
│   └── mapping/
│       └── agents/
│           ├── mapAgentsPersistenceToUI.ts
│           └── mapAgentsUIToPersistence.ts

packages/shared/
├── src/
│   └── types/
│       └── agents/
│           └── PersistedAgentsSettingsData.ts

apps/desktop/
├── src/
│   ├── electron/
│   │   └── agentsHandlers.ts
│   ├── data/
│   │   └── repositories/
│   │       ├── AgentsRepository.ts
│   │       └── agentsRepositoryManager.ts
│   └── components/
│       └── settings/
│           ├── agents/
│           │   ├── AgentsSection.tsx (modified)
│           │   ├── AgentForm.tsx (simplified)
│           │   ├── AgentCard.tsx (existing)
│           │   └── LibraryTab.tsx (new)
│           ├── ModelSelect.tsx (enhanced)
│           ├── RoleSelect.tsx (new)
│           └── PersonalitySelect.tsx (new)
```

## Non-Functional Requirements

### Code Quality Standards

- **Simplicity**: Follow KISS, YAGNI, and SRP principles
- **Pattern Consistency**: Reuse existing patterns from roles/personalities
- **No Over-Engineering**: No lock files, transactional support, or backups
- **Testing**: Unit tests only, no integration or performance testing
- **Clean Code**: Functions ≤ 20 LOC, files ≤ 400 LOC

### Performance Requirements

- Form validation should be instant (< 100ms)
- File operations should complete within 500ms
- UI should remain responsive during all operations

### Security Requirements

- Validate all user input with Zod schemas
- Sanitize file paths to prevent directory traversal
- No storage of sensitive data in plain text

## Detailed Acceptance Criteria

### Agent Creation

- User can create a new agent with all required fields
- Name must be unique across all agents
- **Model selection dropdown populated from LLM configurations**:
  - Shows only models from configured providers
  - Displays provider name with each model
  - Shows message if no LLM configs exist
  - Updates dynamically when LLM configs change
- **Role selection dropdown (RoleSelect component)**:
  - Populates from existing roles via useRolesStore
  - Shows role name and truncated description
  - Handles loading and error states
  - Validates selection is required
- **Personality selection dropdown (PersonalitySelect component)**:
  - Populates from existing personalities via usePersonalitiesStore
  - Shows personality name
  - Handles loading and error states
  - Validates selection is required
- LLM configuration sliders provide real-time feedback
- System prompt is optional and has character counter
- Form validates on submit with clear error messages
- Successfully created agents appear in the library immediately

### Agent Editing

- User can edit existing agents from the library
- Form pre-populates with current agent data
- Name uniqueness validation excludes current agent
- **Model dropdown shows current model even if provider no longer configured**
- Changes are validated before saving
- Unsaved changes trigger confirmation dialog on cancel
- Successfully edited agents update in the library immediately

### Agent Deletion

- User can delete agents from the library
- Deletion requires confirmation dialog
- Deleted agents are immediately removed from the library
- No orphaned references remain after deletion

### Defaults Management

- Default settings apply to new agent creation
- Temperature slider shows descriptive text for current value
- Max tokens input validates numeric range (1-4000)
- Top P slider shows descriptive text for current value
- Reset button restores factory defaults with confirmation
- Settings preview shows human-readable descriptions

### Data Persistence

- Agents persist across application restarts
- File corruption handling with fallback to empty state
- Atomic writes prevent data loss during saves
- Auto-save with debouncing (500ms delay)

### UI/UX Requirements

- Keyboard navigation support for all interactive elements
- Screen reader announcements for state changes
- Loading states during async operations
- Error messages displayed prominently
- Success feedback for user actions
- Responsive design for different screen sizes

## Integration Requirements

### Dependencies on Existing Systems

- **LLM Config System**: Model selection must query configured providers
- **Roles System**: Agent references must validate against existing roles
- **Personalities System**: Agent references must validate against existing personalities
- **Settings Modal**: Integrate with existing navigation structure
- **File Storage Service**: Use existing file operation utilities

### Component Implementation Details

**ModelSelect Component**:

```typescript
interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}
// Uses useLlmConfig hook to get configurations
// Maps providers to available models
// Shows "No LLM configurations" when empty
```

**RoleSelect Component**:

```typescript
interface RoleSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
// Uses useRolesStore to get available roles
// Shows role name with optional description preview
// Handles loading and error states
```

**PersonalitySelect Component**:

```typescript
interface PersonalitySelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
// Uses usePersonalitiesStore to get available personalities
// Shows personality name
// Handles loading and error states
```

### Model Provider Mapping

Define clear mapping between providers and their available models:

```typescript
// Example model mapping structure
const PROVIDER_MODELS = {
  openai: [
    { id: "gpt-4", name: "GPT-4" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  ],
  anthropic: [
    { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
    { id: "claude-3-haiku", name: "Claude 3 Haiku" },
  ],
};
```

### API Contracts

- IPC channel names follow pattern: `agents:load`, `agents:save`, `agents:reset`
- Data structures compatible with existing persistence patterns
- Error handling consistent with other settings sections

## Constraints and Limitations

### Technical Constraints

- No backwards compatibility required (greenfield)
- No migration from existing data needed
- Single JSON file for all agents storage
- No real-time collaboration features
- Models limited to those available from configured providers

### Design Constraints

- Remove search functionality from library
- Remove templates tab entirely
- Keep UI consistent with existing settings sections
- Use existing component library (shadcn/ui)

## Success Metrics

- All CRUD operations complete without errors
- Form validation prevents invalid data entry
- Data persists correctly across sessions
- UI remains responsive during all operations
- Code follows established patterns consistently
- Model selection correctly reflects configured LLM providers
