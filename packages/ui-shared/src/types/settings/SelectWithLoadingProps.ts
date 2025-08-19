import { BaseSelectProps } from "./BaseSelectProps";

/**
 * Props for selection components that handle option loading.
 * Extends BaseSelectProps with common patterns for data fetching components.
 */
export interface SelectWithLoadingProps extends BaseSelectProps {
  /** Whether data is currently loading */
  loading?: boolean;
  /** Error state if data loading failed */
  error?: Error | null;
}
