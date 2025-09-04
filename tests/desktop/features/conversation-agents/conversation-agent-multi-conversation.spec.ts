import type { AgentFormData } from "@fishbowl-ai/ui-shared";
import { expect, test } from "@playwright/test";
import { promises as fs } from "fs";
import path from "path";
import {
  // UI helpers
  clickAddAgentButton,
  clickAddButtonInModal,
  createMockAgentData,
  // Settings helpers
  createTestAgent,
  // Database helpers
  queryConversationAgents,
  queryConversations,
  selectAgentInModal,
  setupConversationAgentTest,
  // Setup helpers
  setupConversationAgentTestSuite,
  verifyAgentPillExists,
  waitForAddAgentModal,
} from "../../helpers";
import type { TestElectronApplication } from "../../helpers/TestElectronApplication";
import type { TestWindow } from "../../helpers/TestWindow";

interface MockAgentData extends AgentFormData {
  id: string;
}

/**
 * Helper to create an agent and get its ID from the agents.json file
 */
const createAgentWithId = async (
  window: TestWindow,
  electronApp: TestElectronApplication,
  agentData: AgentFormData,
): Promise<MockAgentData> => {
  const filledAgentData = await createTestAgent(window, agentData);

  // Get the real agent ID from the agents.json file
  const userDataPath = await electronApp.evaluate(async ({ app }) => {
    return app.getPath("userData");
  });
  const agentsConfigPath = path.join(userDataPath, "agents.json");

  // Wait for file to be written and retry a few times
  let agentsJsonData: { agents: Array<{ name: string; id: string }> };
  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts) {
    try {
      await window.waitForTimeout(500);
      const agentsContent = await fs.readFile(agentsConfigPath, "utf-8");
      agentsJsonData = JSON.parse(agentsContent) as {
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

  const savedAgent = agentsJsonData!.agents.find(
    (agent: { name: string }) => agent.name === filledAgentData.name,
  );

  if (!savedAgent || !savedAgent.id) {
    console.log(
      "🔍 Available agents:",
      JSON.stringify(agentsJsonData!.agents, null, 2),
    );
    console.log("🔍 Looking for agent name:", filledAgentData.name);
    throw new Error(
      `Could not find saved agent with name ${filledAgentData.name}. Available agents: ${agentsJsonData!.agents.map((a) => a.name).join(", ")}`,
    );
  }

  return {
    ...filledAgentData,
    id: savedAgent.id,
  };
};

test.describe("Feature: Multi-Conversation Agent Management", () => {
  const testSuite = setupConversationAgentTestSuite();

  test.describe("Scenario 1: Agent Reuse Across Multiple Conversations", () => {
    test("allows same agent to be added to multiple conversations", async () => {
      // Given - Setup first conversation with agent
      const window = testSuite.getWindow();
      const electronApp = testSuite.getElectronApp();

      const { agent, conversationId: firstConversationId } =
        await setupConversationAgentTest(window, electronApp);

      // Add agent to first conversation
      await clickAddAgentButton(window);
      await waitForAddAgentModal(window, true);
      await selectAgentInModal(window, agent.name);
      await clickAddButtonInModal(window);
      await waitForAddAgentModal(window, false);
      await verifyAgentPillExists(window, agent.name);

      // Create second conversation
      const newConversationButton = window.locator(
        '[data-testid="new-conversation-button"]',
      );
      await newConversationButton.click();
      await expect(newConversationButton).toHaveText("New Conversation", {
        timeout: 10000,
      });

      // Get second conversation ID
      const allConversations = await queryConversations(electronApp);
      expect(allConversations).toHaveLength(2);
      const secondConversationId = allConversations[0]!.id;

      // Add same agent to second conversation (should now be the active conversation)
      await clickAddAgentButton(window);
      await waitForAddAgentModal(window, true);
      await selectAgentInModal(window, agent.name);
      await clickAddButtonInModal(window);
      await waitForAddAgentModal(window, false);
      await verifyAgentPillExists(window, agent.name);

      // Then - Verify database contains separate records for same agent in different conversations
      const allConversationAgents = await queryConversationAgents(electronApp);
      console.log(
        "🔍 All conversation agents:",
        JSON.stringify(allConversationAgents, null, 2),
      );
      expect(allConversationAgents).toHaveLength(2);

      // Verify first conversation has the agent
      const conv1Agents = await queryConversationAgents(
        electronApp,
        firstConversationId,
      );
      console.log("🔍 Conv1 agents:", JSON.stringify(conv1Agents, null, 2));
      console.log("🔍 First conversation ID:", firstConversationId);
      expect(conv1Agents).toHaveLength(1);
      expect(conv1Agents[0]!.agent_id).toBe(agent.id);

      // Verify second conversation also has the same agent
      const conv2Agents = await queryConversationAgents(
        electronApp,
        secondConversationId,
      );
      console.log("🔍 Conv2 agents:", JSON.stringify(conv2Agents, null, 2));
      console.log("🔍 Second conversation ID:", secondConversationId);
      expect(conv2Agents).toHaveLength(1);
      expect(conv2Agents[0]!.agent_id).toBe(agent.id);

      // Log the IDs we're comparing
      console.log("🔍 Conv1 record ID:", conv1Agents[0]!.id);
      console.log("🔍 Conv2 record ID:", conv2Agents[0]!.id);
      console.log("🔍 Agent ID:", agent.id);

      // Verify they are separate database records
      expect(conv1Agents[0]!.id).not.toBe(conv2Agents[0]!.id);
    });
  });

  test.describe("Scenario 2: No Available Agents State", () => {
    test("shows no available agents when only agent is already added to conversation", async () => {
      // Given - Setup conversation with the only available agent already added
      const window = testSuite.getWindow();
      const electronApp = testSuite.getElectronApp();

      const { agent, conversationId } = await setupConversationAgentTest(
        window,
        electronApp,
      );

      // Add the agent to conversation
      await clickAddAgentButton(window);
      await waitForAddAgentModal(window, true);
      await selectAgentInModal(window, agent.name);
      await clickAddButtonInModal(window);
      await waitForAddAgentModal(window, false);
      await verifyAgentPillExists(window, agent.name);

      // Verify the agent was added to database
      const conversationAgents = await queryConversationAgents(
        electronApp,
        conversationId,
      );
      expect(conversationAgents).toHaveLength(1);
      expect(conversationAgents[0]!.agent_id).toBe(agent.id);

      // When - Try to open add agent modal again
      await clickAddAgentButton(window);

      // Modal should open but show "No available agents" message instead of select
      const modal = window.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Then - Modal should show "No available agents to add" message
      const noAgentsMessage = window.locator(
        'text="No available agents to add"',
      );
      await expect(noAgentsMessage).toBeVisible();

      // Verify there is no select dropdown (no agents available)
      const selectTrigger = window.locator(
        '[data-slot="select-trigger"][aria-label="Select agent to add"]',
      );
      await expect(selectTrigger).not.toBeVisible();

      // Verify no role="option" elements exist
      const availableOptions = window.locator('[role="option"]');
      const optionCount = await availableOptions.count();
      expect(optionCount).toBe(0);
    });
  });

  test.describe("Scenario 3: Conversation Switching Updates Agent Display", () => {
    test("displays conversation-specific agents when switching between conversations", async () => {
      // Given - Setup first conversation with first agent
      const window = testSuite.getWindow();
      const electronApp = testSuite.getElectronApp();

      const { agent: agent1, conversationId: conv1Id } =
        await setupConversationAgentTest(window, electronApp);

      // Add agent to first conversation
      await clickAddAgentButton(window);
      await waitForAddAgentModal(window, true);
      await selectAgentInModal(window, agent1.name);
      await clickAddButtonInModal(window);
      await waitForAddAgentModal(window, false);
      await verifyAgentPillExists(window, agent1.name);

      // Create second agent in settings
      await window.evaluate(() => {
        window.testHelpers?.openSettingsModal();
      });
      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).toBeVisible({ timeout: 5000 });

      // Create second agent using "Create New Agent" button
      const createNewAgentButton = window
        .locator("button")
        .filter({ hasText: "Create New Agent" });
      await expect(createNewAgentButton).toBeVisible({ timeout: 5000 });
      await createNewAgentButton.click();

      const agent2Data = createMockAgentData({ name: "Code Reviewer" });
      const agent2 = await createAgentWithId(window, electronApp, agent2Data);

      // Exit settings
      await window.evaluate(() => {
        if (window.testHelpers?.isSettingsModalOpen()) {
          window.testHelpers!.closeSettingsModal();
        }
      });
      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).not.toBeVisible({ timeout: 5000 });

      // Create second conversation
      const newConversationButton = window.locator(
        '[data-testid="new-conversation-button"]',
      );
      await newConversationButton.click();
      await expect(newConversationButton).toHaveText("New Conversation", {
        timeout: 10000,
      });

      // Add different agent to second conversation
      await clickAddAgentButton(window);
      await waitForAddAgentModal(window, true);
      await selectAgentInModal(window, agent2.name);
      await clickAddButtonInModal(window);
      await waitForAddAgentModal(window, false);
      await verifyAgentPillExists(window, agent2.name);

      // Get conversation data for switching
      const allConversations = await queryConversations(electronApp);
      expect(allConversations).toHaveLength(2);
      const conv2Id = allConversations[0]!.id;

      console.log(
        "Conversation titles:",
        allConversations.map((c) => c.title),
      );

      // When - Switch back to first conversation by clicking on it in sidebar
      const firstConvItem = window.locator(
        `[data-testid="conversation-item-${conv1Id}"]`,
      );
      await expect(firstConvItem).toBeVisible({ timeout: 5000 });
      await firstConvItem.click();
      await window.waitForTimeout(1000); // Wait for UI to update

      // Then - Should show agent1 only
      await verifyAgentPillExists(window, agent1.name);
      const agent2Pill = window.locator(`[data-agent-name*="${agent2.name}"]`);
      await expect(agent2Pill).not.toBeVisible();

      // When - Switch to second conversation
      const secondConvItem = window.locator(
        `[data-testid="conversation-item-${conv2Id}"]`,
      );
      await expect(secondConvItem).toBeVisible({ timeout: 5000 });
      await secondConvItem.click();
      await window.waitForTimeout(1000); // Wait for UI to update

      // Then - Should show agent2 only
      await verifyAgentPillExists(window, agent2.name);
      const agent1Pill = window.locator(`[data-agent-name*="${agent1.name}"]`);
      await expect(agent1Pill).not.toBeVisible();

      // Verify database integrity
      const conv1Agents = await queryConversationAgents(electronApp, conv1Id);
      expect(conv1Agents).toHaveLength(1);
      expect(conv1Agents[0]!.agent_id).toBe(agent1.id);

      const conv2Agents = await queryConversationAgents(electronApp, conv2Id);
      expect(conv2Agents).toHaveLength(1);
      expect(conv2Agents[0]!.agent_id).toBe(agent2.id);
    });
  });
});
