---
kind: task
id: T-integrate-focus-trap-and
title: Integrate focus trap and keyboard navigation with modal
status: open
priority: high
prerequisites:
  - T-create-focus-trap-hook-with-unit
  - T-implement-navigation-panel
created: "2025-07-27T11:58:09.427417"
updated: "2025-07-27T11:58:09.427417"
schema_version: "1.1"
parent: F-keyboard-navigation-and
---

# Integrate Focus Trap and Keyboard Navigation with Modal

## Context and Purpose

Integrate the focus trap and keyboard navigation hooks with the existing settings modal components, ensuring seamless keyboard accessibility throughout the modal experience. This task connects all keyboard navigation functionality into a cohesive user experience.

**Reference**: Feature F-keyboard-navigation-and requires integration of focus management with the existing modal structure and navigation system.

**Dependencies**:

- T-create-focus-trap-hook-with-unit (focus trap implementation)
- T-implement-navigation-panel (keyboard navigation implementation)

**Related Components**:

- `apps/desktop/src/components/settings/SettingsModal.tsx` (main modal container)
- `apps/desktop/src/components/settings/SettingsNavigation.tsx` (navigation panel)

## Technical Implementation

### SettingsModal Component Integration

**File**: `apps/desktop/src/components/settings/SettingsModal.tsx`

#### Integration Requirements

- [ ] Import and use `useFocusTrap` hook for modal-level focus management
- [ ] Set up focus trap container ref on modal content
- [ ] Handle initial focus on modal open (close button or first navigation item)
- [ ] Implement Escape key handling for modal closing
- [ ] Coordinate focus trap with modal open/close state

```typescript
// Enhanced modal implementation
export function SettingsModal({ open, onOpenChange, ...props }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { containerRef } = useFocusTrap({
    isActive: open,
    restoreFocus: true,
    initialFocusSelector: '[data-modal-initial-focus]'
  });

  // Global escape key handling
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={containerRef}>
        {/* Modal content with integrated focus management */}
      </DialogContent>
    </Dialog>
  );
}
```

### SettingsNavigation Component Integration

**File**: `apps/desktop/src/components/settings/SettingsNavigation.tsx`

#### Integration Requirements

- [ ] Import and use `useKeyboardNavigation` hook
- [ ] Connect keyboard navigation with existing navigation state
- [ ] Handle focus management for navigation items
- [ ] Integrate keyboard navigation with responsive behavior (collapsible)
- [ ] Ensure keyboard navigation works with sub-navigation tabs

```typescript
export function SettingsNavigation({ activeSection, onSectionChange, ...props }) {
  const navigationSections = [/* existing sections */];

  const { handleKeyDown, focusedIndex, setFocusedIndex } = useKeyboardNavigation({
    items: navigationSections.map(s => s.id),
    activeItem: activeSection,
    onItemChange: onSectionChange,
    onItemActivate: onSectionChange,
    orientation: 'vertical',
    loop: true
  });

  return (
    <nav
      role="navigation"
      aria-label="Settings navigation"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {navigationSections.map((section, index) => (
        <NavigationItem
          key={section.id}
          {...section}
          active={activeSection === section.id}
          isFocused={focusedIndex === index}
          tabIndex={focusedIndex === index ? 0 : -1}
          onClick={() => onSectionChange(section.id)}
        />
      ))}
    </nav>
  );
}
```

### Global Keyboard Shortcuts Implementation

#### Create Hook: `apps/desktop/src/hooks/useGlobalKeyboardShortcuts.ts`

```typescript
interface GlobalShortcuts {
  Escape: () => void;
  "Ctrl+S": () => void;
  "Meta+S": () => void; // Mac Cmd+S
}

export const useGlobalKeyboardShortcuts = (
  shortcuts: Partial<GlobalShortcuts>,
  enabled: boolean,
) => {
  // Implementation for global keyboard shortcuts
};
```

## Detailed Acceptance Criteria

### Focus Trap Integration

- [ ] Focus trap activates when modal opens
- [ ] Initial focus moves to appropriate element (close button or first nav item)
- [ ] Tab navigation contained within modal boundaries
- [ ] Focus restoration works when modal closes
- [ ] Focus trap handles modal content changes (tab switching)
- [ ] Works correctly with responsive navigation behavior

### Keyboard Navigation Integration

- [ ] Arrow key navigation works in navigation panel
- [ ] Enter/Space activation integrates with existing click handlers
- [ ] Keyboard navigation state syncs with mouse interactions
- [ ] Navigation works correctly in both expanded and collapsed states
- [ ] Sub-navigation tabs support keyboard navigation
- [ ] Focus indicators update correctly during keyboard navigation

### Global Keyboard Shortcuts

- [ ] Escape key closes modal from any focused element
- [ ] Ctrl/Cmd+S saves changes when save button is enabled
- [ ] Keyboard shortcuts respect platform conventions (Ctrl vs Cmd)
- [ ] Shortcuts work regardless of current focus location
- [ ] Shortcuts disabled when appropriate (e.g., in input fields)

### Edge Case Handling

- [ ] Modal content changes don't break focus management
- [ ] Dynamic navigation items (if any) work with keyboard navigation
- [ ] Rapid modal open/close cycles handled gracefully
- [ ] Multiple modal instances don't interfere (if applicable)
- [ ] Focus management works with loading states

## Testing Requirements

### Integration Test File: `apps/desktop/src/components/settings/__tests__/SettingsModal.keyboard.test.ts`

**Required Test Cases:**

- [ ] Modal opens and focus moves to initial element
- [ ] Tab navigation stays within modal boundaries
- [ ] Arrow key navigation works in navigation panel
- [ ] Enter key activates navigation items
- [ ] Escape key closes modal from various focus positions
- [ ] Ctrl/Cmd+S shortcuts work when enabled
- [ ] Focus restoration works on modal close
- [ ] Keyboard navigation syncs with mouse interactions
- [ ] Responsive navigation keyboard behavior
- [ ] Sub-navigation keyboard support

### End-to-End Test File: `apps/desktop/src/components/settings/__tests__/SettingsModal.e2e.test.ts`

**Required Test Cases:**

- [ ] Complete keyboard-only modal navigation workflow
- [ ] Tab through all sections using keyboard only
- [ ] Navigate to sub-tabs using keyboard
- [ ] Access all modal functionality without mouse
- [ ] Modal closing and opening via keyboard
- [ ] Settings changes via keyboard input

## Implementation Guidance

### Integration Strategy

1. **Modal Level**: Integrate focus trap at the modal container level
2. **Navigation Level**: Add keyboard navigation to navigation container
3. **Item Level**: Enhance navigation items with focus management
4. **Global Level**: Add modal-wide keyboard shortcuts
5. **Testing**: Comprehensive testing of integrated behavior

### State Management Coordination

- Ensure keyboard navigation state syncs with Zustand store
- Handle state updates from both keyboard and mouse interactions
- Maintain consistent state during modal lifecycle events
- Coordinate focus state with navigation active state

### Performance Considerations

- Debounce rapid keyboard navigation to prevent state thrashing
- Optimize event listener management for global shortcuts
- Minimize re-renders during keyboard navigation
- Cache navigation elements for efficient focus management

### Browser Compatibility

- Test keyboard integration across Chrome, Firefox, Safari, Edge
- Ensure consistent keyboard shortcut behavior across platforms
- Handle browser-specific focus management differences
- Verify keyboard navigation works with browser zoom levels

## Security Considerations

### Event Security

- Validate keyboard events before processing
- Prevent keyboard event injection attacks
- Ensure shortcuts don't bypass security restrictions
- Sanitize any user-provided keyboard configurations

### Focus Security

- Ensure focus management doesn't expose sensitive information
- Prevent focus hijacking from external sources
- Validate focus targets before moving focus
- Protect against malicious focus manipulation

## Dependencies

- T-create-focus-trap-hook-with-unit (focus trap implementation)
- T-implement-navigation-panel (keyboard navigation implementation)
- Existing SettingsModal and SettingsNavigation components
- Zustand store hooks for navigation state
- Jest and React Testing Library for testing

## File Organization

```
apps/desktop/src/hooks/
├── useGlobalKeyboardShortcuts.ts
└── __tests__/
    └── useGlobalKeyboardShortcuts.test.ts

apps/desktop/src/components/settings/
├── SettingsModal.tsx (enhanced)
├── SettingsNavigation.tsx (enhanced)
└── __tests__/
    ├── SettingsModal.keyboard.test.ts
    └── SettingsModal.e2e.test.ts
```

## Success Metrics

- All integration tests pass with >95% coverage
- Complete modal functionality accessible via keyboard only
- Focus management works seamlessly across all modal states
- Keyboard shortcuts function correctly on all supported platforms
- No performance regressions from keyboard navigation integration
- End-to-end keyboard workflows complete successfully

### Log
