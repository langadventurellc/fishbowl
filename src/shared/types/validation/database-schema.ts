import { z } from 'zod';

/**
 * Zod schema for Agent
 */
export const AgentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  role: z.string().min(1),
  personality: z.string().min(1),
  isActive: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

/**
 * Zod schema for creating a new Agent
 */
export const CreateAgentSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  personality: z.string().min(1),
  isActive: z.boolean().default(true),
});

/**
 * Zod schema for updating an Agent
 */
export const UpdateAgentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  personality: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Zod schema for Message
 */
export const MessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  agentId: z.string().uuid(),
  content: z.string().min(1),
  type: z.string().min(1),
  metadata: z.string(),
  timestamp: z.number(),
});

/**
 * Zod schema for creating a new Message
 */
export const CreateMessageSchema = z.object({
  conversationId: z.string().uuid(),
  agentId: z.string().uuid(),
  content: z.string().min(1),
  type: z.string().min(1),
  isActive: z.boolean().default(true),
  metadata: z.string().optional().default('{}'),
});

/**
 * Zod schema for updating a Message active state
 */
export const UpdateMessageActiveStateSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

/**
 * Zod schema for Conversation
 */
export const ConversationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  isActive: z.boolean(),
});

/**
 * Zod schema for creating a new Conversation
 */
export const CreateConversationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  isActive: z.boolean().default(true),
});

/**
 * Zod schema for updating a Conversation
 */
export const UpdateConversationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Zod schema for ConversationAgent relationship
 */
export const ConversationAgentSchema = z.object({
  conversationId: z.string().uuid(),
  agentId: z.string().uuid(),
});

/**
 * Zod schema for database query filters
 */
export const DatabaseFilterSchema = z.object({
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  where: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

/**
 * Zod schema for UUID validation
 */
export const UuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Zod schema for array of UUIDs
 */
export const UuidArraySchema = z.array(UuidSchema).min(1, 'At least one UUID is required');

/**
 * Zod schema for transaction operations
 */
export const TransactionCreateConversationWithAgentsSchema = z.object({
  conversationData: CreateConversationSchema,
  agentIds: UuidArraySchema,
});

export const TransactionCreateMessagesBatchSchema = z.object({
  messages: z.array(CreateMessageSchema).min(1, 'At least one message is required'),
});

export const TransactionDeleteConversationCascadeSchema = z.object({
  conversationId: UuidSchema,
});

export const TransactionTransferMessagesSchema = z.object({
  fromConversationId: UuidSchema,
  toConversationId: UuidSchema,
  messageIds: UuidArraySchema,
});

/**
 * Zod schema for sanitizing content strings
 */
export const SanitizedContentSchema = z
  .string()
  .min(1, 'Content cannot be empty')
  .max(10000, 'Content too long')
  .transform(val => val.trim())
  .refine(val => val.length > 0, 'Content cannot be empty after trimming');

/**
 * Zod schema for sanitizing name strings
 */
export const SanitizedNameSchema = z
  .string()
  .min(1, 'Name cannot be empty')
  .max(255, 'Name too long')
  .transform(val => val.trim())
  .refine(val => val.length > 0, 'Name cannot be empty after trimming')
  .refine(val => !val.includes('\n'), 'Name cannot contain newlines');

/**
 * Enhanced agent schemas with sanitization
 */
export const SanitizedCreateAgentSchema = z.object({
  name: SanitizedNameSchema,
  role: SanitizedNameSchema,
  personality: SanitizedContentSchema,
  isActive: z.boolean().default(true),
});

export const SanitizedUpdateAgentSchema = z.object({
  id: UuidSchema,
  name: SanitizedNameSchema.optional(),
  role: SanitizedNameSchema.optional(),
  personality: SanitizedContentSchema.optional(),
  isActive: z.boolean().optional(),
});

/**
 * Enhanced conversation schemas with sanitization
 */
export const SanitizedCreateConversationSchema = z.object({
  name: SanitizedNameSchema,
  description: z
    .string()
    .optional()
    .default('')
    .transform(val => val.trim()),
  isActive: z.boolean().default(true),
});

export const SanitizedUpdateConversationSchema = z.object({
  id: UuidSchema,
  name: SanitizedNameSchema.optional(),
  description: z
    .string()
    .optional()
    .transform(val => val?.trim()),
  isActive: z.boolean().optional(),
});

/**
 * Enhanced message schemas with sanitization
 */
export const SanitizedCreateMessageSchema = z.object({
  conversationId: UuidSchema,
  agentId: UuidSchema,
  content: SanitizedContentSchema,
  type: z.string().min(1, 'Message type cannot be empty'),
  isActive: z.boolean().default(true),
  metadata: z
    .string()
    .optional()
    .default('{}')
    .refine(val => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, 'Metadata must be valid JSON'),
});

/**
 * Enhanced update message active state schema with sanitization
 */
export const SanitizedUpdateMessageActiveStateSchema = z.object({
  id: UuidSchema,
  isActive: z.boolean(),
});

/**
 * Error recovery and validation schemas
 */
export const DatabaseOperationContextSchema = z.object({
  operation: z.string(),
  table: z.string(),
  timestamp: z.number(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

export const ErrorRecoveryOptionsSchema = z.object({
  retryCount: z.number().min(0).max(5).default(0),
  timeout: z.number().min(100).max(30000).default(5000),
  fallbackMode: z.boolean().default(false),
});
