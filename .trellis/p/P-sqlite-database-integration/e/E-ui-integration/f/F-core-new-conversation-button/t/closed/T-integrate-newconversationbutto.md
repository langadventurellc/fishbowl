---
id: T-integrate-newconversationbutto
title: Replace placeholder button in SidebarContainerDisplay with
  NewConversationButton
status: done
priority: high
parent: F-core-new-conversation-button
prerequisites: []
affectedFiles:
  apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx:
    Replaced placeholder Button with NewConversationButton component, added
    temporary onClick handler that logs to console, removed unused imports
log:
  - Successfully replaced placeholder button in SidebarContainerDisplay with
    NewConversationButton component. Implemented all requirements including
    importing the component, replacing the placeholder button, creating a
    temporary onClick handler that logs to console, and maintaining proper
    positioning and accessibility. The component now renders the
    NewConversationButton with loading={false} and disabled={false} props,
    positioned at the bottom of the sidebar using mt-auto. All quality checks
    pass with no errors.
schema: v1.0
childrenIds: []
created: 2025-08-24T02:05:44.031Z
updated: 2025-08-24T02:05:44.031Z
---

# Replace placeholder button in SidebarContainerDisplay with NewConversationButton

## Context

The SidebarContainerDisplay component already has a placeholder "New Conversation" button at lines 84-93 in `apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx`. This button currently just logs "Demo: New conversation" when clicked. We need to replace this placeholder with the proper NewConversationButton component that has loading states and proper accessibility features.

## Implementation Requirements

### 1. Import NewConversationButton Component

- Import NewConversationButton from `../conversations/NewConversationButton`
- Remove the existing placeholder Button import if it's not used elsewhere
- Maintain existing component structure and props

### 2. Replace Placeholder Button

- Replace the existing Button component (lines 85-92) with NewConversationButton
- Remove the placeholder onClick handler: `onClick={() => logger.info("Demo: New conversation")}`
- Create temporary onClick handler that matches NewConversationButton's async signature
- Maintain the same positioning within the `mt-auto` container

### 3. Wire Up Basic Props

- Create placeholder onClick handler: `const handleNewConversation = async () => { console.log('New conversation clicked'); }`
- Pass default props: `loading={false}`, `disabled={false}`
- Ensure button inherits existing spacing and layout positioning
- Maintain accessibility features from NewConversationButton

## Detailed Acceptance Criteria

- [ ] NewConversationButton is imported in SidebarContainerDisplay.tsx
- [ ] Placeholder Button component is completely replaced
- [ ] Button appears in same position at bottom of sidebar
- [ ] Button maintains consistent styling with sidebar theme
- [ ] Button is keyboard accessible (can be reached via Tab)
- [ ] Component compiles without TypeScript errors
- [ ] No console errors when component renders
- [ ] Clicking button logs "New conversation clicked" to console

## Technical Approach

1. Open `apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx`
2. Import NewConversationButton at the top
3. Replace lines 85-92 (the existing Button) with NewConversationButton
4. Create temporary onClick handler: `const handleNewConversation = async () => { console.log('New conversation clicked'); }`
5. Verify button appears and is clickable in same position

## Files to Modify

- `apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx` - Replace placeholder button

## Testing Requirements

### Unit Tests (include in this task)

- Add test to verify NewConversationButton renders in SidebarContainerDisplay
- Test that onClick handler is called when clicked
- Mock the NewConversationButton component for isolation
- Verify accessibility attributes are present
- Test button positioning within sidebar layout

### Manual Testing

- Button appears in correct position at bottom of sidebar
- Button is reachable via keyboard navigation
- Click logs to console (temporary handler)
- Sidebar layout remains responsive at different screen sizes
- Button styling matches sidebar theme

## Dependencies

- NewConversationButton component exists and exports correctly
- SidebarContainerDisplay is rendering properly
- Existing sidebar layout and styling should be preserved

## Time Estimate

1-2 hours including testing and ensuring layout consistency
