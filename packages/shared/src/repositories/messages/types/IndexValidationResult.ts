import type { ValidationResult } from "../../../validation/ValidationResult";
import type { IndexInfo } from "./IndexInfo";

/**
 * Index validation result with index structure details.
 */
export interface IndexValidationResult extends ValidationResult {
  /** Indexes found in the table */
  indexes?: IndexInfo[];
  /** Missing indexes if any are expected */
  missingIndexes?: string[];
}
