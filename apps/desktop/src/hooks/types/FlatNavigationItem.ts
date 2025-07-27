/**
 * Flattened navigation item for keyboard navigation
 */
export interface FlatNavigationItem {
  /** Unique identifier */
  id: string;
  /** Item type - main section or sub-tab */
  type: "section" | "subtab";
  /** Parent section ID if this is a sub-tab */
  parentId?: string;
  /** Display label */
  label: string;
}
