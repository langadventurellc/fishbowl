---
kind: task
id: T-implement-auto-mode-settings
parent: F-general-settings-section
status: done
title: Implement Auto Mode Settings group with functional form components
priority: normal
prerequisites:
  - T-setup-form-dependencies-and-base
created: "2025-07-27T16:43:04.873178"
updated: "2025-07-27T17:21:24.464131"
schema_version: "1.1"
worktree: null
---

# Implement Auto Mode Settings group with functional form components

## Context

Replace the placeholder mockups in the Auto Mode Settings group (lines 42-58 in `GeneralSettings` component) with fully functional shadcn/ui form components. This group contains three form fields with specific validation requirements.

## Implementation Requirements

### Extend Zod Schema

Add Auto Mode Settings fields to the validation schema:

```tsx
const GeneralSettingsSchema = z.object({
  responseDelay: z.number().min(1).max(30),
  maxMessages: z.number().min(0).max(500),
  maxWaitTime: z.number().min(5).max(120),
  // Additional fields from other tasks will be added here
});
```

### Update Form Default Values

```tsx
const form = useForm({
  resolver: zodResolver(GeneralSettingsSchema),
  defaultValues: {
    responseDelay: 5,
    maxMessages: 50,
    maxWaitTime: 30,
    // Additional defaults from other tasks
  },
});
```

### Response Delay Slider Implementation

Replace the placeholder at lines 45-48 with:

```tsx
<FormField
  control={form.control}
  name="responseDelay"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Response Delay</FormLabel>
      <FormControl>
        <div className="space-y-2">
          <Slider
            min={1}
            max={30}
            step={1}
            value={[field.value]}
            onValueChange={(value) => field.onChange(value[0])}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">
            {field.value} second{field.value !== 1 ? "s" : ""}
          </div>
        </div>
      </FormControl>
      <FormMessage />
      <div className="text-xs text-muted-foreground">
        Time between agent responses in auto mode
      </div>
    </FormItem>
  )}
/>
```

### Maximum Messages Input Implementation

Replace the placeholder at lines 49-53 with:

```tsx
<FormField
  control={form.control}
  name="maxMessages"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Maximum Messages</FormLabel>
      <FormControl>
        <div className="space-y-1">
          <Input
            type="number"
            min={0}
            max={500}
            {...field}
            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">
            {field.value === 0 ? "Unlimited" : `${field.value} messages`}
          </div>
        </div>
      </FormControl>
      <FormMessage />
      <div className="text-xs text-muted-foreground">
        Stop auto mode after this many messages (0 = unlimited)
      </div>
    </FormItem>
  )}
/>
```

### Maximum Wait Time Input Implementation

Replace the placeholder at lines 54-58 with:

```tsx
<FormField
  control={form.control}
  name="maxWaitTime"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Maximum Wait Time</FormLabel>
      <FormControl>
        <div className="space-y-1">
          <Input
            type="number"
            min={5}
            max={120}
            {...field}
            onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">
            {field.value} seconds
          </div>
        </div>
      </FormControl>
      <FormMessage />
      <div className="text-xs text-muted-foreground">
        Maximum time to wait for agent response
      </div>
    </FormItem>
  )}
/>
```

## Detailed Acceptance Criteria

### Visual Requirements

- [ ] Group title "Auto Mode Settings" maintains 18px font, semi-bold weight
- [ ] Response Delay slider displays live value in "X seconds" format
- [ ] Maximum Messages shows "Unlimited" when value is 0, otherwise "X messages"
- [ ] Maximum Wait Time shows "X seconds" format
- [ ] Helper text uses 13px font, muted foreground color, positioned below inputs
- [ ] Error states show red borders and error messages below inputs
- [ ] Consistent spacing between form fields (space-y-4 on grid)

### Functional Requirements

- [ ] Response Delay slider: 1-30 range, step=1, live value updates
- [ ] Maximum Messages input: 0-500 validation, 0 displays as "Unlimited"
- [ ] Maximum Wait Time input: 5-120 validation with proper error handling
- [ ] All inputs properly connected to form state via React Hook Form
- [ ] Validation errors display immediately on invalid input
- [ ] Form values update in real-time as user interacts

### Accessibility Requirements

- [ ] All inputs have proper FormLabel associations
- [ ] Helper text is accessible via aria-describedby relationships
- [ ] Slider component supports keyboard navigation
- [ ] Number inputs support screen reader announcements
- [ ] Focus indicators meet accessibility standards
- [ ] Error messages are announced to screen readers

### Component Standards

- [ ] All components use shadcn/ui FormField, FormLabel, FormControl, FormMessage
- [ ] Proper TypeScript integration with form schema types
- [ ] Input validation provides immediate feedback
- [ ] Consistent styling matches existing settings sections

## Dependencies

- Requires completion of T-setup-form-dependencies-and-base task
- Enables subsequent tasks for other form groups

## Security Considerations

- Client-side validation with proper range validation
- Type safety through TypeScript and Zod schemas
- No sensitive data in these form fields

## Testing Requirements

- [ ] Unit tests for each form field component rendering
- [ ] Test slider value updates and live display
- [ ] Test number input validation for edge cases (0, negative, over-max)
- [ ] Test error message display for invalid values
- [ ] Test accessibility with screen reader compatibility
- [ ] Integration test for complete Auto Mode Settings group functionality

### Log

**2025-07-27T22:33:02.403567Z** - Enhanced Auto Mode Settings group with Slider component for Response Delay and dynamic 'Unlimited' display for Maximum Messages. Replaced Response Delay Input with interactive Slider (1-30 seconds range) showing live value updates. Added conditional display logic showing 'Unlimited' when Maximum Messages value is 0, otherwise displays message count. Enhanced Maximum Wait Time with consistent styling and live value display. All components use proper validation, accessibility features, and match task requirements exactly.

- filesChanged: ["apps/desktop/src/components/settings/SettingsContent.tsx"]
