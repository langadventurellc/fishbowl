import { DatabaseMessage } from '../../schema/DatabaseMessage';
import { getMessageById } from './getMessageById';
import { updateMessageActiveState } from './updateMessageActiveState';

/**
 * Toggles the active state of a message in the database.
 * If the message is currently active, it will be set to inactive.
 * If the message is currently inactive, it will be set to active.
 *
 * @param id - The UUID of the message to toggle
 * @returns The updated message object with toggled active state, or null if the message was not found
 */
export function toggleMessageActiveState(id: string): DatabaseMessage | null {
  const currentMessage = getMessageById(id);

  if (!currentMessage) {
    return null;
  }

  const newActiveState = !currentMessage.is_active;

  return updateMessageActiveState(id, newActiveState);
}
