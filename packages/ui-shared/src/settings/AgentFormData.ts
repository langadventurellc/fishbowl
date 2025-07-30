/**
 * Form data type for agent creation and editing (derived from schema)
 *
 * @module types/ui/settings/AgentFormData
 */
import { z } from "zod";
import { agentSchema } from "@fishbowl-ai/shared";

export type AgentFormData = z.infer<typeof agentSchema>;
