/**
 * Form data type for role creation and editing (derived from schema)
 *
 * @module types/ui/settings/RoleFormData
 */
import { z } from "zod";
import { roleSchema } from "@fishbowl-ai/shared";

export type RoleFormData = z.infer<typeof roleSchema>;
