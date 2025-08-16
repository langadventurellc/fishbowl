/**
 * Personality interface for UI components
 *
 * @module types/ui/settings/PersonalityViewModel
 */
import type { PersonalityFormData } from "./PersonalityFormData";

/**
 * Personality with timestamps for UI display
 */
export interface PersonalityViewModel extends PersonalityFormData {
  /** Unique identifier for the personality */
  id: string;
  /** When the personality was created (nullable) */
  createdAt?: string;
  /** When the personality was last updated (nullable) */
  updatedAt?: string;
}
