/**
 * SettingsModal component provides a customized modal dialog for application settings.
 *
 * Built on top of shadcn/ui Dialog components with custom dimensions and styling
 * that meets specific design requirements for the settings interface.
 *
 * Key Features:
 * - Custom dimensions: 80% viewport size with min/max constraints
 * - Perfect viewport centering with responsive behavior
 * - Custom styling: 8px border radius, custom shadow
 * - Semi-transparent overlay with proper z-index management
 * - Integrates with application theme system
 *
 * Dimensions:
 * - Width: 80vw (min: 800px, max: 1000px)
 * - Height: 80vh (min: 500px, max: 700px)
 * - Border radius: 8px
 * - Shadow: 0 10px 25px rgba(0, 0, 0, 0.3)
 *
 * @module components/settings/SettingsModal
 */

import React from "react";
import { SettingsModalProps } from "@fishbowl-ai/shared";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

/**
 * SettingsModal component for displaying application settings.
 *
 * Wraps shadcn/ui Dialog components with custom styling to meet specific
 * design requirements for the settings modal experience.
 *
 * @param props - The settings modal props
 * @returns JSX element representing the settings modal
 */
export function SettingsModal({
  open,
  onOpenChange,
  children,
}: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Remove default shadcn/ui styles that conflict with custom requirements
          "!max-w-none !w-auto !h-auto !gap-0 !p-0",
          // Custom dimensions with responsive behavior
          "w-[80vw] h-[80vh]",
          "min-w-[800px] min-h-[500px]",
          "max-w-[1000px] max-h-[700px]",
          // Custom styling as per requirements
          "rounded-lg", // 8px border radius
          // Custom shadow: 0 10px 25px rgba(0, 0, 0, 0.3)
          "shadow-[0_10px_25px_rgba(0,0,0,0.3)]",
          // Responsive adjustments for smaller screens
          "max-sm:w-[95vw] max-sm:h-[90vh]",
          "max-sm:min-w-[320px] max-sm:min-h-[400px]",
        )}
        showCloseButton={true}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
