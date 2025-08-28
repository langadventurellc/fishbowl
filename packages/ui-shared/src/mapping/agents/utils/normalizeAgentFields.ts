import { clampString } from "../../utils/transformers/clampString";

/**
 * Normalizes agent fields by applying string constraints and defaults.
 *
 * This function ensures that agent fields meet the required constraints:
 * - id: trimmed but not length-limited
 * - name: 1-100 characters after trimming
 * - model: trimmed string
 * - role: trimmed string
 * - personality: trimmed string
 * - systemPrompt: 0-5000 characters after trimming (optional)
 * - llmConfigId: trimmed string (optional)
 *
 * @param agent - Agent data to normalize
 * @returns Normalized agent data with guaranteed field constraints
 *
 * @example
 * ```typescript
 * const agent = {
 *   id: "  agent-123  ",
 *   name: "  My Agent  ",
 *   model: "Claude 3.5 Sonnet",
 *   role: "role-id",
 *   personality: "personality-id",
 *   temperature: 1.0,
 *   maxTokens: 2000,
 *   topP: 0.95,
 *   systemPrompt: undefined
 * };
 *
 * const normalized = normalizeAgentFields(agent);
 * // Returns agent with trimmed, length-constrained fields
 * ```
 */
export function normalizeAgentFields(agent: {
  id: string;
  name: string;
  model: string;
  role: string;
  personality: string;
  systemPrompt?: string | null;
  llmConfigId: string;
}): {
  id: string;
  name: string;
  model: string;
  role: string;
  personality: string;
  systemPrompt?: string;
  llmConfigId: string;
} {
  return {
    id: agent.id?.trim() || "",
    name: clampString(agent.name || "", 1, 100),
    model: agent.model?.trim() || "",
    role: agent.role?.trim() || "",
    personality: agent.personality?.trim() || "",
    systemPrompt: agent.systemPrompt?.trim()
      ? clampString(agent.systemPrompt.trim(), 0, 5000)
      : undefined,
    llmConfigId: agent.llmConfigId?.trim() || "",
  };
}
