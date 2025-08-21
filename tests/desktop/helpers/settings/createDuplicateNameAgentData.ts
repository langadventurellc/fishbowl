/**
 * Creates agent data with duplicate name for testing validation
 *
 * @module helpers/settings/createDuplicateNameAgentData
 */

import type { AgentFormData } from "@fishbowl-ai/ui-shared";

export const createDuplicateNameAgentData = (
  existingName: string,
): AgentFormData => {
  return {
    name: existingName,
    model: "claude-3-sonnet-20240229",
    role: "test-analyst-role",
    personality: "test-professional-personality",
    systemPrompt: "Agent with duplicate name for testing validation",
  };
};
