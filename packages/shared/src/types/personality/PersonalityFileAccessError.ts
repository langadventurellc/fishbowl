import { PersonalityError } from "./PersonalityError";

/**
 * Error thrown when personality definitions file cannot be accessed.
 * Includes file path context for debugging without exposing sensitive paths.
 */
export class PersonalityFileAccessError extends PersonalityError {
  constructor(
    public readonly reason: string,
    cause?: Error,
  ) {
    super(
      `Failed to access personality definitions file: ${reason}`,
      "fileAccess",
      cause,
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      reason: this.reason,
    };
  }
}
