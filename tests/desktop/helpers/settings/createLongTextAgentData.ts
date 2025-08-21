/**
 * Creates agent data with long text for testing length limits
 *
 * @module helpers/settings/createLongTextAgentData
 */

import type { AgentFormData } from "@fishbowl-ai/ui-shared";

export const createLongTextAgentData = (): AgentFormData => {
  // Create text that exceeds the 100 character limit for names
  const longName = "A".repeat(101);

  // Create system prompt that exceeds the 5000 character limit
  const longSystemPrompt =
    "This is a very long system prompt that should exceed the maximum allowed length. ".repeat(
      100,
    );

  return {
    name: longName,
    model: "claude-3-sonnet-20240229",
    role: "test-analyst-role",
    personality: "test-professional-personality",
    systemPrompt: longSystemPrompt,
  };
};
