---
id: T-migrate-agentformmodal-to-use
title: Migrate AgentFormModal to use SettingsFormModal
status: done
priority: medium
parent: F-implement-settingsformmodal
prerequisites:
  - T-migrate-roleformmodal-to-use
affectedFiles:
  apps/desktop/src/components/settings/agents/AgentFormModal.tsx:
    Migrated component to use SettingsFormModal wrapper; removed custom Dialog
    components, keyboard event handling, focus trap management, and confirmation
    dialog logic; replaced with proper prop mapping for title/description,
    confirmOnClose configuration with hasUnsavedChanges integration,
    onRequestSave for Ctrl+S handling, and screen reader announcements;
    maintained all form functionality while eliminating duplicate modal
    infrastructure code
log:
  - Successfully migrated AgentFormModal from custom modal infrastructure to use
    SettingsFormModal wrapper component. This eliminates ~120 lines of duplicate
    modal code while maintaining all existing functionality including form
    validation, unsaved changes confirmation, keyboard shortcuts (Escape,
    Ctrl/Cmd+S), focus management, and accessibility features. The migration
    follows the established pattern from RoleFormModal and integrates seamlessly
    with the SettingsFormModal API including loading state prevention of modal
    closing, proper form reset on discard, and comprehensive screen reader
    announcements. All quality checks pass (lint, format, type-check) with no
    regressions.
schema: v1.0
childrenIds: []
created: 2025-08-31T04:54:03.666Z
updated: 2025-08-31T04:54:03.666Z
---

# Migrate AgentFormModal to SettingsFormModal

## Context

Migrate the existing AgentFormModal component to use the new SettingsFormModal wrapper. This migration exercises the unsaved changes confirmation flow and validates that SettingsFormModal handles complex form states correctly.

## Implementation Requirements

### 1. Remove Duplicate Modal Infrastructure

- **Current**: AgentFormModal contains its own Dialog components and modal logic
- **Target**: Use SettingsFormModal wrapper for all modal infrastructure
- **Preserve**: Agent form logic, validation, and loading states
- **Remove**: Modal rendering, keyboard handling, focus management code

### 2. Unsaved Changes Integration

- **Confirmation Flow**: AgentFormModal has complex unsaved changes handling
- **Integration**: Configure SettingsFormModal confirmOnClose appropriately
- **Form State**: Use form dirty state to control confirmation dialog
- **Reset Logic**: Wire form reset through onDiscard callback

### 3. Loading State Management

- **Current**: AgentFormModal manages loading states for form submission
- **Integration**: Ensure loading states work correctly within SettingsFormModal
- **User Experience**: Maintain loading indicators and disabled states
- **Save Integration**: Wire handleSave through onRequestSave with loading handling

### 4. Form Validation Integration

- **Existing Logic**: Preserve all agent-specific validation rules
- **Error Handling**: Maintain existing error display patterns
- **Submission Flow**: Keep all form submission logic intact
- **Success Handling**: Preserve success states and callbacks

## Technical Approach

### 1. Component Structure Migration

```typescript
import { SettingsFormModal } from '../common';

export const AgentFormModal: React.FC<AgentFormModalProps> = ({
  isOpen,
  onOpenChange,
  // ... other props
}) => {
  // Keep all existing form logic
  const formRef = useRef<FormMethods<AgentFormData>>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = useCallback(async (data: AgentFormData) => {
    setIsLoading(true);
    try {
      // Existing save logic
    } finally {
      setIsLoading(false);
    }
  }, [/* dependencies */]);

  return (
    <SettingsFormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={getModalTitle()}
      description={getModalDescription()}
      onRequestSave={() => form.handleSubmit(handleSave)()}
      confirmOnClose={{
        enabled: form.formState.isDirty && !isLoading,
        message: {
          title: "Unsaved Changes",
          body: "You have unsaved changes to this agent. Discard them?",
          confirmText: "Discard Changes",
          cancelText: "Continue Editing"
        },
        onDiscard: () => formRef.current?.reset(),
      }}
    >
      {/* Agent form content only - remove modal wrapper */}
    </SettingsFormModal>
  );
};
```

### 2. Loading State Coordination

- Disable confirmation when loading (prevents closing during save)
- Ensure save shortcut is handled correctly during loading states
- Maintain existing loading UI within form content

### 3. Form State Integration

- Use form.formState.isDirty for confirmation logic
- Wire existing form reset logic through onDiscard
- Preserve all agent-specific form configuration

## Acceptance Criteria

### Functionality Preservation

- ✅ **Agent CRUD**: All agent creation, editing, and deletion works unchanged
- ✅ **Form Validation**: All validation rules and error handling preserved
- ✅ **Loading States**: Form submission loading states work correctly
- ✅ **Unsaved Changes**: Confirmation dialog appears when form has changes
- ✅ **Save Shortcuts**: Ctrl/Cmd+S triggers agent form submission

### Complex State Handling

- ✅ **Loading Prevention**: Cannot close modal during save operation
- ✅ **Error States**: Form errors display correctly within SettingsFormModal
- ✅ **Success Flow**: Successful saves close modal appropriately
- ✅ **Cancel Behavior**: Cancel during editing preserves data correctly

### Integration Requirements

- ✅ **Parent Component**: Works correctly with AgentsSection
- ✅ **Props Compatibility**: All existing AgentFormModalProps work unchanged
- ✅ **Event Handling**: All parent callbacks and event handlers preserved
- ✅ **Type Safety**: Full TypeScript compatibility maintained

### Code Quality

- ✅ **Code Reduction**: Eliminates ~50-100 lines of duplicate modal code
- ✅ **Maintainability**: Single source of truth for modal behavior
- ✅ **Consistent UX**: Identical behavior to other migrated form modals
- ✅ **Performance**: No performance regressions

### Unit Testing

Update and extend existing tests:

- ✅ **Rendering**: Component renders correctly with SettingsFormModal wrapper
- ✅ **Save Flow**: onRequestSave triggers form submission correctly
- ✅ **Loading States**: Loading prevents closing and shows appropriate UI
- ✅ **Confirmation Logic**: Unsaved changes confirmation works with complex states
- ✅ **Error Handling**: Form errors are handled correctly within wrapper
- ✅ **Edge Cases**: Loading, error, and success state combinations

## Dependencies

- **Prerequisite**: T-migrate-roleformmodal-to-use (establishes migration pattern)

## Research Required

- Review current AgentFormModal complexity and state management
- Identify loading state patterns and how they interact with modal closing
- Understand agent-specific validation and error handling
- Check existing test coverage for complex scenarios

## Out of Scope

- Changes to agent form validation rules or business logic
- UI/UX modifications to agent form layout
- Performance optimizations beyond code reduction
- Agent data model or API changes

## Files to Modify

- `apps/desktop/src/components/settings/agents/AgentFormModal.tsx`
- Update existing unit tests for AgentFormModal
- Update integration tests if they exist

## Success Metrics

- Eliminates ~50-100 lines of duplicate modal infrastructure code
- Maintains 100% compatibility with existing AgentsSection integration
- All existing tests pass or are updated appropriately
- No user-facing behavior changes
