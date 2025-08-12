import { parseSchemaVersion } from "../../../../validation/parseSchemaVersion";

describe("parseSchemaVersion", () => {
  describe("valid version parsing", () => {
    it("should parse valid semantic versions", () => {
      expect(parseSchemaVersion("1.0.0")).toEqual({
        major: 1,
        minor: 0,
        patch: 0,
      });

      expect(parseSchemaVersion("2.5.10")).toEqual({
        major: 2,
        minor: 5,
        patch: 10,
      });

      expect(parseSchemaVersion("999.888.777")).toEqual({
        major: 999,
        minor: 888,
        patch: 777,
      });
    });

    it("should parse versions with leading zeros", () => {
      expect(parseSchemaVersion("01.02.03")).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
      });

      expect(parseSchemaVersion("001.000.009")).toEqual({
        major: 1,
        minor: 0,
        patch: 9,
      });
    });

    it("should parse zero versions", () => {
      expect(parseSchemaVersion("0.0.0")).toEqual({
        major: 0,
        minor: 0,
        patch: 0,
      });

      expect(parseSchemaVersion("0.1.0")).toEqual({
        major: 0,
        minor: 1,
        patch: 0,
      });
    });

    it("should parse large version numbers", () => {
      expect(parseSchemaVersion("999999.888888.777777")).toEqual({
        major: 999999,
        minor: 888888,
        patch: 777777,
      });
    });
  });

  describe("invalid version handling", () => {
    it("should return null for invalid semantic version formats", () => {
      expect(parseSchemaVersion("1.0")).toBe(null);
      expect(parseSchemaVersion("1")).toBe(null);
      expect(parseSchemaVersion("1.0.0.0")).toBe(null);
      expect(parseSchemaVersion("v1.0.0")).toBe(null);
    });

    it("should return null for versions with non-numeric parts", () => {
      expect(parseSchemaVersion("1.0.a")).toBe(null);
      expect(parseSchemaVersion("a.0.0")).toBe(null);
      expect(parseSchemaVersion("1.b.0")).toBe(null);
      expect(parseSchemaVersion("1.0.0-alpha")).toBe(null);
      expect(parseSchemaVersion("1.0.0+build")).toBe(null);
    });

    it("should return null for empty or invalid strings", () => {
      expect(parseSchemaVersion("")).toBe(null);
      expect(parseSchemaVersion("   ")).toBe(null);
      expect(parseSchemaVersion("...")).toBe(null);
      expect(parseSchemaVersion("..")).toBe(null);
      expect(parseSchemaVersion(".")).toBe(null);
    });

    it("should return null for versions with special characters", () => {
      expect(parseSchemaVersion("1.0.0-")).toBe(null);
      expect(parseSchemaVersion("1.0.0+")).toBe(null);
      expect(parseSchemaVersion("1.0.0_1")).toBe(null);
      expect(parseSchemaVersion("1.0.0 ")).toBe(null);
      expect(parseSchemaVersion(" 1.0.0")).toBe(null);
    });

    it("should return null for negative numbers", () => {
      expect(parseSchemaVersion("-1.0.0")).toBe(null);
      expect(parseSchemaVersion("1.-0.0")).toBe(null);
      expect(parseSchemaVersion("1.0.-0")).toBe(null);
    });

    it("should return null for malformed versions", () => {
      expect(parseSchemaVersion("1..0")).toBe(null);
      expect(parseSchemaVersion("1.0.")).toBe(null);
      expect(parseSchemaVersion(".1.0")).toBe(null);
      expect(parseSchemaVersion("1.0.0.")).toBe(null);
    });
  });

  describe("edge cases", () => {
    it("should handle boundary cases correctly", () => {
      expect(parseSchemaVersion("0.0.1")).toEqual({
        major: 0,
        minor: 0,
        patch: 1,
      });

      expect(parseSchemaVersion("1.0.0")).toEqual({
        major: 1,
        minor: 0,
        patch: 0,
      });
    });

    it("should validate format before parsing", () => {
      // These should be caught by isValidSchemaVersion and return null
      expect(parseSchemaVersion("1.2")).toBe(null);
      expect(parseSchemaVersion("1.2.3.4")).toBe(null);
      expect(parseSchemaVersion("v1.2.3")).toBe(null);
    });
  });
});
