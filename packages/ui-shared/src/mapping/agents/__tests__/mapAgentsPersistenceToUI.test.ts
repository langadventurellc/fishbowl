import { mapAgentsPersistenceToUI } from "../mapAgentsPersistenceToUI";
import type { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";

describe("mapAgentsPersistenceToUI", () => {
  it("should map empty agents array correctly", () => {
    const persistedData: PersistedAgentsSettingsData = {
      agents: [],
      schemaVersion: "1.0.0",
      lastUpdated: "2023-01-01T00:00:00.000Z",
    };

    const result = mapAgentsPersistenceToUI(persistedData);
    expect(result).toEqual([]);
  });

  it("should map single agent correctly", () => {
    const persistedData: PersistedAgentsSettingsData = {
      agents: [
        {
          id: "test-id",
          name: "Test Agent",
          model: "Claude 3.5 Sonnet",
          role: "role-id",
          personality: "personality-id",
          systemPrompt: "Test prompt",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
      ],
      schemaVersion: "1.0.0",
      lastUpdated: "2023-01-01T00:00:00.000Z",
    };

    const result = mapAgentsPersistenceToUI(persistedData);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "test-id",
      name: "Test Agent",
      model: "Claude 3.5 Sonnet",
      role: "role-id",
      personality: "personality-id",
      systemPrompt: "Test prompt",
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
    });
  });

  it("should handle missing optional fields", () => {
    const persistedData: PersistedAgentsSettingsData = {
      agents: [
        {
          id: "test-id",
          name: "Test Agent",
          model: "Claude 3.5 Sonnet",
          role: "role-id",
          personality: "personality-id",
          // No systemPrompt
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
      ],
      schemaVersion: "1.0.0",
      lastUpdated: "2023-01-01T00:00:00.000Z",
    };

    const result = mapAgentsPersistenceToUI(persistedData);
    expect(result).toHaveLength(1);
    expect(result[0]?.systemPrompt).toBeUndefined();
  });
});
