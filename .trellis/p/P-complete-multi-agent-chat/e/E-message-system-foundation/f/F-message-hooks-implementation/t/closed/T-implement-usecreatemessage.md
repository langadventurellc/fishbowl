---
id: T-implement-usecreatemessage
title: Implement useCreateMessage hook with validation and unit tests
status: done
priority: high
parent: F-message-hooks-implementation
prerequisites:
  - T-implement-usemessages-hook
affectedFiles:
  apps/desktop/src/hooks/messages/useCreateMessage.ts: Created new
    useCreateMessage hook with validation, error handling, and IPC integration
    following useCreateConversation pattern
  apps/desktop/src/hooks/messages/__tests__/useCreateMessage.test.tsx:
    Created comprehensive unit test suite with 23 test scenarios covering all
    hook functionality including success cases, validation errors, IPC errors,
    environment detection, and memory cleanup
  apps/desktop/src/hooks/messages/index.ts:
    Updated barrel export file to include
    useCreateMessage hook with documentation examples
log:
  - >-
    Implemented useCreateMessage hook following exact pattern from
    useCreateConversation hook. The hook provides message creation functionality
    with comprehensive validation, error handling, and loading states. Features
    include:


    - Input validation for empty content and missing conversation IDs

    - Environment detection for Electron API availability 

    - Proper loading state management (sending: boolean)

    - Error handling with user-friendly messages and logging

    - Reset functionality to clear error states

    - Stable function references using useCallback

    - Full TypeScript typing with CreateMessageInput and Message interfaces


    The implementation includes comprehensive unit tests covering all scenarios:

    - Successful message creation for user, system, and agent roles

    - Input validation errors (empty content, missing conversation ID)

    - IPC communication error handling

    - Environment detection for non-Electron environments

    - Loading state management and error recovery

    - Function stability and memory cleanup

    - Multiple creation attempts and sequential operations


    All quality checks pass including linting, formatting, and TypeScript
    compilation. All 23 unit tests pass successfully.
schema: v1.0
childrenIds: []
created: 2025-08-29T18:15:36.934Z
updated: 2025-08-29T18:15:36.934Z
---

# Implement useCreateMessage Hook

## Context

Create the message creation hook following the exact pattern from `useCreateConversation` hook in `apps/desktop/src/hooks/conversations/useCreateConversation.ts`. This hook handles sending new messages (user or system) with proper validation, error handling, and real-time UI updates.

## Detailed Requirements

### Implementation File

- **Location**: `apps/desktop/src/hooks/messages/useCreateMessage.ts`
- **Pattern**: Follow exact structure from `useCreateConversation.ts`
- **Dependencies**: `useServices()` hook for logging, standard React hooks

### Hook Interface

Return `UseCreateMessageResult` interface with:

```typescript
interface UseCreateMessageResult {
  createMessage: (input: CreateMessageInput) => Promise<Message>; // Main creation function
  sending: boolean; // Loading state during message creation
  error: Error | null; // Error state for failures
  reset: () => void; // Function to clear error state
}
```

### Core Functionality

#### Input Parameter

- No parameters for hook initialization: `useCreateMessage(): UseCreateMessageResult`
- Message creation accepts `CreateMessageInput` from `@fishbowl-ai/shared`:
  ```typescript
  interface CreateMessageInput {
    conversation_id: string;
    role: "user" | "assistant" | "system";
    content: string;
  }
  ```

#### Message Creation Function

- `createMessage` function signature: `async (input: CreateMessageInput): Promise<Message>`
- Call `window.electronAPI.messages.create(input)` via IPC
- Handle Electron environment detection with error throwing
- Return created `Message` object on success
- Throw error on validation failures or network issues

#### State Management

- `sending: boolean` - True during message creation operation
- `error: Error | null` - Error state with user-friendly messages
- Implement proper loading state transitions (set before, clear after)
- Clear error state on successful creation
- Reset error state only on successful operations (not on new attempts)

#### Validation & Error Handling

- **Pre-IPC Validation**: Check for empty content, invalid conversation ID
- **Environment Check**: Verify Electron API availability, throw descriptive error
- **IPC Error Handling**: Catch and re-throw IPC failures with logging
- **User-Friendly Messages**: Provide clear error descriptions
- **State Cleanup**: Ensure `sending` state is reset on both success and failure

#### Performance Optimization

- Use `useCallback` for `createMessage` and `reset` functions
- Proper dependency arrays following `useCreateConversation` pattern
- Maintain stable function references to prevent unnecessary re-renders

### Technical Specifications

#### Import Requirements

```typescript
import { useState, useCallback } from "react";
import type { Message, CreateMessageInput } from "@fishbowl-ai/shared";
import { useServices } from "../services/useServices";
```

#### Electron Environment Detection

- Check `typeof window !== "undefined"`
- Verify `window.electronAPI?.messages?.create` exists and is function
- Throw descriptive error if not available: `"Message creation is not available in this environment"`
- Log environment warning before throwing error

#### Validation Rules

- **Content**: Must not be empty or only whitespace
- **Conversation ID**: Must be provided and valid UUID format
- **Role**: Must be one of allowed values (handled by TypeScript typing)

#### Logging Integration

- Use `logger` from `useServices()` for debugging and error reporting
- Log successful operations: `logger.debug(\`Created message in conversation \${input.conversation_id}\`, { messageId: message.id })`
- Log failures: `logger.error("Failed to create message:", error)`

### Real-time Integration Pattern

#### Refetch Trigger Strategy

- This hook focuses on message creation only
- UI components using this hook should call `refetch()` from `useMessages` hook after successful creation
- Pattern: `await createMessage(input); await refetch();` in UI components
- No direct integration - follows established separation of concerns

### Unit Testing Requirements

#### Test File Location

- **File**: `apps/desktop/src/hooks/messages/__tests__/useCreateMessage.test.tsx`
- **Framework**: React Testing Library + Jest
- **Pattern**: Follow existing `useCreateConversation` test patterns

#### Test Scenarios

1. **Successful Message Creation**
   - Mock `window.electronAPI.messages.create` to return sample message
   - Verify function returns created message
   - Check sending state transitions (false → true → false)
   - Verify error state is cleared on success

2. **Validation Error Handling**
   - Test empty content validation
   - Test missing conversation_id
   - Verify appropriate error messages
   - Check that sending state is reset

3. **Network/IPC Error Handling**
   - Mock API to throw network error
   - Verify error is caught and re-thrown
   - Check error logging behavior
   - Ensure sending state is reset

4. **Environment Detection**
   - Test behavior when `window.electronAPI` is unavailable
   - Verify error throwing with appropriate message
   - Check warning logging before error

5. **Reset Functionality**
   - Set error state, then call reset
   - Verify error is cleared
   - Check that other states are not affected

6. **Multiple Creation Attempts**
   - Test sequential message creation
   - Verify state management across multiple operations
   - Check error recovery between attempts

### Acceptance Criteria

✅ **GIVEN** message creation requests  
**WHEN** creating user or system messages  
**THEN** it should:

- Accept `CreateMessageInput` with conversation_id, role, content
- Call `window.electronAPI.messages.create(input)` for persistence
- Return `{ createMessage, sending, error, reset }` interface
- Handle validation errors with clear messages
- Provide proper loading state management

✅ **GIVEN** message creation operations  
**WHEN** errors occur or validation fails  
**THEN** it should:

- Set appropriate error states
- Log errors using logger
- Reset sending state properly
- Throw errors for upstream handling
- Provide clear error descriptions

✅ **GIVEN** hook implementation  
**WHEN** testing is performed  
**THEN** it should:

- Pass all unit test scenarios
- Mock IPC calls properly
- Test validation rules
- Verify state transitions and error recovery

## Out of Scope

- Message fetching or listing (handled by `useMessages`)
- Message updates (handled by `useUpdateMessage`)
- Real-time streaming or progressive updates
- Global event bus integration
- Automatic refetch triggering (UI responsibility)

## Dependencies

- Requires Messages IPC Bridge implementation (prerequisite F-messages-ipc-bridge)
- Uses existing `useServices()` hook and logging infrastructure
- Imports `Message` and `CreateMessageInput` types from `@fishbowl-ai/shared`
- Follows established patterns from `useCreateConversation` hook
- Should be implemented after `useMessages` hook for integration testing
