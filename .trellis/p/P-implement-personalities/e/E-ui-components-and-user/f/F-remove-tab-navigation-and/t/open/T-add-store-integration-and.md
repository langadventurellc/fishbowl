---
id: T-add-store-integration-and
title: Add Store Integration and Modal State Management
status: open
priority: high
parent: F-remove-tab-navigation-and
prerequisites:
  - T-remove-tab-components-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T14:28:24.615Z
updated: 2025-08-17T14:28:24.615Z
---

# Add Store Integration and Modal State Management

## Context

After removing tab components, this task adds the essential store integration and state management that the PersonalitiesSection needs to function. This follows the exact pattern established in RolesSection.

**File Location**: `apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx`

**Reference Pattern**: Mirror the store integration from `apps/desktop/src/components/settings/roles/RolesSection.tsx` lines 35-45

## Specific Implementation Requirements

### Store Integration

Add the usePersonalitiesStore hook with all necessary state subscriptions:

```tsx
// Subscribe to store state
const personalities = usePersonalitiesStore((state) => state.personalities);
const isLoading = usePersonalitiesStore((state) => state.isLoading);
const error = usePersonalitiesStore((state) => state.error);
const isSaving = usePersonalitiesStore((state) => state.isSaving);

// Subscribe to store methods
const createPersonality = usePersonalitiesStore(
  (state) => state.createPersonality,
);
const updatePersonality = usePersonalitiesStore(
  (state) => state.updatePersonality,
);
const deletePersonality = usePersonalitiesStore(
  (state) => state.deletePersonality,
);
const clearError = usePersonalitiesStore((state) => state.clearError);
const retryLastOperation = usePersonalitiesStore(
  (state) => state.retryLastOperation,
);
```

### Modal State Management

Add state variables for managing modals and forms:

```tsx
// Modal state management - centralized to ensure only one modal open
const [selectedPersonality, setSelectedPersonality] = useState<
  PersonalityViewModel | undefined
>(undefined);
const [formModalOpen, setFormModalOpen] = useState(false);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [formMode, setFormMode] = useState<"create" | "edit">("create");
```

### Required Imports

Add necessary imports for the store and types:

```tsx
import { usePersonalitiesStore } from "@fishbowl-ai/ui-shared";
import type { PersonalityViewModel } from "@fishbowl-ai/ui-shared";
import { useState } from "react";
```

### Loading and Error State Display

Replace placeholder content with loading and error state handling:

```tsx
// Show loading state
if (isLoading) {
  return (
    <div className="space-y-6">
      {/* Header remains the same */}
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading personalities...</div>
      </div>
    </div>
  );
}

// Show error state with retry option
if (error) {
  return (
    <div className="space-y-6">
      {/* Header remains the same */}
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="text-destructive">Error: {error.message}</div>
        <button
          onClick={retryLastOperation}
          className="text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
```

## Detailed Acceptance Criteria

### Store Connection

- [ ] usePersonalitiesStore hook properly imported and used
- [ ] All store state subscriptions added (personalities, isLoading, error, isSaving)
- [ ] All store methods subscribed (createPersonality, updatePersonality, deletePersonality, clearError, retryLastOperation)
- [ ] Store data flows to component without errors

### State Management

- [ ] Modal state variables added with correct TypeScript types
- [ ] selectedPersonality state can hold PersonalityViewModel or undefined
- [ ] formModalOpen and deleteDialogOpen control modal visibility
- [ ] formMode switches between "create" and "edit"

### Loading States

- [ ] Loading state displays "Loading personalities..." message
- [ ] Loading state shows when isLoading is true
- [ ] Header (title/description) remains visible during loading
- [ ] Layout structure preserved during loading

### Error Handling

- [ ] Error state displays error message from store
- [ ] Retry button calls retryLastOperation function
- [ ] Error state maintains header visibility
- [ ] Error styling uses destructive color variant

### Type Safety

- [ ] All TypeScript types properly imported and used
- [ ] No TypeScript compilation errors
- [ ] PersonalityViewModel type correctly applied
- [ ] useState hooks properly typed

## Implementation Guidance

1. **Add imports first**: Import usePersonalitiesStore and types before using them
2. **Follow RolesSection pattern exactly**: Use the same subscription pattern and variable names
3. **Add state management**: Create the modal state variables following the established pattern
4. **Replace placeholder**: Remove placeholder div and add loading/error state logic
5. **Test compilation**: Ensure TypeScript compiles without errors
6. **Test connection**: Verify store connection works (check developer tools)

## Testing Requirements

### Manual Testing

- Component renders without TypeScript errors
- Loading state displays when store is loading
- Error state displays when store has error
- Retry button is clickable and calls store method
- Store data subscription works (check React DevTools)

### Unit Test Requirements

- Test component renders with loading state
- Test component renders with error state
- Test retry button functionality
- Test store subscriptions are called correctly
- Mock usePersonalitiesStore for testing

### Integration Testing

- Verify store actually provides data to component
- Test error recovery flow
- Test loading to loaded state transition

## Security Considerations

- Validate error messages don't expose sensitive information
- Ensure retry mechanism doesn't cause infinite loops
- Handle store connection failures gracefully

## Dependencies

- **T-remove-tab-components-and**: Requires clean component structure
- **usePersonalitiesStore**: Store must exist in ui-shared package
- **PersonalityViewModel**: Type must exist in ui-shared package

## Estimated Time

1.5-2 hours including testing and store integration verification
