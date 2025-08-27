import { PersonalityError } from "./PersonalityError";

/**
 * Error thrown when personality definitions fail schema validation.
 * Includes validation context for debugging.
 */
export class PersonalityValidationError extends PersonalityError {
  constructor(
    public readonly validationDetails: string,
    cause?: Error,
  ) {
    super(
      `Personality definitions failed validation: ${validationDetails}`,
      "validation",
      cause,
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      validationDetails: this.validationDetails,
    };
  }
}
