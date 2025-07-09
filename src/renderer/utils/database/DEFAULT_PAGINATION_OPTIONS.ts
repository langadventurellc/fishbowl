import type { PaginationOptions } from '../../../shared/types';

/**
 * Default pagination options
 */

export const DEFAULT_PAGINATION_OPTIONS: Required<PaginationOptions> = {
  defaultPageSize: 20,
  maxPageSize: 100,
  enableTotalCount: true,
};
