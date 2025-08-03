/**
 * ModalFooter component provides consistent action buttons for the settings modal.
 *
 * The footer serves as the bottom section of the modal with user action controls,
 * implementing exact design specifications including dimensions, styling, and button layout.
 *
 * Key Features:
 * - Exactly 60px height with proper visual separation
 * - Right-aligned buttons with precise spacing (20px padding, 10px gap)
 * - Cancel button (secondary style) closes modal without saving
 * - Save button (primary style) with conditional disabled state
 * - Integration with Zustand state management
 * - Full accessibility support with ARIA attributes
 * - Keyboard navigation compatibility
 *
 * Styling Specifications:
 * - Height: 60px
 * - Background: Same as header (slightly darker than content area)
 * - Border-top: 1px solid border color for visual separation
 * - Button alignment: Right-aligned with 20px padding from modal edge
 * - Button spacing: 10px between Cancel and Save buttons
 * - Button order: Cancel (left), Save (right)
 *
 * @module components/settings/ModalFooter
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COMMON_FOCUS_CLASSES, getButtonFocus } from "@/styles/focus";
import {
  ModalFooterProps,
  useModalState,
  useSettingsActions,
} from "@fishbowl-ai/ui-shared";

/**
 * ModalFooter component for settings modal action buttons.
 *
 * Provides Cancel and Save buttons with proper styling, spacing, and state management.
 * Integrates with Zustand store for modal control and change tracking.
 *
 * @param props - The modal footer props
 * @returns JSX element representing the modal footer
 *
 * @example
 * ```tsx
 * // Basic usage with default store integration
 * <ModalFooter />
 *
 * // With custom handlers
 * <ModalFooter
 *   onCancel={() => console.log('Custom cancel')}
 *   onSave={() => console.log('Custom save')}
 * />
 *
 * // With custom disabled state
 * <ModalFooter saveDisabled={true} />
 * ```
 */
export function ModalFooter({
  onCancel,
  onSave,
  saveDisabled,
  hasUnsavedChanges: hasUnsavedChangesProp,
  className,
}: ModalFooterProps) {
  // Zustand store hooks for modal control and state
  const { hasUnsavedChanges: storeHasUnsavedChanges } = useModalState();
  const { closeModal } = useSettingsActions();

  // Use prop value if provided, otherwise fall back to store value
  const hasChanges = hasUnsavedChangesProp ?? storeHasUnsavedChanges;

  // Use custom handlers if provided, otherwise use store defaults
  const handleCancel = onCancel || closeModal;
  const handleSave =
    onSave ||
    (() => {
      // Trigger form submission via custom event
      window.dispatchEvent(new CustomEvent("settings-save"));
    });

  // Determine save button disabled state
  // For now, always disabled since this is UI-only phase
  const isSaveDisabled = saveDisabled ?? !hasChanges;

  return (
    <footer
      className={cn(
        // Exact height specification using design token
        "h-[var(--dt-modal-footer-height)]",
        // Background: same as header (slightly darker than content area)
        "bg-muted/30",
        // Border-top: 1px solid border color for visual separation
        "border-t border-border",
        // Layout: flex container for button alignment
        "flex items-center justify-end",
        // Padding: 20px from modal edge using design token
        "px-[var(--dt-modal-header-padding)]",
        // Ensure footer stays at bottom
        "flex-shrink-0",
        className,
      )}
      role="contentinfo"
      aria-label="Settings modal actions"
      aria-describedby="footer-description"
    >
      {/* Hidden description for screen readers */}
      <div id="footer-description" className="sr-only">
        Action buttons for the settings modal. Use Tab to navigate between
        buttons.
      </div>
      {/* Button container with precise spacing */}
      <div className="flex gap-[var(--dt-button-gap)]">
        {/* Cancel Button */}
        <Button
          variant="secondary"
          onClick={handleCancel}
          aria-label="Cancel changes and close settings modal"
          aria-describedby="cancel-button-description"
          aria-keyshortcuts="Escape"
          type="button"
          data-testid="cancel-button"
          className={cn(
            COMMON_FOCUS_CLASSES.removeOutline,
            COMMON_FOCUS_CLASSES.backgroundOffset,
            COMMON_FOCUS_CLASSES.transition,
            getButtonFocus("secondary"),
          )}
        >
          Cancel
          <span id="cancel-button-description" className="sr-only">
            Discards any unsaved changes and closes the settings modal
          </span>
        </Button>

        {/* Save Button */}
        <Button
          variant="default"
          onClick={handleSave}
          disabled={isSaveDisabled}
          aria-label={
            isSaveDisabled ? "No changes to save" : "Save settings changes"
          }
          aria-describedby="save-button-description"
          aria-keyshortcuts="Control+S Meta+S"
          type="button"
          data-testid="save-button"
          className={cn(
            COMMON_FOCUS_CLASSES.removeOutline,
            COMMON_FOCUS_CLASSES.backgroundOffset,
            COMMON_FOCUS_CLASSES.transition,
            getButtonFocus("primary", "default", isSaveDisabled),
          )}
        >
          Save
          <span id="save-button-description" className="sr-only">
            {isSaveDisabled
              ? "No changes have been made to save"
              : "Saves all changes made to settings"}
          </span>
        </Button>
      </div>
    </footer>
  );
}
