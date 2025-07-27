/**
 * ModalFooterProps interface for ModalFooter component.
 *
 * Defines the props contract for the ModalFooter component that provides
 * consistent action buttons (Cancel/Save) for the settings modal. The footer
 * serves as the bottom section with user action controls implementing exact
 * design specifications.
 *
 * @module types/ui/components/ModalFooterProps
 */

/**
 * Props interface for the ModalFooter component.
 *
 * This interface defines the properties for the modal footer component that
 * displays Cancel and Save buttons with proper styling, spacing, and state
 * management. Integrates with Zustand store for modal control and change tracking.
 *
 * @example
 * ```typescript
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
 *
 * // With unsaved changes indication
 * <ModalFooter hasUnsavedChanges={true} />
 * ```
 */
export interface ModalFooterProps {
  /** Optional custom cancel handler (defaults to store closeModal) */
  onCancel?: () => void;

  /** Optional custom save handler (for future integration) */
  onSave?: () => void;

  /** Override save button disabled state */
  saveDisabled?: boolean;

  /** Whether there are unsaved changes (for future enhancement) */
  hasUnsavedChanges?: boolean;

  /** Additional CSS classes */
  className?: string;
}
