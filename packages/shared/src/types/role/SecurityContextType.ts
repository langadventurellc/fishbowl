/**
 * @fileoverview Security Context Type
 *
 * TypeScript type for security context definitions.
 */

import { z } from "zod";
import { SecurityContextSchema } from "./SecurityContext";

/**
 * Security Context Type
 */
export type SecurityContext = z.infer<typeof SecurityContextSchema>;
