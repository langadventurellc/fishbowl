import type { Message } from '../../../shared/types';

export const sortMessages = (
  messages: Message[],
  sortBy: keyof Message = 'timestamp',
  order: 'asc' | 'desc' = 'asc',
): Message[] => {
  return [...messages].sort((a, b) => {
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
