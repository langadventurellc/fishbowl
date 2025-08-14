---
id: T-add-system-prompt-field-to
title: Add system prompt field to CreateRoleForm with validation integration
status: done
priority: high
parent: F-role-creation-form
prerequisites:
  - T-create-rolesystemprompttextare
affectedFiles:
  apps/desktop/src/components/settings/roles/CreateRoleForm.tsx:
    Already contains complete system prompt field implementation - import,
    defaultValues, and FormField with proper validation integration
  apps/desktop/src/components/settings/roles/RoleSystemPromptTextarea.tsx:
    Fully implemented system prompt textarea component with character counter,
    color thresholds, and accessibility features
  packages/ui-shared/src/schemas/roleSchema.ts: Contains proper systemPrompt
    validation schema with required, length limits, and whitespace validation
log:
  - System prompt field successfully integrated into CreateRoleForm component.
    All acceptance criteria verified and working correctly. The field is
    properly positioned after description field, includes comprehensive
    validation (1-5000 characters, required, whitespace check), features a
    character counter with color-coded feedback, and integrates seamlessly with
    react-hook-form and existing form patterns. Form submission properly
    includes systemPrompt data, edit mode pre-populates values correctly, and
    tab navigation flows properly through all fields.
schema: v1.0
childrenIds: []
created: 2025-08-12T21:38:05.573Z
updated: 2025-08-12T21:38:05.573Z
---

# Add System Prompt Field to CreateRoleForm

## Context

The `CreateRoleForm` component in `apps/desktop/src/components/settings/roles/CreateRoleForm.tsx` is missing the system prompt field. The form currently only has name and description fields, but needs to include the system prompt field to match the feature specification.

## Implementation Requirements

### Form Updates Required

1. **Import**: Add `RoleSystemPromptTextarea` component import
2. **Default Values**: Add `systemPrompt` to form defaultValues
3. **Form Field**: Add FormField for system prompt between description and actions
4. **Validation**: Ensure system prompt validation works with react-hook-form

### Specific Code Changes

#### Update Imports

```tsx
import { RoleSystemPromptTextarea } from "./RoleSystemPromptTextarea";
```

#### Update Default Values (line 57-60)

```tsx
defaultValues: {
  name: initialData?.name || "",
  description: initialData?.description || "",
  systemPrompt: initialData?.systemPrompt || "", // Add this line
},
```

#### Add System Prompt Field (after description field, before form actions)

```tsx
{
  /* System Prompt Field */
}
<FormField
  control={form.control}
  name="systemPrompt"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormControl>
        <RoleSystemPromptTextarea
          value={field.value}
          onChange={field.onChange}
          maxLength={5000}
          disabled={isSubmitting || isLoading}
          aria-describedby={
            fieldState.error ? `${field.name}-error` : undefined
          }
        />
      </FormControl>
      <FormMessage id={`${field.name}-error`} />
    </FormItem>
  )}
/>;
```

### Form Layout Updates

- Position system prompt field after description field
- Maintain consistent spacing with existing fields
- Ensure proper tab order: name → description → system prompt → buttons

### Validation Integration

- System prompt validation handled by updated `roleSchema`
- Error messages display below the textarea
- Form submission blocked if system prompt invalid
- Real-time validation feedback through react-hook-form

## Technical Approach

1. Open `apps/desktop/src/components/settings/roles/CreateRoleForm.tsx`
2. Add import for `RoleSystemPromptTextarea`
3. Update form `defaultValues` to include `systemPrompt`
4. Add `FormField` for system prompt after description field
5. Ensure proper spacing and styling consistency
6. Test form validation and submission

## Acceptance Criteria

- [ ] System prompt field appears in the form after description field
- [ ] Field is properly initialized with empty value or edit data
- [ ] Validation errors display correctly below the field
- [ ] Character counter functions properly (0/5000)
- [ ] Form submission includes system prompt data
- [ ] Tab navigation flows: name → description → system prompt → cancel → save
- [ ] Required field validation prevents submission when empty
- [ ] Edit mode properly pre-populates system prompt value

## Dependencies

- Requires `T-create-rolesystemprompttextare` to be completed first
- Uses updated schema from `T-update-role-schema-to-match`

## Security Considerations

- System prompt input validated through Zod schema
- Character length limits enforced client-side and in validation
- Input sanitization handled by form validation layer

## Testing Requirements

- Form renders with all three fields (name, description, system prompt)
- System prompt validation works correctly
- Form submission passes system prompt data to onSave callback
- Edit mode correctly populates system prompt from initialData
- Tab navigation works in correct order
- Form reset clears all fields including system prompt

## Integration Notes

- Follow the exact same pattern as name and description fields
- Maintain consistency with existing FormField structure
- Use same disabled state logic for system prompt field
- Ensure ARIA attributes work correctly with form validation
