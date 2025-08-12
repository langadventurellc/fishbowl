---
id: F-form-validation-and-ux
title: Form Validation and UX Enhancement
status: open
priority: medium
parent: E-settings-ui-components-and
prerequisites:
  - F-role-creation-form
  - F-role-editing-functionality
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T16:45:18.615Z
updated: 2025-08-12T16:45:18.615Z
---

# Form Validation and UX Enhancement Feature

## Purpose and Functionality

Implement comprehensive form validation with real-time feedback, helpful error messages, and smooth user experience patterns. This feature ensures data integrity through client-side validation while providing clear guidance to users when errors occur, including field-level validation, form-level validation, and async validation for uniqueness checks.

## Key Components to Implement

### Validation Infrastructure

- Real-time field validation with debouncing
- Form-level validation on submit
- Async validation for name uniqueness
- Custom validation messages for each error type

### Visual Feedback Systems

- Error states with red borders and icons
- Success states with green indicators
- Warning states for approaching limits
- Character counters with color coding

### User Experience Enhancements

- Inline error messages below fields
- Tooltip help text for complex fields
- Progressive disclosure of validation rules
- Smart focus management on errors

## Detailed Acceptance Criteria

### Field-Level Validation

- [ ] **Name validation**: Required, 1-100 chars, alphanumeric plus dash/underscore
- [ ] **Description validation**: Optional, max 500 chars, no HTML/scripts
- [ ] **System prompt validation**: Required, 1-5000 chars, preserves formatting
- [ ] **Real-time feedback**: Validation triggers on blur and during typing (debounced)
- [ ] **Error messages**: Specific, actionable messages for each validation rule

### Visual Validation States

- [ ] **Error state**: Red border, red error text, error icon
- [ ] **Success state**: Green checkmark when field valid (optional)
- [ ] **Warning state**: Yellow indicator when approaching character limit
- [ ] **Neutral state**: Default styling when field untouched
- [ ] **Focus state**: Clear indication of active field

### Character Counter Behavior

- [ ] Shows "0/100" format below text fields
- [ ] Updates in real-time as user types
- [ ] Changes color: neutral (0-79%), warning (80-94%), danger (95-100%)
- [ ] Prevents typing beyond maximum length
- [ ] Shows remaining characters when near limit

### Async Validation (Name Uniqueness)

- [ ] Triggers after user stops typing (500ms debounce)
- [ ] Shows loading spinner during check
- [ ] Displays error if name already exists
- [ ] Excludes current role name during edit
- [ ] Handles network errors gracefully

### Error Message Guidelines

- [ ] Position: Below field, aligned left
- [ ] Style: Small text, red color, with icon
- [ ] Content: Specific and actionable
- [ ] Examples:
  - "Role name is required"
  - "Role name must be between 1 and 100 characters"
  - "A role with this name already exists"
  - "System prompt cannot be empty"

## Technical Requirements

### Validation Schema Integration

```typescript
const roleValidation = {
  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Only letters, numbers, dash, and underscore allowed",
    ),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  systemPrompt: z
    .string()
    .min(1, "System prompt is required")
    .max(5000, "System prompt must be less than 5000 characters"),
};
```

### Debouncing Implementation

- Use debounce hook for real-time validation
- 300ms delay for normal fields
- 500ms delay for async validation
- Immediate validation on submit

### Error Display Component

```tsx
<FormField>
  <Label>Role Name *</Label>
  <Input
    value={name}
    onChange={handleChange}
    className={errors.name ? "border-red-500" : ""}
  />
  <CharacterCounter current={name.length} max={100} />
  {errors.name && (
    <ErrorMessage icon="alert-circle">{errors.name}</ErrorMessage>
  )}
</FormField>
```

## Dependencies

- Integrates with F-role-creation-form
- Integrates with F-role-editing-functionality
- Uses validation schemas from ui-shared
- Requires store for uniqueness checks

## Testing Requirements

- Test each validation rule triggers correctly
- Verify error messages display appropriately
- Confirm character counters work accurately
- Test debouncing delays are correct
- Validate async uniqueness check
- Test form submission with various error states

## Implementation Guidance

### Validation Hook Pattern

```typescript
const useRoleValidation = (formData, mode) => {
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(
    debounce((field, value) => {
      // Validation logic
    }, 300),
    [],
  );

  return { errors, isValidating, validateField };
};
```

### Character Counter Component

```tsx
const CharacterCounter = ({ current, max, threshold = 0.8 }) => {
  const percentage = current / max;
  const colorClass =
    percentage >= 0.95
      ? "text-red-500"
      : percentage >= threshold
        ? "text-yellow-500"
        : "text-gray-500";

  return (
    <span className={`text-xs ${colorClass}`}>
      {current}/{max}
    </span>
  );
};
```

## Security Considerations

- Sanitize all input on client side
- Validate length limits strictly
- Prevent HTML/script injection
- Double-validate on store operations

## Performance Requirements

- Validation completes within 50ms
- Debouncing prevents excessive validation calls
- Character counters update instantly
- No UI lag during typing
