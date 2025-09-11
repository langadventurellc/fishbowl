/**
 * Selects an appropriate color for a new agent in a conversation.
 *
 * Uses an 8-color palette with smart duplicate avoidance and round-robin fallback.
 * Colors are returned as CSS variable references for theme compatibility.
 *
 * @param existingAgents - Array of existing conversation agents
 * @returns CSS variable reference for the selected color (e.g., "--agent-1")
 *
 * @example
 * ```typescript
 * const agents = [
 *   { id: "1", agent_id: "a1", color: "--agent-1" },
 *   { id: "2", agent_id: "a2", color: "--agent-3" }
 * ];
 * const color = selectAgentColor(agents); // Returns "--agent-2"
 * ```
 */

import type { ConversationAgent } from "@fishbowl-ai/shared";

export function selectAgentColor(existingAgents: ConversationAgent[]): string {
  const availableColors = [
    "--agent-1",
    "--agent-2",
    "--agent-3",
    "--agent-4",
    "--agent-5",
    "--agent-6",
    "--agent-7",
    "--agent-8",
  ];

  // Get colors already used in this conversation
  const usedColors = new Set(existingAgents.map((agent) => agent.color));

  // Find first unused color, or fallback to round-robin
  const availableColor = availableColors.find(
    (color) => !usedColors.has(color),
  );

  return (
    availableColor ??
    availableColors[existingAgents.length % availableColors.length]!
  );
}
