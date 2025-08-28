import type { SystemPromptRenderData } from "./systemPromptTypes";

export function renderSystemPrompt(
  template: string,
  data: SystemPromptRenderData,
): string {
  // TODO: Implement template token replacement and behavior rendering
  // This placeholder will be replaced in later tasks
  return `Rendered system prompt for ${data.agentName} with template: ${template.substring(0, 50)}...`;
}
