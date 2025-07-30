---
kind: task
id: T-create-createroleform-component
parent: F-roles-section-implementation
status: done
title: Create CreateRoleForm component with validation and character limits
priority: normal
prerequisites:
  - T-create-role-interfaces-and
  - T-implement-custom-roles-zustand
created: "2025-07-29T11:01:37.242062"
updated: "2025-07-29T12:18:51.389660"
schema_version: "1.1"
worktree: null
---

# Create CreateRoleForm Component with Validation and Character Limits

## Context

Implement the role creation and editing form component using React Hook Form, Zod validation, and shadcn/ui form components. The form will handle both creation and editing modes with real-time validation and character count feedback.

## Technical Approach

### 1. Create CreateRoleForm Component

**File: `apps/desktop/src/components/settings/CreateRoleForm.tsx`**

Implement form using shadcn/ui Form components:

```tsx
interface CreateRoleFormProps {
  mode: "create" | "edit";
  initialData?: Partial<RoleFormData>;
  onSave: (data: RoleFormData) => void;
  onCancel: () => void;
  existingRoles?: CustomRole[];
  isLoading?: boolean;
}

export const CreateRoleForm = ({
  mode,
  initialData,
  onSave,
  onCancel,
  existingRoles,
  isLoading,
}: CreateRoleFormProps) => {
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: initialData || { name: "", description: "" },
  });

  // Form implementation with validation
};
```

### 2. Implement Form Fields

**Form structure:**

- **Name Field**: Input with 50 character limit and character counter
- **Description Field**: Textarea with 200 character limit and character counter
- Real-time validation with error messages
- Unique name validation (case-insensitive)

### 3. Add Character Count Displays

**Character counter requirements:**

- Live character count for both name and description fields
- Format: "25/50 characters" or similar
- Warning state when approaching limits (80% of max)
- Error state when exceeding limits
- Visual styling consistent with existing forms

### 4. Implement Form Actions

**Action buttons:**

- Save button (primary) - disabled when form invalid or unchanged
- Cancel button (secondary) - shows confirmation if unsaved changes
- Loading states with spinner icons
- Proper keyboard navigation and accessibility

### 5. Add Form Validation

**Validation requirements:**

- Real-time validation using Zod schema
- Unique name checking against existing roles (excluding current when editing)
- Clear, helpful error messages
- Field-level validation with visual indicators
- Form-level validation preventing submission of invalid data

## Detailed Acceptance Criteria

### Form Fields and Validation

- [ ] Name field validates in real-time with 1-50 character requirement
- [ ] Description field validates with 1-200 character requirement
- [ ] Name uniqueness validation works for both create and edit modes
- [ ] Validation error messages are clear and actionable
- [ ] Fields show validation state with proper visual indicators (red border, etc.)

### Character Counters

- [ ] Character counters update in real-time as user types
- [ ] Counter format shows current/max characters clearly
- [ ] Warning state appears at 80% of character limit (amber color)
- [ ] Error state appears when limit exceeded (red color)
- [ ] Counters positioned consistently with existing form patterns

### Form Behavior

- [ ] Save button disabled when form is invalid or unchanged from initial state
- [ ] Cancel button shows confirmation dialog if form has unsaved changes
- [ ] Form handles both create and edit modes correctly
- [ ] Loading states prevent double-submission and show progress
- [ ] Form resets properly after successful save or cancel

### Accessibility

- [ ] All form fields have proper labels and ARIA attributes
- [ ] Error messages are announced by screen readers
- [ ] Character counters have proper ARIA live regions
- [ ] Form navigation works correctly with keyboard-only input
- [ ] Focus management handles form submission and error states

### Integration

- [ ] Form integrates correctly with custom roles Zustand store
- [ ] Validation schema matches shared package role schema
- [ ] Component follows existing form patterns from personality forms
- [ ] Props interface supports all required use cases

### Error Handling

- [ ] Network errors during save operations are handled gracefully
- [ ] Form validation errors prevent invalid submissions
- [ ] Server-side validation errors are displayed appropriately
- [ ] Form state recovers correctly from error conditions
- [ ] User can retry failed operations without losing form data

### Testing Requirements

- [ ] Unit tests for form rendering and validation logic
- [ ] Integration tests with role schema validation
- [ ] Tests for character counter behavior and limits
- [ ] Accessibility tests for form navigation and announcements
- [ ] Tests for unique name validation with edge cases

## Implementation Notes

- Use React Hook Form with zodResolver for validation
- Follow existing form patterns from CreatePersonalityForm
- Use shadcn/ui Form, FormField, Input, Textarea, Button components
- Implement proper error boundaries for resilience

## Dependencies

- Requires: T-create-role-interfaces-and (RoleFormData type and validation schema)
- Requires: T-implement-custom-roles-zustand (store integration for unique name checking)

## Security Considerations

- Validate all input data on both client and schema level
- Sanitize form inputs to prevent XSS attacks
- Implement proper CSRF protection for form submissions
- Ensure error messages don't leak sensitive information

### Log

**2025-07-29T17:26:58.019715Z** - Implemented CreateRoleForm component with comprehensive validation, character limits, and accessibility features. The form supports both create and edit modes with real-time validation, character counters, and integrates with the custom roles Zustand store for unique name validation. Built using React Hook Form, Zod validation, and shadcn/ui components following established patterns from personality forms.

- filesChanged: ["apps/desktop/src/components/settings/RoleNameInput.tsx", "apps/desktop/src/components/settings/RoleDescriptionTextarea.tsx", "apps/desktop/src/components/settings/CreateRoleForm.tsx"]
