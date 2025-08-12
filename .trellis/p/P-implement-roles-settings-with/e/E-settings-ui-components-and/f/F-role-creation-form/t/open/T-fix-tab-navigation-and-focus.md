---
id: T-fix-tab-navigation-and-focus
title: Fix tab navigation and focus management in role form
status: open
priority: medium
parent: F-role-creation-form
prerequisites:
  - T-add-system-prompt-field-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T21:38:31.742Z
updated: 2025-08-12T21:38:31.742Z
---

# Fix Tab Navigation and Focus Management

## Context

The user reported that "tabbing isn't working properly in the form." This indicates issues with keyboard navigation and focus management in the role creation form. Proper tab order and focus management are essential for accessibility and user experience.

## Current Issues to Investigate and Fix

### Potential Tab Navigation Problems

1. **Tab Order**: Fields might not follow logical sequence (name → description → system prompt → buttons)
2. **Focus Trapping**: Modal may not properly trap focus within the dialog
3. **Initial Focus**: First field may not receive focus when modal opens
4. **Focus Return**: Focus may not return properly when modal closes
5. **Skip Links**: Tab might skip fields or get stuck on certain elements

### Expected Tab Navigation Flow

1. **Modal Opens**: Focus moves to first field (name input)
2. **Tab Forward**: name → description → system prompt → cancel button → save button
3. **Tab Backward**: Reverse order with Shift+Tab
4. **Modal Close**: Focus returns to trigger element

## Implementation Requirements

### Focus Management Fixes

#### 1. Initial Focus Setup

Ensure first field receives focus when modal opens:

```tsx
// In RoleFormModal.tsx
useEffect(() => {
  if (isOpen) {
    // Focus first field after modal animation
    setTimeout(() => {
      const firstField = document.getElementById("role-name");
      firstField?.focus();
    }, 100);
  }
}, [isOpen]);
```

#### 2. Tab Index Management

Verify all form elements have proper tab indices:

```tsx
// Ensure inputs have correct tabIndex
<Input
  id="role-name"
  tabIndex={1}
  // other props
/>
<Textarea
  id="role-description"
  tabIndex={2}
  // other props
/>
<Textarea
  id="role-system-prompt"
  tabIndex={3}
  // other props
/>
```

#### 3. Focus Trap Implementation

Implement proper focus trapping in modal:

```tsx
// In RoleFormModal.tsx - add focus trap
const handleKeyDown = useCallback((event: KeyboardEvent) => {
  if (event.key === "Tab") {
    // Implement focus trap logic
    const focusableElements = modal.querySelectorAll(
      'input, textarea, button, [tabindex]:not([tabindex="-1"])',
    );
    // Handle tab navigation within modal
  }
}, []);
```

### Button Focus Management

Ensure proper focus flow for form actions:

- Cancel button should be reachable via tab
- Save button should be last in tab order
- Enter key in textareas should not submit form (only save button)
- Escape key should close modal

### Accessibility Improvements

1. **ARIA Navigation**: Ensure proper ARIA attributes for screen readers
2. **Focus Indicators**: Clear visual focus indicators on all elements
3. **Skip Links**: Allow users to navigate efficiently
4. **Error Focus**: When validation fails, focus moves to first error field

## Technical Approach

1. **Audit Current Tab Order**: Test existing tab navigation manually
2. **Identify Focus Issues**: Document where tab navigation breaks
3. **Implement Focus Management**: Add proper focus handling
4. **Test Keyboard Navigation**: Verify tab order works correctly
5. **Test Screen Readers**: Ensure accessibility compliance

## Acceptance Criteria

- [ ] Tab navigation follows logical order: name → description → system prompt → cancel → save
- [ ] Shift+Tab navigates in reverse order correctly
- [ ] Modal opens with focus on first field (name input)
- [ ] Focus is trapped within modal (doesn't escape to background)
- [ ] Escape key closes modal and returns focus to trigger
- [ ] Enter key in single-line inputs moves to next field
- [ ] Enter key in textareas creates new line (doesn't submit)
- [ ] Clear visual focus indicators on all interactive elements
- [ ] Screen reader announces field labels and validation errors
- [ ] When validation fails, focus moves to first invalid field

## Dependencies

- Requires `T-add-system-prompt-field-to` to include system prompt in tab order
- Depends on complete form structure being in place

## Testing Requirements

- Manual keyboard testing with Tab/Shift+Tab navigation
- Test with screen reader software (NVDA, JAWS, or VoiceOver)
- Test modal focus behavior (open, close, escape)
- Test form submission with Enter key from different fields
- Verify focus indicators are visible and clear
- Test error focus management when validation fails

## Implementation Files

- `apps/desktop/src/components/settings/roles/RoleFormModal.tsx` - Focus management
- `apps/desktop/src/components/settings/roles/CreateRoleForm.tsx` - Tab order
- Individual input components - Ensure proper tabIndex and ARIA attributes

## Browser Compatibility

- Test focus management across Chrome, Firefox, Safari, Edge
- Ensure consistent behavior across operating systems
- Verify screen reader compatibility on different platforms
