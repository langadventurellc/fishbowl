/**
 * Personality behavior traits for agents.
 * All properties are optional and range from -100 to 100.
 * Negative values represent one end of the spectrum, positive the other.
 */
export type PersonalityBehaviors = {
  // Existing personality behaviors
  humor?: number;
  formality?: number;
  brevity?: number;
  assertiveness?: number;

  // New personality behaviors
  responseLength?: number;
  randomness?: number;
  focus?: number;
};
