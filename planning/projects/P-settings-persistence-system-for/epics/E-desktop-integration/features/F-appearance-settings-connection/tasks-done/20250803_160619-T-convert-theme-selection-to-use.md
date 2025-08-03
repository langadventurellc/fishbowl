---
kind: task
id: T-convert-theme-selection-to-use
parent: F-appearance-settings-connection
status: done
title: Convert theme selection to use form fields with real-time application and tests
priority: high
prerequisites:
  - T-update-appearancesettings
created: "2025-08-03T15:00:23.247663"
updated: "2025-08-03T15:58:04.248025"
schema_version: "1.1"
worktree: null
---

# Convert theme selection to use form fields with real-time application and tests

## Context

Convert the theme selection section from local state to form fields, implementing real-time theme application. This is the core functionality that users will notice most - themes must apply immediately when selected.

## Implementation Requirements

### Update Theme Section

**Location**: `apps/desktop/src/components/settings/AppearanceSettings.tsx`

### Changes Required

1. **Remove Theme-Related Local State**:

```typescript
// Remove this:
const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "system">(
  "system",
);
const handleThemeChange = useCallback((value: string) => {
  setSelectedTheme(value as "light" | "dark" | "system");
}, []);
```

2. **Add Real-time Theme Application**:

```typescript
// Watch theme changes for immediate application
const watchedTheme = form.watch("theme");
useEffect(() => {
  if (watchedTheme) {
    applyTheme(watchedTheme);
  }
}, [watchedTheme]);
```

3. **Convert Theme Radio Group to FormField**:

```typescript
<FormField
  control={form.control}
  name="theme"
  render={({ field }) => (
    <FormItem className="space-y-3">
      <FormLabel>Theme</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={field.onChange}
          value={field.value}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
            <RadioGroupItem value="light" id="theme-light" />
            <Label htmlFor="theme-light" className="text-sm font-normal flex-1 py-2 cursor-pointer">
              Light
            </Label>
          </div>
          <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
            <RadioGroupItem value="dark" id="theme-dark" />
            <Label htmlFor="theme-dark" className="text-sm font-normal flex-1 py-2 cursor-pointer">
              Dark
            </Label>
          </div>
          <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
            <RadioGroupItem value="system" id="theme-system" />
            <div className="flex flex-col flex-1 py-2">
              <Label htmlFor="theme-system" className="text-sm font-normal cursor-pointer">
                System
              </Label>
              <span className="text-xs text-muted-foreground mt-1">
                Use your system preference
              </span>
            </div>
          </div>
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

4. **Update ThemePreview to Use Form Value**:

```typescript
<ThemePreview selectedTheme={form.watch("theme")} />
```

### Unit Test Updates

1. **Test Real-time Theme Application**:

```typescript
it('should apply theme immediately when changed', async () => {
  const mockApplyTheme = jest.mocked(applyTheme);

  render(<AppearanceSettings />);

  const darkRadio = screen.getByLabelText('Dark');
  fireEvent.click(darkRadio);

  await waitFor(() => {
    expect(mockApplyTheme).toHaveBeenCalledWith('dark');
  });
});
```

2. **Test Theme Options**:

- Test all three theme options (light, dark, system)
- Test theme preview updates correctly
- Test form field validation

3. **Test Form Integration**:

- Test theme value is part of form state
- Test unsaved changes when theme changes
- Test theme persists in form after selection

## Acceptance Criteria

- ✓ Theme selection uses FormField components
- ✓ Theme applies immediately when selected (real-time)
- ✓ Theme preview updates correctly with form value
- ✓ All theme options work (light, dark, system)
- ✓ Form validation works for theme field
- ✓ Unsaved changes tracked when theme changes
- ✓ All existing tests pass
- ✓ New tests for real-time application pass
- ✓ UI behavior is smooth with no flicker

## Technical Approach

1. Remove local state for theme only
2. Convert radio group to FormField
3. Add real-time theme watching and application
4. Update ThemePreview to use form value
5. Update tests for new behavior

## Testing Requirements

- Test immediate theme application
- Test all theme options work correctly
- Test form integration
- Test no regressions in other settings
- Verify smooth UI transitions

### Log

**2025-08-03T21:06:19.347958Z** - Successfully converted theme selection from local state to FormField components with real-time theme application.

**Key Changes:**

- Removed local state management (selectedTheme, setSelectedTheme, handleThemeChange)
- Converted RadioGroup to FormField with proper form control integration
- Added real-time theme application using form.watch("theme") and useEffect with applyTheme
- Updated ThemePreview to use form.watch("theme") instead of local state
- Added comprehensive unit tests for form integration and real-time theme application

**Implementation Details:**

- Theme changes apply immediately when selected using form.watch() pattern
- All three theme options (light, dark, system) work correctly with form validation
- FormField includes proper FormLabel, FormControl, and FormMessage components
- ThemePreview receives theme value directly from form state for immediate updates
- Form system automatically tracks unsaved changes when theme is modified

**Testing:**

- All existing tests continue to pass (34/34)
- Added 9 new comprehensive tests for Form Field Integration covering real-time application, validation, and form state management
- Tests verify applyTheme is called immediately on theme changes
- Tests confirm smooth UI behavior without errors during rapid theme changes

The implementation ensures users see immediate visual feedback when changing themes while maintaining proper form validation and state management.

- filesChanged: ["apps/desktop/src/components/settings/AppearanceSettings.tsx", "apps/desktop/src/components/settings/__tests__/AppearanceSettings.test.tsx"]
