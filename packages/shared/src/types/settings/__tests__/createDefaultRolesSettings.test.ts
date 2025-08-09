import { createDefaultRolesSettings } from "../createDefaultRolesSettings";
import {
  persistedRolesSettingsSchema,
  CURRENT_ROLES_SCHEMA_VERSION,
} from "../rolesSettingsSchema";

describe("createDefaultRolesSettings", () => {
  describe("basic functionality", () => {
    it("should return a valid configuration object", () => {
      const config = createDefaultRolesSettings();

      expect(config).toBeDefined();
      expect(typeof config).toBe("object");
      expect(config).not.toBeNull();
    });

    it("should have all required fields", () => {
      const config = createDefaultRolesSettings();

      expect(config).toHaveProperty("schemaVersion");
      expect(config).toHaveProperty("roles");
      expect(config).toHaveProperty("lastUpdated");
    });

    it("should return correct types for all fields", () => {
      const config = createDefaultRolesSettings();

      expect(typeof config.schemaVersion).toBe("string");
      expect(Array.isArray(config.roles)).toBe(true);
      expect(typeof config.lastUpdated).toBe("string");
    });
  });

  describe("schema version", () => {
    it("should use the current schema version constant", () => {
      const config = createDefaultRolesSettings();

      expect(config.schemaVersion).toBe(CURRENT_ROLES_SCHEMA_VERSION);
      expect(config.schemaVersion).toBe("1.0.0");
    });

    it("should have non-empty schema version", () => {
      const config = createDefaultRolesSettings();

      expect(config.schemaVersion).not.toBe("");
      expect(config.schemaVersion.length).toBeGreaterThan(0);
    });
  });

  describe("roles array", () => {
    it("should return an empty array", () => {
      const config = createDefaultRolesSettings();

      expect(config.roles).toEqual([]);
      expect(config.roles).toHaveLength(0);
    });

    it("should return a mutable array", () => {
      const config = createDefaultRolesSettings();

      // Should be able to push items without errors
      config.roles.push({
        id: "test-id",
        name: "Test Role",
        description: "Test Description",
        systemPrompt: "Test Prompt",
        createdAt: null,
        updatedAt: null,
      });

      expect(config.roles).toHaveLength(1);
    });

    it("should return a new array instance each time", () => {
      const config1 = createDefaultRolesSettings();
      const config2 = createDefaultRolesSettings();

      expect(config1.roles).not.toBe(config2.roles);
      expect(config1).not.toBe(config2);
    });
  });

  describe("timestamp generation", () => {
    it("should generate a valid ISO timestamp", () => {
      const config = createDefaultRolesSettings();

      // Should be a valid date string
      const date = new Date(config.lastUpdated);
      expect(date.toString()).not.toBe("Invalid Date");
      expect(date.toISOString()).toBe(config.lastUpdated);
    });

    it("should generate current timestamp", () => {
      const before = new Date().toISOString();
      const config = createDefaultRolesSettings();
      const after = new Date().toISOString();

      expect(config.lastUpdated >= before).toBe(true);
      expect(config.lastUpdated <= after).toBe(true);
    });

    it("should generate different timestamps for multiple calls", () => {
      const config1 = createDefaultRolesSettings();

      // Brief delay to ensure different timestamps
      const start = Date.now();
      while (Date.now() - start < 1) {
        // Small busy wait to ensure time passes
      }

      const config2 = createDefaultRolesSettings();
      expect(config1.lastUpdated).not.toBe(config2.lastUpdated);
    });
  });

  describe("schema validation", () => {
    it("should generate config that validates against schema", () => {
      const config = createDefaultRolesSettings();

      const result = persistedRolesSettingsSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("should have correct TypeScript type", () => {
      const config = createDefaultRolesSettings();

      // TypeScript compile-time check (this test passes if it compiles)
      const typedConfig: ReturnType<typeof createDefaultRolesSettings> = config;
      expect(typedConfig).toBe(config);
    });

    it("should generate schema-compliant structure", () => {
      const config = createDefaultRolesSettings();

      // Parse and validate
      const validated = persistedRolesSettingsSchema.parse(config);

      expect(validated.schemaVersion).toBe(config.schemaVersion);
      expect(validated.roles).toEqual(config.roles);
      expect(validated.lastUpdated).toBe(config.lastUpdated);
    });
  });

  describe("immutability and independence", () => {
    it("should return independent configurations", () => {
      const config1 = createDefaultRolesSettings();
      const config2 = createDefaultRolesSettings();

      // Modify first config
      config1.roles.push({
        id: "test",
        name: "Test",
        description: "Test",
        systemPrompt: "Test",
        createdAt: null,
        updatedAt: null,
      });

      // Second config should be unaffected
      expect(config2.roles).toHaveLength(0);
    });

    it("should not share references between calls", () => {
      const configs = Array.from({ length: 3 }, () =>
        createDefaultRolesSettings(),
      );

      // All should be different instances
      expect(configs[0]).not.toBe(configs[1]);
      expect(configs[1]).not.toBe(configs[2]);
      expect(configs[0]).not.toBe(configs[2]);

      // Arrays should also be different instances
      expect(configs[0]!.roles).not.toBe(configs[1]!.roles);
      expect(configs[1]!.roles).not.toBe(configs[2]!.roles);
    });
  });
});
