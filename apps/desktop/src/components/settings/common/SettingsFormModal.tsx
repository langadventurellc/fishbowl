import React, {
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { cn } from "../../../lib/utils";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import { useConfirmationDialog } from "../../../hooks/useConfirmationDialog";
import { announceToScreenReader } from "../../../utils/announceToScreenReader";
import { ConfirmationDialog } from "../../ui/confirmation-dialog";
import { SettingsFormModalRef } from "./SettingsFormModalRef";

interface SettingsFormModalProps {
  // Required
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;

  // Optional
  description?: string;
  className?: string;
  initialFocusSelector?: string;
  announceOnOpen?: string;
  dataTestId?: string;

  // Save integration
  onRequestSave?: () => void;

  // Unsaved changes
  confirmOnClose?: {
    enabled: boolean;
    message: {
      title: string;
      body: string;
      confirmText?: string;
      cancelText?: string;
    };
    onDiscard?: () => void;
  };
}

/**
 * Custom hook for keyboard event handling with capture-phase priority.
 * Uses capture-phase listeners to ensure form modals handle events before parent modals.
 *
 * Key behavior:
 * - Uses stopImmediatePropagation() to prevent other capture-phase listeners from executing
 * - Critical for nested modals where parent modal also has keyboard handlers
 * - Ensures escape key only closes the topmost (form) modal, not parent modals
 */
const useKeyboardHandling = (
  isOpen: boolean,
  onClose: () => void,
  onRequestSave?: () => void,
) => {
  useEffect(() => {
    if (!isOpen) {
      // Dispatch event when form modal closes to notify parent modal
      document.dispatchEvent(new CustomEvent("settingsFormModalClosed"));
      return;
    }

    // Dispatch event when form modal opens to notify parent modal
    document.dispatchEvent(new CustomEvent("settingsFormModalOpened"));

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key handling
      if (event.key === "Escape") {
        event.preventDefault();
        // Use stopImmediatePropagation() to prevent other capture-phase listeners
        // from executing, ensuring parent modals don't also receive this event
        event.stopImmediatePropagation();
        // Also prevent bubble-phase listeners on parent targets (document)
        event.stopPropagation();
        onClose();
        return;
      }

      // Save shortcuts
      if (
        onRequestSave &&
        (event.ctrlKey || event.metaKey) &&
        event.key === "s"
      ) {
        event.preventDefault();
        // Also prevent other handlers from receiving save shortcuts
        event.stopImmediatePropagation();
        onRequestSave();
        return;
      }
    };

    // Use capture phase for priority
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, onClose, onRequestSave]);
};

export const SettingsFormModal = forwardRef<
  SettingsFormModalRef,
  SettingsFormModalProps
>(
  (
    {
      isOpen,
      onOpenChange,
      title,
      children,
      description,
      className,
      initialFocusSelector,
      announceOnOpen,
      dataTestId,
      onRequestSave,
      confirmOnClose,
    },
    ref,
  ) => {
    // Confirmation dialog hook
    const { showConfirmation, confirmationDialogProps } =
      useConfirmationDialog();

    // Handle modal close with confirmation
    const handleClose = useCallback(async () => {
      if (confirmOnClose?.enabled) {
        const confirmed = await showConfirmation({
          title: confirmOnClose.message.title,
          message: confirmOnClose.message.body,
          confirmText: confirmOnClose.message.confirmText || "Discard Changes",
          cancelText: confirmOnClose.message.cancelText || "Cancel",
        });

        if (confirmed) {
          confirmOnClose.onDiscard?.();
          onOpenChange(false);
        }
        // If not confirmed, do nothing (keep modal open)
      } else {
        // No confirmation needed, close immediately
        onOpenChange(false);
      }
    }, [confirmOnClose, onOpenChange, showConfirmation]);

    // Handle Dialog onOpenChange (for external close triggers like clicking outside)
    const handleDialogOpenChange = useCallback(
      (open: boolean) => {
        if (!open) {
          // Dialog wants to close, trigger our confirmation flow
          handleClose();
        }
        // If open is true, ignore (Dialog is opening)
      },
      [handleClose],
    );

    // Focus trap integration
    const { containerRef } = useFocusTrap({
      isActive: isOpen,
      restoreFocus: true,
      initialFocusSelector,
    });

    // Screen reader announcements
    useEffect(() => {
      if (isOpen && announceOnOpen) {
        // Small delay to ensure modal is rendered before announcing
        const timeoutId = setTimeout(() => {
          announceToScreenReader(announceOnOpen, "polite");
        }, 100);

        return () => clearTimeout(timeoutId);
      }
    }, [isOpen, announceOnOpen]);

    // Use keyboard handling hook
    useKeyboardHandling(isOpen, handleClose, onRequestSave);

    // Expose handleClose method via ref
    useImperativeHandle(
      ref,
      () => ({
        handleClose,
      }),
      [handleClose],
    );

    return (
      <>
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent
            ref={containerRef}
            data-form-modal="true"
            className={cn("max-w-2xl", className)}
            data-testid={dataTestId}
            aria-labelledby={`modal-title-${title.replace(/\s+/g, "-").toLowerCase()}`}
            aria-describedby={
              description
                ? `modal-description-${title.replace(/\s+/g, "-").toLowerCase()}`
                : undefined
            }
            onEscapeKeyDown={(event) => {
              // Prevent Radix from closing without our confirmation flow
              event.preventDefault();
              // Ensure neither parent nor any other listeners receive the Escape
              event.stopPropagation();
              event.stopImmediatePropagation();
              // Invoke our confirmation flow
              handleClose();
            }}
          >
            <DialogHeader>
              <DialogTitle
                id={`modal-title-${title.replace(/\s+/g, "-").toLowerCase()}`}
              >
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription
                  id={`modal-description-${title.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
            {children}
          </DialogContent>
        </Dialog>
        {confirmationDialogProps && (
          <ConfirmationDialog {...confirmationDialogProps} />
        )}
      </>
    );
  },
);
