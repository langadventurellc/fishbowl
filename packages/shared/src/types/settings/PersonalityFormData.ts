/**
 * Form data structure for personality creation and editing
 *
 * @module types/settings/PersonalityFormData
 */
import type { BigFiveTraits } from "./BigFiveTraits";

export interface PersonalityFormData {
  /** Human-readable name for the personality */
  name: string;
  /** Big Five personality traits */
  bigFive: BigFiveTraits;
  /** Additional behavior slider values (14 total) */
  behaviors: Record<string, number>;
  /** Custom instructions for personality behavior */
  customInstructions: string;
}
