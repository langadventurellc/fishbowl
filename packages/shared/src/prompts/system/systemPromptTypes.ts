import type { BehaviorRenderData } from "./BehaviorRenderData";

export interface SystemPromptRenderData {
  agentSystemPrompt?: string;
  agentName: string;
  roleName: string;
  roleDescription: string;
  roleSystemPrompt: string;
  personalityName: string;
  personalityCustomInstructions: string;
  behaviors: BehaviorRenderData;
  participants: string;
}
