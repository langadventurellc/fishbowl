/**
 * Custom error class for mapping operations
 */
export class MappingError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "MappingError";
  }
}
