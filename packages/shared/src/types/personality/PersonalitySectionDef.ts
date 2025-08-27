import { PersonalityTraitDef } from "./PersonalityTraitDef";

/**
 * Definition of a personality section containing related traits.
 * Examples: Big 5 traits, Communication Style, Cognitive Style, etc.
 */
export interface PersonalitySectionDef {
  /** Stable identifier for the section (e.g., "big5", "communication_style") */
  id: string;
  /** Human-readable section name displayed in UI */
  name: string;
  /** Optional description of what this section covers */
  description?: string;
  /** Array of personality traits within this section */
  values: PersonalityTraitDef[];
}
