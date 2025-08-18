---
id: F-agent-repository-file-storage
title: Agent Repository & File Storage
status: open
priority: medium
parent: E-data-layer-persistence
prerequisites:
  - F-agent-data-types-validation
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-18T23:05:18.017Z
updated: 2025-08-18T23:05:18.017Z
---

## Purpose and Functionality

Implement the repository class and file storage infrastructure for agent persistence, following the exact patterns from PersonalitiesRepository. Handles JSON file operations with atomic writes, validation, and error recovery.

## Key Components to Implement

### Repository Class

- `AgentsRepository` class for file operations
- Atomic writes using FileStorageService
- Data validation with schema
- Error handling and logging
- Default data creation on first load

### Repository Manager

- `agentsRepositoryManager` singleton pattern
- Dependency injection for testing
- Initialization and cleanup methods
- Thread-safe access to repository instance

### File Operations

- Read/write agents.json file
- Atomic file writes to prevent corruption
- Schema validation of loaded data
- Backup and recovery mechanisms

## Detailed Acceptance Criteria

### AgentsRepository Class

- ✅ Located in `apps/desktop/src/data/repositories/AgentsRepository.ts`
- ✅ Follows exact pattern from PersonalitiesRepository
- ✅ Uses FileStorageService for all file operations
- ✅ File path: `userData/agents.json`
- ✅ Constructor accepts dataPath parameter

### Repository Methods

- ✅ `loadAgents()`: Reads and validates agents from file
- ✅ `saveAgents()`: Atomically writes agents to file
- ✅ `resetAgents()`: Restores default empty state
- ✅ All methods return Promise with proper error handling
- ✅ Methods match PersonalitiesRepository signatures exactly

### File Storage Integration

- ✅ Uses existing FileStorageService from shared package
- ✅ Integrates with NodeFileSystemBridge for file operations
- ✅ Uses NodeCryptoUtils for secure operations
- ✅ Uses NodePathUtils for path handling
- ✅ Atomic writes prevent file corruption

### Data Validation

- ✅ Validates loaded JSON against persistedAgentsSettingsSchema
- ✅ Handles invalid JSON with graceful fallback
- ✅ Validates individual agent data integrity
- ✅ Logs validation errors with proper context
- ✅ Creates default empty state when validation fails

### Default Data Handling

- ✅ Creates default empty agents list on first load
- ✅ Automatically saves default data to file
- ✅ `createDefaultAgentsSettings()` utility function
- ✅ Proper timestamp initialization for metadata

### Error Handling

- ✅ FileStorageError handling for file operations
- ✅ JSON parsing error handling
- ✅ Schema validation error handling
- ✅ Proper error logging with context
- ✅ User-friendly error messages

### Repository Manager

- ✅ Located in `apps/desktop/src/data/repositories/agentsRepositoryManager.ts`
- ✅ Singleton pattern for repository access
- ✅ `get()` method returns repository instance
- ✅ `initialize()` method for setup
- ✅ `cleanup()` method for teardown
- ✅ Follows exact pattern from personalitiesRepositoryManager

### Logging Integration

- ✅ Uses createLoggerSync from shared package
- ✅ Component context: "AgentsRepository"
- ✅ Debug logs for operations
- ✅ Error logs with proper error objects
- ✅ Info logs for successful operations

## Implementation Guidance

### Technical Approach

- Copy PersonalitiesRepository.ts structure exactly
- Replace "personalities" with "agents" throughout
- Maintain identical error handling patterns
- Use same logging patterns and message formats

### File Path Management

- Use path.join() for cross-platform compatibility
- Default filename: "agents.json"
- Store in user data directory
- Handle path resolution errors gracefully

### Data Flow

1. Load: File → JSON → Validation → UI Types
2. Save: UI Types → Persistence Types → JSON → File
3. Use mapping functions for type conversion
4. Validate at each transformation step

## Testing Requirements

### Repository Tests

- ✅ Test loadAgents() with valid file
- ✅ Test loadAgents() with missing file (creates defaults)
- ✅ Test loadAgents() with invalid JSON (fallback to defaults)
- ✅ Test saveAgents() with valid data
- ✅ Test saveAgents() with file write failure
- ✅ Test resetAgents() operation

### File Operations Tests

- ✅ Test atomic write behavior
- ✅ Test file corruption scenarios
- ✅ Test permission error handling
- ✅ Test disk space error handling
- ✅ Test concurrent file access

### Repository Manager Tests

- ✅ Test singleton pattern behavior
- ✅ Test initialization and cleanup
- ✅ Test multiple calls to get() return same instance
- ✅ Test error handling during initialization

### Integration Tests

- ✅ Test full read/write cycle with real files
- ✅ Test data persistence across repository instances
- ✅ Test error recovery scenarios
- ✅ Test schema validation with real data

## Security Considerations

### File Security

- Validate file paths to prevent directory traversal
- Use secure temp files for atomic writes
- Proper file permissions on agents.json
- No sensitive data in agent configurations

### Data Integrity

- Atomic writes prevent partial file corruption
- Schema validation prevents invalid data storage
- Backup previous file content before overwrite
- Proper error handling maintains data consistency

## Performance Requirements

### File Operations

- Load operations complete in < 500ms
- Save operations complete in < 500ms
- Atomic writes minimize disk I/O
- Efficient JSON parsing for large agent lists

### Memory Usage

- Minimal memory overhead for file operations
- Proper cleanup of temporary resources
- No memory leaks from file handles
- Efficient data structure usage

## Dependencies

- F-agent-data-types-validation (for types and schemas)
- FileStorageService from shared package
- Node utilities (NodeFileSystemBridge, NodeCryptoUtils, NodePathUtils)
