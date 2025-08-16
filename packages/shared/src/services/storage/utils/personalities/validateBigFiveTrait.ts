/**
 * Validates a single Big Five trait value
 * @param traitName - Name of the trait being validated
 * @param value - Value to validate
 * @returns Error message if invalid, null if valid
 */
export function validateBigFiveTrait(
  traitName: string,
  value: unknown,
): string | null {
  if (typeof value !== "number") {
    return `Big Five trait '${traitName}' must be a number, received: ${typeof value === "string" ? `'${value}'` : value}`;
  }

  if (isNaN(value) || !isFinite(value)) {
    return `Big Five trait '${traitName}' must be a valid number, received: ${value}`;
  }

  if (value < 0 || value > 100) {
    return `Big Five trait '${traitName}' must be between 0-100, received: ${value}`;
  }

  return null;
}
