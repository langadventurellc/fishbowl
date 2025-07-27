---
kind: task
id: T-implement-navigation-panel
title: Implement navigation panel keyboard controls with tests
status: open
priority: high
prerequisites: []
created: "2025-07-27T11:56:23.942189"
updated: "2025-07-27T11:56:23.942189"
schema_version: "1.1"
parent: F-keyboard-navigation-and
---

# Implement Navigation Panel Keyboard Controls with Tests

## Context and Purpose

Implement arrow key navigation for the settings modal navigation panel, allowing users to navigate between sections using Up/Down arrows, Home/End keys, and Enter/Space for activation. This enhances keyboard accessibility and provides efficient navigation for power users.

**Reference**: Feature F-keyboard-navigation-and specifies comprehensive keyboard navigation including arrow keys, Home/End, and Enter/Space activation patterns.

**Related Components**:

- `apps/desktop/src/components/settings/SettingsNavigation.tsx` (existing navigation structure)
- `apps/desktop/src/components/settings/NavigationItem.tsx` (individual navigation items)

## Technical Implementation

### Create Hook File: `apps/desktop/src/hooks/useKeyboardNavigation.ts`

```typescript
interface KeyboardNavigationOptions {
  items: string[];
  activeItem: string;
  onItemChange: (item: string) => void;
  onItemActivate?: (item: string) => void;
  orientation?: "vertical" | "horizontal";
  loop?: boolean;
  disabled?: boolean;
}

interface KeyboardNavigationReturn {
  handleKeyDown: (event: React.KeyboardEvent) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
}
```

### Core Implementation Requirements

- **Arrow Navigation**: Up/Down arrows move between navigation items
- **Boundary Navigation**: Home key jumps to first item, End key jumps to last item
- **Activation**: Enter and Space keys activate the focused navigation item
- **Looping**: Optional wraparound when reaching first/last items
- **Prevention**: Prevent default browser behavior for handled keys
- **Focus Sync**: Keep visual focus in sync with keyboard navigation

### Keyboard Event Mapping

```typescript
const KEY_MAPPINGS = {
  ArrowDown: "next",
  ArrowUp: "previous",
  Home: "first",
  End: "last",
  Enter: "activate",
  " ": "activate", // Space key
} as const;
```

## Detailed Acceptance Criteria

### Keyboard Navigation Requirements

- [ ] ArrowDown moves to next navigation item
- [ ] ArrowUp moves to previous navigation item
- [ ] Home key moves to first navigation item
- [ ] End key moves to last navigation item
- [ ] Enter key activates focused navigation item
- [ ] Space key activates focused navigation item
- [ ] Default browser behavior prevented for handled keys
- [ ] Optional looping when reaching boundaries

### Focus Management Requirements

- [ ] Visual focus indicators update with keyboard navigation
- [ ] Focus stays within navigation panel during arrow key usage
- [ ] Focus state persists during navigation item activation
- [ ] Compatible with existing focus trap when modal is active
- [ ] Works correctly when navigation panel gains/loses focus

### Integration Requirements

- [ ] Integrates with existing `useActiveSection` hook from shared package
- [ ] Works with existing `SettingsNavigation` component structure
- [ ] Compatible with responsive navigation behavior (collapsible)
- [ ] Maintains existing mouse/click interaction patterns
- [ ] Supports both main navigation and sub-navigation tabs

## Testing Requirements

### Unit Test File: `apps/desktop/src/hooks/__tests__/useKeyboardNavigation.test.ts`

**Required Test Cases:**

- [ ] Hook initializes with correct focused index
- [ ] ArrowDown moves to next item correctly
- [ ] ArrowUp moves to previous item correctly
- [ ] Home key moves to first item
- [ ] End key moves to last item
- [ ] Enter key calls onItemActivate with correct item
- [ ] Space key calls onItemActivate with correct item
- [ ] Boundary behavior: first item + ArrowUp (with/without looping)
- [ ] Boundary behavior: last item + ArrowDown (with/without looping)
- [ ] Non-navigation keys don't interfere with navigation
- [ ] Disabled state prevents navigation
- [ ] Empty items array handled gracefully

**Integration Test Cases:**

- [ ] Navigation works within SettingsNavigation component
- [ ] Focus indicators update correctly during navigation
- [ ] Navigation state syncs with Zustand store
- [ ] Works correctly with dynamic navigation item lists

### Test Utilities:

```typescript
// Simulate keyboard events
const simulateKeyDown = (key: string, options?: { shiftKey?: boolean }) => { ... }

// Create test navigation setup
const createTestNavigation = (items: string[], activeItem: string) => { ... }

// Verify navigation state
const expectNavigationState = (focusedIndex: number, activeItem: string) => { ... }
```

## Component Integration

### Update NavigationItem Component: `apps/desktop/src/components/settings/NavigationItem.tsx`

**Enhancement Requirements:**

- [ ] Add `tabIndex` management for keyboard focus
- [ ] Handle keyboard events when focused
- [ ] Visual focus indicators for keyboard navigation
- [ ] ARIA attributes for navigation state

```typescript
interface NavigationItemProps {
  // ... existing props
  isFocused?: boolean;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  tabIndex?: number;
}
```

### Update SettingsNavigation Component: `apps/desktop/src/components/settings/SettingsNavigation.tsx`

**Integration Requirements:**

- [ ] Use `useKeyboardNavigation` hook
- [ ] Pass keyboard event handlers to NavigationItem components
- [ ] Manage focus state across navigation items
- [ ] Handle focus restoration when navigation panel is focused

## Implementation Guidance

### Event Handling Strategy

1. **Event Interception**: Capture keydown events on navigation container
2. **Key Mapping**: Map keyboard events to navigation actions
3. **State Update**: Update focused item and call appropriate callbacks
4. **Focus Management**: Ensure focused item receives visual focus
5. **Prevention**: Prevent default behavior for handled keys only

### Accessibility Considerations

- Use `role="navigation"` on navigation container
- Set `aria-orientation="vertical"` for vertical navigation
- Update `aria-current="page"` for active navigation item
- Ensure focus indicators meet 3:1 contrast ratio
- Provide screen reader announcements for navigation changes

### Performance Optimizations

- Use `useCallback` for event handlers to prevent re-renders
- Debounce rapid keyboard navigation if needed
- Minimize DOM queries during navigation
- Cache item elements for direct focus management

## Security Considerations

### Input Validation

- Validate array indices before accessing items
- Handle malformed or empty navigation item arrays
- Sanitize navigation item identifiers

### Event Security

- Prevent keyboard event injection attacks
- Validate event targets before handling
- Ensure navigation doesn't bypass intended access controls

## Dependencies

- React hooks (useState, useEffect, useCallback)
- Existing NavigationItem and SettingsNavigation components
- Zustand store hooks for navigation state
- Jest and React Testing Library for tests

## File Organization

```
apps/desktop/src/hooks/
├── useKeyboardNavigation.ts
└── __tests__/
    └── useKeyboardNavigation.test.ts

apps/desktop/src/components/settings/
├── NavigationItem.tsx (enhanced)
└── SettingsNavigation.tsx (enhanced)
```

## Success Metrics

- All unit tests pass with >95% coverage
- Navigation works smoothly with arrow keys in all browsers
- Integration tests pass for SettingsNavigation component
- Focus indicators clearly visible during keyboard navigation
- No conflicts with existing mouse interaction patterns
- Performance benchmarks meet <16ms response time requirements

### Log
