import { mapAgentsPersistenceToUI } from "../mapAgentsPersistenceToUI";
import { mapAgentsUIToPersistence } from "../mapAgentsUIToPersistence";
import type { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";

describe("Agent Mapping Round Trip", () => {
  it("should preserve data integrity in round trip conversion", () => {
    const originalData: PersistedAgentsSettingsData = {
      agents: [
        {
          id: "test-id-1",
          name: "Test Agent 1",
          model: "Claude 3.5 Sonnet",
          role: "role-id-1",
          personality: "personality-id-1",
          systemPrompt: "Test prompt 1",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "test-id-2",
          name: "Test Agent 2",
          model: "Claude 3.5 Haiku",
          role: "role-id-2",
          personality: "personality-id-2",
          systemPrompt: "Test prompt 2",
          createdAt: "2023-01-02T00:00:00.000Z",
          updatedAt: "2023-01-02T00:00:00.000Z",
        },
      ],
      schemaVersion: "1.0.0",
      lastUpdated: "2023-01-01T00:00:00.000Z",
    };

    const uiData = mapAgentsPersistenceToUI(originalData);
    const backToPersistence = mapAgentsUIToPersistence(uiData);

    // Check that both agents are preserved
    expect(backToPersistence.agents).toHaveLength(2);

    // Validate first agent
    const originalAgent1 = originalData.agents[0];
    const roundTripAgent1 = backToPersistence.agents[0];

    if (originalAgent1 && roundTripAgent1) {
      expect(roundTripAgent1.id).toBe(originalAgent1.id);
      expect(roundTripAgent1.name).toBe(originalAgent1.name);
      expect(roundTripAgent1.model).toBe(originalAgent1.model);
      expect(roundTripAgent1.role).toBe(originalAgent1.role);
      expect(roundTripAgent1.personality).toBe(originalAgent1.personality);
      expect(roundTripAgent1.systemPrompt).toBe(originalAgent1.systemPrompt);
      expect(roundTripAgent1.createdAt).toBe(originalAgent1.createdAt);
      // updatedAt will be different as it's set to current timestamp
      expect(roundTripAgent1.updatedAt).toBeDefined();
    }

    // Validate second agent
    const originalAgent2 = originalData.agents[1];
    const roundTripAgent2 = backToPersistence.agents[1];

    if (originalAgent2 && roundTripAgent2) {
      expect(roundTripAgent2.id).toBe(originalAgent2.id);
      expect(roundTripAgent2.name).toBe(originalAgent2.name);
      expect(roundTripAgent2.model).toBe(originalAgent2.model);
      expect(roundTripAgent2.role).toBe(originalAgent2.role);
      expect(roundTripAgent2.personality).toBe(originalAgent2.personality);
      expect(roundTripAgent2.systemPrompt).toBe(originalAgent2.systemPrompt);
      expect(roundTripAgent2.createdAt).toBe(originalAgent2.createdAt);
      // updatedAt will be different as it's set to current timestamp
      expect(roundTripAgent2.updatedAt).toBeDefined();
    }

    // Check schema structure
    expect(backToPersistence.schemaVersion).toBe("1.0.0");
    expect(backToPersistence.lastUpdated).toBeDefined();
  });

  it("should handle empty agents array", () => {
    const originalData: PersistedAgentsSettingsData = {
      agents: [],
      schemaVersion: "1.0.0",
      lastUpdated: "2023-01-01T00:00:00.000Z",
    };

    const uiData = mapAgentsPersistenceToUI(originalData);
    const backToPersistence = mapAgentsUIToPersistence(uiData);

    expect(backToPersistence.agents).toHaveLength(0);
    expect(backToPersistence.schemaVersion).toBe("1.0.0");
    expect(backToPersistence.lastUpdated).toBeDefined();
  });
});
