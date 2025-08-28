/**
 * Unit tests for agentSchema validation.
 *
 * Tests schema validation for agent creation and editing,
 * following the pattern from roleSchema tests.
 *
 * @module schemas/__tests__/agentSchema.test
 */

import type { AgentFormData } from "../../types/settings/AgentFormData";
import { agentSchema } from "../agentSchema";

describe("agentSchema", () => {
  describe("valid data", () => {
    it("should validate complete agent data with all fields", () => {
      const validData = {
        name: "AI Assistant",
        model: "Claude 3.5 Sonnet",
        llmConfigId: "test-config-id",
        role: "role-id",
        personality: "personality-id",
        systemPrompt: "You are a helpful assistant.",
      };

      const result = agentSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should validate agent data without optional systemPrompt", () => {
      const validData = {
        name: "Simple Agent",
        model: "GPT-4",
        llmConfigId: "test-config-id",
        role: "role-id",
        personality: "personality-id",
        temperature: 0.7,
        maxTokens: 1500,
        topP: 0.9,
      };

      const result = agentSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(validData.name);
        expect(result.data.model).toBe(validData.model);
        expect(result.data.role).toBe(validData.role);
        expect(result.data.personality).toBe(validData.personality);
        expect(result.data.systemPrompt).toBeUndefined();
      }
    });

    it("should validate agent data with optional llmConfigId", () => {
      const validData = {
        name: "AI Assistant",
        model: "Claude 3.5 Sonnet",
        llmConfigId: "config-123",
        role: "role-id",
        personality: "personality-id",
        systemPrompt: "You are a helpful assistant.",
      };

      const result = agentSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
        expect(result.data.llmConfigId).toBe("config-123");
      }
    });

    it("should fail validation when llmConfigId is missing (required field)", () => {
      const invalidData = {
        name: "Simple Agent",
        model: "GPT-4",
        role: "role-id",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should accept name with valid characters", () => {
      const validData = {
        name: "AI-Assistant_v2 Agent",
        model: "Claude",
        llmConfigId: "test-config-id",
        role: "role-id",
        personality: "personality-id",
        systemPrompt: "Test system prompt",
      };

      const result = agentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should accept name with 100 characters", () => {
      const validData = {
        name: "A".repeat(100),
        model: "Claude",
        llmConfigId: "test-config-id",
        role: "role-id",
        personality: "personality-id",
        systemPrompt: "Test system prompt",
      };

      const result = agentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should accept systemPrompt with 5000 characters", () => {
      const validData = {
        name: "Valid Name",
        model: "Claude",
        llmConfigId: "test-config-id",
        role: "role-id",
        personality: "personality-id",
        systemPrompt: "A".repeat(5000),
      };

      const result = agentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should accept valid boundary values", () => {
      const validData = {
        name: "Ab", // minimum length
        model: "Claude",
        llmConfigId: "test-config-id",
        role: "role-id",
        personality: "personality-id",
        temperature: 0, // minimum
        maxTokens: 1, // minimum
        topP: 0, // minimum
      };

      const result = agentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should accept maximum boundary values", () => {
      const validData = {
        name: "A".repeat(100), // maximum length
        model: "Claude",
        llmConfigId: "test-config-id",
        role: "role-id",
        personality: "personality-id",
        temperature: 2, // maximum
        maxTokens: 4000, // maximum
        topP: 1, // maximum
        systemPrompt: "A".repeat(5000), // maximum
      };

      const result = agentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe("invalid data", () => {
    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject name with only whitespace", () => {
      const invalidData = {
        name: "   ",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject name longer than 100 characters", () => {
      const invalidData = {
        name: "A".repeat(101),
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject name shorter than 2 characters", () => {
      const invalidData = {
        name: "A",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject name with invalid characters", () => {
      const invalidData = {
        name: "Agent@Name!",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty model", () => {
      const invalidData = {
        name: "Valid Name",
        model: "",
        role: "role-id",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty role", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty personality", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        personality: "",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject systemPrompt longer than 5000 characters", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        systemPrompt: "A".repeat(5001),
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing name", () => {
      const invalidData = {
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing model", () => {
      const invalidData = {
        name: "Valid Name",
        role: "role-id",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing role", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing personality", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty llmConfigId", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        llmConfigId: "",
        role: "role-id",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject llmConfigId with only whitespace", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        llmConfigId: "   ",
        role: "role-id",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject non-string llmConfigId", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        llmConfigId: 123,
        role: "role-id",
        personality: "personality-id",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("type inference", () => {
    it("should infer correct TypeScript types", () => {
      const validData = {
        name: "Test Agent",
        model: "Claude",
        llmConfigId: "config-456",
        role: "role-id",
        personality: "personality-id",
        systemPrompt: "Test prompt",
      };

      const result = agentSchema.safeParse(validData);

      if (result.success) {
        // These should compile without TypeScript errors
        const name: string = result.data.name;
        const model: string = result.data.model;
        const llmConfigId: string | undefined = result.data.llmConfigId;
        const role: string = result.data.role;
        const personality: string = result.data.personality;
        const systemPrompt: string | undefined = result.data.systemPrompt;

        expect(name).toBe(validData.name);
        expect(model).toBe(validData.model);
        expect(llmConfigId).toBe(validData.llmConfigId);
        expect(role).toBe(validData.role);
        expect(personality).toBe(validData.personality);
        expect(systemPrompt).toBe(validData.systemPrompt);
      }
    });

    it("should work with AgentFormData type", () => {
      const agentFormData: AgentFormData = {
        name: "Test Agent",
        model: "Claude",
        llmConfigId: "config-789",
        role: "role-id",
        personality: "personality-id",
        systemPrompt: "Test prompt",
      };

      const result = agentSchema.safeParse(agentFormData);
      expect(result.success).toBe(true);

      // Test without optional fields
      const agentFormDataMinimal: AgentFormData = {
        name: "Test Agent",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        llmConfigId: "test-config-id",
      };

      const result2 = agentSchema.safeParse(agentFormDataMinimal);
      expect(result2.success).toBe(true);
    });
  });
});
