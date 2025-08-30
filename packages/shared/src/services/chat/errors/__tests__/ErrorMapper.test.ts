import { LlmProviderError } from "../../../llm/errors/LlmProviderError";
import { ErrorMapper } from "../ErrorMapper";
import { ChatErrorType } from "../ChatErrorType";

describe("ErrorMapper", () => {
  const mockConversationId = "conv-123";
  const mockAgentId = "agent-456";
  const mockProvider = "openai";

  describe("fromLlmProviderError", () => {
    it("should classify network errors correctly", () => {
      const error = new LlmProviderError(
        "network connection failed",
        mockProvider,
      );
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.type).toBe(ChatErrorType.NETWORK_ERROR);
      expect(result.code).toBe("CHAT_NETWORK_001");
      expect(result.userMessage).toBe(
        "Agent agent-456: Unable to connect to AI service. Please check your connection and try again.",
      );
      expect(result.retryable).toBe(true);
    });

    it("should classify authentication errors correctly", () => {
      const error = new LlmProviderError(
        "unauthorized - invalid API key",
        mockProvider,
      );
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.type).toBe(ChatErrorType.AUTH_ERROR);
      expect(result.code).toBe("CHAT_AUTH_001");
      expect(result.userMessage).toBe(
        "Agent agent-456: Authentication failed. Please check your API configuration.",
      );
      expect(result.retryable).toBe(false);
    });

    it("should classify rate limit errors correctly", () => {
      const error = new LlmProviderError(
        "rate limit exceeded - too many requests",
        mockProvider,
      );
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.type).toBe(ChatErrorType.RATE_LIMIT_ERROR);
      expect(result.code).toBe("CHAT_RATE_LIMIT_001");
      expect(result.userMessage).toBe(
        "Agent agent-456: Too many requests. Please wait a moment before trying again.",
      );
      expect(result.retryable).toBe(true);
    });

    it("should classify validation errors correctly", () => {
      const error = new LlmProviderError(
        "invalid request format - bad request",
        mockProvider,
      );
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.type).toBe(ChatErrorType.VALIDATION_ERROR);
      expect(result.code).toBe("CHAT_VALIDATION_001");
      expect(result.userMessage).toBe(
        "Agent agent-456: Invalid request format. Please try again.",
      );
      expect(result.retryable).toBe(false);
    });

    it("should classify timeout errors correctly", () => {
      const error = new LlmProviderError(
        "request timeout - timed out after 30s",
        mockProvider,
      );
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.type).toBe(ChatErrorType.TIMEOUT_ERROR);
      expect(result.code).toBe("CHAT_TIMEOUT_001");
      expect(result.userMessage).toBe(
        "Agent agent-456: Request timed out. Please try again.",
      );
      expect(result.retryable).toBe(true);
    });

    it("should classify provider errors correctly", () => {
      const error = new LlmProviderError(
        "internal server error - 500",
        mockProvider,
      );
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.type).toBe(ChatErrorType.PROVIDER_ERROR);
      expect(result.code).toBe("CHAT_PROVIDER_001");
      expect(result.userMessage).toBe(
        "Agent agent-456: AI service temporarily unavailable. Please try again.",
      );
      expect(result.retryable).toBe(true);
    });

    it("should classify unknown errors correctly", () => {
      const error = new LlmProviderError(
        "something unexpected happened",
        mockProvider,
      );
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.type).toBe(ChatErrorType.UNKNOWN_ERROR);
      expect(result.code).toBe("CHAT_UNKNOWN_001");
      expect(result.userMessage).toBe(
        "Agent agent-456: An unexpected error occurred. Please try again.",
      );
      expect(result.retryable).toBe(false);
    });

    it("should handle errors with no provider", () => {
      const error = new LlmProviderError("network error");
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.provider).toBe("unknown");
      expect(result.type).toBe(ChatErrorType.NETWORK_ERROR);
    });

    it("should include all required ChatError fields", () => {
      const error = new LlmProviderError("test error", mockProvider);
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.conversationId).toBe(mockConversationId);
      expect(result.agentId).toBe(mockAgentId);
      expect(result.provider).toBe(mockProvider);
      expect(result.technicalDetails).toBe("test error");
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(typeof result.retryable).toBe("boolean");
    });

    it("should handle case-insensitive error classification", () => {
      const error = new LlmProviderError(
        "NETWORK CONNECTION FAILED",
        mockProvider,
      );
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.type).toBe(ChatErrorType.NETWORK_ERROR);
    });
  });

  describe("fromGenericError", () => {
    it("should classify generic timeout errors", () => {
      const error = new Error("operation timeout");
      const result = ErrorMapper.fromGenericError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.type).toBe(ChatErrorType.TIMEOUT_ERROR);
      expect(result.provider).toBe("unknown");
    });

    it("should classify generic network errors", () => {
      const error = new Error("network connection failed");
      const result = ErrorMapper.fromGenericError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.type).toBe(ChatErrorType.NETWORK_ERROR);
    });

    it("should classify generic validation errors", () => {
      const error = new Error("invalid input data");
      const result = ErrorMapper.fromGenericError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.type).toBe(ChatErrorType.VALIDATION_ERROR);
    });

    it("should default to unknown error for generic errors", () => {
      const error = new Error("some random error");
      const result = ErrorMapper.fromGenericError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.type).toBe(ChatErrorType.UNKNOWN_ERROR);
    });

    it("should accept custom provider name", () => {
      const error = new Error("test error");
      const customProvider = "anthropic";
      const result = ErrorMapper.fromGenericError(
        error,
        mockConversationId,
        mockAgentId,
        customProvider,
      );

      expect(result.provider).toBe(customProvider);
    });
  });

  describe("error classification patterns", () => {
    const testCases = [
      // Network errors
      { message: "ECONNREFUSED", expected: ChatErrorType.NETWORK_ERROR },
      { message: "ENOTFOUND", expected: ChatErrorType.NETWORK_ERROR },
      { message: "connection refused", expected: ChatErrorType.NETWORK_ERROR },

      // Auth errors
      { message: "401 unauthorized", expected: ChatErrorType.AUTH_ERROR },
      { message: "authentication failed", expected: ChatErrorType.AUTH_ERROR },
      { message: "invalid key provided", expected: ChatErrorType.AUTH_ERROR },

      // Rate limit errors
      {
        message: "429 too many requests",
        expected: ChatErrorType.RATE_LIMIT_ERROR,
      },
      { message: "quota exceeded", expected: ChatErrorType.RATE_LIMIT_ERROR },
      { message: "throttled", expected: ChatErrorType.RATE_LIMIT_ERROR },

      // Validation errors
      { message: "400 bad request", expected: ChatErrorType.VALIDATION_ERROR },
      { message: "malformed json", expected: ChatErrorType.VALIDATION_ERROR },
      {
        message: "validation error occurred",
        expected: ChatErrorType.VALIDATION_ERROR,
      },

      // Timeout errors
      { message: "ETIMEDOUT", expected: ChatErrorType.TIMEOUT_ERROR },
      {
        message: "request took too long",
        expected: ChatErrorType.TIMEOUT_ERROR,
      },

      // Provider errors
      {
        message: "500 internal server error",
        expected: ChatErrorType.PROVIDER_ERROR,
      },
      { message: "502 bad gateway", expected: ChatErrorType.PROVIDER_ERROR },
      {
        message: "503 service unavailable",
        expected: ChatErrorType.PROVIDER_ERROR,
      },
      {
        message: "504 gateway timeout",
        expected: ChatErrorType.PROVIDER_ERROR,
      },
    ];

    testCases.forEach(({ message, expected }) => {
      it(`should classify "${message}" as ${expected}`, () => {
        const error = new LlmProviderError(message, mockProvider);
        const result = ErrorMapper.fromLlmProviderError(
          error,
          mockConversationId,
          mockAgentId,
        );
        expect(result.type).toBe(expected);
      });
    });
  });

  describe("retryable classification", () => {
    it("should mark network errors as retryable", () => {
      const error = new LlmProviderError("network error", mockProvider);
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );
      expect(result.retryable).toBe(true);
    });

    it("should mark auth errors as non-retryable", () => {
      const error = new LlmProviderError("unauthorized", mockProvider);
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );
      expect(result.retryable).toBe(false);
    });

    it("should mark validation errors as non-retryable", () => {
      const error = new LlmProviderError("invalid request", mockProvider);
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );
      expect(result.retryable).toBe(false);
    });

    it("should mark unknown errors as non-retryable", () => {
      const error = new LlmProviderError("mystery error", mockProvider);
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );
      expect(result.retryable).toBe(false);
    });
  });

  describe("security requirements", () => {
    it("should not expose sensitive information in user messages", () => {
      const error = new LlmProviderError(
        "API key sk-123456 is invalid",
        mockProvider,
      );
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.userMessage).not.toContain("sk-123456");
      expect(result.userMessage).not.toContain("API key");
      expect(result.userMessage).toBe(
        "Agent agent-456: Authentication failed. Please check your API configuration.",
      );
    });

    it("should preserve technical details for logging while keeping user message safe", () => {
      const sensitiveMessage =
        "Connection failed to https://internal.api.com/v1/chat";
      const error = new LlmProviderError(sensitiveMessage, mockProvider);
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.technicalDetails).toBe(sensitiveMessage);
      expect(result.userMessage).not.toContain("internal.api.com");
      expect(result.userMessage).toBe(
        "Agent agent-456: Unable to connect to AI service. Please check your connection and try again.",
      );
    });

    it("should not reveal system architecture in user messages", () => {
      const error = new LlmProviderError(
        "Database connection pool exhausted",
        mockProvider,
      );
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.userMessage).not.toContain("Database");
      expect(result.userMessage).not.toContain("pool");
      expect(result.userMessage).toBe(
        "Agent agent-456: An unexpected error occurred. Please try again.",
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty error messages", () => {
      const error = new LlmProviderError("", mockProvider);
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.type).toBe(ChatErrorType.UNKNOWN_ERROR);
      expect(result.technicalDetails).toBe("");
    });

    it("should handle null/undefined provider", () => {
      const error = new LlmProviderError("test error");
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.provider).toBe("unknown");
    });

    it("should handle very long agent IDs", () => {
      const longAgentId = "a".repeat(100);
      const error = new LlmProviderError("test error", mockProvider);
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        longAgentId,
      );

      expect(result.agentId).toBe(longAgentId);
      expect(result.userMessage).toContain(`Agent ${longAgentId}:`);
    });

    it("should handle special characters in error messages", () => {
      const error = new LlmProviderError(
        "Error: <script>alert('xss')</script>",
        mockProvider,
      );
      const result = ErrorMapper.fromLlmProviderError(
        error,
        mockConversationId,
        mockAgentId,
      );

      expect(result.technicalDetails).toBe(
        "Error: <script>alert('xss')</script>",
      );
      expect(result.userMessage).not.toContain("<script>");
    });
  });
});
