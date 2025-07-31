import { z } from "zod";
import { advancedSettingsSchema } from "../advancedSettingsSchema";

describe("advancedSettingsSchema", () => {
  describe("valid boolean combinations", () => {
    it("should accept true for debugMode", () => {
      const result = advancedSettingsSchema.parse({ debugMode: true });
      expect(result.debugMode).toBe(true);
    });

    it("should accept false for debugMode", () => {
      const result = advancedSettingsSchema.parse({ debugMode: false });
      expect(result.debugMode).toBe(false);
    });

    it("should default to false for debugMode when undefined", () => {
      const result = advancedSettingsSchema.parse({});
      expect(result.debugMode).toBe(false);
    });

    it("should accept true for experimentalFeatures", () => {
      const result = advancedSettingsSchema.parse({
        experimentalFeatures: true,
      });
      expect(result.experimentalFeatures).toBe(true);
    });

    it("should accept false for experimentalFeatures", () => {
      const result = advancedSettingsSchema.parse({
        experimentalFeatures: false,
      });
      expect(result.experimentalFeatures).toBe(false);
    });

    it("should default to false for experimentalFeatures when undefined", () => {
      const result = advancedSettingsSchema.parse({});
      expect(result.experimentalFeatures).toBe(false);
    });
  });

  describe("boolean validation", () => {
    it("should reject non-boolean values for debugMode", () => {
      expect(() => {
        advancedSettingsSchema.parse({ debugMode: "true" });
      }).toThrow("Debug mode must be true or false");
    });

    it("should reject non-boolean values for experimentalFeatures", () => {
      expect(() => {
        advancedSettingsSchema.parse({ experimentalFeatures: "false" });
      }).toThrow("Experimental features must be true or false");
    });

    it("should reject numeric values for debugMode", () => {
      expect(() => {
        advancedSettingsSchema.parse({ debugMode: 1 });
      }).toThrow("Debug mode must be true or false");
    });

    it("should reject numeric values for experimentalFeatures", () => {
      expect(() => {
        advancedSettingsSchema.parse({ experimentalFeatures: 0 });
      }).toThrow("Experimental features must be true or false");
    });
  });

  describe("default value application", () => {
    it("should apply all default values for empty object", () => {
      const result = advancedSettingsSchema.parse({});
      expect(result).toEqual({
        debugMode: false,
        experimentalFeatures: false,
      });
    });

    it("should apply defaults for missing fields in partial object", () => {
      const result = advancedSettingsSchema.parse({
        debugMode: true,
      });
      expect(result).toEqual({
        debugMode: true,
        experimentalFeatures: false,
      });
    });

    it("should reject undefined input", () => {
      expect(() => {
        advancedSettingsSchema.parse(undefined);
      }).toThrow("Invalid input: expected object, received undefined");
    });
  });

  describe("security validation", () => {
    it("should default both settings to false for security", () => {
      const result = advancedSettingsSchema.parse({});
      expect(result.debugMode).toBe(false);
      expect(result.experimentalFeatures).toBe(false);
    });

    it("should require explicit opt-in for debug mode", () => {
      const result = advancedSettingsSchema.parse({ debugMode: undefined });
      expect(result.debugMode).toBe(false);
    });

    it("should require explicit opt-in for experimental features", () => {
      const result = advancedSettingsSchema.parse({
        experimentalFeatures: undefined,
      });
      expect(result.experimentalFeatures).toBe(false);
    });
  });

  describe("malformed data handling", () => {
    it("should reject null input", () => {
      expect(() => {
        advancedSettingsSchema.parse(null);
      }).toThrow("Invalid input: expected object, received null");
    });

    it("should reject array input", () => {
      expect(() => {
        advancedSettingsSchema.parse([]);
      }).toThrow();
    });

    it("should reject string input", () => {
      expect(() => {
        advancedSettingsSchema.parse("invalid");
      }).toThrow();
    });

    it("should reject number input", () => {
      expect(() => {
        advancedSettingsSchema.parse(42);
      }).toThrow();
    });
  });

  describe("complete valid settings object", () => {
    it("should validate a complete valid advanced settings object", () => {
      const validSettings = {
        debugMode: true,
        experimentalFeatures: false,
      };

      const result = advancedSettingsSchema.parse(validSettings);
      expect(result).toEqual(validSettings);
    });
  });

  describe("type inference", () => {
    it("should infer correct types from schema", () => {
      type InferredType = z.infer<typeof advancedSettingsSchema>;

      const testObject: InferredType = {
        debugMode: false,
        experimentalFeatures: false,
      };

      const result = advancedSettingsSchema.parse(testObject);
      expect(result).toEqual(testObject);
    });
  });
});
