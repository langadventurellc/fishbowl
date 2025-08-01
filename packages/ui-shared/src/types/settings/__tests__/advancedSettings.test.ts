import {
  advancedSettingsSchema,
  type AdvancedSettingsFormData,
  defaultAdvancedSettings,
} from "../advancedSettings";

describe("advancedSettings", () => {
  describe("advancedSettingsSchema", () => {
    it("should validate correct advanced settings with both fields true", () => {
      const validSettings = {
        debugLogging: true,
        experimentalFeatures: true,
      };

      const result = advancedSettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validSettings);
      }
    });

    it("should validate correct advanced settings with both fields false", () => {
      const validSettings = {
        debugLogging: false,
        experimentalFeatures: false,
      };

      const result = advancedSettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validSettings);
      }
    });

    it("should validate correct advanced settings with mixed boolean values", () => {
      const validSettings = {
        debugLogging: true,
        experimentalFeatures: false,
      };

      const result = advancedSettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validSettings);
      }
    });

    it("should reject non-boolean debugLogging string values", () => {
      const invalidSettings = {
        debugLogging: "true",
        experimentalFeatures: false,
      };

      const result = advancedSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues.find((issue) =>
          issue.message.includes("Debug logging must be true or false"),
        );
        expect(errorMessage).toBeDefined();
      }
    });

    it("should reject non-boolean debugLogging number values", () => {
      const invalidSettings = {
        debugLogging: 1,
        experimentalFeatures: false,
      };

      const result = advancedSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues.find((issue) =>
          issue.message.includes("Debug logging must be true or false"),
        );
        expect(errorMessage).toBeDefined();
      }
    });

    it("should reject non-boolean experimentalFeatures string values", () => {
      const invalidSettings = {
        debugLogging: false,
        experimentalFeatures: "enabled",
      };

      const result = advancedSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues.find((issue) =>
          issue.message.includes("Experimental features must be true or false"),
        );
        expect(errorMessage).toBeDefined();
      }
    });

    it("should reject non-boolean experimentalFeatures number values", () => {
      const invalidSettings = {
        debugLogging: false,
        experimentalFeatures: 1,
      };

      const result = advancedSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues.find((issue) =>
          issue.message.includes("Experimental features must be true or false"),
        );
        expect(errorMessage).toBeDefined();
      }
    });

    it("should reject null values for debugLogging", () => {
      const invalidSettings = {
        debugLogging: null,
        experimentalFeatures: false,
      };

      const result = advancedSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });

    it("should reject null values for experimentalFeatures", () => {
      const invalidSettings = {
        debugLogging: false,
        experimentalFeatures: null,
      };

      const result = advancedSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });

    it("should reject undefined values for debugLogging", () => {
      const invalidSettings = {
        debugLogging: undefined,
        experimentalFeatures: false,
      };

      const result = advancedSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });

    it("should reject undefined values for experimentalFeatures", () => {
      const invalidSettings = {
        debugLogging: false,
        experimentalFeatures: undefined,
      };

      const result = advancedSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });

    it("should reject empty object", () => {
      const emptySettings = {};

      const result = advancedSettingsSchema.safeParse(emptySettings);
      expect(result.success).toBe(false);
    });

    it("should reject objects with missing debugLogging field", () => {
      const partialSettings = {
        experimentalFeatures: true,
      };

      const result = advancedSettingsSchema.safeParse(partialSettings);
      expect(result.success).toBe(false);
    });

    it("should reject objects with missing experimentalFeatures field", () => {
      const partialSettings = {
        debugLogging: true,
      };

      const result = advancedSettingsSchema.safeParse(partialSettings);
      expect(result.success).toBe(false);
    });

    it("should reject objects with extra fields", () => {
      const settingsWithExtra = {
        debugLogging: false,
        experimentalFeatures: false,
        extraField: "should not exist",
      };

      const result = advancedSettingsSchema.safeParse(settingsWithExtra);
      expect(result.success).toBe(false);
    });
  });

  describe("defaultAdvancedSettings", () => {
    it("should have debugLogging disabled by default for security", () => {
      expect(defaultAdvancedSettings.debugLogging).toBe(false);
    });

    it("should have experimentalFeatures disabled by default for stability", () => {
      expect(defaultAdvancedSettings.experimentalFeatures).toBe(false);
    });

    it("should have all developer options disabled by default", () => {
      expect(defaultAdvancedSettings.debugLogging).toBe(false);
      expect(defaultAdvancedSettings.experimentalFeatures).toBe(false);
    });

    it("should be a valid schema object", () => {
      const result = advancedSettingsSchema.safeParse(defaultAdvancedSettings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(defaultAdvancedSettings);
      }
    });
  });

  describe("AdvancedSettingsFormData type", () => {
    it("should correctly infer types from schema", () => {
      const settings: AdvancedSettingsFormData = {
        debugLogging: true,
        experimentalFeatures: false,
      };

      expect(typeof settings.debugLogging).toBe("boolean");
      expect(typeof settings.experimentalFeatures).toBe("boolean");
    });

    it("should enforce boolean type constraints at compile time", () => {
      // This test ensures TypeScript catches type errors at compile time
      const validSettings: AdvancedSettingsFormData = {
        debugLogging: false,
        experimentalFeatures: true,
      };

      expect(validSettings.debugLogging).toBe(false);
      expect(validSettings.experimentalFeatures).toBe(true);
    });

    it("should have correct property names", () => {
      const settings: AdvancedSettingsFormData = defaultAdvancedSettings;

      expect(settings).toHaveProperty("debugLogging");
      expect(settings).toHaveProperty("experimentalFeatures");
    });
  });

  describe("security considerations", () => {
    it("should not allow debug logging to be enabled by default", () => {
      expect(defaultAdvancedSettings.debugLogging).toBe(false);
    });

    it("should not allow experimental features to be enabled by default", () => {
      expect(defaultAdvancedSettings.experimentalFeatures).toBe(false);
    });

    it("should require explicit boolean values (no truthy/falsy coercion)", () => {
      const truthySettings = {
        debugLogging: "yes",
        experimentalFeatures: 1,
      };

      const result = advancedSettingsSchema.safeParse(truthySettings);
      expect(result.success).toBe(false);
    });
  });
});
