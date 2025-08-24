---
id: T-connect-usecreateconversation
title: Connect useCreateConversation hook to NewConversationButton in
  SidebarContainerDisplay
status: open
priority: high
parent: F-core-new-conversation-button
prerequisites:
  - T-integrate-newconversationbutto
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T02:06:20.096Z
updated: 2025-08-24T02:06:20.096Z
---

# Connect useCreateConversation hook to NewConversationButton in SidebarContainerDisplay

## Context

The useCreateConversation hook already exists at `apps/desktop/src/hooks/conversations/useCreateConversation.ts` and provides the logic for creating new conversations via the IPC layer. This task connects the hook to the NewConversationButton that was placed in SidebarContainerDisplay in the previous task.

## Implementation Requirements

### 1. Import and Initialize Hook

- Import useCreateConversation from `../../hooks/conversations/useCreateConversation`
- Call the hook at the top of the SidebarContainerDisplay component function
- Destructure the returned values: `{ createConversation, loading, error, reset }`

### 2. Connect to Button onClick

- Replace the placeholder onClick handler with the actual createConversation function
- Wrap in async handler to properly handle the Promise
- Add error handling (log for now, will be handled in Feature 2)

### 3. Pass Hook State to Button

- Pass `loading` state from hook to NewConversationButton's `loading` prop
- Pass `disabled={loading}` to prevent clicks during creation
- Ensure button shows loading spinner when creating

### 4. Handle Success Response

- Log the successful creation result
- Prepare for conversation list update (next task)
- Reset error state if needed

## Detailed Acceptance Criteria

- [ ] useCreateConversation hook is imported and initialized in SidebarContainerDisplay
- [ ] NewConversationButton onClick calls createConversation function
- [ ] Loading state displays during conversation creation
- [ ] Button is disabled while loading
- [ ] Successful creation logs the new conversation data
- [ ] Error from creation is captured (even if just logged)
- [ ] No TypeScript errors with hook integration
- [ ] Async operation doesn't block UI
- [ ] Sidebar component renders without issues

## Technical Approach

```typescript
// In SidebarContainerDisplay.tsx
import { useCreateConversation } from '../../hooks/conversations/useCreateConversation';
import { NewConversationButton } from '../conversations/NewConversationButton';

export function SidebarContainerDisplay({ /* existing props */ }) {
  const { createConversation, loading, error } = useCreateConversation();

  const handleNewConversation = async () => {
    try {
      const result = await createConversation();
      console.log('Created conversation:', result);
      // Will trigger list refresh in next task
    } catch (err) {
      console.error('Failed to create conversation:', err);
      // Error handling will be improved in Feature 2
    }
  };

  // ... existing component logic

  return (
    <div className={/* existing classes */} style={dynamicStyles}>
      {/* ... existing sidebar content */}

      <div className="mt-auto">
        <NewConversationButton
          onClick={handleNewConversation}
          loading={loading}
          disabled={loading}
        />
      </div>
    </div>
  );
}
```

## Files to Modify

- `apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx` - Add hook import and wiring

## Testing Requirements

### Unit Tests (include in this task)

- Mock useCreateConversation hook
- Test that createConversation is called on button click
- Test loading state is passed to button
- Test error handling doesn't crash component
- Verify async operation completes properly
- Test sidebar still renders correctly with hook integration

### Manual Testing

- Click button and verify IPC call is made
- Check browser DevTools network/console for API call
- Verify loading spinner appears during creation
- Confirm button is disabled while loading
- Check database for new conversation record
- Verify sidebar layout remains intact

## Dependencies

- Previous task (NewConversationButton placement) is complete
- useCreateConversation hook is functional
- IPC handlers are registered and working
- Database is initialized and accepting connections

## Security Considerations

- Don't expose raw errors to UI (just log for now)
- Ensure no sensitive data in console logs
- Validate that IPC layer handles malformed requests

## Time Estimate

1-2 hours including testing and debugging IPC connection
