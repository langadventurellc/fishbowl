import { isValidSchemaVersion } from "../isValidSchemaVersion";

describe("isValidSchemaVersion", () => {
  describe("valid schema versions", () => {
    it("should return true for valid semantic versions", () => {
      expect(isValidSchemaVersion("1.0.0")).toBe(true);
      expect(isValidSchemaVersion("0.0.1")).toBe(true);
      expect(isValidSchemaVersion("10.20.30")).toBe(true);
      expect(isValidSchemaVersion("999.999.999")).toBe(true);
    });

    it("should return true for versions with leading zeros in individual parts", () => {
      expect(isValidSchemaVersion("01.02.03")).toBe(true);
      expect(isValidSchemaVersion("001.002.003")).toBe(true);
    });

    it("should return true for single digit versions", () => {
      expect(isValidSchemaVersion("1.2.3")).toBe(true);
      expect(isValidSchemaVersion("0.0.0")).toBe(true);
    });
  });

  describe("invalid schema versions", () => {
    it("should return false for non-semantic version formats", () => {
      expect(isValidSchemaVersion("1.0")).toBe(false);
      expect(isValidSchemaVersion("1")).toBe(false);
      expect(isValidSchemaVersion("1.0.0.0")).toBe(false);
      expect(isValidSchemaVersion("v1.0.0")).toBe(false);
    });

    it("should return false for versions with non-numeric parts", () => {
      expect(isValidSchemaVersion("1.0.a")).toBe(false);
      expect(isValidSchemaVersion("a.0.0")).toBe(false);
      expect(isValidSchemaVersion("1.b.0")).toBe(false);
      expect(isValidSchemaVersion("1.0.0-alpha")).toBe(false);
      expect(isValidSchemaVersion("1.0.0+build")).toBe(false);
    });

    it("should return false for empty or invalid strings", () => {
      expect(isValidSchemaVersion("")).toBe(false);
      expect(isValidSchemaVersion("   ")).toBe(false);
      expect(isValidSchemaVersion("...")).toBe(false);
      expect(isValidSchemaVersion("..")).toBe(false);
      expect(isValidSchemaVersion(".")).toBe(false);
    });

    it("should return false for versions with special characters", () => {
      expect(isValidSchemaVersion("1.0.0-")).toBe(false);
      expect(isValidSchemaVersion("1.0.0+")).toBe(false);
      expect(isValidSchemaVersion("1.0.0_1")).toBe(false);
      expect(isValidSchemaVersion("1.0.0 ")).toBe(false);
      expect(isValidSchemaVersion(" 1.0.0")).toBe(false);
    });

    it("should return false for negative numbers", () => {
      expect(isValidSchemaVersion("-1.0.0")).toBe(false);
      expect(isValidSchemaVersion("1.-0.0")).toBe(false);
      expect(isValidSchemaVersion("1.0.-0")).toBe(false);
    });

    it("should return false for decimal numbers", () => {
      expect(isValidSchemaVersion("1.0.0.1")).toBe(false);
      expect(isValidSchemaVersion("1.5.2.3")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle very large version numbers", () => {
      expect(isValidSchemaVersion("999999.999999.999999")).toBe(true);
      expect(isValidSchemaVersion("1000000.1000000.1000000")).toBe(true);
    });

    it("should be strict about format", () => {
      expect(isValidSchemaVersion("1..0")).toBe(false);
      expect(isValidSchemaVersion("1.0.")).toBe(false);
      expect(isValidSchemaVersion(".1.0")).toBe(false);
    });
  });
});
