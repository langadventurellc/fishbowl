import { z } from "zod";
import { ValidationErrorCode } from "./ValidationErrorCode";

/**
 * Maps Zod issue codes to our validation error codes
 */
export function mapZodIssueToErrorCode(issue: z.ZodIssue): ValidationErrorCode {
  switch (issue.code) {
    case "invalid_type":
      // Check if the received value indicates a missing field
      if ("received" in issue && issue.received === "undefined") {
        return ValidationErrorCode.REQUIRED;
      }
      return ValidationErrorCode.INVALID_FORMAT;
    case "too_small":
    case "too_big":
      return ValidationErrorCode.INVALID_LENGTH;
    case "custom":
      // Check message for specific custom validations
      if (issue.message.toLowerCase().includes("api key")) {
        return ValidationErrorCode.API_KEY_FORMAT;
      }
      if (issue.message.toLowerCase().includes("duplicate")) {
        return ValidationErrorCode.DUPLICATE_NAME;
      }
      if (issue.message.toLowerCase().includes("provider")) {
        return ValidationErrorCode.PROVIDER_SPECIFIC;
      }
      if (issue.message.toLowerCase().includes("url")) {
        return ValidationErrorCode.INVALID_URL;
      }
      return ValidationErrorCode.CUSTOM_RULE;
    case "invalid_format":
      // Check if it's a URL validation error
      if (issue.message.toLowerCase().includes("url")) {
        return ValidationErrorCode.INVALID_URL;
      }
      return ValidationErrorCode.INVALID_FORMAT;
    case "invalid_value":
      return ValidationErrorCode.INVALID_ENUM;
    case "unrecognized_keys":
    case "invalid_union":
    case "invalid_key":
    case "invalid_element":
    case "not_multiple_of":
    default:
      return ValidationErrorCode.INVALID_FORMAT;
  }
}
