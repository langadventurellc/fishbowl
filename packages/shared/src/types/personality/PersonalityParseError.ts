import { PersonalityError } from "./PersonalityError";

/**
 * Error thrown when personality definitions JSON parsing fails.
 * Includes parsing context for debugging.
 */
export class PersonalityParseError extends PersonalityError {
  constructor(
    public readonly parseError: string,
    cause?: Error,
  ) {
    super(
      `Failed to parse personality definitions JSON: ${parseError}`,
      "parse",
      cause,
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      parseError: this.parseError,
    };
  }
}
