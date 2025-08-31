import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { cn } from "../../../lib/utils";

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

export function SettingsFormModal({
  isOpen,
  onOpenChange,
  title,
  children,
  description,
  className,
  dataTestId,
}: SettingsFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        data-form-modal="true"
        className={cn("max-w-2xl", className)}
        data-testid={dataTestId}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
