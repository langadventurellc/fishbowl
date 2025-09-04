import type { AgentFormData } from "@fishbowl-ai/ui-shared";
import type { TestWindow } from "../TestWindow";

export const fillAgentForm = async (
  window: TestWindow,
  agentData: AgentFormData,
): Promise<AgentFormData> => {
  // Fill name field
  const nameInput = window.locator('input[name="name"]');
  await nameInput.fill(agentData.name);

  // Select model dropdown
  const modelSelect = window.locator(
    '[role="combobox"][aria-label="Select model"]',
  );
  await modelSelect.click();
  // Select the first available model (since we created an Anthropic config)
  const firstModelOption = window.locator('[role="option"]').first();
  const selectedModel =
    (await firstModelOption.getAttribute("data-value")) ||
    "claude-3-haiku-20240307";
  await firstModelOption.click();

  // Select role dropdown
  const roleSelect = window.locator(
    '[role="combobox"][aria-label="Select role"]',
  );
  await roleSelect.click();
  // Select the first available role
  const firstRoleOption = window.locator('[role="option"]').first();
  await firstRoleOption.click();
  const selectedRole = "software-engineer";

  // Select personality dropdown
  const personalitySelect = window.locator(
    '[role="combobox"][aria-label="Select personality"]',
  );
  await personalitySelect.click();
  // Select the first available personality
  const firstPersonalityOption = window.locator('[role="option"]').first();
  await firstPersonalityOption.click();
  // The first personality in defaultPersonalities.json is "the-enthusiast"
  const selectedPersonality = "the-enthusiast";

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
