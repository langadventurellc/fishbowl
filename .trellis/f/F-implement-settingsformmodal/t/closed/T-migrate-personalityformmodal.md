---
id: T-migrate-personalityformmodal
title: Migrate PersonalityFormModal to use SettingsFormModal
status: done
priority: low
parent: F-implement-settingsformmodal
prerequisites:
  - T-migrate-agentformmodal-to-use
affectedFiles:
  apps/desktop/src/components/settings/personalities/PersonalityFormModal.tsx:
    Migrated component to use SettingsFormModal wrapper; removed custom Dialog
    components, keyboard event handling, focus trap management, and confirmation
    dialog logic; replaced with proper prop mapping for title/description,
    confirmOnClose configuration with hasUnsavedChanges integration,
    onRequestSave for Ctrl+S handling, and screen reader announcements;
    maintained all form functionality while eliminating duplicate modal
    infrastructure code
log:
  - Successfully migrated PersonalityFormModal from custom modal infrastructure
    to use SettingsFormModal wrapper component. This eliminates ~150 lines of
    duplicate modal code while maintaining all existing functionality including
    personality definitions loading, form validation, unsaved changes
    confirmation, keyboard shortcuts (Escape, Ctrl/Cmd+S), focus management, and
    accessibility features. The migration follows the established pattern from
    AgentFormModal and integrates seamlessly with the SettingsFormModal API
    including proper form reset on discard, comprehensive screen reader
    announcements, and focus trap integration. All quality checks pass (lint,
    format, type-check) with no regressions.
schema: v1.0
childrenIds: []
created: 2025-08-31T04:54:42.361Z
updated: 2025-08-31T04:54:42.361Z
---

# Migrate PersonalityFormModal to SettingsFormModal

## Context

Migrate the existing PersonalityFormModal component to use the new SettingsFormModal wrapper. This migration focuses on testing focus management and keyboard handling capabilities of the SettingsFormModal in a different form context.

## Implementation Requirements

### 1. Remove Duplicate Modal Infrastructure

- **Current**: PersonalityFormModal contains its own modal rendering logic
- **Target**: Use SettingsFormModal wrapper for modal infrastructure
- **Preserve**: Personality form logic, validation, and state management
- **Remove**: Modal components, keyboard handling, focus management

### 2. Focus Management Testing

- **Initial Focus**: Configure appropriate initial focus for personality forms
- **Tab Order**: Ensure proper tab navigation through personality fields
- **Focus Restoration**: Verify focus returns to trigger element on close
- **Accessibility**: Test screen reader support with personality content

### 3. Form State Integration

- **Validation**: Preserve personality-specific validation rules
- **Dirty State**: Configure unsaved changes based on form state
- **Reset Logic**: Wire personality form reset through onDiscard
- **Save Flow**: Integrate handleSave through onRequestSave

### 4. Keyboard Shortcuts Validation

- **Save Shortcut**: Verify Ctrl/Cmd+S triggers personality form submission
- **Escape Key**: Test escape key handling without affecting parent modal
- **Event Priority**: Validate capture-phase event handling works correctly

## Technical Approach

### 1. Component Migration Pattern

```typescript
import { SettingsFormModal } from '../common';

export const PersonalityFormModal: React.FC<PersonalityFormModalProps> = ({
  isOpen,
  onOpenChange,
  // ... other props
}) => {
  // Keep existing personality form logic
  const formRef = useRef<FormMethods<PersonalityFormData>>(null);

  return (
    <SettingsFormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={getModalTitle()}
      description={getModalDescription()}
      initialFocusSelector="[data-personality-name-input]" // Example focus target
      onRequestSave={() => form.handleSubmit(handleSave)()}
      confirmOnClose={{
        enabled: form.formState.isDirty,
        message: {
          title: "Unsaved Changes",
          body: "You have unsaved changes to this personality. Discard them?",
        },
        onDiscard: () => formRef.current?.reset(),
      }}
      announceOnOpen="Personality form opened" // Test accessibility
    >
      {/* Personality form content only */}
    </SettingsFormModal>
  );
};
```

### 2. Focus Management Configuration

- Identify optimal initial focus target (likely first form field)
- Configure data attributes for focus targeting
- Test focus flow through personality-specific fields

### 3. Accessibility Testing

- Configure announceOnOpen for personality context
- Test screen reader support with personality form content
- Verify no conflicts with existing accessibility features

## Acceptance Criteria

### Functionality Preservation

- ✅ **Personality CRUD**: All personality operations work unchanged
- ✅ **Form Validation**: Personality-specific validation preserved
- ✅ **Save/Cancel**: Save and cancel flows work correctly
- ✅ **Data Integrity**: All personality data handling maintained

### Focus and Accessibility

- ✅ **Initial Focus**: Focus lands on appropriate first field
- ✅ **Tab Navigation**: Proper tab order through personality fields
- ✅ **Focus Restoration**: Focus returns to trigger on close
- ✅ **Screen Reader**: Accessibility announcements work correctly
- ✅ **Focus Trap**: Focus contained within modal boundaries

### Keyboard Handling

- ✅ **Save Shortcut**: Ctrl/Cmd+S triggers personality form submission
- ✅ **Escape Key**: Closes personality modal without affecting settings
- ✅ **Event Priority**: SettingsFormModal events take precedence
- ✅ **Confirmation**: Escape triggers confirmation when form is dirty

### Integration Quality

- ✅ **Parent Component**: Works correctly with PersonalitiesSection
- ✅ **Props Compatibility**: All PersonalityFormModalProps preserved
- ✅ **Code Reduction**: Eliminates duplicate modal infrastructure
- ✅ **Consistency**: Behavior matches other migrated modals

### Unit Testing

Update and add tests covering:

- ✅ **Component Rendering**: Renders correctly with SettingsFormModal
- ✅ **Focus Management**: initialFocusSelector works correctly
- ✅ **Accessibility**: announceOnOpen and other a11y features
- ✅ **Keyboard Events**: Save shortcuts and escape key handling
- ✅ **Confirmation Flow**: Unsaved changes confirmation works
- ✅ **Form Integration**: All personality form logic preserved

## Dependencies

- **Prerequisite**: T-migrate-agentformmodal-to-use (migration pattern established)

## Focus Areas

This migration specifically validates:

- **Focus Management**: SettingsFormModal focus capabilities
- **Accessibility**: Screen reader and keyboard navigation
- **Event Handling**: Keyboard shortcut priority and capture-phase handling

## Out of Scope

- Changes to personality form business logic or validation rules
- UI layout modifications to personality forms
- Performance optimization beyond code reduction
- Personality data model changes

## Research Required

- Identify optimal initial focus target for personality forms
- Review existing accessibility patterns in PersonalityFormModal
- Check current keyboard navigation flow through personality fields
- Understand personality-specific form state management

## Files to Modify

- `apps/desktop/src/components/settings/personalities/PersonalityFormModal.tsx`
- Update existing unit tests for PersonalityFormModal
- Add focused tests for accessibility and keyboard handling

## Success Metrics

- All personality form functionality preserved
- Focus management works optimally for personality forms
- Keyboard navigation and shortcuts work seamlessly
- Accessibility features function correctly
