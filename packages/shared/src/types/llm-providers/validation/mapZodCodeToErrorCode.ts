import { z } from "zod";
import { LlmValidationErrorCode } from "./LlmValidationErrorCode";

/**
 * Maps Zod error codes to LLM validation error codes.
 *
 * @param issue - The Zod issue to map
 * @returns The corresponding LLM validation error code
 */
export function mapZodCodeToErrorCode(
  issue: z.ZodIssue,
): LlmValidationErrorCode {
  switch (issue.code) {
    case "too_small":
      return LlmValidationErrorCode.REQUIRED_FIELD_MISSING;

    case "too_big":
      return LlmValidationErrorCode.VALUE_TOO_LONG;

    case "invalid_type":
      return LlmValidationErrorCode.INVALID_FIELD_TYPE;

    case "invalid_format":
      return LlmValidationErrorCode.PATTERN_MISMATCH;

    default:
      return LlmValidationErrorCode.INVALID_CONFIGURATION;
  }
}
