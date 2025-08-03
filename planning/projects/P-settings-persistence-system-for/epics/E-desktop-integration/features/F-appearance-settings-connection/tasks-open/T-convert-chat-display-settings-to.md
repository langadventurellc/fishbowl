---
kind: task
id: T-convert-chat-display-settings-to
title:
  Convert chat display settings to form fields and finalize form structure with
  tests
status: open
priority: high
prerequisites:
  - T-convert-display-settings-to-form
created: "2025-08-03T15:01:23.707016"
updated: "2025-08-03T15:01:23.707016"
schema_version: "1.1"
parent: F-appearance-settings-connection
---

# Convert chat display settings to form fields and finalize form structure with tests

## Context

Convert the final chat display settings (font size, message spacing) to form fields and complete the form structure. This task finalizes the conversion from local state to form-based implementation.

## Implementation Requirements

### Convert Chat Display Settings

**Location**: `apps/desktop/src/components/settings/AppearanceSettings.tsx`

### Changes Required

1. **Remove Remaining Local State**:

```typescript
// Remove these useState calls:
const [fontSize, setFontSize] = useState<number[]>([14]);
const [messageSpacing, setMessageSpacing] = useState<
  "compact" | "normal" | "relaxed"
>("normal");
const handleFontSizeChange = useCallback((value: number[]) => {
  setFontSize(value);
}, []);
```

2. **Convert Font Size Slider to FormField**:

```typescript
<FormField
  control={form.control}
  name="fontSize"
  render={({ field }) => (
    <FormItem className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel>Message Font Size</FormLabel>
        <span className="text-sm text-muted-foreground">
          {field.value}px
        </span>
      </div>
      <FormControl>
        <Slider
          value={[field.value]}
          onValueChange={(value) => field.onChange(value[0])}
          min={12}
          max={18}
          step={1}
          className="w-full"
          aria-label="Message font size"
        />
      </FormControl>
      <FontSizePreview fontSize={field.value} />
      <FormDescription>
        Adjust the font size for chat messages
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

3. **Convert Message Spacing to FormField**:

```typescript
<FormField
  control={form.control}
  name="messageSpacing"
  render={({ field }) => (
    <FormItem className="space-y-3">
      <FormLabel>Message Spacing</FormLabel>
      <FormControl>
        <RadioGroup
          value={field.value}
          onValueChange={field.onChange}
          className="flex flex-row space-x-6"
          aria-describedby="spacing-description"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="compact" id="spacing-compact" />
            <Label htmlFor="spacing-compact" className="text-sm font-normal cursor-pointer">
              Compact
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="normal" id="spacing-normal" />
            <Label htmlFor="spacing-normal" className="text-sm font-normal cursor-pointer">
              Normal
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="relaxed" id="spacing-relaxed" />
            <Label htmlFor="spacing-relaxed" className="text-sm font-normal cursor-pointer">
              Relaxed
            </Label>
          </div>
        </RadioGroup>
      </FormControl>
      <FormDescription id="spacing-description">
        Control the spacing between chat messages
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

4. **Wrap Content in Form Component**:

```typescript
return (
  <div className="space-y-6">
    <div>
      <h1 className="text-heading-primary mb-[20px]">Appearance</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Customize the appearance and theme of the application
      </p>
    </div>

    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        data-testid="appearance-settings-form"
      >
        {/* Hidden submit button for accessibility */}
        <button type="submit" className="sr-only" aria-hidden="true">
          Save Settings
        </button>

        {/* Display submission error */}
        <FormErrorDisplay
          error={submitError}
          onDismiss={() => setSubmitError(null)}
        />

        {/* All form sections */}
        <div className="space-y-6">
          {/* Theme Selection Group */}
          {/* Display Settings Group */}
          {/* Chat Display Group */}
        </div>
      </form>
    </Form>
  </div>
);
```

5. **Add Settings Reset on Load**:

```typescript
// Reset form when settings are loaded
useEffect(() => {
  if (settings?.appearance) {
    form.reset(settings.appearance);
  }
}, [settings?.appearance, form]);
```

### Unit Test Updates

1. **Test Complete Form Functionality**:

```typescript
it('should handle all form fields correctly', async () => {
  render(<AppearanceSettings />);

  // Test all form controls exist and work
  expect(screen.getByLabelText('Light')).toBeInTheDocument();
  expect(screen.getByLabelText('Message Font Size')).toBeInTheDocument();
  expect(screen.getByLabelText('Compact')).toBeInTheDocument();

  // Test font size slider
  const slider = screen.getByRole('slider');
  fireEvent.change(slider, { target: { value: 16 } });

  expect(screen.getByText('16px')).toBeInTheDocument();
});
```

2. **Test Form Validation**:

```typescript
it('should validate form fields correctly', async () => {
  render(<AppearanceSettings />);

  // Test required field validation
  // Test min/max constraints on fontSize
  // Test enum validation on messageSpacing
});
```

3. **Test Settings Reset**:

```typescript
it('should reset form when settings load', async () => {
  const { rerender } = render(<AppearanceSettings />);

  // Initially should have defaults
  expect(screen.getByLabelText('System')).toBeChecked();

  // Update mock to return different settings
  const newSettings = {
    appearance: {
      theme: 'dark',
      fontSize: 16,
      messageSpacing: 'compact'
    }
  };

  mockUseSettingsPersistence.mockReturnValue({
    settings: newSettings,
    saveSettings: jest.fn(),
    isLoading: false,
    error: null,
  });

  rerender(<AppearanceSettings />);

  // Form should reset to loaded values
  expect(screen.getByLabelText('Dark')).toBeChecked();
  expect(screen.getByText('16px')).toBeInTheDocument();
  expect(screen.getByLabelText('Compact')).toBeChecked();
});
```

## Acceptance Criteria

- ✓ All chat display settings converted to FormField components
- ✓ Font size slider works with form validation
- ✓ Message spacing radio group integrated with form
- ✓ FontSizePreview updates with form value
- ✓ Complete form structure implemented
- ✓ Form resets when settings load from persistence
- ✓ All form validation works correctly
- ✓ All existing tests pass
- ✓ New tests cover complete form functionality

## Technical Approach

1. Convert final local state to form fields
2. Ensure all form controls use proper FormField wrappers
3. Complete form structure with proper accessibility
4. Add form reset logic for loaded settings
5. Update tests for complete form implementation

## Testing Requirements

- Test all form fields work correctly
- Test form validation for all field types
- Test form reset when settings load
- Test font size preview updates
- Verify complete form functionality
- Ensure no regressions in existing behavior

### Log
