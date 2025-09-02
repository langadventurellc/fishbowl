import { AnthropicProvider } from "../AnthropicProvider";
import type { LlmRequestParams, FormattedMessage } from "../../interfaces";
import { LlmProviderError } from "../../errors";

// Mock fetch globally
const mockFetch = jest.fn();
(globalThis as typeof globalThis & { fetch: typeof fetch }).fetch = mockFetch;

describe("AnthropicProvider", () => {
  let provider: AnthropicProvider;

  const mockConfig = {
    id: "test-config",
    customName: "Test Config",
    provider: "anthropic" as const,
    apiKey: "test-api-key",
    baseUrl: undefined,
    useAuthHeader: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  const mockSampling = {
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 1000,
  };

  beforeEach(() => {
    provider = new AnthropicProvider();
    mockFetch.mockReset();
  });

  describe("Base URL normalization", () => {
    const baseParams: LlmRequestParams = {
      systemPrompt: "Test prompt",
      model: "claude-3-sonnet-20240229",
      messages: [{ role: "user", content: "Hello" }],
      config: mockConfig,
      sampling: mockSampling,
    };

    it("should use default URL when baseUrl is undefined", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: "text", text: "Hello response" }],
          }),
      });

      await provider.sendMessage(baseParams);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.anthropic.com/v1/messages",
        expect.any(Object),
      );
    });

    it("should normalize baseUrl with trailing slashes", async () => {
      const configWithBaseUrl = {
        ...mockConfig,
        baseUrl: "https://custom.api.com/",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: "text", text: "Hello response" }],
          }),
      });

      await provider.sendMessage({
        ...baseParams,
        config: configWithBaseUrl,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://custom.api.com/v1/messages",
        expect.any(Object),
      );
    });

    it("should normalize baseUrl with /v1 path", async () => {
      const configWithBaseUrl = {
        ...mockConfig,
        baseUrl: "https://custom.api.com/v1",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: "text", text: "Hello response" }],
          }),
      });

      await provider.sendMessage({
        ...baseParams,
        config: configWithBaseUrl,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://custom.api.com/v1/messages",
        expect.any(Object),
      );
    });

    it("should normalize baseUrl with both trailing slash and /v1", async () => {
      const configWithBaseUrl = {
        ...mockConfig,
        baseUrl: "https://custom.api.com/v1/",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: "text", text: "Hello response" }],
          }),
      });

      await provider.sendMessage({
        ...baseParams,
        config: configWithBaseUrl,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://custom.api.com/v1/messages",
        expect.any(Object),
      );
    });
  });

  describe("Authentication header selection", () => {
    const baseParams: LlmRequestParams = {
      systemPrompt: "Test prompt",
      model: "claude-3-sonnet-20240229",
      messages: [{ role: "user", content: "Hello" }],
      config: mockConfig,
      sampling: mockSampling,
    };

    it("should use x-api-key header when useAuthHeader is false", async () => {
      const configWithoutAuthHeader = {
        ...mockConfig,
        useAuthHeader: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: "text", text: "Hello response" }],
          }),
      });

      await provider.sendMessage({
        ...baseParams,
        config: configWithoutAuthHeader,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-api-key": "test-api-key",
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
          }),
        }),
      );
    });

    it("should use Authorization header when useAuthHeader is true", async () => {
      const configWithAuthHeader = {
        ...mockConfig,
        useAuthHeader: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: "text", text: "Hello response" }],
          }),
      });

      await provider.sendMessage({
        ...baseParams,
        config: configWithAuthHeader,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
          }),
        }),
      );
    });
  });

  describe("Message alternation handling", () => {
    const baseParams: LlmRequestParams = {
      systemPrompt: "Test prompt",
      model: "claude-3-sonnet-20240229",
      messages: [],
      config: mockConfig,
      sampling: mockSampling,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: "text", text: "Hello response" }],
          }),
      });
    });

    it("should merge consecutive same-role messages", async () => {
      const messagesWithConsecutive: FormattedMessage[] = [
        { role: "user", content: "First user message" },
        { role: "user", content: "Second user message" },
        { role: "assistant", content: "Assistant response" },
        { role: "assistant", content: "Another assistant message" },
      ];

      await provider.sendMessage({
        ...baseParams,
        messages: messagesWithConsecutive,
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.messages).toEqual([
        { role: "user", content: "First user message\n\nSecond user message" },
        {
          role: "assistant",
          content: "Assistant response\n\nAnother assistant message",
        },
        { role: "user", content: "" }, // Added because last message was assistant
      ]);
    });

    it("should inject empty user message when first message is assistant", async () => {
      const messagesStartingWithAssistant: FormattedMessage[] = [
        { role: "assistant", content: "Assistant starts" },
        { role: "user", content: "User responds" },
      ];

      await provider.sendMessage({
        ...baseParams,
        messages: messagesStartingWithAssistant,
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.messages[0]).toEqual({ role: "user", content: "" });
      expect(requestBody.messages[1]).toEqual({
        role: "assistant",
        content: "Assistant starts",
      });
      expect(requestBody.messages[2]).toEqual({
        role: "user",
        content: "User responds",
      });
    });

    it("should append empty user message when last message is assistant", async () => {
      const messagesEndingWithAssistant: FormattedMessage[] = [
        { role: "user", content: "User message" },
        { role: "assistant", content: "Assistant ends" },
      ];

      await provider.sendMessage({
        ...baseParams,
        messages: messagesEndingWithAssistant,
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.messages).toEqual([
        { role: "user", content: "User message" },
        { role: "assistant", content: "Assistant ends" },
        { role: "user", content: "" },
      ]);
    });

    it("should handle all alternation fixes together", async () => {
      const complexMessages: FormattedMessage[] = [
        { role: "assistant", content: "Assistant starts" },
        { role: "assistant", content: "Assistant continues" },
        { role: "user", content: "User message 1" },
        { role: "user", content: "User message 2" },
        { role: "assistant", content: "Assistant responds" },
      ];

      await provider.sendMessage({
        ...baseParams,
        messages: complexMessages,
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.messages).toEqual([
        { role: "user", content: "" }, // Injected empty user at start
        {
          role: "assistant",
          content: "Assistant starts\n\nAssistant continues",
        }, // Merged consecutive
        { role: "user", content: "User message 1\n\nUser message 2" }, // Merged consecutive
        { role: "assistant", content: "Assistant responds" },
        { role: "user", content: "" }, // Appended empty user at end
      ]);
    });

    it("should handle empty messages array", async () => {
      await provider.sendMessage({
        ...baseParams,
        messages: [],
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.messages).toEqual([]);
    });
  });

  describe("System prompt separation", () => {
    const messages: FormattedMessage[] = [{ role: "user", content: "Hello" }];

    it("should separate system prompt from messages", async () => {
      const systemPrompt = "You are a helpful assistant";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: "text", text: "Hello response" }],
          }),
      });

      await provider.sendMessage({
        systemPrompt,
        model: "claude-3-sonnet-20240229",
        messages,
        config: mockConfig,
        sampling: mockSampling,
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.system).toBe(systemPrompt);
      expect(requestBody.messages).toEqual(messages);

      // Ensure system prompt is not in messages array
      expect(requestBody.messages).not.toContainEqual(
        expect.objectContaining({ role: "system" }),
      );
    });
  });

  describe("Successful API calls and response parsing", () => {
    const baseParams: LlmRequestParams = {
      systemPrompt: "Test prompt",
      model: "claude-3-sonnet-20240229",
      messages: [{ role: "user", content: "Hello" }],
      config: mockConfig,
      sampling: mockSampling,
    };

    it("should parse successful response with text content", async () => {
      const expectedResponse = "This is the AI response";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: "text", text: expectedResponse }],
          }),
      });

      const result = await provider.sendMessage(baseParams);

      expect(result).toEqual({ content: expectedResponse });
    });

    it("should find first text block in multiple content blocks", async () => {
      const expectedResponse = "First text response";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [
              { type: "other", data: "some other data" },
              { type: "text", text: expectedResponse },
              { type: "text", text: "Second text response" },
            ],
          }),
      });

      const result = await provider.sendMessage(baseParams);

      expect(result).toEqual({ content: expectedResponse });
    });

    it("should apply all sampling parameters", async () => {
      const customSampling = {
        temperature: 0.5,
        topP: 0.8,
        maxTokens: 500,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: "text", text: "Response" }],
          }),
      });

      await provider.sendMessage({
        ...baseParams,
        sampling: customSampling,
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.temperature).toBe(0.5);
      expect(requestBody.top_p).toBe(0.8);
      expect(requestBody.max_tokens).toBe(500);
    });
  });

  describe("HTTP error handling", () => {
    const baseParams: LlmRequestParams = {
      systemPrompt: "Test prompt",
      model: "claude-3-sonnet-20240229",
      messages: [{ role: "user", content: "Hello" }],
      config: mockConfig,
      sampling: mockSampling,
    };

    it("should throw LlmProviderError on HTTP 4xx errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: () => Promise.resolve("Invalid request format"),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "HTTP 400: Bad Request - Invalid request format",
          "anthropic",
        ),
      );
    });

    it("should throw LlmProviderError on HTTP 5xx errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: () => Promise.resolve("Server error"),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "HTTP 500: Internal Server Error - Server error",
          "anthropic",
        ),
      );
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError("Anthropic API error: Network error", "anthropic"),
      );
    });

    it("should handle error when response.text() fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: () => Promise.reject(new Error("Failed to read response")),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "HTTP 500: Internal Server Error - Unknown error",
          "anthropic",
        ),
      );
    });
  });

  describe("Missing content error handling", () => {
    const baseParams: LlmRequestParams = {
      systemPrompt: "Test prompt",
      model: "claude-3-sonnet-20240229",
      messages: [{ role: "user", content: "Hello" }],
      config: mockConfig,
      sampling: mockSampling,
    };

    it("should throw error when response has no content field", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "Invalid response format from Anthropic",
          "anthropic",
        ),
      );
    });

    it("should throw error when content is not an array", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: "not an array",
          }),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "Missing content array in Anthropic response",
          "anthropic",
        ),
      );
    });

    it("should throw error when no text blocks found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [
              { type: "image", data: "base64..." },
              { type: "other", value: "something" },
            ],
          }),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "No text content found in Anthropic response",
          "anthropic",
        ),
      );
    });

    it("should throw error when text block has no text property", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [
              { type: "text" }, // Missing text property
            ],
          }),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "No text content found in Anthropic response",
          "anthropic",
        ),
      );
    });

    it("should throw error when text property is not a string", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [
              { type: "text", text: 123 }, // text is number, not string
            ],
          }),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "No text content found in Anthropic response",
          "anthropic",
        ),
      );
    });
  });

  describe("Request body format", () => {
    const baseParams: LlmRequestParams = {
      systemPrompt: "You are helpful",
      model: "claude-3-sonnet-20240229",
      messages: [{ role: "user", content: "Hello" }],
      config: mockConfig,
      sampling: {
        temperature: 0.7,
        topP: 0.9,
        maxTokens: 1000,
      },
    };

    it("should send properly formatted request body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: "text", text: "Response" }],
          }),
      });

      await provider.sendMessage(baseParams);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            model: "claude-3-sonnet-20240229",
            system: "You are helpful",
            messages: [{ role: "user", content: "Hello" }],
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1000,
          }),
        }),
      );
    });
  });
});
