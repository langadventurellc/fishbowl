import { z } from "zod";

/**
 * Transform Zod error issues into structured field error format
 *
 * @param zodError The Zod error containing validation issues
 * @returns Array of structured field errors with path and message
 */
export function createFieldErrors(
  zodError: z.ZodError,
): Array<{ path: string; message: string }> {
  return zodError.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "root",
    message: issue.message,
  }));
}
