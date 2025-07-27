/**
 * Main types barrel export for Fishbowl shared package.
 *
 * Re-exports all TypeScript interfaces and types organized by domain.
 * This provides clean import paths for consuming applications.
 *
 * @module types
 */

// Re-export all UI types for clean imports
export * from "./ui";

// Agent service types (use explicit exports to avoid naming conflicts with UI Agent)
export {
  AgentSchema,
  AgentCreateRequestSchema,
  AgentUpdateRequestSchema,
} from "./agent";
export type {
  Agent as ServiceAgent,
  AgentCreateRequest,
  AgentUpdateRequest,
} from "./agent";

// Role types and service interfaces
export * from "./role";
export * from "./services";

// Personality types
export * from "./personality";
