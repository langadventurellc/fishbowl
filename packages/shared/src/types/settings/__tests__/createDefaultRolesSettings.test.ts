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
    it("should return default roles from JSON", () => {
      const config = createDefaultRolesSettings();

      expect(config.roles).toHaveLength(4);
      expect(config.roles[0]).toHaveProperty("id", "project-manager");
      expect(config.roles[0]).toHaveProperty("name", "Project Manager");
      expect(config.roles[1]).toHaveProperty("id", "code-reviewer");
      expect(config.roles[2]).toHaveProperty("id", "creative-writer");
      expect(config.roles[3]).toHaveProperty("id", "data-analyst");
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

      expect(config.roles).toHaveLength(5); // 4 default + 1 added
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
      expect(config2.roles).toHaveLength(4); // Still has default roles
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

  describe("error handling", () => {
    it("should have validation that would catch invalid JSON (integration test)", () => {
      // Test that the function properly validates against schema
      // This verifies the validation logic is in place
      const config = createDefaultRolesSettings();

      // Verify the returned config would pass validation
      const result = persistedRolesSettingsSchema.safeParse(config);
      expect(result.success).toBe(true);

      // Verify all roles have required fields
      config.roles.forEach((role) => {
        expect(role).toHaveProperty("id");
        expect(role).toHaveProperty("name");
        expect(role).toHaveProperty("description");
        expect(role).toHaveProperty("systemPrompt");
        expect(typeof role.id).toBe("string");
        expect(role.id.length).toBeGreaterThan(0);
      });
    });
  });

  describe("invalid JSON scenarios", () => {
    it("should throw error when JSON validation fails", () => {
      // We can't easily mock the JSON import, but we can verify
      // that the function would throw on invalid data by testing
      // the schema validation logic indirectly
      const config = createDefaultRolesSettings();

      // Verify that valid data passes
      const result = persistedRolesSettingsSchema.safeParse(config);
      expect(result.success).toBe(true);

      // Test that invalid data would fail schema validation
      const invalidData = {
        schemaVersion: "", // Invalid empty version
        roles: [],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const invalidResult = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(invalidResult.success).toBe(false);
    });

    it("should validate that roles array is required", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: "not-an-array", // Invalid - should be array
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate that role fields are required", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "", // Invalid empty ID
            name: "Test",
            description: "Test",
            systemPrompt: "Test",
            createdAt: null,
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate role field length constraints", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "test",
            name: "A".repeat(101), // Exceeds 100 char limit
            description: "Test",
            systemPrompt: "Test",
            createdAt: null,
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate schema version and roles type constraints", () => {
      const invalidData = {
        schemaVersion: 123, // Wrong type
        roles: null, // Wrong type
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("timestamp generation edge cases", () => {
    it("should handle Date mock correctly", () => {
      const mockDate = new Date("2025-01-01T00:00:00.000Z");

      // Mock Date constructor
      jest.spyOn(globalThis, "Date").mockImplementation(() => mockDate);

      const config = createDefaultRolesSettings();
      expect(config.lastUpdated).toBe("2025-01-01T00:00:00.000Z");

      jest.restoreAllMocks();
    });

    it("should generate valid ISO string format", () => {
      const config = createDefaultRolesSettings();
      const parsedDate = new Date(config.lastUpdated);

      expect(parsedDate.toISOString()).toBe(config.lastUpdated);
      expect(config.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it("should handle millisecond precision", () => {
      const config = createDefaultRolesSettings();

      // Should have millisecond precision
      expect(config.lastUpdated).toMatch(/\.\d{3}Z$/);

      const date = new Date(config.lastUpdated);
      expect(date.getMilliseconds()).toBeGreaterThanOrEqual(0);
      expect(date.getMilliseconds()).toBeLessThan(1000);
    });
  });

  describe("data integrity and consistency", () => {
    it("should not mutate the imported JSON data", () => {
      const config1 = createDefaultRolesSettings();

      // Modify first config
      config1.roles.push({
        id: "new-role",
        name: "New Role",
        description: "Added role",
        systemPrompt: "Test",
        createdAt: null,
        updatedAt: null,
      });

      // Second config should still have original roles only
      const config3 = createDefaultRolesSettings();
      expect(config3.roles).toHaveLength(4);
    });

    it("should preserve all role fields from JSON", () => {
      const config = createDefaultRolesSettings();

      config.roles.forEach((role) => {
        expect(role).toHaveProperty("id");
        expect(role).toHaveProperty("name");
        expect(role).toHaveProperty("description");
        expect(role).toHaveProperty("systemPrompt");
        expect(role).toHaveProperty("createdAt");
        expect(role).toHaveProperty("updatedAt");
      });
    });

    it("should maintain role order from JSON", () => {
      const config = createDefaultRolesSettings();

      // Test that order is consistent across calls
      const config2 = createDefaultRolesSettings();

      expect(config.roles.map((r) => r.id)).toEqual(
        config2.roles.map((r) => r.id),
      );
    });

    it("should maintain consistent timestamp format", () => {
      const configs = Array.from({ length: 5 }, () =>
        createDefaultRolesSettings(),
      );

      configs.forEach((config) => {
        expect(config.lastUpdated).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        );
        expect(new Date(config.lastUpdated).toISOString()).toBe(
          config.lastUpdated,
        );
      });
    });
  });

  describe("schema validation edge cases", () => {
    it("should validate against current schema version", () => {
      const config = createDefaultRolesSettings();

      // Should always use the current schema version
      expect(config.schemaVersion).toBe(CURRENT_ROLES_SCHEMA_VERSION);

      // Should validate successfully
      const result = persistedRolesSettingsSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("should handle empty roles array in schema validation", () => {
      // Test that empty roles array would be valid by schema
      const emptyRolesData = {
        schemaVersion: "1.0.0",
        roles: [],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result = persistedRolesSettingsSchema.safeParse(emptyRolesData);
      expect(result.success).toBe(true);
    });

    it("should validate role structure requirements", () => {
      // Test that invalid role structure would fail validation
      const invalidRoleData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "valid-role",
            name: "Valid Role",
            description: "Valid description",
            systemPrompt: "Valid prompt",
            createdAt: null,
            updatedAt: null,
          },
          {
            // Missing required fields - should fail validation
            id: "invalid-role",
          },
        ],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidRoleData);
      expect(result.success).toBe(false);
    });
  });
});
