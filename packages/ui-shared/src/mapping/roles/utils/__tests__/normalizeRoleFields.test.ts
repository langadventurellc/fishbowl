/**
 * Unit tests for normalizeRoleFields utility function
 */

import { normalizeRoleFields } from "../normalizeRoleFields";

describe("normalizeRoleFields", () => {
  describe("id field", () => {
    it("should trim id field", () => {
      const role = {
        id: "  role-123  ",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.id).toBe("role-123");
    });

    it("should handle empty id by returning empty string", () => {
      const role = {
        id: "",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.id).toBe("");
    });

    it("should handle null/undefined id", () => {
      const role = {
        id: null as unknown as string,
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.id).toBe("");
    });
  });

  describe("name field", () => {
    it("should trim and enforce name constraints (1-100 chars)", () => {
      const role = {
        id: "role-1",
        name: "  Valid Role Name  ",
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.name).toBe("Valid Role Name");
    });

    it("should preserve single character names (minimum 1 char)", () => {
      const role = {
        id: "role-1",
        name: "A", // 1 char, min is 1
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.name).toBe("A");
      expect(result.name.length).toBe(1);
    });

    it("should truncate long names to maximum length", () => {
      const role = {
        id: "role-1",
        name: "A".repeat(150), // 150 chars, max is 100
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.name).toBe("A".repeat(100));
      expect(result.name.length).toBe(100);
    });

    it("should handle empty name by padding to minimum", () => {
      const role = {
        id: "role-1",
        name: "",
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.name).toBe(" ");
      expect(result.name.length).toBe(1);
    });

    it("should handle null/undefined name", () => {
      const role = {
        id: "role-1",
        name: null as unknown as string,
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.name).toBe(" ");
      expect(result.name.length).toBe(1);
    });
  });

  describe("description field", () => {
    it("should trim and enforce description constraints (0-500 chars)", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "  This is a valid description  ",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.description).toBe("This is a valid description");
    });

    it("should allow empty description (minimum 0 chars)", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.description).toBe("");
      expect(result.description.length).toBe(0);
    });

    it("should truncate long descriptions to maximum length", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "A".repeat(600), // 600 chars, max is 500
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.description).toBe("A".repeat(500));
      expect(result.description.length).toBe(500);
    });

    it("should handle null/undefined description", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: null,
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.description).toBe("");
      expect(result.description.length).toBe(0);
    });
  });

  describe("systemPrompt field", () => {
    it("should trim and enforce systemPrompt constraints (0-5000 chars)", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "  You are a helpful assistant  ",
      };

      const result = normalizeRoleFields(role);

      expect(result.systemPrompt).toBe("You are a helpful assistant");
    });

    it("should provide default for empty systemPrompt (minimum 1 char)", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "",
      };

      const result = normalizeRoleFields(role);

      expect(result.systemPrompt).toBe(
        "You are a helpful assistant focused on your assigned role.",
      );
      expect(result.systemPrompt.length).toBeGreaterThan(0);
    });

    it("should truncate long systemPrompts to maximum length", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "A".repeat(6000), // 6000 chars, max is 5000
      };

      const result = normalizeRoleFields(role);

      expect(result.systemPrompt).toBe("A".repeat(5000));
      expect(result.systemPrompt.length).toBe(5000);
    });

    it("should handle null/undefined systemPrompt", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "Test description",
        systemPrompt: null,
      };

      const result = normalizeRoleFields(role);

      expect(result.systemPrompt).toBe(
        "You are a helpful assistant focused on your assigned role.",
      );
      expect(result.systemPrompt.length).toBeGreaterThan(0);
    });
  });

  describe("complete role normalization", () => {
    it("should normalize all fields together", () => {
      const role = {
        id: "  role-123  ",
        name: "  My Test Role  ",
        description: "  This is a test role description  ",
        systemPrompt: "  You are a project manager assistant  ",
      };

      const result = normalizeRoleFields(role);

      expect(result).toEqual({
        id: "role-123",
        name: "My Test Role",
        description: "This is a test role description",
        systemPrompt: "You are a project manager assistant",
      });
    });

    it("should handle role with mixed valid and invalid fields", () => {
      const role = {
        id: "  role-456  ",
        name: "A", // valid single char name (min is 1)
        description: "B".repeat(600), // too long, will be truncated
        systemPrompt: "  Valid prompt  ",
      };

      const result = normalizeRoleFields(role);

      expect(result.id).toBe("role-456");
      expect(result.name).toBe("A");
      expect(result.name.length).toBe(1);
      expect(result.description).toBe("B".repeat(500));
      expect(result.description.length).toBe(500);
      expect(result.systemPrompt).toBe("Valid prompt");
    });

    it("should handle role with all null/undefined fields", () => {
      const role = {
        id: null as unknown as string,
        name: null as unknown as string,
        description: undefined,
        systemPrompt: undefined,
      };

      const result = normalizeRoleFields(role);

      expect(result.id).toBe("");
      expect(result.name).toBe(" ");
      expect(result.name.length).toBe(1);
      expect(result.description).toBe("");
      expect(result.description.length).toBe(0);
      expect(result.systemPrompt).toBe(
        "You are a helpful assistant focused on your assigned role.",
      );
      expect(result.systemPrompt.length).toBeGreaterThan(0);
    });
  });

  describe("unicode handling", () => {
    it("should handle unicode characters correctly", () => {
      const role = {
        id: "role-unicode",
        name: "  Rôle avec accénts  ",
        description: "  Déscription with émojis 🚀  ",
        systemPrompt: "  Tu es un assistant français 🇫🇷  ",
      };

      const result = normalizeRoleFields(role);

      expect(result.name).toBe("Rôle avec accénts");
      expect(result.description).toBe("Déscription with émojis 🚀");
      expect(result.systemPrompt).toBe("Tu es un assistant français 🇫🇷");
    });

    it("should count unicode characters correctly for length constraints", () => {
      const role = {
        id: "role-emoji",
        name: "🚀".repeat(25), // 25 emoji chars, within 50 limit (emojis might take 2 chars each)
        description: "👋".repeat(100), // 100 emoji chars, within 200 limit
        systemPrompt: "🤖".repeat(1000), // 1000 emoji chars, within 2000 limit
      };

      const result = normalizeRoleFields(role);

      expect(result.name).toBe("🚀".repeat(25));
      expect(result.description).toBe("👋".repeat(100));
      expect(result.systemPrompt).toBe("🤖".repeat(1000));
    });
  });
});
