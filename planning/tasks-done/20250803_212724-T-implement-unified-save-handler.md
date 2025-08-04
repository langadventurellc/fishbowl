---
kind: task
id: T-implement-unified-save-handler
status: done
title: Implement unified save handler with atomic persistence
priority: high
prerequisites:
  - T-refactor-settingscontent-to
  - T-update-generalsettings-to-use
  - T-update-appearancesettings-to-use
created: "2025-08-03T16:47:05.971015"
updated: "2025-08-03T21:16:44.882239"
schema_version: "1.1"
worktree: null
---

Create a unified save handler in SettingsContent that validates and saves all settings forms atomically, and update ModalFooter integration.

## Context

With forms now managed centrally in SettingsContent, we need a single save handler that collects data from all forms, validates them, and saves them as one atomic operation. This ensures all settings are always saved together.

## Implementation Requirements

1. Create unified save handler in SettingsContent that validates all forms
2. Merge form data into complete SettingsFormData structure
3. Handle validation errors from any form appropriately
4. Update settings-save event listener to use new handler
5. Ensure proper error handling and user feedback
6. Update unsaved changes tracking to monitor all forms

## Technical Approach

1. In SettingsContent:
   - Create a unified handleSave function that:
     - Triggers validation on all forms
     - Collects validated data from each form
     - Merges into complete SettingsFormData object
     - Calls saveSettings with merged data
   - Add settings-save event listener that calls handleSave
   - Track unsaved changes across all forms

2. Error handling:
   - If any form fails validation, prevent save
   - Show appropriate error messages
   - Focus first invalid field

3. Update ModalFooter if needed to ensure save button behavior is consistent

## Acceptance Criteria

- [ ] Single save handler validates all forms before saving
- [ ] All settings saved atomically in one operation
- [ ] Validation errors properly displayed and handled
- [ ] Unsaved changes tracked across all forms
- [ ] Save button disabled only when no changes in any form
- [ ] Unit tests verify atomic save behavior
- [ ] Unit tests verify validation error handling

## Testing Requirements

- Test successful save with changes in both forms
- Test validation failure in one form prevents save
- Test unsaved changes tracking across form switches
- Test error handling and user feedback
- Verify no data loss when switching tabs with unsaved changes

### Log

**2025-08-04T02:27:24.697796Z** - Successfully implemented unified save handler with atomic persistence for SettingsContent component. The implementation validates all forms (general and appearance) before saving, handles validation errors by focusing the first invalid field, merges form data with existing settings, and saves everything atomically. The handler listens for 'settings-save' events from ModalFooter and uses comprehensive logging without UI notifications. All quality checks pass with no lint errors or type issues.

- filesChanged: ["apps/desktop/src/components/settings/SettingsContent.tsx"]
