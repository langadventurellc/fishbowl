/**
 * Form data type for personality creation and editing (derived from schema)
 *
 * @module types/ui/settings/PersonalityFormData
 */
import { z } from "zod";
import { personalitySchema } from "../schemas/personalitySchema";

export type PersonalityFormData = z.infer<typeof personalitySchema>;
