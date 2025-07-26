---
kind: task
id: T-create-custom-react-hooks-for
title: Create custom React hooks for settings store integration
status: open
priority: high
prerequisites:
  - T-create-zustand-settings-store
created: "2025-07-26T15:25:41.585812"
updated: "2025-07-26T15:25:41.585812"
schema_version: "1.1"
parent: F-settings-modal-state-management
---

# Create Custom React Hooks for Settings Store Integration

## Context

This task creates convenient React hooks that provide easy access to the Zustand settings store created in the previous task. These hooks will follow React patterns and provide optimal component subscription and re-rendering behavior.

The hooks will be implemented in `/packages/shared/src/stores/settings/hooks.ts` and exported through the barrel exports for clean component integration.

## Technical Approach

### Hook Implementation Strategy

- Create focused hooks that subscribe only to necessary state slices
- Use Zustand selectors for efficient component re-rendering
- Follow React hooks naming conventions (`useSettingsModal`, `useSettingsNavigation`)
- Provide TypeScript types for excellent developer experience
- Include JSDoc documentation for IntelliSense support

### Hook Design Patterns

- **Slice hooks**: Subscribe to specific state portions to minimize re-renders
- **Action hooks**: Provide convenient access to store actions
- **Computed hooks**: Combine state slices for derived state
- **Selector hooks**: Allow custom state selection for advanced use cases

## Detailed Implementation Requirements

### Core Modal Hooks

#### `useSettingsModal`

```typescript
export const useSettingsModal = () => {
  const { isOpen, openModal, closeModal } = useSettingsStore((state) => ({
    isOpen: state.isOpen,
    openModal: state.openModal,
    closeModal: state.closeModal,
  }));

  return { isOpen, openModal, closeModal };
};
```

#### `useSettingsNavigation`

```typescript
export const useSettingsNavigation = () => {
  const {
    activeSection,
    activeSubTab,
    setActiveSection,
    setActiveSubTab,
    navigateBack,
    navigationHistory,
  } = useSettingsStore((state) => ({
    activeSection: state.activeSection,
    activeSubTab: state.activeSubTab,
    setActiveSection: state.setActiveSection,
    setActiveSubTab: state.setActiveSubTab,
    navigateBack: state.navigateBack,
    navigationHistory: state.navigationHistory,
  }));

  return {
    activeSection,
    activeSubTab,
    setActiveSection,
    setActiveSubTab,
    navigateBack,
    canNavigateBack: navigationHistory.length > 1,
  };
};
```

#### `useSettingsActions`

```typescript
export const useSettingsActions = () => {
  const {
    openModal,
    closeModal,
    setActiveSection,
    setActiveSubTab,
    setUnsavedChanges,
    resetToDefaults,
  } = useSettingsStore((state) => ({
    openModal: state.openModal,
    closeModal: state.closeModal,
    setActiveSection: state.setActiveSection,
    setActiveSubTab: state.setActiveSubTab,
    setUnsavedChanges: state.setUnsavedChanges,
    resetToDefaults: state.resetToDefaults,
  }));

  return {
    openModal,
    closeModal,
    setActiveSection,
    setActiveSubTab,
    setUnsavedChanges,
    resetToDefaults,
  };
};
```

### Advanced Hooks

#### `useActiveSection`

```typescript
export const useActiveSection = () => {
  return useSettingsStore((state) => state.activeSection);
};
```

#### `useActiveSubTab`

```typescript
export const useActiveSubTab = () => {
  return useSettingsStore((state) => state.activeSubTab);
};
```

#### `useUnsavedChanges`

```typescript
export const useUnsavedChanges = () => {
  const { hasUnsavedChanges, setUnsavedChanges } = useSettingsStore(
    (state) => ({
      hasUnsavedChanges: state.hasUnsavedChanges,
      setUnsavedChanges: state.setUnsavedChanges,
    }),
  );

  return { hasUnsavedChanges, setUnsavedChanges };
};
```

#### `useSettingsSelector`

```typescript
// Generic selector hook for custom state selection
export const useSettingsSelector = <T>(
  selector: (state: SettingsModalStore) => T,
) => {
  return useSettingsStore(selector);
};
```

### Computed State Hooks

#### `useNavigationState`

```typescript
export const useNavigationState = () => {
  return useSettingsStore((state) => ({
    activeSection: state.activeSection,
    activeSubTab: state.activeSubTab,
    canNavigateBack: state.navigationHistory.length > 1,
    isOnDefaultSection: state.activeSection === "general",
  }));
};
```

#### `useModalState`

```typescript
export const useModalState = () => {
  return useSettingsStore((state) => ({
    isOpen: state.isOpen,
    hasUnsavedChanges: state.hasUnsavedChanges,
    lastOpenedSection: state.lastOpenedSection,
    shouldWarnOnClose: state.hasUnsavedChanges && state.isOpen,
  }));
};
```

## Acceptance Criteria

### Hook Implementation

- [ ] `useSettingsModal` hook provides modal state and lifecycle actions
- [ ] `useSettingsNavigation` hook provides navigation state and actions
- [ ] `useSettingsActions` hook provides all available store actions
- [ ] `useActiveSection` hook provides optimized access to current section
- [ ] `useActiveSubTab` hook provides optimized access to current sub-tab
- [ ] `useUnsavedChanges` hook manages form state tracking
- [ ] `useSettingsSelector` hook enables custom state selection

### Advanced Hooks

- [ ] `useNavigationState` hook provides computed navigation state
- [ ] `useModalState` hook provides computed modal state
- [ ] All hooks use efficient Zustand selectors to minimize re-renders
- [ ] Hooks follow React naming conventions and patterns

### TypeScript Integration

- [ ] All hooks have proper TypeScript return types
- [ ] Generic selector hook properly typed with constraints
- [ ] Hooks provide excellent IntelliSense experience
- [ ] Return types clearly documented with JSDoc comments
- [ ] Type exports available for hook return types

### Performance Optimization

- [ ] Hooks subscribe only to necessary state slices
- [ ] Selector functions properly memoized where needed
- [ ] No unnecessary re-renders triggered by hook usage
- [ ] Efficient state subscription patterns implemented

### Documentation

- [ ] JSDoc comments for all hooks explaining purpose and usage
- [ ] TypeScript interfaces for hook return types
- [ ] Usage examples in comments for complex hooks
- [ ] Clear parameter documentation for selector hooks

### File Organization

- [ ] Hooks implemented in `/packages/shared/src/stores/settings/hooks.ts`
- [ ] All hooks exported through barrel exports in `index.ts`
- [ ] Clean imports from store and types modules
- [ ] Follows project file naming and organization patterns

### Unit Testing

- [ ] All hooks render without errors in test environment
- [ ] Hook state subscriptions work correctly
- [ ] Selector optimization verified through testing
- [ ] Hook return values match expected TypeScript types
- [ ] Re-rendering behavior tested for efficiency

## Usage Examples

### Component Integration

```typescript
// Modal control
const { isOpen, openModal, closeModal } = useSettingsModal();

// Navigation control
const { activeSection, setActiveSection } = useSettingsNavigation();

// Form state management
const { hasUnsavedChanges, setUnsavedChanges } = useUnsavedChanges();

// Custom state selection
const isGeneralSectionActive = useSettingsSelector(
  (state) => state.activeSection === "general",
);
```

### Advanced Usage

```typescript
// Computed state for complex UI logic
const navigationState = useNavigationState();
const modalState = useModalState();

if (modalState.shouldWarnOnClose) {
  // Show unsaved changes warning
}

if (navigationState.canNavigateBack) {
  // Show back button
}
```

## Dependencies and Integration

### Prerequisites

- Zustand settings store (T-create-zustand-settings-store)
- TypeScript interfaces and types from store module
- React peer dependency in shared package

### Provides Integration For

- Settings modal component migration
- Navigation component updates
- Future form components
- Cross-platform component development

## Security Considerations

- Hooks validate selector functions to prevent malicious access
- State subscriptions properly cleaned up on component unmount
- No exposure of internal store implementation details
- Secure access patterns for sensitive state

## Performance Requirements

- Hook subscriptions complete within 1ms
- Minimal re-renders when using focused hooks
- Efficient memory usage for multiple hook instances
- No memory leaks from improper subscriptions

## Files to Create

1. `/packages/shared/src/stores/settings/hooks.ts` - Custom React hooks implementation
2. Update `/packages/shared/src/stores/settings/index.ts` - Export hooks
3. Unit tests for hooks functionality and performance
4. Type definition exports for hook return types

## Testing Strategy

- Test hook rendering and state subscription
- Test hook return values match expected types
- Test performance characteristics and re-rendering
- Test hook integration with React components
- Test edge cases and error handling

### Log
