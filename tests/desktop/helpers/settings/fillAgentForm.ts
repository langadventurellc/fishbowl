import type { AgentFormData } from "@fishbowl-ai/ui-shared";
import type { TestWindow } from "../TestWindow";

export const fillAgentForm = async (
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
