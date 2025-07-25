/**
 * Width variant options for sidebar container sizing.
 *
 * Defines the available width configurations for the SidebarContainerDisplay component
 * to support different layout requirements and screen sizes.
 *
 * @module types/ui/components/SidebarWidthVariant
 */

/**
 * Width variant options for sidebar container sizing
 */
export type SidebarWidthVariant =
  | "narrow" // 180px - Compact sidebar for smaller screens
  | "default" // 200px - Standard sidebar width
  | "wide"; // 240px - Expanded sidebar for more content
