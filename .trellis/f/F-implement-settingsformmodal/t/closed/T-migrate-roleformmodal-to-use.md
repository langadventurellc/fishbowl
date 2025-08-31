---
id: T-migrate-roleformmodal-to-use
title: Migrate RoleFormModal to use SettingsFormModal
status: done
priority: medium
parent: F-implement-settingsformmodal
prerequisites:
  - T-implement-keyboard-event
  - T-implement-focus-management
  - T-implement-unsaved-changes
  - T-create-barrel-export-and
affectedFiles:
  apps/desktop/src/components/settings/roles/RoleFormModal.tsx:
    Migrated component to use SettingsFormModal wrapper; removed custom Dialog
    components, keyboard event handling, focus trap management, and confirmation
    dialog logic; replaced with proper prop mapping for title/description,
    confirmOnClose configuration with hasUnsavedChanges integration,
    onRequestSave for Ctrl+S handling, and screen reader announcements;
    maintained all form functionality while eliminating duplicate modal
    infrastructure code
log:
  - Successfully migrated RoleFormModal from custom modal infrastructure to use
    SettingsFormModal wrapper component. This eliminates ~70 lines of duplicate
    modal code while maintaining all existing functionality including form
    validation, unsaved changes confirmation, keyboard shortcuts (Escape,
    Ctrl/Cmd+S), focus management, and accessibility features. All quality
    checks pass and existing tests continue to pass (13 test suites, 227 tests).
    The migration validates the SettingsFormModal API and demonstrates the clean
    form separation pattern working effectively.
schema: v1.0
childrenIds: []
created: 2025-08-31T04:53:20.741Z
updated: 2025-08-31T04:53:20.741Z
---

# Migrate RoleFormModal to SettingsFormModal

## Context

Migrate the existing RoleFormModal component to use the new SettingsFormModal wrapper, eliminating duplicate modal infrastructure code while maintaining all existing functionality. This migration exercises the clean form separation pattern and validates the SettingsFormModal API.

## Implementation Requirements

### 1. Remove Duplicate Modal Infrastructure

- **Current**: RoleFormModal contains its own Dialog, DialogHeader, etc.
- **Target**: Use SettingsFormModal wrapper for modal infrastructure
- **Preserve**: All form-specific logic and validation
- **Remove**: Modal rendering, keyboard handling, focus management

### 2. Props Integration

- **Import**: SettingsFormModal from `../common`
- **Props Mapping**: Map existing RoleFormModalProps to SettingsFormModal props
- **Form Integration**: Keep existing form logic and refs intact
- **Callbacks**: Wire up onRequestSave, confirmOnClose, etc.

### 3. Form State Management

- **Reset Behavior**: Uses `formRef.resetToInitialData()` pattern
- **Unsaved Changes**: Configure confirmOnClose based on form dirty state
- **Save Integration**: Wire handleSave through onRequestSave prop
- **Validation**: Maintain existing form validation logic

### 4. Accessibility Preservation

- **Screen Reader**: Maintain existing accessibility features
- **Focus Management**: Use SettingsFormModal focus capabilities
- **Keyboard Shortcuts**: Remove duplicate keyboard handling

## Technical Approach

### 1. Component Structure Refactor

```typescript
// Before: Full modal implementation
export const RoleFormModal: React.FC<RoleFormModalProps> = ({ ... }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          {/* ... rest of modal infrastructure */}
        </DialogHeader>
        {/* Form content */}
      </DialogContent>
    </Dialog>
  );
};

// After: Use SettingsFormModal wrapper
import { SettingsFormModal } from '../common';

export const RoleFormModal: React.FC<RoleFormModalProps> = ({ ... }) => {
  return (
    <SettingsFormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={getModalTitle()}
      description={getModalDescription()}
      onRequestSave={() => form.handleSubmit(handleSave)()}
      confirmOnClose={{
        enabled: form.formState.isDirty,
        message: {
          title: "Unsaved Changes",
          body: "You have unsaved changes. Discard them?",
        },
        onDiscard: () => formRef.current?.resetToInitialData(),
      }}
    >
      {/* Form content only */}
    </SettingsFormModal>
  );
};
```

### 2. Props Mapping Strategy

- Map `isOpen` → `isOpen`
- Map `onOpenChange` → `onOpenChange`
- Map existing title logic → `title`
- Map existing description logic → `description`
- Wire `handleSave` → `onRequestSave`
- Configure `confirmOnClose` based on form state

### 3. Code Removal

- Remove Dialog, DialogContent, DialogHeader imports
- Remove keyboard event handling code
- Remove manual focus management
- Remove duplicate accessibility code
- Keep only form-specific logic

## Acceptance Criteria

### Functionality Preservation

- ✅ **Modal Behavior**: Opens, closes, and renders identically to before
- ✅ **Form Logic**: All form validation and submission works unchanged
- ✅ **Save Shortcut**: Ctrl/Cmd+S triggers form submission
- ✅ **Escape Key**: Closes modal without affecting parent settings
- ✅ **Unsaved Changes**: Confirmation dialog appears when form is dirty

### Code Quality

- ✅ **Code Reduction**: Eliminates ~50-100 lines of duplicate modal code
- ✅ **Import Cleanup**: Only imports necessary dependencies
- ✅ **Type Safety**: Full TypeScript compatibility maintained
- ✅ **Pattern Consistency**: Follows SettingsFormModal usage pattern

### Integration

- ✅ **Parent Integration**: Works correctly with RolesSection component
- ✅ **Focus Management**: Focus trap and restoration work correctly
- ✅ **Accessibility**: Screen reader support maintained or improved
- ✅ **Testing**: All existing tests pass or are updated appropriately

### User Experience

- ✅ **No Regressions**: All user interactions work exactly as before
- ✅ **Performance**: No performance degradation
- ✅ **Keyboard Navigation**: Full keyboard accessibility maintained

### Unit Testing

Update existing tests and add new ones:

- ✅ **Component Rendering**: RoleFormModal renders correctly with SettingsFormModal
- ✅ **Props Integration**: All props passed correctly to wrapper
- ✅ **Save Integration**: onRequestSave triggers form submission
- ✅ **Confirmation Dialog**: Unsaved changes flow works correctly
- ✅ **Edge Cases**: Handle missing formRef and other edge cases

## Dependencies

- **Prerequisites**:
  - T-implement-keyboard-event (keyboard handling in wrapper)
  - T-implement-focus-management (focus management in wrapper)
  - T-implement-unsaved-changes (confirmation dialog functionality)
  - T-create-barrel-export-and (import path available)

## Research Required

- Review current RoleFormModal implementation details
- Identify exact form state management patterns used
- Understand existing form validation and reset logic
- Check current test coverage and update strategy

## Out of Scope

- Changes to role form validation logic
- UI/UX changes to form layout
- Performance optimizations beyond code reduction
- Changes to RoleFormModalProps interface (maintain compatibility)

## Files to Modify

- `apps/desktop/src/components/settings/roles/RoleFormModal.tsx`
- Update existing unit tests for RoleFormModal
- Potentially update integration tests if needed
