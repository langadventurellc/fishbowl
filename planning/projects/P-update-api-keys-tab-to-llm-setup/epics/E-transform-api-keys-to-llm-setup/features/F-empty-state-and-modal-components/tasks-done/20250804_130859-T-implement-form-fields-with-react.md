---
kind: task
id: T-implement-form-fields-with-react
parent: F-empty-state-and-modal-components
status: done
title: Implement form fields with React Hook Form integration
priority: normal
prerequisites:
  - T-create-llmconfigmodal-with
created: "2025-08-04T12:15:01.214236"
updated: "2025-08-04T13:01:16.553405"
schema_version: "1.1"
worktree: null
---

## Context

Implement the form fields within LlmConfigModal using React Hook Form. This includes custom name input, API key field with show/hide toggle, base URL field, and authorization header checkbox.

## Technical Approach

1. Integrate React Hook Form in LlmConfigModal
2. Create form fields using shadcn/ui Input and Checkbox components
3. Implement show/hide toggle for API key field
4. Set provider-specific default values for base URL

## Implementation Details

### Form Schema:

```tsx
interface LlmConfigFormData {
  customName: string;
  apiKey: string;
  baseUrl: string;
  useAuthHeader: boolean;
}
```

### Form Fields:

1. **Custom Name Field**:
   - Text input with placeholder "e.g., My ChatGPT API"
   - Required for save (handled by React Hook Form)

2. **API Key Field**:
   - Password input type by default
   - Toggle button with Eye/EyeOff icons from lucide-react
   - Toggle changes input type between "password" and "text"
   - Placeholder: "Enter your API key"

3. **Base URL Field**:
   - Text input with provider-specific defaults
   - OpenAI: "https://api.openai.com/v1"
   - Anthropic: "https://api.anthropic.com"

4. **Authorization Header Checkbox**:
   - Label: "Send API key in authorization header"
   - Unchecked by default

### Reference Implementation:

- Study password toggle in `apps/desktop/src/components/settings/ProviderCard.tsx`
- Use Form components from `apps/desktop/src/components/ui/form.tsx`
- Follow React Hook Form patterns from existing forms

## Acceptance Criteria

- [ ] Form uses React Hook Form with proper TypeScript types
- [ ] Custom name field has correct placeholder and is required
- [ ] API key field toggles between password/text with Eye icons
- [ ] Base URL shows provider-specific defaults
- [ ] Checkbox for auth header works correctly
- [ ] Form submission passes all field values to onSave
- [ ] No validation errors (accept any input)
- [ ] Accessibility: proper labels and ARIA attributes
- [ ] Show/hide toggle has screen reader announcements

## Testing Requirements

No tests!

## Security Considerations

- API key field must default to password type
- No logging of API key values
- Form accepts any input without validation

## Dependencies

This task depends on T-create-llmconfigmodal-with being completed first to have the modal structure ready.

### Log

**2025-08-04T18:08:59.839005Z** - Form fields with React Hook Form integration are fully implemented in LlmConfigModal.tsx. All required fields are present: custom name input with placeholder "e.g., My ChatGPT API", API key field with show/hide toggle using Eye/EyeOff icons, base URL field with provider-specific defaults (OpenAI: https://api.openai.com/v1, Anthropic: https://api.anthropic.com), and authorization header checkbox. The form uses React Hook Form with proper TypeScript types, shadcn/ui components, and includes accessibility features like proper labels and ARIA attributes. Keyboard shortcuts work correctly (Ctrl/Cmd+S to save). Form validation was removed to accept any input as specified in the requirements. All quality checks pass successfully.

- filesChanged: ["apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx"]
