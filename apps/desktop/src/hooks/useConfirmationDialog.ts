/**
 * useConfirmationDialog hook provides confirmation dialog functionality.
 *
 * Features:
 * - Custom shadcn/ui dialog component integration
 * - Async/await friendly interface
 * - Configurable title, message, and button text
 * - Support for different variants (default, destructive)
 * - Proper focus management and accessibility
 *
 * @module hooks/useConfirmationDialog
 */

import { useState, useCallback } from "react";
import type { ConfirmationDialogProps } from "../components/ui/confirmation-dialog";

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant?: "default" | "destructive";
}

interface ConfirmationState extends ConfirmationOptions {
  open: boolean;
  resolve: (value: boolean) => void;
}

export function useConfirmationDialog() {
  const [state, setState] = useState<ConfirmationState | null>(null);

  const showConfirmation = useCallback(
    (options: ConfirmationOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          ...options,
          open: true,
          resolve,
        });
      });
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    state?.resolve(true);
    setState(null);
  }, [state]);

  const handleCancel = useCallback(() => {
    state?.resolve(false);
    setState(null);
  }, [state]);

  const confirmationDialogProps: ConfirmationDialogProps | null = state
    ? {
        open: state.open,
        onOpenChange: (open: boolean) => {
          if (!open) handleCancel();
        },
        title: state.title,
        message: state.message,
        confirmText: state.confirmText,
        cancelText: state.cancelText,
        variant: state.variant,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
      }
    : null;

  return {
    showConfirmation,
    confirmationDialogProps,
  };
}
