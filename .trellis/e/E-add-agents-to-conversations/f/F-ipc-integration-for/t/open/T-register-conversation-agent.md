---
id: T-register-conversation-agent
title: Register conversation agent handlers in main process
status: open
priority: medium
parent: F-ipc-integration-for
prerequisites:
  - T-add-conversation-agent-api-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T06:06:47.390Z
updated: 2025-08-25T06:06:47.390Z
---

# Register Conversation Agent Handlers in Main Process

## Context

Integrate the conversation agent IPC handlers into the main process initialization, ensuring they are properly registered during application startup. This follows the pattern used for conversation handlers and other IPC handler registration.

## Implementation Requirements

### Find Main Process Entry Point

Locate where IPC handlers are currently registered in the main process:

- Check `apps/desktop/src/electron/main.ts` or similar main entry file
- Find where `setupConversationsHandlers` is called
- Follow the established pattern for handler registration

### Add Handler Registration

Add the conversation agent handler setup alongside existing handler registrations:

```typescript
import { setupConversationAgentHandlers } from "./conversationAgentHandlers";

// In main process initialization, after MainProcessServices is created:
setupConversationAgentHandlers(mainServices);
```

### Ensure Proper Timing

- Register handlers after MainProcessServices initialization
- Register before app.whenReady() completion
- Maintain proper dependency order with other handler setups

## Technical Requirements

### Import Management

- Add import statement for `setupConversationAgentHandlers`
- Ensure import path is correct relative to main process file
- Maintain alphabetical or logical ordering of imports

### Error Handling

- Wrap handler registration in try/catch if pattern requires
- Log successful registration or handle failures appropriately
- Follow same error handling pattern as other handler registrations

### Initialization Order

- MainProcessServices must be fully initialized first
- Database migrations should be complete before handler registration
- Handler registration should occur before app ready completion

## Acceptance Criteria

- ✅ Handler registration added to main process initialization
- ✅ Import statement added for setup function
- ✅ Registration occurs at appropriate point in startup sequence
- ✅ Main process starts successfully with handlers registered
- ✅ IPC handlers respond to renderer process calls
- ✅ No errors during main process initialization
- ✅ Handler registration logged appropriately

## Testing Requirements

### Integration Tests

Create/update main process initialization tests:

- Verify handlers are registered during startup
- Test that conversation agent IPC calls work end-to-end
- Ensure no regression in existing handler functionality
- Test error scenarios during handler registration

### Manual Testing

- Start desktop application successfully
- IPC communication works between renderer and main process
- Conversation agent operations execute through handlers
- Application logs show successful handler initialization

## Implementation Notes

### Reference Pattern

- **Follow exactly**: How `setupConversationsHandlers(mainServices)` is called
- **Location**: Same initialization block as other handler setups
- **Timing**: After services initialization, before app ready

### Discovery Tasks

1. Find main process entry point file (likely `apps/desktop/src/electron/main.ts`)
2. Locate existing handler registrations (conversations, settings, etc.)
3. Identify MainProcessServices instantiation point
4. Determine proper insertion point for new handler registration

### Expected File Structure

```typescript
// Main process initialization
const mainServices = new MainProcessServices();
await mainServices.runDatabaseMigrations();

// Handler registrations
setupConversationsHandlers(mainServices);
setupConversationAgentHandlers(mainServices); // Add this
setupSettingsHandlers(mainServices);
// ... other handlers
```

### Dependencies

- MainProcessServices with ConversationAgentsRepository integrated
- setupConversationAgentHandlers function implemented
- Main process initialization architecture
- Existing handler registration patterns

### Verification Steps

1. Application starts without errors
2. Handlers are properly registered and accessible
3. IPC communication works from renderer to main process
4. Repository operations execute successfully through handlers
5. Logging shows successful initialization
