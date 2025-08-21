import type { AgentFormData } from "@fishbowl-ai/ui-shared";
import { expect, type Locator } from "@playwright/test";
import type { TestWindow } from "../TestWindow";

export const verifyAgentCardData = async (
  window: TestWindow,
  agentCard: Locator,
  expectedData: AgentFormData,
) => {
  // Verify agent card displays correct data
  await expect(agentCard).toContainText(expectedData.name);
  await expect(agentCard).toContainText(expectedData.role);
  await expect(agentCard).toContainText(expectedData.personality);
  // Add other field verifications as needed
};
