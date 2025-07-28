---
kind: task
id: T-implement-conversation-defaults
parent: F-general-settings-section
status: done
title: Implement Conversation Defaults group with radio group and number input
priority: normal
prerequisites:
  - T-setup-form-dependencies-and-base
created: "2025-07-27T16:43:32.280745"
updated: "2025-07-27T17:36:02.753711"
schema_version: "1.1"
worktree: null
---

# Implement Conversation Defaults group with radio group and number input

## Context

Replace the placeholder mockups in the Conversation Defaults group (lines 59-72 in `GeneralSettings` component) with fully functional shadcn/ui form components. This group contains a radio group for mode selection and a number input for agent limits.

## Implementation Requirements

### Extend Zod Schema

Add Conversation Defaults fields to the validation schema:

```tsx
const GeneralSettingsSchema = z.object({
  // Auto Mode Settings fields from previous task
  responseDelay: z.number().min(1).max(30),
  maxMessages: z.number().min(0).max(500),
  maxWaitTime: z.number().min(5).max(120),

  // Conversation Defaults fields
  defaultMode: z.enum(["manual", "auto"]),
  maxAgents: z.number().min(1).max(8),

  // Additional fields from other tasks will be added here
});
```

### Update Form Default Values

```tsx
const form = useForm({
  resolver: zodResolver(GeneralSettingsSchema),
  defaultValues: {
    // Auto Mode Settings defaults from previous task
    responseDelay: 5,
    maxMessages: 50,
    maxWaitTime: 30,

    // Conversation Defaults
    defaultMode: "manual" as const,
    maxAgents: 4,

    // Additional defaults from other tasks
  },
});
```

### Default Mode Radio Group Implementation

Replace the placeholder at lines 62-66 with:

```tsx
<FormField
  control={form.control}
  name="defaultMode"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Default Conversation Mode</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={field.onChange}
          value={field.value}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="mode-manual" />
            <Label htmlFor="mode-manual" className="text-sm font-normal">
              Manual
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="auto" id="mode-auto" />
            <Label htmlFor="mode-auto" className="text-sm font-normal">
              Auto
            </Label>
          </div>
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Maximum Agents Input Implementation

Replace the placeholder at lines 67-72 with:

```tsx
<FormField
  control={form.control}
  name="maxAgents"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Maximum Agents</FormLabel>
      <FormControl>
        <div className="space-y-1">
          <Input
            type="number"
            min={1}
            max={8}
            {...field}
            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">
            {field.value} agent{field.value !== 1 ? "s" : ""}
          </div>
        </div>
      </FormControl>
      <FormMessage />
      <div className="text-xs text-muted-foreground">
        Limit the number of agents in a conversation
      </div>
    </FormItem>
  )}
/>
```

## Detailed Acceptance Criteria

### Visual Requirements

- [ ] Group title "Conversation Defaults" maintains consistent styling with other groups
- [ ] Radio buttons display in vertical layout with proper spacing (space-y-2)
- [ ] Radio button labels: "Manual" and "Auto" with proper font weight (normal)
- [ ] Maximum Agents input shows live count "X agent(s)" below input
- [ ] Helper text positioned below inputs with proper muted styling
- [ ] Error states display red borders and messages below components

### Functional Requirements

- [ ] Default Mode radio group allows single selection between "Manual" and "Auto"
- [ ] Radio buttons are properly associated with labels via htmlFor/id
- [ ] Maximum Agents input validates range 1-8 with immediate feedback
- [ ] Default mode value correctly connects to form state
- [ ] Agent count displays singular "agent" vs plural "agents" appropriately
- [ ] Form validation prevents submission with invalid agent counts

### Accessibility Requirements

- [ ] Radio group has proper FormLabel association
- [ ] Each radio button has unique id and proper label association
- [ ] Radio group supports keyboard navigation (arrow keys)
- [ ] Screen readers announce radio group options correctly
- [ ] Number input provides accessible feedback for validation errors
- [ ] Focus indicators are visible and consistent

### Component Integration

- [ ] Uses shadcn/ui RadioGroup and RadioGroupItem components
- [ ] RadioGroup properly integrates with React Hook Form via FormField
- [ ] Input component uses same styling patterns as Auto Mode Settings
- [ ] Form schema validation works for both radio selection and number input
- [ ] TypeScript types are correctly inferred from Zod schema

## Dependencies

- Requires completion of T-setup-form-dependencies-and-base task
- Can be developed in parallel with T-implement-auto-mode-settings task
- Enables final integration and validation tasks

## Security Considerations

- Input validation prevents invalid agent counts
- Radio group validation ensures only valid mode selections
- Type safety through TypeScript enum constraints

## Testing Requirements

- [ ] Unit tests for radio group rendering and selection
- [ ] Test radio button keyboard navigation functionality
- [ ] Test Maximum Agents input validation for boundary values (1, 8, invalid)
- [ ] Test radio group value changes update form state correctly
- [ ] Test accessibility with screen reader announcements
- [ ] Integration test for complete Conversation Defaults group
- [ ] Test that singular/plural agent display works correctly

### Log

**2025-07-27T22:41:12.112253Z** - Enhanced Conversation Defaults group with proper controlled components, improved validation, and live feedback. Updated radio group to use controlled `value` prop, improved styling with proper spacing and IDs, added min/max validation to number input with live agent count display, and updated default maximumAgents value from 5 to 4. All components now follow shadcn/ui patterns with proper accessibility features and form validation.

- filesChanged: ["packages/shared/src/types/settings/generalSettings.ts", "apps/desktop/src/components/settings/SettingsContent.tsx"]
