---
id: T-implement-comprehensive-error
title: Implement comprehensive error handling and user feedback
status: open
priority: medium
parent: F-implement-user-interactions
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T18:49:12.869Z
updated: 2025-08-17T18:49:12.869Z
---

# Implement Error Handling Following Roles Pattern

## Context

Add comprehensive error handling and user feedback systems following the exact patterns established in the roles section. This ensures consistent error handling behavior across the application.

## Implementation Requirements

### Error Handling Patterns from Roles

The error handling must follow the exact patterns established in RolesSection:

1. **Store Error Integration**: Use store error states consistently
2. **Error Clearing**: Clear errors before operations
3. **Error Checking**: Check error state after operations to determine success
4. **Logging**: Include detailed error logging matching roles patterns
5. **Modal Behavior**: Keep modals open on errors, close on success

### Store Error Integration Pattern

**From RolesSection - Follow Exactly:**

```tsx
const handleSavePersonality = useCallback(
  async (data: PersonalityFormData) => {
    logger.info("Saving personality", {
      mode: formMode,
      personalityId: selectedPersonality?.id,
    });

    try {
      // Clear any existing errors
      clearError();

      if (formMode === "create") {
        // Create new personality
        const newPersonalityId = createPersonality(data);

        if (newPersonalityId) {
          logger.info("Personality created successfully", {
            personalityId: newPersonalityId,
          });
          // Close modal only on successful creation
          setFormModalOpen(false);
          setSelectedPersonality(undefined);
        } else {
          // Creation failed - error is already set in store
          logger.warn("Personality creation failed - name might not be unique");
        }
      } else if (selectedPersonality?.id) {
        // Update existing personality
        updatePersonality(selectedPersonality.id, data);

        // Check if update succeeded by checking error state
        const currentError = usePersonalitiesStore.getState().error;
        if (!currentError?.message) {
          logger.info("Personality updated successfully", {
            personalityId: selectedPersonality.id,
          });
          // Close modal only on successful update
          setFormModalOpen(false);
          setSelectedPersonality(undefined);
        } else {
          logger.warn("Personality update failed", {
            error: currentError.message,
          });
        }
      }
    } catch (error) {
      // Handle unexpected errors
      logger.error(
        "Failed to save personality",
        error instanceof Error ? error : new Error(String(error)),
      );
      // Keep modal open on error
    }
  },
  [
    formMode,
    selectedPersonality,
    createPersonality,
    updatePersonality,
    clearError,
  ],
);
```

### Error Display Pattern

**Follow RolesSection Error Display:**

```tsx
{
  /* Error state display */
}
{
  error?.message && (
    <div
      className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-destructive mb-1">
              Error {error.operation && `during ${error.operation}`}
            </h3>
            <p className="text-sm text-destructive/80">{error.message}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {retryLastOperation && (
            <Button
              variant="outline"
              size="sm"
              onClick={retryLastOperation}
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Form Error Handling

- Display validation errors inline in PersonalityForm
- Network error handling during form submission
- Form stays open on errors (modal doesn't close)
- Clear error state after successful retry
- Follow exact error checking patterns from roles

### Network Error Recovery

- Retry buttons for failed operations (match roles implementation)
- Clear error messages explaining what went wrong
- Graceful handling of network timeouts
- Use store retry functionality if available

## Technical Approach

1. **Copy Error Handling Logic** from RolesSection exactly
2. **Use Same Error Display Component** pattern as roles
3. **Follow Same Error State Management** as roles
4. **Implement Same Retry Logic** as roles
5. **Use Same Logging Patterns** for errors

## Acceptance Criteria

### Store Error Integration

- [ ] Errors cleared before operations using `clearError()`
- [ ] Error state checked after operations to determine success
- [ ] Store error states used consistently
- [ ] Error handling follows exact roles patterns

### Error Display

- [ ] Error display matches roles section exactly
- [ ] Error messages are user-friendly and actionable
- [ ] Error display includes retry button when applicable
- [ ] Error display uses same styling as roles
- [ ] Errors accessible with proper ARIA attributes

### Form Error Handling

- [ ] Validation errors show inline on form fields
- [ ] Form modal stays open when errors occur
- [ ] Error state clears on successful form submission
- [ ] Network errors handled gracefully
- [ ] Error handling matches roles form patterns

### Modal Behavior

- [ ] Modals stay open on errors (following roles pattern)
- [ ] Modals close only on successful operations
- [ ] Error state doesn't prevent modal operations
- [ ] Error clearing works properly

### Logging

- [ ] Error logging matches roles section detail level
- [ ] Success logging includes same information as roles
- [ ] Performance measurement included where appropriate
- [ ] Logging follows exact roles patterns

## Testing Requirements

- Test error display for various failure scenarios
- Test form validation error display
- Test network error handling and recovery
- Test error state cleanup
- Test retry functionality
- Test modal behavior on errors
- Test accessibility of error messages

## Dependencies

- personalities store error states and actions
- Logger utility from @fishbowl-ai/shared
- AlertCircle, RefreshCw, X icons from lucide-react
- Button component from shadcn/ui

## Files to Modify

- Update: `apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx`
- Update: `apps/desktop/src/components/settings/personalities/PersonalityForm.tsx` (if validation errors needed)
- Add unit tests for error handling scenarios
- Add integration tests for error recovery flows

## Prerequisites

- Store actions and error states must be available
- Error display components should match roles section

## Priority

**MEDIUM** - Important for user experience and error recovery
