---
kind: task
id: T-create-personality-name-input
parent: F-personalities-section
status: done
title: Create personality name input with validation
priority: normal
prerequisites: []
created: "2025-07-28T17:03:03.719275"
updated: "2025-07-28T21:45:00.865947"
schema_version: "1.1"
worktree: null
---

# Create Personality Name Input with Validation

## Context

Implement the personality name input field for the Create New tab with comprehensive validation, error handling, and user feedback to ensure quality personality names.

## Implementation Requirements

### Input Field Component

Create `PersonalityNameInput.tsx`:

- Use shadcn/ui Input component as foundation
- Label: "Personality Name" with proper accessibility
- Placeholder text: "Enter a unique name for this personality"
- Real-time validation feedback
- Error state styling and messaging

### Validation Rules

Implement client-side validation:

- **Required**: Cannot be empty or whitespace only
- **Length**: Minimum 2 characters, maximum 50 characters
- **Characters**: Alphanumeric, spaces, hyphens, underscores only
- **Uniqueness**: Cannot duplicate existing personality names
- **Profanity**: Basic content filtering (optional)

### Validation Implementation

```typescript
interface NameValidationResult {
  isValid: boolean;
  errors: string[];
}

const validatePersonalityName = (
  name: string,
  existingNames: string[],
): NameValidationResult => {
  const errors: string[] = [];

  if (!name.trim()) {
    errors.push("Personality name is required");
  }

  if (name.length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  if (name.length > 50) {
    errors.push("Name must be 50 characters or less");
  }

  if (existingNames.includes(name.trim())) {
    errors.push("A personality with this name already exists");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

### User Experience Features

- **Real-time validation**: Validate on blur and submit
- **Debounced feedback**: 300ms delay for real-time validation
- **Visual indicators**: Green check for valid, red X for invalid
- **Error messages**: Clear, actionable feedback below input
- **Character counter**: Show remaining characters (optional)

### Form Integration

- Integrate with overall personality form state
- Reset validation on form clear/reset
- Focus management for accessibility
- Form submission prevention when invalid

### Error Message Examples

- "Personality name is required"
- "Name must be at least 2 characters"
- "Name can only contain letters, numbers, spaces, hyphens, and underscores"
- "A personality with this name already exists"

## Acceptance Criteria

- [ ] Input field labeled "Personality Name" with proper accessibility
- [ ] Real-time validation with 300ms debounce
- [ ] Character length validation (2-50 characters)
- [ ] Uniqueness validation against existing personalities
- [ ] Clear error messages for all validation scenarios
- [ ] Visual feedback for valid/invalid states
- [ ] Form integration prevents submission when invalid
- [ ] Input accessible via keyboard navigation
- [ ] Error messages announced to screen readers

## Testing Requirements

- Unit tests for all validation scenarios
- Test real-time validation timing and debouncing
- Verify uniqueness checking works correctly
- Test form integration and submission prevention
- Accessibility testing for screen reader compatibility
- Edge case testing (empty strings, special characters, etc.)

## Dependencies

- shadcn/ui Input component
- Personality store for uniqueness validation
- Form state management utilities
- Validation utility functions
- Design system styling patterns

## Security Considerations

- Input sanitization to prevent XSS attacks
- Validation of special characters and encoding
- Protection against injection attempts
- Rate limiting for validation requests (if server-side)

## Performance Requirements

- Validation feedback feels immediate (< 100ms after debounce)
- Uniqueness checks optimized for large personality lists
- No unnecessary re-renders during typing
- Smooth transitions for validation states
- Efficient regex patterns for character validation

### Log

**2025-07-29T02:54:55.367310Z** - Implemented PersonalityNameInput component with comprehensive validation, visual feedback, and accessibility features. Enhanced personalitySchema with detailed validation rules including length (2-50 characters), character restrictions (alphanumeric, spaces, hyphens, underscores), whitespace validation, and uniqueness checking. Component features real-time validation with 300ms debounce, Check/X visual indicators, error messages, character counter, and screen reader announcements. Integrated with CreatePersonalityForm using react-hook-form pattern and connected to existing personality data for uniqueness validation. All quality checks pass.

- filesChanged: ["packages/shared/src/schemas/personalitySchema.ts", "apps/desktop/src/components/settings/PersonalityNameInput.tsx", "apps/desktop/src/components/settings/CreatePersonalityForm.tsx"]
