---
id: T-implement-configuration
title: Implement configuration sliders with real-time descriptions
status: done
priority: medium
parent: F-agent-form-simplification
prerequisites:
  - T-set-up-react-hook-form-with
affectedFiles:
  apps/desktop/src/components/settings/agents/AgentForm.tsx: Updated temperature
    and topP sliders to use shadcn/ui Slider component with real-time
    descriptions. Updated maxTokens input formatting and description display.
    Added proper imports for getSliderDescription utility. All controls now show
    current values with descriptive text that updates immediately as users
    interact with them.
log:
  - Successfully implemented configuration sliders with real-time descriptions.
    Replaced basic HTML range inputs with proper shadcn/ui Slider components for
    temperature and topP controls. Updated maxTokens input to match
    specifications. Added real-time descriptive text using getSliderDescription
    utility that updates immediately as values change. All controls properly
    integrate with React Hook Form, respect disabled states, and display current
    values with appropriate precision. Implementation follows existing patterns
    and passes all quality checks.
schema: v1.0
childrenIds: []
created: 2025-08-19T18:25:41.001Z
updated: 2025-08-19T18:25:41.001Z
---

# Implement configuration sliders with real-time descriptions

## Context

Add temperature, max tokens, and top P configuration controls with real-time descriptive text using the existing getSliderDescription utility and ConfigurationSlider component. This provides users with clear understanding of how their settings will affect AI behavior.

## Detailed Implementation Requirements

### Configuration Fields Implementation

#### Temperature Slider (0-2, step 0.1)

```typescript
<FormField
  control={form.control}
  name="temperature"
  render={({ field }) => (
    <FormItem>
      <div className="flex items-center justify-between">
        <FormLabel>Temperature</FormLabel>
        <span className="text-sm text-muted-foreground">
          {field.value?.toFixed(1)} - {getSliderDescription.temperature(field.value || 0)}
        </span>
      </div>
      <FormControl>
        <ConfigurationSlider
          value={[field.value || 0]}
          onValueChange={(values) => field.onChange(values[0])}
          min={0}
          max={2}
          step={0.1}
          disabled={isSubmitting || isLoading}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### Max Tokens Input (1-4000)

```typescript
<FormField
  control={form.control}
  name="maxTokens"
  render={({ field }) => (
    <FormItem>
      <div className="flex items-center justify-between">
        <FormLabel>Max Tokens</FormLabel>
        <span className="text-sm text-muted-foreground">
          {getSliderDescription.maxTokens(field.value || 1000)}
        </span>
      </div>
      <FormControl>
        <Input
          type="number"
          {...field}
          value={field.value || ""}
          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
          min={1}
          max={4000}
          placeholder="1000"
          disabled={isSubmitting || isLoading}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### Top P Slider (0-1, step 0.01)

```typescript
<FormField
  control={form.control}
  name="topP"
  render={({ field }) => (
    <FormItem>
      <div className="flex items-center justify-between">
        <FormLabel>Top P</FormLabel>
        <span className="text-sm text-muted-foreground">
          {field.value?.toFixed(2)} - {getSliderDescription.topP(field.value || 1)}
        </span>
      </div>
      <FormControl>
        <ConfigurationSlider
          value={[field.value || 1]}
          onValueChange={(values) => field.onChange(values[0])}
          min={0}
          max={1}
          step={0.01}
          disabled={isSubmitting || isLoading}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Real-time Description Integration

- Import getSliderDescription utility from `../../../utils/sliderDescriptions`
- Display current value and description in label row
- Update descriptions immediately as slider values change
- Use consistent styling for description text

## Technical Implementation

### Files to Modify

- `apps/desktop/src/components/settings/agents/AgentForm.tsx`

### Dependencies

- ConfigurationSlider component from `../ConfigurationSlider`
- getSliderDescription utility from `../../../utils/sliderDescriptions`
- Input component from shadcn/ui for max tokens
- Existing slider patterns from AgentsSection

### Key Implementation Steps

1. Import ConfigurationSlider and getSliderDescription
2. Add temperature slider with 0-2 range and 0.1 step
3. Add max tokens input with 1-4000 range and number validation
4. Add top P slider with 0-1 range and 0.01 step
5. Implement real-time description updates for all controls
6. Add proper form integration and validation
7. Test slider behavior and description updates

## Acceptance Criteria

### Slider Implementation

- ✅ Temperature slider ranges from 0 to 2 with 0.1 steps
- ✅ Top P slider ranges from 0 to 1 with 0.01 steps
- ✅ Max tokens input accepts integers from 1 to 4000
- ✅ All controls integrate properly with React Hook Form

### Real-time Descriptions

- ✅ Temperature descriptions update as slider moves (e.g., "Very focused and deterministic")
- ✅ Top P descriptions update as slider moves (e.g., "Highly creative and diverse")
- ✅ Max tokens descriptions provide context (e.g., "Short responses")
- ✅ Descriptions match existing getSliderDescription utility

### User Experience

- ✅ Sliders are smooth and responsive
- ✅ Current values display clearly with appropriate precision
- ✅ Descriptions provide helpful context for settings
- ✅ Controls respect disabled state during form submission

### Form Integration

- ✅ Slider values update form state correctly
- ✅ Form validation works for all configuration fields
- ✅ Default values are set appropriately
- ✅ Form reset updates slider positions

### Keyboard Navigation

- ✅ Sliders support arrow key navigation
- ✅ Input field accepts keyboard input for max tokens
- ✅ Tab order is logical and accessible
- ✅ Screen readers can access current values and descriptions

### Unit Testing Requirements

- Test slider value changes update form state
- Test real-time description updates
- Test keyboard navigation for sliders
- Test max tokens input validation
- Test form integration with configuration values

## Dependencies

- Requires T-set-up-react-hook-form-with to be completed
- Uses existing ConfigurationSlider component
- Uses existing getSliderDescription utility
- Follows patterns from AgentsSection defaults tab

## Security Considerations

- Validate numeric ranges on both client and server
- Prevent injection through number inputs
- Ensure slider values stay within specified bounds
- Validate configuration values before submission

## Performance Considerations

- Slider movements should be smooth without lag
- Description updates should be immediate
- No performance impact from real-time updates
- Efficient form state management for numeric values
