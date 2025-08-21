import type { AgentFormData } from "@fishbowl-ai/ui-shared";
import { expect, test } from "@playwright/test";
import { promises as fs } from "fs";
import {
  createLlmConfigForAgentTests,
  createMockAgentData,
  createMockAnalystAgent,
  createMockTechnicalAgent,
  openAgentsSection,
  setupAgentsTestSuite,
  waitForAgent,
  waitForAgentModal,
  waitForAgentsEmptyState,
  waitForAgentsList,
  type TestWindow,
} from "../../../helpers";

test.describe("Feature: Agent Management - Creation", () => {
  const testSuite = setupAgentsTestSuite();

  test.beforeAll(async () => {
    // Create an LLM configuration so agents can select models
    const window = testSuite.getWindow();
    await createLlmConfigForAgentTests(window);
  });

  test.describe("Scenario: Basic Agent Creation", () => {
    test("creates agent successfully with valid data", async () => {
      const window = testSuite.getWindow();

      // Navigate to agents section
      await openAgentsSection(window);

      // Wait for agents section to be ready (should show empty state initially)
      await waitForAgentsEmptyState(window);

      // Click create new agent button
      const createButton = window
        .locator("button")
        .filter({ hasText: /create.*agent/i });
      await createButton.click();

      // Wait for create modal to open
      await waitForAgentModal(window, true);

      // Fill form with valid agent data
      const mockAgent = createMockAgentData();
      const actualAgent = await fillAgentForm(window, mockAgent);

      // Submit form
      const saveButton = window
        .locator("button")
        .filter({ hasText: /create agent/i });
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      // Verify modal closes
      await waitForAgentModal(window, false);

      // Verify agent appears in grid (look for partial match since name has random ID)
      const agentCards = window.locator('[role="article"]');
      await expect(agentCards.first()).toBeVisible({ timeout: 5000 });

      // Verify an agent card contains our agent name (at least partial match)
      const agentCard = agentCards.filter({
        hasText: actualAgent.name.substring(0, 10),
      });
      await expect(agentCard).toBeVisible({ timeout: 3000 });

      // Verify agent data is persisted
      await verifyAgentPersistence(window, actualAgent, testSuite);
    });

    test("shows success message after agent creation", async () => {
      const window = testSuite.getWindow();

      await openAgentsSection(window);
      await waitForAgentsEmptyState(window);

      const createButton = window
        .locator("button")
        .filter({ hasText: /create.*agent/i });
      await createButton.click();
      await waitForAgentModal(window, true);

      const mockAgent = createMockAgentData();
      await fillAgentForm(window, mockAgent);

      const saveButton = window
        .locator("button")
        .filter({ hasText: /create agent/i });
      await saveButton.click();

      // Wait for success indication (modal closing is a success signal)
      await waitForAgentModal(window, false);

      // Verify agent appears in the list
      await waitForAgent(window, mockAgent.name);
    });
  });

  test.describe("Scenario: Agent Type Variations", () => {
    test("creates analyst agent successfully", async () => {
      const window = testSuite.getWindow();

      await openAgentsSection(window);
      await waitForAgentsEmptyState(window);

      const createButton = window
        .locator("button")
        .filter({ hasText: /create.*agent/i });
      await createButton.click();
      await waitForAgentModal(window, true);

      const mockAgent = createMockAnalystAgent();
      const actualAgent = await fillAgentForm(window, mockAgent);

      const saveButton = window
        .locator("button")
        .filter({ hasText: /create agent/i });
      await saveButton.click();

      await waitForAgentModal(window, false);
      await waitForAgent(window, actualAgent.name);
      await verifyAgentPersistence(window, actualAgent, testSuite);
    });

    test("creates technical agent successfully", async () => {
      const window = testSuite.getWindow();

      await openAgentsSection(window);
      await waitForAgentsEmptyState(window);

      const createButton = window
        .locator("button")
        .filter({ hasText: /create.*agent/i });
      await createButton.click();
      await waitForAgentModal(window, true);

      const mockAgent = createMockTechnicalAgent();
      const actualAgent = await fillAgentForm(window, mockAgent);

      const saveButton = window
        .locator("button")
        .filter({ hasText: /create agent/i });
      await saveButton.click();

      await waitForAgentModal(window, false);
      await waitForAgent(window, actualAgent.name);
      await verifyAgentPersistence(window, actualAgent, testSuite);
    });
  });

  test.describe("Scenario: Form State Management", () => {
    test("handles form state changes correctly during creation", async () => {
      const window = testSuite.getWindow();

      await openAgentsSection(window);
      await waitForAgentsEmptyState(window);

      const createButton = window
        .locator("button")
        .filter({ hasText: /create.*agent/i });
      await createButton.click();
      await waitForAgentModal(window, true);

      // Initially save button should be disabled (required fields empty)
      const saveButton = window
        .locator("button")
        .filter({ hasText: /create agent/i });
      await expect(saveButton).toBeDisabled();

      // Fill required fields one by one and check save button state
      const nameInput = window.locator("#agent-name");
      await nameInput.fill("Test Agent Name");
      await expect(saveButton).toBeDisabled(); // Still disabled, more required fields

      // Select model (required)
      const modelSelect = window.locator('[role="combobox"]').first();
      await modelSelect.click();
      await window.locator('[role="option"]').first().click();
      await expect(saveButton).toBeDisabled(); // Still disabled

      // Select role (required)
      const roleSelect = window.locator('[role="combobox"]').nth(1);
      await roleSelect.click();
      await window.locator('[role="option"]').first().click();
      await expect(saveButton).toBeDisabled(); // Still disabled

      // Select personality (required) - this should enable the save button
      const personalitySelect = window.locator('[role="combobox"]').nth(2);
      await personalitySelect.click();
      await window.locator('[role="option"]').first().click();

      // Now save button should be enabled
      await expect(saveButton).toBeEnabled();
    });
  });

  test.describe("Scenario: Data Persistence", () => {
    test("persists agent data to file system", async () => {
      const window = testSuite.getWindow();

      await openAgentsSection(window);
      await waitForAgentsEmptyState(window);

      const createButton = window
        .locator("button")
        .filter({ hasText: /create.*agent/i });
      await createButton.click();
      await waitForAgentModal(window, true);

      const mockAgent = createMockAgentData();
      const actualAgent = await fillAgentForm(window, mockAgent);

      const saveButton = window
        .locator("button")
        .filter({ hasText: /create agent/i });
      await saveButton.click();
      await waitForAgentModal(window, false);

      // Verify file system persistence
      const agentsConfigPath = testSuite.getAgentsConfigPath();

      // Wait for file to be created and written
      let agentsContent: string;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        try {
          agentsContent = await fs.readFile(agentsConfigPath, "utf-8");
          break;
        } catch (error) {
          if (attempts === maxAttempts - 1) {
            throw error;
          }
          await window.waitForTimeout(500);
          attempts++;
        }
      }

      const agentsData = JSON.parse(agentsContent!);

      expect(agentsData.agents).toBeDefined();
      expect(Array.isArray(agentsData.agents)).toBe(true);
      expect(agentsData.agents.length).toBeGreaterThan(0);

      // Find the agent we just created
      const savedAgent = agentsData.agents.find(
        (agent: { name: string }) => agent.name === actualAgent.name,
      );
      expect(savedAgent).toBeDefined();
      expect(savedAgent.name).toBe(actualAgent.name);
      expect(savedAgent.model).toBe(actualAgent.model);
      expect(savedAgent.role).toBe(actualAgent.role);
      expect(savedAgent.personality).toBe(actualAgent.personality);
      expect(savedAgent.systemPrompt).toBe(actualAgent.systemPrompt);
    });

    test("loads created agents after modal reopen", async () => {
      const window = testSuite.getWindow();

      await openAgentsSection(window);
      await waitForAgentsEmptyState(window);

      // Create first agent
      const createButton = window
        .locator("button")
        .filter({ hasText: /create.*agent/i });
      await createButton.click();
      await waitForAgentModal(window, true);

      const mockAgent = createMockAgentData();
      await fillAgentForm(window, mockAgent);

      const saveButton = window
        .locator("button")
        .filter({ hasText: /create agent/i });
      await saveButton.click();
      await waitForAgentModal(window, false);

      // Verify agent appears in list
      await waitForAgent(window, mockAgent.name);

      // Close settings modal and reopen to test persistence
      await window.evaluate(() => {
        window.testHelpers!.closeSettingsModal();
      });
      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).not.toBeVisible();

      // Reopen agents section
      await openAgentsSection(window);
      await waitForAgentsList(window, true);

      // Verify agent is still there
      await waitForAgent(window, mockAgent.name);
    });
  });

  test.describe("Scenario: Edge Cases and Boundary Conditions", () => {
    test("handles agent creation with minimal required fields", async () => {
      const window = testSuite.getWindow();

      await openAgentsSection(window);
      await waitForAgentsEmptyState(window);

      const createButton = window
        .locator("button")
        .filter({ hasText: /create.*agent/i });
      await createButton.click();
      await waitForAgentModal(window, true);

      // Fill only required fields
      const minimalAgent = createMockAgentData({
        systemPrompt: "", // Optional field left empty
      });

      const actualAgent = await fillAgentForm(window, minimalAgent);

      const saveButton = window
        .locator("button")
        .filter({ hasText: /create agent/i });
      await saveButton.click();
      await waitForAgentModal(window, false);

      await waitForAgent(window, actualAgent.name);
      await verifyAgentPersistence(window, actualAgent, testSuite);
    });
  });
});

// Helper Functions

const fillAgentForm = async (
  window: TestWindow,
  agentData: AgentFormData,
): Promise<AgentFormData> => {
  // Fill name field
  const nameInput = window.locator("#agent-name");
  await nameInput.fill(agentData.name);

  // Select model dropdown
  const modelSelect = window.locator('[role="combobox"]').first();
  await modelSelect.click();
  // Select the first available model (since we created an Anthropic config)
  const firstModelOption = window.locator('[role="option"]').first();
  const selectedModel =
    (await firstModelOption.getAttribute("data-value")) || "claude-3-opus";
  await firstModelOption.click();

  // Select role dropdown
  const roleSelect = window.locator('[role="combobox"]').nth(1);
  await roleSelect.click();
  // Select the first available role
  const firstRoleOption = window.locator('[role="option"]').first();
  await firstRoleOption.click();
  // The first role in defaultRoles.json is "project-manager"
  const selectedRole = "project-manager";

  // Select personality dropdown
  const personalitySelect = window.locator('[role="combobox"]').nth(2);
  await personalitySelect.click();
  // Select the first available personality
  const firstPersonalityOption = window.locator('[role="option"]').first();
  await firstPersonalityOption.click();
  // The first personality in defaultPersonalities.json is "creative-thinker"
  const selectedPersonality = "creative-thinker";

  // Fill system prompt if provided
  if (agentData.systemPrompt) {
    const systemPromptTextarea = window.locator(
      'textarea[name="systemPrompt"]',
    );
    await systemPromptTextarea.fill(agentData.systemPrompt);
  }

  // Small delay for form state to update
  await window.waitForTimeout(100);

  // Return the actual selected values
  return {
    ...agentData,
    model: selectedModel,
    role: selectedRole,
    personality: selectedPersonality,
  };
};

const verifyAgentPersistence = async (
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
