---
kind: task
id: T-convert-display-settings-to-form
title: Convert display settings to form fields and add form submission with tests
status: open
priority: high
prerequisites:
  - T-convert-theme-selection-to-use
created: "2025-08-03T15:00:52.643803"
updated: "2025-08-03T15:00:52.643803"
schema_version: "1.1"
parent: F-appearance-settings-connection
---

# Convert display settings to form fields and add form submission with tests

## Context

Convert the remaining display settings (timestamps, activity time, compact list) to form fields and implement form submission handling. This completes the core form functionality.

## Implementation Requirements

### Convert Display Settings to Form Fields

**Location**: `apps/desktop/src/components/settings/AppearanceSettings.tsx`

### Changes Required

1. **Remove Display Settings Local State**:

```typescript
// Remove these useState calls:
const [showTimestamps, setShowTimestamps] = useState<
  "always" | "hover" | "never"
>("hover");
const [showActivityTime, setShowActivityTime] = useState(true);
const [compactList, setCompactList] = useState(false);
```

2. **Convert Show Timestamps to FormField**:

```typescript
<FormField
  control={form.control}
  name="showTimestamps"
  render={({ field }) => (
    <FormItem className="space-y-3">
      <FormLabel>Show Timestamps</FormLabel>
      <FormControl>
        <RadioGroup
          value={field.value}
          onValueChange={field.onChange}
          className="flex flex-col space-y-2"
          aria-describedby="timestamps-description"
        >
          <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
            <RadioGroupItem value="always" id="timestamps-always" />
            <Label htmlFor="timestamps-always" className="text-sm font-normal flex-1 py-2 cursor-pointer">
              Always
            </Label>
          </div>
          <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
            <RadioGroupItem value="hover" id="timestamps-hover" />
            <Label htmlFor="timestamps-hover" className="text-sm font-normal flex-1 py-2 cursor-pointer">
              On Hover
            </Label>
          </div>
          <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
            <RadioGroupItem value="never" id="timestamps-never" />
            <Label htmlFor="timestamps-never" className="text-sm font-normal flex-1 py-2 cursor-pointer">
              Never
            </Label>
          </div>
        </RadioGroup>
      </FormControl>
      <FormDescription id="timestamps-description">
        Control when message timestamps are displayed
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

3. **Convert Toggle Settings to FormFields**:

```typescript
<FormField
  control={form.control}
  name="showActivityTime"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
      <div className="space-y-0.5">
        <FormLabel className="text-base">Show last activity time</FormLabel>
        <FormDescription>
          Display the last activity time for each conversation
        </FormDescription>
      </div>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="compactList"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
      <div className="space-y-0.5">
        <FormLabel className="text-base">Compact conversation list</FormLabel>
        <FormDescription>
          Use a more compact layout for the conversation list
        </FormDescription>
      </div>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
    </FormItem>
  )}
/>
```

4. **Add Form Submission Handler**:

```typescript
const onSubmit = useCallback(
  async (data: AppearanceSettingsFormData) => {
    setSubmitError(null);

    try {
      const validatedData = appearanceSettingsSchema.parse(data);

      const updatedSettings = {
        ...settings,
        appearance: validatedData,
      } as SettingsFormData;

      await saveSettings(updatedSettings);
      setUnsavedChanges(false);
      form.reset(validatedData);
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Failed to save settings");
      }
    }
  },
  [form, setUnsavedChanges, settings, saveSettings],
);
```

5. **Add Form Event Handlers**:

```typescript
// Track unsaved changes
useEffect(() => {
  const subscription = form.watch(() => {
    setUnsavedChanges(form.formState.isDirty);
  });
  return () => subscription.unsubscribe();
}, [form, setUnsavedChanges]);

// Global save event handler
useEffect(() => {
  const handleSave = () => {
    form.handleSubmit(onSubmit)();
  };

  window.addEventListener("settings-save", handleSave);
  return () => {
    window.removeEventListener("settings-save", handleSave);
  };
}, [form, onSubmit]);
```

### Unit Test Updates

1. **Test Form Field Conversions**:

- Test all display settings use form fields
- Test form values update correctly
- Test form validation works

2. **Test Form Submission**:

```typescript
it('should save all appearance settings correctly', async () => {
  const mockSaveSettings = jest.fn().mockResolvedValue(undefined);
  mockUseSettingsPersistence.mockReturnValue({
    settings: mockSettings,
    saveSettings: mockSaveSettings,
    isLoading: false,
    error: null,
  });

  render(<AppearanceSettings />);

  // Change multiple settings
  fireEvent.click(screen.getByLabelText('Dark'));
  fireEvent.click(screen.getByLabelText('Always'));
  fireEvent.click(screen.getByLabelText('Show last activity time'));

  // Trigger save
  window.dispatchEvent(new CustomEvent('settings-save'));

  await waitFor(() => {
    expect(mockSaveSettings).toHaveBeenCalledWith({
      ...mockSettings,
      appearance: expect.objectContaining({
        theme: 'dark',
        showTimestamps: 'always',
        showActivityTime: false, // was toggled off
      }),
    });
  });
});
```

3. **Test Unsaved Changes Tracking**:

- Test unsaved changes detected on any field change
- Test unsaved changes cleared after save
- Test form reset after successful save

## Acceptance Criteria

- ✓ All display settings converted to FormField components
- ✓ Form submission saves all appearance settings correctly
- ✓ Unsaved changes tracked for all form fields
- ✓ Form validation works for all fields
- ✓ Global save event handling works
- ✓ Error handling during save operations
- ✓ All existing tests pass
- ✓ New tests for form functionality pass
- ✓ UI behavior remains consistent

## Technical Approach

1. Convert remaining local state to form fields
2. Implement complete form submission handler
3. Add unsaved changes tracking for all fields
4. Add global save event listener
5. Update tests for new form behavior

## Testing Requirements

- Test all form fields work correctly
- Test form submission with various settings combinations
- Test unsaved changes detection and clearing
- Test error handling during save
- Verify no regressions in UI behavior

### Log
