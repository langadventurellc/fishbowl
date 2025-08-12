---
id: F-empty-states-and-loading
title: Empty States and Loading Indicators
status: open
priority: medium
parent: E-settings-ui-components-and
prerequisites:
  - F-roles-store-integration
  - F-role-list-display
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T16:46:05.631Z
updated: 2025-08-12T16:46:05.631Z
---

# Empty States and Loading Indicators Feature

## Purpose and Functionality

Implement thoughtful empty states and loading indicators throughout the roles interface to guide users and provide feedback during async operations. This includes helpful messaging when no roles exist, skeleton loaders during data fetching, progress indicators for save operations, and error recovery states.

## Key Components to Implement

### Empty State Component

- Friendly illustration or icon
- Clear message explaining the empty state
- Call-to-action button to create first role
- Consistent with other empty states in app

### Loading States

- Skeleton loader for roles list during fetch
- Spinner for form submission
- Progress indicator for file operations
- Loading overlay for modal operations

### Error States

- Error message display with icon
- Retry action for recoverable errors
- Fallback UI for critical failures
- Help text for common issues

### Success Feedback

- Toast notifications for successful operations
- Brief success animations
- Auto-dismiss after appropriate delay
- Non-intrusive confirmation messages

## Detailed Acceptance Criteria

### Empty State Requirements

- [ ] Shows when no roles exist (roles.length === 0)
- [ ] Displays friendly icon (e.g., empty folder, plus icon)
- [ ] Message: "No roles created yet"
- [ ] Subtext: "Create your first role to customize AI agent behavior"
- [ ] "Create Role" button prominently displayed
- [ ] Consistent styling with other empty states

### Loading State Specifications

- [ ] **Initial Load**: Skeleton cards while fetching roles data
- [ ] **Save Operations**: Button shows spinner, form disabled
- [ ] **Delete Operations**: Loading state in confirmation dialog
- [ ] **Async Validation**: Small spinner next to field being validated
- [ ] **File Operations**: Progress bar or percentage for large operations

### Error State Handling

- [ ] **Load Errors**: "Failed to load roles" with retry button
- [ ] **Save Errors**: Error message in modal with option to retry
- [ ] **Network Errors**: "Connection error" with offline indicator
- [ ] **Permission Errors**: Clear explanation and suggested actions
- [ ] **Validation Errors**: Inline display without blocking UI

### Success Feedback Patterns

- [ ] **Role Created**: "Role '[name]' created successfully" toast
- [ ] **Role Updated**: "Changes saved" toast
- [ ] **Role Deleted**: "Role deleted" toast
- [ ] **Auto-dismiss**: Success toasts disappear after 3 seconds
- [ ] **Manual dismiss**: Error toasts require user action

## Technical Requirements

### Empty State Implementation

```tsx
const RolesEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <FolderPlusIcon className="h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium mb-2">No roles created yet</h3>
    <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
      Create your first role to customize AI agent behavior
    </p>
    <Button onClick={onCreateRole} size="lg">
      <PlusIcon className="mr-2" /> Create Your First Role
    </Button>
  </div>
);
```

### Loading Skeleton Pattern

```tsx
const RolesSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg" />
      </div>
    ))}
  </div>
);
```

### Toast Notification System

- Use existing toast library or implement custom
- Position: top-right or bottom-center
- Stack multiple toasts if needed
- Accessible with ARIA announcements

## Dependencies

- Integrates with all other role features
- Uses loading states from roles store
- Follows patterns from other settings sections
- Uses UI library components

## Testing Requirements

- Verify empty state displays correctly
- Test all loading states appear appropriately
- Confirm error states show with retry options
- Validate success toasts appear and auto-dismiss
- Test accessibility of all states
- Verify state transitions are smooth

## Implementation Guidance

### State Management Pattern

```typescript
const RolesSection = () => {
  const { roles, isLoading, error } = useRolesStore();

  if (isLoading) return <RolesSkeleton />;
  if (error) return <RolesErrorState error={error} onRetry={retry} />;
  if (roles.length === 0) return <RolesEmptyState />;

  return <RolesList roles={roles} />;
};
```

### Loading Button Pattern

```tsx
<Button onClick={handleSave} disabled={isLoading || !isValid}>
  {isLoading ? (
    <>
      <Spinner className="mr-2" />
      Saving...
    </>
  ) : (
    "Save Changes"
  )}
</Button>
```

### Error Recovery Pattern

```tsx
const RolesErrorState = ({ error, onRetry }) => (
  <div className="text-center py-8">
    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium mb-2">Failed to load roles</h3>
    <p className="text-sm text-gray-500 mb-4">{error.message}</p>
    <Button onClick={onRetry} variant="outline">
      Try Again
    </Button>
  </div>
);
```

## Security Considerations

- Don't expose sensitive information in error messages
- Sanitize any user data shown in toasts
- Validate retry attempts to prevent abuse

## Performance Requirements

- Loading states appear within 100ms of trigger
- Skeleton animations run at 60fps
- Toast notifications appear instantly
- State transitions use smooth animations
