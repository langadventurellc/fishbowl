import { mapAgentsPersistenceToUI } from "../mapAgentsPersistenceToUI";
import { mapAgentsUIToPersistence } from "../mapAgentsUIToPersistence";
import type { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";

describe("Agent Mapping Round Trip", () => {
  it("should preserve data integrity in round trip conversion", () => {
    const originalData: PersistedAgentsSettingsData = {
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
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
      ],
      defaults: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.9,
      },
      schemaVersion: "1.0.0",
      lastUpdated: "2023-01-01T00:00:00.000Z",
    };

    const uiData = mapAgentsPersistenceToUI(originalData);
    const backToPersistence = mapAgentsUIToPersistence(uiData);

    // Check that agent data is preserved
    expect(backToPersistence.agents).toHaveLength(1);
    const originalAgent = originalData.agents[0];
    const roundTripAgent = backToPersistence.agents[0];

    if (originalAgent && roundTripAgent) {
      expect(roundTripAgent.id).toBe(originalAgent.id);
      expect(roundTripAgent.name).toBe(originalAgent.name);
      expect(roundTripAgent.model).toBe(originalAgent.model);
      expect(roundTripAgent.role).toBe(originalAgent.role);
      expect(roundTripAgent.personality).toBe(originalAgent.personality);
      expect(roundTripAgent.temperature).toBe(originalAgent.temperature);
      expect(roundTripAgent.maxTokens).toBe(originalAgent.maxTokens);
      expect(roundTripAgent.topP).toBe(originalAgent.topP);
      expect(roundTripAgent.systemPrompt).toBe(originalAgent.systemPrompt);
      expect(roundTripAgent.createdAt).toBe(originalAgent.createdAt);
      // updatedAt will be different due to transformation
    }
  });

  it("should handle multiple agents in round trip conversion", () => {
    const originalData: PersistedAgentsSettingsData = {
      agents: [
        {
          id: "agent-1",
          name: "Agent One",
          model: "Claude 3.5 Sonnet",
          role: "role-1",
          personality: "personality-1",
          temperature: 0.7,
          maxTokens: 1500,
          topP: 0.9,
          systemPrompt: "You are agent one",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "agent-2",
          name: "Agent Two",
          model: "Claude 3.5 Haiku",
          role: "role-2",
          personality: "personality-2",
          temperature: 1.2,
          maxTokens: 3000,
          topP: 0.8,
          createdAt: "2023-01-02T00:00:00.000Z",
          updatedAt: "2023-01-02T00:00:00.000Z",
        },
      ],
      defaults: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.9,
      },
      schemaVersion: "1.0.0",
      lastUpdated: "2023-01-02T00:00:00.000Z",
    };

    const uiData = mapAgentsPersistenceToUI(originalData);
    const backToPersistence = mapAgentsUIToPersistence(uiData);

    expect(backToPersistence.agents).toHaveLength(2);
    expect(backToPersistence.agents[0]?.id).toBe("agent-1");
    expect(backToPersistence.agents[1]?.id).toBe("agent-2");
    expect(backToPersistence.agents[0]?.name).toBe("Agent One");
    expect(backToPersistence.agents[1]?.name).toBe("Agent Two");
  });
});
