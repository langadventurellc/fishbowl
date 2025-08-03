---
kind: task
id: T-update-appearancesettings-to-use
title: Update AppearanceSettings to use prop-based form
status: open
priority: normal
prerequisites:
  - T-refactor-settingscontent-to
created: "2025-08-03T16:46:51.379364"
updated: "2025-08-03T16:46:51.379364"
schema_version: "1.1"
---

Refactor AppearanceSettings component to receive form instance as a prop instead of managing its own form and persistence.

## Context

As part of the form state lifting solution, AppearanceSettings needs to be converted from a self-contained component to one that receives its form instance from the parent SettingsContent component.

## Implementation Requirements

1. Update component to accept form as a prop
2. Remove local useForm hook usage
3. Remove local useSettingsPersistence hook usage
4. Remove settings-save event listener
5. Keep all form field implementations unchanged
6. Maintain theme preview and font size preview functionality

## Technical Approach

1. In `/apps/desktop/src/components/settings/AppearanceSettings.tsx`:
   - Update component props to accept `form: UseFormReturn<AppearanceSettingsFormData>`
   - Remove useForm initialization
   - Remove useSettingsPersistence and related state
   - Remove the settings-save event listener useEffect
   - Remove onSubmit handler (will be handled by parent)
   - Keep all FormField components and their implementations
   - Maintain theme application logic (watchedTheme effect)
   - Keep ThemePreview and FontSizePreview components unchanged

2. Update the component's TypeScript interface in shared types if needed

## Acceptance Criteria

- [ ] Component receives form instance as prop
- [ ] No local form or persistence management
- [ ] All form fields continue to work correctly
- [ ] Theme switching still applies immediately
- [ ] Preview components still function
- [ ] Component tests updated to pass form as prop
- [ ] TypeScript types are properly updated

## Testing Requirements

- Update existing AppearanceSettings tests to provide form mock
- Test that form fields update the provided form instance
- Verify theme switching still works immediately
- Test that preview components receive correct values
- Ensure no console errors or warnings

### Log
