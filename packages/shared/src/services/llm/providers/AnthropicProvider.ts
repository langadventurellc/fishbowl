import type {
  LlmProvider,
  LlmRequestParams,
  LlmResponse,
  FormattedMessage,
} from "../interfaces";
import { LlmProviderError } from "../errors";

/**
 * Anthropic API provider implementation using fetch.
 * Handles message alternation requirements and configurable authentication.
 */
export class AnthropicProvider implements LlmProvider {
  private static readonly DEFAULT_BASE_URL = "https://api.anthropic.com";
  private static readonly API_VERSION = "2023-06-01";

  async sendMessage(params: LlmRequestParams): Promise<LlmResponse> {
    try {
      const url = this.buildApiUrl(params.config.baseUrl);
      const processedMessages = this.processMessagesForAnthropic(
        params.messages,
      );
      const headers = this.buildHeaders(params.config);
      const requestBody = this.buildRequestBody(params, processedMessages);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new LlmProviderError(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
          "anthropic",
        );
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      if (error instanceof LlmProviderError) {
        throw error;
      }
      throw new LlmProviderError(
        `Anthropic API error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "anthropic",
      );
    }
  }

  /**
   * Normalize base URL and build full API endpoint.
   * Strips trailing slashes and /v1 path, then appends /v1/messages.
   */
  private buildApiUrl(baseUrl?: string): string {
    const normalizedBase = baseUrl || AnthropicProvider.DEFAULT_BASE_URL;

    // Strip trailing slashes and /v1 path
    const cleanBase = normalizedBase
      .replace(/\/+$/, "") // Remove trailing slashes
      .replace(/\/v1$/, ""); // Remove trailing /v1

    return `${cleanBase}/v1/messages`;
  }

  /**
   * Build request headers with proper authentication and API version.
   */
  private buildHeaders(
    config: LlmRequestParams["config"],
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "anthropic-version": AnthropicProvider.API_VERSION,
    };

    // Select authentication header based on config
    if (config.useAuthHeader) {
      headers["Authorization"] = `Bearer ${config.apiKey}`;
    } else {
      headers["x-api-key"] = config.apiKey;
    }

    return headers;
  }

  /**
   * Build the request body for Anthropic API.
   */
  private buildRequestBody(
    params: LlmRequestParams,
    processedMessages: FormattedMessage[],
  ): Record<string, unknown> {
    return {
      model: params.model,
      system: params.systemPrompt,
      messages: processedMessages,
      temperature: params.sampling.temperature,
      top_p: params.sampling.topP,
      max_tokens: params.sampling.maxTokens,
    };
  }

  /**
   * Process messages to meet Anthropic's alternation requirements:
   * 1. Merge consecutive same-role messages with \n\n separator
   * 2. Ensure first message is 'user' (inject empty user message if not)
   * 3. Ensure last message is 'user' (append empty user message if last is assistant)
   */
  private processMessagesForAnthropic(
    messages: FormattedMessage[],
  ): FormattedMessage[] {
    if (messages.length === 0) {
      return [];
    }

    // Step 1: Merge consecutive same-role messages
    const mergedMessages = this.mergeConsecutiveRoles(messages);

    // Step 2: Ensure first message is 'user'
    let processedMessages = mergedMessages;
    if (processedMessages.length > 0 && processedMessages[0]?.role !== "user") {
      processedMessages = [{ role: "user", content: "" }, ...processedMessages];
    }

    // Step 3: Ensure last message is 'user'
    if (
      processedMessages.length > 0 &&
      processedMessages[processedMessages.length - 1]?.role === "assistant"
    ) {
      processedMessages = [...processedMessages, { role: "user", content: "" }];
    }

    return processedMessages;
  }

  /**
   * Merge consecutive messages with the same role using \n\n separator.
   */
  private mergeConsecutiveRoles(
    messages: FormattedMessage[],
  ): FormattedMessage[] {
    const merged: FormattedMessage[] = [];

    for (const message of messages) {
      if (
        merged.length > 0 &&
        merged[merged.length - 1]?.role === message.role
      ) {
        // Merge with previous message of same role
        merged[merged.length - 1]!.content += "\n\n" + message.content;
      } else {
        // Add new message
        merged.push({ ...message });
      }
    }

    return merged;
  }

  /**
   * Parse Anthropic API response and extract text content.
   */
  private parseResponse(data: unknown): LlmResponse {
    if (!data || typeof data !== "object" || !("content" in data)) {
      throw new LlmProviderError(
        "Invalid response format from Anthropic",
        "anthropic",
      );
    }

    const content = (data as { content: unknown }).content;
    if (!Array.isArray(content)) {
      throw new LlmProviderError(
        "Missing content array in Anthropic response",
        "anthropic",
      );
    }

    // Find the first text block
    const textBlock = content.find(
      (block): block is { type: string; text: string } =>
        block &&
        typeof block === "object" &&
        "type" in block &&
        "text" in block &&
        block.type === "text",
    );

    if (!textBlock || typeof textBlock.text !== "string") {
      throw new LlmProviderError(
        "No text content found in Anthropic response",
        "anthropic",
      );
    }

    return { content: textBlock.text };
  }
}
