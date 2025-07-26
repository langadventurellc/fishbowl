import type { ALL_PERSONALITY_TRAITS } from "./PersonalityTraitConstants";

/**
 * Type for individual trait names
 */
export type PersonalityTraitName = (typeof ALL_PERSONALITY_TRAITS)[number];
