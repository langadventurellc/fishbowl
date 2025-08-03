/**
 * ModalHeader component provides the header section for the settings modal.
 *
 * Creates a dedicated header with title and close button that meets exact UI specifications:
 * - Height: 50px with proper background styling
 * - Title: "Settings" with 18px font, left-aligned with 20px padding
 * - Close button: Standard × button, right-aligned with 40x40px hover area
 * - Background: Slightly darker than content area for visual hierarchy
 *
 * Key Features:
 * - Integrates with Zustand store for modal close functionality
 * - WCAG 2.1 AA compliant accessibility features
 * - Keyboard navigation support (Tab, Enter, Space)
 * - Screen reader compatible with proper ARIA attributes
 * - Proper hover and focus states
 *
 * @module components/settings/ModalHeader
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COMMON_FOCUS_CLASSES, getFocusClasses } from "@/styles/focus";
import { ModalHeaderProps, useSettingsModal } from "@fishbowl-ai/ui-shared";
import { XIcon } from "lucide-react";
import React from "react";

/**
 * ModalHeader component for settings modal.
 *
 * Renders a header with title and close button according to exact specifications.
 * Integrates with Zustand store for modal state management and provides full
 * accessibility support including keyboard navigation and screen reader compatibility.
 *
 * @param props - The modal header props
 * @returns JSX element representing the modal header
 */
export function ModalHeader({
  title = "Settings",
  className,
  onClose,
  titleId = "modal-title", // Default ID
}: ModalHeaderProps) {
  // Zustand store hook for modal state management
  const { closeModal } = useSettingsModal();

  // Use custom close handler if provided, otherwise use store action
  const handleClose = onClose || closeModal;

  /**
   * Handle close button click with proper event handling
   */
  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleClose();
  };

  /**
   * Handle keyboard navigation for close button
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
    }
  };

  return (
    <header
      className={cn(
        // Exact height specification using design token
        "h-[var(--dt-modal-header-height)]",
        // Background slightly darker than content area for visual hierarchy
        "bg-background/95 border-b border-border/50",
        // Layout: flex with space between for title and close button
        "flex items-center justify-between",
        // Padding: 20px horizontal using design token
        "px-[var(--dt-modal-header-padding)]",
        // Ensure proper z-index for header layering
        "relative z-10",
        // Custom className for additional styling
        className,
      )}
      role="banner"
      aria-label="Modal header"
    >
      {/* Title section */}
      <h1
        className={cn(
          // Exact font specifications: 18px font, medium weight
          "text-lg font-medium",
          // Left-aligned (default for h1)
          "text-left",
          // Ensure proper text color
          "text-foreground",
          // Prevent text selection on title
          "select-none",
        )}
        id={titleId}
      >
        {title}
      </h1>

      {/* Close button section */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCloseClick}
        onKeyDown={handleKeyDown}
        className={cn(
          // Exact dimensions: 40x40px hover area
          "w-10 h-10",
          // Ensure proper hover and focus states
          "hover:bg-accent/50 focus-visible:bg-accent/50",
          // Enhanced focus indicators for critical close button
          COMMON_FOCUS_CLASSES.removeOutline,
          COMMON_FOCUS_CLASSES.backgroundOffset,
          COMMON_FOCUS_CLASSES.enhancedOpacity,
          getFocusClasses("highContrast"),
          // Smooth transitions
          COMMON_FOCUS_CLASSES.transition,
        )}
        aria-label="Close settings modal"
        aria-describedby="close-button-description"
        title="Close settings (Esc)"
        data-modal-initial-focus
        data-testid="close-modal-button"
      >
        <XIcon className="w-4 h-4" aria-hidden="true" />

        {/* Hidden description for screen readers */}
        <span id="close-button-description" className="sr-only">
          Press Enter or Space to close the settings modal, or press Escape key
          anywhere in the modal
        </span>
      </Button>
    </header>
  );
}
