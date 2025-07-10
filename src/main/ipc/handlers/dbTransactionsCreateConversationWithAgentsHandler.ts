import type { IpcMainInvokeEvent } from 'electron';
import type { Conversation, CreateConversationData } from '../../../shared/types';
import {
  SanitizedCreateConversationSchema,
  UuidArraySchema,
} from '../../../shared/types/validation';
import { DatabaseErrorHandler } from '../error-handler';
import { transactionManager } from '../../database/transactions';
import { v4 as uuidv4 } from 'uuid';

export const dbTransactionsCreateConversationWithAgentsHandler = async (
  _event: IpcMainInvokeEvent,
  conversationData: CreateConversationData,
  agentIds: string[],
): Promise<{ conversation: Conversation; agentCount: number }> => {
  const context = {
    operation: 'create-with-agents',
    table: 'conversations',
    timestamp: Date.now(),
  };

  try {
    return await DatabaseErrorHandler.executeWithRetry(() => {
      const validatedData = SanitizedCreateConversationSchema.parse(conversationData);
      const validatedAgentIds = UuidArraySchema.parse(agentIds);

      return transactionManager.executeTransaction(db => {
        const now = Date.now();

        // Create conversation
        const insertConversation = db.prepare(`
          INSERT INTO conversations (id, name, description, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        const conversationId = uuidv4();
        const conversationRecord = {
          id: conversationId,
          name: validatedData.name,
          description: validatedData.description,
          is_active: validatedData.isActive,
          created_at: now,
          updated_at: now,
        };

        insertConversation.run(
          conversationRecord.id,
          conversationRecord.name,
          conversationRecord.description,
          conversationRecord.is_active,
          conversationRecord.created_at,
          conversationRecord.updated_at,
        );

        // Create conversation-agent associations
        const insertAssociation = db.prepare(`
          INSERT INTO conversation_agents (conversation_id, agent_id)
          VALUES (?, ?)
        `);

        for (const agentId of validatedAgentIds) {
          insertAssociation.run(conversationId, agentId);
        }

        return {
          conversation: {
            id: conversationRecord.id,
            name: conversationRecord.name,
            description: conversationRecord.description,
            createdAt: conversationRecord.created_at,
            updatedAt: conversationRecord.updated_at,
            isActive: conversationRecord.is_active,
          },
          agentCount: validatedAgentIds.length,
        };
      });
    }, context);
  } catch (error) {
    DatabaseErrorHandler.handleDatabaseError(error, context);
  }
};
