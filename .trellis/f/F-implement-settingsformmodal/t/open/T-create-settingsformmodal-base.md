---
id: T-create-settingsformmodal-base
title: Create SettingsFormModal base component with props interface
status: open
priority: high
parent: F-implement-settingsformmodal
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-31T04:50:52.896Z
updated: 2025-08-31T04:50:52.896Z
---

# Create SettingsFormModal Base Component

## Context

This task creates the foundational `SettingsFormModal` wrapper component that will consolidate common modal behavior across all settings form modals. The component serves as infrastructure for modal rendering, keyboard handling, and accessibility, while delegating form-specific logic to child components.

## Implementation Requirements

### 1. Component Structure

- **Location**: `apps/desktop/src/components/settings/common/SettingsFormModal.tsx`
- **Export**: Named export `SettingsFormModal` as React functional component
- **Dependencies**: shadcn/ui Dialog components, React hooks

### 2. Props Interface

Create the `SettingsFormModalProps` interface with the following structure:

```typescript
interface SettingsFormModalProps {
  // Required
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;

  // Optional
  description?: string;
  className?: string;
  initialFocusSelector?: string;
  announceOnOpen?: string;
  dataTestId?: string;

  // Save integration
  onRequestSave?: () => void;

  // Unsaved changes
  confirmOnClose?: {
    enabled: boolean;
    message: {
      title: string;
      body: string;
      confirmText?: string;
      cancelText?: string;
    };
    onDiscard?: () => void;
  };
}
```

### 3. Basic Modal Structure

- Render using shadcn/ui Dialog, DialogContent, DialogHeader, DialogTitle components
- Set `data-form-modal="true"` attribute on the dialog content
- Render configurable title and optional description in header
- Render children prop in content area
- Apply optional className for styling
- Use dataTestId for testing identification

### 4. Accessibility Setup

- Proper ARIA attributes on dialog elements
- Configure dialog title and description appropriately
- Ensure semantic HTML structure

## Technical Approach

1. **Start with minimal implementation**: Basic dialog structure with props handling
2. **Use composition pattern**: Children prop for form-specific content
3. **Follow existing patterns**: Mirror other modal components in the codebase
4. **TypeScript interfaces**: Full type safety with proper prop validation

## Acceptance Criteria

### Functional Requirements

- ✅ Component renders using shadcn/ui Dialog components
- ✅ Props interface matches specification exactly
- ✅ Title and optional description render in header
- ✅ Children content renders in dialog body
- ✅ `data-form-modal="true"` attribute is set
- ✅ Optional className is applied correctly
- ✅ dataTestId works for testing identification

### Code Quality

- ✅ Full TypeScript coverage with proper interfaces
- ✅ Clean, readable component structure
- ✅ Follows existing codebase patterns and conventions
- ✅ Proper imports and exports

### Unit Testing

Write comprehensive unit tests covering:

- ✅ Props rendering (title, description, children, className)
- ✅ Optional props handling (description, dataTestId)
- ✅ Data attribute presence (`data-form-modal="true"`)
- ✅ Basic accessibility attributes (role, aria-labelledby)
- ✅ onOpenChange callback functionality

## Dependencies

- None (first task in sequence)

## Out of Scope

- Keyboard event handling (handled in subsequent tasks)
- Focus management (handled in subsequent tasks)
- Confirmation dialogs (handled in subsequent tasks)
- Integration with existing form modals (migration tasks)

## Files to Create

- `apps/desktop/src/components/settings/common/SettingsFormModal.tsx`
- Unit test file with comprehensive component testing
