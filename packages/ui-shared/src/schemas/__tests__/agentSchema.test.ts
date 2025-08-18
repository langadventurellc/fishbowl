/**
 * Unit tests for agentSchema validation.
 *
 * Tests schema validation for agent creation and editing,
 * following the pattern from roleSchema tests.
 *
 * @module schemas/__tests__/agentSchema.test
 */

import { agentSchema } from "../agentSchema";
import type { AgentFormData } from "../../types/settings/AgentFormData";

describe("agentSchema", () => {
  describe("valid data", () => {
    it("should validate complete agent data with all fields", () => {
      const validData = {
        name: "AI Assistant",
        model: "Claude 3.5 Sonnet",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
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

    it("should accept name with valid characters", () => {
      const validData = {
        name: "AI-Assistant_v2 Agent",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
        systemPrompt: "Test system prompt",
      };

      const result = agentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should accept name with 100 characters", () => {
      const validData = {
        name: "A".repeat(100),
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
        systemPrompt: "Test system prompt",
      };

      const result = agentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should accept systemPrompt with 5000 characters", () => {
      const validData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
        systemPrompt: "A".repeat(5000),
      };

      const result = agentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should accept valid boundary values", () => {
      const validData = {
        name: "Ab", // minimum length
        model: "Claude",
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
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
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
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
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
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
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
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
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
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
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
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
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
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
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
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject temperature below 0", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: -0.1,
        maxTokens: 2000,
        topP: 0.95,
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject temperature above 2", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: 2.1,
        maxTokens: 2000,
        topP: 0.95,
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject maxTokens below 1", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 0,
        topP: 0.95,
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject maxTokens above 4000", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 4001,
        topP: 0.95,
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer maxTokens", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 1500.5,
        topP: 0.95,
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject topP below 0", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: -0.1,
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject topP above 1", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 1.1,
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
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
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
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing model", () => {
      const invalidData = {
        name: "Valid Name",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing role", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing personality", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing temperature", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        maxTokens: 2000,
        topP: 0.95,
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing maxTokens", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        topP: 0.95,
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing topP", () => {
      const invalidData = {
        name: "Valid Name",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
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
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
        systemPrompt: "Test prompt",
      };

      const result = agentSchema.safeParse(validData);

      if (result.success) {
        // These should compile without TypeScript errors
        const name: string = result.data.name;
        const model: string = result.data.model;
        const role: string = result.data.role;
        const personality: string = result.data.personality;
        const temperature: number = result.data.temperature;
        const maxTokens: number = result.data.maxTokens;
        const topP: number = result.data.topP;
        const systemPrompt: string | undefined = result.data.systemPrompt;

        expect(name).toBe(validData.name);
        expect(model).toBe(validData.model);
        expect(role).toBe(validData.role);
        expect(personality).toBe(validData.personality);
        expect(temperature).toBe(validData.temperature);
        expect(maxTokens).toBe(validData.maxTokens);
        expect(topP).toBe(validData.topP);
        expect(systemPrompt).toBe(validData.systemPrompt);
      }
    });

    it("should work with AgentFormData type", () => {
      const agentFormData: AgentFormData = {
        name: "Test Agent",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
        systemPrompt: "Test prompt",
      };

      const result = agentSchema.safeParse(agentFormData);
      expect(result.success).toBe(true);

      // Test without systemPrompt
      const agentFormDataWithoutPrompt: AgentFormData = {
        name: "Test Agent",
        model: "Claude",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
      };

      const result2 = agentSchema.safeParse(agentFormDataWithoutPrompt);
      expect(result2.success).toBe(true);
    });
  });
});
