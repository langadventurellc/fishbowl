import type { ErrorInfo } from "../types";

/**
 * Checks if a value should be handled as a null/undefined case
 */
function isNullish(value: unknown): boolean {
  return value == null;
}

/**
 * Checks if a value is a primitive (non-object) type
 */
function isPrimitive(value: unknown): boolean {
  return typeof value !== "object" || value === null;
}

/**
 * Extracts basic error properties from an error-like object
 */
function extractBasicErrorProps(
  errorObj: Record<string, unknown>,
): Pick<ErrorInfo, "name" | "message"> {
  return {
    name: typeof errorObj.name === "string" ? errorObj.name : "Error",
    message:
      typeof errorObj.message === "string"
        ? errorObj.message
        : String(errorObj),
  };
}

/**
 * Extracts stack trace from an error-like object
 */
function extractStack(errorObj: Record<string, unknown>): string | undefined {
  return typeof errorObj.stack === "string" ? errorObj.stack : undefined;
}

/**
 * Extracts error code from an error-like object (only for standard Node.js style errors)
 */
function extractCode(
  errorObj: Record<string, unknown>,
): string | number | undefined {
  const code = errorObj.code;

  // Only extract code to top level for standard Error instances with Node.js-style codes
  if (
    (typeof code === "string" || typeof code === "number") &&
    errorObj.name === "Error" // Only for basic Error, not custom error classes
  ) {
    return code;
  }

  return undefined;
}

/**
 * Collects custom properties from an error object, excluding standard Error properties
 */
function collectCustomProperties(
  errorObj: Record<string, unknown>,
  seen: WeakSet<object>,
  extractedCode: string | number | undefined,
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};
  const standardProps = new Set(["name", "message", "stack"]);

  // Get all property names, including non-enumerable ones
  const allPropertyNames = Object.getOwnPropertyNames(errorObj);

  for (const key of allPropertyNames) {
    if (!standardProps.has(key)) {
      try {
        const value = errorObj[key];

        // Skip functions and symbols
        if (typeof value === "function" || typeof value === "symbol") {
          continue;
        }

        // Skip code property if it was already extracted to top level
        if (key === "code" && extractedCode != null) {
          continue;
        }

        // Handle nested error cause recursively
        if (key === "cause" && value) {
          metadata.cause = serializeError(value, seen);
        } else if (value !== undefined) {
          // For object values, serialize them recursively to handle circular references
          if (typeof value === "object" && value !== null) {
            metadata[key] = serializeError(value, seen);
          } else {
            // Try to serialize primitive values
            JSON.stringify(value);
            metadata[key] = value;
          }
        }
      } catch {
        // Skip properties that can't be serialized or accessed
        continue;
      }
    }
  }

  return metadata;
}

/**
 * Serializes an Error object into a structured ErrorInfo format suitable for logging.
 * Handles custom properties, circular references, and nested error causes.
 *
 * @param error - The Error object or unknown value to serialize
 * @param seen - WeakSet to track circular references (used internally for recursion)
 * @returns Serialized error information
 */
export function serializeError(
  error: unknown,
  seen = new WeakSet(),
): ErrorInfo {
  // Handle null/undefined
  if (isNullish(error)) {
    return {
      name: "UnknownError",
      message: String(error),
    };
  }

  // Handle circular references for objects
  if (typeof error === "object" && error !== null && seen.has(error)) {
    return {
      name: "CircularReferenceError",
      message: "[Circular Reference]",
    };
  }

  // Handle primitive types
  if (isPrimitive(error)) {
    return {
      name: "UnknownError",
      message: String(error),
    };
  }

  // Add to seen objects for circular reference detection
  seen.add(error as object);

  const errorObj = error as Record<string, unknown>;

  const result: ErrorInfo = extractBasicErrorProps(errorObj);

  // Add optional properties
  const stack = extractStack(errorObj);
  if (stack) {
    result.stack = stack;
  }

  const code = extractCode(errorObj);
  if (code != null) {
    result.code = code;
  }

  // Collect custom properties
  const metadata = collectCustomProperties(errorObj, seen, code);
  if (Object.keys(metadata).length > 0) {
    result.metadata = metadata;
  }

  return result;
}
