---
id: T-integrate-useconversations
title: Integrate useConversations hook for dynamic conversation list in
  SidebarContainerDisplay
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

# Integrate useConversations hook for dynamic conversation list in SidebarContainerDisplay

## Context

The useConversations hook exists at `apps/desktop/src/hooks/conversations/useConversations.ts` and manages the list of conversations from the database. Currently, SidebarContainerDisplay uses the conversations prop passed down from Home.tsx (which contains static demo data). This task integrates the hook to show real conversation data and refresh the list after creating new conversations.

## Implementation Requirements

### 1. Import and Initialize useConversations Hook

- Import useConversations from `../../hooks/conversations/useConversations`
- Call the hook to get conversations list and refetch function
- Destructure: `{ conversations: realConversations, loading: listLoading, error: listError, refetch }`

### 2. Use Real Conversation Data

- Replace the `conversations` prop usage with `realConversations` from the hook
- Handle the case where `conversations` prop is still passed (for flexibility)
- Use real data when available, fall back to prop data if needed

### 3. Trigger List Refresh After Creation

- Call `refetch()` after successful conversation creation in handleNewConversation
- Ensure new conversation appears in the list immediately
- Handle any race conditions between creation and refresh

### 4. Handle Loading and Error States

- Show appropriate loading state while fetching conversations
- Handle empty state when no conversations exist
- Log errors appropriately (UI error handling in Feature 2)

### 5. Update Data Mapping

- Ensure conversation data from hook matches ConversationItemDisplay expectations
- Map database conversation format to UI format if needed
- Handle any missing or optional fields in conversation data

## Detailed Acceptance Criteria

- [ ] useConversations hook is imported and working in SidebarContainerDisplay
- [ ] Sidebar displays real conversation data from database instead of props
- [ ] New conversation appears in list immediately after creation
- [ ] List refreshes automatically after successful conversation creation
- [ ] Loading states are handled appropriately during list fetch
- [ ] Empty state shows when no conversations exist
- [ ] List updates without breaking sidebar layout
- [ ] TypeScript types align between hooks and components
- [ ] Error states don't crash the component

## Technical Approach

```typescript
// In SidebarContainerDisplay.tsx
import { useConversations } from '../../hooks/conversations/useConversations';
import { useCreateConversation } from '../../hooks/conversations/useCreateConversation';

export function SidebarContainerDisplay({
  conversations: propConversations, // Keep prop for flexibility
  /* other existing props */
}) {
  const { conversations: hookConversations, loading: listLoading, refetch } = useConversations();
  const { createConversation, loading: creating } = useCreateConversation();

  // Use hook data when available, fall back to props
  const conversationsToDisplay = hookConversations || propConversations || [];

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
  const uiConversations = conversationsToDisplay.map(conv => ({
    name: conv.title || conv.name,
    lastActivity: conv.updated_at ? new Date(conv.updated_at).toLocaleString() : conv.lastActivity,
    isActive: conv.isActive || false
  }));

  return (
    <div className={/* existing classes */} style={dynamicStyles}>
      <SidebarHeaderDisplay
        title="Conversations"
        showControls={true}
        collapsed={collapsed}
      />

      <div className="flex flex-1 flex-col gap-1 min-h-[120px]">
        {listLoading ? (
          <div>Loading conversations...</div>
        ) : uiConversations.length === 0 ? (
          <div>No conversations yet</div>
        ) : (
          uiConversations.map((conv, index) => (
            <ConversationItemDisplay
              key={conv.id || index}
              conversation={conv}
              appearanceState={conv.isActive ? "active" : "inactive"}
              showUnreadIndicator={false}
            />
          ))
        )}
      </div>

      <div className="mt-auto">
        <NewConversationButton
          onClick={handleNewConversation}
          loading={creating}
          disabled={creating}
        />
      </div>
    </div>
  );
}
```

## Files to Modify

- `apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx` - Add useConversations hook and data flow

## Testing Requirements

### Unit Tests (include in this task)

- Mock both hooks (useConversations and useCreateConversation)
- Test that refetch is called after successful creation
- Test real conversations are displayed when hook returns data
- Test fallback to prop conversations when hook data unavailable
- Test loading states for both list and creation
- Verify empty state when no conversations
- Test data transformation between hook and UI formats

### Manual Testing

- Load page and verify existing conversations appear from database
- Create new conversation and verify it appears in list immediately
- Test with empty database (no conversations) shows empty state
- Verify no duplicate entries after creation
- Check list order matches database sort order
- Test loading states during initial load and refresh

## Dependencies

- Previous tasks are complete (NewConversationButton integration)
- useConversations hook is functional
- useCreateConversation hook is working
- Database has conversations table with proper data
- IPC list and create endpoints are working

## Performance Considerations

- Avoid unnecessary re-renders when list updates
- Consider caching strategy for conversation list
- Ensure list refresh is efficient for large datasets
- Handle concurrent creation requests gracefully

## Data Flow Notes

This task changes the data flow from:

```
Home.tsx (static data) → ConversationLayoutDisplay → SidebarContainerDisplay
```

To:

```
SidebarContainerDisplay → useConversations hook → Database
```

The conversations prop will become optional fallback data rather than the primary source.

## Time Estimate

2-3 hours including testing, data mapping, and handling edge cases
