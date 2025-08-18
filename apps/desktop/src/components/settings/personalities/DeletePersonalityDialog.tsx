/**
 * DeletePersonalityDialog component provides a confirmation dialog for personality deletion operations.
 *
 * Features:
 * - Contextual information about the personality being deleted
 * - Loading states during deletion operation
 * - Keyboard shortcuts (Enter to confirm, Escape to cancel)
 * - Proper focus management and accessibility
 * - Warning styling for destructive actions
 *
 * @module components/settings/personalities/DeletePersonalityDialog
 */

import type { PersonalityDeleteDialogProps } from "@fishbowl-ai/ui-shared";
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

export const DeletePersonalityDialog = memo<PersonalityDeleteDialogProps>(
  function DeletePersonalityDialog({
    isOpen,
    onOpenChange,
    personality,
    onConfirm,
    isLoading = false,
  }) {
    // Handle keyboard shortcuts
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" && !isLoading && personality) {
          event.preventDefault();
          onConfirm(personality);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, personality, onConfirm]);

    // Prevent dialog closing during operation
    const handleOpenChange = (newOpen: boolean) => {
      if (isLoading) return;
      onOpenChange(newOpen);
    };

    const handleConfirmDelete = () => {
      if (personality && !isLoading) {
        onConfirm(personality);
      }
    };

    return (
      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Personality</AlertDialogTitle>
            <AlertDialogDescription>
              {personality ? (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">
                    "{personality.name}"
                  </span>
                  ? This action cannot be undone.
                </>
              ) : (
                "Are you sure you want to delete this personality? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isLoading || !personality}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              aria-label={
                personality
                  ? `Delete ${personality.name} personality`
                  : "Delete personality"
              }
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);
