/**
 * Unit tests for agent schema validation
 *
 * @module schemas/__tests__/agentSchema.test
 */
import { agentSchema } from "../agentSchema";

describe("agentSchema", () => {
  describe("valid data", () => {
    it("should validate correct agent data", () => {
      const validData = {
        name: "Research Assistant",
        model: "gpt-4",
        role: "Research and analysis specialist",
        configuration: {
          temperature: 0.7,
          maxTokens: 2000,
          topP: 0.9,
          systemPrompt: "You are a helpful research assistant.",
        },
      };

      const result = agentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate agent data without optional systemPrompt", () => {
      const validData = {
        name: "Code Assistant",
        model: "claude-3-haiku",
        role: "Code review and debugging",
        configuration: {
          temperature: 0.3,
          maxTokens: 1500,
          topP: 0.95,
        },
      };

      const result = agentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate agent data with boundary values", () => {
      const validData = {
        name: "A", // minimum length
        model: "test-model",
        role: "Test", // near minimum length
        configuration: {
          temperature: 0, // minimum
          maxTokens: 1, // minimum
          topP: 0, // minimum
        },
      };

      const result = agentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate agent data with maximum boundary values", () => {
      const validData = {
        name: "A".repeat(50), // maximum length
        model: "test-model",
        role: "A".repeat(100), // maximum length
        configuration: {
          temperature: 2, // maximum
          maxTokens: 4000, // maximum
          topP: 1, // maximum
        },
      };

      const result = agentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("name validation", () => {
    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        model: "gpt-4",
        role: "Assistant",
        configuration: { temperature: 0.7, maxTokens: 2000, topP: 0.9 },
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]!.message).toBe("Agent name is required");
      }
    });

    it("should reject names over 50 characters", () => {
      const invalidData = {
        name: "A".repeat(51),
        model: "gpt-4",
        role: "Assistant",
        configuration: { temperature: 0.7, maxTokens: 2000, topP: 0.9 },
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]!.message).toBe(
          "Agent name must be 50 characters or less",
        );
      }
    });

    it("should reject whitespace-only name", () => {
      const invalidData = {
        name: "   ",
        model: "gpt-4",
        role: "Assistant",
        configuration: { temperature: 0.7, maxTokens: 2000, topP: 0.9 },
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]!.message).toBe("Agent name is required");
      }
    });

    it("should trim and validate name", () => {
      const validData = {
        name: "  Valid Name  ",
        model: "gpt-4",
        role: "Assistant",
        configuration: { temperature: 0.7, maxTokens: 2000, topP: 0.9 },
      };

      const result = agentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Valid Name");
      }
    });
  });

  describe("model validation", () => {
    it("should reject empty model", () => {
      const invalidData = {
        name: "Assistant",
        model: "",
        role: "Helper",
        configuration: { temperature: 0.7, maxTokens: 2000, topP: 0.9 },
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]!.message).toBe(
          "Model selection is required",
        );
      }
    });

    it("should accept any non-empty model string", () => {
      const validData = {
        name: "Assistant",
        model: "custom-model-v1.0",
        role: "Helper",
        configuration: { temperature: 0.7, maxTokens: 2000, topP: 0.9 },
      };

      const result = agentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("role validation", () => {
    it("should reject empty role", () => {
      const invalidData = {
        name: "Assistant",
        model: "gpt-4",
        role: "",
        configuration: { temperature: 0.7, maxTokens: 2000, topP: 0.9 },
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]!.message).toBe("Role is required");
      }
    });

    it("should reject roles over 100 characters", () => {
      const invalidData = {
        name: "Assistant",
        model: "gpt-4",
        role: "A".repeat(101),
        configuration: { temperature: 0.7, maxTokens: 2000, topP: 0.9 },
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]!.message).toBe(
          "Role must be 100 characters or less",
        );
      }
    });

    it("should reject whitespace-only role", () => {
      const invalidData = {
        name: "Assistant",
        model: "gpt-4",
        role: "   ",
        configuration: { temperature: 0.7, maxTokens: 2000, topP: 0.9 },
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]!.message).toBe("Role is required");
      }
    });

    it("should trim and validate role", () => {
      const validData = {
        name: "Assistant",
        model: "gpt-4",
        role: "  Helper Role  ",
        configuration: { temperature: 0.7, maxTokens: 2000, topP: 0.9 },
      };

      const result = agentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("Helper Role");
      }
    });
  });

  describe("configuration validation", () => {
    describe("temperature", () => {
      it("should reject temperature below 0", () => {
        const invalidData = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: { temperature: -0.1, maxTokens: 2000, topP: 0.9 },
        };

        const result = agentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]!.message).toBe(
            "Temperature must be between 0 and 2",
          );
        }
      });

      it("should reject temperature above 2", () => {
        const invalidData = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: { temperature: 2.1, maxTokens: 2000, topP: 0.9 },
        };

        const result = agentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]!.message).toBe(
            "Temperature must be between 0 and 2",
          );
        }
      });

      it("should accept temperature at boundaries", () => {
        const validData1 = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: { temperature: 0, maxTokens: 2000, topP: 0.9 },
        };

        const validData2 = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: { temperature: 2, maxTokens: 2000, topP: 0.9 },
        };

        expect(agentSchema.safeParse(validData1).success).toBe(true);
        expect(agentSchema.safeParse(validData2).success).toBe(true);
      });
    });

    describe("maxTokens", () => {
      it("should reject maxTokens below 1", () => {
        const invalidData = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: { temperature: 0.7, maxTokens: 0, topP: 0.9 },
        };

        const result = agentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]!.message).toBe(
            "Max tokens must be at least 1",
          );
        }
      });

      it("should reject maxTokens above 4000", () => {
        const invalidData = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: { temperature: 0.7, maxTokens: 4001, topP: 0.9 },
        };

        const result = agentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]!.message).toBe(
            "Max tokens must be 4000 or less",
          );
        }
      });

      it("should reject non-integer maxTokens", () => {
        const invalidData = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: { temperature: 0.7, maxTokens: 1500.5, topP: 0.9 },
        };

        const result = agentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]!.message).toBe(
            "Max tokens must be a whole number",
          );
        }
      });

      it("should accept maxTokens at boundaries", () => {
        const validData1 = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: { temperature: 0.7, maxTokens: 1, topP: 0.9 },
        };

        const validData2 = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: { temperature: 0.7, maxTokens: 4000, topP: 0.9 },
        };

        expect(agentSchema.safeParse(validData1).success).toBe(true);
        expect(agentSchema.safeParse(validData2).success).toBe(true);
      });
    });

    describe("topP", () => {
      it("should reject topP below 0", () => {
        const invalidData = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: { temperature: 0.7, maxTokens: 2000, topP: -0.1 },
        };

        const result = agentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]!.message).toBe(
            "Top P must be between 0 and 1",
          );
        }
      });

      it("should reject topP above 1", () => {
        const invalidData = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: { temperature: 0.7, maxTokens: 2000, topP: 1.1 },
        };

        const result = agentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]!.message).toBe(
            "Top P must be between 0 and 1",
          );
        }
      });

      it("should accept topP at boundaries", () => {
        const validData1 = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: { temperature: 0.7, maxTokens: 2000, topP: 0 },
        };

        const validData2 = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: { temperature: 0.7, maxTokens: 2000, topP: 1 },
        };

        expect(agentSchema.safeParse(validData1).success).toBe(true);
        expect(agentSchema.safeParse(validData2).success).toBe(true);
      });
    });

    describe("systemPrompt", () => {
      it("should accept empty systemPrompt", () => {
        const validData = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: {
            temperature: 0.7,
            maxTokens: 2000,
            topP: 0.9,
            systemPrompt: "",
          },
        };

        const result = agentSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it("should accept long systemPrompt", () => {
        const validData = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: {
            temperature: 0.7,
            maxTokens: 2000,
            topP: 0.9,
            systemPrompt: "A".repeat(1000),
          },
        };

        const result = agentSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it("should work without systemPrompt field", () => {
        const validData = {
          name: "Assistant",
          model: "gpt-4",
          role: "Helper",
          configuration: {
            temperature: 0.7,
            maxTokens: 2000,
            topP: 0.9,
          },
        };

        const result = agentSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.configuration.systemPrompt).toBeUndefined();
        }
      });
    });
  });

  describe("missing required fields", () => {
    it("should reject missing name", () => {
      const invalidData = {
        model: "gpt-4",
        role: "Helper",
        configuration: { temperature: 0.7, maxTokens: 2000, topP: 0.9 },
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing model", () => {
      const invalidData = {
        name: "Assistant",
        role: "Helper",
        configuration: { temperature: 0.7, maxTokens: 2000, topP: 0.9 },
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing role", () => {
      const invalidData = {
        name: "Assistant",
        model: "gpt-4",
        configuration: { temperature: 0.7, maxTokens: 2000, topP: 0.9 },
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing configuration", () => {
      const invalidData = {
        name: "Assistant",
        model: "gpt-4",
        role: "Helper",
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing configuration fields", () => {
      const invalidData = {
        name: "Assistant",
        model: "gpt-4",
        role: "Helper",
        configuration: { temperature: 0.7 }, // missing maxTokens and topP
      };

      const result = agentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
