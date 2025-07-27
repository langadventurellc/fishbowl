/**
 * @fileoverview Agent Type
 *
 * TypeScript type definition inferred from the Agent Schema.
 */

import { z } from "zod";
import { AgentSchema } from "./AgentSchema";

/**
 * Agent Type - inferred from schema
 */
export type Agent = z.infer<typeof AgentSchema>;
