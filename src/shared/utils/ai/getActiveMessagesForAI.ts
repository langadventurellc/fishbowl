/**
 * Get active messages formatted for AI consumption
 *
 * This utility function filters messages to only include active messages
 * and formats them appropriately for AI providers (OpenAI, Anthropic, etc.)
 */

import type { Message } from '../../types';

/**
 * Filters messages to only include active messages and formats them for AI consumption
 *
 * @param messages - Array of messages to filter
 * @returns Array of active messages formatted for AI
 */
export function getActiveMessagesForAI(messages: Message[]): Message[] {
  if (!Array.isArray(messages)) {
    throw new Error('Messages must be an array');
  }

  return messages
    .filter(message => message.isActive === true)
    .sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp ascending for AI context
}
