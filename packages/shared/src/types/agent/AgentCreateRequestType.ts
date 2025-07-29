/**
 * @fileoverview Agent Create Request Type
 *
 * TypeScript type for agent creation data.
 */

import { z } from "zod";
import { AgentCreateRequestSchema } from "./AgentCreateRequest";

/**
 * Agent Create Request Type
 */
export type AgentCreateRequest = z.infer<typeof AgentCreateRequestSchema>;
