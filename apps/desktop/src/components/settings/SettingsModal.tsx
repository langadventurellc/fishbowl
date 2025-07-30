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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { generateDialogAriaIds, useAccessibilityAnnouncements } from "@/utils";
import {
  SettingsModalProps,
  useActiveSection,
  useModalState,
  useSettingsActions,
} from "@fishbowl-ai/shared";
import React, { useEffect } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useGlobalKeyboardShortcuts } from "../../hooks/useGlobalKeyboardShortcuts";
import { ModalFooter } from "./ModalFooter";
import { ModalHeader } from "./ModalHeader";
import { SettingsContent } from "./SettingsContent";
import { SettingsNavigation } from "./SettingsNavigation";

const useModalClasses = () => ({
  overlay: cn(
    // Enhanced overlay styling with precise requirements
    "fixed inset-0 z-50 bg-black/50",
    // Smooth fade animations
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:duration-200 data-[state=open]:duration-200",
    // Prevent layout shift
    "transition-opacity",
  ),
  content: cn(
    // Remove default shadcn/ui styles that conflict with custom requirements
    "!max-w-none !gap-0 !p-0 flex flex-col",
    // Enhanced responsive behavior
    // Large screens: 80% viewport, max 1200px
    "!w-[80vw] h-[80vh] !max-w-[1200px] max-h-[700px]",
    // Medium screens (< 1000px): 95% width, navigation 180px
    "max-[1000px]:w-[95vw]",
    // Small screens (< 800px): Full width content area, collapsible navigation
    "max-[800px]:w-[95vw] max-[800px]:h-[90vh]",
    // Minimum constraints
    "min-w-[800px] min-h-[500px]",
    // Enhanced z-index for content above overlay
    "z-50",
    // Custom styling as per requirements
    "rounded-lg", // 8px border radius
    // Custom shadow: 0 10px 25px rgba(0, 0, 0, 0.3)
    "shadow-[0_10px_25px_rgba(0,0,0,0.3)]",
    // Enhanced focus indicators for keyboard navigation
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // High contrast focus indicators
    "focus-visible:ring-offset-background",
  ),
  children: cn(
    "h-full w-full flex flex-col",
    // Ensure content is keyboard accessible
    "focus-within:outline-none",
    // Enhanced visual focus indicators
    "[&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-ring [&_button:focus-visible]:ring-offset-2",
    "[&_input:focus-visible]:ring-2 [&_input:focus-visible]:ring-ring [&_input:focus-visible]:ring-offset-2",
    "[&_[role=tab]:focus-visible]:ring-2 [&_[role=tab]:focus-visible]:ring-ring [&_[role=tab]:focus-visible]:ring-offset-2",
    "[&_[role=menuitem]:focus-visible]:ring-2 [&_[role=menuitem]:focus-visible]:ring-ring [&_[role=menuitem]:focus-visible]:ring-offset-2",
  ),
});

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
  // Generate consistent ARIA IDs using accessibility utilities
  const dialogIds = generateDialogAriaIds("settings-modal");

  // Accessibility announcements
  const { announceStateChange } = useAccessibilityAnnouncements();

  // Zustand store hooks for state management
  const { isOpen: storeIsOpen } = useModalState();
  const activeSection = useActiveSection();
  const { openModal, closeModal } = useSettingsActions();

  // Check if there are any nested dialogs open (like AgentFormModal)
  const [hasNestedDialog, setHasNestedDialog] = React.useState(false);

  React.useEffect(() => {
    const checkForNestedDialogs = () => {
      // Check if any Radix dialog content is present in the DOM
      // Look for the agent-form-modal class specifically
      const hasDialog = document.querySelector(".agent-form-modal") !== null;
      setHasNestedDialog(hasDialog);
    };

    // Check immediately and set up observer
    checkForNestedDialogs();

    // Use MutationObserver to detect when dialogs are added/removed
    const observer = new MutationObserver(checkForNestedDialogs);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Focus trap integration for modal-level focus management
  // Disable when nested dialogs are open to avoid conflicts
  const { containerRef } = useFocusTrap({
    isActive: open && !hasNestedDialog,
    restoreFocus: true,
    initialFocusSelector: "[data-modal-initial-focus]",
  });

  // Global keyboard shortcuts for modal-wide actions
  // Disable when nested dialogs are open to let them handle their own shortcuts
  useGlobalKeyboardShortcuts({
    shortcuts: {
      Escape: () => onOpenChange(false),
      "Ctrl+S": () => {
        // TODO: Implement save functionality when Save button logic is added
        console.log("Save shortcut triggered (Ctrl+S)");
      },
      "Meta+S": () => {
        // TODO: Implement save functionality when Save button logic is added
        console.log("Save shortcut triggered (Cmd+S)");
      },
    },
    enabled: open && !hasNestedDialog,
    preventDefault: true,
  });

  // Announce modal state changes for screen readers
  useEffect(() => {
    if (open) {
      announceStateChange(
        "Settings modal opened. Use Tab to navigate, Escape to close.",
      );
    }
  }, [open, announceStateChange]);

  // Sync external props with store state
  useEffect(() => {
    if (open !== storeIsOpen) {
      if (open) {
        openModal();
      } else {
        closeModal();
      }
    }
  }, [open, storeIsOpen, openModal, closeModal]);

  // Sync store changes back to external prop handler
  useEffect(() => {
    if (storeIsOpen !== open) {
      onOpenChange(storeIsOpen);
    }
  }, [storeIsOpen, open, onOpenChange]);

  // Extract class names using custom hook
  const classes = useModalClasses();

  /**
   * Prevents event bubbling to ensure modal content clicks don't trigger overlay close
   */
  const handleContentClick = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className={classes.overlay} />
        <DialogContent
          ref={containerRef}
          className={classes.content}
          showCloseButton={false}
          // Prevent modal content clicks from bubbling to overlay
          onPointerDown={handleContentClick}
          // Enhanced ARIA attributes for screen reader support
          aria-labelledby={dialogIds.titleId}
          aria-describedby={dialogIds.descriptionId}
          aria-modal="true"
          role="dialog"
          data-settings-modal="true"
          tabIndex={-1}
          // Additional accessibility attributes for better screen reader experience
          aria-live="polite"
          aria-relevant="additions removals"
        >
          {/* Enhanced screen reader elements for accessibility */}
          <DialogHeader className="sr-only">
            <DialogTitle id={dialogIds.titleId}>{title}</DialogTitle>
            <DialogDescription id={dialogIds.descriptionId}>
              {description}
            </DialogDescription>
          </DialogHeader>

          {/* Main modal content container with enhanced landmarks */}
          <div
            className="h-full w-full flex flex-col max-h-full rounded-lg overflow-hidden"
            role="application"
            aria-label="Settings application"
          >
            {/* Modal Header with banner landmark */}
            <ModalHeader title={title} titleId={dialogIds.titleId} />

            {/* Modal body with navigation and content landmarks */}
            <div
              className="flex-1 flex max-[799px]:flex-col min-[800px]:flex-row overflow-hidden"
              role="main"
              id={dialogIds.mainId}
            >
              {/* Navigation Panel with navigation landmark */}
              <SettingsNavigation
                navigationId={dialogIds.navigationId}
                activeSection={activeSection}
              />

              {/* Content Area with main landmark */}
              <SettingsContent
                activeSection={activeSection}
                contentId={dialogIds.contentId}
              />

              {/* Backward compatibility: render children if provided */}
              {children && (
                <div
                  className={classes.children}
                  role="complementary"
                  aria-label="Additional settings content"
                  aria-describedby={dialogIds.descriptionId}
                >
                  {children}
                </div>
              )}
            </div>

            {/* Modal Footer with contentinfo landmark */}
            <ModalFooter />
          </div>

          {/* Enhanced live region for comprehensive announcements */}
          <div
            id={dialogIds.announcementId}
            aria-live="polite"
            aria-atomic="false"
            aria-relevant="additions"
            className="sr-only"
            role="status"
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
