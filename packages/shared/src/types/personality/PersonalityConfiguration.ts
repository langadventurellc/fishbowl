import type { BigFiveTraits } from "./BigFiveTraits";
import type { BehavioralTraits } from "./BehavioralTraits";

/**
 * Complete personality configuration combining Big Five and behavioral traits
 */
export interface PersonalityConfiguration
  extends BigFiveTraits,
    BehavioralTraits {
  /** Unique identifier for the personality */
  id: string;
  /** Display name for the personality */
  name: string;
  /** Optional description of the personality */
  description?: string;
  /** Free-form text for personality overrides and augmentation */
  customInstructions?: string;
  /** Whether this is a template personality (predefined) */
  isTemplate: boolean;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}
