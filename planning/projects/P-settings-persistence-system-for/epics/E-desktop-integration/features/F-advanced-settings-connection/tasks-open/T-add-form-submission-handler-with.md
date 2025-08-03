---
kind: task
id: T-add-form-submission-handler-with
title: Add form submission handler with persistence and tests
status: open
priority: normal
prerequisites:
  - T-convert-switch-components-to
created: "2025-08-03T17:35:19.691913"
updated: "2025-08-03T17:35:19.691913"
schema_version: "1.1"
parent: F-advanced-settings-connection
---

# Add form submission handler with persistence and tests

## Context

Following the pattern from general and appearance settings, we need to add a form submission handler that saves advanced settings through the persistence adapter. This completes the integration by enabling users to persist their advanced settings preferences.

## Implementation Requirements

### 1. Add Form Submission Handler

In `apps/desktop/src/components/settings/AdvancedSettings.tsx`, add the onSubmit handler:

```typescript
const onSubmit = useCallback(
  async (data: AdvancedSettingsFormData) => {
    try {
      await saveSettings({
        ...settings,
        advanced: data,
      });

      setUnsavedChanges(false);
      form.reset(data);

      if (restartRequired) {
        // Show restart notification or trigger restart dialog
        logger.info(
          "Advanced settings saved. Restart required for some changes.",
        );
      } else {
        logger.info("Advanced settings saved successfully");
      }
    } catch (error) {
      // Error is already handled by the persistence hook's onError callback
      logger.error("Failed to save advanced settings", error);
    }
  },
  [form, settings, saveSettings, setUnsavedChanges, restartRequired],
);
```

### 2. Wrap Component Content in Form

Update the component JSX to use the form provider:

```typescript
return (
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <div>
      <h1 className="text-heading-primary mb-[20px]">Advanced Settings</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Advanced configuration options for power users.
      </p>
    </div>

    {/* Live regions for screen reader announcements */}
    <div role="status" aria-live="polite" className="sr-only">
      {isClearing && "Clearing conversations..."}
    </div>

    {restartRequired && (
      <div role="alert" className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-amber-900 dark:text-amber-100">
            Some changes require a restart to take effect
          </span>
        </div>
      </div>
    )}

    {/* Rest of the form content with Controller components */}

    {/* Note: Save button will be handled by parent SettingsModal */}
  </form>
);
```

### 3. Export Form Ref for Parent Modal

Add form ref forwarding to allow parent modal to trigger save:

```typescript
export const AdvancedSettings = React.forwardRef<
  UseFormReturn<AdvancedSettingsFormData>,
  React.ComponentPropsWithoutRef<"form">
>((props, ref) => {
  // ... existing component logic ...

  // Expose form methods to parent
  React.useImperativeHandle(ref, () => form, [form]);

  // ... rest of component
});

AdvancedSettings.displayName = "AdvancedSettings";
```

### 4. Update Parent SettingsModal Integration

The parent SettingsModal should be updated to handle advanced settings tab:

```typescript
// In SettingsModal component
const advancedFormRef = useRef<UseFormReturn<AdvancedSettingsFormData>>(null);

// In handleSaveAll function
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

    setUnsavedChanges(false);
  }
};
```

### 5. Add Component Tests

Update `apps/desktop/src/components/settings/__tests__/AdvancedSettings.test.tsx`:

```typescript
describe("AdvancedSettings form submission", () => {
  it("should save settings on form submission", async () => {
    const mockSaveSettings = jest.fn().mockResolvedValue(undefined);
    mockUseDesktopSettingsPersistence.mockReturnValue({
      settings: mockSettings,
      saveSettings: mockSaveSettings,
      isLoading: false,
      error: null,
    });

    render(<AdvancedSettings />);

    // Toggle a setting
    const debugSwitch = screen.getByRole("switch", {
      name: /toggle debug logging/i,
    });
    await userEvent.click(debugSwitch);

    // Submit form
    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalledWith({
        ...mockSettings,
        advanced: {
          debugLogging: true,
          experimentalFeatures: false,
        },
      });
    });
  });

  it("should reset unsaved changes after successful save", async () => {
    const mockSetUnsavedChanges = jest.fn();
    mockUseUnsavedChanges.mockReturnValue({
      setUnsavedChanges: mockSetUnsavedChanges,
    });

    render(<AdvancedSettings />);

    // Make a change
    const debugSwitch = screen.getByRole("switch", {
      name: /toggle debug logging/i,
    });
    await userEvent.click(debugSwitch);

    // Submit form
    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSetUnsavedChanges).toHaveBeenCalledWith(false);
    });
  });

  it("should handle save errors gracefully", async () => {
    const mockSaveSettings = jest.fn().mockRejectedValue(new Error("Save failed"));
    mockUseDesktopSettingsPersistence.mockReturnValue({
      settings: mockSettings,
      saveSettings: mockSaveSettings,
      isLoading: false,
      error: null,
    });

    render(<AdvancedSettings />);

    // Submit form
    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalled();
      // Error should be logged but not crash the component
    });
  });
});
```

## Acceptance Criteria

- ✓ Form submission saves advanced settings through persistence adapter
- ✓ Settings are merged with existing settings before save
- ✓ Unsaved changes are cleared after successful save
- ✓ Form is reset with saved values after submission
- ✓ Restart notification is preserved after save if needed
- ✓ Errors are handled gracefully without crashing
- ✓ Form ref is exposed for parent modal integration
- ✓ Unit tests verify save functionality
- ✓ Integration with parent modal works correctly

## Testing Requirements

Write unit tests to verify:

- Form submission calls saveSettings with correct data
- Settings are properly merged before save
- Unsaved changes are cleared on successful save
- Form resets with new values after save
- Error handling doesn't crash the component
- Form ref is properly exposed
- Logger is called with appropriate messages

## File Locations

- Component to modify: `apps/desktop/src/components/settings/AdvancedSettings.tsx`
- Tests to update: `apps/desktop/src/components/settings/__tests__/AdvancedSettings.test.tsx`
- Parent modal integration: `apps/desktop/src/components/settings/SettingsModal.tsx`

### Log
