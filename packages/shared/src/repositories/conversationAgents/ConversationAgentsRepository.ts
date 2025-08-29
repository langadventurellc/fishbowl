import { ZodError } from "zod";
import { createLoggerSync } from "../../logging/createLoggerSync";
import { DatabaseError } from "../../services/database";
import type { DatabaseBridge } from "../../services/database";
import type { CryptoUtilsInterface } from "../../utils/CryptoUtilsInterface";
import type {
  ConversationAgent,
  AddAgentToConversationInput,
  UpdateConversationAgentInput,
} from "../../types/conversationAgents";
import {
  conversationAgentSchema,
  addAgentToConversationInputSchema,
  updateConversationAgentInputSchema,
} from "../../types/conversationAgents/schemas";
import {
  ConversationAgentNotFoundError,
  ConversationAgentValidationError,
  DuplicateAgentError,
} from "../../types/conversationAgents/errors";

/**
 * Database row representation for conversation_agents table.
 * Matches the exact structure returned by SQLite queries.
 */
interface ConversationAgentRow {
  id: string;
  conversation_id: string;
  agent_id: string;
  added_at: string;
  is_active: number; // SQLite stores boolean as 0/1
  enabled: number; // SQLite stores boolean as 0/1
  display_order: number;
}

/**
 * Repository for managing conversation agent associations.
 * Handles CRUD operations for the many-to-one relationship between conversations and agents.
 *
 * Note: agent_id references configuration data from application settings,
 * NOT a database foreign key (agents are not database entities).
 */
export class ConversationAgentsRepository {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "ConversationAgentsRepository" } },
  });

  /**
   * Create conversation agents repository with required dependencies.
   *
   * @param databaseBridge - Database bridge for SQL operations
   * @param cryptoUtils - Crypto utilities for UUID generation
   */
  constructor(
    private readonly databaseBridge: DatabaseBridge,
    private readonly cryptoUtils: CryptoUtilsInterface,
  ) {
    this.logger.info("ConversationAgentsRepository initialized");
  }

  /**
   * Add an agent to a conversation.
   *
   * @param input - Agent addition input with conversation and agent IDs
   * @returns Created conversation agent association
   * @throws ConversationAgentValidationError - Input validation failed
   * @throws DuplicateAgentError - Agent already exists in conversation
   */
  async create(input: AddAgentToConversationInput): Promise<ConversationAgent> {
    try {
      // Validate input
      const validatedInput = addAgentToConversationInputSchema.parse(input);

      // Check for existing association to prevent duplicates
      const exists = await this.existsAssociation(
        validatedInput.conversation_id,
        validatedInput.agent_id,
      );
      if (exists) {
        throw new DuplicateAgentError(
          validatedInput.conversation_id,
          validatedInput.agent_id,
        );
      }

      // Generate conversation agent data
      const id = this.cryptoUtils.generateId();
      const timestamp = this.getCurrentTimestamp();

      // Create conversation agent object
      const conversationAgent: ConversationAgent = {
        id,
        conversation_id: validatedInput.conversation_id,
        agent_id: validatedInput.agent_id,
        added_at: timestamp,
        is_active: true,
        enabled: true,
        display_order: validatedInput.display_order ?? 0,
      };

      // Validate complete conversation agent
      const validatedConversationAgent =
        conversationAgentSchema.parse(conversationAgent);

      // Insert into database
      const sql = `
        INSERT INTO conversation_agents (id, conversation_id, agent_id, added_at, is_active, enabled, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await this.databaseBridge.execute(sql, [
        validatedConversationAgent.id,
        validatedConversationAgent.conversation_id,
        validatedConversationAgent.agent_id,
        validatedConversationAgent.added_at,
        validatedConversationAgent.is_active ? 1 : 0,
        validatedConversationAgent.enabled ? 1 : 0,
        validatedConversationAgent.display_order,
      ]);

      this.logger.info("Added agent to conversation", {
        id: validatedConversationAgent.id,
        conversationId: validatedConversationAgent.conversation_id,
        agentId: validatedConversationAgent.agent_id,
      });

      return validatedConversationAgent;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ConversationAgentValidationError(
          error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        );
      }

      if (error instanceof DuplicateAgentError) {
        throw error;
      }

      this.handleDatabaseError(error, "create");
    }
  }

  /**
   * Get a conversation agent association by ID.
   *
   * @param id - Conversation agent ID
   * @returns Conversation agent or null if not found
   * @throws ConversationAgentNotFoundError - Association not found
   */
  async get(id: string): Promise<ConversationAgent> {
    try {
      // Validate ID format
      const idValidation = conversationAgentSchema.shape.id.safeParse(id);
      if (!idValidation.success) {
        throw new ConversationAgentNotFoundError({ conversationAgentId: id });
      }

      // Query database
      const sql = `
        SELECT id, conversation_id, agent_id, added_at, is_active, enabled, display_order
        FROM conversation_agents
        WHERE id = ?
      `;

      const rows = await this.databaseBridge.query<ConversationAgentRow>(sql, [
        id,
      ]);

      if (rows.length === 0) {
        throw new ConversationAgentNotFoundError({ conversationAgentId: id });
      }

      // Transform database row
      const transformedRow = this.transformFromDatabase(rows[0]!);

      // Validate and return
      const conversationAgent = conversationAgentSchema.parse(transformedRow);

      this.logger.debug("Retrieved conversation agent", { id });

      return conversationAgent;
    } catch (error) {
      if (error instanceof ConversationAgentNotFoundError) {
        throw error;
      }

      this.handleDatabaseError(error, "get");
    }
  }

  /**
   * Update a conversation agent association.
   *
   * @param id - Conversation agent ID
   * @param input - Update input with new values
   * @returns Updated conversation agent
   * @throws ConversationAgentNotFoundError - Association not found
   * @throws ConversationAgentValidationError - Input validation failed
   */
  async update(
    id: string,
    input: UpdateConversationAgentInput,
  ): Promise<ConversationAgent> {
    try {
      // Validate input
      const validatedInput = updateConversationAgentInputSchema.parse(input);

      // Check if conversation agent exists
      const exists = await this.exists(id);
      if (!exists) {
        throw new ConversationAgentNotFoundError({ conversationAgentId: id });
      }

      // Build and execute update query
      const updateResult = await this.buildAndExecuteUpdate(id, validatedInput);
      if (!updateResult) {
        // No updates to perform, return current state
        return await this.get(id);
      }

      // Return updated conversation agent
      const updated = await this.get(id);

      this.logger.info("Updated conversation agent", { id });

      return updated;
    } catch (error) {
      if (error instanceof ConversationAgentNotFoundError) {
        throw error;
      }

      if (error instanceof ZodError) {
        throw new ConversationAgentValidationError(
          error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        );
      }

      this.handleDatabaseError(error, "update");
    }
  }

  /**
   * Delete a conversation agent association.
   *
   * @param id - Conversation agent ID to delete
   * @throws ConversationAgentNotFoundError - Association not found
   */
  async delete(id: string): Promise<void> {
    try {
      // Validate ID format
      const idValidation = conversationAgentSchema.shape.id.safeParse(id);
      if (!idValidation.success) {
        throw new ConversationAgentNotFoundError({ conversationAgentId: id });
      }

      // Check if exists before deleting
      const exists = await this.exists(id);
      if (!exists) {
        throw new ConversationAgentNotFoundError({ conversationAgentId: id });
      }

      const sql = `
        DELETE FROM conversation_agents
        WHERE id = ?
      `;

      const result = await this.databaseBridge.execute(sql, [id]);

      if (result.changes === 0) {
        throw new ConversationAgentNotFoundError({ conversationAgentId: id });
      }

      this.logger.info("Deleted conversation agent", { id });
    } catch (error) {
      if (error instanceof ConversationAgentNotFoundError) {
        throw error;
      }

      this.handleDatabaseError(error, "delete");
    }
  }

  /**
   * Check if a conversation agent association exists.
   *
   * @param id - Conversation agent ID to check
   * @returns True if exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    try {
      // Validate ID format
      const idValidation = conversationAgentSchema.shape.id.safeParse(id);
      if (!idValidation.success) {
        return false;
      }

      const sql = `
        SELECT 1
        FROM conversation_agents
        WHERE id = ?
        LIMIT 1
      `;

      const rows = await this.databaseBridge.query<{ 1: number }>(sql, [id]);

      return rows.length > 0;
    } catch (error) {
      this.logger.error(
        "Error checking conversation agent existence",
        error as Error,
        { id },
      );
      return false;
    }
  }

  /**
   * Find all agents associated with a specific conversation.
   *
   * @param conversationId - Conversation ID to search for
   * @returns Array of conversation agents ordered by display_order and added_at
   */
  async findByConversationId(
    conversationId: string,
  ): Promise<ConversationAgent[]> {
    try {
      // Validate conversation ID format
      const idValidation =
        conversationAgentSchema.shape.conversation_id.safeParse(conversationId);
      if (!idValidation.success) {
        return [];
      }

      const sql = `
        SELECT id, conversation_id, agent_id, added_at, is_active, enabled, display_order
        FROM conversation_agents
        WHERE conversation_id = ?
        ORDER BY display_order ASC, added_at ASC
      `;

      const rows = await this.databaseBridge.query<ConversationAgentRow>(sql, [
        conversationId,
      ]);

      // Transform database rows and validate
      const conversationAgents = rows
        .map((row) => this.transformFromDatabase(row))
        .map((row) => conversationAgentSchema.parse(row));

      this.logger.debug(
        `Found ${conversationAgents.length} agents for conversation`,
        {
          conversationId,
        },
      );

      return conversationAgents;
    } catch (error) {
      this.handleDatabaseError(error, "findByConversationId");
    }
  }

  /**
   * Find all conversations that use a specific agent.
   *
   * @param agentId - Agent ID to search for
   * @returns Array of conversation agents ordered by added_at
   */
  async findByAgentId(agentId: string): Promise<ConversationAgent[]> {
    try {
      // Validate agent ID format
      const idValidation =
        conversationAgentSchema.shape.agent_id.safeParse(agentId);
      if (!idValidation.success) {
        return [];
      }

      const sql = `
        SELECT id, conversation_id, agent_id, added_at, is_active, enabled, display_order
        FROM conversation_agents
        WHERE agent_id = ?
        ORDER BY added_at DESC
      `;

      const rows = await this.databaseBridge.query<ConversationAgentRow>(sql, [
        agentId,
      ]);

      // Transform database rows and validate
      const conversationAgents = rows
        .map((row) => this.transformFromDatabase(row))
        .map((row) => conversationAgentSchema.parse(row));

      this.logger.debug(
        `Found ${conversationAgents.length} conversations for agent`,
        {
          agentId,
        },
      );

      return conversationAgents;
    } catch (error) {
      this.handleDatabaseError(error, "findByAgentId");
    }
  }

  /**
   * Check if a specific agent is already associated with a conversation.
   *
   * @param conversationId - Conversation ID to check
   * @param agentId - Agent ID to check
   * @returns True if association exists, false otherwise
   */
  async existsAssociation(
    conversationId: string,
    agentId: string,
  ): Promise<boolean> {
    try {
      // Validate IDs format
      const conversationIdValidation =
        conversationAgentSchema.shape.conversation_id.safeParse(conversationId);
      const agentIdValidation =
        conversationAgentSchema.shape.agent_id.safeParse(agentId);

      if (!conversationIdValidation.success || !agentIdValidation.success) {
        return false;
      }

      const sql = `
        SELECT 1
        FROM conversation_agents
        WHERE conversation_id = ? AND agent_id = ?
        LIMIT 1
      `;

      const rows = await this.databaseBridge.query<{ 1: number }>(sql, [
        conversationId,
        agentId,
      ]);

      return rows.length > 0;
    } catch (error) {
      this.logger.error(
        "Error checking conversation agent association existence",
        error as Error,
        { conversationId, agentId },
      );
      return false;
    }
  }

  /**
   * Get agents for a conversation ordered by display_order.
   *
   * @param conversationId - Conversation ID to get agents for
   * @returns Array of conversation agents in display order
   */
  async getOrderedAgents(conversationId: string): Promise<ConversationAgent[]> {
    // This is an alias for findByConversationId which already orders properly
    return this.findByConversationId(conversationId);
  }

  /**
   * Get only enabled agents for a conversation ordered by display_order.
   * This is a critical method for ChatOrchestrationService to find agents that should process messages.
   *
   * @param conversationId - Conversation ID to get enabled agents for
   * @returns Array of enabled conversation agents in display order
   */
  async getEnabledByConversationId(
    conversationId: string,
  ): Promise<ConversationAgent[]> {
    try {
      // Validate conversation ID format
      const idValidation =
        conversationAgentSchema.shape.conversation_id.safeParse(conversationId);
      if (!idValidation.success) {
        return [];
      }

      const sql = `
        SELECT id, conversation_id, agent_id, added_at, is_active, enabled, display_order
        FROM conversation_agents
        WHERE conversation_id = ? AND enabled = 1
        ORDER BY display_order ASC, added_at ASC
      `;

      const rows = await this.databaseBridge.query<ConversationAgentRow>(sql, [
        conversationId,
      ]);

      // Transform database rows and validate
      const conversationAgents = rows
        .map((row) => this.transformFromDatabase(row))
        .map((row) => conversationAgentSchema.parse(row));

      this.logger.debug(
        `Found ${conversationAgents.length} enabled agents for conversation`,
        {
          conversationId,
        },
      );

      return conversationAgents;
    } catch (error) {
      this.handleDatabaseError(error, "getEnabledByConversationId");
    }
  }

  /**
   * Bulk delete all agents for a conversation (for conversation cleanup).
   *
   * @param conversationId - Conversation ID to remove all agents from
   * @returns Number of agents removed
   */
  async deleteByConversationId(conversationId: string): Promise<number> {
    try {
      // Validate conversation ID format
      const idValidation =
        conversationAgentSchema.shape.conversation_id.safeParse(conversationId);
      if (!idValidation.success) {
        return 0;
      }

      const sql = `
        DELETE FROM conversation_agents
        WHERE conversation_id = ?
      `;

      const result = await this.databaseBridge.execute(sql, [conversationId]);

      this.logger.info(`Deleted ${result.changes} agents for conversation`, {
        conversationId,
        deletedCount: result.changes,
      });

      return result.changes || 0;
    } catch (error) {
      this.handleDatabaseError(error, "deleteByConversationId");
    }
  }

  /**
   * Get the count of agents associated with a conversation.
   *
   * @param conversationId - Conversation ID to count agents for
   * @returns Number of agents associated with the conversation
   */
  async getAgentCountByConversation(conversationId: string): Promise<number> {
    try {
      // Validate conversation ID format
      const idValidation =
        conversationAgentSchema.shape.conversation_id.safeParse(conversationId);
      if (!idValidation.success) {
        return 0;
      }

      const sql = `
        SELECT COUNT(*) as count
        FROM conversation_agents
        WHERE conversation_id = ?
      `;

      const rows = await this.databaseBridge.query<{ count: number }>(sql, [
        conversationId,
      ]);

      const count = rows[0]?.count || 0;

      this.logger.debug(`Found ${count} agents for conversation`, {
        conversationId,
        count,
      });

      return count;
    } catch (error) {
      this.handleDatabaseError(error, "getAgentCountByConversation");
    }
  }

  /**
   * Build and execute update query for conversation agent.
   *
   * @param id - Conversation agent ID
   * @param input - Validated update input
   * @returns True if update was executed, false if no changes needed
   */
  private async buildAndExecuteUpdate(
    id: string,
    input: UpdateConversationAgentInput,
  ): Promise<boolean> {
    // Build update query dynamically
    const updates: string[] = [];
    const params: unknown[] = [];

    if (input.is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(input.is_active ? 1 : 0);
    }

    if (input.display_order !== undefined) {
      updates.push("display_order = ?");
      params.push(input.display_order);
    }

    if (input.enabled !== undefined) {
      updates.push("enabled = ?");
      params.push(input.enabled ? 1 : 0);
    }

    if (updates.length === 0) {
      return false; // No updates to perform
    }

    // Add ID for WHERE clause
    params.push(id);

    const sql = `
      UPDATE conversation_agents
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    await this.databaseBridge.execute(sql, params);
    return true;
  }

  /**
   * Transform database row to domain object.
   * Handles type conversion for boolean fields.
   */
  private transformFromDatabase(row: ConversationAgentRow): ConversationAgent {
    return {
      ...row,
      is_active: Boolean(row.is_active),
      enabled: Boolean(row.enabled),
    };
  }

  /**
   * Generate current ISO timestamp.
   */
  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Wrap database errors in domain-specific errors.
   */
  private handleDatabaseError(error: unknown, operation: string): never {
    this.logger.error(`Database error during ${operation}`, error as Error);

    if (error instanceof DatabaseError) {
      throw new ConversationAgentValidationError([
        {
          field: "database",
          message: error.message,
        },
      ]);
    }

    throw error;
  }
}
