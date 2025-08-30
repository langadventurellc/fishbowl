import { createLoggerSync, createProvider } from "@fishbowl-ai/shared";
import type {
  LlmBridgeInterface,
  FormattedMessage,
  LlmRequestParams,
} from "@fishbowl-ai/shared";
import { LlmStorageService } from "../../../electron/services/LlmStorageService";

export class MainProcessLlmBridge implements LlmBridgeInterface {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "MainProcessLlmBridge" } },
  });

  constructor(
    private readonly llmStorageService: LlmStorageService = LlmStorageService.getInstance(),
  ) {}

  async sendToProvider(
    agentConfig: { llmConfigId: string; model: string },
    context: { systemPrompt: string; messages: FormattedMessage[] },
  ): Promise<string> {
    this.logger.debug("MainProcessLlmBridge.sendToProvider called", {
      llmConfigId: agentConfig.llmConfigId,
      model: agentConfig.model,
      messageCount: context.messages.length,
    });

    try {
      // Resolve LLM configuration
      const configResult =
        await this.llmStorageService.getCompleteConfiguration(
          agentConfig.llmConfigId,
        );

      if (!configResult.success) {
        throw new Error(
          `Failed to get LLM configuration: ${configResult.error}`,
        );
      }

      if (!configResult.data) {
        throw new Error(
          `LLM configuration not found: ${agentConfig.llmConfigId}`,
        );
      }

      const config = configResult.data;

      // Validate required configuration fields
      if (!config.provider) {
        throw new Error(
          `Invalid LLM configuration - missing provider: ${agentConfig.llmConfigId}`,
        );
      }

      if (!config.apiKey) {
        throw new Error(
          `Invalid LLM configuration - missing API key: ${agentConfig.llmConfigId}`,
        );
      }

      // Create provider instance
      const provider = createProvider(config.provider);

      // Build request parameters with default sampling
      const requestParams: LlmRequestParams = {
        systemPrompt: context.systemPrompt,
        model: agentConfig.model, // Use the model from agent config
        messages: context.messages,
        config: config,
        sampling: {
          temperature: 0.7,
          topP: 0.9,
          maxTokens: 2000,
        },
      };

      this.logger.debug("Sending request to LLM provider", {
        provider: config.provider,
        model: agentConfig.model,
        llmConfigId: agentConfig.llmConfigId,
      });

      // Execute provider call
      const response = await provider.sendMessage(requestParams);

      this.logger.debug("Received response from LLM provider", {
        provider: config.provider,
        contentLength: response.content.length,
        llmConfigId: agentConfig.llmConfigId,
      });

      return response.content;
    } catch (error) {
      // Structured error logging without exposing sensitive data
      this.logger.error(
        "Failed to send message to LLM provider",
        error as Error,
        {
          llmConfigId: agentConfig.llmConfigId,
          model: agentConfig.model,
          messageCount: context.messages.length,
        },
      );

      // Re-throw with safe error message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Unknown error occurred while sending to LLM provider");
      }
    }
  }
}
