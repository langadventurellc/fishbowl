---
kind: task
id: T-update-llmsetupsection-component
parent: F-react-components-and-ui-layout
status: done
title:
  Update LlmSetupSection component with service integration and full provider
  support
priority: high
prerequisites:
  - T-create-usellmconfig-react-hook
created: "2025-08-07T16:43:24.444214"
updated: "2025-08-07T17:18:47.902415"
schema_version: "1.1"
worktree: null
---

# Update LlmSetupSection Component with Service Integration

## Context

The existing `LlmSetupSection` component uses local state and only supports OpenAI and Anthropic providers. This task updates it to use the new `useLlmConfig` hook and support all provider types (OpenAI, Anthropic, Google, Custom).

## Current Implementation Issues

**File**: `apps/desktop/src/components/settings/llm-setup/LlmSetupSection.tsx`

**Problems to Fix**:

- Uses local `useState` instead of service layer
- Custom `LlmProviderConfig` type instead of shared types
- Only supports "openai" | "anthropic" providers
- Hardcoded provider enum instead of using shared `Provider` enum
- No integration with actual persistence layer

## Detailed Requirements

### Type System Updates

**Remove Custom Types**

```typescript
// REMOVE this custom interface:
interface LlmProviderConfig extends LlmConfigData {
  id: string;
  provider: "openai" | "anthropic";
}
```

**Use Shared Types**

```typescript
// IMPORT from shared package:
import type {
  LlmConfig,
  LlmConfigInput,
  LlmConfigMetadata,
  Provider,
} from "@fishbowl-ai/shared";
```

### Hook Integration

**Replace Local State**

```typescript
// REMOVE:
const [configuredApis, setConfiguredApis] = useState<LlmProviderConfig[]>([]);

// REPLACE WITH:
const {
  configurations,
  isLoading,
  error,
  createConfiguration,
  updateConfiguration,
  deleteConfiguration,
  clearError,
} = useLlmConfig();
```

### Provider Support Enhancement

**Extend Provider Support**

- Support all 4 provider types: OpenAI, Anthropic, Google, Custom
- Update modal state to use `Provider` enum instead of hardcoded strings
- Update provider selection UI to show all options
- Handle provider-specific field requirements (Custom needs baseUrl)

**Modal State Updates**

```typescript
const [modalState, setModalState] = useState<{
  isOpen: boolean;
  mode: "add" | "edit";
  provider: Provider;
  editingId?: string;
  initialData?: LlmConfigInput & { id?: string };
}>({
  isOpen: false,
  mode: "add",
  provider: Provider.OPENAI, // Use enum
});
```

### Component Integration

**Loading States**

- Show loading spinner during data operations
- Disable actions during async operations
- Provide visual feedback for all CRUD operations

**Error Handling**

- Display service layer errors to users
- Provide error dismissal functionality
- Show validation errors from service layer
- Handle network/service failures gracefully

**Empty State Updates**

- Update `EmptyLlmState` props to support all providers
- Pass provider selection handler properly
- Ensure consistent styling and messaging

### CRUD Operation Updates

**Create Configuration**

```typescript
const handleSaveApi = useCallback(
  async (data: LlmConfigInput & { id?: string }) => {
    try {
      if (modalState.mode === "edit" && modalState.editingId) {
        await updateConfiguration(modalState.editingId, data);
      } else {
        await createConfiguration(data);
      }
      setModalState((prev) => ({ ...prev, isOpen: false }));
    } catch (error) {
      // Error handled by hook
    }
  },
  [
    modalState.mode,
    modalState.editingId,
    createConfiguration,
    updateConfiguration,
  ],
);
```

**Edit Configuration**

- Use `LlmConfigMetadata` type for configuration data
- Properly map metadata to form initial data
- Handle all provider types in edit mode
- Support provider-specific fields

**Delete Configuration**

- Use service layer delete operation
- Provide proper confirmation dialog
- Handle delete errors appropriately

## UI/UX Enhancements

### Provider Selection

- Add Google and Custom provider options
- Update provider icons and labels
- Show provider-specific field requirements
- Provide helpful descriptions for each provider

### Loading and Error States

```tsx
{
  error && (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-700">{error}</p>
      <button onClick={clearError} className="text-red-500 underline">
        Dismiss
      </button>
    </div>
  );
}

{
  isLoading && (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner />
      <span className="ml-2">Loading configurations...</span>
    </div>
  );
}
```

### Responsive Design

- Ensure grid layout works with more providers
- Maintain mobile responsiveness
- Keep consistent spacing and alignment

## Provider-Specific Requirements

### Google Provider

- Support Google API key format validation
- Handle Google-specific configuration fields
- Provide appropriate help text and examples

### Custom Provider

- Require baseUrl field for custom providers
- Validate URL format
- Provide guidance on custom provider setup
- Support various authentication methods

### Provider Icons

- Add Google provider icon
- Add generic custom provider icon
- Ensure consistent icon sizing and styling

## Security Considerations

- Never display actual API keys in the component
- Use masked display for API key previews (last 4 chars)
- Sanitize error messages for security
- Follow existing security patterns

## Testing Requirements (Include in same task)

Update existing test file: `apps/desktop/src/components/settings/llm-setup/__tests__/LlmSetupSection.test.tsx`

**Test Coverage**

- Component rendering with configurations
- Empty state display and interactions
- Modal open/close behavior for all providers
- CRUD operations through hook integration
- Error state display and dismissal
- Loading state behavior
- Provider-specific field requirements

**Mock Strategy**

- Mock `useLlmConfig` hook returns
- Test both loading and loaded states
- Verify proper hook method calls
- Test error handling scenarios

## Accessibility Requirements

- Maintain ARIA labels for all interactive elements
- Ensure keyboard navigation works properly
- Provide screen reader compatibility
- Focus management in modal interactions
- Error announcements for screen readers

## Performance Optimizations

- Use React.memo if needed for performance
- Optimize re-renders with proper dependencies
- Efficient handling of configuration lists
- Minimize unnecessary hook calls

## Acceptance Criteria

✅ Component uses `useLlmConfig` hook instead of local state
✅ Supports all 4 provider types (OpenAI, Anthropic, Google, Custom)
✅ Uses shared types from `@fishbowl-ai/shared` package
✅ Proper loading states during async operations
✅ Comprehensive error handling and display
✅ Updated modal state management for all providers
✅ Provider-specific field requirements handled correctly
✅ Maintains existing UI/UX patterns and responsiveness
✅ Unit tests updated with >90% coverage
✅ Accessibility requirements met
✅ No API keys exposed in component state
✅ Integration with service layer working properly

### Log

**2025-08-08T01:44:21.966516Z** - Successfully updated LlmSetupSection component with service integration and full provider support. The component now uses the useLlmConfig hook instead of local state, supports all four provider types (OpenAI, Anthropic, Google, Custom), includes comprehensive error handling, and maintains proper loading states. All quality checks pass and comprehensive test coverage achieved.

- filesChanged: ["packages/ui-shared/src/types/settings/LlmProviderCardProps.ts", "packages/ui-shared/src/types/settings/LlmConfigModalProps.ts", "packages/ui-shared/src/types/settings/LlmConfigData.ts", "apps/desktop/src/components/settings/llm-setup/GoogleProviderFields.tsx", "apps/desktop/src/components/settings/llm-setup/CustomProviderFields.tsx", "apps/desktop/src/components/settings/llm-setup/LlmSetupSection.tsx", "apps/desktop/src/components/settings/llm-setup/EmptyLlmState.tsx", "apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx", "apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx", "apps/desktop/src/components/settings/llm-setup/index.ts", "apps/desktop/src/components/settings/llm-setup/__tests__/LlmSetupSection.test.tsx"]
