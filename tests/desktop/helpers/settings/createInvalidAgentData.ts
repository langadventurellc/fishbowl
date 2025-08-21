/**
 * Creates invalid agent data for testing validation scenarios
 *
 * @module helpers/settings/createInvalidAgentData
 */

import type { AgentFormData } from "@fishbowl-ai/ui-shared";

type InvalidField = "name" | "model" | "role" | "personality";

export const createInvalidAgentData = (
  invalidField: InvalidField = "name",
): Partial<AgentFormData> => {
  const validData: AgentFormData = {
    name: "Valid Test Agent",
    model: "claude-3-sonnet-20240229",
    role: "valid-test-role",
    personality: "valid-test-personality",
    systemPrompt: "Valid test system prompt",
  };

  switch (invalidField) {
    case "name":
      return { ...validData, name: "" };
    case "model":
      return { ...validData, model: "" };
    case "role":
      return { ...validData, role: "" };
    case "personality":
      return { ...validData, personality: "" };
    default:
      return { ...validData, name: "" };
  }
};
