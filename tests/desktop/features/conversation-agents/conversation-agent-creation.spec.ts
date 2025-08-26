import { expect, test } from "@playwright/test";
import {
  // Setup helpers
  setupConversationAgentTestSuite,
  setupConversationAgentTest,

  // UI helpers
  clickAddAgentButton,
  waitForAddAgentModal,
  selectAgentInModal,
  verifyAgentPillExists,
  waitForAgentInConversationDisplay,
  clickAddButtonInModal,

  // Database helpers
  queryConversationAgents,
} from "../../helpers";

test.describe("Feature: Conversation Agent Creation - Happy Path", () => {
  const testSuite = setupConversationAgentTestSuite();

  test.describe("Scenario 1: Basic Agent Addition to Conversation", () => {
    test("adds agent to conversation via UI and verifies database persistence", async () => {
      // Given - Complete conversation agent test setup (LLM + Agent + Conversation)
      const window = testSuite.getWindow();
      const electronApp = testSuite.getElectronApp();

      const { agent, conversationId } = await setupConversationAgentTest(
        window,
        electronApp,
      );

      // Verify no agents are associated with conversation initially
      const initialAgents = await queryConversationAgents(
        electronApp,
        conversationId,
      );
      expect(initialAgents).toHaveLength(0);

      // When - User adds agent to conversation via UI
      await clickAddAgentButton(window);
      await waitForAddAgentModal(window, true);
      await selectAgentInModal(window, agent.name);
      await clickAddButtonInModal(window);

      // Wait for modal to close
      await waitForAddAgentModal(window, false);

      // Then - Agent pill appears in UI
      await verifyAgentPillExists(window, agent.name);
      await waitForAgentInConversationDisplay(window, agent.name);

      // And - Database contains conversation_agents record
      const conversationAgents = await queryConversationAgents(
        electronApp,
        conversationId,
      );
      expect(conversationAgents).toHaveLength(1);

      // And - Record has correct conversation_id and agent_id relationship
      const agentRecord = conversationAgents[0]!;
      expect(agentRecord.conversation_id).toBe(conversationId);
      expect(agentRecord.agent_id).toBe(agent.id);
      expect(agentRecord.is_active).toBe(1);
      expect(agentRecord.display_order).toBe(0);
      expect(agentRecord.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
      expect(agentRecord.added_at).toBeTruthy();

      // Verify timestamps are valid dates
      expect(new Date(agentRecord.added_at).getTime()).toBeGreaterThan(0);
    });
  });
});
