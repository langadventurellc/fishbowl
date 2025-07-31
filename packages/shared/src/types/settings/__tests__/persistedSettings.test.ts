import {
  CURRENT_SCHEMA_VERSION,
  persistedSettingsSchema,
} from "../persistedSettingsSchema";

describe("persistedSettingsSchema", () => {
  describe("schema composition", () => {
    it("should include all individual schemas", () => {
      const validSettings = {
        general: { responseDelay: 2000 },
        appearance: { theme: "dark" as const },
        advanced: { debugMode: true },
      };

      const result = persistedSettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.general).toBeDefined();
        expect(result.data.appearance).toBeDefined();
        expect(result.data.advanced).toBeDefined();
      }
    });

    it("should delegate validation to individual schemas", () => {
      const settingsWithInvalidGeneral = {
        general: { responseDelay: -1 }, // Invalid - should delegate to general schema
        appearance: {},
        advanced: {},
      };

      const result = persistedSettingsSchema.safeParse(
        settingsWithInvalidGeneral,
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("general");
        expect(result.error.issues[0]?.path).toContain("responseDelay");
      }
    });
  });

  describe("schema versioning", () => {
    it("should default to current schema version", () => {
      const result = persistedSettingsSchema.parse({
        general: {},
        appearance: {},
        advanced: {},
      });
      expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(result.schemaVersion).toBe("1.0.0");
    });

    it("should accept custom schema version", () => {
      const settingsWithCustomVersion = {
        schemaVersion: "2.0.0-beta",
        general: {},
        appearance: {},
        advanced: {},
      };

      const result = persistedSettingsSchema.safeParse(
        settingsWithCustomVersion,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.schemaVersion).toBe("2.0.0-beta");
      }
    });

    it("should reject invalid schema version types", () => {
      const invalidSettings = {
        schemaVersion: 1.0, // Number instead of string
        general: {},
        appearance: {},
        advanced: {},
      };

      const result = persistedSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("schemaVersion");
        expect(result.error.issues[0]?.message).toContain("must be a string");
      }
    });

    it("should reject empty schema version", () => {
      const invalidSettings = {
        schemaVersion: "",
        general: {},
        appearance: {},
        advanced: {},
      };

      const result = persistedSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("schemaVersion");
        expect(result.error.issues[0]?.message).toContain("cannot be empty");
      }
    });
  });

  describe("timestamp generation", () => {
    it("should generate ISO timestamp for lastUpdated", () => {
      const result = persistedSettingsSchema.parse({
        general: {},
        appearance: {},
        advanced: {},
      });

      expect(result.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );

      // Verify it's a valid date
      const parsedDate = new Date(result.lastUpdated);
      expect(parsedDate.getTime()).not.toBeNaN();
    });

    it("should preserve provided lastUpdated timestamp", () => {
      const customTimestamp = "2023-12-25T10:30:45.123Z";
      const settingsWithTimestamp = {
        general: {},
        appearance: {},
        advanced: {},
        lastUpdated: customTimestamp,
      };

      const result = persistedSettingsSchema.parse(settingsWithTimestamp);
      expect(result.lastUpdated).toBe(customTimestamp);
    });

    it("should reject invalid lastUpdated format", () => {
      const invalidSettings = {
        general: {},
        appearance: {},
        advanced: {},
        lastUpdated: "not-iso-format",
      };

      const result = persistedSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("lastUpdated");
        expect(result.error.issues[0]?.message).toContain("valid ISO datetime");
      }
    });
  });

  describe("passthrough behavior for schema evolution", () => {
    it("should allow unknown fields", () => {
      const settingsWithUnknownField = {
        general: {},
        appearance: {},
        advanced: {},
        unknownField: "future feature",
        anotherNewField: { nested: "data" },
      };

      const result = persistedSettingsSchema.safeParse(
        settingsWithUnknownField,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty("unknownField", "future feature");
        expect(result.data).toHaveProperty("anotherNewField", {
          nested: "data",
        });
      }
    });

    it("should preserve unknown fields during validation", () => {
      const settingsWithExtensions = {
        general: {},
        appearance: {},
        advanced: {},
        experimental: { newFeatures: true },
        metadata: { version: "2.0", migration: "complete" },
      };

      const result = persistedSettingsSchema.parse(settingsWithExtensions);

      // Verify unknown fields are preserved
      expect(result.experimental).toEqual({ newFeatures: true });
      expect(result.metadata).toEqual({
        version: "2.0",
        migration: "complete",
      });
    });
  });

  describe("JSON serialization compatibility", () => {
    it("should handle JSON serialization round-trip", () => {
      const originalSettings = {
        schemaVersion: "1.0.0",
        general: { responseDelay: 2500 },
        appearance: { theme: "dark" as const },
        advanced: { debugMode: true },
        lastUpdated: "2024-01-15T14:30:22.456Z",
      };

      // Serialize to JSON and back
      const jsonString = JSON.stringify(originalSettings);
      const parsedFromJson = JSON.parse(jsonString);

      // Validate the parsed JSON data
      const result = persistedSettingsSchema.safeParse(parsedFromJson);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject(originalSettings);
      }
    });
  });
});
