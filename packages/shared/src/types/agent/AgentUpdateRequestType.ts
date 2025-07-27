/**
 * @fileoverview Agent Update Request Type
 *
 * TypeScript type for agent update data.
 */

import { z } from "zod";
import { AgentUpdateRequestSchema } from "./AgentUpdateRequest";

/**
 * Agent Update Request Type
 */
export type AgentUpdateRequest = z.infer<typeof AgentUpdateRequestSchema>;
