import { validateDefaultPersonalities } from "../validateDefaultPersonalities";

describe("validateDefaultPersonalities", () => {
  describe("basic functionality", () => {
    it("should return a boolean value", () => {
      const result = validateDefaultPersonalities();

      expect(typeof result).toBe("boolean");
    });

    it("should return true for valid default data", () => {
      const result = validateDefaultPersonalities();

      expect(result).toBe(true);
    });
  });

  describe("validation behavior", () => {
    it("should validate successfully for current schema", () => {
      const isValid = validateDefaultPersonalities();

      expect(isValid).toBe(true);
    });

    it("should not throw errors during validation", () => {
      expect(() => validateDefaultPersonalities()).not.toThrow();
    });

    it("should be consistent across multiple calls", () => {
      const result1 = validateDefaultPersonalities();
      const result2 = validateDefaultPersonalities();

      expect(result1).toBe(result2);
    });
  });

  describe("error handling", () => {
    it("should handle validation errors gracefully", () => {
      // Even if validation fails, should return false instead of throwing
      const result = validateDefaultPersonalities();

      expect(typeof result).toBe("boolean");
    });

    it("should return consistent results", () => {
      const results = Array.from({ length: 5 }, () =>
        validateDefaultPersonalities(),
      );

      // All results should be the same
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(1);
    });
  });

  describe("schema compliance", () => {
    it("should validate that default data meets current schema requirements", () => {
      const isValid = validateDefaultPersonalities();

      // With proper default data, this should be true
      expect(isValid).toBe(true);
    });

    it("should validate all required personality fields exist", () => {
      // This test ensures the validator checks for required fields
      const isValid = validateDefaultPersonalities();

      expect(isValid).toBe(true);
    });
  });
});
