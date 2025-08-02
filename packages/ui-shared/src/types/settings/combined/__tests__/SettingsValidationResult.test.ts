/**
 * Tests for SettingsValidationResult interface
 */

import type { SettingsValidationResult } from "../SettingsValidationResult";

describe("SettingsValidationResult", () => {
  it("should accept valid validation results", () => {
    const validResult: SettingsValidationResult = {
      isValid: true,
    };

    const invalidResult: SettingsValidationResult = {
      isValid: false,
      errors: {
        general: ["Invalid response delay"],
        appearance: ["Invalid font size"],
        advanced: [],
      },
      warnings: {
        general: [],
        appearance: [],
        advanced: ["Debug logging enabled"],
      },
    };

    // Type checking - these should compile without errors
    expect(validResult.isValid).toBe(true);
    expect(invalidResult.errors?.general?.[0]).toBe("Invalid response delay");
  });

  it("should handle optional fields correctly", () => {
    const minimalResult: SettingsValidationResult = {
      isValid: true,
    };

    const fullResult: SettingsValidationResult = {
      isValid: false,
      errors: {
        general: ["Error 1"],
        appearance: ["Error 2"],
        advanced: ["Error 3"],
      },
      warnings: {
        general: ["Warning 1"],
        appearance: ["Warning 2"],
        advanced: ["Warning 3"],
      },
    };

    expect(minimalResult.errors).toBeUndefined();
    expect(minimalResult.warnings).toBeUndefined();
    expect(fullResult.errors).toBeDefined();
    expect(fullResult.warnings).toBeDefined();
  });
});
