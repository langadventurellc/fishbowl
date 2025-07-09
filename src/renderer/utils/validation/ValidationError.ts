export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
