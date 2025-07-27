---
kind: task
id: T-create-modal-header-component
title: Create modal header component with exact specifications
status: open
priority: high
prerequisites: []
created: "2025-07-26T20:49:06.045305"
updated: "2025-07-26T20:49:06.045305"
schema_version: "1.1"
parent: F-modal-shell-structure-and-layout
---

# Modal Header Component Implementation

## Context

Create a dedicated modal header component that meets the exact UI specification requirements for the settings modal. The header serves as the top section of the modal with title and close functionality.

## Implementation Requirements

### Component Structure

- File: `apps/desktop/src/components/settings/ModalHeader.tsx`
- Create reusable header component for settings modal
- Integrate with existing Zustand state management
- Follow existing code patterns from `SettingsModal.tsx`

### Exact Specifications

- **Height**: Exactly 50px
- **Background**: Slightly darker than content area for visual hierarchy
- **Title**: "Settings" text, 18px font, left-aligned with 20px padding
- **Close Button**: Standard × button, right-aligned, 40x40px hover area
- **Border**: No bottom border (separation handled by content layout)

### Styling Requirements

```tsx
// Header container: 50px height, proper background
height: 50px
background: slightly darker than content area
display: flex
align-items: center
justify-content: space-between
padding: 0 20px

// Title styling
font-size: 18px
font-weight: medium
text-align: left

// Close button
width: 40px
height: 40px
hover area: 40x40px
icon: × (X)
```

### Functionality

- Close button triggers `closeModal()` action from Zustand store
- Proper hover and focus states for accessibility
- Keyboard navigation support (Tab to close button, Enter/Space to activate)
- Screen reader compatible with proper ARIA attributes

### Integration Points

- Use `useSettingsModal()` hook from `@fishbowl-ai/shared`
- Import close functionality: `closeModal` action
- Follow existing patterns from `SettingsModal.tsx`
- Use existing shadcn/ui Button component for close button

### Acceptance Criteria

- [ ] Header renders with exactly 50px height
- [ ] "Settings" title displays with 18px font and 20px left padding
- [ ] Close button positioned right-aligned with 40x40px hover area
- [ ] Close button triggers modal close through Zustand store
- [ ] Header background darker than content area for visual separation
- [ ] Proper typography and color contrast for accessibility
- [ ] Hover and focus states work correctly for close button
- [ ] Keyboard navigation (Tab, Enter, Space) works properly
- [ ] Component includes comprehensive unit tests

## Technical Approach

1. Create new component file with TypeScript interface
2. Use existing Button component for close button
3. Integrate with Zustand store for close functionality
4. Implement responsive design with Tailwind CSS
5. Add proper ARIA attributes for accessibility
6. Write unit tests for component behavior

## Dependencies

- Must use existing Zustand store: `useSettingsModal`
- Must integrate with existing Button component
- Must follow existing code patterns and styling approach

## Testing Requirements

- Unit tests for component rendering
- Unit tests for close button functionality
- Unit tests for Zustand store integration
- Accessibility testing for keyboard navigation
- Visual regression tests for styling accuracy

### Log
