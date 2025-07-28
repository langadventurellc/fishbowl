---
kind: task
id: T-create-comprehensive-personality
title: Create comprehensive personality form with validation
status: open
priority: normal
prerequisites:
  - T-add-all-14-behavior-sliders-with
created: "2025-07-28T17:05:28.482355"
updated: "2025-07-28T17:05:28.482355"
schema_version: "1.1"
parent: F-personalities-section
---

# Create Comprehensive Personality Form with Validation

## Context

Integrate all personality form components (name input, Big Five sliders, behavior sliders, custom instructions) into a cohesive Create New tab form with comprehensive validation and state management.

## Implementation Requirements

### Form Component Structure

Create `CreatePersonalityForm.tsx` that combines all components:

```typescript
interface CreatePersonalityFormProps {
  initialData?: Partial<Personality>; // For edit mode
  onSave: (personality: PersonalityFormData) => Promise<void>;
  onCancel: () => void;
  isEditMode?: boolean;
}
```

### Form State Management

Implement comprehensive form state with React Hook Form or similar:

```typescript
interface PersonalityFormState {
  name: string;
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  behaviors: {
    [key: string]: number; // All 14 behavior traits
  };
  customInstructions: string;
  isSubmitting: boolean;
  errors: ValidationErrors;
}
```

### Comprehensive Form Validation

Implement multi-level validation:

**Name Validation**

- Required field validation
- Character length (2-50 characters)
- Uniqueness checking against existing personalities
- Special character restrictions

**Slider Validation**

- All Big Five values within 0-100 range
- All behavior values within 0-100 range
- Type validation (must be numbers)

**Custom Instructions Validation**

- Maximum length validation (500 characters)
- Basic content filtering
- Optional but recommended field

**Overall Form Validation**

- Form completeness checking
- Cross-field validation rules
- Real-time validation feedback
- Submit prevention when invalid

### User Experience Features

- **Auto-save drafts**: Periodic save to localStorage
- **Unsaved changes warning**: Confirmation before navigation
- **Real-time validation**: Immediate feedback on field changes
- **Progressive validation**: Show errors only after user interaction
- **Form reset**: Clear all fields and reset to defaults
- **Loading states**: Visual feedback during save operations

### Error Handling and Feedback

- **Field-level errors**: Individual field validation messages
- **Form-level errors**: Overall form validation feedback
- **Submit errors**: Server/save operation error handling
- **Success feedback**: Confirmation of successful saves
- **Retry mechanisms**: Allow retry on failed saves

### Edit Mode Support

When editing existing personalities:

- Pre-populate all form fields with existing data
- Change form title to "Edit Personality"
- Update save button text to "Update Personality"
- Handle partial updates efficiently
- Preserve original creation timestamp

### Form Layout and Organization

```tsx
<form className="personality-form">
  <FormHeader isEditMode={isEditMode} />

  <PersonalityNameInput
    value={formData.name}
    onChange={handleNameChange}
    errors={errors.name}
  />

  <BigFiveSliders values={formData.bigFive} onChange={handleBigFiveChange} />

  <BehaviorSlidersSection
    behaviors={formData.behaviors}
    onChange={handleBehaviorChange}
  />

  <CustomInstructionsTextarea
    value={formData.customInstructions}
    onChange={handleInstructionsChange}
    errors={errors.customInstructions}
  />

  <FormActions
    onSave={handleSubmit}
    onCancel={onCancel}
    isValid={isFormValid}
    isSubmitting={isSubmitting}
  />
</form>
```

### Form Actions Implementation

- **Save Button**: Primary action with loading states
- **Cancel Button**: Secondary action with unsaved changes warning
- **Reset Button**: Clear form to defaults (optional)
- **Preview Button**: Show personality preview (optional)

## Acceptance Criteria

- [ ] Form integrates all personality components seamlessly
- [ ] Comprehensive validation works across all form fields
- [ ] Real-time validation provides immediate user feedback
- [ ] Edit mode pre-populates form with existing personality data
- [ ] Auto-save drafts prevent data loss during form completion
- [ ] Unsaved changes warning protects against accidental navigation
- [ ] Form submission handles both create and update operations
- [ ] Loading states provide clear feedback during save operations
- [ ] Error handling covers all failure scenarios with helpful messages
- [ ] Form reset functionality returns to default state

## Testing Requirements

- Unit tests for form state management and validation
- Integration tests combining all form components
- Test edit mode with pre-populated data
- Validate auto-save and draft recovery functionality
- Test unsaved changes warning behavior
- Error handling tests for various failure scenarios
- Accessibility testing for form navigation and submission
- Performance testing with complex form interactions

## Dependencies

- PersonalityNameInput from T-create-personality-name-input
- BigFiveSliders from T-implement-big-five-personality
- BehaviorSlidersSection from T-add-all-14-behavior-sliders-with
- CustomInstructionsTextarea from T-create-custom-instructions
- Form validation library (React Hook Form, Formik, etc.)
- localStorage utilities for draft saving

## Security Considerations

- Input sanitization across all form fields
- Validation of all user inputs before processing
- Protection against form injection attacks
- Secure handling of localStorage data
- Prevention of malicious personality data

## Performance Requirements

- Form interactions feel responsive (< 100ms)
- Validation feedback appears immediately
- Auto-save operations don't block user interactions
- Efficient re-renders during form state changes
- Smooth transitions between create/edit modes

### Log
