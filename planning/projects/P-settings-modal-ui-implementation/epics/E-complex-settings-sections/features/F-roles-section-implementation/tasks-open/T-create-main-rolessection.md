---
kind: task
id: T-create-main-rolessection
title: Create main RolesSection component with TabContainer integration
status: open
priority: high
prerequisites:
  - T-create-predefinedtab-component
  - T-create-customtab-component-with
  - T-create-role-confirmation-dialog
  - T-create-role-creation-and-editing
created: "2025-07-29T11:04:08.658123"
updated: "2025-07-29T11:04:08.658123"
schema_version: "1.1"
parent: F-roles-section-implementation
---

# Create Main RolesSection Component with TabContainer Integration

## Context

Implement the main RolesSection component that orchestrates the complete roles management interface. This component integrates with the existing TabContainer system and coordinates all role-related operations including CRUD operations, modal management, and state coordination.

## Technical Approach

### 1. Create Shared Types First

**IMPORTANT: Before implementing any components, create all types in the shared package following the project's architecture standards.**

**File: `packages/shared/src/types/ui/components/RolesSectionProps.ts`**

```typescript
/**
 * RolesSection component props interface.
 *
 * @module types/ui/components/RolesSectionProps
 */

export interface RolesSectionProps {
  className?: string;
}
```

**Update exports in `packages/shared/src/types/ui/components/index.ts`:**

```typescript
export * from "./RolesSectionProps";
```

**Run `pnpm build:libs` after adding shared types to make them available to desktop app.**

### 2. Create RolesSection Component

**File: `apps/desktop/src/components/settings/RolesSection.tsx`**

Implement main component with TabContainer integration:

```tsx
import { type RolesSectionProps } from "@fishbowl-ai/shared";

export const RolesSection = ({ className }: RolesSectionProps) => {
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const { createRole, updateRole, deleteRole, isLoading } = useCustomRoles();

  const tabs: TabConfiguration[] = [
    {
      id: "predefined",
      label: "Predefined",
      content: <PredefinedTab />,
    },
    {
      id: "custom",
      label: "Custom",
      content: (
        <CustomTab
          onCreateRole={handleCreateRole}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
        />
      ),
    },
  ];

  return (
    <div className={cn("roles-section", className)}>
      <TabContainer
        tabs={tabs}
        useStore={true}
        animationDuration={200}
        className="roles-tabs"
      />

      {/* Modals and dialogs */}
      <RoleFormModal
        isOpen={formModalOpen}
        onOpenChange={setFormModalOpen}
        mode={formMode}
        role={selectedRole}
        onSave={handleSaveRole}
        isLoading={isLoading}
      />

      <RoleDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        role={selectedRole}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  );
};
```

### 2. Implement CRUD Operation Handlers

**Operation handlers:**

- `handleCreateRole`: Opens form modal in create mode
- `handleEditRole`: Opens form modal in edit mode with role data
- `handleDeleteRole`: Opens confirmation dialog
- `handleSaveRole`: Processes form data and calls store operations
- `handleConfirmDelete`: Executes role deletion

### 3. Add State Coordination

**State management:**

- Coordinate modal states and selected role
- Handle form mode switching between create/edit
- Manage loading states across all operations
- Provide error handling and user feedback

### 4. Integrate with Settings Navigation

**Navigation integration:**

- Work with existing settings modal navigation system
- Handle active tab state through TabContainer store integration
- Ensure proper tab switching behavior
- Maintain tab state during modal operations

### 5. Add Error Handling and Feedback

**Error management:**

- Handle network errors for all CRUD operations
- Provide user-friendly error messages
- Allow retry for failed operations
- Toast notifications for success/error feedback

## Detailed Acceptance Criteria

### Tab Integration

- [ ] TabContainer displays Predefined and Custom tabs correctly
- [ ] Tab switching works smoothly with 200ms animation duration
- [ ] Active tab state persists through modal operations
- [ ] Tab content renders correctly for both predefined and custom roles
- [ ] TabContainer integrates properly with settings navigation store

### CRUD Operations

- [ ] Create role opens form modal in create mode
- [ ] Edit role opens form modal in edit mode with correct data
- [ ] Delete role opens confirmation dialog with role context
- [ ] Save operations update store and close modals appropriately
- [ ] All operations provide loading feedback and error handling

### Modal Coordination

- [ ] Only one modal open at a time (form or delete dialog)
- [ ] Modal state resets properly when switching between operations
- [ ] Selected role context passed correctly to modals
- [ ] Modal closing doesn't affect tab state or other UI elements
- [ ] Modals handle concurrent operations gracefully

### State Management

- [ ] Component state updates correctly for all user actions
- [ ] Loading states prevent conflicting operations
- [ ] Error states display appropriate feedback messages
- [ ] Success operations provide clear confirmation feedback
- [ ] Component handles store updates and re-renders efficiently

### User Experience

- [ ] Seamless workflow from role list to edit/delete operations
- [ ] Clear visual feedback for all user actions
- [ ] Intuitive navigation between predefined and custom roles
- [ ] Consistent behavior with other settings sections
- [ ] Responsive design works across all screen sizes

### Error Handling

- [ ] Network errors display helpful messages with retry options
- [ ] Form validation errors prevent invalid operations
- [ ] Concurrent operation conflicts handled gracefully
- [ ] Component recovers properly from error states
- [ ] Error messages are specific to the failed operation

### Performance

- [ ] Component renders efficiently with many custom roles
- [ ] Tab switching performance remains smooth
- [ ] Modal operations don't block other UI interactions
- [ ] Store subscriptions optimized to prevent unnecessary re-renders
- [ ] Memory usage remains stable during extended use

### Accessibility

- [ ] Screen readers announce tab changes and modal states
- [ ] Keyboard navigation works throughout the entire interface
- [ ] Focus management handles modal operations correctly
- [ ] ARIA labels provide context for all interactive elements
- [ ] High contrast mode preserves all visual feedback

### Testing Requirements

- [ ] Unit tests for component rendering and state management
- [ ] Integration tests with TabContainer and store operations
- [ ] User interaction tests for complete CRUD workflows
- [ ] Accessibility tests with axe-core integration
- [ ] Performance tests with large numbers of custom roles

## Implementation Notes

- Follow existing patterns from PersonalitiesSection component
- Use consistent error handling patterns from other settings sections
- Ensure proper TypeScript typing for all state and props
- Consider using React Query for optimistic updates and caching

## Dependencies

- Requires: T-create-predefinedtab-component (PredefinedTab component)
- Requires: T-create-customtab-component-with (CustomTab component)
- Requires: T-create-role-confirmation-dialog (RoleDeleteDialog component)
- Requires: T-create-role-creation-and-editing (RoleFormModal component)

## Security Considerations

- Validate all role operations before processing
- Ensure proper authorization for role management operations
- Prevent XSS through proper data validation and sanitization
- Log role operations for audit purposes if required

### Log
