/**
 * @fileoverview Custom Jest Matchers for Personality Management
 *
 * Provides personality-specific assertions for comprehensive testing.
 * These matchers simplify complex assertions and provide clear failure messages.
 */

import type {
  PersonalityConfiguration,
  PersonalityCreationData,
  BigFiveTraitName,
  BehavioralTraitName,
} from "../../../types/personality";
import { BIG_FIVE_TRAITS, BEHAVIORAL_TRAITS } from "../../../types/personality";

/**
 * Interface for custom matcher results
 */
interface CustomMatcherResult {
  pass: boolean;
  message: () => string;
}

/**
 * Type for personality data that might be partial
 */
type PartialPersonality = Partial<
  PersonalityConfiguration | PersonalityCreationData
>;

/**
 * Validate that an object has valid Big Five traits
 */
function toHaveValidBigFiveTraits(
  received: PartialPersonality,
): CustomMatcherResult {
  const errors: string[] = [];

  for (const trait of BIG_FIVE_TRAITS) {
    const value = received[trait as keyof typeof received] as number;

    if (value === undefined || value === null) {
      errors.push(`Missing Big Five trait: ${trait}`);
    } else if (typeof value !== "number") {
      errors.push(`${trait} must be a number, received ${typeof value}`);
    } else if (value < 0 || value > 100) {
      errors.push(`${trait} must be between 0 and 100, received ${value}`);
    } else if (!Number.isInteger(value)) {
      errors.push(`${trait} must be an integer, received ${value}`);
    }
  }

  const pass = errors.length === 0;

  return {
    pass,
    message: () => {
      if (pass) {
        return `Expected personality to NOT have valid Big Five traits, but all traits were valid`;
      } else {
        return `Expected personality to have valid Big Five traits, but found errors:\n${errors.join("\n")}`;
      }
    },
  };
}

/**
 * Validate that a specific trait is in the expected range
 */
function toHaveTraitInRange(
  received: PartialPersonality,
  trait: BigFiveTraitName | BehavioralTraitName,
  min: number,
  max: number,
): CustomMatcherResult {
  const value = received[trait as keyof typeof received] as number;

  if (value === undefined || value === null) {
    return {
      pass: false,
      message: () =>
        `Expected personality to have ${trait} trait, but it was missing`,
    };
  }

  if (typeof value !== "number") {
    return {
      pass: false,
      message: () =>
        `Expected ${trait} to be a number, but received ${typeof value}`,
    };
  }

  const pass = value >= min && value <= max;

  return {
    pass,
    message: () => {
      if (pass) {
        return `Expected ${trait} (${value}) to NOT be in range ${min}-${max}`;
      } else {
        return `Expected ${trait} (${value}) to be in range ${min}-${max}`;
      }
    },
  };
}

/**
 * Validate that an object is a valid personality configuration
 */
function toBeValidPersonalityConfiguration(
  received: unknown,
): CustomMatcherResult {
  const errors: string[] = [];

  if (!received || typeof received !== "object") {
    return {
      pass: false,
      message: () =>
        `Expected a personality configuration object, but received ${typeof received}`,
    };
  }

  const personality = received as Record<string, unknown>;

  // Check required fields
  const requiredFields = ["id", "name", "isTemplate", "createdAt", "updatedAt"];
  for (const field of requiredFields) {
    if (!(field in personality)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check name is non-empty string
  if (typeof personality.name !== "string" || personality.name.trim() === "") {
    errors.push("name must be a non-empty string");
  }

  // Check boolean fields
  if (typeof personality.isTemplate !== "boolean") {
    errors.push("isTemplate must be a boolean");
  }

  // Check timestamp fields
  const timestampFields = ["createdAt", "updatedAt"];
  for (const field of timestampFields) {
    const value = personality[field];
    if (typeof value !== "string") {
      errors.push(`${field} must be a string`);
    } else {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push(`${field} must be a valid ISO timestamp`);
      }
    }
  }

  // Validate Big Five traits
  const bigFiveResult = toHaveValidBigFiveTraits(
    personality as PartialPersonality,
  );
  if (!bigFiveResult.pass) {
    errors.push("Invalid Big Five traits");
  }

  // Validate behavioral traits
  for (const trait of BEHAVIORAL_TRAITS) {
    const value = personality[trait];
    if (value !== undefined) {
      if (
        typeof value !== "number" ||
        value < 0 ||
        value > 100 ||
        !Number.isInteger(value)
      ) {
        errors.push(`${trait} must be an integer between 0 and 100`);
      }
    }
  }

  const pass = errors.length === 0;

  return {
    pass,
    message: () => {
      if (pass) {
        return `Expected object to NOT be a valid personality configuration`;
      } else {
        return `Expected object to be a valid personality configuration, but found errors:\n${errors.join("\n")}`;
      }
    },
  };
}

/**
 * Validate that traits have psychologically consistent relationships
 */
function toHavePsychologicallyConsistentTraits(
  received: PartialPersonality,
): CustomMatcherResult {
  const warnings: string[] = [];
  const personality = received as Record<string, number>;

  // Check for common psychological inconsistencies

  // High neuroticism + high assertiveness (unusual combination)
  if (
    personality.neuroticism !== undefined &&
    personality.assertiveness !== undefined &&
    personality.neuroticism > 80 &&
    personality.assertiveness > 80
  ) {
    warnings.push(
      "High neuroticism with high assertiveness is psychologically unusual",
    );
  }

  // High conscientiousness + high playfulness (often contradictory)
  if (
    personality.conscientiousness !== undefined &&
    personality.playfulness !== undefined &&
    personality.conscientiousness > 85 &&
    personality.playfulness > 85
  ) {
    warnings.push(
      "Very high conscientiousness with very high playfulness may be contradictory",
    );
  }

  // Low openness + high imagination (inconsistent)
  if (
    personality.openness !== undefined &&
    personality.imagination !== undefined &&
    personality.openness < 30 &&
    personality.imagination > 70
  ) {
    warnings.push("Low openness with high imagination is inconsistent");
  }

  // High agreeableness + high contrarianism (contradictory)
  if (
    personality.agreeableness !== undefined &&
    personality.contrarianism !== undefined &&
    personality.agreeableness > 80 &&
    personality.contrarianism > 70
  ) {
    warnings.push(
      "High agreeableness with high contrarianism is contradictory",
    );
  }

  // Low extraversion + high dramaticism (unusual)
  if (
    personality.extraversion !== undefined &&
    personality.dramaticism !== undefined &&
    personality.extraversion < 30 &&
    personality.dramaticism > 70
  ) {
    warnings.push("Low extraversion with high dramaticism is unusual");
  }

  // Consider it consistent if there are fewer than 2 major inconsistencies
  const pass = warnings.length < 2;

  return {
    pass,
    message: () => {
      if (pass) {
        return `Expected personality traits to be psychologically inconsistent, but they appear consistent`;
      } else {
        return `Expected personality traits to be psychologically consistent, but found issues:\n${warnings.join("\n")}`;
      }
    },
  };
}

/**
 * Validate that all behavioral traits are present and valid
 */
function toHaveValidBehavioralTraits(
  received: PartialPersonality,
): CustomMatcherResult {
  const errors: string[] = [];

  for (const trait of BEHAVIORAL_TRAITS) {
    const value = received[trait as keyof typeof received] as number;

    if (value === undefined || value === null) {
      errors.push(`Missing behavioral trait: ${trait}`);
    } else if (typeof value !== "number") {
      errors.push(`${trait} must be a number, received ${typeof value}`);
    } else if (value < 0 || value > 100) {
      errors.push(`${trait} must be between 0 and 100, received ${value}`);
    } else if (!Number.isInteger(value)) {
      errors.push(`${trait} must be an integer, received ${value}`);
    }
  }

  const pass = errors.length === 0;

  return {
    pass,
    message: () => {
      if (pass) {
        return `Expected personality to NOT have valid behavioral traits, but all traits were valid`;
      } else {
        return `Expected personality to have valid behavioral traits, but found errors:\n${errors.join("\n")}`;
      }
    },
  };
}

/**
 * Validate that a personality has complete trait coverage
 */
function toHaveCompleteTraitCoverage(
  received: PartialPersonality,
): CustomMatcherResult {
  const bigFiveResult = toHaveValidBigFiveTraits(received);
  const behavioralResult = toHaveValidBehavioralTraits(received);

  const pass = bigFiveResult.pass && behavioralResult.pass;

  return {
    pass,
    message: () => {
      if (pass) {
        return `Expected personality to NOT have complete trait coverage`;
      } else {
        const errors = [];
        if (!bigFiveResult.pass) errors.push("Invalid Big Five traits");
        if (!behavioralResult.pass) errors.push("Invalid behavioral traits");
        return `Expected personality to have complete trait coverage, but found: ${errors.join(", ")}`;
      }
    },
  };
}

/**
 * Custom matchers object for Jest
 */
export const personalityMatchers = {
  toHaveValidBigFiveTraits,
  toHaveTraitInRange,
  toBeValidPersonalityConfiguration,
  toHavePsychologicallyConsistentTraits,
  toHaveValidBehavioralTraits,
  toHaveCompleteTraitCoverage,
};

/**
 * Setup function to extend Jest matchers
 */
export function setupPersonalityMatchers(): void {
  expect.extend(personalityMatchers);
}

/**
 * Type declarations for TypeScript support
 */
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidBigFiveTraits(): R;
      toHaveTraitInRange(
        trait: BigFiveTraitName | BehavioralTraitName,
        min: number,
        max: number,
      ): R;
      toBeValidPersonalityConfiguration(): R;
      toHavePsychologicallyConsistentTraits(): R;
      toHaveValidBehavioralTraits(): R;
      toHaveCompleteTraitCoverage(): R;
    }
  }
}
