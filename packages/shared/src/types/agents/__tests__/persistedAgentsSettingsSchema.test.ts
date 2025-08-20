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
          model: "Claude 3.5 Sonnet",
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
          model: "Claude 3.5 Sonnet",
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
          model: "Claude 3.5 Sonnet",
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
});
