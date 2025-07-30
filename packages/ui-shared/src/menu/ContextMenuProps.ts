/**
 * ContextMenuProps interface for generic dropdown menu component.
 *
 * Defines the props contract for the ContextMenu component that provides
 * dropdown menu functionality with trigger and children-based composition.
 * This component combines MenuTriggerDisplay and ContextMenuDisplay with
 * internal state management for open/close behavior.
 *
 * @module types/ui/components/ContextMenuProps
 */

import React from "react";

/**
 * Props interface for the ContextMenu component.
 *
 * This interface defines the properties for a generic context menu that
 * combines a trigger element with a dropdown containing children content.
 * The component handles the interaction pattern while accepting children
 * for flexible menu content composition.
 *
 * @example
 * ```typescript
 * // Basic usage with MenuItemDisplay children
 * <ContextMenu>
 *   <MenuItemDisplay label="Copy" />
 *   <MenuItemDisplay label="Delete" variant="danger" />
 * </ContextMenu>
 *
 * // With custom trigger and positioning
 * <ContextMenu trigger={<CustomButton />} position="above">
 *   <MenuItemDisplay label="Action 1" />
 *   <MenuItemDisplay label="Action 2" />
 * </ContextMenu>
 *
 * // Disabled menu
 * <ContextMenu disabled>
 *   <MenuItemDisplay label="Unavailable" />
 * </ContextMenu>
 * ```
 */
export interface ContextMenuProps {
  /**
   * Custom trigger element for the menu.
   * If not provided, uses default ellipsis button from MenuTriggerDisplay.
   * The trigger element will handle click events to open/close the menu.
   */
  trigger?: React.ReactNode;

  /**
   * Positioning preference for the menu relative to trigger element.
   * - "above": Menu appears above the trigger
   * - "below": Menu appears below the trigger
   * - "auto": Automatically choose based on viewport space
   *
   * @default "below"
   */
  position?: "above" | "below" | "auto";

  /**
   * Menu content as React children.
   * Typically contains MenuItemDisplay components or other menu content.
   * Children handle their own interactions and styling.
   */
  children: React.ReactNode;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root container element of the context menu.
   */
  className?: string;

  /**
   * Whether the entire menu is disabled.
   * When true, the trigger cannot be clicked and menu cannot be opened.
   *
   * @default false
   */
  disabled?: boolean;
}
