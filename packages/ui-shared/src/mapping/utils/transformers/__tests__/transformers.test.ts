import {
  convertTimeUnit,
  normalizeEnum,
  coerceBoolean,
  clampNumber,
} from "../index";

describe("transformers", () => {
  describe("convertTimeUnit", () => {
    it("should return same value when units match", () => {
      expect(convertTimeUnit(1000, "ms", "ms")).toBe(1000);
      expect(convertTimeUnit(5, "s", "s")).toBe(5);
    });

    it("should convert milliseconds to seconds", () => {
      expect(convertTimeUnit(1000, "ms", "s")).toBe(1);
      expect(convertTimeUnit(2500, "ms", "s")).toBe(2.5);
      expect(convertTimeUnit(0, "ms", "s")).toBe(0);
    });

    it("should convert seconds to milliseconds", () => {
      expect(convertTimeUnit(1, "s", "ms")).toBe(1000);
      expect(convertTimeUnit(2.5, "s", "ms")).toBe(2500);
      expect(convertTimeUnit(0, "s", "ms")).toBe(0);
    });

    it("should handle edge cases", () => {
      expect(convertTimeUnit(-1000, "ms", "s")).toBe(-1);
      expect(convertTimeUnit(0.001, "s", "ms")).toBe(1);
      expect(convertTimeUnit(Infinity, "ms", "s")).toBe(Infinity);
    });
  });

  describe("normalizeEnum", () => {
    const validColors = ["red", "green", "blue"] as const;
    type Color = (typeof validColors)[number];

    it("should return valid enum values as-is", () => {
      expect(normalizeEnum<Color>("red", validColors, "blue")).toBe("red");
      expect(normalizeEnum<Color>("green", validColors, "blue")).toBe("green");
    });

    it("should return default for invalid string values", () => {
      expect(normalizeEnum<Color>("yellow", validColors, "blue")).toBe("blue");
      expect(normalizeEnum<Color>("RED", validColors, "blue")).toBe("blue");
    });

    it("should return default for non-string values", () => {
      expect(normalizeEnum<Color>(123, validColors, "blue")).toBe("blue");
      expect(normalizeEnum<Color>(null, validColors, "blue")).toBe("blue");
      expect(normalizeEnum<Color>(undefined, validColors, "blue")).toBe("blue");
      expect(normalizeEnum<Color>({}, validColors, "blue")).toBe("blue");
    });

    it("should handle empty valid values array", () => {
      expect(normalizeEnum("anything", [], "default")).toBe("default");
    });
  });

  describe("coerceBoolean", () => {
    it("should return boolean values as-is", () => {
      expect(coerceBoolean(true)).toBe(true);
      expect(coerceBoolean(false)).toBe(false);
    });

    it("should convert string values", () => {
      expect(coerceBoolean("true")).toBe(true);
      expect(coerceBoolean("True")).toBe(true);
      expect(coerceBoolean("TRUE")).toBe(true);
      expect(coerceBoolean("1")).toBe(true);
      expect(coerceBoolean("yes")).toBe(true);
      expect(coerceBoolean("YES")).toBe(true);

      expect(coerceBoolean("false")).toBe(false);
      expect(coerceBoolean("False")).toBe(false);
      expect(coerceBoolean("FALSE")).toBe(false);
      expect(coerceBoolean("0")).toBe(false);
      expect(coerceBoolean("no")).toBe(false);
      expect(coerceBoolean("NO")).toBe(false);
    });

    it("should handle string edge cases", () => {
      expect(coerceBoolean("  true  ")).toBe(true);
      expect(coerceBoolean("  false  ")).toBe(false);
      expect(coerceBoolean("random")).toBe(true);
      expect(coerceBoolean("")).toBe(false);
    });

    it("should convert numeric values", () => {
      expect(coerceBoolean(1)).toBe(true);
      expect(coerceBoolean(-1)).toBe(true);
      expect(coerceBoolean(0)).toBe(false);
      expect(coerceBoolean(NaN)).toBe(false);
      expect(coerceBoolean(Infinity)).toBe(true);
    });

    it("should handle other types", () => {
      expect(coerceBoolean(null)).toBe(false);
      expect(coerceBoolean(undefined)).toBe(false);
      expect(coerceBoolean({})).toBe(true);
      expect(coerceBoolean([])).toBe(true);
      expect(coerceBoolean([1])).toBe(true);
    });
  });

  describe("clampNumber", () => {
    it("should return value when within bounds", () => {
      expect(clampNumber(5, 0, 10)).toBe(5);
      expect(clampNumber(0, 0, 10)).toBe(0);
      expect(clampNumber(10, 0, 10)).toBe(10);
    });

    it("should clamp to min when below", () => {
      expect(clampNumber(-5, 0, 10)).toBe(0);
      expect(clampNumber(-100, -10, 10)).toBe(-10);
    });

    it("should clamp to max when above", () => {
      expect(clampNumber(15, 0, 10)).toBe(10);
      expect(clampNumber(100, -10, 10)).toBe(10);
    });

    it("should handle equal min and max", () => {
      expect(clampNumber(5, 10, 10)).toBe(10);
      expect(clampNumber(15, 10, 10)).toBe(10);
    });

    it("should handle edge values", () => {
      expect(clampNumber(-Infinity, -100, 100)).toBe(-100);
      expect(clampNumber(Infinity, -100, 100)).toBe(100);
    });

    it("should throw on NaN inputs", () => {
      expect(() => clampNumber(NaN, 0, 10)).toThrow("Invalid numeric input");
      expect(() => clampNumber(5, NaN, 10)).toThrow("Invalid numeric input");
      expect(() => clampNumber(5, 0, NaN)).toThrow("Invalid numeric input");
    });

    it("should throw when min > max", () => {
      expect(() => clampNumber(5, 10, 0)).toThrow("Invalid range");
    });
  });
});
