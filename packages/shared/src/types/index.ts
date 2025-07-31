/**
 * Main types barrel export for Fishbowl shared package.
 *
 * @module types
 */

export {
  AgentCreateRequestSchema,
  AgentSchema,
  AgentUpdateRequestSchema,
} from "./agent";
export type {
  AgentCreateRequest,
  AgentUpdateRequest,
  Agent as ServiceAgent,
} from "./agent";
export * from "./model";
export * from "./personality";
export * from "./role";
export * from "./services";
