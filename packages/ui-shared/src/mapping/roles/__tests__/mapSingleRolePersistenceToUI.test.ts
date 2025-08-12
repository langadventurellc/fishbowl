/**
 * Unit tests for mapSingleRolePersistenceToUI mapping function
 */

import { mapSingleRolePersistenceToUI } from "../mapSingleRolePersistenceToUI";
import type { PersistedRole } from "@fishbowl-ai/shared";

describe("mapSingleRolePersistenceToUI", () => {
  const mockDate = "2025-01-15T10:00:00.000Z";

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("complete role transformation", () => {
    it("should transform complete persisted role to UI format", () => {
      const persistedRole: PersistedRole = {
        id: "role-123",
        name: "Project Manager",
        description: "Manages project timelines and coordination",
        systemPrompt:
          "You are a project manager focused on timelines and team coordination",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result).toEqual({
        id: "role-123",
        name: "Project Manager",
        description: "Manages project timelines and coordination",
        systemPrompt:
          "You are a project manager focused on timelines and team coordination",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      });
    });

    it("should transform role with whitespace in fields", () => {
      const persistedRole: PersistedRole = {
        id: "  role-456  ",
        name: "  Business Analyst  ",
        description: "  Analyzes business requirements  ",
        systemPrompt: "  You are a business analyst  ",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.id).toBe("role-456");
      expect(result.name).toBe("Business Analyst");
      expect(result.description).toBe("Analyzes business requirements");
      expect(result.systemPrompt).toBe("You are a business analyst");
    });
  });

  describe("timestamp handling", () => {
    it("should generate timestamps for null values", () => {
      const persistedRole: PersistedRole = {
        id: "role-123",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test prompt",
        createdAt: null,
        updatedAt: null,
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe(mockDate);
    });

    it("should generate timestamps for undefined values", () => {
      const persistedRole: PersistedRole = {
        id: "role-123",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test prompt",
        createdAt: undefined,
        updatedAt: undefined,
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe(mockDate);
    });

    it("should preserve existing valid timestamps", () => {
      const persistedRole: PersistedRole = {
        id: "role-123",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test prompt",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.createdAt).toBe("2025-01-10T09:00:00.000Z");
      expect(result.updatedAt).toBe("2025-01-14T15:30:00.000Z");
    });

    it("should handle mixed null and valid timestamps", () => {
      const persistedRole: PersistedRole = {
        id: "role-123",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test prompt",
        createdAt: null,
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe("2025-01-14T15:30:00.000Z");
    });

    it("should handle empty string timestamps", () => {
      const persistedRole: PersistedRole = {
        id: "role-123",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test prompt",
        createdAt: "",
        updatedAt: "   ",
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe(mockDate);
    });
  });

  describe("field normalization", () => {
    it("should apply name length constraints", () => {
      const persistedRole: PersistedRole = {
        id: "role-123",
        name: "A", // Valid single char (min 1 char)
        description: "Test description",
        systemPrompt: "Test prompt",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.name).toBe("A");
      expect(result.name.length).toBe(1);
    });

    it("should truncate long fields to maximum length", () => {
      const persistedRole: PersistedRole = {
        id: "role-123",
        name: "A".repeat(150), // Exceeds max 100 chars
        description: "B".repeat(600), // Exceeds max 500 chars
        systemPrompt: "C".repeat(6000), // Exceeds max 5000 chars
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.name).toBe("A".repeat(100));
      expect(result.name.length).toBe(100);
      expect(result.description).toBe("B".repeat(500));
      expect(result.description.length).toBe(500);
      expect(result.systemPrompt).toBe("C".repeat(5000));
      expect(result.systemPrompt?.length).toBe(5000);
    });

    it("should handle empty string fields", () => {
      const persistedRole: PersistedRole = {
        id: "",
        name: "",
        description: "",
        systemPrompt: "",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.id).toBe("");
      expect(result.name).toBe(" "); // Padded to min 1 char
      expect(result.description).toBe(""); // Min 0 chars allowed
      expect(result.systemPrompt).toBe("You are a helpful assistant."); // Empty string gets default value
    });
  });

  describe("systemPrompt handling", () => {
    it("should convert empty systemPrompt to default value", () => {
      const persistedRole: PersistedRole = {
        id: "role-123",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.systemPrompt).toBe("You are a helpful assistant."); // Empty string gets default value
    });

    it("should preserve valid systemPrompt", () => {
      const persistedRole: PersistedRole = {
        id: "role-123",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "You are a helpful assistant",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.systemPrompt).toBe("You are a helpful assistant");
    });
  });

  describe("edge cases", () => {
    it("should handle role with minimal valid data", () => {
      const persistedRole: PersistedRole = {
        id: "r",
        name: "AB", // Exactly min length
        description: "D", // Exactly min length
        systemPrompt: "S", // Exactly min length
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.id).toBe("r");
      expect(result.name).toBe("AB");
      expect(result.description).toBe("D");
      expect(result.systemPrompt).toBe("S");
      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe(mockDate);
    });

    it("should handle unicode characters correctly", () => {
      const persistedRole: PersistedRole = {
        id: "rôle-unicode",
        name: "Gestionnaire de Prôjet 🚀",
        description: "Gérer les projets avec efficacité 📊",
        systemPrompt: "Tu es un assistant français très compétent 🇫🇷",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.id).toBe("rôle-unicode");
      expect(result.name).toBe("Gestionnaire de Prôjet 🚀");
      expect(result.description).toBe("Gérer les projets avec efficacité 📊");
      expect(result.systemPrompt).toBe(
        "Tu es un assistant français très compétent 🇫🇷",
      );
    });

    it("should handle null/undefined description and systemPrompt", () => {
      const persistedRole: PersistedRole = {
        id: "role-123",
        name: "Test Role",
        description: null as unknown as string,
        systemPrompt: undefined as unknown as string,
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.description).toBe(""); // null normalized to "" (min 0 chars)
      expect(result.systemPrompt).toBe("You are a helpful assistant."); // undefined gets default value
    });
  });

  describe("return type validation", () => {
    it("should return object conforming to RoleViewModel interface", () => {
      const persistedRole: PersistedRole = {
        id: "role-123",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test prompt",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      // Verify all required properties exist
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("systemPrompt");
      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("updatedAt");

      // Verify types
      expect(typeof result.id).toBe("string");
      expect(typeof result.name).toBe("string");
      expect(typeof result.description).toBe("string");
      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");

      // systemPrompt can be string or undefined
      expect(
        typeof result.systemPrompt === "string" ||
          result.systemPrompt === undefined,
      ).toBe(true);
    });

    it("should ensure timestamps are valid ISO strings", () => {
      const persistedRole: PersistedRole = {
        id: "role-123",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test prompt",
        createdAt: null,
        updatedAt: null,
      };

      const result = mapSingleRolePersistenceToUI(persistedRole);

      expect(result.createdAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(result.updatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(new Date(result.createdAt!).getTime()).not.toBeNaN();
      expect(new Date(result.updatedAt!).getTime()).not.toBeNaN();
    });
  });
});
