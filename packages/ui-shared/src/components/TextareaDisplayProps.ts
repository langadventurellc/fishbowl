/**
 * TextareaDisplayProps interface for styled textarea display component.
 *
 * Defines the props contract for the TextareaDisplay component that shows
 * the visual representation of a styled textarea without any interactive
 * functionality. Used for display-only purposes in component showcase.
 *
 * @module types/ui/components/TextareaDisplayProps
 */

import { ResizeDirection } from "./ResizeDirection";

/**
 * Props interface for the TextareaDisplay component.
 *
 * This interface defines the properties required for displaying a styled textarea
 * in its various visual states and configurations. The component is purely
 * display-focused and does not include any event handlers or interactive functionality.
 *
 * @example
 * ```typescript
 * // Basic textarea display
 * const basicTextarea: TextareaDisplayProps = {
 *   placeholder: "Enter your text here...",
 *   rows: 3
 * };
 *
 * // Textarea with content and custom resize
 * const contentTextarea: TextareaDisplayProps = {
 *   content: "This is sample content in the textarea",
 *   placeholder: "Type here...",
 *   rows: 4,
 *   resize: "vertical",
 *   className: "custom-textarea"
 * };
 *
 * // Auto-resizing textarea display
 * const autoTextarea: TextareaDisplayProps = {
 *   content: "This textarea shows auto-resize behavior",
 *   resize: "none",
 *   rows: 2
 * };
 *
 * // Multi-line content display
 * const multilineTextarea: TextareaDisplayProps = {
 *   content: "Line 1\nLine 2\nLine 3\nThis shows multiple lines of content",
 *   rows: 5,
 *   resize: "both"
 * };
 * ```
 */
export interface TextareaDisplayProps {
  /**
   * Current content displayed in the textarea.
   * Shows the text that would be present in an active textarea field.
   * Supports multi-line content with newline characters.
   *
   * @example "Hello world", "Line 1\nLine 2\nLine 3"
   */
  content?: string;

  /**
   * Placeholder text displayed when the textarea is empty.
   * Provides guidance to users about what content is expected.
   *
   * @example "Enter your message...", "Type here to start conversation"
   */
  placeholder?: string;

  /**
   * Number of visible text rows in the textarea.
   * Controls the initial height of the textarea component.
   * Actual height may vary based on content and resize behavior.
   *
   * @default 3
   */
  rows?: number;

  /**
   * Resize behavior controlling how the textarea can be resized.
   *
   * - **none**: No resizing allowed (fixed size)
   * - **vertical**: Allow vertical resizing only
   * - **horizontal**: Allow horizontal resizing only
   * - **both**: Allow resizing in both directions
   *
   * @default "none"
   */
  resize?: ResizeDirection;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root textarea element for custom styling
   * beyond the default theme-aware styling.
   *
   * @example "custom-textarea", "highlighted", "auto-resize"
   */
  className?: string;
}
