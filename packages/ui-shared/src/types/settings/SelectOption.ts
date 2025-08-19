/**
 * Generic option structure for consistency across all selection components.
 */
export interface SelectOption {
  /** Unique identifier for the option */
  id: string;
  /** Display name for the option */
  name: string;
  /** Optional description or secondary text */
  description?: string;
}
