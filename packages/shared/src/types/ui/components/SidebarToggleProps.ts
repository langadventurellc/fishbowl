/**
 * SidebarToggleProps interface for collapsible sidebar button component.
 *
 * Defines the props contract for the SidebarToggle component that manages
 * sidebar collapse/expand functionality with visual state feedback.
 *
 * @module types/ui/components/SidebarToggleProps
 */

/**
 * Props interface for the SidebarToggle component.
 *
 * This interface defines the properties required for the sidebar toggle button
 * that controls the expand/collapse state of the sidebar. The component typically
 * displays as a chevron or arrow button with smooth animations and positioning.
 *
 * @example
 * ```typescript
 * const sidebarToggleProps: SidebarToggleProps = {
 *   isCollapsed: false,
 *   onToggle: () => {
 *     console.log("Sidebar toggle clicked");
 *     setSidebarCollapsed(prev => !prev);
 *   },
 *   className: "sidebar-toggle-button"
 * };
 *
 * // Collapsed state example
 * const collapsedSidebarProps: SidebarToggleProps = {
 *   isCollapsed: true,
 *   onToggle: () => {
 *     // Expand the sidebar
 *     setSidebarExpanded(true);
 *     // Update layout state
 *     updateLayoutState({ sidebarExpanded: true });
 *   }
 * };
 * ```
 */
export interface SidebarToggleProps {
  /**
   * Whether the sidebar is currently collapsed.
   * Controls the visual state of the toggle button and determines the
   * direction of the arrow/chevron icon. Also affects the button's position
   * and animation state.
   *
   * When true, the sidebar is collapsed and the button should indicate
   * expansion is available. When false, the sidebar is expanded and the
   * button should indicate collapse is available.
   */
  isCollapsed: boolean;

  /**
   * Handler for sidebar toggle interactions.
   * Called when the user clicks the toggle button to change the sidebar state.
   * The handler should update the parent component's sidebar state.
   *
   * This typically triggers a state change that affects the sidebar's width,
   * visibility, and the main content area's layout.
   */
  onToggle: () => void;

  /**
   * Optional CSS class name for additional styling.
   * Allows for custom styling of the sidebar toggle component
   * beyond the default theme-aware styling.
   *
   * Applied to the root element of the sidebar toggle component.
   *
   * @example "sidebar-toggle", "animated-toggle", "compact-toggle"
   */
  className?: string;
}
