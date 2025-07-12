/**
 * Custom error class for boolean validation failures
 */
export class BooleanValidationError extends Error {
  constructor(
    message: string,
    public readonly fieldName: string,
    public readonly receivedValue: unknown,
  ) {
    super(message);
    this.name = 'BooleanValidationError';
  }
}
