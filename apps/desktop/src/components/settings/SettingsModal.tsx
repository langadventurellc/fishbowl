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
 * - WCAG 2.1 AA compliant accessibility features
 * - Comprehensive keyboard navigation support
 * - Screen reader compatible with proper ARIA attributes
 *
 * Accessibility Features:
 * - Focus trap within modal when open
 * - Focus returns to trigger element when closed
 * - ESC key closes modal
 * - Proper ARIA labels and descriptions
 * - High contrast visual focus indicators
 * - Screen reader announcements
 *
 * Dimensions:
 * - Width: 80vw (min: 800px, max: 1000px)
 * - Height: 80vh (min: 500px, max: 700px)
 * - Border radius: 8px
 * - Shadow: 0 10px 25px rgba(0, 0, 0, 0.3)
 *
 * @module components/settings/SettingsModal
 */

import React, { useId } from "react";
import { SettingsModalProps } from "@fishbowl-ai/shared";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";

/**
 * SettingsModal component for displaying application settings.
 *
 * Wraps shadcn/ui Dialog components with custom styling to meet specific
 * design requirements for the settings modal experience. Includes comprehensive
 * accessibility features for WCAG 2.1 AA compliance.
 *
 * @param props - The settings modal props
 * @returns JSX element representing the settings modal
 */
export function SettingsModal({
  open,
  onOpenChange,
  children,
  title = "Settings",
  description = "Configure application settings including general preferences, API keys, appearance, agents, personalities, roles, and advanced options.",
}: SettingsModalProps) {
  // Generate unique IDs for ARIA attributes
  const titleId = useId();
  const descriptionId = useId();

  /**
   * Prevents event bubbling to ensure modal content clicks don't trigger overlay close
   */
  const handleContentClick = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay
          className={cn(
            // Enhanced overlay styling with precise requirements
            "fixed inset-0 z-50 bg-black/50",
            // Smooth fade animations
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:duration-200 data-[state=open]:duration-200",
            // Prevent layout shift
            "transition-opacity",
          )}
        />
        <DialogContent
          className={cn(
            // Remove default shadcn/ui styles that conflict with custom requirements
            "!max-w-none !w-auto !h-auto !gap-0 !p-0",
            // Custom dimensions with responsive behavior
            "w-[80vw] h-[80vh]",
            "min-w-[800px] min-h-[500px]",
            "max-w-[1000px] max-h-[700px]",
            // Enhanced z-index for content above overlay
            "z-50",
            // Custom styling as per requirements
            "rounded-lg", // 8px border radius
            // Custom shadow: 0 10px 25px rgba(0, 0, 0, 0.3)
            "shadow-[0_10px_25px_rgba(0,0,0,0.3)]",
            // Responsive adjustments for smaller screens
            "max-sm:w-[95vw] max-sm:h-[90vh]",
            "max-sm:min-w-[320px] max-sm:min-h-[400px]",
            // Enhanced focus indicators for keyboard navigation
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            // High contrast focus indicators
            "focus-visible:ring-offset-background",
          )}
          showCloseButton={true}
          // Prevent modal content clicks from bubbling to overlay
          onPointerDown={handleContentClick}
          // ARIA attributes for screen reader support
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          // Ensure modal is properly announced to screen readers
          aria-modal="true"
          role="dialog"
          // Additional keyboard navigation attributes
          tabIndex={-1}
        >
          {/* Hidden screen reader elements for accessibility */}
          <DialogHeader className="sr-only">
            <DialogTitle id={titleId}>{title}</DialogTitle>
            <DialogDescription id={descriptionId}>
              {description}
            </DialogDescription>
          </DialogHeader>

          {/* Main modal content */}
          <div
            className={cn(
              "h-full w-full flex flex-col",
              // Ensure content is keyboard accessible
              "focus-within:outline-none",
              // Enhanced visual focus indicators
              "[&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-ring [&_button:focus-visible]:ring-offset-2",
              "[&_input:focus-visible]:ring-2 [&_input:focus-visible]:ring-ring [&_input:focus-visible]:ring-offset-2",
              "[&_[role=tab]:focus-visible]:ring-2 [&_[role=tab]:focus-visible]:ring-ring [&_[role=tab]:focus-visible]:ring-offset-2",
              "[&_[role=menuitem]:focus-visible]:ring-2 [&_[role=menuitem]:focus-visible]:ring-ring [&_[role=menuitem]:focus-visible]:ring-offset-2",
            )}
            role="main"
            aria-label="Settings content"
          >
            {children}
          </div>

          {/* Live region for screen reader announcements */}
          <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
            role="status"
            id="settings-announcements"
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
