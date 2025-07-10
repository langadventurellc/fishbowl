import type { DatabaseFilter } from '../../../shared/types';

/**
 * Filter utilities
 */

export const createActiveFilter = (): DatabaseFilter => ({
  where: { isActive: true },
  sortBy: 'updatedAt',
  sortOrder: 'desc',
});
