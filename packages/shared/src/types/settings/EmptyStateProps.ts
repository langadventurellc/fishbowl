/**
 * Props interface for empty state components.
 *
 * Provides consistent API for empty state components across the application
 * with optional action callback and styling customization.
 */
export interface EmptyStateProps {
  /**
   * Optional callback function triggered when the primary action button is clicked.
   * If undefined, the button will still render but perform no action.
   */
  onAction?: () => void;

  /**
   * Optional additional CSS classes to apply to the root container.
   * Merged with default styling using cn utility.
   */
  className?: string;
}
