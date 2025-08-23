import type { ConversationsRepositoryInterface } from "./ConversationsRepositoryInterface";
import type { DatabaseBridge } from "../../services/database";
import type { CryptoUtilsInterface } from "../../utils/CryptoUtilsInterface";
import type {
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
} from "../../types/conversations";
import {
  ConversationValidationError,
  ConversationNotFoundError,
  conversationSchema,
  createConversationInputSchema,
} from "../../types/conversations";
import { ZodError } from "zod";
import { createLoggerSync } from "../../logging/createLoggerSync";
import { DatabaseError } from "../../services/database";

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
        created_at: timestamp,
        updated_at: timestamp,
      };

      // Validate complete conversation
      const validatedConversation = conversationSchema.parse(conversation);

      // Insert into database
      const sql = `
        INSERT INTO conversations (id, title, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `;

      await this.databaseBridge.execute(sql, [
        validatedConversation.id,
        validatedConversation.title,
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
        SELECT id, title, created_at, updated_at
        FROM conversations
        WHERE id = ?
      `;

      const rows = await this.databaseBridge.query<Conversation>(sql, [id]);

      if (rows.length === 0) {
        throw new ConversationNotFoundError(id);
      }

      // Validate and return
      const conversation = conversationSchema.parse(rows[0]);

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
    throw new Error("Method not implemented");
  }

  async update(
    _id: string,
    _input: UpdateConversationInput,
  ): Promise<Conversation> {
    throw new Error("Method not implemented");
  }

  async delete(_id: string): Promise<void> {
    throw new Error("Method not implemented");
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
