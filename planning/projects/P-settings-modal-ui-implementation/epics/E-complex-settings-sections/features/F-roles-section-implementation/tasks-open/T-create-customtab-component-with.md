---
kind: task
id: T-create-customtab-component-with
title: Create CustomTab component with role list and create button
status: open
priority: normal
prerequisites:
  - T-create-customrolelistitem
  - T-implement-custom-roles-zustand
created: "2025-07-29T11:02:35.160497"
updated: "2025-07-29T11:02:35.160497"
schema_version: "1.1"
parent: F-roles-section-implementation
---

# Create CustomTab Component with Role List and Create Button

## Context

Implement the Custom tab component that displays user-created roles in a scannable list format with a prominent "Create Custom Role" button. This tab handles empty states, loading states, and integrates with the custom roles store.

## Technical Approach

### 1. Create CustomTab Component

**File: `apps/desktop/src/components/settings/CustomTab.tsx`**

Implement tab with list and create button:

```tsx
interface CustomTabProps {
  onCreateRole: () => void;
  onEditRole: (role: CustomRole) => void;
  onDeleteRole: (role: CustomRole) => void;
  className?: string;
}

export const CustomTab = ({
  onCreateRole,
  onEditRole,
  onDeleteRole,
  className,
}: CustomTabProps) => {
  const { roles, isLoading } = useCustomRoles();

  return (
    <div className={cn("custom-tab", className)}>
      {roles.length === 0 ? (
        <EmptyState onCreateRole={onCreateRole} />
      ) : (
        <>
          <div className="roles-list">
            {roles.map((role) => (
              <CustomRoleListItem
                key={role.id}
                role={role}
                onEdit={onEditRole}
                onDelete={onDeleteRole}
              />
            ))}
          </div>
          <div className="create-button-container">
            <Button onClick={onCreateRole} className="create-role-button">
              + Create Custom Role
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
```

### 2. Create Empty State Component

**File: `apps/desktop/src/components/settings/RolesEmptyState.tsx`**

- Friendly message: "No custom roles created. Create your first custom role!"
- Prominent create button with primary styling
- Optional icon or illustration
- Encourage user action with clear call-to-action

### 3. Implement List Management

**List behavior:**

- Scrollable list container for many roles
- Consistent spacing between list items
- Loading states with skeleton placeholders
- Smooth animations for role addition/removal

### 4. Add Create Button

**Button requirements:**

- Primary button styling with "+ Create Custom Role" text
- Positioned at bottom of tab with proper spacing
- Always visible (not within scrollable area if list is long)
- Disabled during loading states
- Proper focus management

### 5. Integrate Store Operations

**Store integration:**

- Connect to custom roles Zustand store
- Handle loading and error states from store
- Provide real-time updates when roles change
- Implement optimistic updates for better UX

## Detailed Acceptance Criteria

### List Display

- [ ] Custom roles display in chronological order (newest first)
- [ ] List is scrollable when containing many roles (>10)
- [ ] Each role shows name and description preview clearly
- [ ] List items have consistent spacing and visual hierarchy
- [ ] Smooth animations when roles are added or removed from list

### Empty State

- [ ] Empty state displays when no custom roles exist
- [ ] Message is friendly and encouraging: "No custom roles created. Create your first custom role!"
- [ ] Create button is prominently displayed in empty state
- [ ] Empty state design is visually balanced and professional
- [ ] Transition from empty to populated state is smooth

### Create Button

- [ ] Button uses primary styling and is visually prominent
- [ ] Text reads "+ Create Custom Role" with proper spacing
- [ ] Button positioned at bottom, outside scrollable area
- [ ] Button remains accessible when list is long
- [ ] Disabled state during loading with visual feedback

### Store Integration

- [ ] Component re-renders correctly when custom roles change
- [ ] Loading states show skeleton placeholders for list items
- [ ] Error states display appropriate error messages
- [ ] Store operations (create, edit, delete) trigger proper UI updates
- [ ] Component handles concurrent operations gracefully

### Responsive Behavior

- [ ] List layout adapts to narrow screens without horizontal scroll
- [ ] Create button remains accessible on mobile devices
- [ ] List item content truncates appropriately on small screens
- [ ] Touch interactions work properly on mobile devices
- [ ] Component maintains usability at all screen sizes

### Performance

- [ ] List renders efficiently with 50+ custom roles
- [ ] Component is memoized to prevent unnecessary re-renders
- [ ] Store subscriptions are optimized to avoid performance issues
- [ ] Virtual scrolling implemented if list becomes very long (100+ items)
- [ ] Memory usage remains stable with large role lists

### Accessibility

- [ ] List structure announced properly by screen readers
- [ ] Create button has appropriate ARIA label and context
- [ ] Keyboard navigation flows logically through list and button
- [ ] Focus management works correctly with dynamic content
- [ ] List updates announced to screen readers via ARIA live regions

### Testing Requirements

- [ ] Unit tests for component rendering with various data states
- [ ] Tests for empty state display and interaction
- [ ] Integration tests with custom roles store
- [ ] Accessibility tests with axe-core integration
- [ ] Performance tests with large lists of custom roles

## Implementation Notes

- Use existing list patterns from other settings sections
- Follow shadcn/ui Button component patterns for create button
- Consider using virtualization for very large lists (future-proofing)
- Implement proper loading skeletons for perceived performance

## Dependencies

- Requires: T-create-customrolelistitem (CustomRoleListItem component)
- Requires: T-implement-custom-roles-zustand (custom roles store)

## Security Considerations

- Validate role data before rendering in list
- Ensure proper error handling prevents component crashes
- Sanitize role content to prevent XSS vulnerabilities

### Log
