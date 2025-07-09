/**
 * Create a new conversation with associated agents in a single transaction
 */
import { transactionManager } from './transactionManagerInstance';
import { DatabaseConversation, DatabaseConversationAgent } from '../schema';

export function createConversationWithAgents(
  conversation: Omit<DatabaseConversation, 'created_at' | 'updated_at'>,
  agentIds: string[],
): { conversation: DatabaseConversation; associations: DatabaseConversationAgent[] } {
  return transactionManager.executeTransaction(db => {
    const now = Date.now();

    // Create conversation
    const insertConversation = db.prepare(`
      INSERT INTO conversations (id, name, description, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const conversationData = {
      ...conversation,
      created_at: now,
      updated_at: now,
    };

    insertConversation.run(
      conversationData.id,
      conversationData.name,
      conversationData.description,
      conversationData.is_active,
      conversationData.created_at,
      conversationData.updated_at,
    );

    // Create conversation-agent associations
    const insertAssociation = db.prepare(`
      INSERT INTO conversation_agents (conversation_id, agent_id)
      VALUES (?, ?)
    `);

    const associations: DatabaseConversationAgent[] = [];
    for (const agentId of agentIds) {
      const association = {
        conversation_id: conversation.id,
        agent_id: agentId,
      };

      insertAssociation.run(association.conversation_id, association.agent_id);
      associations.push(association);
    }

    return { conversation: conversationData, associations };
  });
}
