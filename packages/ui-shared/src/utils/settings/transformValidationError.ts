import { ZodError } from "zod";
import { SettingsCategory } from "../../types/settings/combined/SettingsCategory";

type ZodIssue = ZodError["issues"][0];

/**
 * Transform Zod validation errors into user-friendly messages
 *
 * @param error - Zod validation error
 * @param category - Settings category for context
 * @returns User-friendly error message
 *
 * @example
 * ```typescript
 * try {
 *   schema.parse(data);
 * } catch (error) {
 *   if (error instanceof ZodError) {
 *     const message = transformValidationError(error, 'appearance');
 *     showValidationError(message);
 *   }
 * }
 * ```
 */
export function transformValidationError(
  error: ZodError,
  category?: SettingsCategory,
): string {
  const fieldErrors = groupErrorsByField(error.issues);
  const messages = formatFieldErrors(fieldErrors);

  if (messages.length === 0) {
    return category
      ? `Invalid ${category} settings. Please check your input.`
      : "Invalid settings. Please check your input.";
  }

  if (messages.length === 1) {
    return messages[0] || "Invalid settings. Please check your input.";
  }

  const prefix = category
    ? `Invalid ${category} settings:`
    : "Invalid settings:";

  return `${prefix}\n${messages.map((msg) => `• ${msg}`).join("\n")}`;
}

function groupErrorsByField(issues: ZodIssue[]): Map<string, string[]> {
  const fieldMap = new Map<string, string[]>();

  for (const issue of issues) {
    const path = issue.path.filter(
      (segment): segment is string | number =>
        typeof segment === "string" || typeof segment === "number",
    );
    const fieldPath = formatFieldPath(path);
    const message = formatIssueMessage(issue, fieldPath);

    if (!fieldMap.has(fieldPath)) {
      fieldMap.set(fieldPath, []);
    }
    fieldMap.get(fieldPath)!.push(message);
  }

  return fieldMap;
}

function formatFieldPath(path: (string | number)[]): string {
  if (path.length === 0) return "settings";

  return path
    .filter(
      (segment): segment is string | number =>
        typeof segment === "string" || typeof segment === "number",
    )
    .map((segment, index) => {
      if (typeof segment === "number") {
        return `[${segment}]`;
      }
      // Convert camelCase to readable format
      const readable = String(segment)
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      return index === 0 ? readable : readable.toLowerCase();
    })
    .join(" ");
}

function formatIssueMessage(issue: ZodIssue, fieldName: string): string {
  // Zod v4 provides user-friendly messages by default
  // We'll enhance them with field context and simplify technical language
  const message = issue.message;

  // If the message already includes the field context, use it as-is
  if (message.toLowerCase().includes(fieldName.toLowerCase())) {
    return message;
  }

  // Add field context to common message patterns
  if (message.includes("Invalid input:")) {
    const cleanMessage = message.replace("Invalid input: ", "");
    return `${fieldName}: ${cleanMessage}`;
  }

  if (message.includes("expected") || message.includes("received")) {
    return `${fieldName}: ${message}`;
  }

  // For other messages, prefix with field name
  return `${fieldName}: ${message}`;
}

function formatFieldErrors(fieldMap: Map<string, string[]>): string[] {
  const messages: string[] = [];

  fieldMap.forEach((fieldMessages) => {
    // Deduplicate messages for the same field
    const unique = Array.from(new Set(fieldMessages));
    messages.push(...unique);
  });

  return messages;
}
