/**
 * ThinkingIndicatorProps interface for animated thinking indicator component.
 *
 * Defines the props contract for the ThinkingIndicator component that displays
 * an animated pulsing dot to indicate agent thinking state. Supports different
 * sizes, colors, and animation speeds for various use cases.
 *
 * @module types/ui/components/ThinkingIndicatorProps
 */

/**
 * Props interface for the ThinkingIndicator component.
 *
 * This interface defines the properties for the animated pulsing dot component
 * that indicates when an agent is thinking. The component supports customizable
 * sizing, coloring, and animation timing for different visual contexts.
 *
 * @example
 * ```typescript
 * // Default thinking indicator (medium, primary color, normal speed)
 * const defaultIndicator: ThinkingIndicatorProps = {};
 *
 * // Small red indicator with slow animation
 * const customIndicator: ThinkingIndicatorProps = {
 *   size: "small",
 *   color: "#ef4444",
 *   animationSpeed: "slow"
 * };
 *
 * // Large indicator with fast animation
 * const largeIndicator: ThinkingIndicatorProps = {
 *   size: "large",
 *   animationSpeed: "fast",
 *   className: "custom-thinking-indicator"
 * };
 * ```
 */
export interface ThinkingIndicatorProps {
  /**
   * Size variant controlling the dot's dimensions.
   *
   * - **small**: 4px diameter for compact spaces
   * - **medium**: 6px diameter for standard use (default)
   * - **large**: 8px diameter for prominent display
   *
   * @default "medium"
   */
  size?: "small" | "medium" | "large";

  /**
   * Color of the thinking indicator dot.
   * Can be any valid CSS color value (hex, rgb, css custom property, named color).
   *
   * @default "var(--primary)" (theme-aware primary color)
   * @example "#ef4444", "rgb(239, 68, 68)", "var(--destructive)", "red"
   */
  color?: string;

  /**
   * Speed of the pulsing animation.
   *
   * - **slow**: 2 second pulse cycle for subtle indication
   * - **normal**: 1.5 second pulse cycle for standard use (default)
   * - **fast**: 1 second pulse cycle for urgent/active indication
   *
   * @default "normal"
   */
  animationSpeed?: "slow" | "normal" | "fast";

  /**
   * Optional CSS class name for additional custom styling.
   * Applied to the root indicator element.
   *
   * @example "custom-thinking-dot", "sidebar-indicator"
   */
  className?: string;
}
