import type { Conversation } from '../../../shared/types';

export const filterConversationsByName = (
  conversations: Conversation[],
  searchTerm: string,
): Conversation[] => {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return conversations;

  return conversations.filter(
    conversation =>
      conversation.name.toLowerCase().includes(term) ||
      conversation.description?.toLowerCase().includes(term),
  );
};
