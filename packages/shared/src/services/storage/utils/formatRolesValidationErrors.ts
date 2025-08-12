import { z } from "zod";

/**
 * Maps field paths to user-friendly display names for roles validation.
 * Provides context-aware naming for nested role fields.
 *
 * @param path - The field path from Zod validation (e.g., "roles.0.name")
 * @returns User-friendly display name (e.g., "Role 1 name")
 */
function getRoleFieldDisplayName(path: string): string {
  const pathParts = path.split(".");

  // Map of field names to display names
  const fieldMappings: Record<string, string> = {
    schemaVersion: "Schema version",
    roles: "Roles list",
    lastUpdated: "Last updated timestamp",
    id: "Role ID",
    name: "Role name",
    description: "Role description",
    systemPrompt: "System prompt",
    createdAt: "Created timestamp",
    updatedAt: "Updated timestamp",
  };

  // Handle roles array with index (e.g., "roles.0.name" -> "Role 1 name")
  if (pathParts[0] === "roles" && pathParts.length > 2) {
    const roleIndexStr = pathParts[1];
    const fieldName = pathParts[2];

    if (roleIndexStr !== undefined && fieldName !== undefined) {
      const roleIndex = parseInt(roleIndexStr, 10);
      const displayField = fieldMappings[fieldName] || fieldName;
      return `Role ${roleIndex + 1} ${displayField.toLowerCase()}`;
    }
  }

  // Handle top-level fields
  const basePath = pathParts[pathParts.length - 1];
  return basePath !== undefined ? fieldMappings[basePath] || basePath : path;
}

/**
 * Formats Zod validation errors into user-friendly messages for roles.
 * Provides clear, actionable error messages with specific guidance.
 * Follows the pattern established by SettingsRepository.formatZodErrors().
 *
 * @param zodError - The Zod validation error to format
 * @returns Array of formatted field errors with friendly messages
 *
 * @example
 * ```typescript
 * try {
 *   const validatedData = rolesSchema.parse(rawData);
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     const friendlyErrors = formatRolesValidationErrors(error);
 *     console.log(friendlyErrors);
 *     // [{ path: "roles.0.name", message: "Role 1 name cannot exceed 100 characters. Please shorten the text." }]
 *   }
 * }
 * ```
 */
export function formatRolesValidationErrors(
  zodError: z.ZodError,
): Array<{ path: string; message: string }> {
  return zodError.issues.map((issue) => {
    const path = issue.path.join(".");
    const fieldName = getRoleFieldDisplayName(path);

    // Create enhanced error messages based on validation type
    let enhancedMessage = issue.message;

    // Enhance messages with specific guidance and character limits
    if (issue.message.includes("cannot exceed")) {
      // Extract character limit from message for length validation
      const match = issue.message.match(/(\d+) characters/);
      if (match) {
        const limit = match[1];
        enhancedMessage = `${fieldName} cannot exceed ${limit} characters. Please shorten the text.`;
      }
    } else if (issue.message.includes("is required")) {
      enhancedMessage = `${fieldName} is required and cannot be empty.`;
    } else if (issue.message.includes("cannot be empty")) {
      enhancedMessage = `${fieldName} must have a value.`;
    } else if (issue.message.includes("must be a string")) {
      enhancedMessage = `${fieldName} must be text (received ${typeof issue.input}).`;
    } else if (issue.message.includes("must be an array")) {
      enhancedMessage = `${fieldName} must be a list of role objects.`;
    } else if (issue.message.includes("valid ISO datetime")) {
      enhancedMessage = `${fieldName} must be a valid date/time format (ISO 8601) or can be left empty.`;
    } else {
      // For other errors, just use the enhanced field name
      enhancedMessage = issue.message.replace(/^[A-Z][a-z\s]*/, fieldName);
    }

    return {
      path: path || "root",
      message: enhancedMessage,
    };
  });
}
