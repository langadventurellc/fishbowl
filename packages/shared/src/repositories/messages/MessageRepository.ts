import { createLoggerSync } from "../../logging/createLoggerSync";
import { DatabaseBridge } from "../../services/database/DatabaseBridge";
import { CryptoUtilsInterface } from "../../utils/CryptoUtilsInterface";
import { DatabaseError } from "../../services/database/types/DatabaseError";
import { ConstraintViolationError } from "../../services/database/types/ConstraintViolationError";
import { DatabaseErrorCode } from "../../services/database/types/DatabaseErrorCode";
import {
  Message,
  CreateMessageInput,
  MessageNotFoundError,
  MessageValidationError,
  createMessageInputSchema,
  messageSchema,
} from "../../types/messages";
import { ZodError } from "zod";

/**
 * Repository for managing message persistence and retrieval.
 * Follows the established repository pattern for data access abstraction.
 */
export class MessageRepository {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "MessageRepository" } },
  });

  /**
   * Create message repository with required dependencies.
   *
   * @param databaseBridge - Database bridge for SQL operations
   * @param cryptoUtils - Crypto utilities for UUID generation
   */
  constructor(
    private readonly databaseBridge: DatabaseBridge,
    private readonly cryptoUtils: CryptoUtilsInterface,
  ) {
    this.logger.info("MessageRepository initialized");
  }

  async create(input: CreateMessageInput): Promise<Message> {
    try {
      // Validate input
      const validatedInput = createMessageInputSchema.parse(input);

      // Generate message data
      const id = this.cryptoUtils.generateId();
      const timestamp = this.getCurrentTimestamp();
      const included = validatedInput.included ?? true; // Default to true

      // Create message object
      const message: Message = {
        id,
        conversation_id: validatedInput.conversation_id,
        conversation_agent_id: validatedInput.conversation_agent_id ?? null,
        role: validatedInput.role,
        content: validatedInput.content,
        included,
        created_at: timestamp,
      };

      // Validate complete message
      const validatedMessage = messageSchema.parse(message);

      // Insert into database
      const sql = `
        INSERT INTO messages (id, conversation_id, conversation_agent_id, role, content, included, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      // Convert boolean to number for SQLite compatibility
      const sqliteParams = [
        validatedMessage.id,
        validatedMessage.conversation_id,
        validatedMessage.conversation_agent_id,
        validatedMessage.role,
        validatedMessage.content,
        validatedMessage.included ? 1 : 0, // Convert boolean to integer
        validatedMessage.created_at,
      ];

      await this.databaseBridge.execute(sql, sqliteParams);

      this.logger.info("Created message", {
        id: validatedMessage.id,
        conversation_id: validatedMessage.conversation_id,
      });

      return validatedMessage;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new MessageValidationError(
          error.issues.map(
            (issue) => `${issue.path.join(".")}: ${issue.message}`,
          ),
        );
      }

      this.handleDatabaseError(error, "create");
    }
  }

  async get(id: string): Promise<Message> {
    try {
      // Validate ID format
      const idValidation = messageSchema.shape.id.safeParse(id);
      if (!idValidation.success) {
        throw new MessageNotFoundError(id);
      }

      // Query database
      const sql = `
        SELECT id, conversation_id, conversation_agent_id, role, content, included, created_at
        FROM messages
        WHERE id = ?
      `;

      const rows = await this.databaseBridge.query<Message>(sql, [id]);

      if (rows.length === 0) {
        throw new MessageNotFoundError(id);
      }

      // Convert SQLite integer to boolean for included field
      const rawMessage = rows[0]!; // We know it exists because we checked length above
      const messageWithBooleanIncluded = {
        ...rawMessage,
        included: Boolean(rawMessage.included), // Convert 0/1 to false/true
      };

      // Validate and return
      const message = messageSchema.parse(messageWithBooleanIncluded);

      this.logger.debug("Retrieved message", { id: message.id });

      return message;
    } catch (error) {
      if (error instanceof MessageNotFoundError) {
        throw error;
      }

      this.handleDatabaseError(error, "get");
    }
  }

  async getByConversation(conversationId: string): Promise<Message[]> {
    try {
      // Validate conversation ID format
      const idValidation =
        messageSchema.shape.conversation_id.safeParse(conversationId);
      if (!idValidation.success) {
        throw new MessageValidationError([
          "conversation_id: Invalid conversation ID format",
        ]);
      }

      // Query database with proper ordering for stable message retrieval
      const sql = `
        SELECT id, conversation_id, conversation_agent_id, role, content, included, created_at
        FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC, id ASC
      `;

      const rows = await this.databaseBridge.query<Message>(sql, [
        conversationId,
      ]);

      // Convert SQLite integers to booleans for included field and validate each message
      const messages = rows.map((row) => {
        const messageWithBooleanIncluded = {
          ...row,
          included: Boolean(row.included), // Convert 0/1 to false/true
        };
        return messageSchema.parse(messageWithBooleanIncluded);
      });

      this.logger.debug(
        `Retrieved ${messages.length} messages for conversation`,
        {
          conversationId,
        },
      );

      return messages;
    } catch (error) {
      if (error instanceof MessageValidationError) {
        throw error;
      }

      this.handleDatabaseError(error, "getByConversation");
    }
  }

  async updateInclusion(id: string, included: boolean): Promise<Message> {
    try {
      // Validate inputs
      const idValidation = messageSchema.shape.id.safeParse(id);
      if (!idValidation.success) {
        throw new MessageNotFoundError(id);
      }

      const includedValidation =
        messageSchema.shape.included.safeParse(included);
      if (!includedValidation.success) {
        throw new MessageValidationError(["included: Invalid included value"]);
      }

      // Check if message exists
      const exists = await this.exists(id);
      if (!exists) {
        throw new MessageNotFoundError(id);
      }

      // Update inclusion field
      const sql = `
        UPDATE messages
        SET included = ?
        WHERE id = ?
      `;

      // Convert boolean to number for SQLite compatibility
      await this.databaseBridge.execute(sql, [included ? 1 : 0, id]);

      // Return updated message
      const updated = await this.get(id);

      this.logger.info("Updated message inclusion", { id, included });

      return updated;
    } catch (error) {
      if (
        error instanceof MessageNotFoundError ||
        error instanceof MessageValidationError
      ) {
        throw error;
      }

      this.handleDatabaseError(error, "updateInclusion");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Validate ID format
      const idValidation = messageSchema.shape.id.safeParse(id);
      if (!idValidation.success) {
        throw new MessageNotFoundError(id);
      }

      // Check if message exists
      const exists = await this.exists(id);
      if (!exists) {
        throw new MessageNotFoundError(id);
      }

      // Delete message from database
      const sql = `
        DELETE FROM messages
        WHERE id = ?
      `;

      const result = await this.databaseBridge.execute(sql, [id]);

      // Verify deletion occurred
      if (result.changes === 0) {
        throw new MessageNotFoundError(id);
      }

      this.logger.info("Deleted message", { id });
    } catch (error) {
      if (error instanceof MessageNotFoundError) {
        throw error;
      }

      this.handleDatabaseError(error, "delete");
    }
  }

  /**
   * Delete all messages associated with a specific conversation agent.
   * Used when removing an agent from a conversation to clean up their messages.
   *
   * @param conversationAgentId - The UUID of the conversation agent whose messages should be deleted
   * @returns Promise<number> - The number of messages deleted
   * @throws DatabaseError when database operations fail
   */
  async deleteByConversationAgentId(
    conversationAgentId: string,
  ): Promise<number> {
    try {
      // Validate conversation agent ID format
      const idValidation =
        messageSchema.shape.conversation_agent_id.safeParse(
          conversationAgentId,
        );
      if (!idValidation.success) {
        return 0;
      }

      const sql = `
        DELETE FROM messages
        WHERE conversation_agent_id = ?
      `;

      const result = await this.databaseBridge.execute(sql, [
        conversationAgentId,
      ]);

      this.logger.info(
        `Deleted ${result.changes} messages for conversation agent`,
        {
          conversationAgentId,
          deletedCount: result.changes,
        },
      );

      return result.changes || 0;
    } catch (error) {
      this.handleDatabaseError(error, "deleteByConversationAgentId");
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      // Validate ID format
      const idValidation = messageSchema.shape.id.safeParse(id);
      if (!idValidation.success) {
        return false;
      }

      const sql = `
        SELECT 1
        FROM messages
        WHERE id = ?
        LIMIT 1
      `;

      const rows = await this.databaseBridge.query<{ 1: number }>(sql, [id]);

      return rows.length > 0;
    } catch (error) {
      this.logger.error("Error checking message existence", error as Error, {
        id,
      });
      return false;
    }
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

    // Handle specific constraint violations with clear error messages
    if (error instanceof ConstraintViolationError) {
      if (error.code === DatabaseErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION) {
        const context = error.context as Record<string, unknown>;
        const columnName = context?.columnName as string;

        if (columnName === "conversation_id") {
          throw new MessageValidationError([
            `conversation_id: Referenced conversation does not exist`,
          ]);
        } else if (columnName === "conversation_agent_id") {
          throw new MessageValidationError([
            `conversation_agent_id: Referenced conversation agent does not exist`,
          ]);
        } else {
          throw new MessageValidationError([`foreign_key: ${error.message}`]);
        }
      } else if (error.code === DatabaseErrorCode.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new MessageValidationError([
          `unique_constraint: ${error.message}`,
        ]);
      } else if (
        error.code === DatabaseErrorCode.NOT_NULL_CONSTRAINT_VIOLATION
      ) {
        throw new MessageValidationError([`required_field: ${error.message}`]);
      } else {
        throw new MessageValidationError([`constraint: ${error.message}`]);
      }
    }

    // Handle general database errors
    if (error instanceof DatabaseError) {
      throw new MessageValidationError([`database: ${error.message}`]);
    }

    throw error;
  }
}
