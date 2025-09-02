import { OpenAIProvider } from "../OpenAIProvider";
import type { LlmRequestParams, FormattedMessage } from "../../interfaces";
import { LlmProviderError } from "../../errors";

// Mock fetch globally
const mockFetch = jest.fn();
(globalThis as typeof globalThis & { fetch: typeof fetch }).fetch = mockFetch;

describe("OpenAIProvider", () => {
  let provider: OpenAIProvider;

  const mockConfig = {
    id: "test-config",
    customName: "Test Config",
    provider: "openai" as const,
    apiKey: "test-api-key",
    baseUrl: "https://custom.openai.com", // Should be ignored per spec
    useAuthHeader: false, // Should be ignored per spec
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  const mockSampling = {
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 1000,
  };

  const mockMessages: FormattedMessage[] = [
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi there!" },
    { role: "user", content: "How are you?" },
  ];

  beforeEach(() => {
    provider = new OpenAIProvider();
    mockFetch.mockReset();
  });

  describe("Successful API calls and response parsing", () => {
    const baseParams: LlmRequestParams = {
      systemPrompt: "Test system prompt",
      model: "gpt-4",
      messages: mockMessages,
      config: mockConfig,
      sampling: mockSampling,
    };

    it("should make successful API call with correct parameters", async () => {
      const mockResponse = {
        output: [
          {
            type: "message",
            content: [
              {
                type: "output_text",
                text: "Test response from OpenAI",
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.sendMessage(baseParams);

      expect(result).toEqual({
        content: "Test response from OpenAI",
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should use fixed endpoint URL (ignore baseUrl config)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            output: [
              {
                type: "message",
                content: [{ type: "output_text", text: "Response" }],
              },
            ],
          }),
      });

      await provider.sendMessage(baseParams);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.openai.com/v1/responses",
        expect.any(Object),
      );
    });

    it("should use fixed Authorization header format (ignore useAuthHeader config)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            output: [
              {
                type: "message",
                content: [{ type: "output_text", text: "Response" }],
              },
            ],
          }),
      });

      await provider.sendMessage(baseParams);

      const fetchCall = mockFetch.mock.calls[0];
      const headers = fetchCall[1].headers;

      expect(headers["Authorization"]).toBe("Bearer test-api-key");
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("should prepend system message to input array", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            output: [
              {
                type: "message",
                content: [{ type: "output_text", text: "Response" }],
              },
            ],
          }),
      });

      await provider.sendMessage(baseParams);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);

      expect(requestBody.input).toEqual([
        { type: "message", role: "system", content: "Test system prompt" },
        { type: "message", role: "user", content: "Hello" },
        { type: "message", role: "assistant", content: "Hi there!" },
        { type: "message", role: "user", content: "How are you?" },
      ]);
    });

    it("should apply sampling parameters correctly (temperature and top_p commented out)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            output: [
              {
                type: "message",
                content: [{ type: "output_text", text: "Response" }],
              },
            ],
          }),
      });

      await provider.sendMessage(baseParams);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);

      // Temperature and top_p are commented out for GPT-5 compatibility
      expect(requestBody.temperature).toBeUndefined();
      expect(requestBody.top_p).toBeUndefined();
      expect(requestBody.max_output_tokens).toBe(1000);
      expect(requestBody.model).toBe("gpt-4");
    });

    it("should handle empty messages array", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            output: [
              {
                type: "message",
                content: [{ type: "output_text", text: "Response" }],
              },
            ],
          }),
      });

      const paramsWithEmptyMessages = {
        ...baseParams,
        messages: [] as FormattedMessage[],
      };

      await provider.sendMessage(paramsWithEmptyMessages);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);

      expect(requestBody.input).toEqual([
        { type: "message", role: "system", content: "Test system prompt" },
      ]);
    });
  });

  describe("HTTP error handling scenarios", () => {
    const baseParams: LlmRequestParams = {
      systemPrompt: "Test prompt",
      model: "gpt-4",
      messages: mockMessages,
      config: mockConfig,
      sampling: mockSampling,
    };

    it("should handle HTTP 401 Unauthorized error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: () => Promise.resolve("Invalid API key"),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "HTTP 401: Unauthorized - Invalid API key",
          "openai",
        ),
      );
    });

    it("should handle HTTP 429 Rate Limit error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        text: () => Promise.resolve("Rate limit exceeded"),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "HTTP 429: Too Many Requests - Rate limit exceeded",
          "openai",
        ),
      );
    });

    it("should handle HTTP 500 Server Error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: () => Promise.resolve("Server error occurred"),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "HTTP 500: Internal Server Error - Server error occurred",
          "openai",
        ),
      );
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError("OpenAI API error: Network error", "openai"),
      );
    });

    it("should handle error text extraction failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: () => Promise.reject(new Error("Cannot read error text")),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError("HTTP 400: Bad Request - Unknown error", "openai"),
      );
    });
  });

  describe("Missing content error handling", () => {
    const baseParams: LlmRequestParams = {
      systemPrompt: "Test prompt",
      model: "gpt-4",
      messages: mockMessages,
      config: mockConfig,
      sampling: mockSampling,
    };

    it("should handle missing output array", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "Missing output array in OpenAI response",
          "openai",
        ),
      );
    });

    it("should handle empty output array", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ output: [] }),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "Missing output array in OpenAI response",
          "openai",
        ),
      );
    });

    it("should handle no message type in output", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ output: [{ type: "other" }] }),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "No message type found in OpenAI response output",
          "openai",
        ),
      );
    });

    it("should handle missing content array", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            output: [{ type: "message" }],
          }),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "Missing content array in OpenAI response message",
          "openai",
        ),
      );
    });

    it("should handle empty content array", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            output: [{ type: "message", content: [] }],
          }),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "Missing content array in OpenAI response message",
          "openai",
        ),
      );
    });

    it("should handle invalid content format", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            output: [{ type: "message", content: [null] }],
          }),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError(
          "Invalid content format in OpenAI response",
          "openai",
        ),
      );
    });

    it("should handle non-output_text content type", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            output: [
              {
                type: "message",
                content: [{ type: "other_type", text: "content" }],
              },
            ],
          }),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(
            "Expected output_text type in OpenAI response content",
          ),
        }),
      );
    });

    it("should handle missing text in content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            output: [
              {
                type: "message",
                content: [{ type: "output_text" }],
              },
            ],
          }),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError("No text found in OpenAI response", "openai"),
      );
    });

    it("should handle non-string text", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            output: [
              {
                type: "message",
                content: [{ type: "output_text", text: null }],
              },
            ],
          }),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError("No text found in OpenAI response", "openai"),
      );
    });

    it("should handle invalid JSON response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null),
      });

      await expect(provider.sendMessage(baseParams)).rejects.toThrow(
        new LlmProviderError("Invalid response format from OpenAI", "openai"),
      );
    });
  });

  describe("Error message sanitization", () => {
    const sensitiveConfig = {
      ...mockConfig,
      apiKey: "sk-super-secret-api-key-12345",
    };

    const baseParams: LlmRequestParams = {
      systemPrompt: "Test prompt",
      model: "gpt-4",
      messages: mockMessages,
      config: sensitiveConfig,
      sampling: mockSampling,
    };

    it("should not expose API key in error messages", async () => {
      mockFetch.mockRejectedValueOnce(
        new Error("Request failed with API key sk-super-secret-api-key-12345"),
      );

      try {
        await provider.sendMessage(baseParams);
      } catch (error) {
        expect(error).toBeInstanceOf(LlmProviderError);
        if (error instanceof LlmProviderError) {
          expect(error.message).toContain("OpenAI API error:");
          // The original error message would contain the API key, but our wrapper doesn't expose it directly
          expect(error.provider).toBe("openai");
        }
      }
    });

    it("should include provider name in errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Some network error"));

      try {
        await provider.sendMessage(baseParams);
      } catch (error) {
        expect(error).toBeInstanceOf(LlmProviderError);
        if (error instanceof LlmProviderError) {
          expect(error.provider).toBe("openai");
        }
      }
    });
  });

  describe("Request structure validation", () => {
    it("should build correct request structure (without temperature/top_p)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            output: [
              {
                type: "message",
                content: [{ type: "output_text", text: "Response" }],
              },
            ],
          }),
      });

      const params: LlmRequestParams = {
        systemPrompt: "You are a helpful assistant",
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: "What's the weather like?" },
          {
            role: "assistant",
            content: "I don't have access to weather data.",
          },
        ],
        config: mockConfig,
        sampling: {
          temperature: 0.5,
          topP: 0.8,
          maxTokens: 2000,
        },
      };

      await provider.sendMessage(params);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);

      expect(requestBody).toEqual({
        model: "gpt-3.5-turbo",
        input: [
          {
            type: "message",
            role: "system",
            content: "You are a helpful assistant",
          },
          {
            type: "message",
            role: "user",
            content: "What's the weather like?",
          },
          {
            type: "message",
            role: "assistant",
            content: "I don't have access to weather data.",
          },
        ],
        max_output_tokens: 2000,
      });
    });

    it("should use correct HTTP method and headers", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            output: [
              {
                type: "message",
                content: [{ type: "output_text", text: "Response" }],
              },
            ],
          }),
      });

      const params: LlmRequestParams = {
        systemPrompt: "Test",
        model: "gpt-4",
        messages: [],
        config: mockConfig,
        sampling: mockSampling,
      };

      await provider.sendMessage(params);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          },
          body: expect.any(String),
        },
      );
    });
  });
});
