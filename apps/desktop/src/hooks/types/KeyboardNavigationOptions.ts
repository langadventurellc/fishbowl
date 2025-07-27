/**
 * Options for configuring keyboard navigation behavior
 */
export interface KeyboardNavigationOptions {
  /** Array of item identifiers for navigation */
  items: string[];
  /** Currently active item identifier */
  activeItem: string;
  /** Callback when navigation changes to a different item */
  onItemChange: (item: string) => void;
  /** Optional callback when an item is activated (Enter/Space) */
  onItemActivate?: (item: string) => void;
  /** Navigation orientation - currently only vertical is supported */
  orientation?: "vertical" | "horizontal";
  /** Whether navigation should loop at boundaries */
  loop?: boolean;
  /** Whether navigation is disabled */
  disabled?: boolean;
}
