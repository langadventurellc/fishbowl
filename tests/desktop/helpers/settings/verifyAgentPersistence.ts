import type { AgentFormData } from "@fishbowl-ai/ui-shared";
import { expect } from "@playwright/test";
import { promises as fs } from "fs";
import type { TestWindow } from "../TestWindow";
import type { setupAgentsTestSuite } from "./setupAgentsTestSuite";

export const verifyAgentPersistence = async (
  window: TestWindow,
  agentData: AgentFormData,
  testSuite: ReturnType<typeof setupAgentsTestSuite>,
) => {
  // Get agents.json file path and verify content
  const agentsConfigPath = testSuite.getAgentsConfigPath();

  // Wait a bit for file system write to complete
  await window.waitForTimeout(500);

  const agentsContent = await fs.readFile(agentsConfigPath, "utf-8");
  const agentsDataParsed = JSON.parse(agentsContent);

  // Verify agent exists in saved data
  const savedAgent = agentsDataParsed.agents.find(
    (agent: { name: string }) => agent.name === agentData.name,
  );

  expect(savedAgent).toBeDefined();
  expect(savedAgent.name).toBe(agentData.name);
  expect(savedAgent.model).toBe(agentData.model);
  expect(savedAgent.role).toBe(agentData.role);
  expect(savedAgent.personality).toBe(agentData.personality);

  if (agentData.systemPrompt) {
    expect(savedAgent.systemPrompt).toBe(agentData.systemPrompt);
  }

  // Verify agent has required metadata
  expect(savedAgent.id).toBeDefined();
  expect(savedAgent.createdAt).toBeDefined();
  expect(savedAgent.updatedAt).toBeDefined();
};
