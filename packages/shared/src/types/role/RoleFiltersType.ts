/**
 * @fileoverview Role Filters Type
 *
 * TypeScript type for role filtering criteria.
 */

import { z } from "zod";
import { RoleFiltersSchema } from "./RoleFilters";

/**
 * Role Filters Type
 */
export type RoleFilters = z.infer<typeof RoleFiltersSchema>;
