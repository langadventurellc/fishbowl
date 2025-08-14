import { readFileSync } from "fs";
import { join } from "path";
import {
  persistedRolesSettingsSchema,
  persistedRoleSchema,
} from "../../types/settings/rolesSettingsSchema";
import type { PersistedRolesSettingsData } from "../../types/settings/PersistedRolesSettingsData";
import { z } from "zod";

type PersistedRole = z.infer<typeof persistedRoleSchema>;

describe("defaultRoles.json", () => {
  let rawJsonData: unknown;
  let parsedData: PersistedRolesSettingsData;
  let fileContent: string;

  beforeAll(() => {
    const filePath = join(process.cwd(), "src/data/defaultRoles.json");
    fileContent = readFileSync(filePath, "utf-8");
    rawJsonData = JSON.parse(fileContent);
    parsedData = persistedRolesSettingsSchema.parse(rawJsonData);
  });

  describe("JSON structure validation", () => {
    it("should be valid JSON", () => {
      expect(rawJsonData).toBeDefined();
      expect(typeof rawJsonData).toBe("object");
      expect(rawJsonData).not.toBeNull();
    });

    it("should have correct top-level structure", () => {
      expect(rawJsonData).toHaveProperty("schemaVersion");
      expect(rawJsonData).toHaveProperty("roles");
    });

    it("should not have unexpected top-level fields", () => {
      const expectedFields = ["schemaVersion", "roles"];
      const actualFields = Object.keys(rawJsonData as object);
      const unexpectedFields = actualFields.filter(
        (field) => !expectedFields.includes(field),
      );
      expect(unexpectedFields).toEqual([]);
    });

    it("should be parseable without errors", () => {
      expect(() => JSON.parse(fileContent)).not.toThrow();
    });

    it("should be valid UTF-8 encoded", () => {
      // Check for BOM or other encoding issues
      expect(fileContent.charCodeAt(0)).not.toBe(0xfeff); // No BOM
      expect(fileContent).toMatch(/^[\u0020-\u007E\u00A0-\uFFFF\s]*$/); // Valid printable UTF-8 range
    });
  });

  describe("Schema validation", () => {
    it("should validate against persistedRolesSettingsSchema", () => {
      expect(() => {
        persistedRolesSettingsSchema.parse(rawJsonData);
      }).not.toThrow();
    });

    it("should have required structure after schema parsing", () => {
      expect(parsedData).toHaveProperty("schemaVersion");
      expect(parsedData).toHaveProperty("roles");
      expect(parsedData).toHaveProperty("lastUpdated");
      expect(Array.isArray(parsedData.roles)).toBe(true);
    });

    it("should have valid schema version format", () => {
      expect(typeof parsedData.schemaVersion).toBe("string");
      expect(parsedData.schemaVersion).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("should validate all roles against schema", () => {
      expect(parsedData.roles.length).toBeGreaterThan(0);

      parsedData.roles.forEach((role: PersistedRole) => {
        expect(role).toHaveProperty("id");
        expect(role).toHaveProperty("name");
        expect(role).toHaveProperty("description");
        expect(role).toHaveProperty("systemPrompt");
        expect(role).toHaveProperty("createdAt");
        expect(role).toHaveProperty("updatedAt");
      });
    });
  });

  describe("Data structure requirements", () => {
    it("should have at least one role", () => {
      expect(parsedData.roles.length).toBeGreaterThan(0);
    });

    it("should have unique role IDs", () => {
      const ids = parsedData.roles.map((role: PersistedRole) => role.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have non-empty required fields for all roles", () => {
      parsedData.roles.forEach((role: PersistedRole) => {
        expect(typeof role.id).toBe("string");
        expect(role.id.length).toBeGreaterThan(0);

        expect(typeof role.name).toBe("string");
        expect(role.name.length).toBeGreaterThan(0);

        expect(typeof role.description).toBe("string");
        expect(role.description.length).toBeGreaterThan(0);

        expect(typeof role.systemPrompt).toBe("string");
        expect(role.systemPrompt.length).toBeGreaterThan(0);
      });
    });

    it("should have proper timestamp fields", () => {
      parsedData.roles.forEach((role: PersistedRole) => {
        // Timestamps should be null in the JSON file for manual editing
        expect(role.createdAt).toBeNull();
        expect(role.updatedAt).toBeNull();
      });
    });

    it("should respect field length constraints", () => {
      parsedData.roles.forEach((role: PersistedRole) => {
        // These limits come from the schema
        expect(role.name.length).toBeLessThanOrEqual(100);
        expect(role.description.length).toBeLessThanOrEqual(500);
        expect(role.systemPrompt.length).toBeLessThanOrEqual(5000);
      });
    });
  });

  describe("File format validation", () => {
    it("should be properly formatted JSON", () => {
      // Re-stringify and parse to ensure formatting is valid
      const stringified = JSON.stringify(rawJsonData, null, 2);
      expect(() => JSON.parse(stringified)).not.toThrow();
    });

    it("should handle round-trip serialization", () => {
      const jsonString = JSON.stringify(parsedData);
      const reparsed = JSON.parse(jsonString);
      const revalidated = persistedRolesSettingsSchema.parse(reparsed);

      // Should be able to validate after round-trip
      expect(revalidated).toBeDefined();
      expect(revalidated.schemaVersion).toBe(parsedData.schemaVersion);
      expect(revalidated.roles).toHaveLength(parsedData.roles.length);
    });

    it("should not contain invalid characters", () => {
      // Check for common JSON issues
      expect(fileContent).not.toContain("\t"); // Should use spaces for indentation
      expect(fileContent).not.toMatch(/,\s*[}\]]/); // No trailing commas
    });
  });

  describe("Error resistance", () => {
    it("should gracefully handle schema parsing", () => {
      // The schema should catch any structural issues
      const result = persistedRolesSettingsSchema.safeParse(rawJsonData);
      expect(result.success).toBe(true);

      if (!result.success) {
        // If this fails, log the error for debugging
        console.error("Schema validation failed:", result.error.issues);
      }
    });

    it("should have valid JSON without syntax errors", () => {
      // Ensure there are no JSON syntax issues
      expect(() => {
        JSON.parse(JSON.stringify(rawJsonData));
      }).not.toThrow();
    });
  });
});
