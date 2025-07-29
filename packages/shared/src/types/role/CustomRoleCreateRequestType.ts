/**
 * @fileoverview Custom Role Creation Request Type
 *
 * TypeScript type for custom role creation data.
 */

import { z } from "zod";
import { CustomRoleCreateRequestSchema } from "./CustomRoleCreateRequest";

/**
 * Custom Role Creation Request Type
 */
export type CustomRoleCreateRequest = z.infer<
  typeof CustomRoleCreateRequestSchema
>;
