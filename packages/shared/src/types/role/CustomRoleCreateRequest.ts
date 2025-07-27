/**
 * @fileoverview Custom Role Creation Request Schema
 *
 * Data required to create a new custom role.
 */

import { CustomRoleSchema } from "./CustomRoleCore";

/**
 * Custom Role Creation Request Schema
 * Data required to create a new custom role
 */
export const CustomRoleCreateRequestSchema = CustomRoleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
});
