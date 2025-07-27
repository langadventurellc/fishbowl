/**
 * Interface for navigation items with optional sub-tabs
 */
export interface NavigationItem {
  /** Unique identifier for the navigation item */
  id: string;
  /** Display label for the navigation item */
  label: string;
  /** Whether this item has sub-tabs */
  hasSubTabs?: boolean;
  /** Array of sub-tabs if hasSubTabs is true */
  subTabs?: Array<{ id: string; label: string }>;
}
