---
kind: task
id: T-update-generalsettings-to-use
status: done
title: Update GeneralSettings to use prop-based form
priority: normal
prerequisites:
  - T-refactor-settingscontent-to
created: "2025-08-03T16:46:40.529673"
updated: "2025-08-03T20:29:23.117803"
schema_version: "1.1"
worktree: null
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

**2025-08-04T01:50:05.982136Z** - Successfully refactored GeneralSettings component to receive form instance as a prop instead of managing its own form and persistence. This enables centralized form management where all settings can be saved together from the SettingsContent component regardless of which tab is active.

Key changes implemented:

- Created GeneralSettingsProps interface in desktop app to define component props
- Removed local useForm hook, useSettingsPersistence hook, and settings-save event listener from GeneralSettings
- Updated SettingsContent to create and manage the form instance for GeneralSettings
- Fixed infinite render loop by properly managing form reset logic with useRef
- Updated all component tests to provide form mock as prop and fixed slider component test assertions
- All form fields continue to work correctly with validation and field behavior preserved

The component now focuses solely on rendering form fields while the parent SettingsContent handles form lifecycle, persistence, and state management. This sets the foundation for unified settings saving across all tabs.

- filesChanged: ["apps/desktop/src/types/GeneralSettingsProps.ts", "apps/desktop/src/components/settings/GeneralSettings.tsx", "apps/desktop/src/components/settings/SettingsContent.tsx", "apps/desktop/src/components/settings/__tests__/GeneralSettings.test.tsx", "apps/desktop/src/components/settings/__tests__/AppearanceSettings.test.tsx"]
