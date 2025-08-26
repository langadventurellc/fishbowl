import type { AgentFormData } from "@fishbowl-ai/ui-shared";
import { expect } from "@playwright/test";
import { queryConversations } from "../database";
import { createLlmConfigForAgentTests } from "../settings/createLlmConfigForAgentTests";
import { createMockAgentData } from "../settings/createMockAgentData";
import { fillAgentForm } from "../settings/fillAgentForm";
import type { MockLlmConfig } from "../settings/MockLlmConfig";
import { openAgentsSection } from "../settings/openAgentsSection";
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
  await openAgentsSection(window);

  // Click "Create Agent" button
  const createAgentButton = window
    .locator("button")
    .filter({ hasText: "Create Agent" });
  await expect(createAgentButton).toBeVisible({ timeout: 5000 });
  await createAgentButton.click();

  // Wait for agent modal
  const agentModal = window.locator('[role="dialog"]');
  await expect(agentModal).toBeVisible({ timeout: 5000 });

  // Fill agent form
  const mockAgentData = createMockAgentData();
  const filledAgentData = await fillAgentForm(window, mockAgentData);

  // Save agent
  const saveButton = window
    .locator("button")
    .filter({ hasText: "Create Agent" });
  await expect(saveButton).toBeEnabled({ timeout: 2000 });
  await saveButton.click();

  // Wait for modal to close and agent to be created
  await expect(agentModal).not.toBeVisible({ timeout: 5000 });

  // Generate a consistent agent ID (simulating what the real system would do)
  const agent: MockAgentData = {
    ...filledAgentData,
    id: `agent-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
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
