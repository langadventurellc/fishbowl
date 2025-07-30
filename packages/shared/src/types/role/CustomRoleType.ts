/**
 * @fileoverview Custom Role Type
 *
 * TypeScript type definition inferred from the Custom Role Schema.
 */

import { z } from "zod";
import { CustomRoleSchema } from "./CustomRoleCore";

/**
 * Custom Role Type - inferred from schema
 */
export type CustomRole = z.infer<typeof CustomRoleSchema>;
