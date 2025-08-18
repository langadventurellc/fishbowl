---
id: T-refactor-createpersonalityform
title: Refactor CreatePersonalityForm to unified PersonalityForm with modes
status: done
priority: high
parent: F-refactor-unified-personalityfo
prerequisites:
  - T-remove-localstorage-logic
affectedFiles:
  apps/desktop/src/components/settings/personalities/PersonalityForm.tsx:
    Renamed from CreatePersonalityForm.tsx and refactored to unified component
    with create/edit modes, advanced change detection, field-level dirty
    tracking, and inline form actions
  apps/desktop/src/components/settings/personalities/index.ts: Added PersonalityForm export to barrel file
log:
  - Successfully refactored CreatePersonalityForm to unified PersonalityForm
    with modes following the exact CreateRoleForm pattern. Implemented advanced
    change detection with meaningful comparison, field-level dirty state
    tracking, and proper form state management. Updated form submission handling
    with async error management, enhanced unsaved changes integration, and
    replaced FormActions with inline buttons matching the reference
    implementation. All acceptance criteria completed including proper
    mode-aware functionality, sophisticated change detection, React Hook Form
    integration with zodResolver, and comprehensive form reset/cancel logic.
schema: v1.0
childrenIds: []
created: 2025-08-17T15:58:18.731Z
updated: 2025-08-17T15:58:18.731Z
---

# Refactor CreatePersonalityForm to Unified PersonalityForm with Modes

## Context

Transform the CreatePersonalityForm into a unified PersonalityForm component that handles both create and edit modes, following the exact pattern established by CreateRoleForm. This includes advanced change detection, unsaved changes tracking, and proper form state management.

## Acceptance Criteria

### Component Refactoring

- [ ] Rename component from `CreatePersonalityForm` to `PersonalityForm`
- [ ] Update file name to `PersonalityForm.tsx`
- [ ] Update all imports and exports to use new name
- [ ] Implement mode-aware functionality (`"create" | "edit"`)

### Props and Interface Implementation

- [ ] Accept updated `CreatePersonalityFormProps` interface
- [ ] Support `mode` prop to distinguish create vs edit behavior
- [ ] Accept `initialData?: PersonalityViewModel` for edit mode pre-population
- [ ] Support `existingPersonalities` array for validation
- [ ] Handle `isLoading` prop for submission states

### React Hook Form Integration

- [ ] Use `useForm` with zodResolver for personalitySchema validation
- [ ] Set proper defaultValues based on mode and initialData
- [ ] Configure `mode: "onChange"` and `criteriaMode: "all"`
- [ ] Implement form.watch() for change detection

### Advanced Change Detection (Match CreateRoleForm Pattern)

- [ ] Implement sophisticated change detection with edge case handling
- [ ] Check for meaningful changes (not just whitespace differences)
- [ ] Compare current values against initialData when in edit mode
- [ ] Track field-level dirty states for visual indicators
- [ ] Use useMemo for performance-optimized dirty checking

### Unsaved Changes Integration

- [ ] Import and use `useUnsavedChanges` hook
- [ ] Call `setUnsavedChanges(isActuallyDirty)` in useEffect
- [ ] Reset unsaved changes state on successful save
- [ ] Reset unsaved changes state on cancel

### Form Submission Handling

- [ ] Implement async form submission with try/catch error handling
- [ ] Add local `isSubmitting` state for submission UI feedback
- [ ] Reset form with new values after successful save
- [ ] Clear form state properly on save completion
- [ ] Use logger for error reporting (match roles pattern)

### Form Reset and Cancel Logic

- [ ] Reset to original values on cancel (edit mode)
- [ ] Clear form completely on cancel (create mode)
- [ ] Reset form state flags (dirty, errors) properly
- [ ] Call setUnsavedChanges(false) on cancel

### Field-Level Dirty Indicators

- [ ] Implement `isNameDirty` useMemo computation
- [ ] Implement field dirty states for all personality-specific fields
- [ ] Compare trimmed values for accurate dirty detection
- [ ] Support visual dirty indicators in form fields

### Form Fields Maintenance

- [ ] Keep all existing Big Five personality sliders (0-100 range)
- [ ] Keep behavior trait sliders with existing functionality
- [ ] Keep custom instructions textarea (500 char limit)
- [ ] Maintain character counter for custom instructions
- [ ] Keep all existing field validation rules

### UI Updates

- [ ] Update form title to show "Create Personality" vs "Edit Personality"
- [ ] Update save button text to show "Create" vs "Update"
- [ ] Maintain existing form layout and styling
- [ ] Keep all accessibility features and ARIA labels

### Testing Requirements

- [ ] Update unit tests for both create and edit modes
- [ ] Test change detection with various edge cases
- [ ] Test form validation in both modes
- [ ] Test unsaved changes tracking
- [ ] Test form reset and cancel behavior
- [ ] Verify field-level dirty state indicators

## Files to Modify

- Rename `apps/desktop/src/components/settings/personalities/CreatePersonalityForm.tsx` to `PersonalityForm.tsx`
- Update any imports that reference the old component name
- Update barrel exports in index files

## Implementation Pattern

Follow the CreateRoleForm implementation exactly:

1. Mode-aware default values setting
2. Advanced change detection with meaningful comparison
3. Field-level dirty state tracking
4. Proper error handling and logging
5. Form state management with useUnsavedChanges integration

## Reference Implementation

Base the implementation on `apps/desktop/src/components/settings/roles/CreateRoleForm.tsx` patterns and structure.
