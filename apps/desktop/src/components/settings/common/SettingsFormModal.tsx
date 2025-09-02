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
 */
const useKeyboardHandling = (
  isOpen: boolean,
  onClose: () => void,
  onRequestSave?: () => void,
) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key handling
      if (event.key === "Escape") {
        event.preventDefault();
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
        event.stopPropagation();
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
