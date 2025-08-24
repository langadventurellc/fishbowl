---
id: T-integrate-newconversationbutto
title: Integrate NewConversationButton into Home.tsx layout
status: open
priority: high
parent: F-core-new-conversation-button
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T02:05:44.031Z
updated: 2025-08-24T02:05:44.031Z
---

# Integrate NewConversationButton into Home.tsx layout

## Context

The NewConversationButton component already exists at `apps/desktop/src/components/conversations/NewConversationButton.tsx` and needs to be integrated into the main Home page. The Home page currently uses a `ConversationLayoutDisplay` component that shows conversations and agents.

## Implementation Requirements

### 1. Import and Add Button Component

- Import NewConversationButton from `components/conversations/NewConversationButton`
- Add the button to the Home.tsx layout in a logical position (likely near the top of the sidebar or above the conversation list)
- Ensure the button is visually prominent but doesn't disrupt the existing layout

### 2. Position Button in Layout

- Review the current ConversationLayoutDisplay structure in `apps/desktop/src/components/layout/ConversationLayoutDisplay.tsx`
- Determine if the button should be:
  - Passed as a prop to ConversationLayoutDisplay
  - Added directly in Home.tsx above/below the layout
  - Integrated into the sidebar component
- Maintain consistent spacing and alignment with existing UI elements

### 3. Wire Up Basic Props

- Create a placeholder onClick handler (will be connected to hook in next task)
- Pass default props: `loading={false}`, `disabled={false}`
- Add appropriate className for styling if needed
- Ensure button inherits theme styles from shadcn/ui

## Detailed Acceptance Criteria

- [ ] NewConversationButton is imported in Home.tsx
- [ ] Button is visible in the UI when Home page loads
- [ ] Button position is logical and doesn't break layout
- [ ] Button maintains consistent styling with rest of app
- [ ] Button is keyboard accessible (can be reached via Tab)
- [ ] Component compiles without TypeScript errors
- [ ] No console errors when component renders

## Technical Approach

1. Open `apps/desktop/src/pages/Home.tsx`
2. Import NewConversationButton at the top
3. Add button to JSX, likely wrapping ConversationLayoutDisplay or as a sibling
4. Create temporary onClick handler: `const handleNewConversation = () => { console.log('New conversation clicked'); }`
5. Verify button appears and is clickable

## Files to Modify

- `apps/desktop/src/pages/Home.tsx` - Add button import and JSX

## Testing Requirements

### Unit Tests (include in this task)

- Add test to verify button renders in Home component
- Test that onClick handler is called when clicked
- Mock the NewConversationButton component for isolation
- Verify accessibility attributes are present

### Manual Testing

- Button appears in correct position
- Button is reachable via keyboard navigation
- Click logs to console (temporary handler)
- Layout remains responsive at different screen sizes

## Dependencies

- NewConversationButton component exists and exports correctly
- Home.tsx is rendering properly
- ConversationLayoutDisplay accepts children or has slot for button

## Time Estimate

1-2 hours including testing and layout adjustments
