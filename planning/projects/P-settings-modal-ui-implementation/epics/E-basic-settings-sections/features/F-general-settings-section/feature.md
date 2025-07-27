---
kind: feature
id: F-general-settings-section
title: General Settings Section Implementation
status: in-progress
priority: normal
prerequisites: []
created: "2025-07-27T16:36:05.716918"
updated: "2025-07-27T16:36:05.716918"
schema_version: "1.1"
parent: E-basic-settings-sections
---

# General Settings Section Implementation

## Purpose and Goals

Replace the placeholder mockups in the General Settings section with fully functional form components using shadcn/ui. Implement three distinct form groups: Auto Mode Settings, Conversation Defaults, and Other Settings with proper validation, styling, and accessibility.

## Key Components to Implement

### Auto Mode Settings Group

- **Response Delay Slider**: 1-30 seconds range with live value display
- **Maximum Messages Input**: Number input 0-500 (0 = unlimited) with validation
- **Maximum Wait Time Input**: Number input 5-120 seconds with validation
- Group title, description, and helper text styling

### Conversation Defaults Group

- **Default Mode Radio Group**: Manual/Auto selection with proper styling
- **Maximum Agents Input**: Number input 1-8 with validation
- Group title and description styling

### Other Settings Group

- **Update Checking Toggle**: Toggle switch with proper labeling
- Helper text and group structure

## Detailed Acceptance Criteria

### Visual Requirements

- [ ] Section title: "General" with exact 24px font and 20px margin-bottom
- [ ] Section description with proper muted text styling and spacing
- [ ] Three distinct form groups with clear visual separation
- [ ] Consistent spacing and typography throughout the section

### Auto Mode Settings Group

- [ ] Group title "Auto Mode Settings" with 18px font, semi-bold weight
- [ ] Group description with proper helper text styling
- [ ] Response Delay slider component:
  - [ ] Range: 1-30 seconds with step=1
  - [ ] Live value display showing "X seconds" format
  - [ ] Helper text: "Time between agent responses in auto mode"
  - [ ] Proper label association for accessibility
- [ ] Maximum Messages number input:
  - [ ] Range validation: 0-500 (0 displays as "Unlimited")
  - [ ] Helper text: "Stop auto mode after this many messages"
  - [ ] Error states for invalid input
  - [ ] Proper label association
- [ ] Maximum Wait Time number input:
  - [ ] Range validation: 5-120 seconds
  - [ ] Helper text: "Maximum time to wait for agent response"
  - [ ] Error states for invalid input

### Conversation Defaults Group

- [ ] Group title "Conversation Defaults" with consistent styling
- [ ] Default Mode radio group:
  - [ ] Two options: "Manual" and "Auto"
  - [ ] Vertical layout with proper spacing
  - [ ] Label: "Default Conversation Mode"
  - [ ] Proper accessibility attributes
- [ ] Maximum Agents number input:
  - [ ] Range validation: 1-8
  - [ ] Helper text: "Limit the number of agents in a conversation"
  - [ ] Error states for invalid input

### Other Settings Group

- [ ] Group title "Other Settings" with consistent styling
- [ ] Update checking toggle switch:
  - [ ] Label: "Automatically check for updates"
  - [ ] Helper text: "Check for new versions on startup"
  - [ ] Proper toggle switch behavior and styling
  - [ ] Accessibility support

### Form Component Standards

- [ ] All inputs use shadcn/ui Form components (FormField, FormLabel, FormControl, FormMessage)
- [ ] Helper text styling: 13px, muted foreground color, consistent positioning
- [ ] Error states: red borders, error messages below inputs
- [ ] Labels properly associated with inputs via htmlFor/id
- [ ] Focus indicators meet accessibility standards
- [ ] Keyboard navigation works correctly

### Responsive Behavior

- [ ] Form groups stack properly on mobile devices
- [ ] Input widths adapt to content and screen size
- [ ] Slider component works correctly on touch devices
- [ ] Radio buttons maintain proper spacing across screen sizes

## Implementation Guidance

### Technical Approach

- Use shadcn/ui Slider for Response Delay with controlled state
- Use shadcn/ui Input with type="number" for numeric inputs
- Use shadcn/ui RadioGroup for Default Mode selection
- Use shadcn/ui Toggle for the update checking option
- Implement form validation using Zod schemas
- Use React Hook Form for form state management

### Component Structure

```tsx
// Form groups with proper spacing and typography
<div className="space-y-6">
  <FormGroup title="Auto Mode Settings" description="...">
    <SliderField name="responseDelay" min={1} max={30} />
    <NumberField name="maxMessages" min={0} max={500} />
    <NumberField name="maxWaitTime" min={5} max={120} />
  </FormGroup>

  <FormGroup title="Conversation Defaults">
    <RadioGroupField name="defaultMode" options={["Manual", "Auto"]} />
    <NumberField name="maxAgents" min={1} max={8} />
  </FormGroup>

  <FormGroup title="Other Settings">
    <ToggleField name="checkUpdates" />
  </FormGroup>
</div>
```

### Validation Schema

```tsx
const GeneralSettingsSchema = z.object({
  responseDelay: z.number().min(1).max(30),
  maxMessages: z.number().min(0).max(500),
  maxWaitTime: z.number().min(5).max(120),
  defaultMode: z.enum(["manual", "auto"]),
  maxAgents: z.number().min(1).max(8),
  checkUpdates: z.boolean(),
});
```

## Testing Requirements

### Functional Testing

- [ ] Slider updates value display in real-time
- [ ] Number inputs accept valid values and reject invalid ones
- [ ] Radio buttons allow single selection
- [ ] Toggle switch changes state correctly
- [ ] Form validation prevents submission with invalid data
- [ ] Error messages display for invalid inputs

### Accessibility Testing

- [ ] Screen reader compatibility for all form elements
- [ ] Keyboard navigation works throughout the form
- [ ] Focus indicators are visible and consistent
- [ ] ARIA labels and descriptions are properly implemented

### Visual Testing

- [ ] Components match design specifications exactly
- [ ] Responsive behavior works across device sizes
- [ ] Form groups have proper visual separation
- [ ] Typography and spacing are consistent

## Security Considerations

### Input Validation

- Client-side validation with proper error handling
- Range validation for all numeric inputs
- Type safety with TypeScript and Zod schemas

### Data Handling

- No sensitive data in General settings
- Proper state management without data leakage
- Form reset functionality for security

## Performance Requirements

- [ ] Form renders in under 100ms
- [ ] Input interactions respond within 50ms
- [ ] Slider updates smoothly without lag
- [ ] No unnecessary re-renders during input changes
- [ ] Form validation is debounced appropriately

## Dependencies

- shadcn/ui Form components (FormField, FormLabel, FormControl, FormMessage)
- shadcn/ui Slider, Input, RadioGroup, Toggle components
- React Hook Form for form state management
- Zod for form validation schemas
- Lucide React for icons (if needed)

## Integration Points

- Integrates with existing SettingsContent component structure
- Uses established form styling patterns from shadcn/ui
- Connects to future settings store for data persistence
- Follows accessibility patterns established in modal foundation

### Log
