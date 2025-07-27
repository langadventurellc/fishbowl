---
kind: task
id: T-create-focus-trap-hook-with-unit
title: Create focus trap hook with unit tests
status: open
priority: high
prerequisites: []
created: "2025-07-27T11:55:43.003700"
updated: "2025-07-27T11:55:43.003700"
schema_version: "1.1"
parent: F-keyboard-navigation-and
---

# Create Focus Trap Hook with Unit Tests

## Context and Purpose

Implement a custom React hook that manages focus trapping within the settings modal, ensuring users cannot tab outside the modal boundaries while it's open. This is a fundamental accessibility requirement for modal dialogs as specified in WCAG 2.1 guidelines.

**Reference**: Feature F-keyboard-navigation-and specifies comprehensive focus trap functionality including proper focus restoration and dynamic content handling.

## Technical Implementation

### Create Hook File: `apps/desktop/src/hooks/useFocusTrap.ts`

```typescript
interface FocusTrapOptions {
  isActive: boolean;
  restoreFocus?: boolean;
  initialFocusSelector?: string;
}

interface FocusTrapReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  setInitialFocus: (element: HTMLElement | null) => void;
}
```

### Core Implementation Requirements

- **Focus Storage**: Store reference to previously focused element when trap activates
- **Initial Focus**: Move focus to first focusable element or specified element when modal opens
- **Focus Containment**: Prevent Tab and Shift+Tab from moving focus outside container
- **Focus Restoration**: Return focus to original element when trap deactivates
- **Dynamic Content**: Handle focus management when modal content changes

### Focusable Elements Query

```typescript
const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '[contenteditable="true"]',
].join(", ");
```

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] Hook activates focus trap when `isActive` is true
- [ ] Focus moves to first focusable element when trap activates (or element specified by `initialFocusSelector`)
- [ ] Tab key navigation contained within `containerRef` element
- [ ] Shift+Tab navigation contained within `containerRef` element
- [ ] Focus restored to previous element when trap deactivates
- [ ] Works correctly with dynamically added/removed focusable elements
- [ ] Gracefully handles edge cases (no focusable elements, container not rendered)

### Event Handling Requirements

- [ ] Keydown event listener attached only when trap is active
- [ ] Event listeners properly cleaned up when component unmounts
- [ ] Event listeners update correctly when dependencies change
- [ ] No memory leaks from event listener management

### Integration Requirements

- [ ] Compatible with existing modal structure in `SettingsModal.tsx`
- [ ] Works with shadcn/ui Dialog components
- [ ] Integrates with existing focus indicator styles
- [ ] Supports server-side rendering (no window/document access during SSR)

## Testing Requirements

### Unit Test File: `apps/desktop/src/hooks/__tests__/useFocusTrap.test.ts`

**Required Test Cases:**

- [ ] Hook initializes without crashing
- [ ] Focus trap activates when `isActive` becomes true
- [ ] Focus moves to first focusable element on activation
- [ ] Tab navigation stays within container boundaries
- [ ] Shift+Tab navigation stays within container boundaries
- [ ] Focus restoration works when trap deactivates
- [ ] Edge case: no focusable elements in container
- [ ] Edge case: container ref is null
- [ ] Dynamic content: focusable elements added after activation
- [ ] Multiple activation/deactivation cycles work correctly
- [ ] Event listeners cleaned up on unmount

**Test Utilities:**

```typescript
// Create test containers with focusable elements
const createTestContainer = (focusableCount: number) => { ... }

// Simulate keyboard events
const simulateTab = (shiftKey = false) => { ... }

// Verify focus location
const expectFocusOn = (element: HTMLElement) => { ... }
```

## Implementation Guidance

### Focus Management Strategy

1. **Activation**: Store `document.activeElement`, find focusable elements, focus first
2. **Tab Handling**: Intercept Tab/Shift+Tab, calculate next focus target within container
3. **Deactivation**: Restore focus to stored element, clean up event listeners
4. **Edge Cases**: Handle empty containers, disabled elements, hidden elements

### Performance Considerations

- Debounce focusable element queries for dynamic content
- Use `useCallback` for event handlers to prevent unnecessary re-renders
- Minimize DOM queries by caching focusable elements when possible
- Clean up event listeners immediately when trap deactivates

### Browser Compatibility

- Test focus management in Chrome, Firefox, Safari, Edge
- Ensure consistent behavior across different focusable element types
- Handle browser-specific focus behavior differences

## Security Considerations

### Input Validation

- Validate containerRef exists before manipulating focus
- Sanitize selector strings if accepting external selectors
- Handle malformed DOM structures gracefully

### XSS Prevention

- Never use innerHTML or dangerouslySetInnerHTML with user-provided selectors
- Use secure DOM manipulation methods only

## Dependencies

- React hooks (useRef, useEffect, useCallback)
- Existing TypeScript configuration
- Jest and React Testing Library for tests
- Integration point: SettingsModal component

## File Organization

```
apps/desktop/src/hooks/
├── useFocusTrap.ts
└── __tests__/
    └── useFocusTrap.test.ts
```

## Success Metrics

- All unit tests pass with >95% coverage
- Hook integrates successfully with SettingsModal component
- Focus trap works consistently across all supported browsers
- No performance regressions in modal open/close operations
- Passes automated accessibility testing tools

### Log
