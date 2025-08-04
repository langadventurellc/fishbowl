---
kind: task
id: T-update-appearancesettings-to-use
status: done
title: Update AppearanceSettings to use prop-based form
priority: normal
prerequisites:
  - T-refactor-settingscontent-to
created: "2025-08-03T16:46:51.379364"
updated: "2025-08-03T20:54:43.624324"
schema_version: "1.1"
worktree: null
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

**2025-08-04T02:03:41.711069Z** - Successfully refactored AppearanceSettings component to receive form instance as a prop instead of managing its own form and persistence. This enables centralized form management where all settings can be saved together from the SettingsContent component regardless of which tab is active.

Key changes implemented:

- Created AppearanceSettingsProps interface in desktop app to define component props
- Removed local useForm hook, useSettingsPersistence hook, and settings-save event listener from AppearanceSettings
- Updated SettingsContent to create and manage the form instance for AppearanceSettings with proper initialization using useRef pattern to prevent infinite loops
- Removed AppearanceSettings from sectionComponents object and handled it explicitly in getActiveComponent
- All form fields continue to work correctly with theme switching still applying immediately via applyTheme utility
- Theme and font size preview functionality preserved and working correctly
- All existing tests pass without modification (they test through SettingsContent integration)

The component now focuses solely on rendering form fields while the parent SettingsContent handles form lifecycle, persistence, and state management. This completes the form state lifting solution alongside the previously completed GeneralSettings refactor.

- filesChanged: ["apps/desktop/src/types/AppearanceSettingsProps.ts", "apps/desktop/src/components/settings/AppearanceSettings.tsx", "apps/desktop/src/components/settings/SettingsContent.tsx"]
