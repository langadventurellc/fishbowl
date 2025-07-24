/**
 * SendButtonDisplayProps interface for send button display component.
 *
 * Defines the props contract for the SendButtonDisplay component that shows
 * the visual representation of the send button without any interactive
 * functionality. Used for display-only purposes in component showcase.
 *
 * @module types/ui/components/SendButtonDisplayProps
 */

/**
 * Props interface for the SendButtonDisplay component.
 *
 * This interface defines the properties required for displaying a send button
 * in its various visual states. The component is purely display-focused
 * and does not include any event handlers or interactive functionality.
 *
 * @example
 * ```typescript
 * // Basic enabled send button
 * const enabledButton: SendButtonDisplayProps = {
 *   disabled: false,
 *   loading: false
 * };
 *
 * // Disabled send button
 * const disabledButton: SendButtonDisplayProps = {
 *   disabled: true,
 *   "aria-label": "Send button disabled - enter message first"
 * };
 *
 * // Loading state send button
 * const loadingButton: SendButtonDisplayProps = {
 *   loading: true,
 *   className: "sending-animation"
 * };
 *
 * // Custom styled send button
 * const customButton: SendButtonDisplayProps = {
 *   disabled: false,
 *   className: "primary-send-button",
 *   "aria-label": "Send message to agents"
 * };
 * ```
 */
export interface SendButtonDisplayProps {
  /**
   * Whether the button appears in a disabled state.
   * Disabled buttons show reduced opacity and visual indicators
   * that the button is not available for interaction.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the button appears in a loading state.
   * Loading buttons typically show a spinner or animation
   * to indicate that an operation is in progress.
   *
   * @default false
   */
  loading?: boolean;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root button element for custom styling
   * beyond the default theme-aware styling.
   *
   * @example "custom-send-button", "highlighted", "compact-button"
   */
  className?: string;

  /**
   * Optional ARIA label for accessibility.
   * Provides an accessible name for screen readers since the button
   * typically contains only an icon (send arrow).
   *
   * @example "Send message", "Send message to agents", "Submit input"
   */
  "aria-label"?: string;
}
