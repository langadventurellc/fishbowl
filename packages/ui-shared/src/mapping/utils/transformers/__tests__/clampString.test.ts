/**
 * Unit tests for clampString utility function
 */

import { clampString } from "../clampString";

describe("clampString", () => {
  describe("normal operation", () => {
    it("should return trimmed string when within bounds", () => {
      const result = clampString("  hello world  ", 5, 15);
      expect(result).toBe("hello world");
    });

    it("should trim and truncate string when over max length", () => {
      const result = clampString("  this is a very long string  ", 5, 10);
      expect(result).toBe("this is a ");
    });

    it("should trim and pad string when under min length", () => {
      const result = clampString("  hi  ", 5, 10);
      expect(result).toBe("hi   ");
    });

    it("should handle empty string by padding to minimum", () => {
      const result = clampString("", 3, 10);
      expect(result).toBe("   ");
    });

    it("should handle whitespace-only string by padding to minimum", () => {
      const result = clampString("   ", 5, 10);
      expect(result).toBe("     ");
    });

    it("should handle exact length strings", () => {
      const result = clampString("hello", 5, 5);
      expect(result).toBe("hello");
    });

    it("should handle zero minimum length", () => {
      const result = clampString("  hello  ", 0, 10);
      expect(result).toBe("hello");
    });
  });

  describe("edge cases", () => {
    it("should handle very long strings", () => {
      const longString = "a".repeat(1000);
      const result = clampString(longString, 5, 50);
      expect(result).toBe("a".repeat(50));
    });

    it("should handle unicode characters correctly", () => {
      const result = clampString("  héllo wörld  ", 5, 15);
      expect(result).toBe("héllo wörld");
    });

    it("should handle emoji characters", () => {
      const result = clampString("  👋 hello 🌍  ", 5, 15);
      expect(result).toBe("👋 hello 🌍");
    });
  });

  describe("error handling", () => {
    it("should throw error when value is not a string", () => {
      expect(() => clampString(123 as unknown as string, 5, 10)).toThrow(
        "Value must be a string",
      );
      expect(() => clampString(null as unknown as string, 5, 10)).toThrow(
        "Value must be a string",
      );
      expect(() => clampString(undefined as unknown as string, 5, 10)).toThrow(
        "Value must be a string",
      );
    });

    it("should throw error when min is not a number", () => {
      expect(() => clampString("hello", "5" as unknown as number, 10)).toThrow(
        "Min and max must be numbers",
      );
      expect(() => clampString("hello", null as unknown as number, 10)).toThrow(
        "Min and max must be numbers",
      );
    });

    it("should throw error when max is not a number", () => {
      expect(() => clampString("hello", 5, "10" as unknown as number)).toThrow(
        "Min and max must be numbers",
      );
      expect(() =>
        clampString("hello", 5, undefined as unknown as number),
      ).toThrow("Min and max must be numbers");
    });

    it("should throw error when min or max is NaN", () => {
      expect(() => clampString("hello", NaN, 10)).toThrow(
        "Min and max cannot be NaN",
      );
      expect(() => clampString("hello", 5, NaN)).toThrow(
        "Min and max cannot be NaN",
      );
    });

    it("should throw error when min is greater than max", () => {
      expect(() => clampString("hello", 10, 5)).toThrow(
        "Invalid range: min must be less than or equal to max",
      );
    });

    it("should throw error when min or max is negative", () => {
      expect(() => clampString("hello", -1, 10)).toThrow(
        "Min and max must be non-negative",
      );
      expect(() => clampString("hello", 0, -1)).toThrow(
        "Min and max must be non-negative",
      );
    });
  });

  describe("boundary conditions", () => {
    it("should handle min equals max", () => {
      const result = clampString("hello", 3, 3);
      expect(result).toBe("hel");
    });

    it("should handle min and max both zero", () => {
      const result = clampString("hello", 0, 0);
      expect(result).toBe("");
    });

    it("should handle very large numbers", () => {
      const result = clampString("hello", 0, Number.MAX_SAFE_INTEGER);
      expect(result).toBe("hello");
    });
  });
});
