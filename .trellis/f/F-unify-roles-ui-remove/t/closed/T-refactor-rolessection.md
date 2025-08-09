---
id: T-refactor-rolessection
title: Refactor RolesSection component to unified list view
status: done
priority: high
parent: F-unify-roles-ui-remove
prerequisites:
  - T-create-sample-roles-data
affectedFiles:
  apps/desktop/src/components/settings/roles/RolesSection.tsx:
    "Completely refactored component: removed TabContainer and tab-related
    logic, replaced with direct RolesList rendering using SAMPLE_ROLES,
    simplified handlers to log-only functions, preserved modal infrastructure
    with disabled functionality, updated documentation to reflect unified list
    view approach"
  apps/desktop/src/components/settings/roles/index.ts: Removed exports for
    CustomRolesTab, PredefinedRoleCard, and PredefinedRolesTab components that
    are no longer needed
log:
  - Refactored RolesSection component to unified list view by removing
    TabContainer infrastructure and replacing with direct RolesList rendering.
    Eliminated predefined/custom distinction in the UI while preserving modal
    components for future functionality. All handlers are disabled with logging
    only. Component now displays all sample roles in a single unified list using
    the RolesList component design.
schema: v1.0
childrenIds: []
created: 2025-08-09T03:58:37.659Z
updated: 2025-08-09T03:58:37.659Z
---

# Refactor RolesSection Component to Unified List View

## Context

This task transforms the RolesSection component from a tab-based interface to a unified list view, eliminating the artificial predefined/custom distinction. The component will use the sample roles data and adopt the CustomRolesTab's list design as the foundation.

## Reference Files

- `/apps/desktop/src/components/settings/roles/RolesSection.tsx` - Component to refactor
- `/apps/desktop/src/components/settings/roles/CustomRolesTab.tsx` - UI design reference
- `/apps/desktop/src/components/settings/TabContainer.tsx` - Component to remove

## Current State Analysis

The RolesSection currently:

- Uses TabContainer with "Predefined" and "Custom" tabs
- Manages complex modal state for CRUD operations
- Handles tab-specific event handlers
- Renders different components based on active tab

## Implementation Requirements

### 1. Remove TabContainer Infrastructure

**File**: `apps/desktop/src/components/settings/roles/RolesSection.tsx`

**Changes to make**:

- Remove TabContainer import and usage
- Remove `tabs` array configuration
- Remove tab-specific state management
- Keep modal-related state (formModalOpen, deleteDialogOpen, etc.) but disable functionality

### 2. Replace with Unified List Interface

**New Structure**:

```typescript
export const RolesSection: React.FC<RolesSectionProps> = ({ className }) => {
  // Keep existing modal state for future functionality (but disable)
  const [selectedRole, setSelectedRole] = useState<CustomRoleViewModel | undefined>(undefined);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Use sample data passed to RolesList as prop

  // Disabled handlers (keep for future functionality)
  const handleCreateRole = useCallback(() => {
    // TODO: Will be implemented in future functionality
    console.log("Create role clicked - not implemented yet");
  }, []);

  const handleEditRole = useCallback((role: CustomRoleViewModel) => {
    // TODO: Will be implemented in future functionality
    console.log("Edit role clicked - not implemented yet", role);
  }, []);

  const handleDeleteRole = useCallback((role: CustomRoleViewModel) => {
    // TODO: Will be implemented in future functionality
    console.log("Delete role clicked - not implemented yet", role);
  }, []);

  return (
    <div className={cn("roles-section space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Roles</h1>
        <p className="text-muted-foreground mb-6">
          Define and configure agent roles and permissions.
        </p>
      </div>

      {/* Direct list rendering - no tabs */}
      <RolesList
        roles={SAMPLE_ROLES}
        onCreateRole={handleCreateRole}
        onEditRole={handleEditRole}
        onDeleteRole={handleDeleteRole}
      />

      {/* Keep modals for future functionality */}
      <RoleFormModal
        isOpen={formModalOpen}
        onOpenChange={setFormModalOpen}
        mode={formMode}
        role={selectedRole}
        onSave={() => {}} // Disabled
        isLoading={false}
      />

      <RoleDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        role={selectedRole || null}
        onConfirm={() => {}} // Disabled
        isLoading={false}
      />
    </div>
  );
};
```

### 3. Create RolesList Component

**Location**: Same file as RolesSection (as internal component)

**Based on CustomRolesTab design**:

- Use the list layout from CustomRolesTab
- Remove loading states (static data)
- Remove empty states (always have sample data)
- Keep Edit/Delete buttons but make them call disabled handlers
- Maintain responsive design and accessibility features

### 4. Update Imports

**Remove**:

- TabContainer import
- PredefinedRolesTab import
- useCustomRoles hook import (replaced with static data)

**Add**:

- SAMPLE_ROLES import from new data file
- RolesList import

### 5. Preserve Accessibility

- Keep ARIA labels and descriptions for list
- Maintain keyboard navigation support
- Preserve screen reader compatibility
- Use proper semantic HTML structure

## Acceptance Criteria

- [ ] TabContainer completely removed from RolesSection
- [ ] Single unified list displays all sample roles
- [ ] No tab navigation visible in UI
- [ ] Edit/Delete buttons present on all roles (but disabled)
- [ ] No "Read-only" badges or indicators
- [ ] Responsive list layout maintained
- [ ] Modal components still integrated (but non-functional)
- [ ] ARIA accessibility preserved
- [ ] Component renders without errors
- [ ] Visual design matches CustomRolesTab style

## Testing Requirements

- **Unit Tests**: Update existing RolesSection tests
  - Test sample roles are displayed
  - Verify Edit/Delete button rendering
  - Check modal integration (closed state)
  - Validate accessibility attributes
- **Visual Testing**:
  - Compare with CustomRolesTab layout
  - Test responsive behavior
  - Verify no tabs are visible

## Dependencies

- **Prerequisites**: T-create-sample-roles-data (for SAMPLE_ROLES import)

## Security Considerations

- Static data eliminates data injection risks
- Disabled handlers prevent unintended actions
- Modal state management preserved for future security implementation

## Implementation Notes

- Keep existing modal structure intact for future functionality
- Use console.log for disabled handlers (temporary)
- Maintain component prop interfaces where possible
- Consider creating the RolesList as a separate component file in future iterations
- Follow existing styling patterns and CSS classes from CustomRolesTab
