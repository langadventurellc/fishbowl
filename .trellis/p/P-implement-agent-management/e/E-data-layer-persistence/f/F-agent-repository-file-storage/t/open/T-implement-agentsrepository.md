---
id: T-implement-agentsrepository
title: Implement AgentsRepository class with file operations and unit tests
status: open
priority: high
parent: F-agent-repository-file-storage
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-19T00:16:58.151Z
updated: 2025-08-19T00:16:58.151Z
---

## Context

Implement the core AgentsRepository class following the exact pattern from PersonalitiesRepository. This class handles JSON file operations for agent persistence with atomic writes, validation, and error recovery.

**Reference Implementation**: `apps/desktop/src/data/repositories/PersonalitiesRepository.ts`
**File Location**: `apps/desktop/src/data/repositories/AgentsRepository.ts`
**Data Types**: Available from prerequisite F-agent-data-types-validation

## Implementation Requirements

### Repository Class Structure

- Copy PersonalitiesRepository.ts structure exactly
- Replace "personalities" with "agents" throughout
- Use `userData/agents.json` as file path
- Constructor accepts dataPath parameter

### Required Methods

- `loadAgents()`: Reads and validates agents from file, returns Promise<PersistedAgentsSettingsData>
- `saveAgents(data: PersistedAgentsSettingsData)`: Atomically writes agents to file, returns Promise<void>
- `resetAgents()`: Restores default empty state, returns Promise<void>
- `createDefaultAgentsSettings()`: Utility function returning default empty agents list

### File Storage Integration

- Use existing FileStorageService from shared package
- Integrate with NodeFileSystemBridge for file operations
- Use NodeCryptoUtils for secure operations
- Use NodePathUtils for path handling
- Implement atomic writes to prevent file corruption

### Data Validation & Error Handling

- Validate loaded JSON against persistedAgentsSettingsSchema
- Handle invalid JSON with graceful fallback to defaults
- Log validation errors with proper context using createLoggerSync
- Component context: "AgentsRepository"
- Handle FileStorageError, JSON parsing errors, schema validation errors

### Default Data Handling

- Create default empty agents list on first load
- Automatically save default data to file
- Proper timestamp initialization for metadata

## Acceptance Criteria

- ✅ AgentsRepository class follows PersonalitiesRepository pattern exactly
- ✅ All three methods (load/save/reset) implemented with proper error handling
- ✅ Uses FileStorageService for all file operations with atomic writes
- ✅ Validates data using persistedAgentsSettingsSchema from prerequisite feature
- ✅ Creates default empty state when file missing or invalid
- ✅ Proper logging integration with debug/info/error messages
- ✅ Comprehensive unit tests covering all methods and error scenarios
- ✅ Tests cover: valid file loading, missing file (creates defaults), invalid JSON (fallback), successful save, save failure, reset operation
- ✅ File operations complete in < 500ms

## Testing Requirements (Include in Same Task)

Create comprehensive unit tests in `apps/desktop/src/data/repositories/__tests__/AgentsRepository.test.ts`:

- Test loadAgents() with valid file
- Test loadAgents() with missing file (creates defaults)
- Test loadAgents() with invalid JSON (fallback to defaults)
- Test saveAgents() with valid data
- Test saveAgents() with file write failure
- Test resetAgents() operation
- Test error handling for all scenarios
- Mock FileStorageService and validation dependencies

## Technical Notes

- Follow exact logging patterns from PersonalitiesRepository
- Use same error handling patterns and message formats
- Maintain identical method signatures and return types
- Use path.join() for cross-platform file path compatibility
