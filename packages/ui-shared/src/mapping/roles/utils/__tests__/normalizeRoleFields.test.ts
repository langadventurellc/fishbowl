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
    it("should trim and enforce name constraints (2-50 chars)", () => {
      const role = {
        id: "role-1",
        name: "  Valid Role Name  ",
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.name).toBe("Valid Role Name");
    });

    it("should pad short names to minimum length", () => {
      const role = {
        id: "role-1",
        name: "A", // 1 char, min is 2
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.name).toBe("A ");
      expect(result.name.length).toBe(2);
    });

    it("should truncate long names to maximum length", () => {
      const role = {
        id: "role-1",
        name: "A".repeat(100), // 100 chars, max is 50
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.name).toBe("A".repeat(50));
      expect(result.name.length).toBe(50);
    });

    it("should handle empty name by padding to minimum", () => {
      const role = {
        id: "role-1",
        name: "",
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.name).toBe("  ");
      expect(result.name.length).toBe(2);
    });

    it("should handle null/undefined name", () => {
      const role = {
        id: "role-1",
        name: null as unknown as string,
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.name).toBe("  ");
      expect(result.name.length).toBe(2);
    });
  });

  describe("description field", () => {
    it("should trim and enforce description constraints (1-200 chars)", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "  This is a valid description  ",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.description).toBe("This is a valid description");
    });

    it("should pad empty description to minimum length", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "",
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.description).toBe(" ");
      expect(result.description.length).toBe(1);
    });

    it("should truncate long descriptions to maximum length", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "A".repeat(300), // 300 chars, max is 200
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.description).toBe("A".repeat(200));
      expect(result.description.length).toBe(200);
    });

    it("should handle null/undefined description", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: null,
        systemPrompt: "Test prompt",
      };

      const result = normalizeRoleFields(role);

      expect(result.description).toBe(" ");
      expect(result.description.length).toBe(1);
    });
  });

  describe("systemPrompt field", () => {
    it("should trim and enforce systemPrompt constraints (1-2000 chars)", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "  You are a helpful assistant  ",
      };

      const result = normalizeRoleFields(role);

      expect(result.systemPrompt).toBe("You are a helpful assistant");
    });

    it("should pad empty systemPrompt to minimum length", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "",
      };

      const result = normalizeRoleFields(role);

      expect(result.systemPrompt).toBe(" ");
      expect(result.systemPrompt.length).toBe(1);
    });

    it("should truncate long systemPrompts to maximum length", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "A".repeat(3000), // 3000 chars, max is 2000
      };

      const result = normalizeRoleFields(role);

      expect(result.systemPrompt).toBe("A".repeat(2000));
      expect(result.systemPrompt.length).toBe(2000);
    });

    it("should handle null/undefined systemPrompt", () => {
      const role = {
        id: "role-1",
        name: "Test Role",
        description: "Test description",
        systemPrompt: null,
      };

      const result = normalizeRoleFields(role);

      expect(result.systemPrompt).toBe(" ");
      expect(result.systemPrompt.length).toBe(1);
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
        name: "A", // too short, will be padded
        description: "B".repeat(300), // too long, will be truncated
        systemPrompt: "  Valid prompt  ",
      };

      const result = normalizeRoleFields(role);

      expect(result.id).toBe("role-456");
      expect(result.name).toBe("A ");
      expect(result.name.length).toBe(2);
      expect(result.description).toBe("B".repeat(200));
      expect(result.description.length).toBe(200);
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
      expect(result.name).toBe("  ");
      expect(result.name.length).toBe(2);
      expect(result.description).toBe(" ");
      expect(result.description.length).toBe(1);
      expect(result.systemPrompt).toBe(" ");
      expect(result.systemPrompt.length).toBe(1);
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
