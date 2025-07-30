/**
 * @fileoverview Custom Role Update Request Type
 *
 * TypeScript type for custom role update data.
 */

import { z } from "zod";
import { CustomRoleUpdateRequestSchema } from "./CustomRoleUpdateRequest";

/**
 * Custom Role Update Request Type
 */
export type CustomRoleUpdateRequest = z.infer<
  typeof CustomRoleUpdateRequestSchema
>;
