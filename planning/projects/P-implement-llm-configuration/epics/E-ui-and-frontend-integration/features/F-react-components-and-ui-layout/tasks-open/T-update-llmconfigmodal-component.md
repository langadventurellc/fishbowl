---
kind: task
id: T-update-llmconfigmodal-component
title:
  Update LlmConfigModal component with comprehensive provider support and service
  integration
status: open
priority: normal
prerequisites:
  - T-create-usellmconfig-react-hook
created: "2025-08-07T16:44:45.191345"
updated: "2025-08-07T16:44:45.191345"
schema_version: "1.1"
parent: F-react-components-and-ui-layout
---

# Update LlmConfigModal Component with Comprehensive Provider Support

## Context

The existing `LlmConfigModal` component needs to be updated to support all provider types (OpenAI, Anthropic), use shared types, and integrate with the service layer for validation and form handling.

## Current File Location

**File**: `apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx`

## Detailed Requirements

### Type System Updates

**Props Interface Update**

```typescript
// CURRENT: Uses local types and limited providers
interface LlmConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LlmConfigData & { id?: string }) => void;
  mode: "add" | "edit";
  provider: "openai" | "anthropic";
  initialData?: LlmConfigData & { id?: string };
}

// UPDATE TO: Use shared types and all providers
interface LlmConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LlmConfigInput) => Promise<void>;
  mode: "add" | "edit";
  provider: Provider;
  initialData?: Partial<LlmConfigInput>;
  isLoading?: boolean;
  error?: string | null;
}
```

### Provider Support Enhancement

**All Provider Support**

- **OpenAI**: API key field, optional baseUrl override
- **Anthropic**: API key field, optional baseUrl override

**Dynamic Form Fields**

```typescript
const getProviderFields = (provider: Provider) => {
  const common = ["customName", "apiKey"];

  switch (provider) {
    case Provider.OPENAI:
      return [...common, "baseUrl?", "useAuthHeader?"];
    case Provider.ANTHROPIC:
      return [...common, "baseUrl?", "useAuthHeader?"];
    default:
      return common;
  }
};
```

### Form Validation Integration

**Validation System**

- Use validation schemas from shared package
- Real-time validation feedback
- Provider-specific validation rules
- Integration with service layer validation

**Validation Implementation**

```typescript
import { validateLlmConfig } from "@fishbowl-ai/shared";

const validateForm = useCallback(
  (formData: Partial<LlmConfigInput>) => {
    if (!formData.customName || !formData.apiKey || !formData.provider) {
      return { isValid: false, errors: {} };
    }

    const result = validateLlmConfig(
      formData as LlmConfigInput,
      [],
      mode === "edit",
    );
    return {
      isValid: result.isValid,
      errors: result.errors.reduce(
        (acc, error) => ({
          ...acc,
          [error.field]: error.message,
        }),
        {},
      ),
    };
  },
  [mode],
);
```

### Provider-Specific Field Handling

**OpenAI Provider Fields**

- API key input with validation (sk- prefix)
- Optional baseUrl override with placeholder
- Optional useAuthHeader checkbox
- Help text explaining OpenAI-specific setup

**Anthropic Provider Fields**

- API key input with validation (sk-ant- prefix)
- Optional baseUrl override with placeholder
- Optional useAuthHeader checkbox
- Help text explaining Anthropic-specific setup

### Form Layout and UX

**Modal Structure**

```tsx
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>
        {mode === "add" ? "Add" : "Edit"} {getProviderLabel(provider)} Configuration
      </DialogTitle>
      <DialogDescription>
        {getProviderDescription(provider)}
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <FormField name="customName" {...} />
        <FormField name="apiKey" type="password" {...} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !isFormValid}>
          {isLoading ? "Saving..." : mode === "add" ? "Add" : "Update"}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### Form Field Components

**Custom Name Field**

- Required text input
- Character limit (1-100 chars per validation schema)
- Character counter display
- Real-time validation feedback

**API Key Field**

```tsx
<FormField>
  <FormLabel>API Key</FormLabel>
  <FormControl>
    <div className="relative">
      <Input
        type={showApiKey ? "text" : "password"}
        placeholder={getApiKeyPlaceholder(provider)}
        {...field}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0"
        onClick={() => setShowApiKey(!showApiKey)}
      >
        {showApiKey ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  </FormControl>
  <FormDescription>{getApiKeyHelpText(provider)}</FormDescription>
  <FormMessage />
</FormField>
```

**BaseUrl Field (Custom Provider)**

```tsx
<FormField>
  <FormLabel>
    Base URL
    {provider === Provider.CUSTOM && <span className="text-red-500">*</span>}
  </FormLabel>
  <FormControl>
    <Input type="url" placeholder="https://api.example.com/v1" {...field} />
  </FormControl>
  <FormDescription>
    {provider === Provider.CUSTOM
      ? "The base URL for your custom provider's API"
      : "Optional: Override the default API base URL"}
  </FormDescription>
  <FormMessage />
</FormField>
```

### Error Handling and Loading States

**Error Display**

```tsx
{
  error && (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Configuration Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
```

**Loading State Management**

- Disable form inputs during submission
- Show loading spinner on submit button
- Prevent modal close during submission
- Show progress indicators for long operations

### Provider-Specific Help Content

**Help Text System**

```typescript
const getProviderHelpText = (provider: Provider) => {
  switch (provider) {
    case Provider.OPENAI:
      return {
        apiKey:
          "Get your API key from https://platform.openai.com/account/api-keys",
        baseUrl: "Optional: Use a different endpoint (advanced users only)",
        description: "Configure OpenAI GPT models for conversations",
      };
    case Provider.ANTHROPIC:
      return {
        apiKey:
          "Get your API key from https://console.anthropic.com/account/keys",
        baseUrl: "Optional: Use a different endpoint (advanced users only)",
        description: "Configure Anthropic Claude models for conversations",
      };
  }
};
```

### Form State Management

**React Hook Form Integration**

```typescript
const form = useForm<LlmConfigInput>({
  resolver: zodResolver(llmConfigInputSchema),
  defaultValues: {
    customName: initialData?.customName || "",
    apiKey: initialData?.apiKey || "",
    provider,
    baseUrl: initialData?.baseUrl || "",
    useAuthHeader: initialData?.useAuthHeader || false,
  },
});
```

**Form Submission**

```typescript
const handleSubmit = async (data: LlmConfigInput) => {
  try {
    await onSave(data);
    form.reset();
  } catch (error) {
    // Error handled by parent component through props
  }
};
```

### Testing Requirements (Include in same task)

Create comprehensive test file: `apps/desktop/src/components/settings/llm-setup/__tests__/LlmConfigModal.test.tsx`

**Test Coverage**

- Modal open/close behavior
- Form rendering for all 4 provider types
- Form validation for each provider
- Form submission with valid data
- Error handling and display
- Loading state behavior
- Provider-specific field requirements
- Custom provider baseUrl requirement
- API key visibility toggle functionality

**Test Scenarios**

```typescript
describe("LlmConfigModal", () => {
  describe.each([Provider.OPENAI, Provider.ANTHROPIC])(
    "Provider: %s",
    (provider) => {
      it("renders correct form fields", () => {});
      it("validates provider-specific requirements", () => {});
      it("submits form with correct data structure", () => {});
    },
  );

  it("requires baseUrl for custom provider", () => {});
  it("handles form submission errors", () => {});
  it("shows loading state during submission", () => {});
});
```

## Acceptance Criteria

✅ Modal supports all 4 provider types with appropriate fields
✅ Uses `LlmConfigInput` type from shared package
✅ Integrates with shared validation schemas
✅ Provider-specific field requirements enforced
✅ Custom provider requires baseUrl field
✅ Real-time form validation with user feedback
✅ Proper error handling and display
✅ Loading states during form submission
✅ API key field with visibility toggle
✅ Character limits and input validation
✅ Provider-specific help text and guidance
✅ Accessibility compliant form structure
✅ Responsive modal design
✅ Comprehensive unit tests with >90% coverage
✅ Integration with parent component callbacks
✅ Form state properly managed and reset

### Log
