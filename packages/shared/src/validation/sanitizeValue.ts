/**
 * Sanitizes values to prevent exposure of sensitive data
 */
export function sanitizeValue(fieldName: string, value: unknown): unknown {
  // Never include API keys or tokens
  if (
    typeof fieldName === "string" &&
    (fieldName.toLowerCase().includes("apikey") ||
      fieldName.toLowerCase().includes("token") ||
      fieldName === "apiKey")
  ) {
    return "[REDACTED]";
  }

  // Handle null/undefined
  if (value == null) {
    return value;
  }

  // Truncate long strings
  if (typeof value === "string") {
    if (value.length > 50) {
      return value.substring(0, 47) + "...";
    }
    // Check if string looks like a secret
    if (value.startsWith("sk-") || value.startsWith("pk-")) {
      return "[REDACTED]";
    }
    return value;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }

  // Handle objects
  if (typeof value === "object") {
    return "[Object]";
  }

  return value;
}
