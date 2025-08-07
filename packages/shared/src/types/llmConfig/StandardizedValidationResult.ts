import type { ValidationError } from "./ValidationError";

/**
 * Aggregated validation result with typed data
 */
export interface StandardizedValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
}
