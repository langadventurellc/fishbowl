/**
 * Form data type for role creation and editing (derived from schema)
 *
 * @module types/ui/settings/RoleFormData
 */
import { z } from "zod";
import { roleSchema } from "../../../schemas";

export type RoleFormData = z.infer<typeof roleSchema>;
