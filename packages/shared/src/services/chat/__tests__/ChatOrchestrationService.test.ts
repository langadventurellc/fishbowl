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
});
