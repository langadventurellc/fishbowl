---
id: T-implement-unified-roles-list
title: Implement unified roles list component with sample data
status: open
priority: high
parent: F-unify-roles-ui-remove
prerequisites:
  - T-create-sample-roles-data
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T03:59:41.706Z
updated: 2025-08-09T03:59:41.706Z
---

# Implement Unified Roles List Component with Sample Data

## Context

This task creates the core list component that displays all roles in a unified interface, adapting the existing CustomRolesTab design to work with static sample data. The component will show all roles with Edit/Delete buttons (non-functional) while maintaining the responsive design and accessibility features.

## Reference Files

- `/apps/desktop/src/components/settings/roles/CustomRolesTab.tsx` - Design reference
- `/apps/desktop/src/components/settings/roles/CustomRoleListItem.tsx` - List item component
- `/packages/ui-shared/src/data/sampleRoles.ts` - Data source (from previous task)

## Implementation Requirements

### 1. Create UnifiedRolesList Component

**Location**: `/apps/desktop/src/components/settings/roles/UnifiedRolesList.tsx`

**Interface**:

```typescript
interface UnifiedRolesListProps {
  roles: CustomRoleViewModel[];
  onCreateRole: () => void;
  onEditRole: (role: CustomRoleViewModel) => void;
  onDeleteRole: (role: CustomRoleViewModel) => void;
  className?: string;
}
```

### 2. Adapt CustomRolesTab Design

**Copy and modify the following elements from CustomRolesTab**:

**Remove**:

- Loading states (no isLoading since data is static)
- Error states (no error handling needed for static data)
- Empty states (always have sample data)
- useCustomRoles hook usage
- Complex state management

**Keep**:

- List layout structure and styling
- Responsive design patterns
- Accessibility features (ARIA labels, screen reader support)
- Create button at bottom
- Scrollable list area
- CustomRoleListItem usage

### 3. Component Structure

```typescript
export const UnifiedRolesList = memo<UnifiedRolesListProps>(
  function UnifiedRolesList({ roles, onCreateRole, onEditRole, onDeleteRole, className }) {
    // Sort roles alphabetically by name
    const sortedRoles = useMemo(() => {
      return [...roles].sort((a, b) => a.name.localeCompare(b.name));
    }, [roles]);

    return (
      <div className={cn("unified-roles-list flex flex-col h-full", className)}>
        {/* Accessible heading for screen readers */}
        <h2 className="sr-only">All Roles List</h2>

        {/* Scrollable role list area */}
        <div className="flex-1 min-h-0">
          <div
            className="max-h-[var(--dt-scrollable-list-max-height)] overflow-y-auto space-y-4 pr-[var(--dt-scrollable-container-padding-right)]"
            role="list"
            aria-label={`${sortedRoles.length} roles available`}
            aria-describedby="roles-list-description"
          >
            {/* Hidden description for screen readers */}
            <div id="roles-list-description" className="sr-only">
              List of {sortedRoles.length} available roles. Use Tab to navigate through role items and their action buttons.
            </div>

            {sortedRoles.map((role) => (
              <div key={role.id} role="listitem">
                <CustomRoleListItem
                  role={role}
                  onEdit={onEditRole}
                  onDelete={onDeleteRole}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Create button container - always visible at bottom */}
        <div className="pt-6 border-t border-border mt-6">
          <Button
            onClick={onCreateRole}
            className="w-full gap-2"
            size="lg"
            aria-label="Create a new role"
          >
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        </div>
      </div>
    );
  }
);
```

### 4. Styling and Visual Consistency

- **Maintain exact visual parity** with current CustomRolesTab layout
- **Preserve responsive behavior** for mobile/tablet/desktop
- **Keep spacing and typography** consistent
- **Use same CSS classes** and Tailwind utilities
- **Maintain dark/light theme support**

### 5. Accessibility Implementation

- **ARIA labels**: Proper role and list semantics
- **Screen reader support**: Hidden descriptions and context
- **Keyboard navigation**: Tab order through roles and buttons
- **Focus management**: Visible focus indicators
- **Semantic HTML**: Use proper list markup

### 6. Remove Read-Only Restrictions

- **No "Read-only" badges** anywhere in the component
- **All roles show Edit/Delete buttons** regardless of source
- **Consistent visual treatment** for all role items
- **No disabled states** for role interaction buttons

## Acceptance Criteria

- [ ] UnifiedRolesList component created as new file
- [ ] All sample roles displayed in alphabetical order
- [ ] Visual design matches CustomRolesTab exactly
- [ ] Edit/Delete buttons present on all roles
- [ ] No "Read-only" indicators anywhere
- [ ] Responsive design works on all screen sizes
- [ ] Create button positioned at bottom
- [ ] ARIA accessibility attributes properly implemented
- [ ] Screen reader navigation works correctly
- [ ] Component memoized for performance
- [ ] TypeScript interfaces properly defined

## Testing Requirements

- **Unit Tests**: Create `UnifiedRolesList.test.tsx`
  - Test rendering of all sample roles
  - Verify alphabetical sorting
  - Check button click handlers are called
  - Validate accessibility attributes
  - Test responsive behavior
- **Visual Testing**:
  - Compare side-by-side with current CustomRolesTab
  - Test in dark and light themes
  - Verify mobile layout

## Dependencies

- **Prerequisites**: T-create-sample-roles-data (for sample roles import)
- **Imports needed**:
  - CustomRoleListItem component
  - Sample roles data
  - UI components (Button, etc.)
  - Icons (Plus from lucide-react)

## Security Considerations

- Static data eliminates injection risks
- Handler props validated at component boundary
- No direct DOM manipulation

## Implementation Notes

- **Sorting strategy**: Alphabetical by name (can be changed later)
- **Performance**: Memoize both component and sorted roles
- **Extensibility**: Structure supports future filtering/grouping
- **Consistency**: Use exact same patterns as CustomRolesTab
- **Future-proofing**: Component structure ready for real data integration

## Integration Points

This component will be used by:

- RolesSection component (direct integration)
- Future role management features
- Potential role selection workflows
