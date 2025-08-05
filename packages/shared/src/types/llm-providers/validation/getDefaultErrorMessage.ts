import { LlmValidationErrorCode } from "./LlmValidationErrorCode";

/**
 * Gets the default error message for a validation error code.
 *
 * @param code - The validation error code
 * @returns The default error message
 *
 * @example
 * ```typescript
 * const message = getDefaultErrorMessage(LlmValidationErrorCode.REQUIRED_FIELD_MISSING);
 * // Returns: "This field is required"
 * ```
 */
export const getDefaultErrorMessage = (
  code: LlmValidationErrorCode,
): string => {
  const messages: Record<LlmValidationErrorCode, string> = {
    [LlmValidationErrorCode.REQUIRED_FIELD_MISSING]: "This field is required",
    [LlmValidationErrorCode.INVALID_FIELD_TYPE]: "Invalid field type",
    [LlmValidationErrorCode.PATTERN_MISMATCH]:
      "Value does not match required pattern",
    [LlmValidationErrorCode.VALUE_TOO_SHORT]:
      "Value is shorter than minimum length",
    [LlmValidationErrorCode.VALUE_TOO_LONG]: "Value exceeds maximum length",
    [LlmValidationErrorCode.INVALID_PROVIDER_ID]:
      "Provider ID is invalid or malformed",
    [LlmValidationErrorCode.PROVIDER_NOT_FOUND]:
      "Referenced provider does not exist",
    [LlmValidationErrorCode.INVALID_CONFIGURATION]:
      "Configuration structure is invalid",
    [LlmValidationErrorCode.DUPLICATE_INSTANCE_ID]:
      "Configuration ID already exists",
    [LlmValidationErrorCode.INSECURE_VALUE]:
      "Field value contains insecure content",
    [LlmValidationErrorCode.ENCRYPTION_FAILED]:
      "Failed to encrypt secure field",
  };
  return messages[code] || "Validation error";
};
