---
kind: task
id: T-create-usellmconfig-react-hook
title: Create useLlmConfig React hook for service integration
status: open
priority: high
prerequisites: []
created: "2025-08-07T16:42:48.790362"
updated: "2025-08-07T16:42:48.790362"
schema_version: "1.1"
parent: F-react-components-and-ui-layout
---

# Create useLlmConfig React Hook for Service Integration

## Context

The existing LLM setup components are using local state and need to be connected to the completed business logic and service layer. This task creates the React hook that will provide data access patterns for all LLM configuration UI components.

## Detailed Requirements

### Implementation Location

- **File**: `apps/desktop/src/hooks/useLlmConfig.ts`
- **Pattern**: Follow existing hook patterns in the desktop app
- **Integration**: Use the completed IPC communication layer from the service epic

### Hook Interface Design

Create a comprehensive hook that provides:

```typescript
interface UseLlmConfigHook {
  // Data
  configurations: LlmConfigMetadata[];
  isLoading: boolean;
  error: string | null;

  // Operations
  createConfiguration: (config: LlmConfigInput) => Promise<LlmConfig>;
  updateConfiguration: (
    id: string,
    updates: Partial<LlmConfigInput>,
  ) => Promise<LlmConfig>;
  deleteConfiguration: (id: string) => Promise<void>;
  refreshConfigurations: () => Promise<void>;

  // UI State helpers
  clearError: () => void;
}
```

### Core Functionality

**Data Loading**

- Load configurations on hook initialization
- Provide loading states during async operations
- Cache configurations in local state for performance
- Auto-refresh when configurations change

**CRUD Operations**

- Implement create, update, delete operations using IPC calls
- Handle optimistic updates for better UX
- Provide proper error handling and user feedback
- Update local state after successful operations

**Error Management**

- Centralized error handling for all operations
- User-friendly error messages
- Error state management with clear/reset functionality
- Proper error boundary integration

## Technical Implementation

### IPC Integration

- Use the existing `llm-config:*` IPC channels from the service layer
- Import types from `@fishbowl-ai/shared` for consistency
- Handle IPC errors and convert to user-friendly messages
- Implement retry logic for transient failures

### State Management Pattern

- Use `useState` for local component state
- Use `useEffect` for data loading lifecycle
- Use `useCallback` for memoized operation functions
- Follow existing hook patterns in the codebase

### Type Safety

- Import proper types from `@fishbowl-ai/shared`:
  - `LlmConfig`, `LlmConfigInput`, `LlmConfigMetadata`
  - `Provider` enum for all supported providers
- No `any` types - full TypeScript coverage
- Proper error type definitions

## Error Handling Requirements

**User-Friendly Messages**

- Convert technical errors to actionable user messages
- Provide guidance for common error scenarios
- Handle network/IPC communication failures gracefully
- Display validation errors clearly

**Recovery Mechanisms**

- Automatic retry for transient failures
- Manual refresh capability for users
- Graceful degradation when service unavailable
- Error boundary compatibility

## Testing Requirements (Include in same task)

Create comprehensive unit tests in `apps/desktop/src/hooks/__tests__/useLlmConfig.test.tsx`:

**Test Coverage**

- Hook initialization and data loading
- All CRUD operations (create, read, update, delete)
- Error handling scenarios
- Loading state management
- Optimistic updates behavior

**Mock Strategy**

- Mock IPC calls using Jest mocks
- Test both success and error scenarios
- Verify proper state transitions
- Test cleanup on component unmount

## Integration Requirements

**IPC Channel Usage**

```typescript
// Use existing channels from service layer:
// - 'llm-config:create'
// - 'llm-config:list'
// - 'llm-config:update'
// - 'llm-config:delete'
```

**Shared Package Integration**

- Import types from `@fishbowl-ai/shared/types/llmConfig`
- Use validation schemas if needed
- Maintain consistency with service layer

## Performance Considerations

- Implement caching to avoid unnecessary IPC calls
- Use React's built-in optimization (useCallback, useMemo)
- Debounce operations if needed for user input
- Minimal re-renders through proper state structure

## Security Requirements

- Never expose API keys in hook state
- Use metadata-only responses for list operations
- Sanitize error messages to prevent sensitive data exposure
- Follow existing security patterns in the codebase

## Acceptance Criteria

✅ Hook provides all necessary CRUD operations
✅ Proper loading states for all async operations
✅ Comprehensive error handling with user-friendly messages
✅ Integration with existing IPC communication layer
✅ Type safety using shared package types
✅ Unit tests with >90% coverage
✅ Follows existing hook patterns in codebase
✅ Performance optimized with caching and memoization
✅ Security compliant with no sensitive data exposure

### Log
