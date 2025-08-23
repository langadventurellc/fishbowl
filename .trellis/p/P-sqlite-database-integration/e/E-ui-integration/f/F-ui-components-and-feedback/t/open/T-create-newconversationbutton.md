---
id: T-create-newconversationbutton
title: Create NewConversationButton component with loading states
status: open
priority: high
parent: F-ui-components-and-feedback
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T20:27:46.511Z
updated: 2025-08-23T20:27:46.511Z
---

# Create NewConversationButton Component with Loading States

## Context

This task implements the core "New Conversation" button component that will be used in the Home.tsx page. The component needs to handle multiple UI states (idle, loading, success, error) and provide accessibility support. This follows the pattern established in existing UI components in the desktop application.

**Related Issues:**

- Feature: F-ui-components-and-feedback
- Epic: E-ui-integration
- Project: P-sqlite-database-integration

**Reference Implementation:**

- Existing buttons in `apps/desktop/src/components/ui/button.tsx`
- Loading patterns in `apps/desktop/src/components/chat/ThinkingIndicator.tsx`
- Input components with states in `apps/desktop/src/components/settings/` directory

## Detailed Implementation Requirements

### File Creation

Create `apps/desktop/src/components/conversations/NewConversationButton.tsx` with:

```typescript
interface NewConversationButtonProps {
  onClick: () => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onSuccess?: (conversation: Conversation) => void;
  onError?: (error: Error) => void;
}
```

### Component Structure

1. **Base Implementation**
   - Use shadcn/ui Button component as foundation
   - Implement functional React component with TypeScript
   - Use forwardRef for ref forwarding if needed
   - Follow existing component patterns in codebase

2. **State Management**
   - Accept loading prop to control loading state
   - Handle disabled state during operations
   - Manage internal state for button interactions
   - Use React.memo for performance optimization

3. **Visual States**
   - **Idle**: Default state with "New Conversation" text
   - **Loading**: Show spinner with "Creating..." text
   - **Disabled**: Grayed out appearance, not clickable
   - **Hover/Focus**: Appropriate feedback states

### Accessibility Implementation

1. **ARIA Attributes**
   - `aria-label="Create new conversation"`
   - `aria-describedby` for additional context
   - `aria-busy="true"` during loading state
   - `role="button"` (implicit with button element)

2. **Keyboard Support**
   - Tab navigation support
   - Enter and Space key activation
   - Focus management and visual focus indicators

3. **Screen Reader Support**
   - Announce state changes with aria-live regions
   - Descriptive text for loading states
   - Clear feedback for success/error states

### Styling Requirements

1. **Design System Compliance**
   - Use existing Tailwind CSS classes
   - Follow shadcn/ui button variants
   - Maintain consistency with app theme
   - Support responsive design

2. **Loading Indicator**
   - Use existing spinner component if available
   - Smooth transition animations (100-200ms)
   - Position spinner appropriately with text

3. **State Transitions**
   - Fade in/out animations for state changes
   - No layout shift during state transitions
   - Smooth hover/focus effects

### Security Considerations

- Prevent double-click through disabled state
- No sensitive data in props or state
- Sanitize any display text (if dynamic)

## Detailed Acceptance Criteria

### Functionality

- [ ] Button renders with "New Conversation" text in idle state
- [ ] onClick handler called when button is clicked
- [ ] Loading state shows spinner and "Creating..." text
- [ ] Button is disabled during loading state
- [ ] Component prevents multiple simultaneous clicks
- [ ] Props interface matches specified TypeScript definition

### Accessibility

- [ ] Button has proper aria-label attribute
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader announces state changes
- [ ] Focus states are visually clear
- [ ] WCAG 2.1 AA compliance achieved

### Visual Design

- [ ] Styling matches existing shadcn/ui components
- [ ] Hover states provide appropriate feedback
- [ ] Loading spinner positioned correctly
- [ ] Transitions are smooth (100-200ms duration)
- [ ] No layout shift during state changes
- [ ] Component works on different screen sizes

### Performance

- [ ] Component re-renders minimized with React.memo
- [ ] No memory leaks from event listeners
- [ ] Smooth animations at 60fps
- [ ] Button responds to clicks within 100ms

### Testing Requirements

**Unit Tests** (include in same task):

- [ ] Component renders with default props
- [ ] Loading state displays correctly
- [ ] onClick handler called on button click
- [ ] Disabled state prevents clicks
- [ ] Accessibility attributes present
- [ ] State transitions work correctly
- [ ] Performance optimization (memo) works

Test file: `apps/desktop/src/components/conversations/__tests__/NewConversationButton.test.tsx`

## Technical Approach

### Step-by-Step Implementation

1. **Setup Component Structure**

   ```typescript
   import React from 'react';
   import { Button } from '@/components/ui/button';
   import { Loader2 } from 'lucide-react'; // or existing spinner

   interface Props { /* define interface */ }

   export const NewConversationButton = React.memo<Props>(({...}) => {
     // Implementation
   });
   ```

2. **Implement State Handling**
   - Use props to control external state
   - Handle internal interaction states
   - Implement proper event handlers

3. **Add Loading UI**
   - Conditional rendering for loading spinner
   - Text changes during loading
   - Proper spacing and layout

4. **Accessibility Enhancement**
   - Add all required ARIA attributes
   - Implement keyboard event handlers
   - Test with screen reader

5. **Styling and Polish**
   - Apply consistent styling
   - Add smooth transitions
   - Test all visual states

6. **Unit Testing**
   - Write comprehensive test suite
   - Mock external dependencies
   - Test accessibility features
   - Verify performance optimizations

### Dependencies

- React (existing)
- shadcn/ui Button component (existing)
- Lucide React icons (existing) or custom spinner
- Tailwind CSS (existing)

### File Structure

```
apps/desktop/src/components/conversations/
├── NewConversationButton.tsx
└── __tests__/
    └── NewConversationButton.test.tsx
```

## Definition of Done

- Component created and exports properly
- All acceptance criteria met
- Unit tests written and passing
- TypeScript types are correct
- Accessibility requirements fulfilled
- Visual design matches specifications
- Performance optimizations implemented
- Component ready for integration in Home.tsx
