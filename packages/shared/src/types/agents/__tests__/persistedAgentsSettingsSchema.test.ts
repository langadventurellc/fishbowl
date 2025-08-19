import { persistedAgentsSettingsSchema } from "../persistedAgentsSettingsSchema";
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
          model: "Claude 3.5 Sonnet",
          role: "role-id",
          personality: "personality-id",
          temperature: 1.0,
          maxTokens: 2000,
          topP: 0.95,
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

  it("should fail validation for invalid temperature range", () => {
    const invalidSettings = {
      agents: [
        {
          id: "test-id",
          name: "Test Agent",
          model: "Claude 3.5 Sonnet",
          role: "role-id",
          personality: "personality-id",
          temperature: 3.0, // Invalid: exceeds max of 2
          maxTokens: 2000,
          topP: 0.95,
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

  it("should fail validation for invalid maxTokens range", () => {
    const invalidSettings = {
      agents: [
        {
          id: "test-id",
          name: "Test Agent",
          model: "Claude 3.5 Sonnet",
          role: "role-id",
          personality: "personality-id",
          temperature: 1.0,
          maxTokens: 5000, // Invalid: exceeds max of 4000
          topP: 0.95,
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

  it("should fail validation for invalid topP range", () => {
    const invalidSettings = {
      agents: [
        {
          id: "test-id",
          name: "Test Agent",
          model: "Claude 3.5 Sonnet",
          role: "role-id",
          personality: "personality-id",
          temperature: 1.0,
          maxTokens: 2000,
          topP: 1.5, // Invalid: exceeds max of 1
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

  it("should validate optional systemPrompt field", () => {
    const settingsWithoutSystemPrompt = {
      agents: [
        {
          id: "test-id",
          name: "Test Agent",
          model: "Claude 3.5 Sonnet",
          role: "role-id",
          personality: "personality-id",
          temperature: 1.0,
          maxTokens: 2000,
          topP: 0.95,
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
    const incompleteSettings = {
      agents: [
        {
          id: "test-id",
          name: "Test Agent",
          // Missing model, role, personality, temperature, maxTokens, topP
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      schemaVersion: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };

    const result = persistedAgentsSettingsSchema.safeParse(incompleteSettings);
    expect(result.success).toBe(false);
  });
});
