---
kind: task
id: T-update-generalsettings-to-use
title: Update GeneralSettings to use prop-based form
status: open
priority: normal
prerequisites:
  - T-refactor-settingscontent-to
created: "2025-08-03T16:46:40.529673"
updated: "2025-08-03T16:46:40.529673"
schema_version: "1.1"
---

Refactor GeneralSettings component to receive form instance as a prop instead of managing its own form and persistence.

## Context

As part of the form state lifting solution, GeneralSettings needs to be converted from a self-contained component to one that receives its form instance from the parent SettingsContent component.

## Implementation Requirements

1. Update component to accept form as a prop
2. Remove local useForm hook usage
3. Remove local useSettingsPersistence hook usage
4. Remove settings-save event listener
5. Keep all form field implementations unchanged
6. Maintain existing validation and field behavior

## Technical Approach

1. In `/apps/desktop/src/components/settings/GeneralSettings.tsx`:
   - Update component props to accept `form: UseFormReturn<GeneralSettingsFormData>`
   - Remove useForm initialization
   - Remove useSettingsPersistence and related state
   - Remove the settings-save event listener useEffect
   - Remove onSubmit handler (will be handled by parent)
   - Keep all FormField components and their implementations
   - Update any loading/error states to use props if needed

2. Update the component's TypeScript interface in shared types if needed

## Acceptance Criteria

- [ ] Component receives form instance as prop
- [ ] No local form or persistence management
- [ ] All form fields continue to work correctly
- [ ] Validation still functions properly
- [ ] No regression in user experience
- [ ] Component tests updated to pass form as prop
- [ ] TypeScript types are properly updated

## Testing Requirements

- Update existing GeneralSettings tests to provide form mock
- Test that form fields update the provided form instance
- Verify validation still works with prop-based form
- Test unsaved changes tracking still functions
- Ensure no console errors or warnings

### Log
