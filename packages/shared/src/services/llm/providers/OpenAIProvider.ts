import type { LlmProvider, LlmRequestParams, LlmResponse } from "../interfaces";
import { LlmProviderError } from "../errors";

/**
 * OpenAI API provider implementation using fetch.
 * Uses fixed endpoint and authorization header format (ignores config options per spec).
 */
export class OpenAIProvider implements LlmProvider {
  private static readonly API_ENDPOINT =
    "https://api.openai.com/v1/chat/completions";

  async sendMessage(params: LlmRequestParams): Promise<LlmResponse> {
    try {
      const headers = this.buildHeaders(params.config.apiKey);
      const requestBody = this.buildRequestBody(params);

      const response = await fetch(OpenAIProvider.API_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new LlmProviderError(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
          "openai",
        );
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      if (error instanceof LlmProviderError) {
        throw error;
      }
      throw new LlmProviderError(
        `OpenAI API error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "openai",
      );
    }
  }

  /**
   * Build request headers with fixed Authorization format.
   * Ignores config.useAuthHeader per specification.
   */
  private buildHeaders(apiKey: string): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
  }

  /**
   * Build the request body for OpenAI API.
   * Prepends system message to FormattedMessage array.
   */
  private buildRequestBody(params: LlmRequestParams): Record<string, unknown> {
    // Build messages with system prompt first, then formatted messages
    const messages = [
      { role: "system", content: params.systemPrompt },
      ...params.messages,
    ];

    return {
      model: params.model,
      messages,
      temperature: params.sampling.temperature,
      top_p: params.sampling.topP,
      max_tokens: params.sampling.maxTokens,
    };
  }

  /**
   * Parse OpenAI API response and extract text content.
   */
  private parseResponse(data: unknown): LlmResponse {
    if (!data || typeof data !== "object") {
      throw new LlmProviderError(
        "Invalid response format from OpenAI",
        "openai",
      );
    }

    const response = data as { choices?: unknown };
    if (!Array.isArray(response.choices) || response.choices.length === 0) {
      throw new LlmProviderError(
        "Missing choices array in OpenAI response",
        "openai",
      );
    }

    const firstChoice = response.choices[0];
    if (!firstChoice || typeof firstChoice !== "object") {
      throw new LlmProviderError(
        "Invalid choice format in OpenAI response",
        "openai",
      );
    }

    const choice = firstChoice as { message?: unknown };
    if (!choice.message || typeof choice.message !== "object") {
      throw new LlmProviderError(
        "Missing message in OpenAI response choice",
        "openai",
      );
    }

    const message = choice.message as { content?: unknown };
    if (typeof message.content !== "string") {
      throw new LlmProviderError(
        "No content found in OpenAI response",
        "openai",
      );
    }

    return { content: message.content };
  }
}
