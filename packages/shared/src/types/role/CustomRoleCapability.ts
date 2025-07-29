/**
 * @fileoverview Custom Role Capability Schema
 *
 * Defines what actions or expertise areas the role can handle.
 */

import { z } from "zod";

/**
 * Custom Role Capability Schema
 * Defines what actions or expertise areas the role can handle
 */
export const CustomRoleCapabilitySchema = z.string().min(1).max(100);
