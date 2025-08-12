import { z } from "zod";
import type { ValidationError } from "../types/llmConfig/ValidationError";
import { mapZodIssueToErrorCode } from "../types/llmConfig/mapZodIssueToErrorCode";
import { sanitizeValue } from "./sanitizeValue";

/**
 * Converts Zod error to standardized validation errors
 */
export function formatZodErrors(zodError: z.ZodError): ValidationError[] {
  return zodError.issues.map((issue) => ({
    field: issue.path.join(".") || "root",
    code: mapZodIssueToErrorCode(issue),
    message: issue.message,
    value: sanitizeValue(issue.path[0] as string, undefined),
  }));
}
