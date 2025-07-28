---
kind: task
id: T-add-form-validation-with-error
title: Add form validation with error states and user feedback
status: open
priority: normal
prerequisites:
  - T-implement-api-keys-main-section
created: "2025-07-27T22:23:58.261354"
updated: "2025-07-27T22:23:58.261354"
schema_version: "1.1"
parent: F-api-keys-section-implementation
---

# Add Form Validation and Error States

## Context

Enhance the API Keys section with comprehensive form validation, error states, and user feedback using the Zod schemas defined in the provider configuration system.

## Implementation Requirements

### Enhanced ProviderCard Component

Update `ProviderCard.tsx` to display validation errors and visual feedback:

```tsx
interface ProviderCardProps {
  // ... existing props
  errors?: {
    apiKey?: string;
    baseUrl?: string;
  };
  isValidating?: boolean;
}
```

### Validation Integration in ApiKeysSettings

Update `ApiKeysSettings.tsx` to implement form validation:

```tsx
import { ApiKeySchema, type ApiKeysFormData } from "./providers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const ApiKeysSettings: React.FC = () => {
  const {
    formState: { errors },
    watch,
    trigger,
    getValues,
  } = useForm<ApiKeysFormData>({
    resolver: zodResolver(ApiKeySchema),
    mode: "onChange",
  });

  // Real-time validation on input changes
  const validateProvider = async (providerId: string, field: string) => {
    await trigger(`${providerId}.${field}` as any);
  };

  // Enhanced state update with validation
  const updateProviderState = async (
    providerId: string,
    updates: Partial<ProviderState>,
  ) => {
    setProviderStates((prev) => ({
      ...prev,
      [providerId]: { ...prev[providerId], ...updates },
    }));

    // Trigger validation for changed fields
    if (updates.apiKey !== undefined) {
      await validateProvider(providerId, "apiKey");
    }
    if (updates.baseUrl !== undefined) {
      await validateProvider(providerId, "baseUrl");
    }
  };
};
```

### Error Display Components

Add error message components to ProviderCard:

```tsx
const ErrorMessage: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;

  return (
    <p className="text-sm text-destructive mt-1" role="alert">
      {message}
    </p>
  );
};
```

### Visual Error States

Implement visual feedback for validation errors:

- **Input Border**: Red border for invalid inputs using `border-destructive`
- **Error Messages**: Display below invalid inputs with red text
- **Status Indicators**: Show error state with red X icon when validation fails
- **Focus Management**: Maintain proper focus on invalid inputs

### Validation Rules Implementation

#### API Key Validation

- **Required Field**: Show error if API key is entered but too short
- **Minimum Length**: Provider-specific minimum length (10 characters)
- **Real-time Validation**: Validate as user types with debounced validation
- **Error Messages**: "API key too short" or "Please enter a valid API key"

#### Base URL Validation

- **URL Format**: Must be valid URL format
- **HTTPS Requirement**: Must start with "https://"
- **Real-time Validation**: Validate on blur and change events
- **Error Messages**: "Invalid URL format" or "Base URL must use HTTPS"

### Loading and Validation States

Add visual feedback for form operations:

```tsx
interface ValidationState {
  isValidating: boolean;
  hasErrors: boolean;
  touchedFields: Set<string>;
}
```

### User Experience Enhancements

#### Error Prevention

- **Input Constraints**: Prevent invalid characters where possible
- **Format Hints**: Show format examples in placeholder text
- **Progressive Disclosure**: Only show advanced validation after user interaction

#### Accessibility

- **ARIA Attributes**: `aria-invalid`, `aria-describedby` for error associations
- **Screen Reader Support**: Proper error announcements
- **Focus Management**: Focus invalid fields when validation fails
- **Color Independence**: Use both color and text for error indication

### Test Button Validation

Enhance test button to validate before "testing":

```tsx
const handleTest = async (providerId: string) => {
  const isValid = await trigger(providerId as any);

  if (!isValid) {
    updateProviderState(providerId, { status: "error" });
    return;
  }

  // Simulate test with visual feedback
  updateProviderState(providerId, { status: "connected" });
};
```

### Acceptance Criteria

- [ ] API key inputs show red border and error message when validation fails
- [ ] Base URL inputs validate URL format and HTTPS requirement
- [ ] Error messages appear below invalid inputs with proper styling
- [ ] Real-time validation triggers on input change with appropriate debouncing
- [ ] Status indicators reflect validation state (red X for errors)
- [ ] Test button validates form data before simulating test
- [ ] Form prevents submission with invalid data
- [ ] ARIA attributes properly associate errors with inputs
- [ ] Error messages are descriptive and user-friendly
- [ ] Unit tests verify all validation scenarios work correctly

### Error Message Guidelines

- **API Key Errors**: "API key must be at least 10 characters long"
- **Base URL Errors**: "Please enter a valid HTTPS URL"
- **Required Field**: "This field is required"
- **Format Errors**: "Invalid format. Please check your input"

### Performance Considerations

- **Debounced Validation**: Avoid excessive validation during rapid typing
- **Selective Re-rendering**: Only re-render components with validation changes
- **Efficient Error State**: Minimize state updates during validation

### Dependencies

- React Hook Form for form state management
- Zod resolver for validation integration
- Existing ProviderCard and provider configuration system
- shadcn/ui form components for consistent styling

### Log
