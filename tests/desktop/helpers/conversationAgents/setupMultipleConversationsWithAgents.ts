import { expect } from "@playwright/test";
import {
  clickAddAgentButton,
  clickAddButtonInModal,
  selectAgentInModal,
  waitForAddAgentModal,
} from "../conversationAgentUiHelpers";
import { queryConversations } from "../database";
import { createLlmConfigForAgentTests } from "../settings/createLlmConfigForAgentTests";
import { createMockAgentData } from "../settings/createMockAgentData";
import { fillAgentForm } from "../settings/fillAgentForm";
import type { MockLlmConfig } from "../settings/MockLlmConfig";
import { openAgentsSection } from "../settings/openAgentsSection";
import type { TestElectronApplication } from "../TestElectronApplication";
import type { TestWindow } from "../TestWindow";
import type { MockAgentData } from "./setupConversationAgentTest";

/**
 * Configuration for creating conversations with specific agents
 */
export interface ConversationAgentConfig {
  conversationTitle: string;
  agentNames: string[]; // Names of agents to add to this conversation
}

/**
 * Create complex test scenarios with multiple conversations and agent assignments
 * This helper sets up LLM config, creates required agents, and creates conversations
 * with specified agent assignments for testing complex scenarios.
 */
export const createMultipleConversationsWithAgents = async (
  window: TestWindow,
  electronApp: TestElectronApplication,
  configs: ConversationAgentConfig[],
): Promise<{
  conversations: Array<{ id: string; title: string }>;
  agents: MockAgentData[];
  assignments: Array<{ conversationId: string; agentId: string }>;
}> => {
  // Step 1: Setup LLM configuration
  const _llmConfig: MockLlmConfig = await createLlmConfigForAgentTests(window);

  // Step 2: Collect all unique agent names from configs
  const allAgentNames = new Set<string>();
  configs.forEach((config) => {
    config.agentNames.forEach((name) => allAgentNames.add(name));
  });
  const uniqueAgentNames = Array.from(allAgentNames);

  // Step 3: Create all required agents
  const agents: MockAgentData[] = [];

  await openAgentsSection(window);

  for (const agentName of uniqueAgentNames) {
    // Click "Create Agent" button
    const createAgentButton = window
      .locator("button")
      .filter({ hasText: "Create Agent" });
    await expect(createAgentButton).toBeVisible({ timeout: 5000 });
    await createAgentButton.click();

    // Wait for agent modal
    const agentModal = window.locator('[role="dialog"]');
    await expect(agentModal).toBeVisible({ timeout: 5000 });

    // Fill agent form with custom name
    const mockAgentData = createMockAgentData({ name: agentName });
    const filledAgentData = await fillAgentForm(window, mockAgentData);

    // Save agent
    const saveButton = window
      .locator("button")
      .filter({ hasText: "Create Agent" });
    await expect(saveButton).toBeEnabled({ timeout: 2000 });
    await saveButton.click();

    // Wait for modal to close
    await expect(agentModal).not.toBeVisible({ timeout: 5000 });

    // Store agent data with generated ID
    const agent: MockAgentData = {
      ...filledAgentData,
      id: `agent-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    };
    agents.push(agent);

    // Small delay between agent creations
    await window.waitForTimeout(200);
  }

  // Step 4: Exit settings
  await window.evaluate(() => {
    if (window.testHelpers?.isSettingsModalOpen()) {
      window.testHelpers!.closeSettingsModal();
    }
  });

  // Wait for modal to close
  await expect(
    window.locator('[data-testid="settings-modal"]'),
  ).not.toBeVisible({ timeout: 5000 });
  await window.waitForLoadState("networkidle");

  // Step 5: Create each conversation and add specified agents
  const conversations: Array<{ id: string; title: string }> = [];
  const assignments: Array<{ conversationId: string; agentId: string }> = [];

  for (const config of configs) {
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

    // Get the conversation ID from database (latest conversation)
    const allConversations = await queryConversations(electronApp);
    const latestConversation = allConversations[allConversations.length - 1];
    if (!latestConversation) {
      throw new Error("Failed to create conversation");
    }

    conversations.push({
      id: latestConversation.id,
      title: config.conversationTitle,
    });

    // Step 6: Add specified agents to this conversation
    for (const agentName of config.agentNames) {
      // Find the agent by name
      const agent = agents.find((a) => a.name === agentName);
      if (!agent) {
        throw new Error(`Agent with name "${agentName}" not found`);
      }

      // Add agent to conversation
      await clickAddAgentButton(window);
      await waitForAddAgentModal(window, true);
      await selectAgentInModal(window, agentName);
      await clickAddButtonInModal(window);
      await waitForAddAgentModal(window, false);

      // Record the assignment
      assignments.push({
        conversationId: latestConversation.id,
        agentId: agent.id,
      });

      // Small delay between agent additions
      await window.waitForTimeout(200);
    }
  }

  return {
    conversations,
    agents,
    assignments,
  };
};
