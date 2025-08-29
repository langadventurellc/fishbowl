---
id: T-implement-usemessages-hook
title: Implement useMessages hook with real-time updates and unit tests
status: done
priority: high
parent: F-message-hooks-implementation
prerequisites: []
affectedFiles:
  apps/desktop/src/hooks/messages/useMessages.ts: Created new useMessages hook
    following useConversations pattern with conversationId parameter, message
    fetching via IPC, proper error handling, and stable chronological sorting
  apps/desktop/src/hooks/messages/index.ts: Created barrel export file for messages hooks with proper JSDoc documentation
  apps/desktop/src/hooks/messages/__tests__/useMessages.test.tsx:
    Created comprehensive unit test suite with 18 test scenarios covering all
    hook functionality including success cases, error handling, environment
    detection, refetch operations, sorting behavior, and memory cleanup
log:
  - >-
    Implemented useMessages hook with real-time updates and comprehensive unit
    tests following the exact pattern from useConversations hook. The hook
    provides complete message fetching functionality for a conversation with
    proper TypeScript types, error handling, and Electron environment detection.


    Key Implementation Features:

    - Follows exact pattern from useConversations.ts for consistency

    - Accepts conversationId parameter and calls
    window.electronAPI.messages.list(conversationId)

    - Returns UseMessagesResult interface with messages, isLoading, error,
    refetch, and isEmpty properties

    - Messages are sorted by created_at ASC, then by id ASC for stable
    chronological ordering

    - Includes proper Electron environment detection with fallback and warning
    logging

    - Uses useServices() hook for logging with debug and error messages

    - Implements performance optimizations with useCallback and useMemo

    - Provides manual refetch functionality for real-time updates


    Unit Testing Coverage:

    - Created comprehensive test suite with 18 test scenarios covering all
    functionality

    - Tests successful message loading, empty conversation handling, error
    scenarios

    - Tests Electron environment detection and graceful degradation

    - Tests refetch functionality including loading states and error recovery

    - Tests sorting behavior including secondary sorting by id when timestamps
    are equal

    - Tests memory cleanup and proper unmounting behavior

    - All tests pass with 100% coverage of hook functionality


    Quality Assurance:

    - All quality checks pass (lint, format, type-check)

    - Fixed MessageRoleType usage (used "agent" instead of "assistant")

    - Code follows project conventions and Clean Code Charter

    - Implements proper security measures with input validation through IPC
    layer
schema: v1.0
childrenIds: []
created: 2025-08-29T18:15:02.570Z
updated: 2025-08-29T18:15:02.570Z
---

# Implement useMessages Hook

## Context

Create the core message fetching hook following the exact pattern from `useConversations` hook in `apps/desktop/src/hooks/conversations/useConversations.ts`. This hook provides the interface between UI components and the IPC bridge for retrieving and managing message lists.

## Detailed Requirements

### Implementation File

- **Location**: `apps/desktop/src/hooks/messages/useMessages.ts`
- **Pattern**: Follow exact structure from `useConversations.ts`
- **Dependencies**: `useServices()` hook for logging, standard React hooks

### Hook Interface

Return `UseMessagesResult` interface with:

```typescript
interface UseMessagesResult {
  messages: Message[]; // Array of messages sorted by created_at ASC, id ASC
  isLoading: boolean; // Loading state during fetch
  error: Error | null; // Error state for failures
  refetch: () => Promise<void>; // Manual refresh function
  isEmpty: boolean; // Computed property: messages.length === 0
}
```

### Core Functionality

#### Input Parameter

- Accept `conversationId: string` parameter
- Hook signature: `useMessages(conversationId: string): UseMessagesResult`

#### Message Fetching

- Call `window.electronAPI.messages.list(conversationId)` via IPC
- Handle Electron environment detection with fallback (log warning if not available)
- Sort messages by `created_at ASC, id ASC` for stable chronological ordering
- Use JavaScript sort as fallback (repository should handle SQL sorting)

#### State Management

- `messages: Message[]` - Current message list
- `isLoading: boolean` - Loading state during operations
- `error: Error | null` - Error state with user-friendly messages
- Implement `loadMessages` callback with proper error handling
- Auto-fetch on mount using `useEffect`
- Provide manual `refetch` function for real-time updates

#### Error Handling

- Comprehensive try-catch around IPC calls
- Log errors using `logger.error()` from `useServices()`
- Set user-friendly error messages in state
- Handle edge cases: network failures, invalid conversation IDs

#### Performance Optimization

- Use `useCallback` for `loadMessages` and `refetch` functions
- Use `useMemo` for `isEmpty` computed property
- Follow dependency array patterns from `useConversations`

### Technical Specifications

#### Import Requirements

```typescript
import { useState, useEffect, useCallback, useMemo } from "react";
import type { Message } from "@fishbowl-ai/shared";
import { useServices } from "../services/useServices";
```

#### Electron Environment Detection

- Check `typeof window !== "undefined"`
- Verify `window.electronAPI?.messages?.list` exists and is function
- Log warning and return empty array if not in Electron environment
- Pattern: exactly match `useConversations.ts` environment checks

#### Logging Integration

- Use `logger` from `useServices()` for debugging and error reporting
- Log successful operations: `logger.debug(\`Loaded \${messages.length} messages for conversation \${conversationId}\`)`
- Log failures: `logger.error("Failed to load messages:", err as Error)`

### Unit Testing Requirements

#### Test File Location

- **File**: `apps/desktop/src/hooks/messages/__tests__/useMessages.test.tsx`
- **Framework**: React Testing Library + Jest
- **Pattern**: Follow existing conversation hook tests

#### Test Scenarios

1. **Successful Message Loading**
   - Mock `window.electronAPI.messages.list` to return sample messages
   - Verify messages are loaded and sorted correctly
   - Check loading states transition properly
   - Verify `isEmpty` computation

2. **Empty Conversation Handling**
   - Mock API to return empty array
   - Verify `isEmpty` returns `true`
   - Check proper state management

3. **Error Handling**
   - Mock API to throw error
   - Verify error state is set correctly
   - Check error logging behavior

4. **Environment Detection**
   - Test behavior when `window.electronAPI` is unavailable
   - Verify warning logging and graceful degradation

5. **Refetch Functionality**
   - Test manual refetch operations
   - Verify state updates during refetch
   - Check error recovery after refetch

### Acceptance Criteria

✅ **GIVEN** a conversation ID  
**WHEN** the hook is called  
**THEN** it should:

- Fetch messages via `window.electronAPI.messages.list(conversationId)`
- Return messages sorted by `created_at ASC, id ASC`
- Provide complete `UseMessagesResult` interface
- Handle loading states properly
- Include Electron environment detection
- Use `useServices()` for logging

✅ **GIVEN** message fetching operations  
**WHEN** errors occur or environment is invalid  
**THEN** it should:

- Set appropriate error states
- Log errors using logger
- Provide graceful degradation
- Handle empty conversations properly

✅ **GIVEN** hook implementation  
**WHEN** testing is performed  
**THEN** it should:

- Pass all unit test scenarios
- Mock IPC calls properly
- Verify state transitions
- Test error conditions and recovery

## Out of Scope

- Message creation or updates (handled by separate hooks)
- Real-time streaming (MVP uses refetch pattern)
- Global event bus integration
- Caching or persistence (handled by repository layer)

## Dependencies

- Requires Messages IPC Bridge implementation (prerequisite F-messages-ipc-bridge)
- Uses existing `useServices()` hook and logging infrastructure
- Imports `Message` type from `@fishbowl-ai/shared` package
- Follows established patterns from `useConversations` hook
