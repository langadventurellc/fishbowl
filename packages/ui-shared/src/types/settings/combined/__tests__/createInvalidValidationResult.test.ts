/**
 * Tests for createInvalidValidationResult utility
 */

import { createInvalidValidationResult } from "../createInvalidValidationResult";

describe("createInvalidValidationResult", () => {
  it("should create invalid validation result with errors", () => {
    const errors = {
      general: ["Response delay too high"],
      appearance: ["Font size out of range"],
      advanced: [],
    };

    const result = createInvalidValidationResult(errors);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(errors);
    expect(result.warnings).toBeUndefined();
  });

  it("should create invalid validation result with errors and warnings", () => {
    const errors = {
      general: ["Response delay too high"],
      appearance: [],
      advanced: [],
    };

    const warnings = {
      general: [],
      appearance: ["Large font size may affect performance"],
      advanced: ["Debug logging enabled"],
    };

    const result = createInvalidValidationResult(errors, warnings);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(errors);
    expect(result.warnings).toEqual(warnings);
  });

  it("should handle empty error arrays", () => {
    const errors = {
      general: [],
      appearance: [],
      advanced: [],
    };

    const result = createInvalidValidationResult(errors);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(errors);
    expect(result.warnings).toBeUndefined();
  });

  it("should preserve error and warning structure", () => {
    const errors = {
      general: ["Error 1", "Error 2"],
      appearance: ["Appearance error"],
      advanced: [],
    };

    const warnings = {
      general: ["Warning 1"],
      appearance: [],
      advanced: ["Advanced warning"],
    };

    const result = createInvalidValidationResult(errors, warnings);

    expect(result.errors?.general).toHaveLength(2);
    expect(result.errors?.appearance).toHaveLength(1);
    expect(result.errors?.advanced).toHaveLength(0);
    expect(result.warnings?.general).toHaveLength(1);
    expect(result.warnings?.appearance).toHaveLength(0);
    expect(result.warnings?.advanced).toHaveLength(1);
  });
});
