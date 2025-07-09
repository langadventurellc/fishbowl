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
  metadata: z.string().optional().default('{}'),
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
  where: z.record(z.any()).optional(),
});
