/**
 * Form data type for agent creation and editing (derived from schema)
 *
 * @module types/ui/settings/AgentFormData
 */
import { z } from "zod";
import { agentSchema } from "../../schemas/agentSchema";

export type AgentFormData = z.infer<typeof agentSchema>;
