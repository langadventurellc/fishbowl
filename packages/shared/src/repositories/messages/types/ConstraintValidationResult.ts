import type { ValidationResult } from "../../../validation/ValidationResult";
import type { ForeignKeyInfo } from "./ForeignKeyInfo";

/**
 * Constraint validation result with foreign key enforcement details.
 */
export interface ConstraintValidationResult extends ValidationResult {
  /** Foreign key constraints that were tested */
  constraints?: ForeignKeyInfo[];
  /** Failed constraint tests if any */
  failedConstraints?: Array<{ constraint: string; reason: string }>;
}
