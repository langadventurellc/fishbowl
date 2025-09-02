import { DiscreteValue } from "../../utils/discreteValues";
import { PersonalityValueMeta } from "./PersonalityValueMeta";

/**
 * Definition of a single personality trait within a section.
 * Contains the trait identifier, display label, and metadata for each discrete value.
 */
export interface PersonalityTraitDef {
  /** Stable identifier used as key (e.g., "openness", "formality") */
  id: string;
  /** Human-readable display name (e.g., "Openness", "Formality") */
  name: string;
  /** Metadata for each discrete value (0, 20, 40, 60, 80, 100) */
  values: Record<`${DiscreteValue}`, PersonalityValueMeta>;
}
