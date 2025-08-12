---
id: F-role-creation-form
title: Role Creation Form
status: open
priority: medium
parent: E-settings-ui-components-and
prerequisites:
  - F-roles-store-integration
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T16:43:07.756Z
updated: 2025-08-12T16:43:07.756Z
---

# Role Creation Form Feature

## Purpose and Functionality

Implement a fully functional role creation form that allows users to define new roles with name, description, and system prompt fields. The form should provide an intuitive interface with real-time validation, proper error handling, and seamless integration with the roles store for persistence.

## Key Components to Implement

### RoleFormModal Component

- Modal dialog for role creation
- Form layout with proper field organization
- Submit and cancel buttons with appropriate actions
- Loading state during save operations

### Form Field Components

- RoleNameInput: Text input with character limit (1-100 chars)
- RoleDescriptionTextarea: Expandable textarea (max 500 chars)
- RoleSystemPromptTextarea: Large textarea for AI instructions (1-5000 chars)
- Character counters for each field

### Form State Management

- Controlled components with React state
- Form validation on field change and submit
- Dirty state tracking for unsaved changes
- Reset form on successful submission

## Detailed Acceptance Criteria

### Form Layout Requirements

- [ ] Modal opens centered with backdrop overlay
- [ ] Form fields arranged vertically with clear labels
- [ ] Required fields marked with asterisk (\*)
- [ ] Character count displays below each field (e.g., "45/100")
- [ ] Submit button disabled when form invalid
- [ ] Cancel button always enabled

### Field Specifications

- [ ] **Name Field**: Required, 1-100 characters, no special characters except dash/underscore
- [ ] **Description Field**: Optional, max 500 characters, supports line breaks
- [ ] **System Prompt Field**: Required, 1-5000 characters, preserves formatting
- [ ] **Character Counters**: Show current/max, change color near limit (yellow at 80%, red at 95%)

### Validation Requirements

- [ ] Real-time validation as user types (debounced)
- [ ] Name uniqueness check against existing roles
- [ ] Clear error messages below invalid fields
- [ ] Form-level validation before submission
- [ ] Validation errors from store displayed appropriately

### User Experience

- [ ] Focus on first field when modal opens
- [ ] Tab navigation between fields works correctly
- [ ] Enter key in single-line fields moves to next field
- [ ] Escape key closes modal with confirmation if dirty
- [ ] Success feedback after role creation
- [ ] Modal closes automatically on successful save

## Technical Requirements

### Form Implementation

- Use controlled components pattern
- Implement custom hooks for form state if needed
- Leverage existing form components where available
- Type-safe form data with TypeScript interfaces

### Validation Logic

- Client-side validation before API calls
- Async validation for name uniqueness
- Debounce validation to avoid excessive checks
- Display validation state visually (red border, error text)

### Store Integration

- Call store.createRole with validated data
- Handle success/error responses appropriately
- Show loading state during async operations
- Update UI optimistically for better UX

## Dependencies

- Requires F-roles-store-integration for data persistence
- Uses existing modal and form components from UI library
- Follows validation patterns from other forms in app

## Testing Requirements

- Test all field validations work correctly
- Verify form submission with valid data
- Confirm error handling for store failures
- Test keyboard navigation and accessibility
- Validate character counters update correctly
- Test modal closure scenarios

## Implementation Guidance

### Form Structure Example

```tsx
<RoleFormModal>
  <form onSubmit={handleSubmit}>
    <RoleNameInput
      value={formData.name}
      onChange={handleNameChange}
      error={errors.name}
      maxLength={100}
    />
    <RoleDescriptionTextarea
      value={formData.description}
      onChange={handleDescriptionChange}
      maxLength={500}
    />
    <RoleSystemPromptTextarea
      value={formData.systemPrompt}
      onChange={handlePromptChange}
      error={errors.systemPrompt}
      maxLength={5000}
    />
    <DialogFooter>
      <Button variant="ghost" onClick={handleCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={!isValid}>
        Create Role
      </Button>
    </DialogFooter>
  </form>
</RoleFormModal>
```

### Validation Patterns

- Use Zod schema from ui-shared for consistency
- Implement custom validators for specific rules
- Show inline errors immediately on blur
- Batch validation for performance

## Security Considerations

- Sanitize all input before saving to store
- Prevent script injection in text fields
- Validate field lengths on client and store level
- Escape special characters appropriately

## Performance Requirements

- Form renders within 50ms of modal open
- Validation completes within 100ms
- Character counters update instantly (<16ms)
- No lag during typing in large text areas
