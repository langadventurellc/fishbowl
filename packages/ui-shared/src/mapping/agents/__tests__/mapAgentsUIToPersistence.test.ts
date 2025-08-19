import { mapAgentsUIToPersistence } from "../mapAgentsUIToPersistence";
import type { AgentSettingsViewModel } from "../../../types/settings";

describe("mapAgentsUIToPersistence", () => {
  it("should map empty agents array correctly", () => {
    const agents: AgentSettingsViewModel[] = [];
    const result = mapAgentsUIToPersistence(agents);

    expect(result.agents).toEqual([]);
    expect(result.schemaVersion).toBe("1.0.0");
    expect(result.lastUpdated).toBeDefined();
  });

  it("should map agents with all fields correctly", () => {
    const agents: AgentSettingsViewModel[] = [
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
    ];

    const result = mapAgentsUIToPersistence(agents);
    expect(result.agents).toHaveLength(1);
    expect(result.agents[0]?.id).toBe("test-id");
    expect(result.agents[0]?.name).toBe("Test Agent");
    expect(result.agents[0]?.systemPrompt).toBe("Test prompt");
  });

  it("should handle missing timestamps by adding current date", () => {
    const agents: AgentSettingsViewModel[] = [
      {
        id: "test-id",
        name: "Test Agent",
        model: "Claude 3.5 Sonnet",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
      },
    ];

    const result = mapAgentsUIToPersistence(agents);
    expect(result.agents).toHaveLength(1);
    expect(result.agents[0]?.createdAt).toBeDefined();
    expect(result.agents[0]?.updatedAt).toBeDefined();
    if (result.agents[0]?.createdAt) {
      expect(new Date(result.agents[0].createdAt)).toBeInstanceOf(Date);
    }
    if (result.agents[0]?.updatedAt) {
      expect(new Date(result.agents[0].updatedAt)).toBeInstanceOf(Date);
    }
  });
});
