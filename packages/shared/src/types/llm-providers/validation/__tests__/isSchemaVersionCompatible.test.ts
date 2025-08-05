import { isSchemaVersionCompatible } from "../isSchemaVersionCompatible";

describe("isSchemaVersionCompatible", () => {
  describe("valid version compatibility", () => {
    it("should return true for identical versions", () => {
      expect(isSchemaVersionCompatible("1.0.0", "1.0.0")).toBe(true);
      expect(isSchemaVersionCompatible("2.5.3", "2.5.3")).toBe(true);
    });

    it("should return true for higher minor version with same major", () => {
      expect(isSchemaVersionCompatible("1.1.0", "1.0.0")).toBe(true);
      expect(isSchemaVersionCompatible("1.5.0", "1.2.0")).toBe(true);
    });

    it("should return true for higher patch version with same major.minor", () => {
      expect(isSchemaVersionCompatible("1.0.1", "1.0.0")).toBe(true);
      expect(isSchemaVersionCompatible("1.2.5", "1.2.3")).toBe(true);
    });

    it("should return true for higher minor and patch versions", () => {
      expect(isSchemaVersionCompatible("1.2.3", "1.1.2")).toBe(true);
      expect(isSchemaVersionCompatible("2.5.7", "2.3.1")).toBe(true);
    });
  });

  describe("incompatible versions", () => {
    it("should return false for different major versions", () => {
      expect(isSchemaVersionCompatible("2.0.0", "1.0.0")).toBe(false);
      expect(isSchemaVersionCompatible("1.0.0", "2.0.0")).toBe(false);
      expect(isSchemaVersionCompatible("3.1.0", "2.5.0")).toBe(false);
    });

    it("should return false for lower minor version with same major", () => {
      expect(isSchemaVersionCompatible("1.0.0", "1.1.0")).toBe(false);
      expect(isSchemaVersionCompatible("2.2.0", "2.5.0")).toBe(false);
    });

    it("should return false for lower patch version with same major.minor", () => {
      expect(isSchemaVersionCompatible("1.0.0", "1.0.1")).toBe(false);
      expect(isSchemaVersionCompatible("2.3.1", "2.3.2")).toBe(false);
    });
  });

  describe("invalid version formats", () => {
    it("should return false for non-semantic version formats", () => {
      expect(isSchemaVersionCompatible("1.0", "1.0.0")).toBe(false);
      expect(isSchemaVersionCompatible("1.0.0", "1.0")).toBe(false);
      expect(isSchemaVersionCompatible("v1.0.0", "1.0.0")).toBe(false);
      expect(isSchemaVersionCompatible("1.0.0-beta", "1.0.0")).toBe(false);
    });

    it("should return false for empty or invalid strings", () => {
      expect(isSchemaVersionCompatible("", "1.0.0")).toBe(false);
      expect(isSchemaVersionCompatible("1.0.0", "")).toBe(false);
      expect(isSchemaVersionCompatible("invalid", "1.0.0")).toBe(false);
      expect(isSchemaVersionCompatible("1.0.0", "not-a-version")).toBe(false);
    });

    it("should return false for versions with non-numeric parts", () => {
      expect(isSchemaVersionCompatible("1.a.0", "1.0.0")).toBe(false);
      expect(isSchemaVersionCompatible("1.0.0", "x.y.z")).toBe(false);
      expect(isSchemaVersionCompatible("1.0.beta", "1.0.0")).toBe(false);
    });

    it("should return false for versions with extra dots", () => {
      expect(isSchemaVersionCompatible("1.0.0.1", "1.0.0")).toBe(false);
      expect(isSchemaVersionCompatible("1.0.0", "1.0.0.0")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle versions with leading zeros correctly", () => {
      expect(isSchemaVersionCompatible("1.00.0", "1.0.0")).toBe(true);
      expect(isSchemaVersionCompatible("01.0.0", "1.0.0")).toBe(true);
      expect(isSchemaVersionCompatible("1.0.01", "1.0.1")).toBe(true);
    });

    it("should handle large version numbers", () => {
      expect(isSchemaVersionCompatible("999.999.999", "999.999.999")).toBe(
        true,
      );
      expect(isSchemaVersionCompatible("1000.0.0", "999.999.999")).toBe(false);
    });

    it("should handle version 0.x.x correctly", () => {
      expect(isSchemaVersionCompatible("0.1.0", "0.0.1")).toBe(true);
      expect(isSchemaVersionCompatible("0.0.2", "0.0.1")).toBe(true);
      expect(isSchemaVersionCompatible("0.0.1", "0.1.0")).toBe(false);
    });
  });
});
