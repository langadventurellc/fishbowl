---
kind: feature
id: F-general-settings-connection
title: General Settings Connection
status: in-progress
priority: normal
prerequisites:
  - F-settings-state-integration
created: "2025-08-01T19:52:30.219427"
updated: "2025-08-01T19:52:30.219427"
schema_version: "1.1"
parent: E-desktop-integration
---

# General Settings Connection

## Purpose and Functionality

Connect the General Settings UI component to the settings persistence system, enabling users to save and load their general preferences. This feature modifies the existing GeneralSettings component to use the persistence hook, implements loading states, and ensures saved settings persist across application restarts. This serves as the template for connecting the other settings components.

## Key Components to Implement

### 1. GeneralSettings Component Integration

- Modify `GeneralSettings.tsx` to use `useSettingsPersistence` hook
- Pass `desktopSettingsAdapter` to the hook
- Replace TODO comment with actual persistence logic
- Load settings data into form on component mount
- Handle initial loading state appropriately

### 2. Form Submission Handler

- Update `onSubmit` to save through persistence adapter
- Save only general settings portion of the form data
- Handle save success and error states
- Update unsaved changes tracking after successful save
- Show appropriate user feedback

### 3. Loading State UI

- Add loading indicator during initial settings load
- Show skeleton or spinner while data loads
- Handle empty state when no settings exist yet
- Ensure smooth transition from loading to loaded

### 4. Settings Context Provider

- Create a settings context provider for the app
- Initialize with desktop settings adapter
- Wrap the app to provide settings access globally
- Enable settings modal to access persistence

## Acceptance Criteria

### Functional Requirements

- ✓ General settings load automatically when component mounts
- ✓ Form populates with saved values from settings file
- ✓ Save button persists general settings to file
- ✓ Settings survive application restart
- ✓ Loading state shown during initial load
- ✓ Unsaved changes cleared after successful save
- ✓ Form validation still works as before

### User Experience Requirements

- ✓ No UI freezing during load/save operations
- ✓ Clear feedback when settings are saved
- ✓ Smooth transition from loading to loaded state
- ✓ Form remains interactive during save
- ✓ Existing form behavior preserved

### Integration Requirements

- ✓ Uses useSettingsPersistence hook correctly
- ✓ Integrates with desktop settings adapter
- ✓ Works with existing form validation
- ✓ Maintains compatibility with unsaved changes tracking

## Technical Requirements

### Component Integration Pattern

```typescript
export const GeneralSettings: React.FC = () => {
  const { setUnsavedChanges } = useUnsavedChanges();

  const {
    settings,
    isLoading,
    error,
    saveSettings
  } = useSettingsPersistence({
    adapter: desktopSettingsAdapter,
    onError: (error) => {
      setSubmitError(error.message);
    }
  });

  const form = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: settings?.general || defaultGeneralSettings,
    mode: "onChange",
  });

  // Update form when settings load
  useEffect(() => {
    if (settings?.general) {
      form.reset(settings.general);
    }
  }, [settings, form]);

  const onSubmit = async (data: GeneralSettingsFormData) => {
    try {
      await saveSettings({
        ...settings,
        general: data
      });
      setUnsavedChanges(false);
      // Success feedback handled by parent
    } catch (error) {
      // Error already handled by onError callback
    }
  };

  if (isLoading) {
    return <GeneralSettingsLoading />;
  }

  // Rest of component...
};
```

### Settings Provider Setup

```typescript
// In App.tsx or main.tsx
export function App() {
  return (
    <SettingsProvider adapter={desktopSettingsAdapter}>
      {/* App content */}
    </SettingsProvider>
  );
}
```

## Dependencies

- **F-settings-state-integration**: Uses desktop settings adapter
- **@fishbowl-ai/ui-shared**: Uses useSettingsPersistence hook and types

## Implementation Guidance

1. Start by creating a simple loading component for general settings
2. Integrate useSettingsPersistence hook into GeneralSettings
3. Update form to use loaded settings as default values
4. Modify onSubmit to save through persistence
5. Test full save/load cycle with app restart
6. Add settings provider to app root if needed

## Testing Requirements

- Test settings load on component mount
- Test form population with saved values
- Test successful save operation
- Test error handling for save failures
- Verify settings persist after app restart
- Test loading state display

## Security Considerations

- No sensitive data should be logged
- Error messages should not expose system paths
- Form validation must occur before save

## Performance Requirements

- Initial load should complete within 200ms
- Save operations should feel instant to user
- No blocking of UI during persistence operations

## Important Notes

- This is the first UI integration - establish patterns for other components
- Focus on getting the basic flow working smoothly
- Loading states and error handling are critical for UX
- The pattern established here will be replicated for other settings
- No performance or integration tests should be included in the implementation

### Log
