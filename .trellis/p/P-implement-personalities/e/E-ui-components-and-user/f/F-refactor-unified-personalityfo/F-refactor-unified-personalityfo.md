---
id: F-refactor-unified-personalityfo
title: Refactor Unified PersonalityForm
status: in-progress
priority: medium
parent: E-ui-components-and-user
prerequisites:
  - F-remove-tab-navigation-and
affectedFiles:
  packages/ui-shared/src/types/settings/PersonalityFormModalProps.ts:
    Created new interface file with PersonalityFormModalProps following
    RoleFormModalProps pattern
  packages/ui-shared/src/types/settings/__tests__/PersonalityFormModalProps.test.ts:
    Added comprehensive unit tests for interface type checking and import
    validation
  packages/ui-shared/src/types/settings/CreatePersonalityFormProps.ts:
    "Updated interface to match CreateRoleFormProps pattern: added mode prop
    (create|edit), changed initialData type to PersonalityViewModel, added
    existingPersonalities and isLoading props, enhanced JSDoc documentation with
    usage examples and default value information"
log: []
schema: v1.0
childrenIds:
  - T-create-personalityformmodal
  - T-integrate-personalityformmodal
  - T-refactor-createpersonalityform
  - T-remove-localstorage-logic
  - T-update-tests-and-cleanup-for
  - T-create-personalityformmodalpro
  - T-update-createpersonalityformpr
created: 2025-08-17T14:17:39.713Z
updated: 2025-08-17T14:17:39.713Z
---

# Refactor CreatePersonalityForm to Unified PersonalityForm

## Purpose and Goals

Transform the existing CreatePersonalityForm component into a unified PersonalityForm that handles both create and edit modes. Remove all localStorage draft logic and connect directly to the personalities store while maintaining the existing Big Five sliders and behavior traits functionality.

## Key Components to Implement

### PersonalityForm Refactoring

- Rename `CreatePersonalityForm` to `PersonalityForm`
- Add `mode` prop to distinguish create vs edit
- Accept `personality` prop for edit mode pre-population
- Remove ALL localStorage draft saving/loading code
- Keep Big Five personality sliders (0-100 range)
- Keep behavior trait sliders
- Keep custom instructions textarea (500 char limit)
- Add proper form submission handlers for both modes

### Form State Management

- Use local state for form values (no localStorage)
- Implement controlled components for all inputs
- Add form validation matching existing rules
- Handle reset for new personality creation
- Pre-populate values in edit mode

### Integration Points

- Connect to store's `createPersonality` action
- Connect to store's `updatePersonality` action
- Handle loading states during save
- Display validation errors appropriately
- Emit success/cancel events to parent

## Detailed Acceptance Criteria

### Form Functionality

- [ ] Form works in both create and edit modes
- [ ] All localStorage code completely removed
- [ ] No draft saving functionality remains
- [ ] Form validates before submission
- [ ] Reset button clears form in create mode
- [ ] Cancel button closes form without saving
- [ ] Save button creates/updates personality

### Field Requirements

- [ ] Name field (required, 1-50 characters)
- [ ] Big Five sliders maintain 0-100 range
- [ ] All five traits present: openness, conscientiousness, extraversion, agreeableness, neuroticism
- [ ] Behavior trait sliders work as before
- [ ] Custom instructions textarea (optional, max 500 chars)
- [ ] Character counter for custom instructions
- [ ] All fields properly labeled

### Validation Rules

- [ ] Name is required and within character limits
- [ ] Big Five values constrained to 0-100
- [ ] Behavior values constrained to 0-100
- [ ] Custom instructions under 500 characters
- [ ] Error messages clear and helpful
- [ ] Validation triggers on submit
- [ ] Inline validation for character limits

### Edit Mode Behavior

- [ ] Form pre-populates with existing personality data
- [ ] Title shows "Edit Personality" vs "Create Personality"
- [ ] Save button shows "Update" vs "Create"
- [ ] Changes only save on explicit submission
- [ ] Cancel discards unsaved changes

## Implementation Guidance

### Form Props Interface

```typescript
interface PersonalityFormProps {
  mode: "create" | "edit";
  personality?: PersonalityViewModel;
  onSave: (personality: PersonalityFormData) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}
```

### State Management Pattern

```typescript
const PersonalityForm = ({ mode, personality, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FormData>(() =>
    mode === "edit" && personality
      ? mapPersonalityToForm(personality)
      : getDefaultFormData(),
  );

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Remove all localStorage logic
  // No useEffect for draft saving
  // Direct form submission to store
};
```

### Big Five Sliders Configuration

```typescript
const bigFiveTraits = [
  {
    key: "openness",
    label: "Openness",
    description: "Creativity and openness to experience",
  },
  {
    key: "conscientiousness",
    label: "Conscientiousness",
    description: "Organization and dependability",
  },
  {
    key: "extraversion",
    label: "Extraversion",
    description: "Sociability and energy",
  },
  {
    key: "agreeableness",
    label: "Agreeableness",
    description: "Cooperation and trust",
  },
  {
    key: "neuroticism",
    label: "Neuroticism",
    description: "Emotional stability",
  },
];
```

## Testing Requirements

- Form renders in both create and edit modes
- Validation prevents invalid submissions
- Edit mode pre-populates correctly
- No localStorage references remain
- Sliders update values correctly
- Character limits enforced
- Form resets properly after creation

## Security Considerations

- Sanitize custom instructions input
- Validate all numeric ranges
- Prevent XSS in name field
- Handle long strings gracefully

## Dependencies

- **F-remove-tab-navigation-and**: Needs restructured parent component to integrate with
