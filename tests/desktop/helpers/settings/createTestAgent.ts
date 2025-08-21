import type { AgentFormData } from "@fishbowl-ai/ui-shared";
import type { TestWindow } from "../TestWindow";
import { openAgentsSection } from "./openAgentsSection";
import { waitForAgentModal } from "./waitForAgentModal";
import { fillAgentForm } from "./fillAgentForm";

export const createTestAgent = async (
  window: TestWindow,
  agentData: AgentFormData,
) => {
  await openAgentsSection(window);
  const createButton = window
    .locator("button")
    .filter({ hasText: /create.*agent/i });
  await createButton.click();
  await waitForAgentModal(window, true);

  await fillAgentForm(window, agentData);

  const saveButton = window
    .locator("button")
    .filter({ hasText: /create agent/i });
  await saveButton.click();
  await waitForAgentModal(window, false);
  // Small delay for file operations to complete
  await window.waitForTimeout(100);
};
