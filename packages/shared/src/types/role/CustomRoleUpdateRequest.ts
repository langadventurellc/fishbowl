/**
 * @fileoverview Custom Role Update Request Schema
 *
 * Partial data for updating existing custom roles.
 */

import { CustomRoleCreateRequestSchema } from "./CustomRoleCreateRequest";

/**
 * Custom Role Update Request Schema
 * Partial data for updating existing custom roles
 */
export const CustomRoleUpdateRequestSchema =
  CustomRoleCreateRequestSchema.partial();
