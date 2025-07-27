---
kind: task
id: T-add-other-settings-group-with
title: Add Other Settings group with update checking toggle
status: open
priority: normal
prerequisites:
  - T-setup-form-dependencies-and-base
created: "2025-07-27T16:43:59.645245"
updated: "2025-07-27T16:43:59.645245"
schema_version: "1.1"
parent: F-general-settings-section
---

# Add Other Settings group with update checking toggle

## Context

According to the feature specification, the General Settings should include an "Other Settings" group with an update checking toggle. This group is not currently present in the existing mockup (lines 33-74) and needs to be added to complete the feature requirements.

## Implementation Requirements

### Extend Zod Schema

Add Other Settings field to the validation schema:

```tsx
const GeneralSettingsSchema = z.object({
  // Auto Mode Settings fields
  responseDelay: z.number().min(1).max(30),
  maxMessages: z.number().min(0).max(500),
  maxWaitTime: z.number().min(5).max(120),

  // Conversation Defaults fields
  defaultMode: z.enum(["manual", "auto"]),
  maxAgents: z.number().min(1).max(8),

  // Other Settings
  checkUpdates: z.boolean(),
});
```

### Update Form Default Values

```tsx
const form = useForm({
  resolver: zodResolver(GeneralSettingsSchema),
  defaultValues: {
    // Auto Mode Settings defaults
    responseDelay: 5,
    maxMessages: 50,
    maxWaitTime: 30,

    // Conversation Defaults
    defaultMode: "manual" as const,
    maxAgents: 4,

    // Other Settings
    checkUpdates: true,
  },
});
```

### Add Other Settings Group Structure

After the Conversation Defaults group (around line 72), add the new Other Settings group:

```tsx
<div className="space-y-4">
  <h2 className="text-lg font-semibold">Other Settings</h2>
  <div className="grid gap-4">
    {/* Update checking toggle implementation below */}
  </div>
</div>
```

### Update Checking Toggle Implementation

Add the toggle switch component within the Other Settings group:

```tsx
<FormField
  control={form.control}
  name="checkUpdates"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
      <div className="space-y-0.5">
        <FormLabel className="text-base">
          Automatically check for updates
        </FormLabel>
        <div className="text-xs text-muted-foreground">
          Check for new versions on startup
        </div>
      </div>
      <FormControl>
        <Switch checked={field.value} onCheckedChange={field.onChange} />
      </FormControl>
    </FormItem>
  )}
/>
```

## Detailed Acceptance Criteria

### Visual Requirements

- [ ] Group title "Other Settings" uses same styling as other group titles (18px, semi-bold)
- [ ] Toggle switch is positioned on the right side of its container
- [ ] Container has rounded border with subtle shadow (rounded-lg border p-3 shadow-sm)
- [ ] Toggle label uses base font size (text-base)
- [ ] Helper text uses extra small size (text-xs) with muted color
- [ ] Layout uses flexbox with space-between for label/toggle alignment

### Functional Requirements

- [ ] Toggle switch properly controls boolean state in form
- [ ] Switch visual state reflects the form value (checked/unchecked)
- [ ] Clicking anywhere in the FormItem container should toggle the switch
- [ ] Default value is set to true (check updates enabled by default)
- [ ] Toggle state integrates with form validation and submission

### Accessibility Requirements

- [ ] Toggle has proper FormLabel association for screen readers
- [ ] Switch component supports keyboard navigation (Space to toggle)
- [ ] Helper text provides additional context for screen readers
- [ ] Switch announces its state when changed
- [ ] FormItem container provides proper focus management

### Component Integration

- [ ] Uses shadcn/ui Switch component with proper form integration
- [ ] Switch integrates seamlessly with React Hook Form via FormField
- [ ] Consistent styling with other form groups in the section
- [ ] Proper spacing maintains visual hierarchy with other groups
- [ ] Toggle layout pattern follows shadcn/ui design conventions

### Layout and Spacing

- [ ] Other Settings group appears after Conversation Defaults group
- [ ] Maintains consistent spacing between groups (space-y-6)
- [ ] Internal toggle spacing uses appropriate Tailwind classes
- [ ] Responsive behavior maintains proper alignment on all screen sizes

## Dependencies

- Requires completion of T-setup-form-dependencies-and-base task
- Can be developed in parallel with other form group tasks
- Enables final integration and form submission tasks

## Security Considerations

- Boolean toggle validation through Zod schema
- No sensitive data involved in update checking preference
- Type safety through TypeScript boolean type

## Testing Requirements

- [ ] Unit test for toggle switch rendering and state management
- [ ] Test toggle switch keyboard accessibility (Space key activation)
- [ ] Test that clicking FormItem container toggles the switch
- [ ] Test default value initialization (should be true)
- [ ] Test switch state changes are reflected in form data
- [ ] Integration test for complete Other Settings group
- [ ] Visual regression test to ensure consistent styling with other groups
- [ ] Accessibility test with screen reader compatibility

### Log
