---
id: T-implement-focus-management
title: Implement focus management and accessibility features
status: open
priority: medium
parent: F-implement-settingsformmodal
prerequisites:
  - T-create-settingsformmodal-base
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-31T04:51:47.313Z
updated: 2025-08-31T04:51:47.313Z
---

# Implement Focus Management and Accessibility

## Context

Add comprehensive focus management and accessibility features to SettingsFormModal, including focus trapping, initial focus handling, screen reader announcements, and proper focus restoration.

## Implementation Requirements

### 1. Focus Trap Integration

- **Hook Usage**: Integrate existing `useFocusTrap` hook from codebase
- **Initial Focus**: Support configurable `initialFocusSelector` prop
- **Focus Containment**: Ensure focus cannot escape modal boundaries
- **Tab Navigation**: Proper tab order within modal

### 2. Focus Restoration

- **Save Previous Focus**: Remember the element that triggered modal
- **Restore on Close**: Return focus to triggering element when modal closes
- **Edge Cases**: Handle cases where trigger element is removed from DOM

### 3. Screen Reader Support

- **Optional Announcements**: Support `announceOnOpen` prop for custom messages
- **ARIA Attributes**: Proper modal labeling and descriptions
- **No Conflicts**: Avoid double announcements with child form components
- **Live Regions**: Use existing `announceToScreenReader` utility

### 4. Accessibility Enhancements

- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Indicators**: Visible focus indicators for all interactive elements
- **Screen Reader Context**: Clear modal purpose and navigation instructions

## Technical Approach

### 1. Focus Management Hook Integration

```typescript
import { useFocusTrap } from "@fishbowl-ai/shared"; // Verify correct import path

const SettingsFormModal: React.FC<SettingsFormModalProps> = ({
  isOpen,
  initialFocusSelector,
  announceOnOpen,
  // ... other props
}) => {
  useFocusTrap({
    isEnabled: isOpen,
    initialFocusSelector,
    // Additional focus trap configuration
  });

  // ... rest of component
};
```

### 2. Screen Reader Announcements

```typescript
import { announceToScreenReader } from "@fishbowl-ai/shared"; // Verify path

useEffect(() => {
  if (isOpen && announceOnOpen) {
    // Small delay to ensure modal is rendered
    const timeoutId = setTimeout(() => {
      announceToScreenReader(announceOnOpen);
    }, 100);

    return () => clearTimeout(timeoutId);
  }
}, [isOpen, announceOnOpen]);
```

### 3. ARIA Attributes Configuration

- Ensure Dialog components have proper aria-labelledby, aria-describedby
- Configure modal role and accessibility properties
- Set appropriate aria-modal attribute

## Acceptance Criteria

### Focus Management

- ✅ **Focus Trap**: Tab navigation contained within modal
- ✅ **Initial Focus**: Configurable first focus target via initialFocusSelector
- ✅ **Focus Restoration**: Returns focus to trigger element on close
- ✅ **Focus Indicators**: Visible focus indicators on all interactive elements

### Accessibility

- ✅ **Screen Reader Announcements**: Optional announceOnOpen message works
- ✅ **ARIA Labels**: Proper modal labeling with title and description
- ✅ **Modal Role**: Correct ARIA modal role and attributes
- ✅ **No Double Announcements**: Doesn't conflict with child form announcements

### User Experience

- ✅ **Keyboard Navigation**: Full accessibility via keyboard only
- ✅ **Context Clarity**: Users understand modal purpose and navigation
- ✅ **Focus Flow**: Logical tab order through modal elements

### Unit Testing

Write comprehensive tests covering:

- ✅ **Focus Trap Activation**: useFocusTrap called with correct parameters
- ✅ **Initial Focus**: initialFocusSelector passed correctly to focus trap
- ✅ **Screen Reader**: announceToScreenReader called with announceOnOpen text
- ✅ **ARIA Attributes**: Proper aria-labelledby and describedby attributes
- ✅ **Conditional Behavior**: Features only active when isOpen is true
- ✅ **Edge Cases**: Handle missing initialFocusSelector gracefully

## Dependencies

- **Prerequisite**: T-create-settingsformmodal-base (base component structure)
- **External Dependencies**:
  - `useFocusTrap` hook from shared package
  - `announceToScreenReader` utility from shared package

## Out of Scope

- Keyboard event handling (separate task)
- Unsaved changes confirmation (separate task)
- Form validation or error handling (child component responsibility)

## Research Required

- Verify exact import paths for `useFocusTrap` and `announceToScreenReader`
- Check existing focus trap configuration options in codebase
- Review current accessibility patterns in other modal components

## Files to Modify

- `apps/desktop/src/components/settings/common/SettingsFormModal.tsx`
- Unit test file updates for accessibility testing
