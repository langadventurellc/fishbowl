import type { DatabaseFilter } from '../../../shared/types';

export const createNameSearchFilter = (searchTerm: string): DatabaseFilter => ({
  where: { name: { like: `%${searchTerm}%` } },
  sortBy: 'name',
  sortOrder: 'asc',
});
