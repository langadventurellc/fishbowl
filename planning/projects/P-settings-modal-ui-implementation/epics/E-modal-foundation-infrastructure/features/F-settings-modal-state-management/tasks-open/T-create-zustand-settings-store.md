---
kind: task
id: T-create-zustand-settings-store
title: Create Zustand settings store with TypeScript interfaces and actions
status: open
priority: high
prerequisites: []
created: "2025-07-26T15:25:03.448479"
updated: "2025-07-26T15:25:03.448479"
schema_version: "1.1"
parent: F-settings-modal-state-management
---

# Create Zustand Settings Store with TypeScript Interfaces and Actions

## Context

This task creates the foundational Zustand store for settings modal state management in the shared package. This will replace the current `useState` management in SettingsModal.tsx and provide cross-platform state management for both desktop and future mobile applications.

The store will be implemented in `/packages/shared/src/stores/settings/` following the established project patterns and TypeScript best practices.

## Technical Approach

### File Structure

Create the following directory structure in the shared package:

```
/packages/shared/src/stores/
├── settings/
│   ├── settingsStore.ts      # Core Zustand store implementation
│   ├── types.ts             # TypeScript interfaces and types
│   └── index.ts             # Clean barrel exports
└── index.ts                 # Main stores barrel export
```

### Store Implementation

- Use Zustand `create()` function with TypeScript generics
- Follow functional programming principles for immutable state updates
- Implement actions that update state immutably using spread operators
- Include debug support for development environment
- Follow existing project patterns for TypeScript interfaces

### State Structure

Implement the following state interface:

```typescript
interface SettingsModalState {
  // Modal control
  isOpen: boolean;

  // Navigation state
  activeSection: string; // 'general' | 'api-keys' | 'appearance' | 'agents' | etc.
  activeSubTab: string | null; // For sections with sub-tabs
  navigationHistory: string[]; // Track section navigation

  // Session management
  hasUnsavedChanges: boolean; // Future use for form management
  lastOpenedSection: string; // Restore user's last section
}

interface SettingsModalActions {
  // Modal lifecycle
  openModal: (section?: string) => void;
  closeModal: () => void;

  // Navigation actions
  setActiveSection: (section: string) => void;
  setActiveSubTab: (tab: string | null) => void;
  navigateBack: () => void;

  // Session management
  setUnsavedChanges: (hasChanges: boolean) => void;
  resetToDefaults: () => void;
}
```

## Detailed Implementation Requirements

### Store Configuration

- Default `isOpen` to `false`
- Default `activeSection` to `"general"`
- Default `activeSubTab` to `null`
- Empty `navigationHistory` array initially
- Default `hasUnsavedChanges` to `false`
- Default `lastOpenedSection` to `"general"`

### Action Implementation

- `openModal(section)`: Set `isOpen` to true, update `activeSection` if provided, add to navigation history
- `closeModal()`: Set `isOpen` to false, reset `activeSubTab` to null, clear navigation history
- `setActiveSection(section)`: Update `activeSection`, reset `activeSubTab` to null, add to navigation history
- `setActiveSubTab(tab)`: Update `activeSubTab` without affecting section navigation
- `navigateBack()`: Use navigation history to go back to previous section
- `setUnsavedChanges(hasChanges)`: Update `hasUnsavedChanges` boolean
- `resetToDefaults()`: Reset all state to initial values

### TypeScript Implementation

- Create comprehensive TypeScript interfaces for all state and actions
- Use union types for `activeSection` values based on navigation sections
- Implement proper typing for all action parameters
- Export types for component consumption
- Use `create<StoreType>()` pattern for type-safe store creation

### Error Handling

- Validate section IDs to prevent invalid navigation states
- Handle edge cases like empty navigation history
- Provide fallback values for invalid section/tab combinations
- Implement input sanitization for navigation parameters

## Acceptance Criteria

### Store Creation

- [ ] Zustand store created with proper TypeScript typing in `/packages/shared/src/stores/settings/settingsStore.ts`
- [ ] Store follows functional programming principles with immutable updates
- [ ] All actions update state correctly without mutations
- [ ] Store includes development debugging support
- [ ] Store exports follow project naming conventions

### State Management

- [ ] `isOpen` boolean properly manages modal visibility state
- [ ] `activeSection` tracks current main navigation section
- [ ] `activeSubTab` tracks current sub-tab within sections
- [ ] `navigationHistory` array maintains section navigation history
- [ ] `hasUnsavedChanges` boolean tracks form state changes
- [ ] `lastOpenedSection` remembers user's preferred section

### Action Implementation

- [ ] `openModal()` action opens modal and sets section if provided
- [ ] `closeModal()` action closes modal and resets transient state
- [ ] `setActiveSection()` action updates active section and manages history
- [ ] `setActiveSubTab()` action updates sub-tab without affecting navigation
- [ ] `navigateBack()` action uses history for back navigation
- [ ] `setUnsavedChanges()` action updates unsaved changes flag
- [ ] `resetToDefaults()` action resets all state to initial values

### TypeScript Types

- [ ] Comprehensive interfaces defined in `/packages/shared/src/stores/settings/types.ts`
- [ ] Union types for section and tab IDs provide autocompletion
- [ ] All action parameters have proper TypeScript types
- [ ] Store type combines state and actions interfaces
- [ ] Types exported for external component usage

### File Organization

- [ ] Clean barrel exports in `/packages/shared/src/stores/settings/index.ts`
- [ ] Main stores index in `/packages/shared/src/stores/index.ts` exports settings
- [ ] Files follow project naming conventions and structure
- [ ] Proper imports and exports for cross-package usage

### Unit Testing

- [ ] Store initializes with correct default values
- [ ] Actions update state correctly and immutably
- [ ] Navigation history management works correctly
- [ ] Edge cases handled (invalid sections, empty history)
- [ ] TypeScript types prevent invalid state mutations

## Dependencies and Integration

### Prerequisites

- Zustand dependency already available in shared package
- TypeScript configuration properly set up
- No other tasks required to complete

### Provides Foundation For

- Settings modal component migration
- Custom React hooks implementation
- Future form state management
- Cross-platform settings persistence

## Security Considerations

- Validate all section and tab IDs to prevent injection
- Sanitize navigation history to prevent memory issues
- Limit navigation history size to reasonable bounds
- Ensure state updates don't expose sensitive data

## Performance Requirements

- State updates complete within 16ms for smooth UI
- Store operations have O(1) complexity for basic actions
- Navigation history limited to 50 entries maximum
- Efficient memory usage for extended sessions

## Files to Create

1. `/packages/shared/src/stores/settings/types.ts` - TypeScript interfaces
2. `/packages/shared/src/stores/settings/settingsStore.ts` - Main store implementation
3. `/packages/shared/src/stores/settings/index.ts` - Barrel exports
4. `/packages/shared/src/stores/index.ts` - Main stores export
5. Unit tests for store functionality following Jest patterns

## Testing Strategy

- Test store initialization with correct defaults
- Test all actions update state immutably
- Test navigation history management
- Test edge cases and error handling
- Test TypeScript compilation and type safety

### Log
