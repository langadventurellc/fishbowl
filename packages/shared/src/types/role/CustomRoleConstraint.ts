/**
 * @fileoverview Custom Role Constraint Schema
 *
 * Defines limitations or restrictions on the role's behavior.
 */

import { z } from "zod";

/**
 * Custom Role Constraint Schema
 * Defines limitations or restrictions on the role's behavior
 */
export const CustomRoleConstraintSchema = z.string().min(1).max(200);
