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

    it("should validate role data without systemPrompt (backward compatibility)", () => {
      const validData = {
        name: "Simple Role",
        description: "A role without system prompt",
      };

      const result = roleSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(validData.name);
        expect(result.data.description).toBe(validData.description);
        expect(result.data.systemPrompt).toBeUndefined();
      }
    });

    it("should accept name with valid characters", () => {
      const validData = {
        name: "AI-Assistant_v2 Role",
        description: "Valid description",
      };

      const result = roleSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should accept description with 200 characters", () => {
      const validData = {
        name: "Valid Name",
        description: "A".repeat(200),
      };

      const result = roleSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should accept systemPrompt with 2000 characters", () => {
      const validData = {
        name: "Valid Name",
        description: "Valid description",
        systemPrompt: "A".repeat(2000),
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
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject name with only whitespace", () => {
      const invalidData = {
        name: "   ",
        description: "Valid description",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject name longer than 50 characters", () => {
      const invalidData = {
        name: "A".repeat(51),
        description: "Valid description",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject name shorter than 2 characters", () => {
      const invalidData = {
        name: "A",
        description: "Valid description",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject name with invalid characters", () => {
      const invalidData = {
        name: "Role@Name!",
        description: "Valid description",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty description", () => {
      const invalidData = {
        name: "Valid Name",
        description: "",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject description with only whitespace", () => {
      const invalidData = {
        name: "Valid Name",
        description: "   ",
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject description longer than 200 characters", () => {
      const invalidData = {
        name: "Valid Name",
        description: "A".repeat(201),
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

    it("should reject systemPrompt longer than 2000 characters", () => {
      const invalidData = {
        name: "Valid Name",
        description: "Valid description",
        systemPrompt: "A".repeat(2001),
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
        const systemPrompt: string | undefined = result.data.systemPrompt;

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
      };

      const result2 = roleSchema.safeParse(roleFormDataWithoutPrompt);
      expect(result2.success).toBe(true);
    });
  });
});
