---
id: T-implement-defaults-state
title: Implement defaults state management in useAgentsStore
status: open
priority: high
parent: F-defaults-management-feature
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-20T01:56:18.305Z
updated: 2025-08-20T01:56:18.305Z
---

Add defaults state management functionality to the existing useAgentsStore to handle agent default settings persistence and retrieval.

## Context

The DefaultsTab component exists but currently uses local state. The useAgentsStore needs to be extended to manage agent defaults that can be persisted and loaded across app sessions.

## Implementation Requirements

### State Management

- Add `defaults: AgentDefaults` to AgentsStore interface
- Add `setDefaults: (defaults: AgentDefaults) => void` action
- Add `getDefaults: () => AgentDefaults` getter
- Add `loadDefaults: () => Promise<void>` async action
- Add `saveDefaults: (defaults: AgentDefaults) => Promise<void>` async action
- Add `resetDefaults: () => Promise<void>` action

### Default Values

Follow the pattern from DefaultsTab component:

```typescript
const DEFAULT_AGENT_DEFAULTS: AgentDefaults = {
  temperature: 1.0,
  maxTokens: 1000,
  topP: 0.95,
};
```

### Error Handling

- Use existing error handling patterns from useAgentsStore
- Handle persistence errors gracefully
- Include validation using AgentDefaults schema

### Debounced Saving

- Implement debounced auto-save for defaults (500ms delay)
- Follow the same pattern as agents auto-save
- Use existing DEBOUNCE_DELAY_MS constant

## Technical Approach

1. Extend AgentsStore interface to include defaults-related state and actions
2. Add defaults property to store state with factory defaults
3. Implement async actions following existing patterns (loadAgents, saveAgents, etc.)
4. Add debounced save functionality similar to existing debouncedSave
5. Use existing error handling infrastructure
6. Follow validation patterns from other store actions

## Acceptance Criteria

- ✅ Store includes defaults state with proper typing
- ✅ setDefaults action updates state and triggers auto-save
- ✅ getDefaults returns current defaults
- ✅ loadDefaults loads from persistence adapter
- ✅ saveDefaults persists to storage with error handling
- ✅ resetDefaults restores factory defaults
- ✅ Auto-save triggers after 500ms of inactivity
- ✅ All validation errors are handled gracefully
- ✅ Unit tests verify all functionality works correctly

## Dependencies

- Requires AgentDefaults interface from @fishbowl-ai/ui-shared
- Integrates with existing AgentsPersistenceAdapter pattern
- Uses existing error handling and validation infrastructure

## Files to Modify

- `packages/ui-shared/src/stores/useAgentsStore.ts`
- `packages/ui-shared/src/stores/AgentsStore.ts` (interface)

## Testing Requirements

- Unit tests for all new actions and state changes
- Test error handling for persistence failures
- Test debounced auto-save functionality
- Test validation of defaults data
- Test reset to factory defaults functionality
