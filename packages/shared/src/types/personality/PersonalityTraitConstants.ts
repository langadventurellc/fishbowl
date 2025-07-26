/**
 * Trait names for Big Five personality model
 */
export const BIG_FIVE_TRAITS = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
] as const;

/**
 * Trait names for behavioral traits
 */
export const BEHAVIORAL_TRAITS = [
  "formality",
  "humor",
  "assertiveness",
  "empathy",
  "storytelling",
  "brevity",
  "imagination",
  "playfulness",
  "dramaticism",
  "analyticalDepth",
  "contrarianism",
  "encouragement",
  "curiosity",
  "patience",
] as const;

/**
 * All personality trait names combined
 */
export const ALL_PERSONALITY_TRAITS = [
  ...BIG_FIVE_TRAITS,
  ...BEHAVIORAL_TRAITS,
] as const;
