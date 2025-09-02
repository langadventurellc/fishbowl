import type { PersistedAgentData } from "../../types/agents/PersistedAgentData";
import type { StructuredLogger } from "../../logging/types/StructuredLogger";
import { createLoggerSync } from "../../logging/createLoggerSync";
import type { SystemPromptResolvers } from "./SystemPromptResolvers";
import type { SystemPromptRenderData } from "./systemPromptTypes";
import type { BehaviorRenderData } from "./BehaviorRenderData";
import { renderSystemPrompt } from "./systemPromptRenderer";

export class SystemPromptFactory {
  private readonly logger: StructuredLogger;

  constructor(
    private readonly resolvers: SystemPromptResolvers,
    private readonly template: string,
    logger?: StructuredLogger,
  ) {
    this.logger =
      logger ??
      createLoggerSync({
        context: { metadata: { component: "SystemPromptFactory" } },
      });
  }

  async createSystemPrompt(
    agent: PersistedAgentData,
    participants: PersistedAgentData[] = [],
  ): Promise<string> {
    this.logger.info("Creating system prompt for agent", { agentId: agent.id });

    // Validate inputs
    if (!agent.role) {
      throw new Error(`Agent ${agent.id} missing role`);
    }
    if (!agent.personality) {
      throw new Error(`Agent ${agent.id} missing personality`);
    }

    // Resolve personality and role data
    const [personality, role] = await Promise.all([
      this.resolvers.resolvePersonality(agent.personality),
      this.resolvers.resolveRole(agent.role),
    ]);

    // Build behaviors data
    const behaviors: BehaviorRenderData = {
      personalityBehaviors: personality.behaviors || {},
      agentOverrides: agent.personalityBehaviors,
    };

    // Build participants string
    const participantsString =
      participants.length > 0
        ? `You are in a conversation with multiple participants:
${participants.map((p) => `- ${p.name}: ${p.role}`).join("\n")}

When you see messages prefixed with [ParticipantName]: that indicates who is speaking.
Respond naturally as ${agent.name} based on your configured personality and role.`
        : "";

    // Build render data
    const renderData: SystemPromptRenderData = {
      agentSystemPrompt: agent.systemPrompt,
      agentName: agent.name,
      roleName: role.name,
      roleDescription: role.description,
      roleSystemPrompt: role.systemPrompt,
      personalityName: personality.name,
      personalityCustomInstructions: personality.customInstructions || "",
      behaviors,
      participants: participantsString,
    };

    // Render the system prompt
    const result = renderSystemPrompt(this.template, renderData);

    this.logger.info("System prompt created successfully", {
      agentId: agent.id,
      promptLength: result.length,
    });

    return result;
  }
}
