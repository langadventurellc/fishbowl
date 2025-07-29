---
kind: task
id: T-create-role-confirmation-dialog
parent: F-roles-section-implementation
status: done
title: Create role confirmation dialog for delete operations
priority: normal
prerequisites:
  - T-create-role-interfaces-and
created: "2025-07-29T11:03:04.446052"
updated: "2025-07-29T15:01:01.041635"
schema_version: "1.1"
worktree: null
---

# Create Role Confirmation Dialog for Delete Operations

## Context

Implement a confirmation dialog component specifically for role deletion to prevent accidental data loss. The dialog will provide clear context about the destructive action and require explicit user confirmation.

## Technical Approach

### 1. Create Shared Types First

**IMPORTANT: Before implementing components, create all types in the shared package following the project's architecture standards.**

**File: `packages/shared/src/types/ui/components/RoleDeleteDialogProps.ts`**

```typescript
/**
 * RoleDeleteDialog component props interface.
 *
 * @module types/ui/components/RoleDeleteDialogProps
 */

import type { CustomRole } from "../../settings/CustomRole";

export interface RoleDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  role: CustomRole | null;
  onConfirm: (role: CustomRole) => void;
  isLoading?: boolean;
}
```

**Update exports in `packages/shared/src/types/ui/components/index.ts`:**

```typescript
export * from "./RoleDeleteDialogProps";
```

**Run `pnpm build:libs` after adding shared types to make them available to desktop app.**

### 2. Create RoleDeleteDialog Component

**File: `apps/desktop/src/components/settings/RoleDeleteDialog.tsx`**

Implement dialog using shadcn/ui AlertDialog:

```tsx
import { type RoleDeleteDialogProps } from "@fishbowl-ai/shared";

export const RoleDeleteDialog = ({
  isOpen,
  onOpenChange,
  role,
  onConfirm,
  isLoading,
}: RoleDeleteDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Custom Role</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{role?.name}"? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => role && onConfirm(role)}>
            Delete Role
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

### 2. Add Role Context Display

**Context information:**

- Display role name prominently in confirmation text
- Show role description if needed for additional context
- Use warning styling to emphasize destructive nature
- Clear messaging about permanence of deletion

### 3. Implement Loading States

**Loading behavior:**

- Disable action buttons during deletion operation
- Show loading spinner in Delete button
- Prevent dialog closing during operation
- Handle operation completion and error states

### 4. Add Keyboard Shortcuts

**Keyboard support:**

- Enter key confirms deletion (with focus management)
- Escape key cancels dialog
- Tab navigation between Cancel and Delete buttons
- Proper focus trap within dialog

### 5. Create Dialog Hook

**File: `apps/desktop/src/hooks/useRoleDeleteDialog.ts`**

- Custom hook for managing dialog state
- Handle role selection and confirmation flow
- Integrate with custom roles store for deletion
- Provide error handling and user feedback

## Detailed Acceptance Criteria

### Dialog Content

- [ ] Dialog title clearly states "Delete Custom Role" or similar
- [ ] Role name displayed prominently in confirmation message
- [ ] Warning text emphasizes action cannot be undone
- [ ] Confirmation message is specific and contextual (not generic)
- [ ] Dialog styling follows existing confirmation dialog patterns

### Action Buttons

- [ ] Cancel button allows user to abort operation safely
- [ ] Delete button clearly labeled as destructive action
- [ ] Delete button uses danger/destructive styling (red coloring)
- [ ] Buttons positioned consistently with other confirmation dialogs
- [ ] Button focus order follows logical interaction pattern

### Loading and State Management

- [ ] Delete button shows loading state during operation
- [ ] Both buttons disabled during deletion to prevent double-clicks
- [ ] Dialog remains open during operation with loading feedback
- [ ] Dialog closes automatically after successful deletion
- [ ] Error handling displays failure message without closing dialog

### Accessibility

- [ ] Dialog has proper ARIA labels and roles
- [ ] Screen readers announce dialog content clearly
- [ ] Focus management works correctly (trap focus, restore on close)
- [ ] Keyboard navigation between buttons is intuitive
- [ ] High contrast mode preserves dialog readability

### Integration

- [ ] Dialog integrates properly with CustomRoleListItem delete action
- [ ] Role data passed correctly to dialog for context display
- [ ] Confirmation triggers proper store deletion operation
- [ ] Dialog state resets properly between different role deletions
- [ ] Component handles undefined/null role data gracefully

### User Experience

- [ ] Dialog appears immediately when delete action triggered
- [ ] Confirmation process feels secure and intentional
- [ ] User can easily cancel if deletion was accidental
- [ ] Success feedback provided after successful deletion
- [ ] Error feedback allows user to retry failed deletion

### Error Handling

- [ ] Network errors during deletion displayed clearly
- [ ] Dialog allows retry of failed deletion operations
- [ ] Component recovers gracefully from error states
- [ ] Error messages are specific and actionable
- [ ] Dialog state resets properly after error resolution

### Testing Requirements

- [ ] Unit tests for dialog rendering with different role data
- [ ] Interaction tests for cancel and confirm actions
- [ ] Loading state tests during deletion operations
- [ ] Accessibility tests with axe-core integration
- [ ] Error handling tests for failed deletion scenarios

## Implementation Notes

- Use shadcn/ui AlertDialog components for consistent styling
- Follow existing confirmation dialog patterns from other sections
- Ensure proper TypeScript typing for all props and state
- Consider using React Query or similar for optimistic updates

## Dependencies

- Requires: T-create-role-interfaces-and (CustomRole interface)

## Security Considerations

- Validate role data before displaying in dialog
- Ensure deletion operation cannot be triggered without explicit confirmation
- Prevent double-deletion through proper loading state management
- Log deletion operations for audit purposes if needed

### Log

**2025-07-29T20:11:01.437362Z** - Implemented comprehensive role deletion confirmation dialog system with shadcn/ui AlertDialog, proper loading states, keyboard shortcuts, accessibility support, and integration with custom roles store. The dialog provides contextual information about role being deleted, prevents accidental data loss, supports Enter/Escape shortcuts, shows loading states during deletion, and follows established component patterns.

- filesChanged: ["packages/shared/src/types/ui/components/RoleDeleteDialogProps.ts", "packages/shared/src/types/ui/components/index.ts", "apps/desktop/package.json", "apps/desktop/src/components/ui/alert-dialog.tsx", "apps/desktop/src/components/settings/RoleDeleteDialog.tsx", "apps/desktop/src/hooks/useRoleDeleteDialog.ts", "apps/desktop/src/components/settings/index.ts"]
