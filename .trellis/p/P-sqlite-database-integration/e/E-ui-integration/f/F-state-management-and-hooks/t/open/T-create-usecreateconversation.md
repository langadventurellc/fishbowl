---
id: T-create-usecreateconversation
title: Create useCreateConversation React hook
status: open
priority: high
parent: F-state-management-and-hooks
prerequisites:
  - T-extend-preload-script-with
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T20:31:59.058Z
updated: 2025-08-23T20:31:59.058Z
---

# Create useCreateConversation React Hook

## Context

This task implements the custom React hook that provides a clean, reusable interface for conversation creation in React components. The hook manages async state, error handling, and provides a consistent API following React best practices and the patterns established in the codebase.

**Related Issues:**

- Feature: F-state-management-and-hooks
- Epic: E-ui-integration
- Project: P-sqlite-database-integration
- Depends on: T-extend-preload-script-with

**Reference Implementation:**

- Existing hook patterns in the codebase (if any)
- React hooks best practices for async operations
- Error handling patterns in React components
- State management patterns in existing components

## Detailed Implementation Requirements

### File Creation

Create `apps/desktop/src/hooks/useCreateConversation.ts`:

```typescript
import { useState, useCallback, useRef, useEffect } from "react";
import type {
  Conversation,
  CreateConversationInput,
} from "@fishbowl-ai/shared";

export interface UseCreateConversationResult {
  createConversation: (
    input?: CreateConversationInput,
  ) => Promise<Conversation>;
  loading: boolean;
  error: Error | null;
  data: Conversation | null;
  reset: () => void;
}

export function useCreateConversation(): UseCreateConversationResult {
  // Implementation details below
}
```

### Hook Implementation Details

1. **State Management**

   ```typescript
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);
   const [data, setData] = useState<Conversation | null>(null);
   const isMountedRef = useRef(true);
   ```

2. **Cleanup on Unmount**

   ```typescript
   useEffect(() => {
     return () => {
       isMountedRef.current = false;
     };
   }, []);
   ```

3. **Main Hook Function**

   ```typescript
   const createConversation = useCallback(
     async (input?: CreateConversationInput): Promise<Conversation> => {
       if (loading) {
         throw new Error("Conversation creation already in progress");
       }

       setLoading(true);
       setError(null);

       try {
         const conversation = await window.api.conversations.create(input);

         if (isMountedRef.current) {
           setData(conversation);
         }

         return conversation;
       } catch (err) {
         const error = err instanceof Error ? err : new Error(String(err));

         if (isMountedRef.current) {
           setError(error);
         }

         throw error;
       } finally {
         if (isMountedRef.current) {
           setLoading(false);
         }
       }
     },
     [loading],
   );
   ```

4. **Reset Function**
   ```typescript
   const reset = useCallback(() => {
     setError(null);
     setData(null);
     setLoading(false);
   }, []);
   ```

### Error Handling Strategy

1. **Concurrent Request Prevention**
   - Check loading state before starting new request
   - Throw error if request already in progress
   - Clear state appropriately on completion

2. **Component Unmount Protection**
   - Use ref to track mount status
   - Prevent state updates after unmount
   - Clean up any pending operations

3. **Error State Management**
   - Clear previous errors on new requests
   - Preserve error details for debugging
   - Allow error state to be reset manually

### Performance Optimization

1. **Callback Memoization**
   - Use useCallback for createConversation function
   - Include appropriate dependencies
   - Prevent unnecessary re-renders

2. **State Update Batching**
   - Update multiple state variables efficiently
   - Use functional updates where appropriate
   - Minimize render cycles

3. **Memory Leak Prevention**
   - Clean up refs and timers on unmount
   - Prevent state updates after unmount
   - Avoid closure over stale state

## Detailed Acceptance Criteria

### Hook Interface

- [ ] Hook returns UseCreateConversationResult interface
- [ ] createConversation function accepts optional CreateConversationInput
- [ ] createConversation returns Promise<Conversation>
- [ ] loading state accurately reflects operation status
- [ ] error state captures and preserves error details
- [ ] data state contains created conversation on success

### State Management

- [ ] Initial state is correct (loading: false, error: null, data: null)
- [ ] Loading state prevents concurrent requests
- [ ] Error state cleared on new requests
- [ ] Success state updates data correctly
- [ ] State updates prevented after component unmount

### Error Handling

- [ ] Concurrent request attempts throw descriptive error
- [ ] API errors properly caught and preserved
- [ ] Component unmount doesn't cause state update errors
- [ ] Errors can be cleared with reset function
- [ ] Error details preserved for debugging

### Performance

- [ ] createConversation function memoized with useCallback
- [ ] No unnecessary re-renders caused by hook
- [ ] Memory leaks prevented on component unmount
- [ ] State updates batched efficiently
- [ ] Dependencies array correct for useCallback

### API Integration

- [ ] Hook calls window.api.conversations.create correctly
- [ ] Input parameter passed through to API
- [ ] API response handled correctly
- [ ] API errors propagated appropriately

### Testing Requirements

**Unit Tests** (include in same task):

- [ ] Hook initializes with correct default state
- [ ] createConversation function works for successful creation
- [ ] Loading state managed correctly during operation
- [ ] Error handling works for API failures
- [ ] Concurrent request prevention works
- [ ] Component unmount cleanup prevents errors
- [ ] Reset function clears all state correctly
- [ ] Callback memoization prevents unnecessary re-renders

Test file: `apps/desktop/src/hooks/__tests__/useCreateConversation.test.ts`

## Technical Approach

### Step-by-Step Implementation

1. **Setup Hook Structure**

   ```typescript
   export function useCreateConversation(): UseCreateConversationResult {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<Error | null>(null);
     const [data, setData] = useState<Conversation | null>(null);
     const isMountedRef = useRef(true);
   ```

2. **Implement Unmount Cleanup**

   ```typescript
   useEffect(() => {
     return () => {
       isMountedRef.current = false;
     };
   }, []);
   ```

3. **Create Main Function**

   ```typescript
   const createConversation = useCallback(
     async (input?: CreateConversationInput) => {
       // Validation, API call, state management
     },
     [loading],
   );
   ```

4. **Add Reset Function**

   ```typescript
   const reset = useCallback(() => {
     setError(null);
     setData(null);
     setLoading(false);
   }, []);
   ```

5. **Return Hook Interface**

   ```typescript
   return {
     createConversation,
     loading,
     error,
     data,
     reset,
   };
   ```

6. **Write Comprehensive Tests**
   - Test all state transitions
   - Mock window.api for testing
   - Test error scenarios
   - Verify performance optimizations

### Testing Strategy

Use React Testing Library and Jest:

```typescript
import { renderHook, act } from "@testing-library/react";
import { useCreateConversation } from "../useCreateConversation";

// Mock window.api
const mockCreate = jest.fn();
beforeEach(() => {
  (global as any).window = {
    api: {
      conversations: {
        create: mockCreate,
      },
    },
  };
});
```

### Error Handling Examples

```typescript
// Concurrent request prevention
if (loading) {
  throw new Error("Conversation creation already in progress");
}

// API error handling
try {
  const conversation = await window.api.conversations.create(input);
  // Handle success
} catch (err) {
  const error = err instanceof Error ? err : new Error(String(err));
  if (isMountedRef.current) {
    setError(error);
  }
  throw error;
}
```

## Definition of Done

- useCreateConversation hook created with complete TypeScript types
- All state management working correctly (loading, error, data)
- Concurrent request prevention implemented
- Component unmount protection working
- API integration functioning correctly
- Error handling comprehensive and user-friendly
- Performance optimizations in place
- Unit tests written and passing with high coverage
- Hook ready for integration in React components
- Documentation complete with usage examples
