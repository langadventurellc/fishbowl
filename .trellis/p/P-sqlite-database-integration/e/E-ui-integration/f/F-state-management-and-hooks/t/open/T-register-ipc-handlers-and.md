---
id: T-register-ipc-handlers-and
title: Register IPC handlers and integrate hook with UI
status: open
priority: medium
parent: F-state-management-and-hooks
prerequisites:
  - T-create-usecreateconversation
  - T-integrate-newconversationbutto
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T20:32:42.648Z
updated: 2025-08-23T20:32:42.648Z
---

# Register IPC Handlers and Integrate Hook with UI

## Context

This task completes the conversation creation flow by registering the IPC handlers in the main process and integrating the useCreateConversation hook with the existing UI components. This replaces the placeholder logic in Home.tsx with the real conversation creation functionality.

**Related Issues:**

- Feature: F-state-management-and-hooks
- Epic: E-ui-integration
- Project: P-sqlite-database-integration
- Depends on: T-create-usecreateconversation, T-integrate-newconversationbutto

**Reference Implementation:**

- Existing handler registration in `apps/desktop/src/electron/main.ts`
- MainProcessServices integration patterns
- Hook integration patterns in existing components

## Detailed Implementation Requirements

### Main Process Integration

1. **Register IPC Handlers**
   Update `apps/desktop/src/electron/main.ts` or the appropriate initialization file:

```typescript
import { ConversationsHandler } from "./handlers/conversationsHandler";

// In the main process initialization
app.whenReady().then(async () => {
  try {
    // ... existing initialization code

    // Initialize services
    mainProcessServices = new MainProcessServices();

    // Register IPC handlers
    const conversationsHandler = new ConversationsHandler(mainProcessServices);
    conversationsHandler.registerHandlers();

    // ... rest of initialization
  } catch (error) {
    // Error handling
  }
});

// In the cleanup section (before-quit or window-all-closed)
app.on("before-quit", async () => {
  try {
    // ... existing cleanup

    // Cleanup IPC handlers
    if (conversationsHandler) {
      conversationsHandler.unregisterHandlers();
    }

    // ... rest of cleanup
  } catch (error) {
    // Error handling
  }
});
```

2. **Update MainProcessServices Integration**
   Ensure MainProcessServices properly exposes ConversationsRepository:

```typescript
// Verify this exists in MainProcessServices
public getConversationsRepository(): ConversationsRepository {
  if (!this.conversationsRepository) {
    throw new Error('ConversationsRepository not initialized');
  }
  return this.conversationsRepository;
}
```

### UI Integration

1. **Update Home.tsx**
   Replace placeholder logic with real hook usage:

```typescript
import { useCreateConversation } from '@/hooks/useCreateConversation';

export function Home() {
  const { createConversation, loading, error, data } = useCreateConversation();

  const [feedbackState, setFeedbackState] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleCreateConversation = useCallback(async () => {
    try {
      const conversation = await createConversation();

      setFeedbackState({
        type: 'success',
        message: `Conversation "${conversation.title}" created successfully!`
      });

      // Optional: trigger other actions like navigation
      // onConversationCreated?.(conversation);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setFeedbackState({
        type: 'error',
        message: error.message
      });
    }
  }, [createConversation]);

  const handleRetry = useCallback(() => {
    setFeedbackState({ type: null, message: '' });
    handleCreateConversation();
  }, [handleCreateConversation]);

  const handleDismissFeedback = useCallback(() => {
    setFeedbackState({ type: null, message: '' });
  }, []);

  return (
    <div>
      {/* Existing Home.tsx content */}

      <NewConversationButton
        onClick={handleCreateConversation}
        loading={loading}
      />

      <ConversationFeedback
        type={feedbackState.type}
        message={feedbackState.message}
        onDismiss={handleDismissFeedback}
        onRetry={feedbackState.type === 'error' ? handleRetry : undefined}
      />

      {/* Rest of existing content */}
    </div>
  );
}
```

### Error Integration and Logging

1. **Main Process Error Handling**
   - Ensure all errors are properly logged
   - Map database/repository errors to user-friendly messages
   - Maintain error context for debugging

2. **Renderer Process Error Handling**
   - Display user-friendly error messages
   - Log detailed errors for debugging
   - Provide retry functionality where appropriate

### Testing Integration

1. **End-to-End Testing**
   - Test complete flow from button click to database
   - Verify success and error scenarios
   - Test UI feedback mechanisms

2. **Integration Testing**
   - Test IPC communication works correctly
   - Test hook integration with UI components
   - Verify error handling across process boundaries

## Detailed Acceptance Criteria

### Main Process Registration

- [ ] ConversationsHandler registered in main process initialization
- [ ] IPC handlers properly registered on app startup
- [ ] Handler cleanup on app shutdown
- [ ] MainProcessServices integration working correctly
- [ ] Error handling for handler registration failures

### UI Integration

- [ ] Home.tsx uses useCreateConversation hook instead of placeholder
- [ ] Button click triggers real conversation creation
- [ ] Loading state shows during creation process
- [ ] Success feedback displays created conversation details
- [ ] Error feedback shows user-friendly error messages
- [ ] Retry functionality works for error cases

### End-to-End Functionality

- [ ] Complete flow works: button click → IPC → database → response → UI update
- [ ] Conversation actually created in database
- [ ] Success state shows correct conversation information
- [ ] Error states handled gracefully throughout stack
- [ ] No placeholder logic remaining

### Error Handling

- [ ] Database errors mapped to user-friendly messages
- [ ] IPC communication errors handled gracefully
- [ ] Component error boundaries working correctly
- [ ] Detailed errors logged for debugging
- [ ] User feedback is clear and actionable

### Performance and Reliability

- [ ] No memory leaks in IPC handlers
- [ ] Proper cleanup on app shutdown
- [ ] State management efficient and correct
- [ ] UI remains responsive during operations
- [ ] Error recovery doesn't break application state

### Testing Requirements

**Integration Tests** (include in same task):

- [ ] End-to-end conversation creation flow works
- [ ] IPC handlers respond correctly to requests
- [ ] UI components integrate properly with hook
- [ ] Error scenarios work correctly
- [ ] Handler registration and cleanup work
- [ ] Database integration functional

Test files:

- Update existing `apps/desktop/src/pages/__tests__/Home.test.tsx`
- `apps/desktop/src/electron/__tests__/main.conversations.test.ts`

## Technical Approach

### Step-by-Step Implementation

1. **Register IPC Handlers**

   ```typescript
   // In main.ts or initialization file
   let conversationsHandler: ConversationsHandler;

   app.whenReady().then(async () => {
     // ... existing setup
     conversationsHandler = new ConversationsHandler(mainProcessServices);
     conversationsHandler.registerHandlers();
   });
   ```

2. **Update Home.tsx Integration**

   ```typescript
   const { createConversation, loading, error } = useCreateConversation();

   const handleCreate = useCallback(async () => {
     try {
       const conversation = await createConversation();
       // Handle success
     } catch (error) {
       // Handle error
     }
   }, [createConversation]);
   ```

3. **Replace Placeholder Logic**
   - Remove setTimeout simulation
   - Remove placeholder success/error logic
   - Replace with real hook calls

4. **Add Error Mapping**

   ```typescript
   const mapErrorToUserMessage = (error: Error): string => {
     if (error.message.includes("database")) {
       return "Failed to save conversation. Please try again.";
     }
     return error.message;
   };
   ```

5. **Test Integration**
   - Test with real database operations
   - Verify error handling works
   - Check UI feedback accuracy

### Handler Registration Pattern

```typescript
// Store handler references for cleanup
let handlers: { unregisterHandlers: () => void }[] = [];

const registerAllHandlers = (services: MainProcessServices) => {
  const conversationsHandler = new ConversationsHandler(services);
  conversationsHandler.registerHandlers();
  handlers.push(conversationsHandler);

  // Register other handlers...
};

const unregisterAllHandlers = () => {
  handlers.forEach((handler) => handler.unregisterHandlers());
  handlers = [];
};
```

## Definition of Done

- ConversationsHandler registered in main process initialization
- IPC handlers respond correctly to conversation creation requests
- Home.tsx integrated with useCreateConversation hook
- Placeholder logic completely removed
- End-to-end conversation creation working
- Success and error feedback functioning correctly
- Integration tests written and passing
- No memory leaks or cleanup issues
- Error handling working across all layers
- Performance meets requirements (< 100ms for UI, < 2s for creation)
