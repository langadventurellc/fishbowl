/**
 * Form data type for agent creation and editing (derived from schema)
 *
 * @module types/settings/AgentFormData
 */
import { z } from "zod";
import { agentSchema } from "../../schemas";

export type AgentFormData = z.infer<typeof agentSchema>;
