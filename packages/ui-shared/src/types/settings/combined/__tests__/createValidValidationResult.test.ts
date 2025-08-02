/**
 * Tests for createValidValidationResult utility
 */

import { createValidValidationResult } from "../createValidValidationResult";

describe("createValidValidationResult", () => {
  it("should create valid validation result", () => {
    const result = createValidValidationResult();

    expect(result.isValid).toBe(true);
    expect(result.errors).toBeUndefined();
    expect(result.warnings).toBeUndefined();
  });

  it("should return consistent results", () => {
    const result1 = createValidValidationResult();
    const result2 = createValidValidationResult();

    expect(result1).toEqual(result2);
    expect(result1.isValid).toBe(result2.isValid);
  });

  it("should create objects with correct structure", () => {
    const result = createValidValidationResult();

    expect(typeof result).toBe("object");
    expect("isValid" in result).toBe(true);
    expect(Object.keys(result)).toEqual(["isValid"]);
  });
});
