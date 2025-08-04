---
kind: task
id: T-update-settingscontent-to-create
parent: F-advanced-settings-connection
status: done
title: Update SettingsContent to create and manage advanced settings form
priority: high
prerequisites:
  - T-create-advancedsettingsprops
created: "2025-08-03T23:05:06.931259"
updated: "2025-08-03T23:17:57.289485"
schema_version: "1.1"
worktree: null
---

# Update SettingsContent to Create and Manage Advanced Settings Form

## Context

SettingsContent component manages form instances for all settings sections and handles unified saving. Currently it creates forms for GeneralSettings and AppearanceSettings. It needs to be updated to also create and manage an AdvancedSettings form instance.

## Implementation Requirements

Update `apps/desktop/src/components/settings/SettingsContent.tsx`:

### 1. Import Advanced Settings Types

```typescript
import {
  // ... existing imports
  type AdvancedSettingsFormData,
  advancedSettingsSchema,
  defaultAdvancedSettings,
} from "@fishbowl-ai/ui-shared";
```

### 2. Create Advanced Settings Form Instance

Add after the appearance form creation (around line 90):

```typescript
// Create form instance for AdvancedSettings
const advancedForm = useForm<AdvancedSettingsFormData>({
  resolver: zodResolver(advancedSettingsSchema),
  defaultValues: settings?.advanced || defaultAdvancedSettings,
  mode: "onChange",
});
```

### 3. Add Ref for Form Initialization

Add after line 94:

```typescript
const hasInitializedAdvancedForm = useRef(false);
```

### 4. Update Dirty State Check

Update the formsAreDirty calculation (line 97-98):

```typescript
const formsAreDirty =
  generalForm.formState.isDirty ||
  appearanceForm.formState.isDirty ||
  advancedForm.formState.isDirty;
```

### 5. Update Unified Save Handler

Modify handleUnifiedSave (starting around line 106) to include advanced settings:

- Add advancedForm validation to Promise.all
- Add advanced form error handling
- Include advanced data in settings update
- Reset advanced form after save

### 6. Add Form Reset Effect

Add a new useEffect for advanced settings form reset (similar to lines 209-223):

```typescript
// Reset advanced form when settings are loaded, but only for advanced section
useEffect(() => {
  if (
    activeSection === "advanced" &&
    settings?.advanced &&
    !hasInitializedAdvancedForm.current
  ) {
    advancedForm.reset(settings.advanced);
    hasInitializedAdvancedForm.current = true;
  }

  // Reset the flag when switching away from advanced section
  if (activeSection !== "advanced") {
    hasInitializedAdvancedForm.current = false;
  }
}, [activeSection, settings?.advanced]); // eslint-disable-line react-hooks/exhaustive-deps
```

### 7. Update Component Rendering

Modify getActiveComponent() to pass form to AdvancedSettings (around line 241):

```typescript
if (activeSection === "advanced") {
  return (
    <AdvancedSettings
      form={advancedForm}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

## Acceptance Criteria

- ✓ Advanced settings form instance created with proper validation
- ✓ Form dirty state includes advanced settings
- ✓ Unified save handler validates and saves all three forms atomically
- ✓ Advanced form resets properly when settings load
- ✓ Form prop passed to AdvancedSettings component
- ✓ All forms work together seamlessly
- ✓ TypeScript compilation succeeds

## Testing Requirements

- Write unit tests to verify form creation and management
- Test that all three forms save atomically
- Verify form reset behavior when switching sections
- Test validation across all forms

### Log

**2025-08-04T04:35:05.437103Z** - Successfully updated SettingsContent component to create and manage advanced settings form, completing the three-tab settings integration. Implemented advanced form instance with proper validation, updated unified save handler to include advanced settings, added form reset logic, and passed form prop to AdvancedSettings component. All quality checks pass and tests are working correctly.

- filesChanged: ["apps/desktop/src/components/settings/SettingsContent.tsx", "apps/desktop/src/components/settings/AdvancedSettings.tsx", "apps/desktop/src/components/settings/__tests__/AppearanceSettings.test.tsx"]
