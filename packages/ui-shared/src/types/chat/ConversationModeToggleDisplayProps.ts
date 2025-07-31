/**
 * ConversationModeToggleDisplayProps interface for mode toggle display component.
 *
 * Defines the props contract for the ConversationModeToggleDisplay component that shows
 * the visual representation of the Manual/Auto mode toggle without any
 * interactive functionality. Used for display-only purposes in component showcase.
 *
 * @module types/ui/components/ConversationModeToggleDisplayProps
 */

import { ConversationMode } from "@fishbowl-ai/shared";

/**
 * Props interface for the ConversationModeToggleDisplayProps component.
 *
 * This interface defines the properties required for displaying a mode toggle
 * in its various visual states. The component is purely display-focused
 * and does not include any event handlers or interactive functionality.
 *
 * @example
 * ```typescript
 * // Manual mode active
 * const manualMode: ConversationModeToggleDisplayProps = {
 *   currentMode: "manual"
 * };
 *
 * // Auto mode active
 * const autoMode: ConversationModeToggleDisplayProps = {
 *   currentMode: "auto"
 * };
 *
 * // Disabled mode toggle
 * const disabledToggle: ConversationModeToggleDisplayProps = {
 *   currentMode: "manual",
 *   disabled: true,
 *   className: "disabled-toggle"
 * };
 *
 * // Custom styled mode toggle
 * const customToggle: ConversationModeToggleDisplayProps = {
 *   currentMode: "auto",
 *   className: "prominent-toggle"
 * };
 * ```
 */
export interface ConversationModeToggleDisplayProps {
  /**
   * The currently active mode displayed in the toggle.
   * Determines which option (Manual or Auto) appears selected
   * and receives the active styling treatment.
   *
   * - **manual**: Manual mode where user controls interactions
   * - **auto**: Automatic mode with system-driven interactions
   */
  currentMode: ConversationMode;

  /**
   * Whether the toggle appears in a disabled state.
   * Disabled toggles show reduced opacity and visual indicators
   * that the toggle is not available for interaction.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root toggle element for custom styling
   * beyond the default theme-aware styling.
   *
   * @example "custom-toggle", "highlighted", "compact-toggle"
   */
  className?: string;
}
