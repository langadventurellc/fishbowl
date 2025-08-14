/**
 * Unit tests for roleSchema validation.
 *
 * Tests schema validation for role creation and editing,
 * including the new systemPrompt field and backward compatibility.
 *
 * @module schemas/__tests__/roleSchema.test
 */

import { roleSchema } from "../roleSchema";
import type { RoleFormData } from "../../types/settings/RoleFormData";

describe("roleSchema", () => {
  describe("valid data", () => {
    it("should validate complete role data with all fields", () => {
      const validData = {
        name: "AI Assistant",
        description: "A helpful AI assistant role",
        systemPrompt: "You are a helpful AI assistant.",
      };

      const result = roleSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should require systemPrompt field", () => {
      const validData = {
        name: "Simple Role",
        description: "A role with system prompt",
        systemPrompt: "You are a helpful assistant.",
      };

      const result = roleSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(validData.name);
        expect(result.data.description).toBe(validData.description);
        expect(result.data.systemPrompt).toBe(validData.systemPrompt);
      }
    });

    it("should accept name with valid characters", () => {
      const validData = {
        name: "AI-Assistant_v2 Role",
        description: "Valid description",
        systemPrompt: "Test system prompt",
      };

      const result = roleSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should accept description with 500 characters", () => {
      const validData = {
        name: "Valid Name",
        description: "A".repeat(500),
        systemPrompt: "Test system prompt",
      };

      const result = roleSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should accept systemPrompt with 5000 characters", () => {
      const validData = {
        name: "Valid Name",
        description: "Valid description",
        systemPrompt: "A".repeat(5000),
      };

      const result = roleSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should accept valid systemPrompt", () => {
      const validData = {
        name: "AI Assistant",
        description: "Helpful AI assistant",
        systemPrompt:
          "You are a helpful AI assistant that provides clear and concise responses.",
      };

      const result = roleSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.systemPrompt).toBe(validData.systemPrompt);
      }
    });
  });

  describe("invalid data", () => {
    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        description: "Valid description",
        systemPrompt: "Test system prompt",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject name with only whitespace", () => {
      const invalidData = {
        name: "   ",
        description: "Valid description",
        systemPrompt: "Test system prompt",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject name longer than 100 characters", () => {
      const invalidData = {
        name: "A".repeat(101),
        description: "Valid description",
        systemPrompt: "Test system prompt",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject name shorter than 2 characters", () => {
      const invalidData = {
        name: "A",
        description: "Valid description",
        systemPrompt: "Test system prompt",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject name with invalid characters", () => {
      const invalidData = {
        name: "Role@Name!",
        description: "Valid description",
        systemPrompt: "Test system prompt",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty description", () => {
      const invalidData = {
        name: "Valid Name",
        description: "",
        systemPrompt: "Test system prompt",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject description with only whitespace", () => {
      const invalidData = {
        name: "Valid Name",
        description: "   ",
        systemPrompt: "Test system prompt",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject description longer than 500 characters", () => {
      const invalidData = {
        name: "Valid Name",
        description: "A".repeat(501),
        systemPrompt: "Test system prompt",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty systemPrompt when provided", () => {
      const invalidData = {
        name: "Valid Name",
        description: "Valid description",
        systemPrompt: "",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject systemPrompt with only whitespace", () => {
      const invalidData = {
        name: "Valid Name",
        description: "Valid description",
        systemPrompt: "   ",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject systemPrompt longer than 5000 characters", () => {
      const invalidData = {
        name: "Valid Name",
        description: "Valid description",
        systemPrompt: "A".repeat(5001),
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing systemPrompt", () => {
      const invalidData = {
        name: "Valid Name",
        description: "Valid description",
        // Missing systemPrompt
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("type inference", () => {
    it("should infer correct TypeScript types", () => {
      const validData = {
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = roleSchema.safeParse(validData);

      if (result.success) {
        // These should compile without TypeScript errors
        const name: string = result.data.name;
        const description: string = result.data.description;
        const systemPrompt: string = result.data.systemPrompt;

        expect(name).toBe(validData.name);
        expect(description).toBe(validData.description);
        expect(systemPrompt).toBe(validData.systemPrompt);
      }
    });

    it("should work with RoleFormData type", () => {
      const roleFormData: RoleFormData = {
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test prompt",
      };

      const result = roleSchema.safeParse(roleFormData);
      expect(result.success).toBe(true);

      // Test without systemPrompt
      const roleFormDataWithoutPrompt: RoleFormData = {
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test system prompt",
      };

      const result2 = roleSchema.safeParse(roleFormDataWithoutPrompt);
      expect(result2.success).toBe(true);
    });
  });
});
