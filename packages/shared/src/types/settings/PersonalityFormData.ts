/**
 * Form data type for personality creation and editing (derived from schema)
 *
 * @module types/settings/PersonalityFormData
 */
import { z } from "zod";
import { personalitySchema } from "../../schemas";

export type PersonalityFormData = z.infer<typeof personalitySchema>;
