import type { Agent } from '../../../shared/types';

/**
 * Data transformation utilities
 */

export const sortAgents = (
  agents: Agent[],
  sortBy: keyof Agent = 'name',
  order: 'asc' | 'desc' = 'asc',
): Agent[] => {
  return [...agents].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });
};
