import type { LlmBridgeInterface } from "../LlmBridgeInterface";
import type { FormattedMessage } from "../../../llm/interfaces";

/**
 * Test suite for LlmBridgeInterface contract and type safety.
 * These tests verify the interface compiles correctly and maintains type safety.
 */

describe("LlmBridgeInterface", () => {
  // Mock implementation for testing interface compliance
  const createMockBridge = (): LlmBridgeInterface => ({
    async sendToProvider(
      agentConfig: { llmConfigId: string; model: string },
      context: { systemPrompt: string; messages: FormattedMessage[] },
    ): Promise<string> {
      // Mock implementation - returns simulated response
      return `Agent response for ${agentConfig.llmConfigId} with model ${agentConfig.model}: ${context.messages.length} messages processed`;
    },
  });

  describe("Interface Compliance", () => {
    it("should implement all required methods", () => {
      const bridge = createMockBridge();

      // Required method must exist
      expect(typeof bridge.sendToProvider).toBe("function");
    });

    it("should define correct method signatures for sendToProvider", async () => {
      const bridge = createMockBridge();

      // Should accept proper parameter types
      const agentConfig = {
        llmConfigId: "test-provider-id",
        model: "test-model",
      };
      const context = {
        systemPrompt: "You are a test assistant.",
        messages: [
          { role: "user" as const, content: "Hello" },
          { role: "assistant" as const, content: "Hi there!" },
        ],
      };

      const result = await bridge.sendToProvider(agentConfig, context);

      // Should return string
      expect(typeof result).toBe("string");
      expect(result).toBeTruthy();
    });
  });

  describe("Type Safety Tests", () => {
    let bridge: LlmBridgeInterface;

    beforeEach(() => {
      bridge = createMockBridge();
    });

    it("should accept proper parameter types", async () => {
      // Agent config with llmConfigId
      const agentConfig = { llmConfigId: "openai-gpt-4", model: "gpt-4" };

      // Context with system prompt and formatted messages
      const context = {
        systemPrompt:
          "You are a helpful assistant specializing in code review.",
        messages: [
          { role: "user" as const, content: "Please review this code snippet" },
          {
            role: "assistant" as const,
            content: "I'd be happy to help review your code.",
          },
          {
            role: "user" as const,
            content: "function add(a, b) { return a + b; }",
          },
        ],
      };

      const response = await bridge.sendToProvider(agentConfig, context);
      expect(typeof response).toBe("string");
    });

    it("should return Promise<string> type", async () => {
      const bridge = createMockBridge();
      const agentConfig = {
        llmConfigId: "anthropic-claude",
        model: "claude-3-5-sonnet",
      };
      const context = {
        systemPrompt: "You are a creative writing assistant.",
        messages: [],
      };

      // Method should return a Promise
      const promise = bridge.sendToProvider(agentConfig, context);
      expect(promise).toBeInstanceOf(Promise);

      // Promise should resolve to string
      const result = await promise;
      expect(typeof result).toBe("string");
    });

    it("should support dependency injection patterns", () => {
      // Interface should work with dependency injection
      class TestService {
        constructor(private llmBridge: LlmBridgeInterface) {}

        async processMessage(
          agentConfig: { llmConfigId: string; model: string },
          prompt: string,
        ): Promise<string> {
          const context = {
            systemPrompt: "Test system prompt",
            messages: [{ role: "user" as const, content: prompt }],
          };
          return this.llmBridge.sendToProvider(agentConfig, context);
        }
      }

      const bridge = createMockBridge();
      const service = new TestService(bridge);

      expect(service).toBeDefined();
      expect(typeof service.processMessage).toBe("function");
    });
  });

  describe("Method Parameter Tests", () => {
    let bridge: LlmBridgeInterface;

    beforeEach(() => {
      bridge = createMockBridge();
    });

    it("should accept various llmConfigId formats", async () => {
      const contexts = {
        systemPrompt: "Test prompt",
        messages: [] as FormattedMessage[],
      };

      // Different provider ID formats should be accepted
      await bridge.sendToProvider(
        { llmConfigId: "openai-gpt-4", model: "gpt-4" },
        contexts,
      );
      await bridge.sendToProvider(
        {
          llmConfigId: "anthropic-claude-3-5-sonnet",
          model: "claude-3-5-sonnet",
        },
        contexts,
      );
      await bridge.sendToProvider(
        { llmConfigId: "custom-provider-123", model: "custom-model" },
        contexts,
      );
    });

    it("should handle empty and populated message arrays", async () => {
      const agentConfig = { llmConfigId: "test-provider", model: "test-model" };

      // Empty messages array
      const emptyContext = {
        systemPrompt: "You are a helpful assistant.",
        messages: [] as FormattedMessage[],
      };

      const emptyResponse = await bridge.sendToProvider(
        agentConfig,
        emptyContext,
      );
      expect(typeof emptyResponse).toBe("string");

      // Populated messages array
      const populatedContext = {
        systemPrompt: "You are a code reviewer.",
        messages: [
          { role: "user" as const, content: "Review this function" },
          {
            role: "assistant" as const,
            content: "I'll help review your code.",
          },
          {
            role: "user" as const,
            content: "function multiply(x, y) { return x * y; }",
          },
        ],
      };

      const populatedResponse = await bridge.sendToProvider(
        agentConfig,
        populatedContext,
      );
      expect(typeof populatedResponse).toBe("string");
    });

    it("should accept various system prompt formats", async () => {
      const agentConfig = { llmConfigId: "test-provider", model: "test-model" };
      const messages = [{ role: "user" as const, content: "Test message" }];

      // Different system prompt styles should work
      await bridge.sendToProvider(agentConfig, {
        systemPrompt: "You are a helpful assistant.",
        messages,
      });

      await bridge.sendToProvider(agentConfig, {
        systemPrompt:
          "Role: Creative writing assistant\nPersonality: Enthusiastic and imaginative\nTask: Help with storytelling",
        messages,
      });

      await bridge.sendToProvider(agentConfig, {
        systemPrompt: "", // Empty system prompt should be allowed
        messages,
      });
    });
  });

  describe("Usage Pattern Tests", () => {
    it("should work in multi-agent orchestration scenarios", async () => {
      const bridge = createMockBridge();

      // Simulate multiple agents processing same user message
      const userMessage = {
        role: "user" as const,
        content: "Explain quantum computing",
      };

      const agents = [
        {
          llmConfigId: "scientist-agent",
          systemPrompt: "You are a quantum physicist.",
        },
        {
          llmConfigId: "educator-agent",
          systemPrompt: "You are an educational tutor.",
        },
        {
          llmConfigId: "technical-agent",
          systemPrompt: "You are a technical writer.",
        },
      ];

      // Should support parallel processing
      const responses = await Promise.all(
        agents.map((agent) =>
          bridge.sendToProvider(
            { llmConfigId: agent.llmConfigId, model: "test-model" },
            { systemPrompt: agent.systemPrompt, messages: [userMessage] },
          ),
        ),
      );

      expect(responses).toHaveLength(3);
      responses.forEach((response) => {
        expect(typeof response).toBe("string");
        expect(response).toBeTruthy();
      });
    });

    it("should support conversation context building", async () => {
      const bridge = createMockBridge();
      const agentConfig = {
        llmConfigId: "conversation-agent",
        model: "conversation-model",
      };

      // Build context from conversation history
      const conversationHistory: FormattedMessage[] = [
        { role: "user", content: "What's 2+2?" },
        { role: "assistant", content: "2+2 equals 4." },
        { role: "user", content: "What about 3+3?" },
        { role: "assistant", content: "3+3 equals 6." },
        { role: "user", content: "Can you explain the pattern?" },
      ];

      const context = {
        systemPrompt: "You are a math tutor who explains concepts clearly.",
        messages: conversationHistory,
      };

      const response = await bridge.sendToProvider(agentConfig, context);
      expect(typeof response).toBe("string");
    });

    it("should handle error scenarios gracefully", async () => {
      // Mock implementation that throws errors
      const errorBridge: LlmBridgeInterface = {
        async sendToProvider(): Promise<string> {
          throw new Error("Provider API unavailable");
        },
      };

      const agentConfig = {
        llmConfigId: "failing-provider",
        model: "failing-model",
      };
      const context = {
        systemPrompt: "Test prompt",
        messages: [{ role: "user" as const, content: "Test" }],
      };

      // Should propagate errors for orchestration service to handle
      await expect(
        errorBridge.sendToProvider(agentConfig, context),
      ).rejects.toThrow("Provider API unavailable");
    });
  });
});
