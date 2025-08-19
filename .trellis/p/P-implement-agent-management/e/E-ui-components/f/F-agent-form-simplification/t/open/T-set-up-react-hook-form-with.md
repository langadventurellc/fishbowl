---
id: T-set-up-react-hook-form-with
title: Set up React Hook Form with Zod validation schema
status: open
priority: high
parent: F-agent-form-simplification
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-19T18:24:24.958Z
updated: 2025-08-19T18:24:24.958Z
---

# Set up React Hook Form with Zod validation schema

## Context

This task establishes the foundation for the AgentForm refactoring by implementing React Hook Form with comprehensive Zod validation. The current AgentForm component is just a stub returning null, so this task will create the complete form infrastructure.

## Detailed Implementation Requirements

### Form Setup

- Replace the stub AgentForm component with a proper form implementation
- Use `useForm` hook from react-hook-form with `zodResolver`
- Set up the form with `mode: "onChange"` for real-time validation
- Implement proper TypeScript types for form data

### Zod Schema Implementation

Create a comprehensive validation schema as specified in the feature requirements:

```typescript
const agentSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  model: z.string().min(1, "Model is required"),
  role: z.string().min(1, "Role is required"),
  personality: z.string().min(1, "Personality is required"),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(4000),
  topP: z.number().min(0).max(1),
  systemPrompt: z
    .string()
    .max(5000, "System prompt cannot exceed 5000 characters")
    .optional(),
});
```

### Form Structure

- Use shadcn/ui Form components (Form, FormField, FormItem, FormControl, FormMessage)
- Set up proper form submission handling with loading states
- Implement form reset functionality
- Add proper ARIA labels and accessibility attributes

## Technical Implementation

### Files to Modify

- `apps/desktop/src/components/settings/agents/AgentForm.tsx`
- Update imports in `apps/desktop/src/components/settings/agents/index.ts` if needed

### Dependencies to Use

- Existing patterns from `CreateRoleForm.tsx` and `PersonalityForm.tsx`
- React Hook Form with zodResolver
- shadcn/ui form components
- Zod validation schema

### Key Implementation Steps

1. Import required dependencies (useForm, zodResolver, Form components)
2. Define the agentSchema with proper validation rules and error messages
3. Set up the useForm hook with proper configuration
4. Create basic form structure with Form wrapper
5. Add form submission handler with loading state management
6. Implement form reset and cancel functionality
7. Add proper TypeScript types for the form data

## Acceptance Criteria

### Form Validation

- ✅ Form validates all fields according to schema rules
- ✅ Error messages display inline for invalid fields
- ✅ Form submission is prevented when validation fails
- ✅ Real-time validation occurs as user types (onChange mode)

### Form State Management

- ✅ Form properly tracks dirty state for unsaved changes
- ✅ Loading states display during form operations
- ✅ Form can be reset to original values
- ✅ Form submission calls provided onSave handler

### Form Structure

- ✅ Uses shadcn/ui Form components consistently
- ✅ Proper ARIA labels and accessibility attributes
- ✅ Error messages are descriptive and user-friendly
- ✅ Form layout follows existing patterns from roles/personalities

### Unit Testing Requirements

- Test form validation for each field type
- Test form submission with valid/invalid data
- Test form reset functionality
- Test error message display
- Test loading state behavior

## Dependencies

- Requires F-selection-components to be completed (prerequisite)
- Uses existing validation patterns from roles and personalities

## Security Considerations

- Validate all inputs against schema before submission
- Sanitize text inputs to prevent injection attacks
- Ensure numeric inputs are properly bounded
- Don't expose internal validation errors to user

## Notes

- Follow the patterns established in CreateRoleForm and PersonalityForm
- Use existing utilities for form handling and validation
- Keep the implementation focused on form infrastructure - UI enhancements come in subsequent tasks
