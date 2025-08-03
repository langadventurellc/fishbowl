---
kind: task
id: T-refactor-settingscontent-to
title: Refactor SettingsContent to manage forms and persistence
status: open
priority: high
prerequisites: []
created: "2025-08-03T16:46:24.914336"
updated: "2025-08-03T16:46:24.914336"
schema_version: "1.1"
---

Refactor the SettingsContent component to centrally manage form instances and settings persistence for both General and Appearance settings.

## Context

Currently, each settings component (GeneralSettings and AppearanceSettings) manages its own form and persistence hook, leading to only the active tab's settings being saved. This task lifts that state management up to the parent component.

## Implementation Requirements

1. Move useSettingsPersistence hook from individual components to SettingsContent
2. Create form instances for both General and Appearance settings in SettingsContent
3. Set up a forms object/map structure that can easily accommodate future settings tabs
4. Implement proper loading and error state management at the SettingsContent level
5. Pass form instances and states down as props to child components

## Technical Approach

1. In `/apps/desktop/src/components/settings/SettingsContent.tsx`:
   - Import necessary hooks and types from react-hook-form and @fishbowl-ai/ui-shared
   - Add useSettingsPersistenceAdapter and useSettingsPersistence hooks
   - Create two form instances using useForm with appropriate schemas
   - Structure forms in an object keyed by section name for extensibility
   - Add loading and error state handling UI

## Acceptance Criteria

- [ ] SettingsContent manages both form instances
- [ ] Single useSettingsPersistence hook instance in SettingsContent
- [ ] Forms are properly initialized with loaded settings data
- [ ] Loading and error states are handled at the parent level
- [ ] Component props are updated to pass forms to child components
- [ ] Unit tests verify form initialization and state management
- [ ] Code follows existing patterns and conventions

## Testing Requirements

- Unit tests for form initialization with default values
- Tests for settings data loading and form reset behavior
- Tests for error state handling
- Verify forms object structure supports easy extension

### Log
