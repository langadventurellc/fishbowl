---
id: T-setup-agents-handlers
title: Setup agents handlers function and main process integration
status: done
priority: high
parent: F-agent-ipc-communication
prerequisites:
  - T-implement-agents-load-handler
  - T-implement-agents-save-handler
  - T-implement-agents-reset
affectedFiles:
  apps/desktop/src/electron/main.ts: Added import for setupAgentsHandlers and
    added function call with proper error handling and logging, following the
    exact pattern from personalities handlers setup
log:
  - Successfully integrated setupAgentsHandlers() function into main process
    initialization. Added import and function call to main.ts following the
    exact pattern from setupPersonalitiesHandlers(). The agents handlers were
    already properly implemented with load, save, and reset handlers, proper
    error handling, and logging. Integration includes try-catch error handling
    and debug logging matching the existing pattern.
schema: v1.0
childrenIds: []
created: 2025-08-19T05:42:27.950Z
updated: 2025-08-19T05:42:27.950Z
---

## Context

Create the main setup function for agents IPC handlers and integrate it into the main process initialization, following the exact pattern from personalitiesHandlers setup. Ensures all handlers are properly registered before the app is ready.

## Implementation Requirements

### Setup Function Implementation

- Create `setupAgentsHandlers()` function in `apps/desktop/src/electron/agentsHandlers.ts`
- Function should register all three handlers (load, save, reset)
- Follow exact pattern from `setupPersonalitiesHandlers()`
- Include proper logger initialization for handler context
- Export function for main process consumption

### Main Process Integration

- Add `setupAgentsHandlers()` call to `apps/desktop/src/electron/main.ts`
- Register handlers before app ready event
- Follow existing handler setup pattern
- Ensure proper cleanup on app quit if needed
- Maintain handler registration order consistency

### Logger Integration

- Use `createLoggerSync` with "agentsHandlers" context
- Initialize logger once in setup function
- Share logger instance across all handlers
- Consistent log format with other handler modules
- Proper log level configuration

### Handler Organization

- Organize all handlers within single setup function
- Clear separation and commenting for each handler
- Consistent error handling across all handlers
- Shared utilities and patterns
- Maintainable code structure

## Technical Approach

1. **Setup function**: Create main setupAgentsHandlers function
2. **Handler registration**: Register load, save, reset handlers
3. **Logger setup**: Initialize shared logger for all handlers
4. **Main integration**: Call setup function in main.ts
5. **Pattern consistency**: Follow personalitiesHandlers exactly

## Acceptance Criteria

- ✅ `setupAgentsHandlers()` function exists and exports properly
- ✅ Function registers all three IPC handlers correctly
- ✅ setupAgentsHandlers() called in main.ts before app ready
- ✅ Proper cleanup on app quit if required
- ✅ Logger integration with "agentsHandlers" context
- ✅ Integration follows existing handler setup pattern
- ✅ All handlers are properly registered and functional

## Testing Requirements

- ✅ Unit test: setupAgentsHandlers registers all three handlers
- ✅ Unit test: handlers are callable after setup
- ✅ Unit test: logger is properly initialized
- ✅ Unit test: setup function can be called multiple times safely
- ✅ Unit test: main process integration works correctly
- ✅ Integration test: full IPC communication cycle works
- ✅ Mock ipcMain for controlled testing

## Files to Create/Modify

- `apps/desktop/src/electron/agentsHandlers.ts` - Add setup function
- `apps/desktop/src/electron/main.ts` - Add setup call
- Test files for setup function validation
- Import/export updates as needed

## Dependencies

- T-implement-agents-load-handler (load handler implementation)
- T-implement-agents-save-handler (save handler implementation)
- T-implement-agents-reset (reset handler implementation)
- Existing main.ts handler setup patterns
- Logger infrastructure

## Security Considerations

- Handlers registered before app ready to prevent race conditions
- Proper handler isolation and error boundaries
- No handler registration conflicts
- Secure handler initialization order
- Prevent duplicate handler registration
