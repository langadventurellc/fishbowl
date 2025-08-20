---
id: T-create-defaults-persistence
title: Create defaults persistence layer and IPC handlers
status: open
priority: high
parent: F-defaults-management-feature
prerequisites:
  - T-implement-defaults-state
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-20T01:56:38.902Z
updated: 2025-08-20T01:56:38.902Z
---

Implement persistence layer and IPC communication for agent defaults settings, following the established patterns used by roles and personalities.

## Context

Agent defaults need to be persisted to disk and communicated between the main and renderer processes. This follows the same architectural patterns as existing agents, roles, and personalities persistence.

## Implementation Requirements

### Persistence Schema

Create persistence schema for defaults:

```typescript
// packages/shared/src/types/settings/persistedAgentDefaults.ts
export interface PersistedAgentDefaults {
  schemaVersion: string;
  defaults: {
    temperature: number;
    maxTokens: number;
    topP: number;
  };
  lastUpdated: string;
}
```

### Persistence Adapter

Following the AgentsPersistenceAdapter pattern:

- Create `AgentDefaultsPersistenceAdapter` interface
- Implement `DefaultsRepository` following AgentsRepository pattern
- Include load/save/reset operations
- Use FileStorageService for persistence

### IPC Channels

Add defaults-specific IPC channels:

```typescript
export const AGENT_DEFAULTS_CHANNELS = {
  LOAD: "agent-defaults:load",
  SAVE: "agent-defaults:save",
  RESET: "agent-defaults:reset",
} as const;
```

### IPC Handlers

Create IPC handlers following settingsHandlers pattern:

- `setupAgentDefaultsHandlers()` function
- Handle load/save/reset operations
- Proper error handling and serialization
- Logging for debugging

### Storage Location

- Store defaults in `agent-defaults.json` in user data directory
- Follow same directory structure as other settings
- Ensure proper file permissions and error handling

## Technical Approach

1. Create persistence schema and validation
2. Implement DefaultsRepository following AgentsRepository pattern
3. Create IPC channel definitions
4. Implement IPC handlers with error handling
5. Add handlers to main process initialization
6. Create persistence adapter for store integration

## File Structure

```
packages/shared/src/types/settings/
  ├── persistedAgentDefaults.ts
  └── agentDefaultsSchema.ts

apps/desktop/src/data/repositories/
  └── DefaultsRepository.ts

apps/desktop/src/electron/
  ├── agentDefaultsHandlers.ts
  └── main.ts (register handlers)

apps/desktop/src/shared/ipc/
  ├── agentDefaultsChannels.ts
  └── agentDefaultsTypes.ts

packages/ui-shared/src/adapters/
  └── AgentDefaultsPersistenceAdapter.ts
```

## Acceptance Criteria

- ✅ PersistedAgentDefaults schema with validation
- ✅ DefaultsRepository with load/save/reset methods
- ✅ IPC channels for defaults communication
- ✅ IPC handlers with proper error handling
- ✅ Agent defaults persist to agent-defaults.json
- ✅ Load defaults from storage on app startup
- ✅ Reset clears storage and restores factory defaults
- ✅ All persistence errors handled gracefully
- ✅ Unit tests for repository and IPC handlers
- ✅ Integration with existing logging infrastructure

## Dependencies

- Requires T-implement-defaults-state for store integration
- Uses existing FileStorageService infrastructure
- Follows patterns from AgentsRepository and settingsHandlers

## Testing Requirements

- Unit tests for DefaultsRepository operations
- Unit tests for IPC handlers
- Test file system error handling
- Test schema validation
- Test persistence across app restarts

## Security Considerations

- Validate all input data with schemas
- Ensure proper file permissions for storage
- Sanitize file paths and prevent directory traversal
- Follow existing security patterns from other repositories
