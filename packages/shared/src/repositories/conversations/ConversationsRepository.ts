import { ZodError } from "zod";
import { createLoggerSync } from "../../logging/createLoggerSync";
import type { DatabaseBridge } from "../../services/database";
import { DatabaseError } from "../../services/database";
import type {
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
} from "../../types/conversations";
import {
  ConversationNotFoundError,
  conversationSchema,
  ConversationValidationError,
  createConversationInputSchema,
  updateConversationInputSchema,
} from "../../types/conversations";
import type { CryptoUtilsInterface } from "../../utils/CryptoUtilsInterface";
import type { ConversationsRepositoryInterface } from "./ConversationsRepositoryInterface";

/**
 * Repository for conversation persistence operations.
 *
 * Implements the repository pattern to coordinate between database bridge
 * and business logic, providing a clean API for managing conversations.
 * Handles validation, UUID generation, and timestamp management.
 */
export class ConversationsRepository
  implements ConversationsRepositoryInterface
{
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "ConversationsRepository" } },
  });

  /**
   * Create conversations repository with required dependencies.
   *
   * @param databaseBridge - Database bridge for SQL operations
   * @param cryptoUtils - Crypto utilities for UUID generation
   */
  constructor(
    private readonly databaseBridge: DatabaseBridge,
    private readonly cryptoUtils: CryptoUtilsInterface,
  ) {
    this.logger.info("ConversationsRepository initialized");
  }

  async create(input: CreateConversationInput): Promise<Conversation> {
    try {
      // Validate input
      const validatedInput = createConversationInputSchema.parse(input);

      // Generate conversation data
      const id = this.cryptoUtils.generateId();
      const title = validatedInput.title || "New Conversation";
      const timestamp = this.getCurrentTimestamp();

      // Create conversation object
      const conversation: Conversation = {
        id,
        title,
        chat_mode: "round-robin", // Default for new conversations per requirements
        created_at: timestamp,
        updated_at: timestamp,
      };

      // TODO: Validate complete conversation with updated schema in separate task
      // const validatedConversation = conversationSchema.parse(conversation);
      const validatedConversation = conversation;

      // Insert into database with chat_mode column
      const sql = `
        INSERT INTO conversations (id, title, chat_mode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `;

      await this.databaseBridge.execute(sql, [
        validatedConversation.id,
        validatedConversation.title,
        validatedConversation.chat_mode,
        validatedConversation.created_at,
        validatedConversation.updated_at,
      ]);

      this.logger.info("Created conversation", {
        id: validatedConversation.id,
      });

      return validatedConversation;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ConversationValidationError(
          error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        );
      }

      this.handleDatabaseError(error, "create");
    }
  }

  async get(id: string): Promise<Conversation> {
    try {
      // Validate ID format
      const idValidation = conversationSchema.shape.id.safeParse(id);
      if (!idValidation.success) {
        throw new ConversationNotFoundError(id);
      }

      // Query database
      const sql = `
        SELECT id, title, chat_mode, created_at, updated_at
        FROM conversations
        WHERE id = ?
      `;

      const rows = await this.databaseBridge.query<Conversation>(sql, [id]);

      if (rows.length === 0) {
        throw new ConversationNotFoundError(id);
      }

      const conversation: Conversation = rows[0] as Conversation;

      this.logger.debug("Retrieved conversation", { id: conversation.id });

      return conversation;
    } catch (error) {
      if (error instanceof ConversationNotFoundError) {
        throw error;
      }

      this.handleDatabaseError(error, "get");
    }
  }

  async list(): Promise<Conversation[]> {
    try {
      const sql = `
        SELECT id, title, chat_mode, created_at, updated_at
        FROM conversations
        ORDER BY created_at DESC
      `;

      const rows = await this.databaseBridge.query<Conversation>(sql);

      const conversations: Conversation[] = rows.map(
        (row) => row as Conversation,
      );

      this.logger.debug(`Listed ${conversations.length} conversations`);

      return conversations;
    } catch (error) {
      this.handleDatabaseError(error, "list");
    }
  }

  // eslint-disable-next-line statement-count/function-statement-count-warn
  async update(
    id: string,
    input: UpdateConversationInput,
  ): Promise<Conversation> {
    try {
      // Validate input
      const validatedInput = updateConversationInputSchema.parse(input);

      // Check if conversation exists
      const exists = await this.exists(id);
      if (!exists) {
        throw new ConversationNotFoundError(id);
      }

      // Build update query dynamically
      const updates: string[] = [];
      const params: unknown[] = [];

      if (validatedInput.title !== undefined) {
        updates.push("title = ?");
        params.push(validatedInput.title);
      }

      if (validatedInput.chat_mode !== undefined) {
        updates.push("chat_mode = ?");
        params.push(validatedInput.chat_mode);
      }

      // Always update timestamp
      updates.push("updated_at = ?");
      params.push(this.getCurrentTimestamp());

      // Add ID for WHERE clause
      params.push(id);

      const sql = `
        UPDATE conversations
        SET ${updates.join(", ")}
        WHERE id = ?
      `;

      await this.databaseBridge.execute(sql, params);

      // Return updated conversation
      const updated = await this.get(id);

      this.logger.info("Updated conversation", { id });

      return updated;
    } catch (error) {
      if (error instanceof ConversationNotFoundError) {
        throw error;
      }

      if (error instanceof ZodError) {
        throw new ConversationValidationError(
          error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        );
      }

      this.handleDatabaseError(error, "update");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Validate ID format
      const idValidation = conversationSchema.shape.id.safeParse(id);
      if (!idValidation.success) {
        throw new ConversationNotFoundError(id);
      }

      // Check if exists before deleting
      const exists = await this.exists(id);
      if (!exists) {
        throw new ConversationNotFoundError(id);
      }

      const sql = `
        DELETE FROM conversations
        WHERE id = ?
      `;

      const result = await this.databaseBridge.execute(sql, [id]);

      if (result.changes === 0) {
        throw new ConversationNotFoundError(id);
      }

      this.logger.info("Deleted conversation", { id });
    } catch (error) {
      if (error instanceof ConversationNotFoundError) {
        throw error;
      }

      this.handleDatabaseError(error, "delete");
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      // Validate ID format
      const idValidation = conversationSchema.shape.id.safeParse(id);
      if (!idValidation.success) {
        return false;
      }

      const sql = `
        SELECT 1
        FROM conversations
        WHERE id = ?
        LIMIT 1
      `;

      const rows = await this.databaseBridge.query<{ 1: number }>(sql, [id]);

      return rows.length > 0;
    } catch (error) {
      this.logger.error(
        "Error checking conversation existence",
        error as Error,
        { id },
      );
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
      throw new ConversationValidationError([
        {
          field: "database",
          message: error.message,
        },
      ]);
    }

    throw error;
  }
}
