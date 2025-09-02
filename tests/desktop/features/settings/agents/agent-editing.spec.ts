import { expect, test } from "@playwright/test";
import {
  setupAgentsTestSuite,
  openAgentsSection,
  createMockAgentData,
  waitForAgentModal,
  waitForAgentsList,
  createTestAgent,
  verifyAgentPersistence,
  createLlmConfigForAgentTests,
} from "../../../helpers";
import type { AgentFormData } from "@fishbowl-ai/ui-shared";
import type { TestWindow } from "../../../helpers/TestWindow";

test.describe("Feature: Agent Management - Editing", () => {
  const testSuite = setupAgentsTestSuite();

  test.beforeAll(async () => {
    // Create an LLM configuration so agents can select models
    const window = testSuite.getWindow();
    await createLlmConfigForAgentTests(window);
  });

  test.describe("Scenario: Edit Modal Opening", () => {
    test("opens edit modal from agent card", async () => {
      const window = testSuite.getWindow();

      // Create initial agent for editing
      const mockAgent = createMockAgentData();
      await createTestAgent(window, mockAgent);

      // Navigate to agents section
      await openAgentsSection(window);
      await waitForAgentsList(window, true);

      // Find agent card and click edit button
      const agentCard = window.locator('[role="article"]').first();
      await agentCard.hover();

      const editButton = agentCard.locator('button[aria-label*="Edit"]');
      await expect(editButton).toBeVisible();
      await editButton.click();

      // Verify edit modal opens
      await waitForAgentModal(window, true);

      // Verify modal shows edit content
      const modal = window.locator('[role="dialog"]');
      await expect(
        modal.getByRole("heading", { name: "Edit Agent" }),
      ).toBeVisible();
    });
  });

  test.describe("Scenario: Data Updates", () => {
    test("updates agent name successfully", async () => {
      const window = testSuite.getWindow();

      // Create initial agent
      const mockAgent = createMockAgentData();
      const originalAgent = await createTestAgent(window, mockAgent);

      // Open edit modal
      await openAgentsSection(window);
      await waitForAgentsList(window, true);

      const agentCard = window.locator('[role="article"]').first();
      await agentCard.hover();
      const editButton = agentCard.locator('button[aria-label*="Edit"]');
      await editButton.click();
      await waitForAgentModal(window, true);

      // Update agent name
      const newName = `Updated Agent Name ${Date.now()}`;
      await updateAgentData(window, { name: newName });

      // Save changes
      const saveButton = window
        .locator("button")
        .filter({ hasText: /Save Changes/i });
      await expect(saveButton).toBeEnabled();
      await saveButton.click();
      await waitForAgentModal(window, false);

      // Wait for save to complete (potential race condition)
      await window.waitForTimeout(1000);

      // Verify updates in UI
      const updatedCard = window
        .locator('[role="article"]')
        .filter({ hasText: newName });
      await expect(updatedCard).toBeVisible({ timeout: 5000 });

      // Verify persistence using actual agent data (not mock data)
      const { readAgentsFile } = await import("../../../helpers");
      const agentsData = await readAgentsFile(testSuite);
      const updatedAgent = agentsData.agents.find(
        (agent: AgentFormData) => agent.name === newName,
      );
      expect(updatedAgent).toBeDefined();
      expect(updatedAgent?.name).toBe(newName);
      // Verify original agent data still matches (except for name)
      expect(updatedAgent?.model).toBe(originalAgent.model);
      expect(updatedAgent?.role).toBe(originalAgent.role);
      expect(updatedAgent?.personality).toBe(originalAgent.personality);
    });

    test("pre-populates form with existing agent data", async () => {
      const window = testSuite.getWindow();

      // Create agent with specific data
      const mockAgent = createMockAgentData({
        name: "Pre-populated Test Agent",
        systemPrompt: "Custom system prompt for testing pre-population",
      });
      const testAgent = await createTestAgent(window, mockAgent);

      // Open edit modal
      await openAgentsSection(window);
      await waitForAgentsList(window, true);

      // Find the specific agent we just created by name
      const agentCard = window
        .locator('[role="article"]')
        .filter({ hasText: testAgent.name });
      await agentCard.hover();
      const editButton = agentCard.locator('button[aria-label*="Edit"]');
      await editButton.click();
      await waitForAgentModal(window, true);

      // Verify form fields are pre-populated
      await verifyFormPopulation(window, testAgent);
    });

    test("updates multiple fields successfully", async () => {
      const window = testSuite.getWindow();

      // Create initial agent
      const mockAgent = createMockAgentData();
      const originalAgent = await createTestAgent(window, mockAgent);

      // Open edit modal
      await openAgentsSection(window);
      await waitForAgentsList(window, true);

      const agentCard = window.locator('[role="article"]').first();
      await agentCard.hover();
      const editButton = agentCard.locator('button[aria-label*="Edit"]');
      await editButton.click();
      await waitForAgentModal(window, true);

      // Update multiple fields
      const updates = {
        name: `Multi-Update Agent ${Date.now()}`,
        systemPrompt: "Updated system prompt for multi-field test",
      };
      await updateAgentData(window, updates);

      // Save changes
      const saveButton = window
        .locator("button")
        .filter({ hasText: /Save Changes/i });
      await saveButton.click();
      await waitForAgentModal(window, false);

      // Wait for save to complete (potential race condition)
      await window.waitForTimeout(1000);

      // Verify all updates persist
      await verifyAgentUpdated(window, originalAgent, updates, testSuite);
    });
  });

  test.describe("Scenario: Edit Validation", () => {
    test("validates required fields during edit", async () => {
      const window = testSuite.getWindow();

      // Create agent for editing
      const mockAgent = createMockAgentData();
      await createTestAgent(window, mockAgent);

      // Open edit modal
      await openAgentsSection(window);
      await waitForAgentsList(window, true);

      const agentCard = window.locator('[role="article"]').first();
      await agentCard.hover();
      const editButton = agentCard.locator('button[aria-label*="Edit"]');
      await editButton.click();
      await waitForAgentModal(window, true);

      const saveButton = window
        .locator("button")
        .filter({ hasText: /Save Changes/i });

      // Clear required name field → can't save
      const nameInput = window.locator('input[name="name"]');
      await nameInput.clear();
      await expect(saveButton).toBeDisabled();

      // Restore valid name → can save
      await nameInput.fill("Valid Agent Name");
      await expect(saveButton).toBeEnabled();
    });
  });

  test.describe("Scenario: Cancel and Discard", () => {
    test("cancels edit without saving changes", async () => {
      const window = testSuite.getWindow();

      // Create initial agent with "Name A"
      const mockAgent = createMockAgentData({
        name: "Original Agent Name",
      });
      const originalAgent = await createTestAgent(window, mockAgent);

      // Open edit modal and make changes
      await openAgentsSection(window);
      await waitForAgentsList(window, true);

      const agentCard = window.locator('[role="article"]').first();
      await agentCard.hover();
      const editButton = agentCard.locator('button[aria-label*="Edit"]');
      await editButton.click();
      await waitForAgentModal(window, true);

      // Make changes
      await updateAgentData(window, { name: "Changed Name" });

      // Cancel edit
      const cancelButton = window
        .locator('[role="dialog"]')
        .locator("button")
        .filter({ hasText: "Cancel" })
        .and(window.locator('button[type="button"]:not([data-testid])'));
      await expect(cancelButton).toBeVisible();
      await cancelButton.click();

      // Handle potential unsaved changes dialog
      await handleUnsavedChangesDialog(window);

      await waitForAgentModal(window, false);

      // Verify original name is still displayed
      const originalCard = window
        .locator('[role="article"]')
        .filter({ hasText: originalAgent.name });
      await expect(originalCard).toBeVisible();

      // Verify changes weren't persisted
      await verifyAgentPersistence(window, originalAgent, testSuite);
    });

    test("handles escape key to cancel edit", async () => {
      const window = testSuite.getWindow();

      // Create agent for testing
      const mockAgent = createMockAgentData();
      const originalAgent = await createTestAgent(window, mockAgent);

      // Open edit modal
      await openAgentsSection(window);
      await waitForAgentsList(window, true);

      const agentCard = window.locator('[role="article"]').first();
      await agentCard.hover();
      const editButton = agentCard.locator('button[aria-label*="Edit"]');
      await editButton.click();
      await waitForAgentModal(window, true);

      // Make changes
      await updateAgentData(window, { name: "Escape Test Name" });

      // Press escape to cancel
      await window.keyboard.press("Escape");

      // Handle potential unsaved changes dialog
      await handleUnsavedChangesDialog(window);

      await waitForAgentModal(window, false);

      // Verify original data unchanged
      const originalCard = window
        .locator('[role="article"]')
        .filter({ hasText: originalAgent.name });
      await expect(originalCard).toBeVisible();
    });
  });
});

// Helper Functions

const verifyFormPopulation = async (
  window: TestWindow,
  expectedData: AgentFormData,
) => {
  // Verify name field shows expected value
  const nameInput = window.locator('input[name="name"]');
  await expect(nameInput).toHaveValue(expectedData.name);

  // Verify system prompt if provided
  if (expectedData.systemPrompt) {
    const systemPromptTextarea = window.locator(
      'textarea[name="systemPrompt"]',
    );
    await expect(systemPromptTextarea).toHaveValue(expectedData.systemPrompt);
  }

  // Note: Model, role, and personality dropdowns are pre-selected but checking
  // the exact values requires more complex dropdown state verification
};

const updateAgentData = async (
  window: TestWindow,
  updates: Partial<AgentFormData>,
) => {
  // Helper to update specific fields in edit form
  if (updates.name) {
    const nameInput = window.locator('input[name="name"]');
    await nameInput.clear();
    await nameInput.fill(updates.name);
  }

  if (updates.systemPrompt) {
    const systemPromptTextarea = window.locator(
      'textarea[name="systemPrompt"]',
    );
    await systemPromptTextarea.clear();
    await systemPromptTextarea.fill(updates.systemPrompt);
  }

  // Small delay for form state to update
  await window.waitForTimeout(100);
};

const verifyAgentUpdated = async (
  window: TestWindow,
  originalData: AgentFormData,
  updates: Partial<AgentFormData>,
  testSuite: ReturnType<typeof setupAgentsTestSuite>,
) => {
  // Verify agent card shows updated information
  const expectedData = { ...originalData, ...updates };

  if (updates.name) {
    const agentCard = window
      .locator('[role="article"]')
      .filter({ hasText: expectedData.name });
    await expect(agentCard).toBeVisible();
  }

  // Verify file system persistence using existing helper
  await verifyAgentPersistence(window, expectedData, testSuite);
};

const handleUnsavedChangesDialog = async (window: TestWindow) => {
  // Handle potential unsaved changes confirmation dialog
  try {
    // Wait a moment for dialog to appear
    await window.waitForTimeout(500);

    const confirmDialog = window
      .locator('[role="dialog"], [role="alertdialog"]')
      .filter({
        has: window.locator('text="Unsaved Changes"'),
      });

    await expect(confirmDialog).toBeVisible({ timeout: 2000 });

    // Look for the exact button text we expect
    const discardButton = confirmDialog.locator("button").filter({
      hasText: "Close Without Saving",
    });

    // Ensure button is visible and clickable
    await expect(discardButton).toBeVisible();
    await expect(discardButton).toBeEnabled();
    await discardButton.click();

    // Wait for dialog to disappear
    await expect(confirmDialog).not.toBeVisible({ timeout: 2000 });
  } catch (error) {
    // Log the error for debugging but continue
    console.log("No unsaved changes dialog or failed to handle:", error);
  }
};
