---
kind: task
id: T-update-llmconfigmodal-component
parent: F-react-components-and-ui-layout
status: done
title:
  Update LlmConfigModal component with comprehensive provider support and service
  integration
priority: normal
prerequisites:
  - T-create-usellmconfig-react-hook
created: "2025-08-07T16:44:45.191345"
updated: "2025-08-07T23:26:09.216176"
schema_version: "1.1"
worktree: null
---

# Update LlmConfigModal Component with Enhanced Service Integration

## Context

The existing `LlmConfigModal` component needs enhanced integration with shared types, validation, and better async handling while preserving the existing provider-specific component architecture. The current separate `OpenAiProviderFields` and `AnthropicProviderFields` components provide good composability and should be maintained.

## Current File Locations

**Main Component**: `apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx`
**Provider Components**: `OpenAiProviderFields.tsx` and `AnthropicProviderFields.tsx` (keep existing)

## Detailed Requirements

### Enhanced Props Interface

**Props Interface Update** (in `packages/ui-shared/src/types/settings/LlmConfigModalProps.ts`)

```typescript
// UPDATE TO: Enhanced async handling and error states
interface LlmConfigModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: Provider;
  mode?: "add" | "edit";
  initialData?: Partial<LlmConfigInput> & { id?: string };
  onSave: (data: LlmConfigInput & { id?: string }) => Promise<void>;
  isLoading?: boolean; // NEW: Loading state for async operations
  error?: string | null; // NEW: Error display support
  existingConfigs?: Array<{ id: string; customName: string }>; // NEW: For validation
}
```

### Shared Types Integration

**Import Shared Types and Validation**

```typescript
import type { Provider, LlmConfigInput } from "@fishbowl-ai/shared";
import { llmConfigInputSchema, validateLlmConfig } from "@fishbowl-ai/shared";
```

**Update Local Form Schema**

- Replace local `llmConfigSchema` with `llmConfigInputSchema` from shared package
- Update form type from `LlmConfigFormData` to `LlmConfigInput`
- Maintain backward compatibility by exporting type alias

### Real-time Validation Integration

**Enhanced Validation System**

- Use `llmConfigInputSchema` for form validation resolver
- Add real-time validation using `validateLlmConfig` from shared package
- Support existing configuration duplicate name checking
- Display validation feedback alongside form errors

**Implementation Approach**

```typescript
// Watch form values for real-time validation
const watchedValues = form.watch();

useEffect(() => {
  if (watchedValues.customName || watchedValues.apiKey) {
    const result = validateLlmConfig(
      { ...watchedValues, provider },
      existingConfigs || [],
      mode === "edit",
    );

    // Update validation error state for immediate feedback
    setValidationErrors(result.errors || {});
  }
}, [watchedValues, existingConfigs, mode, provider]);
```

### Enhanced Custom Name Field

**Character Counter and Validation**

- Add character counter display (current/max)
- Show validation errors inline
- Enforce 100-character limit from shared schema
- Provide real-time feedback

```tsx
<FormField
  control={form.control}
  name="customName"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>
        Custom Name <span className="text-red-500">*</span>
      </FormLabel>
      <FormControl>
        <Input
          {...field}
          placeholder={`e.g., My ${providerName} API`}
          className={cn(fieldState.error && "border-red-500")}
          autoComplete="off"
          maxLength={100}
        />
      </FormControl>
      <FormDescription>
        {field.value?.length || 0}/100 characters
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Provider Component Architecture

**Maintain Existing Structure**

- Keep `OpenAiProviderFields` component for OpenAI-specific fields
- Keep `AnthropicProviderFields` component for Anthropic-specific fields
- Enhance both components with shared validation and improved UX
- Preserve composability for future provider additions

### Enhanced Error Display and Loading States

**Error Alert Component**

Add error display at the top of the modal when `error` prop is provided:

```tsx
{
  /* Error Display */
}
{
  error && (
    <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">Configuration Error</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
      </div>
    </div>
  );
}
```

**Enhanced Submit Button**

```tsx
<Button
  type="submit"
  disabled={isLoading || !form.formState.isValid}
  className="gap-2"
>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : mode === "add" ? (
    "Add Configuration"
  ) : (
    "Update Configuration"
  )}
</Button>
```

### Async Form Submission Handling

**Enhanced Save Handler**

Update form submission to handle async operations properly:

```typescript
const handleSave = useCallback(
  async (data: LlmConfigInput) => {
    try {
      // Include ID when editing
      const saveData =
        mode === "edit" && initialData?.id
          ? { ...data, id: initialData.id }
          : data;

      await onSave(saveData);
      // Only close if save succeeds
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent component through error prop
      // Modal stays open to show validation errors
      console.error("Save failed:", error);
    }
  },
  [onSave, onOpenChange, mode, initialData?.id],
);
```

### Provider Component Enhancement

**Update Provider Field Components**

While keeping the existing separate components, enhance them with:

1. **OpenAiProviderFields.tsx** and **AnthropicProviderFields.tsx**:
   - Update type imports to use `LlmConfigInput` instead of `LlmConfigFormData`
   - Maintain existing field structure and behavior
   - Ensure proper validation integration

2. **Shared Provider Utilities** (create if needed):

   ```typescript
   // Utility functions for provider-specific behavior
   export const getApiKeyPlaceholder = (provider: Provider): string => {
     switch (provider) {
       case "openai":
         return "sk-...";
       case "anthropic":
         return "sk-ant-...";
       default:
         return "Enter your API key";
     }
   };

   export const getApiKeyHelpText = (provider: Provider): string => {
     switch (provider) {
       case "openai":
         return "Get your API key from https://platform.openai.com/account/api-keys";
       case "anthropic":
         return "Get your API key from https://console.anthropic.com/account/keys";
       default:
         return "Enter your provider's API key";
     }
   };
   ```

### Form State Management Updates

**React Hook Form Integration**

```typescript
// Update form initialization to use shared schema
const form = useForm({
  resolver: zodResolver(llmConfigInputSchema), // Use shared schema
  mode: "onChange", // Enable real-time validation
  defaultValues: {
    customName: initialData?.customName || "",
    apiKey: initialData?.apiKey || "",
    provider,
    baseUrl: initialData?.baseUrl || getDefaultBaseUrl,
    useAuthHeader: initialData?.useAuthHeader ?? true,
  },
});
```

### Testing Requirements

**Enhanced Test Coverage** - Update existing tests and add new ones:

- Modal rendering with new props (`isLoading`, `error`, `existingConfigs`)
- Error display component functionality
- Loading state behavior on submit button
- Real-time validation feedback
- Character counter functionality
- Async form submission handling
- Form stays open on save failure
- Integration with shared validation

**Key Test Scenarios**

```typescript
describe("LlmConfigModal", () => {
  describe("Enhanced Features", () => {
    it("displays error when error prop provided", () => {});
    it("shows loading state during submission", () => {});
    it("keeps modal open when save fails", () => {});
    it("shows character counter for custom name", () => {});
    it("provides real-time validation feedback", () => {});
  });

  describe.each(["openai", "anthropic"])("Provider: %s", (provider) => {
    it("renders provider-specific fields correctly", () => {});
    it("submits with correct data structure", () => {});
  });
});
```

## Acceptance Criteria

✅ **Shared Types Integration**: Uses `LlmConfigInput` type and `llmConfigInputSchema` from shared package  
✅ **Enhanced Props Interface**: Supports `isLoading`, `error`, and `existingConfigs` props for better UX  
✅ **Real-time Validation**: Integrates `validateLlmConfig` for immediate user feedback  
✅ **Error Display**: Shows configuration errors in alert component when provided  
✅ **Loading States**: Submit button shows loading spinner and is disabled during async operations  
✅ **Enhanced Custom Name Field**: Shows character counter (x/100) and validation feedback  
✅ **Async Form Submission**: Proper error handling that keeps modal open on failure  
✅ **Provider Component Architecture**: Maintains separate `OpenAiProviderFields` and `AnthropicProviderFields` components  
✅ **Backward Compatibility**: Exports `LlmConfigFormData` type alias for existing code  
✅ **Form State Management**: Uses shared schema for validation resolver  
✅ **Comprehensive Testing**: Updated tests cover new features and error scenarios  
✅ **Accessibility**: Maintains existing ARIA attributes and keyboard shortcuts

## Implementation Notes

1. **Preserve Composability**: The existing provider-specific components provide excellent composability for future provider additions. Do not consolidate into a single component.

2. **Incremental Enhancement**: Focus on enhancing the modal's integration capabilities while keeping the proven architectural patterns.

3. **Type Safety**: Use shared types throughout but maintain backward compatibility where needed.

4. **User Experience**: The new async handling, error display, and loading states significantly improve the user experience during configuration operations.

### Log

**2025-08-08T04:37:41.913272Z** - Successfully updated LlmConfigModal component with comprehensive provider support, enhanced UX, and service integration. Implemented all required features including real-time validation, error display, loading states, and character counters.

- filesChanged: ["packages/ui-shared/src/types/settings/LlmConfigModalProps.ts", "apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx", "apps/desktop/src/components/settings/llm-setup/OpenAiProviderFields.tsx", "apps/desktop/src/components/settings/llm-setup/AnthropicProviderFields.tsx"]
