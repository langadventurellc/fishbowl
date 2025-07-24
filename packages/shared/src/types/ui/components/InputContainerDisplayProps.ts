/**
 * InputContainerDisplayProps interface for input container display component.
 *
 * Defines the props contract for the InputContainerDisplay component that shows
 * the visual representation of the input area layout container without any
 * interactive functionality. Used for display-only purposes in component showcase.
 *
 * @module types/ui/components/InputContainerDisplayProps
 */

import { ReactNode } from "react";
import { LayoutVariant } from "./LayoutVariant";

/**
 * Props interface for the InputContainerDisplay component.
 *
 * This interface defines the properties required for displaying an input container
 * in its various visual layouts. The component is purely display-focused
 * and does not include any event handlers or interactive functionality.
 *
 * @example
 * ```typescript
 * // Basic default container
 * const defaultContainer: InputContainerDisplayProps = {
 *   children: <div>Input components go here</div>,
 *   layoutVariant: "default"
 * };
 *
 * // Compact layout container
 * const compactContainer: InputContainerDisplayProps = {
 *   children: (
 *     <>
 *       <MessageInputDisplay />
 *       <SendButtonDisplay />
 *     </>
 *   ),
 *   layoutVariant: "compact"
 * };
 *
 * // Custom styled container
 * const customContainer: InputContainerDisplayProps = {
 *   children: <InputAreaComponents />,
 *   layoutVariant: "default",
 *   className: "custom-input-container"
 * };
 * ```
 */
export interface InputContainerDisplayProps {
  /**
   * Layout variant controlling the container's spacing and visual presentation.
   *
   * - **default**: Standard spacing and layout for normal use
   * - **compact**: Reduced spacing for smaller screens or constrained layouts
   *
   * @default "default"
   */
  layoutVariant?: LayoutVariant;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root container element for custom styling
   * beyond the default theme-aware styling.
   *
   * @example "custom-container", "highlighted", "bordered-container"
   */
  className?: string;

  /**
   * The child components to render within the container.
   * Typically includes input components like MessageInputDisplay,
   * SendButtonDisplay, and ConversationModeToggleDisplay.
   *
   * @example <MessageInputDisplay />, <SendButtonDisplay />
   */
  children: ReactNode;
}
