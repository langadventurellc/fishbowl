---
id: F-core-new-conversation-button
title: Core New Conversation Button Integration
status: in-progress
priority: medium
parent: E-ui-integration
prerequisites: []
affectedFiles:
  apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx:
    "Replaced placeholder Button with NewConversationButton component, added
    temporary onClick handler that logs to console, removed unused imports;
    Added useCreateConversation hook integration: imported hook, initialized
    with proper destructuring of createConversation, isCreating state, and
    unused error/reset values (prefixed with underscore). Replaced placeholder
    onClick handler with async handleNewConversation function that calls
    createConversation, logs success/error, and includes proper error handling.
    Connected isCreating state to NewConversationButton's loading and disabled
    props for proper UI feedback during async operations."
log: []
schema: v1.0
childrenIds:
  - T-connect-usecreateconversation
  - T-integrate-useconversations
  - T-integrate-newconversationbutto
created: 2025-08-24T02:02:10.709Z
updated: 2025-08-24T02:02:10.709Z
---

# Core New Conversation Button Integration

## Purpose and Functionality

Integrate the existing NewConversationButton component into the application's main UI (Home.tsx) and wire it up with the useCreateConversation hook to enable users to create new conversations. This feature establishes the basic end-to-end flow from button click to database record creation.

## Key Components to Implement

### 1. Button Placement in Home.tsx

- Import and add NewConversationButton component to the Home page layout
- Position the button appropriately within the ConversationLayoutDisplay
- Pass necessary props and handlers to the button component

### 2. Hook Integration

- Connect useCreateConversation hook in Home.tsx
- Wire up the button's onClick handler to the hook's createConversation function
- Handle the async operation and state updates

### 3. Basic State Management

- Manage button disabled state during conversation creation
- Prevent double-clicks and multiple simultaneous creations
- Update the conversations list after successful creation

## Detailed Acceptance Criteria

### Button Implementation

- [ ] NewConversationButton is visible in Home.tsx interface
- [ ] Button is positioned logically in the layout (e.g., above or below conversation list)
- [ ] Button uses the existing shadcn/ui Button component styling
- [ ] Button is accessible via keyboard navigation (Tab key)
- [ ] Button has proper aria-labels for accessibility

### Hook Wiring

- [ ] useCreateConversation hook is properly imported and initialized
- [ ] Button onClick triggers the createConversation function
- [ ] Loading state from hook is passed to button's loading prop
- [ ] Error state from hook is captured (for Feature 2 to handle)
- [ ] Successful creation triggers appropriate state updates

### Functional Behavior

- [ ] Clicking the button creates a new conversation in the database
- [ ] New conversation appears in the conversations list after creation
- [ ] Button is disabled while a conversation is being created
- [ ] Multiple rapid clicks don't create duplicate conversations
- [ ] The async operation completes without blocking the UI

### Data Flow

- [ ] Button click → useCreateConversation hook → window.api.conversations.create()
- [ ] Response from IPC layer updates local state
- [ ] Conversations list refreshes to show new conversation
- [ ] Component re-renders reflect the new state

## Technical Requirements

### Integration Points

- Uses existing NewConversationButton component from `components/conversations/`
- Uses existing useCreateConversation hook from `hooks/conversations/`
- Integrates with existing IPC layer via window.api.conversations
- Works with existing ConversationLayoutDisplay component structure

### Code Patterns

- Follow existing React patterns in the codebase
- Use TypeScript for all new code
- Maintain existing component prop interfaces
- Use React.useCallback for event handlers where appropriate

## Implementation Guidance

### Suggested Approach

1. Import NewConversationButton into Home.tsx
2. Import and initialize useCreateConversation hook
3. Create onClick handler that calls createConversation
4. Pass loading and disabled states to button
5. Ensure conversations list updates after creation (may need useConversations hook)
6. Test the complete flow from click to database

### File Modifications

- `apps/desktop/src/pages/Home.tsx` - Main integration point
- Potentially `apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx` if button needs to be passed through

## Testing Requirements

### Manual Testing

- Click button and verify new conversation appears
- Test rapid clicking doesn't create duplicates
- Test keyboard navigation to button
- Verify button disabled state during creation

### Unit Tests

- Test button integration in Home component
- Test hook wiring and state management
- Mock window.api calls for testing
- Test loading and disabled states

## Dependencies

- NewConversationButton component must be complete
- useCreateConversation hook must be functional
- IPC handlers must be properly registered
- Database infrastructure must be operational

## Success Metrics

- Button click successfully creates database record
- New conversation visible in UI after creation
- No console errors during operation
- Component renders without performance issues
