import type { AgentFormData } from "@fishbowl-ai/ui-shared";
import { expect } from "@playwright/test";
import { promises as fs } from "fs";
import path from "path";
import { queryConversations } from "../database";
import { createLlmConfigForAgentTests } from "../settings/createLlmConfigForAgentTests";
import { createMockAgentData } from "../settings/createMockAgentData";
import { createTestAgent } from "../settings/createTestAgent";
import type { MockLlmConfig } from "../settings/MockLlmConfig";
import type { TestElectronApplication } from "../TestElectronApplication";
import type { TestWindow } from "../TestWindow";

export interface MockAgentData extends AgentFormData {
  id: string;
}

/**
 * Complete setup for conversation agent testing: LLM + Agent + Conversation
 * This helper combines all prerequisite setup steps into one function for testing
 * conversation agent functionality.
 */
export const setupConversationAgentTest = async (
  window: TestWindow,
  electronApp: TestElectronApplication,
): Promise<{
  llmConfig: MockLlmConfig;
  agent: MockAgentData;
  conversationId: string;
}> => {
  // Step 1: Create LLM configuration
  const llmConfig = await createLlmConfigForAgentTests(window);

  // Step 2: Create test agent
  const mockAgentData = createMockAgentData();
  const filledAgentData = await createTestAgent(window, mockAgentData);

  // Get the real agent ID from the agents.json file
  const userDataPath = await electronApp.evaluate(async ({ app }) => {
    return app.getPath("userData");
  });
  const agentsConfigPath = path.join(userDataPath, "agents.json");

  // Wait for file to be written and retry a few times
  let agentsData: { agents: Array<{ name: string; id: string }> };
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      await window.waitForTimeout(200);
      const agentsContent = await fs.readFile(agentsConfigPath, "utf-8");
      agentsData = JSON.parse(agentsContent) as {
        agents: Array<{ name: string; id: string }>;
      };
      break;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error(
          `Could not read agents file after ${maxAttempts} attempts. Last error: ${error}`,
        );
      }
    }
  }

  const savedAgent = agentsData!.agents.find(
    (agent: { name: string }) => agent.name === filledAgentData.name,
  );

  if (!savedAgent || !savedAgent.id) {
    throw new Error(
      `Could not find saved agent with name ${filledAgentData.name}. Available agents: ${agentsData!.agents.map((a) => a.name).join(", ")}`,
    );
  }

  const agent: MockAgentData = {
    ...filledAgentData,
    id: savedAgent.id,
  };

  // Step 3: Exit settings and create new conversation
  // Close settings modal
  await window.evaluate(() => {
    if (window.testHelpers?.isSettingsModalOpen()) {
      window.testHelpers!.closeSettingsModal();
    }
  });

  // Wait for modal to close
  await expect(
    window.locator('[data-testid="settings-modal"]'),
  ).not.toBeVisible({ timeout: 5000 });

  // Wait for main interface to be ready
  await window.waitForLoadState("networkidle");

  // Create new conversation
  const newConversationButton = window.locator(
    '[data-testid="new-conversation-button"]',
  );
  await expect(newConversationButton).toBeVisible({ timeout: 5000 });
  await expect(newConversationButton).toBeEnabled();
  await newConversationButton.click();

  // Wait for conversation creation to complete
  await expect(newConversationButton).toHaveText("New Conversation", {
    timeout: 10000,
  });

  // Verify conversation was created in database and get its ID
  const conversations = await queryConversations(electronApp);
  expect(conversations).toHaveLength(1);
  const conversationId = conversations[0]!.id;

  return {
    llmConfig,
    agent,
    conversationId,
  };
};
