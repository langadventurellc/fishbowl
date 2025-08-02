import { SettingsErrorCode } from "./SettingsErrorCode";

/**
 * Extended error class for settings-related errors
 */
export class SettingsError extends Error {
  constructor(
    message: string,
    public readonly code: SettingsErrorCode,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "SettingsError";

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SettingsError);
    }
  }
}
