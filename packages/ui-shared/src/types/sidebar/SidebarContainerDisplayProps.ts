import React from "react";

/**
 * Props interface for SidebarContainerDisplay component
 */
export interface SidebarContainerDisplayProps {
  /**
   * Sidebar width in pixels. Takes priority over collapsed prop.
   * When provided, collapsed state is derived internally (width <= 50px).
   *
   * Enables fine-grained control over sidebar width for resize functionality
   * while maintaining backward compatibility with boolean collapsed state.
   *
   * @default 200
   *
   * @example
   * ```typescript
   * // Using explicit width (new approach)
   * <SidebarContainerDisplay width={250} />
   *
   * // Width-based collapsed state (width <= 50px)
   * <SidebarContainerDisplay width={0} />
   *
   * // Backward compatibility (when width not provided)
   * <SidebarContainerDisplay collapsed={true} />
   * ```
   */
  width?: number;

  /**
   * Whether the sidebar is in collapsed state (backward compatibility).
   * Used only when width prop is not provided.
   *
   * When both width and collapsed are provided, width takes priority
   * and collapsed state is derived from width <= 50px.
   *
   * @default false
   */
  collapsed?: boolean;

  /**
   * Currently selected conversation ID.
   * Used to track which conversation is active for agent management.
   */
  selectedConversationId?: string | null;

  /**
   * Handler for conversation selection changes.
   * Called when user selects a different conversation in the sidebar.
   */
  onConversationSelect?: (conversationId: string | null) => void;

  /**
   * Additional CSS class names to apply to the container
   * @default ""
   */
  className?: string;

  /**
   * Custom styles to apply to the container
   * Merged with component styles, custom styles take precedence
   */
  style?: React.CSSProperties;
}
