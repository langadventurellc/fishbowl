/**
 * Database validation error class
 */
export class DatabaseValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = 'DatabaseValidationError';
  }
}
