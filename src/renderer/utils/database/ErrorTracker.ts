import { DatabaseError } from './DatabaseError';
import { DatabaseErrorType } from './DatabaseErrorType';

/**
 * Error aggregation and pattern detection
 */

export class ErrorTracker {
  private errors: DatabaseError[] = [];
  private maxErrors: number;

  constructor(maxErrors: number = 100) {
    this.maxErrors = maxErrors;
  }

  trackError(error: DatabaseError): void {
    this.errors.push(error);

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }

  getRecentErrors(limit?: number): DatabaseError[] {
    return limit ? this.errors.slice(-limit) : [...this.errors];
  }

  getErrorsByType(type: DatabaseErrorType): DatabaseError[] {
    return this.errors.filter(error => error.type === type);
  }

  getErrorsByOperation(operation: string): DatabaseError[] {
    return this.errors.filter(error => error.operation === operation);
  }

  getErrorPatterns(): Array<{ pattern: string; count: number; lastOccurrence: number }> {
    const patterns = new Map<string, { count: number; lastOccurrence: number }>();

    for (const error of this.errors) {
      const pattern = `${error.type}:${error.operation}`;
      const existing = patterns.get(pattern) ?? { count: 0, lastOccurrence: 0 };
      patterns.set(pattern, {
        count: existing.count + 1,
        lastOccurrence: Math.max(existing.lastOccurrence, error.timestamp),
      });
    }

    return Array.from(patterns.entries()).map(([pattern, data]) => ({
      pattern,
      ...data,
    }));
  }

  clearErrors(): void {
    this.errors = [];
  }
}
