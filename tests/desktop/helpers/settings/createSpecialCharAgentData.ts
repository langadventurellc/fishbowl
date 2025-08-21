/**
 * Creates agent data with special characters for testing validation
 *
 * @module helpers/settings/createSpecialCharAgentData
 */

import type { AgentFormData } from "@fishbowl-ai/ui-shared";

export const createSpecialCharAgentData = (): AgentFormData => {
  return {
    name: "Agent with Special @#$% Characters!",
    model: "claude-3-sonnet-20240229",
    role: "test-analyst-role",
    personality: "test-professional-personality",
    systemPrompt:
      "Testing special character handling in agent names and descriptions",
  };
};
