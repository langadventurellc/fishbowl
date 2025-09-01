import {
  type ConversationService,
  type Conversation as _Conversation,
  type ConversationAgent as _ConversationAgent,
  type Message as _Message,
  type CreateMessageInput as _CreateMessageInput,
} from "@fishbowl-ai/shared";

/**
 * Electron renderer process adapter for ConversationService interface.
 *
 * Provides a clean IPC translation layer between the shared ConversationService interface
 * and Electron's window.electronAPI.conversations methods. This adapter implements only
 * the conversation CRUD operations portion of the interface.
 *
 * Error Handling:
 * - Throws standard JavaScript errors (not domain-specific error types)
 * - Includes operation context in error messages
 * - Store layer converts thrown errors to ErrorState patterns
 *
 * IPC Method Mapping:
 * - listConversations() → window.electronAPI.conversations.list()
 * - getConversation(id) → window.electronAPI.conversations.get(id)
 * - createConversation(title?) → window.electronAPI.conversations.create(title)
 * - renameConversation(id, title) → window.electronAPI.conversations.update(id, {title})
 * - deleteConversation(id) → window.electronAPI.conversations.delete(id)
 * - listMessages(conversationId) → window.electronAPI.messages.list(conversationId)
 * - createMessage(input) → window.electronAPI.messages.create(input)
 * - deleteMessage(id) → window.electronAPI.messages.delete(id)
 * - listConversationAgents(conversationId) → window.electronAPI.conversationAgent.getByConversation(conversationId)
 * - addAgent(conversationId, agentId) → window.electronAPI.conversationAgent.add({conversation_id, agent_id})
 * - removeAgent(conversationId, agentId) → window.electronAPI.conversationAgent.remove({conversation_id, agent_id})
 * - updateConversationAgent(conversationAgentId, updates) → window.electronAPI.conversationAgent.update({conversationAgentId, updates})
 */
export class ConversationIpcAdapter implements ConversationService {
  // Conversation CRUD Operations Implementation

  /**
   * List all conversations for the current user
   * Maps to: window.electronAPI.conversations.list()
   */
  async listConversations(): Promise<_Conversation[]> {
    try {
      const result = await window.electronAPI.conversations.list();
      return result;
    } catch (error) {
      throw new Error(
        `listConversations: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get a specific conversation by ID
   * Maps to: window.electronAPI.conversations.get(id)
   */
  async getConversation(id: string): Promise<_Conversation | null> {
    try {
      const result = await window.electronAPI.conversations.get(id);
      return result;
    } catch (error) {
      throw new Error(
        `getConversation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Create a new conversation
   * Maps to: window.electronAPI.conversations.create(title?)
   */
  async createConversation(title?: string): Promise<_Conversation> {
    try {
      const result = await window.electronAPI.conversations.create(title);
      return result;
    } catch (error) {
      throw new Error(
        `createConversation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update conversation (primarily for renaming)
   * Maps to: window.electronAPI.conversations.update(id, {title})
   */
  async renameConversation(id: string, title: string): Promise<_Conversation> {
    try {
      if (!window.electronAPI.conversations.update) {
        throw new Error(
          "Update operation is not available in this environment",
        );
      }
      const result = await window.electronAPI.conversations.update(id, {
        title,
      });
      return result;
    } catch (error) {
      throw new Error(
        `renameConversation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete a conversation permanently
   * Maps to: window.electronAPI.conversations.delete(id)
   */
  async deleteConversation(id: string): Promise<void> {
    try {
      if (!window.electronAPI.conversations.delete) {
        throw new Error(
          "Delete operation is not available in this environment",
        );
      }
      const deleteResult = await window.electronAPI.conversations.delete(id);
      // The delete method returns a boolean, but ConversationService expects void
      // If delete returns false, it means the operation failed
      if (deleteResult === false) {
        throw new Error("Delete operation failed");
      }
    } catch (error) {
      throw new Error(
        `deleteConversation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Placeholder implementations for operations not in scope for this task
  // These will be implemented in separate tasks

  /**
   * Trigger agent orchestration for a user message
   * @throws Error indicating not implemented in this adapter version
   */
  async sendToAgents(
    _conversationId: string,
    _userMessageId: string,
  ): Promise<void> {
    throw new Error("sendToAgents: Not implemented in this adapter version");
  }

  /**
   * List all agents assigned to a specific conversation
   * Maps to: window.electronAPI.conversationAgent.getByConversation(conversationId)
   */
  async listConversationAgents(
    conversationId: string,
  ): Promise<_ConversationAgent[]> {
    try {
      const result =
        await window.electronAPI.conversationAgent.getByConversation(
          conversationId,
        );
      return result;
    } catch (error) {
      throw new Error(
        `listConversationAgents: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Add an agent to a conversation
   * Maps to: window.electronAPI.conversationAgent.add({conversation_id, agent_id})
   */
  async addAgent(
    conversationId: string,
    agentId: string,
  ): Promise<_ConversationAgent> {
    try {
      const result = await window.electronAPI.conversationAgent.add({
        conversation_id: conversationId,
        agent_id: agentId,
      });
      return result;
    } catch (error) {
      throw new Error(
        `addAgent: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Remove an agent from a conversation
   * Maps to: window.electronAPI.conversationAgent.remove({conversation_id, agent_id})
   */
  async removeAgent(conversationId: string, agentId: string): Promise<void> {
    try {
      await window.electronAPI.conversationAgent.remove({
        conversation_id: conversationId,
        agent_id: agentId,
      });
    } catch (error) {
      throw new Error(
        `removeAgent: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update conversation agent configuration
   * Maps to: window.electronAPI.conversationAgent.update({conversationAgentId, updates})
   */
  async updateConversationAgent(
    conversationAgentId: string,
    updates: Partial<_ConversationAgent>,
  ): Promise<_ConversationAgent> {
    try {
      const result = await window.electronAPI.conversationAgent.update({
        conversationAgentId,
        updates,
      });
      return result;
    } catch (error) {
      throw new Error(
        `updateConversationAgent: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * List all messages for a specific conversation
   * Maps to: window.electronAPI.messages.list(conversationId)
   */
  async listMessages(conversationId: string): Promise<_Message[]> {
    try {
      const result = await window.electronAPI.messages.list(conversationId);
      return result;
    } catch (error) {
      throw new Error(
        `listMessages: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Create a new message in a conversation
   * Maps to: window.electronAPI.messages.create(input)
   */
  async createMessage(input: _CreateMessageInput): Promise<_Message> {
    try {
      const result = await window.electronAPI.messages.create(input);
      return result;
    } catch (error) {
      throw new Error(
        `createMessage: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete a message permanently
   * Maps to: window.electronAPI.messages.delete(id)
   */
  async deleteMessage(id: string): Promise<void> {
    try {
      const deleteResult = await window.electronAPI.messages.delete(id);
      // The delete method returns a boolean, but ConversationService expects void
      // If delete returns false, it means the operation failed
      if (deleteResult === false) {
        throw new Error("Delete operation failed");
      }
    } catch (error) {
      throw new Error(
        `deleteMessage: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
