import { DiscreteValue } from "../../utils/discreteValues";

/**
 * Type for personality values object with trait IDs as keys.
 * Used for storing actual personality configuration values.
 */
export type PersonalityValues = Record<string, DiscreteValue>;
