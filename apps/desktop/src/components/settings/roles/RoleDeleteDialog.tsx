/**
 * RoleDeleteDialog component provides a confirmation dialog for role deletion operations.
 *
 * Features:
 * - Contextual information about the role being deleted
 * - Loading states during deletion operation
 * - Keyboard shortcuts (Enter to confirm, Escape to cancel)
 * - Proper focus management and accessibility
 * - Warning styling for destructive actions
 *
 * @module components/settings/RoleDeleteDialog
 */

import type { RoleDeleteDialogProps } from "@fishbowl-ai/ui-shared";
import { Loader2 } from "lucide-react";
import { memo, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

export const RoleDeleteDialog = memo<RoleDeleteDialogProps>(
  function RoleDeleteDialog({
    isOpen,
    onOpenChange,
    role,
    onConfirm,
    isLoading = false,
  }) {
    // Handle keyboard shortcuts
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" && !isLoading && role) {
          event.preventDefault();
          onConfirm(role);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, role, onConfirm]);

    // Prevent dialog closing during operation
    const handleOpenChange = (open: boolean) => {
      if (isLoading) return;
      onOpenChange(open);
    };

    const handleConfirm = () => {
      if (role && !isLoading) {
        onConfirm(role);
      }
    };

    return (
      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              {role ? (
                <>
                  Are you sure you want to delete the role{" "}
                  <span className="font-semibold text-foreground">
                    "{role.name}"
                  </span>
                  ? This action cannot be undone and will permanently remove the
                  role from your collection.
                </>
              ) : (
                "Are you sure you want to delete this role? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isLoading || !role}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              aria-label={role ? `Delete ${role.name} role` : "Delete role"}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);
