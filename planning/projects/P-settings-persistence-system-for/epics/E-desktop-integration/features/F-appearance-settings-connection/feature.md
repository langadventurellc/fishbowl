---
kind: feature
id: F-appearance-settings-connection
title: Appearance Settings Connection
status: in-progress
priority: normal
prerequisites:
  - F-general-settings-connection
created: "2025-08-01T19:53:19.086509"
updated: "2025-08-01T19:53:19.086509"
schema_version: "1.1"
parent: E-desktop-integration
---

# Appearance Settings Connection

## Purpose and Functionality

Connect the Appearance Settings UI component to the settings persistence system, enabling users to save and load their theme and visual preferences. This feature follows the pattern established in General Settings Connection but handles the unique aspects of appearance settings, including real-time theme switching and color scheme persistence. The implementation ensures visual preferences are maintained across sessions.

## Key Components to Implement

### 1. AppearanceSettings Component Integration

- Modify `AppearanceSettings.tsx` to use shared persistence context
- Access settings data from the persistence system
- Load appearance settings into form on mount
- Handle theme changes with immediate visual feedback

### 2. Real-time Theme Application

- Apply theme changes immediately on form change
- Persist theme to settings on save
- Ensure theme loads correctly on app startup
- Coordinate with existing theme system

### 3. Form State Management

- Sync form state with loaded appearance settings
- Handle unsaved changes for appearance tab
- Maintain form validation for appearance options
- Update persistence on form submission

### 4. Settings Modal Coordination

- Share persistence state across all settings tabs
- Ensure appearance changes don't interfere with other tabs
- Handle tab switching with unsaved changes
- Maintain single source of truth for all settings

## Acceptance Criteria

### Functional Requirements

- ✓ Appearance settings load from persisted data
- ✓ Theme changes apply immediately to UI
- ✓ Font size adjustments reflect instantly
- ✓ Color scheme preferences persist correctly
- ✓ Settings survive application restart
- ✓ Form validation continues to work

### User Experience Requirements

- ✓ Smooth theme transitions without flicker
- ✓ Real-time preview of appearance changes
- ✓ No delay in applying visual changes
- ✓ Consistent behavior with general settings
- ✓ Clear feedback on save success

### Integration Requirements

- ✓ Shares persistence context with other settings
- ✓ Works with existing theme switching logic
- ✓ Compatible with form validation
- ✓ Maintains unsaved changes tracking

## Technical Requirements

### Component Integration Pattern

```typescript
export const AppearanceSettings: React.FC = () => {
  const { setUnsavedChanges } = useUnsavedChanges();
  const { settings, saveSettings, isLoading } = useSettingsContext();

  const form = useForm<AppearanceSettingsFormData>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: settings?.appearance || defaultAppearanceSettings,
    mode: "onChange",
  });

  // Update form when settings change
  useEffect(() => {
    if (settings?.appearance) {
      form.reset(settings.appearance);
    }
  }, [settings, form]);

  // Apply theme changes immediately
  const watchedTheme = form.watch("theme");
  useEffect(() => {
    applyTheme(watchedTheme);
  }, [watchedTheme]);

  const onSubmit = async (data: AppearanceSettingsFormData) => {
    try {
      await saveSettings({
        ...settings,
        appearance: data
      });
      setUnsavedChanges(false);
    } catch (error) {
      // Error handled by context
    }
  };

  if (isLoading) {
    return <AppearanceSettingsLoading />;
  }

  // Rest of component...
};
```

### Theme Application on Startup

```typescript
// In App initialization
useEffect(() => {
  const loadInitialTheme = async () => {
    const settings = await loadSettings();
    if (settings?.appearance?.theme) {
      applyTheme(settings.appearance.theme);
    }
  };
  loadInitialTheme();
}, []);
```

### Settings Context Pattern

```typescript
// Shared context for all settings components
export function SettingsModal() {
  const {
    settings,
    isLoading,
    error,
    saveSettings
  } = useSettingsPersistence({
    adapter: desktopSettingsAdapter
  });

  return (
    <SettingsContext.Provider value={{ settings, isLoading, error, saveSettings }}>
      {/* Settings tabs */}
    </SettingsContext.Provider>
  );
}
```

## Dependencies

- **F-general-settings-connection**: Follows established patterns
- **@fishbowl-ai/ui-shared**: Uses appearance types and mappers

## Implementation Guidance

1. Create settings context at modal level
2. Update AppearanceSettings to use context
3. Implement real-time theme application
4. Ensure theme persists and loads on startup
5. Test theme switching and persistence
6. Coordinate with existing theme system

## Testing Requirements

- Test appearance settings load from file
- Test real-time theme switching
- Test persistence of all appearance options
- Verify theme loads correctly on app start
- Test interaction with other settings tabs
- Ensure no theme flicker on load

## Security Considerations

- Validate theme values before applying
- Ensure color values are sanitized
- No injection through theme names

## Performance Requirements

- Theme changes should apply instantly
- No visual flicker during transitions
- Settings load should not delay theme application

## Important Notes

- Theme must apply immediately for good UX
- Loading the saved theme on app startup is critical
- Must coordinate with existing theme infrastructure
- Pattern should be reusable for advanced settings
- No performance or integration tests should be included in the implementation

### Log
