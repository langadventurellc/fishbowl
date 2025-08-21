/**
 * Creates minimal agent data for testing required fields only
 *
 * @module helpers/settings/createMinimalAgentData
 */

import type { AgentFormData } from "@fishbowl-ai/ui-shared";

export const createMinimalAgentData = (): AgentFormData => {
  return {
    name: "Minimal Agent",
    model: "claude-3-sonnet-20240229",
    role: "test-basic-role",
    personality: "test-basic-personality",
    // Note: systemPrompt is optional, so we omit it here
  };
};
