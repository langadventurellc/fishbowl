/**
 * ResizeDirection union for textarea resize behavior options.
 *
 * Defines the supported resize behaviors that control how textarea
 * components can be resized by users in the conversation interface.
 *
 * @module types/ui/components/ResizeDirection
 */

/**
 * Resize behavior options for textarea components.
 * - "none": No resizing allowed (fixed size)
 * - "vertical": Allow vertical resizing only
 * - "horizontal": Allow horizontal resizing only
 * - "both": Allow resizing in both directions
 */
export type ResizeDirection = "none" | "vertical" | "horizontal" | "both";
