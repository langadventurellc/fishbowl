---
kind: task
id: T-create-role-creation-and-editing
parent: F-roles-section-implementation
status: done
title: Create role creation and editing modal with form integration
priority: normal
prerequisites:
  - T-create-createroleform-component
created: "2025-07-29T11:03:35.043545"
updated: "2025-07-29T15:16:56.479172"
schema_version: "1.1"
worktree: null
---

# Create Role Creation and Editing Modal with Form Integration

## Context

Implement a modal dialog that houses the CreateRoleForm component for both creating new roles and editing existing ones. The modal provides a focused editing experience with proper form integration and state management.

## Technical Approach

### 1. Create Shared Types First

**IMPORTANT: Before implementing components, create all types in the shared package following the project's architecture standards.**

**File: `packages/shared/src/types/ui/components/RoleFormModalProps.ts`**

```typescript
/**
 * RoleFormModal component props interface.
 *
 * @module types/ui/components/RoleFormModalProps
 */

import type { RoleFormData } from "../../settings/RoleFormData";
import type { CustomRole } from "../../settings/CustomRole";

export interface RoleFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  role?: CustomRole;
  onSave: (data: RoleFormData) => void;
  isLoading?: boolean;
}
```

**Update exports in `packages/shared/src/types/ui/components/index.ts`:**

```typescript
export * from "./RoleFormModalProps";
```

**Run `pnpm build:libs` after adding shared types to make them available to desktop app.**

### 2. Create RoleFormModal Component

**File: `apps/desktop/src/components/settings/RoleFormModal.tsx`**

Implement modal using shadcn/ui Dialog:

```tsx
import { type RoleFormModalProps } from "@fishbowl-ai/shared";

export const RoleFormModal = ({
  isOpen,
  onOpenChange,
  mode,
  role,
  onSave,
  isLoading,
}: RoleFormModalProps) => {
  const handleCancel = () => {
    // Handle unsaved changes confirmation if needed
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="role-form-modal">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Custom Role" : "Edit Role"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define a new custom role with specialized focus and responsibilities."
              : "Update the role name and description."}
          </DialogDescription>
        </DialogHeader>

        <CreateRoleForm
          mode={mode}
          initialData={role}
          onSave={onSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
```

### 2. Add Unsaved Changes Protection

**Change detection:**

- Track form dirty state to detect unsaved changes
- Show confirmation dialog when closing with unsaved changes
- Integrate with browser beforeunload for additional protection
- Provide clear options for saving or discarding changes

### 3. Implement Modal State Management

**State coordination:**

- Manage modal open/close state properly
- Reset form state when modal closes
- Handle initial data loading for edit mode
- Coordinate with parent component state

### 4. Add Keyboard Shortcuts

**Keyboard support:**

- Ctrl/Cmd + S to save form
- Escape to close modal (with unsaved changes check)
- Tab navigation within modal form
- Focus management when modal opens/closes

### 5. Create Modal Hook

**File: `apps/desktop/src/hooks/useRoleFormModal.ts`**

- Custom hook for managing modal and form state
- Handle create and edit workflows
- Integrate with custom roles store
- Provide success/error feedback

## Detailed Acceptance Criteria

### Modal Behavior

- [ ] Modal opens and closes smoothly with proper animations
- [ ] Modal title changes appropriately for create vs edit mode
- [ ] Modal description provides helpful context for each mode
- [ ] Modal prevents background interaction when open
- [ ] Modal closes when clicking overlay (with unsaved changes check)

### Form Integration

- [ ] CreateRoleForm renders correctly within modal
- [ ] Form data pre-populates correctly in edit mode
- [ ] Form validation works properly within modal context
- [ ] Form submission triggers modal close on success
- [ ] Form errors display correctly within modal layout

### Unsaved Changes Protection

- [ ] Modal shows confirmation when closing with unsaved changes
- [ ] User can choose to save, discard, or cancel close operation
- [ ] Confirmation dialog is clear about potential data loss
- [ ] Browser beforeunload protection works for accidental page close
- [ ] Change detection is accurate and responsive

### Accessibility

- [ ] Modal has proper ARIA labels and dialog role
- [ ] Focus trapped within modal when open
- [ ] Focus restored to trigger element when modal closes
- [ ] Screen readers announce modal content correctly
- [ ] Keyboard navigation works throughout modal

### State Management

- [ ] Modal state syncs properly with parent component
- [ ] Form resets correctly when switching between create/edit modes
- [ ] Loading states prevent interaction during save operations
- [ ] Error states allow user to retry failed operations
- [ ] Success states provide clear feedback and close modal

### Responsive Design

- [ ] Modal adapts to different screen sizes appropriately
- [ ] Form remains usable on mobile devices
- [ ] Modal doesn't exceed viewport bounds on small screens
- [ ] Touch interactions work properly on mobile
- [ ] Content scrollable if modal height exceeds viewport

### Performance

- [ ] Modal renders efficiently without unnecessary re-renders
- [ ] Form performance remains smooth within modal context
- [ ] Modal animations don't block user interaction
- [ ] Component unmounts properly when closed
- [ ] Memory usage remains stable with repeated open/close

### Testing Requirements

- [ ] Unit tests for modal rendering in create and edit modes
- [ ] Integration tests with CreateRoleForm component
- [ ] Tests for unsaved changes protection flow
- [ ] Accessibility tests with axe-core integration
- [ ] User interaction tests for keyboard shortcuts

## Implementation Notes

- Use shadcn/ui Dialog components for consistent modal behavior
- Follow existing modal patterns from other settings sections
- Ensure proper z-index management with other UI elements
- Consider using React Portal for modal rendering

## Dependencies

- Requires: T-create-createroleform-component (CreateRoleForm component)

## Security Considerations

- Validate form data before processing in modal
- Prevent modal from being bypassed for data manipulation
- Ensure proper cleanup of sensitive form data when modal closes
- Handle form submission securely with proper validation

### Log

**2025-07-29T20:26:45.249440Z** - Implemented comprehensive role creation and editing modal with form integration. Created RoleFormModal component using shadcn/ui Dialog that houses the existing CreateRoleForm component. Added useRoleFormModal hook for state management with create/edit modes. Modal features unsaved changes protection with confirmation dialog, keyboard shortcuts (Ctrl/Cmd+S, Escape), proper focus management, and loading states. Updated CustomRolesTab to use internal modal management instead of callback props. All components follow existing project patterns and pass quality checks.

- filesChanged: ["packages/shared/src/types/ui/components/RoleFormModalProps.ts", "packages/shared/src/types/ui/components/index.ts", "packages/shared/src/types/hooks/UseRoleFormModalReturn.ts", "packages/shared/src/types/hooks/index.ts", "packages/shared/src/types/ui/components/CustomRolesTabProps.ts", "apps/desktop/src/components/settings/RoleFormModal.tsx", "apps/desktop/src/hooks/useRoleFormModal.ts", "apps/desktop/src/components/settings/CustomRolesTab.tsx"]
