---
id: T-implement-useupdatemessage
title: Implement useUpdateMessage hook with inclusion flags and unit tests
status: done
priority: medium
parent: F-message-hooks-implementation
prerequisites:
  - T-implement-usemessages-hook
affectedFiles:
  apps/desktop/src/hooks/messages/useUpdateMessage.ts: Created new
    useUpdateMessage hook with updateInclusion function, proper error handling,
    environment detection, and state management following established patterns
  apps/desktop/src/hooks/messages/__tests__/useUpdateMessage.test.tsx:
    Created comprehensive unit test suite with 22 test scenarios covering all
    hook functionality including success cases, validation errors, IPC errors,
    environment detection, and concurrent operations
  apps/desktop/src/hooks/messages/index.ts:
    Updated barrel export file to include
    useUpdateMessage hook with documentation examples
log:
  - Successfully implemented useUpdateMessage hook with inclusion flags and
    comprehensive unit tests. The hook follows established patterns from
    useCreateConversation and useCreateMessage, providing proper error handling,
    environment detection, loading states, and validation. Created 22 unit tests
    covering all functionality including success scenarios, validation errors,
    IPC errors, environment detection, reset functionality, sequential and
    concurrent operations.
schema: v1.0
childrenIds: []
created: 2025-08-29T18:16:08.827Z
updated: 2025-08-29T18:16:08.827Z
---

# Implement useUpdateMessage Hook

## Context

Create the message update hook following established patterns from existing conversation hooks. This hook handles updating message properties, specifically inclusion flags for context control, with proper error handling and state management.

## Detailed Requirements

### Implementation File

- **Location**: `apps/desktop/src/hooks/messages/useUpdateMessage.ts`
- **Pattern**: Follow structure patterns from `useCreateConversation.ts` for state management
- **Dependencies**: `useServices()` hook for logging, standard React hooks

### Hook Interface

Return `UseUpdateMessageResult` interface with:

```typescript
interface UseUpdateMessageResult {
  updateInclusion: (id: string, included: boolean) => Promise<Message>; // Update inclusion flag
  updating: boolean; // Loading state during update operations
  error: Error | null; // Error state for failures
  reset: () => void; // Function to clear error state
}
```

### Core Functionality

#### Input Parameter

- No parameters for hook initialization: `useUpdateMessage(): UseUpdateMessageResult`
- Update operations accept parameters directly in function calls

#### Message Update Functions

##### Inclusion Flag Updates

- `updateInclusion` function signature: `async (id: string, included: boolean): Promise<Message>`
- Call `window.electronAPI.messages.updateInclusion(id, included)` via IPC
- Handle Electron environment detection with error throwing
- Return updated `Message` object on success
- Used for controlling which messages are included in chat context

#### State Management

- `updating: boolean` - True during any update operation
- `error: Error | null` - Error state with user-friendly messages
- Implement proper loading state transitions (set before, clear after)
- Clear error state on successful updates
- Reset error state only on successful operations (not on new attempts)

#### Validation & Error Handling

- **Pre-IPC Validation**: Check for valid message ID format, boolean inclusion values
- **Environment Check**: Verify Electron API availability, throw descriptive error
- **IPC Error Handling**: Catch and re-throw IPC failures with logging
- **Database Errors**: Handle message not found, constraint violations
- **User-Friendly Messages**: Provide clear error descriptions for UI display

#### Performance Optimization

- Use `useCallback` for `updateInclusion` and `reset` functions
- Proper dependency arrays following established patterns
- Maintain stable function references to prevent unnecessary re-renders

### Technical Specifications

#### Import Requirements

```typescript
import { useState, useCallback } from "react";
import type { Message } from "@fishbowl-ai/shared";
import { useServices } from "../services/useServices";
```

#### Electron Environment Detection

- Check `typeof window !== "undefined"`
- Verify `window.electronAPI?.messages?.updateInclusion` exists and is function
- Throw descriptive error if not available: `"Message updates are not available in this environment"`
- Log environment warning before throwing error

#### Validation Rules

- **Message ID**: Must be provided and non-empty string
- **Inclusion Flag**: Must be boolean value (handled by TypeScript)
- **ID Format**: Should be valid UUID format (basic format check)

#### Logging Integration

- Use `logger` from `useServices()` for debugging and error reporting
- Log successful operations: `logger.debug(\`Updated message inclusion: \${id}\`, { id, included })`
- Log failures: `logger.error("Failed to update message:", error)`

### Real-time Integration Pattern

#### Refetch Trigger Strategy

- This hook focuses on message updates only
- UI components using this hook should call `refetch()` from `useMessages` hook after successful updates
- Pattern: `await updateInclusion(id, included); await refetch();` in UI components
- No direct integration - maintains clean separation of concerns

### Unit Testing Requirements

#### Test File Location

- **File**: `apps/desktop/src/hooks/messages/__tests__/useUpdateMessage.test.tsx`
- **Framework**: React Testing Library + Jest
- **Pattern**: Follow existing conversation hook test patterns

#### Test Scenarios

1. **Successful Inclusion Updates**
   - Mock `window.electronAPI.messages.updateInclusion` to return updated message
   - Test both `included: true` and `included: false` scenarios
   - Verify function returns updated message
   - Check updating state transitions (false → true → false)
   - Verify error state is cleared on success

2. **Validation Error Handling**
   - Test empty or invalid message ID
   - Test invalid inclusion values (if applicable)
   - Verify appropriate error messages
   - Check that updating state is reset

3. **Database Error Handling**
   - Mock API to throw "message not found" error
   - Mock constraint violation errors
   - Verify errors are caught and re-thrown
   - Check error logging behavior
   - Ensure updating state is reset

4. **Environment Detection**
   - Test behavior when `window.electronAPI` is unavailable
   - Verify error throwing with appropriate message
   - Check warning logging before error

5. **Reset Functionality**
   - Set error state, then call reset
   - Verify error is cleared
   - Check that other states are not affected

6. **Multiple Update Attempts**
   - Test sequential message updates
   - Verify state management across multiple operations
   - Check error recovery between attempts

7. **Concurrent Update Handling**
   - Test behavior with overlapping update operations
   - Verify proper state management with multiple calls

### Acceptance Criteria

✅ **GIVEN** message modification needs  
**WHEN** updating message properties  
**THEN** it should:

- Support inclusion flag changes via `updateInclusion(id, included)`
- Call `window.electronAPI.messages.updateInclusion(id, included)`
- Return `{ updateInclusion, updating, error, reset }` interface
- Handle validation errors with clear messages
- Provide proper loading state management

✅ **GIVEN** message update operations  
**WHEN** errors occur or validation fails  
**THEN** it should:

- Set appropriate error states
- Log errors using logger
- Reset updating state properly
- Throw errors for upstream handling
- Handle database constraint violations gracefully

✅ **GIVEN** hook implementation  
**WHEN** testing is performed  
**THEN** it should:

- Pass all unit test scenarios
- Mock IPC calls properly
- Test validation rules and error conditions
- Verify state transitions and error recovery
- Handle concurrent operations safely

### Future Extensibility

#### Architecture for Additional Update Types

- Current implementation focuses on inclusion flags only
- Hook structure allows easy extension for content updates, metadata changes
- Consistent pattern can be applied to additional update operations
- Error handling and state management designed for multiple operation types

## Out of Scope

- Message fetching or listing (handled by `useMessages`)
- Message creation (handled by `useCreateMessage`)
- Content editing functionality (future enhancement)
- Bulk update operations (individual messages only)
- Automatic refetch triggering (UI responsibility)
- Optimistic updates with rollback (MVP uses simple approach)

## Dependencies

- Requires Messages IPC Bridge implementation (prerequisite F-messages-ipc-bridge)
- Uses existing `useServices()` hook and logging infrastructure
- Imports `Message` type from `@fishbowl-ai/shared`
- Follows established patterns from conversation hooks
- Should be implemented after `useMessages` hook for integration context
