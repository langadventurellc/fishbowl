import { createLoggerSync } from "../../logging/createLoggerSync";
import { DatabaseBridge } from "../../services/database/DatabaseBridge";
import { CryptoUtilsInterface } from "../../utils/CryptoUtilsInterface";
import { DatabaseError } from "../../services/database/types/DatabaseError";
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

      await this.databaseBridge.execute(sql, [
        validatedMessage.id,
        validatedMessage.conversation_id,
        validatedMessage.conversation_agent_id,
        validatedMessage.role,
        validatedMessage.content,
        validatedMessage.included,
        validatedMessage.created_at,
      ]);

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

      // Validate and return
      const message = messageSchema.parse(rows[0]);

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

      // Query database with proper ordering
      const sql = `
        SELECT id, conversation_id, conversation_agent_id, role, content, included, created_at
        FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC
      `;

      const rows = await this.databaseBridge.query<Message>(sql, [
        conversationId,
      ]);

      // Validate each message
      const messages = rows.map((row) => messageSchema.parse(row));

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

      await this.databaseBridge.execute(sql, [included, id]);

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

    if (error instanceof DatabaseError) {
      throw new MessageValidationError([`database: ${error.message}`]);
    }

    throw error;
  }
}
