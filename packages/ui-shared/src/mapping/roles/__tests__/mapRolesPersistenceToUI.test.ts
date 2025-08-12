/**
 * Unit tests for mapRolesPersistenceToUI mapping function
 */

import { mapRolesPersistenceToUI } from "../mapRolesPersistenceToUI";
import type {
  PersistedRolesSettingsData,
  PersistedRole,
} from "@fishbowl-ai/shared";

describe("mapRolesPersistenceToUI", () => {
  const mockDate = "2025-01-15T10:00:00.000Z";

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("successful transformations", () => {
    it("should transform complete persistence data to UI format", () => {
      const persistedData: PersistedRolesSettingsData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-1",
            name: "Project Manager",
            description: "Manages project timelines",
            systemPrompt: "You are a project manager",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
          {
            id: "role-2",
            name: "Business Analyst",
            description: "Analyzes business requirements",
            systemPrompt: "You are a business analyst",
            createdAt: "2025-01-11T10:00:00.000Z",
            updatedAt: "2025-01-15T16:00:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapRolesPersistenceToUI(persistedData);

      expect(result).toHaveLength(2);
      expect(result[0]!).toEqual({
        id: "role-1",
        name: "Project Manager",
        description: "Manages project timelines",
        systemPrompt: "You are a project manager",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      });
      expect(result[1]!).toEqual({
        id: "role-2",
        name: "Business Analyst",
        description: "Analyzes business requirements",
        systemPrompt: "You are a business analyst",
        createdAt: "2025-01-11T10:00:00.000Z",
        updatedAt: "2025-01-15T16:00:00.000Z",
      });
    });

    it("should transform single role correctly", () => {
      const persistedData: PersistedRolesSettingsData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-single",
            name: "Solo Role",
            description: "The only role",
            systemPrompt: "You are unique",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapRolesPersistenceToUI(persistedData);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("role-single");
      expect(result[0]!.name).toBe("Solo Role");
    });

    it("should handle roles with null timestamps", () => {
      const persistedData: PersistedRolesSettingsData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-1",
            name: "Test Role",
            description: "Test description",
            systemPrompt: "Test prompt",
            createdAt: null,
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapRolesPersistenceToUI(persistedData);

      expect(result).toHaveLength(1);
      expect(result[0]!.createdAt).toBe(mockDate);
      expect(result[0]!.updatedAt).toBe(mockDate);
    });

    it("should handle roles with field normalization needs", () => {
      const persistedData: PersistedRolesSettingsData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "  role-trim  ",
            name: "  Needs Trimming  ",
            description: "  Extra spaces everywhere  ",
            systemPrompt: "  System prompt with spaces  ",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapRolesPersistenceToUI(persistedData);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("role-trim");
      expect(result[0]!.name).toBe("Needs Trimming");
      expect(result[0]!.description).toBe("Extra spaces everywhere");
      expect(result[0]!.systemPrompt).toBe("System prompt with spaces");
    });
  });

  describe("null and undefined input handling", () => {
    it("should return empty array for null input", () => {
      const result = mapRolesPersistenceToUI(null);
      expect(result).toEqual([]);
    });

    it("should return empty array for undefined input", () => {
      const result = mapRolesPersistenceToUI(undefined);
      expect(result).toEqual([]);
    });

    it("should return empty array for data with null roles", () => {
      const persistedData = {
        schemaVersion: "1.0.0",
        roles: null,
        lastUpdated: "2025-01-15T10:00:00.000Z",
      } as unknown as PersistedRolesSettingsData;

      const result = mapRolesPersistenceToUI(persistedData);
      expect(result).toEqual([]);
    });

    it("should return empty array for data with undefined roles", () => {
      const persistedData = {
        schemaVersion: "1.0.0",
        roles: undefined,
        lastUpdated: "2025-01-15T10:00:00.000Z",
      } as unknown as PersistedRolesSettingsData;

      const result = mapRolesPersistenceToUI(persistedData);
      expect(result).toEqual([]);
    });

    it("should handle empty roles array", () => {
      const persistedData: PersistedRolesSettingsData = {
        schemaVersion: "1.0.0",
        roles: [],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapRolesPersistenceToUI(persistedData);
      expect(result).toEqual([]);
    });
  });

  describe("large dataset handling", () => {
    it("should handle large role arrays efficiently", () => {
      const roles: PersistedRole[] = Array.from({ length: 100 }, (_, i) => ({
        id: `role-${i}`,
        name: `Role ${i}`,
        description: `Description for role ${i}`,
        systemPrompt: `System prompt for role ${i}`,
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      }));

      const persistedData = {
        schemaVersion: "1.0.0",
        roles,
        lastUpdated: "2025-01-15T10:00:00.000Z",
      } as PersistedRolesSettingsData;

      const startTime = performance.now();
      const result = mapRolesPersistenceToUI(persistedData);
      const endTime = performance.now();

      expect(result).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in less than 50ms

      // Verify first and last entries
      expect(result[0]!.id).toBe("role-0");
      expect(result[0]!.name).toBe("Role 0");
      expect(result[99]!.id).toBe("role-99");
      expect(result[99]!.name).toBe("Role 99");
    });

    it("should maintain order of roles in large datasets", () => {
      const roles: PersistedRole[] = Array.from({ length: 50 }, (_, i) => ({
        id: `role-${String(i).padStart(3, "0")}`,
        name: `Role ${i}`,
        description: `Description ${i}`,
        systemPrompt: `Prompt ${i}`,
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      }));

      const persistedData = {
        schemaVersion: "1.0.0",
        roles,
        lastUpdated: "2025-01-15T10:00:00.000Z",
      } as PersistedRolesSettingsData;

      const result = mapRolesPersistenceToUI(persistedData);

      for (let i = 0; i < result.length; i++) {
        expect(result[i]!.id).toBe(`role-${String(i).padStart(3, "0")}`);
        expect(result[i]!.name).toBe(`Role ${i}`);
      }
    });
  });

  describe("mixed validity scenarios", () => {
    it("should handle roles with varying field lengths", () => {
      const persistedData: PersistedRolesSettingsData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "short",
            name: "A", // Valid single char (min 1)
            description: "B", // Valid single char
            systemPrompt: "C", // Valid single char
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
          {
            id: "long",
            name: "X".repeat(150), // Will be truncated to 100
            description: "Y".repeat(600), // Will be truncated to 500
            systemPrompt: "Z".repeat(3000), // Will be truncated to 2000
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapRolesPersistenceToUI(persistedData);

      expect(result).toHaveLength(2);

      // Short role (valid single chars)
      expect(result[0]!.name).toBe("A");
      expect(result[0]!.name.length).toBe(1);
      expect(result[0]!.description).toBe("B");
      expect(result[0]!.systemPrompt).toBe("C");

      // Long role (truncated)
      expect(result[1]!.name).toBe("X".repeat(100));
      expect(result[1]!.name.length).toBe(100);
      expect(result[1]!.description).toBe("Y".repeat(500));
      expect(result[1]!.description.length).toBe(500);
      expect(result[1]!.systemPrompt).toBe("Z".repeat(2000));
      expect(result[1]!.systemPrompt?.length).toBe(2000);
    });

    it("should handle roles with mixed timestamp states", () => {
      const persistedData: PersistedRolesSettingsData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "valid-timestamps",
            name: "Valid Role",
            description: "Has valid timestamps",
            systemPrompt: "Valid system prompt",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
          {
            id: "null-timestamps",
            name: "Null Role",
            description: "Has null timestamps",
            systemPrompt: "Null timestamp prompt",
            createdAt: null,
            updatedAt: null,
          },
          {
            id: "mixed-timestamps",
            name: "Mixed Role",
            description: "Has mixed timestamps",
            systemPrompt: "Mixed timestamp prompt",
            createdAt: "2025-01-12T12:00:00.000Z",
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapRolesPersistenceToUI(persistedData);

      expect(result).toHaveLength(3);

      // Valid timestamps preserved
      expect(result[0]!.createdAt).toBe("2025-01-10T09:00:00.000Z");
      expect(result[0]!.updatedAt).toBe("2025-01-14T15:30:00.000Z");

      // Null timestamps replaced
      expect(result[1]!.createdAt).toBe(mockDate);
      expect(result[1]!.updatedAt).toBe(mockDate);

      // Mixed timestamps handled correctly
      expect(result[2]!.createdAt).toBe("2025-01-12T12:00:00.000Z");
      expect(result[2]!.updatedAt).toBe(mockDate);
    });
  });

  describe("unicode and special character handling", () => {
    it("should handle unicode characters correctly", () => {
      const persistedData: PersistedRolesSettingsData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "unicode-role",
            name: "Rôle Français 🇫🇷",
            description: "Description avec accents éàï and emojis 🚀📊",
            systemPrompt: "Tu es un assistant très compétent! 🤖✨",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapRolesPersistenceToUI(persistedData);

      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe("Rôle Français 🇫🇷");
      expect(result[0]!.description).toBe(
        "Description avec accents éàï and emojis 🚀📊",
      );
      expect(result[0]!.systemPrompt).toBe(
        "Tu es un assistant très compétent! 🤖✨",
      );
    });

    it("should count unicode characters correctly for length limits", () => {
      const persistedData: PersistedRolesSettingsData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "emoji-test",
            name: "🚀".repeat(25), // 25 emojis, under 50 char limit (emojis might take 2 chars each)
            description: "👋".repeat(100), // 100 emojis, under 200 char limit
            systemPrompt: "🤖".repeat(1000), // 1000 emojis, under 2000 char limit
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapRolesPersistenceToUI(persistedData);

      expect(result[0]!.name).toBe("🚀".repeat(25));
      expect(result[0]!.description).toBe("👋".repeat(100));
      expect(result[0]!.systemPrompt).toBe("🤖".repeat(1000));
    });
  });

  describe("return type and structure", () => {
    it("should always return an array", () => {
      const result1 = mapRolesPersistenceToUI(null);
      const result2 = mapRolesPersistenceToUI(undefined);
      const result3 = mapRolesPersistenceToUI({
        schemaVersion: "1.0.0",
        roles: [],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      });

      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
      expect(Array.isArray(result3)).toBe(true);
    });

    it("should return roles with proper structure", () => {
      const persistedData: PersistedRolesSettingsData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "structure-test",
            name: "Structure Role",
            description: "Test structure",
            systemPrompt: "Test prompt",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapRolesPersistenceToUI(persistedData);

      expect(result).toHaveLength(1);
      const role = result[0]!;

      // Check all required properties exist
      expect(role).toHaveProperty("id");
      expect(role).toHaveProperty("name");
      expect(role).toHaveProperty("description");
      expect(role).toHaveProperty("systemPrompt");
      expect(role).toHaveProperty("createdAt");
      expect(role).toHaveProperty("updatedAt");

      // Check types
      expect(typeof role.id).toBe("string");
      expect(typeof role.name).toBe("string");
      expect(typeof role.description).toBe("string");
      expect(typeof role.createdAt).toBe("string");
      expect(typeof role.updatedAt).toBe("string");
      expect(
        typeof role.systemPrompt === "string" ||
          role.systemPrompt === undefined,
      ).toBe(true);
    });
  });
});
