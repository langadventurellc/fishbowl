import type { DatabaseFilter } from '../../../shared/types';

export const createRecentFilter = (limit: number = 10): DatabaseFilter => ({
  limit,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});
