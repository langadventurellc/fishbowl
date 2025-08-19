---
id: F-agent-form-simplification
title: Agent Form Simplification
status: done
priority: medium
parent: E-ui-components
prerequisites:
  - F-selection-components
affectedFiles:
  apps/desktop/src/components/settings/agents/AgentForm.tsx: Replaced stub
    component with complete React Hook Form implementation using zodResolver,
    comprehensive field validation, character counters, loading states, and
    unsaved changes detection; Updated imports to include RoleSelect and
    PersonalitySelect components, replaced Input field for role with RoleSelect
    component using FormField and Controller integration, replaced Input field
    for personality with PersonalitySelect component using the same pattern,
    ensuring consistent component integration with proper placeholder text and
    disabled state handling; Updated name field and system prompt field to
    include character counters positioned in label area using flex layout, added
    maxLength attributes (100 for name, 5000 for system prompt), and implemented
    real-time updates using form.watch(); Updated temperature and topP sliders
    to use shadcn/ui Slider component with real-time descriptions. Updated
    maxTokens input formatting and description display. Added proper imports for
    getSliderDescription utility. All controls now show current values with
    descriptive text that updates immediately as users interact with them.;
    Implemented unsaved changes detection with ConfirmationDialog component,
    added state management for dialog visibility, updated cancel and save
    handlers to properly manage form dirty state and reset behavior; Reorganized
    form layout into logical sections, updated button variants and text, removed
    unused variable, and ensured proper JSX structure
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-add-character-counters-for
  - T-add-comprehensive-form-layout
  - T-implement-configuration
  - T-implement-unsaved-changes
  - T-integrate-modelselect
  - T-set-up-react-hook-form-with
created: 2025-08-19T16:00:24.428Z
updated: 2025-08-19T16:00:24.428Z
---

## Purpose and Functionality

Refactor the existing AgentForm component to use the new selection components (ModelSelect, RoleSelect, PersonalitySelect), implementing proper form validation with React Hook Form and Zod, and adding UI enhancements like character counters and real-time configuration descriptions. This simplification will make the form more maintainable and consistent with established patterns.

## Key Components to Update

### AgentForm Component Refactoring

- Replace inline dropdown logic with ModelSelect component
- Replace role selection with RoleSelect component
- Replace personality selection with PersonalitySelect component
- Implement React Hook Form with Zod validation
- Add character counters for name and system prompt fields
- Add real-time descriptions for configuration sliders
- Implement unsaved changes detection
- Clean separation of concerns - no direct data fetching

### Form Field Enhancements

- Name field with character counter (2-100 characters)
- System prompt with character counter (max 5000 characters)
- Temperature slider with descriptive text (0-2, step 0.1)
- Max tokens input with validation (1-4000)
- Top P slider with descriptive text (0-1, step 0.01)

## Detailed Acceptance Criteria

### Form Structure

- ✅ Uses ModelSelect, RoleSelect, PersonalitySelect components
- ✅ Form validation with React Hook Form and Zod schema
- ✅ All fields properly connected to form state
- ✅ Error messages displayed inline for invalid fields
- ✅ Submit button disabled when form is invalid
- ✅ Loading state during save operations

### Character Counters

- ✅ Display current/max characters for name field
- ✅ Display current/max characters for system prompt
- ✅ Update in real-time as user types
- ✅ Visual indication when approaching limit
- ✅ Prevent input beyond maximum length

### Configuration Sliders

- ✅ Temperature slider shows descriptive text based on value
- ✅ Top P slider shows descriptive text based on value
- ✅ Sliders update form state immediately
- ✅ Visual feedback for current values
- ✅ Keyboard navigation support for sliders

### Unsaved Changes Detection

- ✅ Track when form has been modified
- ✅ Show confirmation dialog on cancel if changes exist
- ✅ Clear dirty state after successful save
- ✅ Reset form to original values on cancel (after confirmation)

## Technical Requirements

### Validation Schema

```typescript
const agentSchema = z.object({
  name: z.string().min(2).max(100),
  model: z.string().min(1),
  role: z.string().min(1),
  personality: z.string().min(1),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(4000),
  topP: z.number().min(0).max(1),
  systemPrompt: z.string().max(5000).optional(),
});
```

### Form Integration

- Use `useForm` hook from react-hook-form
- Connect Zod schema with `zodResolver`
- Use `Controller` components for custom inputs
- Implement `formState.isDirty` for unsaved changes

### Dependencies

- Selection components from previous feature
- React Hook Form
- Zod validation
- Existing slider utilities (getSliderDescription)
- shadcn/ui form components

## Implementation Guidance

1. **Start by updating imports** to use the new selection components
2. **Set up React Hook Form** with Zod schema validation
3. **Replace existing dropdown logic** with selection components one at a time
4. **Add character counters** using the form watch functionality
5. **Implement unsaved changes** detection using formState.isDirty
6. **Test form validation** thoroughly before integration
7. **Follow patterns** from RoleFormModal and PersonalityFormModal

## Testing Requirements

- Test form validation for all fields
- Test character counter updates and limits
- Test slider value changes and descriptions
- Test unsaved changes dialog behavior
- Test form reset on cancel
- Test successful form submission
- Test error state handling

## Security Considerations

- Validate all inputs against schema before submission
- Sanitize system prompt text to prevent injection
- Ensure model/role/personality selections are valid IDs
- Don't expose internal IDs in error messages

## Performance Requirements

- Form validation should be instant (< 50ms)
- Character counters update without lag
- Slider movements smooth and responsive
- No unnecessary re-renders of selection components
