import type { Message } from '../../../shared/types';

export const filterMessagesByContent = (messages: Message[], searchTerm: string): Message[] => {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return messages;

  return messages.filter(
    message =>
      message.content.toLowerCase().includes(term) || message.type.toLowerCase().includes(term),
  );
};
