import type { ValidationResult } from "../../../validation/ValidationResult";
import type { ColumnInfo } from "./ColumnInfo";

/**
 * Schema validation result with table structure details.
 */
export interface SchemaValidationResult extends ValidationResult {
  /** Table structure information if validation succeeds */
  columns?: ColumnInfo[];
  /** Missing columns if any are found */
  missingColumns?: string[];
  /** Incorrectly typed columns if any are found */
  incorrectTypes?: Array<{ name: string; expected: string; actual: string }>;
}
