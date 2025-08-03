---
kind: task
id: T-integrate
title: Integrate useDesktopSettingsPersistence hook in GeneralSettings component
status: open
priority: high
prerequisites: []
created: "2025-08-02T21:03:28.850047"
updated: "2025-08-02T21:03:28.850047"
schema_version: "1.1"
parent: F-general-settings-connection
---

# Integrate useDesktopSettingsPersistence hook in GeneralSettings component

## Context

The GeneralSettings component currently has a TODO comment for integrating with the settings persistence system. We need to connect it to the desktop settings adapter using the `useDesktopSettingsPersistence` hook that was created in the previous feature.

## Implementation Requirements

### 1. Import Required Dependencies

- Import `useDesktopSettingsPersistence` from `@fishbowl-ai/ui-shared`
- Import `desktopSettingsAdapter` from `apps/desktop/src/adapters`

### 2. Integrate the Persistence Hook

- Replace the TODO comment in `apps/desktop/src/components/settings/GeneralSettings.tsx`
- Add the persistence hook near the top of the component:

```typescript
const { settings, saveSettings } = useDesktopSettingsPersistence({
  adapter: desktopSettingsAdapter,
  onError: (error) => {
    setSubmitError(error.message);
  },
});
```

### 3. Update Form Default Values

- Modify the form initialization to use loaded settings:

```typescript
const form = useForm<GeneralSettingsFormData>({
  resolver: zodResolver(generalSettingsSchema),
  defaultValues: settings?.general || defaultGeneralSettings,
  mode: "onChange",
});
```

### 4. Add Effect to Reset Form When Settings Load

- Add a useEffect to update the form when settings are loaded:

```typescript
useEffect(() => {
  if (settings?.general) {
    form.reset(settings.general);
  }
}, [settings, form]);
```

### 5. Update Form Submission Handler

- Modify the `onSubmit` function to save through the persistence adapter:

```typescript
const onSubmit = useCallback(
  async (data: GeneralSettingsFormData) => {
    setSubmitError(null);

    try {
      const validatedData = generalSettingsSchema.parse(data);

      await saveSettings({
        ...settings,
        general: validatedData,
      });

      setUnsavedChanges(false);
      form.reset(validatedData);

      console.log("Settings saved successfully");
    } catch (error) {
      // Error handling already done by onError callback
    }
  },
  [form, setUnsavedChanges, settings, saveSettings],
);
```

## Acceptance Criteria

- ✓ GeneralSettings component uses useDesktopSettingsPersistence hook
- ✓ Form loads with saved settings values on mount
- ✓ Save button persists settings to local file
- ✓ Settings survive application restart
- ✓ Unsaved changes tracking works correctly
- ✓ Error handling displays appropriate messages
- ✓ No UI freezing during save operations

## Testing Requirements

Write unit tests to verify:

- Hook integration is set up correctly
- Form populates with saved settings
- Save operation updates the settings file
- Error callback is triggered on save failures
- Unsaved changes state is cleared after successful save

## File Locations

- Component to modify: `apps/desktop/src/components/settings/GeneralSettings.tsx`
- Hook to use: from `@fishbowl-ai/ui-shared`
- Adapter to use: from `apps/desktop/src/adapters/desktopSettingsAdapter.ts`

### Log
