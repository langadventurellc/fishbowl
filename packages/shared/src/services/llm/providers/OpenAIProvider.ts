import { LlmProviderError } from "../errors";
import type { LlmProvider, LlmRequestParams, LlmResponse } from "../interfaces";

/**
 * OpenAI API provider implementation using fetch.
 * Uses fixed endpoint and authorization header format (ignores config options per spec).
 */
export class OpenAIProvider implements LlmProvider {
  private static readonly API_ENDPOINT = "https://api.openai.com/v1/responses";

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
   * Build the request body for OpenAI Responses API.
   * Combines system prompt and formatted messages into input format.
   */
  private buildRequestBody(params: LlmRequestParams): Record<string, unknown> {
    // Build input array with system prompt first, then formatted messages
    const input = [
      { type: "message", role: "system", content: params.systemPrompt },
      ...params.messages.map((msg) => ({
        type: "message",
        role: msg.role,
        content: msg.content,
      })),
    ];

    // temperature and top_p are not supported in GPT 5 models. Commenting out until allowing
    // optional passing of these values
    const requestBody: Record<string, unknown> = {
      model: params.model,
      input,
      // temperature: params.sampling.temperature,
      // top_p: params.sampling.topP,
      max_output_tokens: params.sampling.maxTokens,
    };

    // Add reasoning.effort for GPT-5 models
    if (params.model.includes("gpt-5")) {
      requestBody.reasoning = { effort: "minimal" };
    }

    return requestBody;
  }

  /**
   * Parse OpenAI Responses API response and extract text content.
   */
  private parseResponse(data: unknown): LlmResponse {
    if (!data || typeof data !== "object") {
      throw new LlmProviderError(
        "Invalid response format from OpenAI",
        "openai",
      );
    }

    // Add logging for debugging
    console.log("OpenAI Raw Response:", JSON.stringify(data, null, 2));

    const response = data as { output?: unknown };
    if (!Array.isArray(response.output) || response.output.length === 0) {
      throw new LlmProviderError(
        "Missing output array in OpenAI response",
        "openai",
      );
    }

    // Find the message type in the output array (it might not be the first item)
    const messageOutput = response.output.find((item: unknown) => {
      if (!item || typeof item !== "object") return false;
      const output = item as { type?: string };
      return output.type === "message";
    });

    if (!messageOutput) {
      console.log(
        "Available output types:",
        response.output.map((item: unknown) => {
          if (item && typeof item === "object" && "type" in item) {
            return (item as { type: string }).type;
          }
          return "unknown";
        }),
      );
      throw new LlmProviderError(
        "No message type found in OpenAI response output",
        "openai",
      );
    }

    console.log(
      "Message Output Object:",
      JSON.stringify(messageOutput, null, 2),
    );

    const output = messageOutput as { type?: string; content?: unknown };

    if (!Array.isArray(output.content) || output.content.length === 0) {
      throw new LlmProviderError(
        "Missing content array in OpenAI response message",
        "openai",
      );
    }

    const firstContent = output.content[0];
    if (!firstContent || typeof firstContent !== "object") {
      throw new LlmProviderError(
        "Invalid content format in OpenAI response",
        "openai",
      );
    }

    const content = firstContent as { type?: string; text?: unknown };
    if (content.type !== "output_text") {
      throw new LlmProviderError(
        `Expected output_text type in OpenAI response content, got: ${content.type}`,
        "openai",
      );
    }

    if (typeof content.text !== "string") {
      throw new LlmProviderError("No text found in OpenAI response", "openai");
    }

    return { content: content.text };
  }
}
