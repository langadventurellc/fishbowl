import type { Conversation } from '../../../shared/types';

export const sortConversations = (
  conversations: Conversation[],
  sortBy: keyof Conversation = 'updatedAt',
  order: 'asc' | 'desc' = 'desc',
): Conversation[] => {
  return [...conversations].sort((a, b) => {
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
