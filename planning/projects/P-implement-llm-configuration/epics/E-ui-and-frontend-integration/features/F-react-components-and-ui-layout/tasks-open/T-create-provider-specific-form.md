---
kind: task
id: T-create-provider-specific-form
title: Create provider-specific form field components for Google and Custom providers
status: open
priority: low
prerequisites:
  - T-update-llmconfigmodal-component
created: "2025-08-07T16:46:21.035819"
updated: "2025-08-07T16:46:21.035819"
schema_version: "1.1"
parent: F-react-components-and-ui-layout
---

# Create Provider-Specific Form Field Components

## Context

To complete the comprehensive provider support, we need to create form field components for Google and Custom providers, complementing the existing OpenAI and Anthropic provider field components.

## Current Implementation Analysis

**Existing Files:**

- `apps/desktop/src/components/settings/llm-setup/OpenAiProviderFields.tsx` ✅ Exists
- `apps/desktop/src/components/settings/llm-setup/AnthropicProviderFields.tsx` ✅ Exists
- `apps/desktop/src/components/settings/llm-setup/GoogleProviderFields.tsx` ❌ Missing
- `apps/desktop/src/components/settings/llm-setup/CustomProviderFields.tsx` ❌ Missing

## Detailed Requirements

### GoogleProviderFields Component

**File Location**: `apps/desktop/src/components/settings/llm-setup/GoogleProviderFields.tsx`

**Component Interface**

```typescript
interface GoogleProviderFieldsProps {
  form: UseFormReturn<LlmConfigInput>;
  isLoading?: boolean;
}

export const GoogleProviderFields: React.FC<GoogleProviderFieldsProps> = ({
  form,
  isLoading = false,
}) => {
  // Component implementation
};
```

**Field Specifications**

- **API Key Field**: Required, with Google AI Studio key format validation
- **useAuthHeader Field**: Optional checkbox (typically false for Google)
- **baseUrl Field**: Hidden by default, show in "Advanced" section if needed

**Google-Specific Features**

```tsx
<div className="space-y-4">
  <FormField
    control={form.control}
    name="apiKey"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Google AI Studio API Key</FormLabel>
        <FormControl>
          <div className="relative">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder="AIza..."
              disabled={isLoading}
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
        <FormDescription>
          Get your API key from{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Google AI Studio
          </a>
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="useAuthHeader"
    render={({ field }) => (
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <FormLabel className="text-base">Use Authorization Header</FormLabel>
          <FormDescription>
            Send API key in Authorization header instead of query parameter
          </FormDescription>
        </div>
        <FormControl>
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={isLoading}
          />
        </FormControl>
      </FormItem>
    )}
  />

  <Collapsible>
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="sm">
        Advanced Options <ChevronDownIcon className="w-4 h-4 ml-2" />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent className="space-y-4 mt-4">
      <FormField
        control={form.control}
        name="baseUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Custom Base URL (Optional)</FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder="https://generativelanguage.googleapis.com/v1beta"
                disabled={isLoading}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Override the default Google AI API endpoint (advanced users only)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </CollapsibleContent>
  </Collapsible>
</div>
```

### CustomProviderFields Component

**File Location**: `apps/desktop/src/components/settings/llm-setup/CustomProviderFields.tsx`

**Component Interface**

```typescript
interface CustomProviderFieldsProps {
  form: UseFormReturn<LlmConfigInput>;
  isLoading?: boolean;
}

export const CustomProviderFields: React.FC<CustomProviderFieldsProps> = ({
  form,
  isLoading = false,
}) => {
  // Component implementation
};
```

**Field Specifications**

- **API Key Field**: Required, flexible format validation
- **Base URL Field**: Required, must be valid URL
- **useAuthHeader Field**: Optional checkbox with explanation
- **Help and Documentation**: Comprehensive guidance for custom setup

**Custom Provider Features**

```tsx
<div className="space-y-4">
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex gap-3">
      <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5" />
      <div className="text-sm">
        <h4 className="font-medium text-blue-900">Custom Provider Setup</h4>
        <p className="text-blue-700">
          Custom providers must be compatible with the OpenAI API format.
          Popular options include LocalAI, Ollama, and other OpenAI-compatible
          services.
        </p>
      </div>
    </div>
  </div>

  <FormField
    control={form.control}
    name="apiKey"
    render={({ field }) => (
      <FormItem>
        <FormLabel>API Key</FormLabel>
        <FormControl>
          <div className="relative">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder="Enter your custom provider's API key"
              disabled={isLoading}
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
        <FormDescription>
          The API key for your custom provider (format varies by provider)
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="baseUrl"
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          Base URL <span className="text-red-500">*</span>
        </FormLabel>
        <FormControl>
          <Input
            type="url"
            placeholder="https://api.yourprovider.com/v1"
            disabled={isLoading}
            {...field}
          />
        </FormControl>
        <FormDescription>
          The base URL for your custom provider's OpenAI-compatible API
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="useAuthHeader"
    render={({ field }) => (
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <FormLabel className="text-base">Use Authorization Header</FormLabel>
          <FormDescription>
            Send API key in Authorization header instead of query parameter
          </FormDescription>
        </div>
        <FormControl>
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={isLoading}
          />
        </FormControl>
      </FormItem>
    )}
  />

  <Collapsible>
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="sm">
        Setup Examples <ChevronDownIcon className="w-4 h-4 ml-2" />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent className="space-y-4 mt-4">
      <div className="space-y-3">
        <h4 className="font-medium">Popular Custom Providers:</h4>
        <div className="space-y-2 text-sm">
          <div className="p-3 bg-gray-50 rounded">
            <strong>LocalAI:</strong> http://localhost:8080/v1
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <strong>Ollama:</strong> http://localhost:11434/v1
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <strong>LM Studio:</strong> http://localhost:1234/v1
          </div>
        </div>
      </div>
    </CollapsibleContent>
  </Collapsible>
</div>
```

### Update Existing Provider Components

**Ensure Consistency**
Review and update existing OpenAI and Anthropic components to:

- Use the same prop interface (`UseFormReturn<LlmConfigInput>`)
- Follow the same design patterns
- Include loading state handling
- Use shared validation patterns
- Maintain consistent styling

**Common Pattern Extraction**
Create shared utilities for common field patterns:

```typescript
// apps/desktop/src/components/settings/llm-setup/shared/ProviderFieldUtils.tsx

export const ApiKeyField: React.FC<ApiKeyFieldProps> = ({
  form,
  provider,
  placeholder,
  helpText,
  isLoading
}) => {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <FormField
      control={form.control}
      name="apiKey"
      render={({ field }) => (
        <FormItem>
          <FormLabel>API Key</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder={placeholder}
                disabled={isLoading}
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
          <FormDescription>{helpText}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
```

### Integration with Main Modal

**Dynamic Component Loading**
Update the `LlmConfigModal` to dynamically render the appropriate provider fields:

```tsx
const renderProviderFields = () => {
  switch (provider) {
    case Provider.OPENAI:
      return <OpenAIProviderFields form={form} isLoading={isLoading} />;
    case Provider.ANTHROPIC:
      return <AnthropicProviderFields form={form} isLoading={isLoading} />;
    case Provider.GOOGLE:
      return <GoogleProviderFields form={form} isLoading={isLoading} />;
    case Provider.CUSTOM:
      return <CustomProviderFields form={form} isLoading={isLoading} />;
    default:
      return null;
  }
};
```

### Validation Integration

**Provider-Specific Validation**
Each component should work with the validation schemas from the shared package:

```typescript
// Google provider validation
const googleApiKeySchema = z.string().regex(/^AIza[0-9A-Za-z-_]{35}$/, {
  message: "Invalid Google AI Studio API key format",
});

// Custom provider validation
const customProviderSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url("Base URL must be a valid URL"),
});
```

### Testing Requirements (Include in same task)

**Test Files to Create:**

- `apps/desktop/src/components/settings/llm-setup/__tests__/GoogleProviderFields.test.tsx`
- `apps/desktop/src/components/settings/llm-setup/__tests__/CustomProviderFields.test.tsx`

**Test Coverage**

- Field rendering and form integration
- Validation behavior for each provider
- Loading state handling
- API key visibility toggle
- Help text and documentation display
- Advanced options collapsible behavior
- Form submission with provider-specific data

**Test Implementation**

```typescript
describe("GoogleProviderFields", () => {
  it("renders all required fields", () => {});
  it("validates Google API key format", () => {});
  it("toggles API key visibility", () => {});
  it("shows advanced options when expanded", () => {});
  it("handles loading state correctly", () => {});
});

describe("CustomProviderFields", () => {
  it("requires baseUrl field", () => {});
  it("validates URL format for baseUrl", () => {});
  it("shows setup examples in collapsible section", () => {});
  it("handles flexible API key formats", () => {});
});
```

### Barrel Export Updates

Update `apps/desktop/src/components/settings/llm-setup/index.ts`:

```typescript
export { GoogleProviderFields } from "./GoogleProviderFields";
export { CustomProviderFields } from "./CustomProviderFields";
export { OpenAIProviderFields } from "./OpenAiProviderFields";
export { AnthropicProviderFields } from "./AnthropicProviderFields";
// ... other exports
```

## Acceptance Criteria

✅ GoogleProviderFields component created with proper Google AI integration
✅ CustomProviderFields component created with flexible custom provider support
✅ Both components use shared form patterns and validation
✅ Provider-specific help text and documentation included
✅ API key visibility toggle functionality working
✅ Advanced options properly collapsible where appropriate
✅ Required field validation (baseUrl for custom provider)
✅ Loading state support throughout components
✅ Consistent styling and UX patterns with existing components
✅ Integration with LlmConfigModal working properly
✅ Comprehensive unit tests for both components
✅ Barrel export file updated with new components
✅ Provider-specific validation schemas integrated
✅ Accessibility requirements met (ARIA labels, keyboard navigation)
✅ Responsive design working on all screen sizes

### Log
