---
id: T-integrate-useconversations
title: Integrate useConversations hook for list updates
status: open
priority: medium
parent: F-core-new-conversation-button
prerequisites:
  - T-connect-usecreateconversation
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T02:06:57.326Z
updated: 2025-08-24T02:06:57.326Z
---

# Integrate useConversations hook for list updates

## Context

The useConversations hook exists at `apps/desktop/src/hooks/conversations/useConversations.ts` and manages the list of conversations. After creating a new conversation, the list needs to be refreshed to show the newly created item. This task connects the list management to the creation flow.

## Implementation Requirements

### 1. Import and Initialize useConversations Hook

- Import useConversations from `hooks/conversations`
- Call the hook to get conversations list and refetch function
- Destructure: `{ conversations, loading: listLoading, error: listError, refetch }`

### 2. Pass Conversations to Layout

- Replace the empty conversations array with actual data from hook
- Update the ConversationLayoutDisplay conversations prop
- Handle loading state for initial list load

### 3. Trigger List Refresh After Creation

- Call `refetch()` after successful conversation creation
- Ensure new conversation appears in the list
- Handle any race conditions between creation and refresh

### 4. Update Type Definitions

- Ensure Conversation type from shared package matches UI expectations
- Map database conversation format to UI format if needed
- Handle any missing or optional fields

## Detailed Acceptance Criteria

- [ ] useConversations hook is imported and working
- [ ] Conversations list displays actual data from database
- [ ] New conversation appears in list after creation
- [ ] List refreshes automatically after successful creation
- [ ] Loading states are handled appropriately
- [ ] Empty state shows when no conversations exist
- [ ] List updates without full page refresh
- [ ] TypeScript types align between hooks and components

## Technical Approach

```typescript
// In Home.tsx
import { useCreateConversation } from '../hooks/conversations';
import { useConversations } from '../hooks/conversations';

export default function LayoutShowcase() {
  const { conversations, loading: listLoading, refetch } = useConversations();
  const { createConversation, loading: creating } = useCreateConversation();

  const handleNewConversation = async () => {
    try {
      const result = await createConversation();
      console.log('Created conversation:', result);
      // Refresh the list to show new conversation
      await refetch();
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  // Map conversations to expected format if needed
  const uiConversations = conversations.map(conv => ({
    name: conv.title,
    lastActivity: new Date(conv.updated_at).toLocaleString()
  }));

  return (
    <ConversationScreenDisplay>
      <NewConversationButton
        onClick={handleNewConversation}
        loading={creating}
        disabled={creating}
      />
      <ConversationLayoutDisplay
        conversations={uiConversations}
        agents={agents}
        messages={messages}
        defaultSidebarCollapsed={false}
      />
    </ConversationScreenDisplay>
  );
}
```

## Files to Modify

- `apps/desktop/src/pages/Home.tsx` - Add useConversations hook and data flow

## Testing Requirements

### Unit Tests (include in this task)

- Mock both hooks (useConversations and useCreateConversation)
- Test that refetch is called after successful creation
- Test conversations are passed to layout component
- Test loading states for both list and creation
- Verify empty state when no conversations
- Test data transformation if needed

### Manual Testing

- Load page and verify existing conversations appear
- Create new conversation and verify it appears in list
- Check list order (should be sorted by created_at DESC)
- Test with empty database (no conversations)
- Verify no duplicate entries after creation

## Dependencies

- Previous tasks are complete
- useConversations hook is functional
- Database has conversations table
- IPC list endpoint is working

## Performance Considerations

- Avoid unnecessary re-renders when list updates
- Consider optimistic updates in future iteration
- Ensure list refresh is efficient for large datasets

## Time Estimate

1.5-2 hours including testing and data mapping
