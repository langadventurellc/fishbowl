import type { PaginationMetadata } from '../../../shared/types';

/**
 * Get pagination range for display (e.g., "1-20 of 150")
 */

export const getPaginationRange = (pagination: PaginationMetadata): string => {
  const start = (pagination.page - 1) * pagination.pageSize + 1;
  const end = Math.min(start + pagination.pageSize - 1, pagination.totalItems);

  if (pagination.totalItems === 0) {
    return '0 items';
  }

  return `${start}-${end} of ${pagination.totalItems}`;
};
