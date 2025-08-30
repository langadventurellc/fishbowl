import { ChatOrchestrationService } from "../ChatOrchestrationService";
import type { LlmBridgeInterface } from "../interfaces/LlmBridgeInterface";
import type { MessageRepository } from "../../../repositories/messages/MessageRepository";
import type { ConversationAgentsRepository } from "../../../repositories/conversationAgents/ConversationAgentsRepository";
import type { SystemPromptFactory } from "../../../prompts/system/SystemPromptFactory";
import type { MessageFormatterService } from "../../llm/services/MessageFormatterService";
import type { PersistedAgentData } from "../../../types/agents/PersistedAgentData";
import type { Message } from "../../../types/messages";
import type { ConversationAgent } from "../../../types/conversationAgents";
import type { FormattedMessage } from "../../llm/interfaces/FormattedMessage";
import type { AgentProcessingResult } from "../types/AgentProcessingResult";
import { LlmProviderError } from "../../llm/errors/LlmProviderError";
import { ChatErrorType } from "../errors/ChatErrorType";

// Mock logger
jest.mock("../../../logging/createLoggerSync", () => ({
  createLoggerSync: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe("ChatOrchestrationService", () => {
  let service: ChatOrchestrationService;
  let mockLlmBridge: jest.Mocked<LlmBridgeInterface>;
  let mockMessageRepository: jest.Mocked<MessageRepository>;
  let mockConversationAgentsRepository: jest.Mocked<ConversationAgentsRepository>;
  let mockSystemPromptFactory: jest.Mocked<SystemPromptFactory>;
  let mockMessageFormatterService: jest.Mocked<MessageFormatterService>;
  let mockAgentsResolver: jest.MockedFunction<
    (agentId: string) => Promise<PersistedAgentData>
  >;

  const mockConversationId = "conv-123";
  const mockUserMessageId = "msg-456";
  const mockAgentId1 = "agent-1";
  const mockAgentId2 = "agent-2";

  beforeEach(() => {
    // Create fresh mocks for each test
    mockLlmBridge = {
      sendToProvider: jest.fn(),
    } as unknown as jest.Mocked<LlmBridgeInterface>;

    mockMessageRepository = {
      create: jest.fn(),
      get: jest.fn(),
      getByConversation: jest.fn(),
      updateInclusion: jest.fn(),
      exists: jest.fn(),
    } as unknown as jest.Mocked<MessageRepository>;

    mockConversationAgentsRepository = {
      create: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      findByConversationId: jest.fn(),
      findByAgentId: jest.fn(),
      getEnabledByConversationId: jest.fn(),
      existsAssociation: jest.fn(),
      getOrderedAgents: jest.fn(),
      deleteByConversationId: jest.fn(),
      getAgentCountByConversation: jest.fn(),
    } as unknown as jest.Mocked<ConversationAgentsRepository>;

    mockSystemPromptFactory = {
      createSystemPrompt: jest.fn(),
    } as unknown as jest.Mocked<SystemPromptFactory>;

    mockMessageFormatterService = {
      formatMessages: jest.fn(),
    } as unknown as jest.Mocked<MessageFormatterService>;

    mockAgentsResolver = jest.fn();

    service = new ChatOrchestrationService(
      mockLlmBridge,
      mockMessageRepository,
      mockConversationAgentsRepository,
      mockSystemPromptFactory,
      mockMessageFormatterService,
      mockAgentsResolver,
    );
  });

  describe("processUserMessage", () => {
    it("should process multiple enabled agents in parallel", async () => {
      const mockEnabledAgents: ConversationAgent[] = [
        {
          id: "ca-1",
          conversation_id: mockConversationId,
          agent_id: mockAgentId1,
          added_at: "2023-01-01T00:00:00.000Z",
          is_active: true,
          enabled: true,
          display_order: 0,
        },
        {
          id: "ca-2",
          conversation_id: mockConversationId,
          agent_id: mockAgentId2,
          added_at: "2023-01-01T00:01:00.000Z",
          is_active: true,
          enabled: true,
          display_order: 1,
        },
      ];

      const agent1: PersistedAgentData = {
        id: mockAgentId1,
        name: "Agent 1",
        llmConfigId: "config-1",
        model: "gpt-4",
        role: "assistant",
        personality: "helpful",
      };

      const agent2: PersistedAgentData = {
        id: mockAgentId2,
        name: "Agent 2",
        llmConfigId: "config-2",
        model: "claude-3",
        role: "critic",
        personality: "analytical",
      };

      // Setup mocks
      mockConversationAgentsRepository.getEnabledByConversationId.mockResolvedValue(
        mockEnabledAgents,
      );
      mockMessageRepository.getByConversation.mockResolvedValue([]);
      mockConversationAgentsRepository.findByConversationId.mockResolvedValue(
        mockEnabledAgents,
      );
      mockAgentsResolver.mockImplementation(async (agentId: string) => {
        if (agentId === mockAgentId1) return agent1;
        if (agentId === mockAgentId2) return agent2;
        throw new Error(`Unknown agent: ${agentId}`);
      });
      mockSystemPromptFactory.createSystemPrompt.mockResolvedValue(
        "Generated system prompt",
      );
      mockMessageFormatterService.formatMessages.mockReturnValue([]);
      mockLlmBridge.sendToProvider
        .mockResolvedValueOnce("Response from Agent 1")
        .mockResolvedValueOnce("Response from Agent 2");
      mockMessageRepository.create
        .mockResolvedValueOnce({
          id: "msg-resp-1",
          conversation_id: mockConversationId,
          conversation_agent_id: "ca-1",
          role: "agent",
          content: "Response from Agent 1",
          included: true,
          created_at: "2023-01-01T00:02:00.000Z",
        } as Message)
        .mockResolvedValueOnce({
          id: "msg-resp-2",
          conversation_id: mockConversationId,
          conversation_agent_id: "ca-2",
          role: "agent",
          content: "Response from Agent 2",
          included: true,
          created_at: "2023-01-01T00:02:01.000Z",
        } as Message);

      const result = await service.processUserMessage(
        mockConversationId,
        mockUserMessageId,
      );

      expect(result.totalAgents).toBe(2);
      expect(result.successfulAgents).toBe(2);
      expect(result.failedAgents).toBe(0);
      expect(result.agentResults).toHaveLength(2);
      expect(mockLlmBridge.sendToProvider).toHaveBeenCalledTimes(2);
      expect(mockMessageRepository.create).toHaveBeenCalledTimes(2);
    });

    it("should return early when no agents enabled", async () => {
      mockConversationAgentsRepository.getEnabledByConversationId.mockResolvedValue(
        [],
      );

      const result = await service.processUserMessage(
        mockConversationId,
        mockUserMessageId,
      );

      expect(result.totalAgents).toBe(0);
      expect(result.successfulAgents).toBe(0);
      expect(result.failedAgents).toBe(0);
      expect(result.agentResults).toHaveLength(0);
      expect(mockLlmBridge.sendToProvider).not.toHaveBeenCalled();
      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("buildAgentContext", () => {
    const mockMessages: Message[] = [
      {
        id: "msg-1",
        conversation_id: mockConversationId,
        conversation_agent_id: null,
        role: "user",
        content: "Hello everyone",
        included: true,
        created_at: "2023-01-01T00:00:00.000Z",
      },
    ];

    const mockConversationAgents: ConversationAgent[] = [
      {
        id: "ca-1",
        conversation_id: mockConversationId,
        agent_id: mockAgentId1,
        added_at: "2023-01-01T00:00:00.000Z",
        is_active: true,
        enabled: true,
        display_order: 0,
      },
    ];

    it("should build valid context with system prompt and formatted messages", async () => {
      const targetAgent: PersistedAgentData = {
        id: mockAgentId1,
        name: "Agent 1",
        llmConfigId: "config-1",
        model: "gpt-4",
        role: "assistant",
        personality: "helpful",
      };

      // Setup mocks
      mockMessageRepository.getByConversation.mockResolvedValue(mockMessages);
      mockConversationAgentsRepository.findByConversationId.mockResolvedValue(
        mockConversationAgents,
      );
      mockAgentsResolver.mockResolvedValue(targetAgent);
      mockSystemPromptFactory.createSystemPrompt.mockResolvedValue(
        "Generated system prompt",
      );

      const mockFormattedMessages: FormattedMessage[] = [
        { role: "user", content: "Hello everyone" },
      ];
      mockMessageFormatterService.formatMessages.mockReturnValue(
        mockFormattedMessages,
      );

      const result = await service.buildAgentContext(
        mockConversationId,
        mockAgentId1,
      );

      expect(result.systemPrompt).toBe("Generated system prompt");
      expect(result.messages).toEqual(mockFormattedMessages);
      expect(mockSystemPromptFactory.createSystemPrompt).toHaveBeenCalledWith(
        targetAgent,
        [], // No other participants in this test
      );
    });
  });

  describe("error handling integration", () => {
    const mockUserMessage: Message = {
      id: mockUserMessageId,
      conversation_id: mockConversationId,
      conversation_agent_id: null,
      role: "user",
      content: "Test message",
      included: true,
      created_at: "2023-01-01T00:00:00.000Z",
    };

    const mockAgent: PersistedAgentData = {
      id: mockAgentId1,
      name: "Test Agent",
      llmConfigId: "config-1",
      model: "gpt-4",
      role: "assistant",
      personality: "helpful",
    };

    const mockConversationAgents: ConversationAgent[] = [
      {
        id: "ca-1",
        conversation_id: mockConversationId,
        agent_id: mockAgentId1,
        added_at: "2023-01-01T00:00:00.000Z",
        is_active: true,
        enabled: true,
        display_order: 0,
      },
    ];

    beforeEach(() => {
      // Setup common mocks
      mockMessageRepository.get.mockResolvedValue(mockUserMessage);
      mockConversationAgentsRepository.getEnabledByConversationId.mockResolvedValue(
        mockConversationAgents,
      );
      mockConversationAgentsRepository.findByConversationId.mockResolvedValue(
        mockConversationAgents,
      );
      mockAgentsResolver.mockResolvedValue(mockAgent);
      mockSystemPromptFactory.createSystemPrompt.mockResolvedValue(
        "System prompt",
      );
      mockMessageFormatterService.formatMessages.mockReturnValue([
        { role: "user", content: "Test message" },
      ]);
      mockMessageRepository.getByConversation.mockResolvedValue([
        mockUserMessage,
      ]);
      mockMessageRepository.create.mockResolvedValue({
        id: "created-msg",
      } as Message);
    });

    describe("LlmProviderError handling", () => {
      it("should handle network errors and persist system message", async () => {
        const networkError = new LlmProviderError(
          "Network connection failed",
          "openai",
        );
        mockLlmBridge.sendToProvider.mockRejectedValue(networkError);

        const results = await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
        );

        expect(results.agentResults).toHaveLength(1);
        expect(results.agentResults[0]!.success).toBe(false);
        expect(results.agentResults[0]!.error).toMatch(
          /Test Agent:.*connect.*AI service/,
        );

        // Verify system message was persisted
        expect(mockMessageRepository.create).toHaveBeenCalledWith({
          conversation_id: mockConversationId,
          conversation_agent_id: undefined,
          role: "system",
          content: expect.stringMatching(
            /Agent Test Agent:.*connect.*AI service/,
          ),
          included: true,
        });
      });

      it("should handle authentication errors correctly", async () => {
        const authError = new LlmProviderError(
          "Authentication failed - invalid API key",
          "anthropic",
        );
        mockLlmBridge.sendToProvider.mockRejectedValue(authError);

        const results = await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
        );

        expect(results.agentResults).toHaveLength(1);
        expect(results.agentResults[0]!.success).toBe(false);
        expect(results.agentResults[0]!.error).toMatch(
          /Test Agent:.*Authentication failed/,
        );

        // Verify system message was persisted
        expect(mockMessageRepository.create).toHaveBeenCalledWith({
          conversation_id: mockConversationId,
          conversation_agent_id: undefined,
          role: "system",
          content: expect.stringMatching(
            /Agent Test Agent:.*Authentication failed/,
          ),
          included: true,
        });
      });

      it("should handle rate limit errors", async () => {
        const rateLimitError = new LlmProviderError(
          "Rate limit exceeded - too many requests",
          "openai",
        );
        mockLlmBridge.sendToProvider.mockRejectedValue(rateLimitError);

        const results = await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
        );

        expect(results.agentResults[0]!.error).toMatch(
          /Test Agent:.*Too many requests/,
        );
      });

      it("should handle provider errors", async () => {
        const providerError = new LlmProviderError(
          "Internal server error - 500",
          "anthropic",
        );
        mockLlmBridge.sendToProvider.mockRejectedValue(providerError);

        const results = await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
        );

        expect(results.agentResults[0]!.error).toMatch(
          /Test Agent:.*temporarily unavailable/,
        );
      });
    });

    describe("Generic Error handling", () => {
      it("should handle generic timeout errors", async () => {
        const timeoutError = new Error("Request timeout occurred");
        mockLlmBridge.sendToProvider.mockRejectedValue(timeoutError);

        const results = await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
        );

        expect(results.agentResults[0]!.success).toBe(false);
        expect(results.agentResults[0]!.error).toMatch(
          /Test Agent:.*timed out/,
        );
      });

      it("should handle unknown errors", async () => {
        const unknownError = new Error("Some unexpected error");
        mockLlmBridge.sendToProvider.mockRejectedValue(unknownError);

        const results = await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
        );

        expect(results.agentResults[0]!.error).toMatch(
          /Test Agent:.*unexpected error occurred/,
        );
      });

      it("should handle non-Error objects", async () => {
        mockLlmBridge.sendToProvider.mockRejectedValue("String error");

        const results = await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
        );

        expect(results.agentResults[0]!.success).toBe(false);
        expect(results.agentResults[0]!.error).toMatch(
          /Test Agent:.*unexpected error occurred/,
        );
      });
    });

    describe("Agent name resolution", () => {
      it("should use agent name when resolution succeeds", async () => {
        const error = new LlmProviderError("Network error", "openai");
        mockLlmBridge.sendToProvider.mockRejectedValue(error);

        const results = await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
        );

        expect(results.agentResults[0]!.error).toContain("Agent Test Agent:");
      });

      it("should fallback to agent ID when name resolution fails", async () => {
        const error = new LlmProviderError("Network error", "openai");
        mockLlmBridge.sendToProvider.mockRejectedValue(error);
        mockAgentsResolver.mockRejectedValue(new Error("Agent not found"));

        const results = await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
        );

        expect(results.agentResults[0]!.error).toContain(
          `Agent ${mockAgentId1}:`,
        );
      });

      it("should use agent ID when agent has no name property", async () => {
        const agentWithoutName = { ...mockAgent, name: "" };
        mockAgentsResolver.mockResolvedValue(agentWithoutName);
        const error = new LlmProviderError("Network error", "openai");
        mockLlmBridge.sendToProvider.mockRejectedValue(error);

        const results = await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
        );

        expect(results.agentResults[0]!.error).toContain(
          `Agent ${mockAgentId1}:`,
        );
      });
    });

    describe("System message persistence", () => {
      it("should gracefully handle system message creation failures", async () => {
        const error = new LlmProviderError("Network error", "openai");
        mockLlmBridge.sendToProvider.mockRejectedValue(error);
        mockMessageRepository.create
          .mockResolvedValueOnce({ id: "success-msg" } as Message) // First call for agent response (won't happen due to error)
          .mockRejectedValueOnce(new Error("Database error")); // Second call for system message fails

        const results = await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
        );

        // Should still return error result despite system message failure
        expect(results.agentResults[0]!.success).toBe(false);
        expect(results.agentResults[0]!.error).toContain("Test Agent:");

        // Verify error was logged for system message failure
        expect(mockMessageRepository.create).toHaveBeenCalledWith({
          conversation_id: mockConversationId,
          conversation_agent_id: undefined,
          role: "system",
          content: expect.any(String),
          included: true,
        });
      });
    });

    describe("Partial failure scenarios", () => {
      it("should handle mixed success and failure for multiple agents", async () => {
        // Setup second agent
        const mockAgent2: PersistedAgentData = {
          id: mockAgentId2,
          name: "Agent Two",
          llmConfigId: "config-2",
          model: "gpt-4",
          role: "assistant",
          personality: "analytical",
        };

        const conversationAgentsWithTwo = [
          ...mockConversationAgents,
          {
            id: "ca-2",
            conversation_id: mockConversationId,
            agent_id: mockAgentId2,
            added_at: "2023-01-01T00:00:00.000Z",
            is_active: true,
            enabled: true,
            display_order: 1,
          },
        ];

        mockConversationAgentsRepository.getEnabledByConversationId.mockResolvedValue(
          conversationAgentsWithTwo,
        );

        // First agent succeeds
        mockAgentsResolver.mockImplementation((agentId: string) => {
          if (agentId === mockAgentId1) return Promise.resolve(mockAgent);
          if (agentId === mockAgentId2) return Promise.resolve(mockAgent2);
          return Promise.reject(new Error("Unknown agent"));
        });

        // First agent succeeds, second agent fails
        mockLlmBridge.sendToProvider
          .mockResolvedValueOnce("Success response") // Agent 1
          .mockRejectedValueOnce(
            new LlmProviderError("Network error", "openai"),
          ); // Agent 2

        mockMessageRepository.create.mockResolvedValue({
          id: "saved-msg",
        } as Message);

        const results = await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
        );

        expect(results.agentResults).toHaveLength(2);

        // First agent succeeded
        const agent1Result = results.agentResults.find(
          (r: AgentProcessingResult) => r.agentId === mockAgentId1,
        );
        expect(agent1Result?.success).toBe(true);
        expect(agent1Result?.response).toBe("Success response");

        // Second agent failed
        const agent2Result = results.agentResults.find(
          (r: AgentProcessingResult) => r.agentId === mockAgentId2,
        );
        expect(agent2Result?.success).toBe(false);
        expect(agent2Result?.error).toContain("Agent Two:");

        // Overall result should indicate partial failure (some failed)
        expect(results.failedAgents).toBe(1);
        expect(results.successfulAgents).toBe(1);
      });
    });

    describe("Event callback integration", () => {
      const mockEventCallback = jest.fn();
      const mockConversationAgents: ConversationAgent[] = [
        {
          id: "ca-1",
          conversation_id: mockConversationId,
          agent_id: mockAgentId1,
          added_at: "2023-01-01T00:00:00.000Z",
          is_active: true,
          enabled: true,
          display_order: 0,
        },
      ];

      beforeEach(() => {
        mockEventCallback.mockClear();
        mockConversationAgentsRepository.getEnabledByConversationId.mockResolvedValue(
          mockConversationAgents,
        );
        mockConversationAgentsRepository.findByConversationId.mockResolvedValue(
          mockConversationAgents,
        );
        mockMessageRepository.getByConversation.mockResolvedValue([
          mockUserMessage,
        ]);
        mockAgentsResolver.mockResolvedValue(mockAgent);
        mockSystemPromptFactory.createSystemPrompt.mockResolvedValue(
          "System prompt",
        );
        mockMessageFormatterService.formatMessages.mockReturnValue([
          { role: "user", content: "Test message" },
        ]);
      });

      it("should emit thinking, complete events for successful agent processing", async () => {
        mockLlmBridge.sendToProvider.mockResolvedValue("Success response");
        mockMessageRepository.create.mockResolvedValue({
          id: "saved-msg-123",
        } as Message);

        await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
          mockEventCallback,
        );

        expect(mockEventCallback).toHaveBeenCalledTimes(2);

        // First call should be thinking event
        expect(mockEventCallback).toHaveBeenNthCalledWith(1, {
          conversationAgentId: "ca-1",
          status: "thinking",
          agentName: "Test Agent",
        });

        // Second call should be complete event
        expect(mockEventCallback).toHaveBeenNthCalledWith(2, {
          conversationAgentId: "ca-1",
          status: "complete",
          messageId: "saved-msg-123",
          agentName: "Test Agent",
        });
      });

      it("should emit thinking, error events for failed agent processing", async () => {
        const networkError = new LlmProviderError("Network error", "openai");
        mockLlmBridge.sendToProvider.mockRejectedValue(networkError);
        mockMessageRepository.create.mockResolvedValue({
          id: "system-msg",
        } as Message);

        await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
          mockEventCallback,
        );

        expect(mockEventCallback).toHaveBeenCalledTimes(2);

        // First call should be thinking event
        expect(mockEventCallback).toHaveBeenNthCalledWith(1, {
          conversationAgentId: "ca-1",
          status: "thinking",
          agentName: "Test Agent",
        });

        // Second call should be error event
        expect(mockEventCallback).toHaveBeenNthCalledWith(2, {
          conversationAgentId: "ca-1",
          status: "error",
          error: expect.stringMatching(/Test Agent:.*connect.*AI service/),
          agentName: "Test Agent",
          errorType: "network",
          retryable: true,
        });
      });

      it("should map different error types correctly in events", async () => {
        const authError = new LlmProviderError(
          "Authentication failed - invalid API key",
          "anthropic",
        );
        mockLlmBridge.sendToProvider.mockRejectedValue(authError);
        mockMessageRepository.create.mockResolvedValue({
          id: "system-msg",
        } as Message);

        await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
          mockEventCallback,
        );

        const errorEventCall = mockEventCallback.mock.calls.find(
          (call) => call[0].status === "error",
        );
        expect(errorEventCall[0]).toMatchObject({
          status: "error",
          errorType: "auth",
          retryable: false,
          agentName: "Test Agent",
        });
      });

      it("should handle agent name resolution failure in events", async () => {
        mockAgentsResolver.mockRejectedValue(new Error("Agent not found"));
        const error = new LlmProviderError("Network error", "openai");
        mockLlmBridge.sendToProvider.mockRejectedValue(error);
        mockMessageRepository.create.mockResolvedValue({
          id: "system-msg",
        } as Message);

        await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
          mockEventCallback,
        );

        // Should still emit events with fallback agent name
        const thinkingCall = mockEventCallback.mock.calls.find(
          (call) => call[0].status === "thinking",
        );
        expect(thinkingCall[0].agentName).toBe(`Agent ${mockAgentId1}`);

        const errorCall = mockEventCallback.mock.calls.find(
          (call) => call[0].status === "error",
        );
        expect(errorCall[0].agentName).toBe(`Agent ${mockAgentId1}`);
      });

      it("should work without event callback (backward compatibility)", async () => {
        mockLlmBridge.sendToProvider.mockResolvedValue("Success response");
        mockMessageRepository.create.mockResolvedValue({
          id: "saved-msg",
        } as Message);

        // Call without event callback should not throw
        const result = await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
        );

        expect(result.successfulAgents).toBe(1);
        expect(result.failedAgents).toBe(0);
      });

      it("should emit events for multiple agents in parallel", async () => {
        const mockAgent2: PersistedAgentData = {
          id: mockAgentId2,
          name: "Agent Two",
          llmConfigId: "config-2",
          model: "gpt-4",
          role: "assistant",
          personality: "analytical",
        };

        const conversationAgentsWithTwo = [
          ...mockConversationAgents,
          {
            id: "ca-2",
            conversation_id: mockConversationId,
            agent_id: mockAgentId2,
            added_at: "2023-01-01T00:00:00.000Z",
            is_active: true,
            enabled: true,
            display_order: 1,
          },
        ];

        mockConversationAgentsRepository.getEnabledByConversationId.mockResolvedValue(
          conversationAgentsWithTwo,
        );

        mockAgentsResolver.mockImplementation((agentId: string) => {
          if (agentId === mockAgentId1) return Promise.resolve(mockAgent);
          if (agentId === mockAgentId2) return Promise.resolve(mockAgent2);
          return Promise.reject(new Error("Unknown agent"));
        });

        mockLlmBridge.sendToProvider
          .mockResolvedValueOnce("Response from Agent 1")
          .mockResolvedValueOnce("Response from Agent 2");

        mockMessageRepository.create.mockResolvedValue({
          id: "saved-msg",
        } as Message);

        await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
          mockEventCallback,
        );

        // Should have 4 total events: thinking + complete for each agent
        expect(mockEventCallback).toHaveBeenCalledTimes(4);

        // Verify thinking events for both agents
        const thinkingEvents = mockEventCallback.mock.calls.filter(
          (call) => call[0].status === "thinking",
        );
        expect(thinkingEvents).toHaveLength(2);
        expect(
          thinkingEvents.some((call) => call[0].agentName === "Test Agent"),
        ).toBe(true);
        expect(
          thinkingEvents.some((call) => call[0].agentName === "Agent Two"),
        ).toBe(true);

        // Verify complete events for both agents
        const completeEvents = mockEventCallback.mock.calls.filter(
          (call) => call[0].status === "complete",
        );
        expect(completeEvents).toHaveLength(2);
        expect(
          completeEvents.some((call) => call[0].agentName === "Test Agent"),
        ).toBe(true);
        expect(
          completeEvents.some((call) => call[0].agentName === "Agent Two"),
        ).toBe(true);
      });

      it("should map unknown ChatErrorType to 'unknown' in events", async () => {
        // Mock error mapper to return an unknown error type
        const unknownError = new Error("Strange error");
        mockLlmBridge.sendToProvider.mockRejectedValue(unknownError);
        mockMessageRepository.create.mockResolvedValue({
          id: "system-msg",
        } as Message);

        await service.processUserMessage(
          mockConversationId,
          mockUserMessageId,
          mockEventCallback,
        );

        const errorCall = mockEventCallback.mock.calls.find(
          (call) => call[0].status === "error",
        );
        expect(errorCall[0].errorType).toBe("unknown");
      });
    });
  });
});
