/**
 * Database integrity error class
 */
export class DatabaseIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseIntegrityError';
  }
}
