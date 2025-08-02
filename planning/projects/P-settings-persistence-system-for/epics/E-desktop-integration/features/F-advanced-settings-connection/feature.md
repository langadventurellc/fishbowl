---
kind: feature
id: F-advanced-settings-connection
title: Advanced Settings Connection
status: in-progress
priority: normal
prerequisites:
  - F-appearance-settings-connection
created: "2025-08-01T19:54:11.730921"
updated: "2025-08-01T19:54:11.730921"
schema_version: "1.1"
parent: E-desktop-integration
---

# Advanced Settings Connection

## Purpose and Functionality

Connect the Advanced Settings UI component to the settings persistence system, completing the integration of all three settings tabs. This feature handles developer-focused preferences such as debug logging, performance monitoring, and experimental features. The implementation follows the established pattern while addressing the unique requirements of advanced settings that may affect application behavior.

## Key Components to Implement

### 1. AdvancedSettings Component Integration

- Modify `AdvancedSettings.tsx` to use shared persistence context
- Load advanced settings from persisted data
- Handle form submission with persistence
- Apply settings that affect app behavior immediately

### 2. Runtime Settings Application

- Apply debug logging settings immediately
- Enable/disable performance monitoring as configured
- Handle experimental feature toggles
- Ensure settings take effect without restart where possible

### 3. Settings Validation and Safety

- Validate advanced settings more strictly
- Warn users about potentially risky settings
- Provide clear descriptions of each setting's impact
- Handle settings that require app restart

### 4. Complete Settings Integration

- Ensure all three tabs work together seamlessly
- Handle save operations across all settings categories
- Maintain consistent state across tab switches
- Complete the atomic save/load pattern

## Acceptance Criteria

### Functional Requirements

- ✓ Advanced settings load from persisted data
- ✓ Debug logging toggles apply immediately
- ✓ Performance settings persist correctly
- ✓ Experimental features can be enabled/disabled
- ✓ All three settings tabs save atomically
- ✓ Settings that require restart show appropriate message

### User Experience Requirements

- ✓ Clear warnings for risky settings
- ✓ Immediate feedback for settings that apply instantly
- ✓ Indication when restart is required
- ✓ Consistent behavior with other tabs
- ✓ Smooth integration with existing modal

### Integration Requirements

- ✓ Completes the three-tab integration
- ✓ Works with shared persistence context
- ✓ Maintains atomic save operations
- ✓ Compatible with all validation schemas

## Technical Requirements

### Component Integration Pattern

```typescript
export const AdvancedSettings: React.FC = () => {
  const { setUnsavedChanges } = useUnsavedChanges();
  const { settings, saveSettings, isLoading } = useSettingsContext();
  const [requiresRestart, setRequiresRestart] = useState(false);

  const form = useForm<AdvancedSettingsFormData>({
    resolver: zodResolver(advancedSettingsSchema),
    defaultValues: settings?.advanced || defaultAdvancedSettings,
    mode: "onChange",
  });

  // Update form when settings change
  useEffect(() => {
    if (settings?.advanced) {
      form.reset(settings.advanced);
    }
  }, [settings, form]);

  // Apply debug logging immediately
  const debugLogging = form.watch("debugLogging");
  useEffect(() => {
    if (debugLogging !== undefined) {
      window.electronAPI?.setDebugLogging?.(debugLogging);
    }
  }, [debugLogging]);

  // Track settings that require restart
  const experimentalFeatures = form.watch("experimentalFeatures");
  useEffect(() => {
    if (settings?.advanced?.experimentalFeatures !== experimentalFeatures) {
      setRequiresRestart(true);
    }
  }, [experimentalFeatures, settings]);

  const onSubmit = async (data: AdvancedSettingsFormData) => {
    try {
      await saveSettings({
        ...settings,
        advanced: data
      });
      setUnsavedChanges(false);

      if (requiresRestart) {
        // Show restart notification
      }
    } catch (error) {
      // Error handled by context
    }
  };

  if (isLoading) {
    return <AdvancedSettingsLoading />;
  }

  // Rest of component...
};
```

### Complete Modal Save Pattern

```typescript
// In SettingsModal, handle save across all tabs
const handleSaveAll = async () => {
  const generalData = generalFormRef.current?.getValues();
  const appearanceData = appearanceFormRef.current?.getValues();
  const advancedData = advancedFormRef.current?.getValues();

  if (generalData && appearanceData && advancedData) {
    await saveSettings({
      general: generalData,
      appearance: appearanceData,
      advanced: advancedData,
    });

    // Clear unsaved changes for all tabs
    setUnsavedChanges(false);
  }
};
```

### Runtime Configuration

```typescript
// Apply advanced settings that don't require restart
export function applyAdvancedSettings(settings: AdvancedSettingsData) {
  // Debug logging
  if (settings.debugLogging) {
    enableDebugLogging();
  } else {
    disableDebugLogging();
  }

  // Performance monitoring
  if (settings.performanceMonitoring) {
    startPerformanceMonitoring();
  } else {
    stopPerformanceMonitoring();
  }

  // Settings requiring restart are handled on next launch
}
```

## Dependencies

- **F-appearance-settings-connection**: Completes the pattern
- **@fishbowl-ai/ui-shared**: Uses advanced settings types and validation

## Implementation Guidance

1. Follow the established pattern from other settings
2. Add advanced settings to shared context
3. Implement runtime application of settings
4. Handle settings that require restart
5. Test complete save/load cycle with all tabs
6. Ensure atomic operations work correctly

## Testing Requirements

- Test advanced settings persistence
- Test immediate application of debug settings
- Test settings that require restart
- Verify atomic save of all three tabs
- Test validation of risky settings
- Ensure no conflicts between tabs

## Security Considerations

- Validate all advanced settings strictly
- Warn before enabling experimental features
- Log changes to security-sensitive settings
- Prevent injection through debug options

## Performance Requirements

- Settings application should not impact performance
- Debug logging toggle should be instant
- No memory leaks from monitoring features

## Important Notes

- This completes the three-tab integration
- Some settings may require app restart - handle gracefully
- Advanced settings can affect app stability - validate carefully
- Maintain atomic save pattern across all settings
- No performance or integration tests should be included in the implementation

### Log
