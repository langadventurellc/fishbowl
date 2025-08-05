import type { SecureTextField } from "../SecureTextField";
import type { LlmValidationResult } from "./LlmValidationResult";
import { TextFieldValidator } from "./TextFieldValidator";

/**
 * Validator for secure text fields (e.g., API keys).
 *
 * Extends TextFieldValidator with secure value handling.
 */
export class SecureTextFieldValidator extends TextFieldValidator {
  constructor(field: SecureTextField) {
    // Both TextField and SecureTextField have the same validation properties
    super({
      ...field,
      type: "text" as const,
    });
  }

  validate(value: unknown): LlmValidationResult {
    // Use base text validation
    return super.validate(value);
  }
}
