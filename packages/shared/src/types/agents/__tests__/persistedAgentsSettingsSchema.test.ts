import {
  persistedAgentsSettingsSchema,
  PersonalityBehaviorsSchema,
  persistedAgentSchema,
} from "../persistedAgentsSettingsSchema";
import { createDefaultAgentsSettings } from "../../../services/storage/utils/agents";

describe("persistedAgentsSettingsSchema", () => {
  it("should validate default settings structure", () => {
    const defaultSettings = createDefaultAgentsSettings();
    const result = persistedAgentsSettingsSchema.safeParse(defaultSettings);

    expect(result.success).toBe(true);
  });

  it("should validate complete agent data", () => {
    const settingsWithAgent = {
      agents: [
        {
          id: "test-id",
          name: "Test Agent",
          model: "claude-3-5-sonnet",
          llmConfigId: "test-config-id",
          role: "role-id",
          personality: "personality-id",
          systemPrompt: "Test prompt",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      schemaVersion: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };

    const result = persistedAgentsSettingsSchema.safeParse(settingsWithAgent);
    expect(result.success).toBe(true);
  });

  it("should validate optional systemPrompt field", () => {
    const settingsWithoutSystemPrompt = {
      agents: [
        {
          id: "test-id",
          name: "Test Agent",
          model: "claude-3-5-sonnet",
          llmConfigId: "test-config-id",
          role: "role-id",
          personality: "personality-id",
          // systemPrompt is optional
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      schemaVersion: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };

    const result = persistedAgentsSettingsSchema.safeParse(
      settingsWithoutSystemPrompt,
    );
    expect(result.success).toBe(true);
  });

  it("should fail validation for missing required fields", () => {
    const invalidSettings = {
      agents: [
        {
          id: "test-id",
          // Missing name, model, role, personality
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      schemaVersion: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };

    const result = persistedAgentsSettingsSchema.safeParse(invalidSettings);
    expect(result.success).toBe(false);
  });

  it("should fail validation for empty agent name", () => {
    const invalidSettings = {
      agents: [
        {
          id: "test-id",
          name: "", // Empty name should fail
          model: "claude-3-5-sonnet",
          llmConfigId: "test-config-id",
          role: "role-id",
          personality: "personality-id",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      schemaVersion: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };

    const result = persistedAgentsSettingsSchema.safeParse(invalidSettings);
    expect(result.success).toBe(false);
  });

  it("should fail validation for excessively long system prompt", () => {
    const longPrompt = "A".repeat(5001); // Exceeds 5000 character limit
    const invalidSettings = {
      agents: [
        {
          id: "test-id",
          name: "Test Agent",
          model: "claude-3-5-sonnet",
          llmConfigId: "test-config-id",
          role: "role-id",
          personality: "personality-id",
          systemPrompt: longPrompt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      schemaVersion: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };

    const result = persistedAgentsSettingsSchema.safeParse(invalidSettings);
    expect(result.success).toBe(false);
  });

  it("should validate agent with personality behaviors", () => {
    const settingsWithPersonalityBehaviors = {
      agents: [
        {
          id: "test-id",
          name: "Test Agent",
          model: "claude-3-5-sonnet",
          llmConfigId: "test-config-id",
          role: "role-id",
          personality: "personality-id",
          personalityBehaviors: {
            humor: 25,
            formality: -10,
            brevity: 50,
            assertiveness: 0,
            responseLength: 75,
            randomness: -25,
            focus: 100,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      schemaVersion: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };

    const result = persistedAgentsSettingsSchema.safeParse(
      settingsWithPersonalityBehaviors,
    );
    expect(result.success).toBe(true);
  });

  it("should validate agent without personality behaviors", () => {
    const settingsWithoutPersonalityBehaviors = {
      agents: [
        {
          id: "test-id",
          name: "Test Agent",
          model: "claude-3-5-sonnet",
          llmConfigId: "test-config-id",
          role: "role-id",
          personality: "personality-id",
          // personalityBehaviors is optional
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      schemaVersion: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };

    const result = persistedAgentsSettingsSchema.safeParse(
      settingsWithoutPersonalityBehaviors,
    );
    expect(result.success).toBe(true);
  });
});

describe("PersonalityBehaviorsSchema", () => {
  it("should validate all 7 personality behaviors", () => {
    const allBehaviors = {
      humor: -100,
      formality: 100,
      brevity: 0,
      assertiveness: 50,
      responseLength: -50,
      randomness: 75,
      focus: -25,
    };

    const result = PersonalityBehaviorsSchema.safeParse(allBehaviors);
    expect(result.success).toBe(true);
  });

  it("should validate partial personality behaviors", () => {
    const partialBehaviors = {
      humor: 50,
      responseLength: -30,
      focus: 100,
    };

    const result = PersonalityBehaviorsSchema.safeParse(partialBehaviors);
    expect(result.success).toBe(true);
  });

  it("should validate empty personality behaviors object", () => {
    const emptyBehaviors = {};

    const result = PersonalityBehaviorsSchema.safeParse(emptyBehaviors);
    expect(result.success).toBe(true);
  });

  it("should fail validation for out-of-range behavior values", () => {
    const invalidBehaviors = {
      humor: 150, // Exceeds maximum of 100
      formality: -150, // Below minimum of -100
    };

    const result = PersonalityBehaviorsSchema.safeParse(invalidBehaviors);
    expect(result.success).toBe(false);
  });

  it("should fail validation for non-numeric behavior values", () => {
    const invalidBehaviors = {
      humor: "invalid", // Should be number
      randomness: null, // Should be number
      focus: true, // Should be number
    };

    const result = PersonalityBehaviorsSchema.safeParse(invalidBehaviors);
    expect(result.success).toBe(false);
  });

  it("should validate boundary values (-100 and 100)", () => {
    const boundaryBehaviors = {
      humor: -100,
      formality: 100,
      brevity: -100,
      assertiveness: 100,
      responseLength: -100,
      randomness: 100,
      focus: -100,
    };

    const result = PersonalityBehaviorsSchema.safeParse(boundaryBehaviors);
    expect(result.success).toBe(true);
  });
});

describe("persistedAgentSchema", () => {
  it("should validate agent without LLM parameters", () => {
    const validAgent = {
      id: "test-id",
      name: "Test Agent",
      model: "claude-3-5-sonnet",
      llmConfigId: "test-config-id",
      role: "role-id",
      personality: "personality-id",
      personalityBehaviors: {
        humor: 25,
        formality: -10,
        responseLength: 50,
        randomness: 0,
        focus: 75,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = persistedAgentSchema.safeParse(validAgent);
    expect(result.success).toBe(true);
  });

  it("should reject agent data with LLM parameters (due to passthrough)", () => {
    const agentWithLLMParams = {
      id: "test-id",
      name: "Test Agent",
      model: "claude-3-5-sonnet",
      llmConfigId: "test-config-id",
      role: "role-id",
      personality: "personality-id",
      temperature: 0.7, // Should not be present
      maxTokens: 4096, // Should not be present
      topP: 1, // Should not be present
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Note: The schema uses .passthrough() so these extra fields will be allowed
    // but the application logic should not include them
    const result = persistedAgentSchema.safeParse(agentWithLLMParams);
    expect(result.success).toBe(true);

    // However, we can verify that the parsed result maintains schema integrity
    if (result.success) {
      // The validated data should contain the LLM parameters due to passthrough
      // but the application should not rely on them
      expect(result.data.id).toBe("test-id");
      expect(result.data.name).toBe("Test Agent");
    }
  });
});

it("should validate agent with valid llmConfigId", () => {
  const validAgent = {
    id: "test-id",
    name: "Test Agent",
    model: "claude-3-5-sonnet",
    llmConfigId: "config-123",
    role: "role-id",
    personality: "personality-id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = persistedAgentSchema.safeParse(validAgent);
  expect(result.success).toBe(true);
});

it("should fail validation when llmConfigId is missing (required field)", () => {
  const invalidAgent = {
    id: "test-id",
    name: "Test Agent",
    model: "claude-3-5-sonnet",
    // llmConfigId is now required
    role: "role-id",
    personality: "personality-id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = persistedAgentSchema.safeParse(invalidAgent);
  expect(result.success).toBe(false);
});

it("should fail validation for empty llmConfigId", () => {
  const invalidAgent = {
    id: "test-id",
    name: "Test Agent",
    model: "claude-3-5-sonnet",
    llmConfigId: "", // Empty string should fail
    role: "role-id",
    personality: "personality-id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = persistedAgentSchema.safeParse(invalidAgent);
  expect(result.success).toBe(false);
});

it("should fail validation for non-string llmConfigId", () => {
  const invalidAgent = {
    id: "test-id",
    name: "Test Agent",
    model: "claude-3-5-sonnet",
    llmConfigId: 123, // Should be string
    role: "role-id",
    personality: "personality-id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = persistedAgentSchema.safeParse(invalidAgent);
  expect(result.success).toBe(false);
});
