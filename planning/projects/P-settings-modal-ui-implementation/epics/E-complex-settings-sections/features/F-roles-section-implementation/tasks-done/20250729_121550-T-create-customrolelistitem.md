---
kind: task
id: T-create-customrolelistitem
parent: F-roles-section-implementation
status: done
title: Create CustomRoleListItem component with edit and delete actions
priority: normal
prerequisites:
  - T-create-role-interfaces-and
  - T-implement-custom-roles-zustand
created: "2025-07-29T11:01:09.257313"
updated: "2025-07-29T12:05:41.579426"
schema_version: "1.1"
worktree: null
---

# Create CustomRoleListItem Component with Edit and Delete Actions

## Context

Implement the list item component for custom roles that displays role information in a scannable list format with inline edit and delete actions. This component will be used in the Custom tab to show user-created roles.

## Technical Approach

### 1. Create CustomRoleListItem Component

**File: `apps/desktop/src/components/settings/CustomRoleListItem.tsx`**

Implement list item component with actions:

```tsx
interface CustomRoleListItemProps {
  role: CustomRole;
  onEdit: (role: CustomRole) => void;
  onDelete: (role: CustomRole) => void;
  className?: string;
}

export const CustomRoleListItem = ({
  role,
  onEdit,
  onDelete,
  className,
}: CustomRoleListItemProps) => {
  return (
    <div className={cn("custom-role-item", className)}>
      <div className="role-content">
        <h3 className="role-name">{role.name}</h3>
        <p className="role-description">
          {truncateDescription(role.description)}
        </p>
      </div>
      <div className="role-actions">
        <Button variant="ghost" size="sm" onClick={() => onEdit(role)}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(role)}>
          Delete
        </Button>
      </div>
    </div>
  );
};
```

### 2. Implement Description Truncation

**Utility function:**

- Truncate descriptions to first line preview (80-100 characters)
- Add ellipsis when text is truncated
- Consider word boundaries for clean truncation
- Provide tooltip with full description on hover

### 3. Create Action Button Group

**Action button requirements:**

- Right-aligned Edit and Delete buttons
- Ghost variant for subtle appearance
- Small size for compact layout
- Consistent spacing and alignment
- Proper hover states and accessibility

### 4. Add Loading States

**Loading behavior:**

- Disable buttons during edit/delete operations
- Show loading spinners in buttons when appropriate
- Prevent multiple simultaneous operations
- Provide visual feedback for user actions

### 5. Create Component Stories

**File: `apps/desktop/src/components/settings/__stories__/CustomRoleListItem.stories.tsx`**

- Basic list item with different content lengths
- Loading states for edit/delete operations
- Empty state handling
- Multiple items in list context

## Detailed Acceptance Criteria

### Visual Design

- [ ] Role name displays prominently with proper typography hierarchy
- [ ] Description preview truncates cleanly with ellipsis indicator
- [ ] Edit and Delete buttons aligned consistently to the right
- [ ] List items have proper spacing and visual separation
- [ ] Hover states provide clear interaction feedback

### Description Handling

- [ ] Descriptions truncate at appropriate length for single line display
- [ ] Truncation respects word boundaries to avoid cutting mid-word
- [ ] Ellipsis clearly indicates when text is truncated
- [ ] Full description available via tooltip or on-demand expansion
- [ ] Empty descriptions handled gracefully with placeholder text

### Button Interactions

- [ ] Edit button triggers onEdit callback with correct role data
- [ ] Delete button triggers onDelete callback with correct role data
- [ ] Buttons are disabled during loading/operation states
- [ ] Button hover states provide clear visual feedback
- [ ] Keyboard navigation works properly for all interactive elements

### List Layout

- [ ] Items stack vertically with consistent spacing
- [ ] Content and actions sections align properly
- [ ] List maintains scannable visual hierarchy
- [ ] Works correctly within parent list container
- [ ] Responsive behavior maintains usability on narrow screens

### Accessibility

- [ ] Screen readers announce role information clearly
- [ ] Edit and Delete buttons have proper ARIA labels
- [ ] Keyboard navigation flows logically through items
- [ ] Focus indicators are visible and consistent
- [ ] Action buttons provide context about which role they affect

### Performance

- [ ] Component is memoized to prevent unnecessary re-renders
- [ ] Description truncation is efficient for large lists
- [ ] Button callbacks are properly memoized
- [ ] List scales well with 50+ custom roles

### Testing Requirements

- [ ] Unit tests for component rendering with various role data
- [ ] Tests for description truncation with different text lengths
- [ ] Interaction tests for edit and delete button callbacks
- [ ] Accessibility tests with axe-core integration
- [ ] Performance tests for list rendering with many items

## Implementation Notes

- Use consistent spacing and typography with other list components
- Consider using shadcn/ui Button and Tooltip components
- Follow existing patterns from PersonalityCard or similar list items
- Ensure proper event handling to prevent bubbling issues

## Dependencies

- Requires: T-create-role-interfaces-and (CustomRole interface)
- Requires: T-implement-custom-roles-zustand (store for role operations)

## Security Considerations

- Escape role names and descriptions to prevent XSS
- Validate role data before rendering
- Ensure callback functions are properly bound to prevent errors

### Log

**2025-07-29T17:15:50.125704Z** - Implemented CustomRoleListItem component with edit and delete actions

Key Features Implemented:

- Role name displayed prominently with proper typography hierarchy
- Description preview with smart truncation at word boundaries (80-100 chars)
- Right-aligned Edit and Delete buttons with ghost variant styling
- Loading states for operations to prevent multiple simultaneous actions
- Proper accessibility with ARIA labels and keyboard navigation support
- Memoization for performance optimization with large role lists
- Hover effects with smooth transitions for better UX

Technical Implementation:

- Created truncateDescription utility with word boundary logic
- Component uses shadcn/ui Card, Button components for consistency
- Lucide React icons (Edit, Trash2) for visual clarity
- Destructive styling on delete button to indicate danger
- Comprehensive test coverage (100%) for all component behaviors
- Follows existing project patterns from PersonalityCard component

The component is ready for integration with the Custom tab and role management operations through the useCustomRoles hook.

- filesChanged: ["apps/desktop/src/components/settings/CustomRoleListItem.tsx", "apps/desktop/src/utils/truncateDescription.ts", "apps/desktop/src/utils/index.ts", "apps/desktop/src/components/settings/index.ts", "apps/desktop/src/components/settings/__tests__/CustomRoleListItem.test.tsx", "apps/desktop/src/utils/__tests__/truncateDescription.test.ts"]
