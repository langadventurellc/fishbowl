import type { SecureTextField } from "../SecureTextField";
import type { LlmValidationResult } from "./LlmValidationResult";
import { TextFieldValidator } from "./TextFieldValidator";
import { createInvalidResult } from "./createInvalidResult";
import { createFieldError } from "./createFieldError";
import { LlmValidationErrorCode } from "./LlmValidationErrorCode";

/**
 * Validator for secure text fields (e.g., passwords, API keys).
 *
 * Extends TextFieldValidator with additional security validations:
 * - Password strength checking (when enabled)
 * - Secure value handling
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
    const baseResult = super.validate(value);
    if (!baseResult.valid) return baseResult;

    // Additional security validations if value is present
    if (typeof value === "string" && value.length > 0) {
      // Check password strength if this is a password field
      if (this.isPasswordField() && !this.isStrongPassword(value)) {
        return createInvalidResult([
          createFieldError(
            this.field.id,
            LlmValidationErrorCode.WEAK_PASSWORD,
            "Password is too weak. Use uppercase, lowercase, numbers, and symbols.",
          ),
        ]);
      }
    }

    return baseResult;
  }

  /**
   * Determines if this field should have password strength validation.
   * Checks for common password field identifiers.
   */
  private isPasswordField(): boolean {
    const id = this.field.id.toLowerCase();
    const label = this.field.label.toLowerCase();
    return (
      id.includes("password") ||
      label.includes("password") ||
      id === "secret" ||
      id === "pass"
    );
  }

  /**
   * Checks password strength based on character types.
   *
   * @param password - The password to check
   * @returns True if password meets strength requirements
   */
  private isStrongPassword(password: string): boolean {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength >= 3;
  }
}
