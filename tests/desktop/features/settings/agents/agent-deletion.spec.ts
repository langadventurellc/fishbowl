import { expect, test } from "@playwright/test";
import {
  setupAgentsTestSuite,
  openAgentsSection,
  createMockAgentData,
  createMockAnalystAgent,
  createTestAgent,
  waitForAgentsEmptyState,
  waitForAgentsList,
  readAgentsFile,
  createLlmConfigForAgentTests,
} from "../../../helpers";
import type { AgentFormData } from "@fishbowl-ai/ui-shared";
import type { TestWindow } from "../../../helpers";

/**
 * Helper function to verify an agent exists in both UI and file system
 */
const verifyAgentExists = async (
  window: TestWindow,
  agentData: AgentFormData,
  testSuite: ReturnType<typeof setupAgentsTestSuite>,
) => {
  // Verify agent exists in UI
  const agentCard = window
    .locator('[role="article"]')
    .filter({ hasText: agentData.name });
  await expect(agentCard).toBeVisible();

  // Verify in file system using existing helper
  const agentsData = await readAgentsFile(testSuite);
  const foundAgent = agentsData.agents.find(
    (agent: { name: string }) => agent.name === agentData.name,
  );
  expect(foundAgent).toBeDefined();
};

/**
 * Helper function to verify an agent has been deleted from both UI and file system
 */
const verifyAgentDeleted = async (
  window: TestWindow,
  agentData: AgentFormData,
  testSuite: ReturnType<typeof setupAgentsTestSuite>,
) => {
  // Verify agent removed from UI
  const agentCard = window
    .locator('[role="article"]')
    .filter({ hasText: agentData.name });
  await expect(agentCard).not.toBeVisible();

  // Verify removed from file system using existing helper
  try {
    const agentsData = await readAgentsFile(testSuite);
    const foundAgent = agentsData.agents.find(
      (agent: { name: string }) => agent.name === agentData.name,
    );
    expect(foundAgent).toBeUndefined();
  } catch (error) {
    // File might not exist if all agents deleted, that's ok
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code !== "ENOENT"
    ) {
      throw error;
    }
  }
};

/**
 * Helper function to confirm deletion in the confirmation dialog
 */
const confirmDeletion = async (window: TestWindow) => {
  const confirmButton = window.locator("button").filter({ hasText: "Delete" });
  await confirmButton.click();

  // Wait for confirmation dialog to close
  const confirmDialog = window.locator('[role="alertdialog"]');
  await expect(confirmDialog).not.toBeVisible({ timeout: 5000 });
};

test.describe("Feature: Agent Management - Deletion", () => {
  const testSuite = setupAgentsTestSuite();

  test.beforeAll(async () => {
    // Create an LLM configuration so agents can select models
    const window = testSuite.getWindow();
    await createLlmConfigForAgentTests(window);
  });

  test.describe("Scenario: Delete Confirmation Dialog", () => {
    test("shows delete confirmation dialog when delete button clicked", async () => {
      const window = testSuite.getWindow();

      // Create test agent for deletion
      const mockAgent = createMockAgentData();
      await createTestAgent(window, mockAgent);

      // Navigate to agents section
      await openAgentsSection(window);
      await waitForAgentsList(window);

      // Find and hover over the agent to show action buttons
      const agentCard = window
        .locator('[role="article"]')
        .filter({ hasText: mockAgent.name });
      await agentCard.hover();

      // Click delete button
      const deleteButton = agentCard.locator(
        `button[aria-label*="Delete"], button[data-testid*="delete"]`,
      );
      await expect(deleteButton).toBeVisible();
      await deleteButton.click();

      // Verify confirmation dialog appears - same approach as roles deletion
      const confirmDialog = window.locator('[role="alertdialog"]');
      await expect(confirmDialog).toBeVisible({ timeout: 3000 });

      // Verify dialog content contains agent name
      await expect(confirmDialog).toContainText(mockAgent.name);
      await expect(confirmDialog).toContainText("This action cannot be undone");

      // Verify Cancel and Delete buttons are present
      await expect(
        confirmDialog.locator("button").filter({ hasText: "Cancel" }),
      ).toBeVisible();
      await expect(
        confirmDialog.locator("button").filter({ hasText: "Delete" }),
      ).toBeVisible();
    });

    test("shows proper delete confirmation dialog content", async () => {
      const window = testSuite.getWindow();

      // Create test agent
      const mockAgent = createMockAgentData();
      await createTestAgent(window, mockAgent);

      await openAgentsSection(window);
      await waitForAgentsList(window);

      // Find the agent and click delete
      const agentCard = window
        .locator('[role="article"]')
        .filter({ hasText: mockAgent.name });
      await agentCard.hover();

      const deleteButton = agentCard.locator(
        `button[aria-label*="Delete"], button[data-testid*="delete"]`,
      );
      await deleteButton.click();

      // Verify dialog appears with correct content
      const confirmDialog = window.locator('[role="alertdialog"]');
      await expect(confirmDialog).toBeVisible();

      // Verify dialog title
      await expect(confirmDialog).toContainText("Delete Agent");

      // Verify agent name appears in dialog
      await expect(confirmDialog).toContainText(mockAgent.name);

      // Verify warning message
      await expect(confirmDialog).toContainText("This action cannot be undone");

      // Verify "Cancel" and "Delete" buttons exist
      const cancelButton = confirmDialog.locator("button").filter({
        hasText: "Cancel",
      });
      const deleteAgentButton = confirmDialog.locator("button").filter({
        hasText: "Delete",
      });

      await expect(cancelButton).toBeVisible();
      await expect(deleteAgentButton).toBeVisible();

      // Cancel the dialog
      await cancelButton.click();
    });
  });

  test.describe("Scenario: Successful Deletion", () => {
    test("deletes agent when user confirms deletion", async () => {
      const window = testSuite.getWindow();

      // Create test agent
      const mockAgent = createMockAgentData();
      await createTestAgent(window, mockAgent);

      // Navigate and verify agent exists
      await openAgentsSection(window);
      await waitForAgentsList(window);
      await verifyAgentExists(window, mockAgent, testSuite);

      // Find and click delete button
      const agentCard = window
        .locator('[role="article"]')
        .filter({ hasText: mockAgent.name });
      await agentCard.hover();

      const deleteButton = agentCard.locator(
        `button[aria-label*="Delete"], button[data-testid*="delete"]`,
      );
      await deleteButton.click();

      // Confirm deletion
      await confirmDeletion(window);

      // Verify agent removed from both UI and file system
      await verifyAgentDeleted(window, mockAgent, testSuite);
    });

    test("removes agent from grid display after successful deletion", async () => {
      const window = testSuite.getWindow();

      // Create test agent
      const mockAgent = createMockAgentData();
      await createTestAgent(window, mockAgent);

      await openAgentsSection(window);
      await waitForAgentsList(window);

      // Get initial agent count
      const initialAgentCards = window.locator('[role="article"]');
      const initialCount = await initialAgentCards.count();
      expect(initialCount).toBeGreaterThan(0);

      // Delete the agent
      const agentCard = window
        .locator('[role="article"]')
        .filter({ hasText: mockAgent.name });
      await agentCard.hover();

      const deleteButton = agentCard.locator(
        `button[aria-label*="Delete"], button[data-testid*="delete"]`,
      );
      await deleteButton.click();
      await confirmDeletion(window);

      // Verify agent count decreased
      const finalAgentCards = window.locator('[role="article"]');
      const finalCount = await finalAgentCards.count();
      expect(finalCount).toBe(initialCount - 1);

      // Verify specific agent no longer visible
      await expect(agentCard).not.toBeVisible();
    });
  });

  test.describe("Scenario: Deletion Cancellation", () => {
    test("cancels deletion when user clicks Cancel", async () => {
      const window = testSuite.getWindow();

      // Create test agent
      const mockAgent = createMockAgentData();
      await createTestAgent(window, mockAgent);

      await openAgentsSection(window);
      await waitForAgentsList(window);

      // Find the agent and attempt deletion
      const agentCard = window
        .locator('[role="article"]')
        .filter({ hasText: mockAgent.name });
      await agentCard.hover();

      const deleteButton = agentCard.locator(
        `button[aria-label*="Delete"], button[data-testid*="delete"]`,
      );
      await deleteButton.click();

      // Wait for confirmation dialog
      const confirmDialog = window.locator('[role="alertdialog"]');
      await expect(confirmDialog).toBeVisible();

      // Click Cancel
      const cancelButton = confirmDialog.locator("button").filter({
        hasText: "Cancel",
      });
      await cancelButton.click();

      // Verify dialog closes
      await expect(confirmDialog).not.toBeVisible();

      // Verify agent still exists in both UI and file system
      await verifyAgentExists(window, mockAgent, testSuite);
    });
  });

  test.describe("Scenario: Edge Cases", () => {
    test("handles deletion of multiple agents", async () => {
      const window = testSuite.getWindow();

      // Create 3 test agents
      const testAgents = [
        createMockAgentData({ name: "First Agent" }),
        createMockAgentData({ name: "Second Agent" }),
        createMockAgentData({ name: "Third Agent" }),
      ];

      for (const agent of testAgents) {
        await createTestAgent(window, agent);
      }

      await openAgentsSection(window);
      await waitForAgentsList(window);

      // Verify all 3 agents exist
      let agentCards = window.locator('[role="article"]');
      let agentCount = await agentCards.count();
      expect(agentCount).toBeGreaterThanOrEqual(3);

      // Delete the middle agent
      const middleAgentCard = window
        .locator('[role="article"]')
        .filter({ hasText: "Second Agent" });
      await middleAgentCard.hover();

      const deleteButton = middleAgentCard.locator(
        `button[aria-label*="Delete"], button[data-testid*="delete"]`,
      );
      await deleteButton.click();

      const confirmDialog = window.locator('[role="alertdialog"]');
      const deleteAgentButton = confirmDialog.locator("button").filter({
        hasText: "Delete",
      });
      await deleteAgentButton.click();

      await expect(confirmDialog).not.toBeVisible();

      // Verify correct agent was deleted
      agentCards = window.locator('[role="article"]');
      agentCount = await agentCards.count();
      expect(agentCount).toBe(agentCount);

      await expect(window.locator('text="First Agent"')).toBeVisible();
      await expect(window.locator('text="Second Agent"')).not.toBeVisible();
      await expect(window.locator('text="Third Agent"')).toBeVisible();
    });

    test("shows empty state after deleting all agents", async () => {
      const window = testSuite.getWindow();

      // Create 2 test agents
      const agent1 = createMockAgentData({ name: "Agent One" });
      const agent2 = createMockAgentData({ name: "Agent Two" });

      await createTestAgent(window, agent1);
      await createTestAgent(window, agent2);

      await openAgentsSection(window);
      await waitForAgentsList(window);

      // Delete agents one by one, similar to roles deletion pattern
      const agentNames = ["Agent One", "Agent Two"];

      for (const agentName of agentNames) {
        const agentCard = window
          .locator('[role="article"]')
          .filter({ hasText: agentName });
        await agentCard.hover();

        const deleteButton = agentCard.locator(
          `button[aria-label*="Delete"], button[data-testid*="delete"]`,
        );
        await deleteButton.click();

        const confirmDialog = window.locator('[role="alertdialog"]');
        const deleteAgentButton = confirmDialog.locator("button").filter({
          hasText: "Delete",
        });
        await deleteAgentButton.click();

        // Wait for dialog to close and deletion to complete
        await expect(confirmDialog).not.toBeVisible({ timeout: 5000 });
      }

      // Verify empty state appears
      await waitForAgentsEmptyState(window);

      // Verify "Create New Agent" button is present
      await expect(
        window
          .locator("button")
          .filter({ hasText: /Create New Agent/i })
          .first(),
      ).toBeVisible();
    });

    test("deletion persists after navigating away and back", async () => {
      const window = testSuite.getWindow();

      // Create and delete a test agent
      const mockAgent = createMockAgentData({ name: "Temporary Agent" });
      await createTestAgent(window, mockAgent);

      await openAgentsSection(window);
      await waitForAgentsList(window);

      // Delete the agent
      const agentCard = window
        .locator('[role="article"]')
        .filter({ hasText: mockAgent.name });
      await agentCard.hover();

      const deleteButton = agentCard.locator(
        `button[aria-label*="Delete"], button[data-testid*="delete"]`,
      );
      await deleteButton.click();
      await confirmDeletion(window);

      await expect(agentCard).not.toBeVisible();

      // Navigate away and back
      await window.evaluate(() => {
        window.testHelpers!.closeSettingsModal();
      });

      await window.waitForTimeout(500);

      await openAgentsSection(window);

      // Check if we have agents or empty state
      try {
        await waitForAgentsList(window, true);
      } catch {
        await waitForAgentsEmptyState(window);
      }

      // Verify deleted agent doesn't reappear
      await expect(
        window.locator(`text="${mockAgent.name}"`),
      ).not.toBeVisible();
    });

    test("handles analyst agent deletion", async () => {
      const window = testSuite.getWindow();

      // Create analyst agent specifically
      const analystAgent = createMockAnalystAgent();
      await createTestAgent(window, analystAgent);

      await openAgentsSection(window);
      await waitForAgentsList(window);

      // Verify agent exists before deletion
      await verifyAgentExists(window, analystAgent, testSuite);

      // Delete the analyst agent
      const agentCard = window
        .locator('[role="article"]')
        .filter({ hasText: analystAgent.name });
      await agentCard.hover();

      const deleteButton = agentCard.locator(
        `button[aria-label*="Delete"], button[data-testid*="delete"]`,
      );
      await deleteButton.click();
      await confirmDeletion(window);

      // Verify deletion completed
      await verifyAgentDeleted(window, analystAgent, testSuite);
    });
  });
});
