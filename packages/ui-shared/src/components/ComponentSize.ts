/**
 * ComponentSize union for consistent sizing across input components.
 *
 * Defines the supported size variants that control dimensions and spacing
 * of input-related components in the conversation interface.
 *
 * @module types/ui/components/ComponentSize
 */

/**
 * Component size variants for consistent sizing across input components.
 * - "small": Compact size for inline actions and tight spaces
 * - "medium": Standard size for most use cases (default)
 * - "large": Prominent size for primary actions and emphasis
 */
export type ComponentSize = "small" | "medium" | "large";
