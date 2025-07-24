/**
 * MessageAvatarProps interface for the MessageAvatar component.
 *
 * Defines props for the visual avatar/color indicator component that displays
 * agent identification in message headers through colored circles or pills.
 *
 * @module types/ui/components/MessageAvatarProps
 */

import { ComponentSize } from "./ComponentSize";

/**
 * Props interface for the MessageAvatar component.
 *
 * MessageAvatar displays a colored circle/pill to visually identify message senders
 * (agents) in the conversation interface. Extracted from DesignPrototype.tsx to
 * create a reusable display component for message sender identification.
 *
 * @example
 * ```typescript
 * // Basic usage with required props
 * <MessageAvatar
 *   agentColor="#3b82f6"
 *   agentName="Technical Advisor"
 *   role="Technical Advisor"
 * />
 *
 * // With size variant and custom styling
 * <MessageAvatar
 *   agentColor="#22c55e"
 *   agentName="Project Manager"
 *   role="Project Manager"
 *   size="large"
 *   className="custom-avatar"
 * />
 * ```
 */
export interface MessageAvatarProps {
  /**
   * Hex color code for the agent's visual theming.
   * Used for the circle/pill background color to provide visual
   * association with the agent throughout the conversation interface.
   * Should be a valid CSS hex color value.
   *
   * @example "#3b82f6" (blue), "#22c55e" (green), "#ef4444" (red), "#a855f7" (purple)
   */
  agentColor: string;

  /**
   * Display name of the AI agent.
   * Used for accessibility attributes and tooltip text to provide
   * context about which agent the avatar represents.
   *
   * @example "Technical Advisor", "Project Manager", "Creative Director"
   */
  agentName: string;

  /**
   * Role or specialty of the AI agent.
   * Provides additional context about the agent's expertise and
   * responsibilities, used in accessibility attributes.
   *
   * @example "Technical Advisor", "Senior Project Manager", "UX Designer"
   */
  role: string;

  /**
   * Size variant for the avatar component.
   * Controls the dimensions and visual prominence of the colored circle/pill.
   * - "small": 12px circle for compact spaces
   * - "medium": 16px circle for standard message headers (default)
   * - "large": 20px circle for emphasis or larger layouts
   *
   * @default "medium"
   */
  size?: ComponentSize;

  /**
   * Optional CSS class name for custom styling.
   * Allows additional styling to be applied to the avatar container
   * while preserving the base component styling.
   */
  className?: string;
}
