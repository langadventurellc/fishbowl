/**
 * Complete personality record with unique identifier
 *
 * @module types/settings/Personality
 */
import type { PersonalityFormData } from "./PersonalityFormData";

export interface Personality extends PersonalityFormData {
  /** Unique identifier for the personality */
  id: string;
}
