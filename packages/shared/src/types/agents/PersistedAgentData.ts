import { z } from "zod";
import { persistedAgentSchema } from "./persistedAgentsSettingsSchema";

/**
 * Type inferred from the agent schema for TypeScript usage
 */
export type PersistedAgentData = z.infer<typeof persistedAgentSchema>;
