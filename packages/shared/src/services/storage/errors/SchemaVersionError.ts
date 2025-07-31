import { FileStorageError } from "./FileStorageError";

/**
 * Error thrown when schema version mismatch occurs.
 * Contains both current and expected version information.
 */
export class SchemaVersionError extends FileStorageError {
  constructor(
    filePath: string,
    operation: string,
    public readonly currentVersion: string,
    public readonly expectedVersion: string,
    cause?: Error,
  ) {
    const message = `Schema version mismatch: expected ${expectedVersion}, got ${currentVersion}`;
    super(message, operation, filePath, cause);
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      currentVersion: this.currentVersion,
      expectedVersion: this.expectedVersion,
    };
  }
}
