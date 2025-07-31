import { FileStorageError } from "./FileStorageError";

/**
 * Error thrown when settings validation fails.
 * Contains detailed field-level validation errors.
 */
export class SettingsValidationError extends FileStorageError {
  constructor(
    filePath: string,
    operation: string,
    public readonly fieldErrors: Array<{ path: string; message: string }>,
    cause?: Error,
  ) {
    const message = `Settings validation failed: ${fieldErrors.length} field errors`;
    super(message, operation, filePath, cause);
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      fieldErrors: this.fieldErrors,
    };
  }
}
