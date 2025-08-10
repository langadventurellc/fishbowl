import type { BatchValidationResult } from "./BatchValidationResult";

/**
 * Generates a human-readable report of batch validation results.
 *
 * @param results - Batch validation results to report
 * @returns Formatted string report
 */
export function reportBatchValidationResults(
  results: BatchValidationResult,
): string {
  const lines: string[] = [
    `Batch Validation Results:`,
    `Total roles: ${results.totalCount}`,
    `Valid: ${results.validCount}`,
    `Invalid: ${results.invalidCount}`,
  ];

  if (results.invalidCount > 0) {
    lines.push(`\nValidation Errors:`);
    results.errors.forEach(({ index, errors }) => {
      lines.push(`  Role ${index + 1}:`);
      errors.forEach((error) => {
        lines.push(`    - ${error.message}`);
      });
    });
  }

  return lines.join("\n");
}
