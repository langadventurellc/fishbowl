/**
 * ContextStatisticsProps interface for context statistics display component.
 *
 * Defines the props contract for the ContextStatistics component that displays
 * visual feedback about message inclusion in conversation context. Shows count
 * statistics and warning states for context management.
 *
 * @module types/ui/components/ContextStatisticsProps
 */

import { MessageViewModel } from "../MessageViewModel";

/**
 * Props interface for the ContextStatistics component.
 *
 * This interface defines the properties for displaying context statistics including
 * message inclusion counts, warning states when no messages are included, and
 * optional styling customizations. The component calculates statistics from
 * the provided messages array.
 *
 * @example
 * ```typescript
 * // Display with mixed message inclusion states
 * const contextStats: ContextStatisticsProps = {
 *   messages: [
 *     { id: "1", isActive: true, content: "Hello", type: "user", agent: "User", role: "User", timestamp: "2:10 PM", agentColor: "#6b7280" },
 *     { id: "2", isActive: false, content: "Hi there", type: "agent", agent: "Assistant", role: "Assistant", timestamp: "2:11 PM", agentColor: "#3b82f6" },
 *     { id: "3", isActive: true, content: "How are you?", type: "user", agent: "User", role: "User", timestamp: "2:12 PM", agentColor: "#6b7280" }
 *   ]
 * };
 *
 * // Empty context warning state
 * const emptyContext: ContextStatisticsProps = {
 *   messages: [
 *     { id: "1", isActive: false, content: "Hello", type: "user", agent: "User", role: "User", timestamp: "2:10 PM", agentColor: "#6b7280" }
 *   ],
 *   showWarningIcon: true
 * };
 *
 * // Custom styling
 * const customStats: ContextStatisticsProps = {
 *   messages: [],
 *   className: "custom-context-stats",
 *   variant: "compact"
 * };
 * ```
 */
export interface ContextStatisticsProps {
  /**
   * Array of messages to calculate context statistics from.
   * The component counts messages where isActive is true to determine
   * how many messages are included in the conversation context.
   *
   * An empty array will show "No messages in conversation" state.
   * All messages with isActive: false will show warning state.
   */
  messages: MessageViewModel[];

  /**
   * Display variant controlling the component's visual presentation.
   *
   * - **default**: Standard display with full text and icons (default)
   * - **compact**: Condensed display for tight spaces
   * - **minimal**: Text-only display without decorative elements
   *
   * @default "default"
   */
  variant?: "default" | "compact" | "minimal";

  /**
   * Whether to show warning icon for empty context states.
   * When true, displays a warning icon alongside the empty context message.
   * Useful for drawing attention to potentially problematic states.
   *
   * @default false
   */
  showWarningIcon?: boolean;

  /**
   * Optional CSS class name for additional custom styling.
   * Applied to the root statistics element.
   *
   * @example "custom-stats", "sidebar-context-info", "header-statistics"
   */
  className?: string;
}
