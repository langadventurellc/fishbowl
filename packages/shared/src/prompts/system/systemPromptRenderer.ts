import type { SystemPromptRenderData } from "./systemPromptTypes";
import type { BehaviorRenderData } from "./BehaviorRenderData";

export function renderSystemPrompt(
  template: string,
  data: SystemPromptRenderData,
): string {
  let result = template;

  // Replace simple tokens
  const tokens: Record<string, string> = {
    "{{agentSystemPrompt}}": data.agentSystemPrompt || "",
    "{{agentName}}": data.agentName,
    "{{roleName}}": data.roleName,
    "{{roleDescription}}": data.roleDescription,
    "{{roleSystemPrompt}}": data.roleSystemPrompt,
    "{{personalityName}}": data.personalityName,
    "{{personalityCustomInstructions}}": data.personalityCustomInstructions,
    "{{participants}}": data.participants,
  };

  // Replace all simple tokens
  for (const [token, value] of Object.entries(tokens)) {
    result = result.replace(new RegExp(escapeRegex(token), "g"), value);
  }

  // Render and replace behaviors token
  const behaviorsText = renderBehaviors(data.behaviors);
  result = result.replace(/\{\{behaviors\}\}/g, behaviorsText);

  // Clean up any remaining empty sections
  result = cleanupEmptySections(result);

  return result;
}

function renderBehaviors(behaviorsData: BehaviorRenderData): string {
  const { personalityBehaviors, agentOverrides } = behaviorsData;

  // Get all behavior keys and sort alphabetically for deterministic output
  const allKeys = new Set([
    ...Object.keys(personalityBehaviors),
    ...Object.keys(agentOverrides || {}),
  ]);
  const sortedKeys = Array.from(allKeys).sort();

  if (sortedKeys.length === 0) {
    return "";
  }

  const behaviorLines = sortedKeys
    .map((key) => {
      const baseValue = personalityBehaviors[key];
      const overrideValue = agentOverrides?.[key];

      if (baseValue !== undefined && overrideValue !== undefined) {
        // Show override format
        return `- ${key}: ${baseValue} (override: ${overrideValue})`;
      } else if (baseValue !== undefined) {
        // Show base value only
        return `- ${key}: ${baseValue}`;
      } else if (overrideValue !== undefined) {
        // Show override only (base assumed to be default)
        return `- ${key}: ${overrideValue}`;
      }

      return null;
    })
    .filter((line): line is string => line !== null);

  return behaviorLines.join("\n");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanupEmptySections(text: string): string {
  // Remove excessive whitespace but preserve structure
  return text
    .replace(/\n\s*\n\s*\n/g, "\n\n") // Collapse multiple empty lines to double
    .replace(/^\s+|\s+$/g, ""); // Trim leading/trailing whitespace
}
