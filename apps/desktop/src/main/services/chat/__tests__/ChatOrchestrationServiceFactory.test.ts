/**
 * Unit tests for ChatOrchestrationServiceFactory.
 */

import {
  ChatOrchestrationService,
  MessageFormatterService,
  SystemPromptFactory,
} from "@fishbowl-ai/shared";
import type {
  ConversationAgentsRepository,
  MessageRepository,
  PersistedAgentData,
  StructuredLogger,
} from "@fishbowl-ai/shared";

import { ChatOrchestrationServiceFactory } from "../ChatOrchestrationServiceFactory";
import { agentsRepositoryManager } from "../../../../data/repositories/agentsRepositoryManager";
import { MainProcessLlmBridge } from "../MainProcessLlmBridge";
import { MainProcessSystemPromptResolvers } from "../MainProcessSystemPromptResolvers";
import type { MainProcessServices } from "../../MainProcessServices";

// Mock all dependencies
jest.mock("@fishbowl-ai/shared", () => ({
  ...jest.requireActual("@fishbowl-ai/shared"),
  ChatOrchestrationService: jest.fn(),
  SystemPromptFactory: jest.fn(),
  MessageFormatterService: jest.fn(),
}));

jest.mock("../../../../data/repositories/agentsRepositoryManager", () => ({
  agentsRepositoryManager: {
    get: jest.fn(),
  },
}));

jest.mock("../MainProcessLlmBridge");
jest.mock("../MainProcessSystemPromptResolvers");

describe("ChatOrchestrationServiceFactory", () => {
  let mockMainProcessServices: jest.Mocked<MainProcessServices>;
  let mockAgentsRepository: jest.Mocked<any>;
  let mockLogger: jest.Mocked<StructuredLogger>;
  let mockMessagesRepository: jest.Mocked<MessageRepository>;
  let mockConversationAgentsRepository: jest.Mocked<ConversationAgentsRepository>;

  const mockAgentData: PersistedAgentData = {
    id: "test-agent-id",
    name: "Test Agent",
    model: "claude-3-sonnet",
    role: "test-role-id",
    personality: "test-personality-id",
    llmConfigId: "test-llm-config-id",
    systemPrompt: "Test system prompt",
    personalityBehaviors: {},
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mock logger
    mockLogger = {
      setLevel: jest.fn(),
      getLevel: jest.fn().mockReturnValue("info"),
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
      child: jest.fn(),
      addTransport: jest.fn(),
      removeTransport: jest.fn(),
      setFormatter: jest.fn(),
    } as unknown as jest.Mocked<StructuredLogger>;

    // Set up mock repositories
    mockMessagesRepository = {
      create: jest.fn(),
      getByConversation: jest.fn(),
    } as unknown as jest.Mocked<MessageRepository>;

    mockConversationAgentsRepository = {
      getEnabledByConversationId: jest.fn(),
      findByConversationId: jest.fn(),
    } as unknown as jest.Mocked<ConversationAgentsRepository>;

    mockAgentsRepository = {
      loadAgents: jest.fn(),
    };

    // Set up mock MainProcessServices
    mockMainProcessServices = {
      logger: mockLogger,
      messagesRepository: mockMessagesRepository,
      conversationAgentsRepository: mockConversationAgentsRepository,
    } as unknown as jest.Mocked<MainProcessServices>;

    (agentsRepositoryManager.get as jest.Mock).mockReturnValue(
      mockAgentsRepository,
    );

    // Set up constructor mocks to return mock instances
    (SystemPromptFactory as jest.Mock).mockImplementation(() => ({
      createSystemPrompt: jest.fn(),
    }));

    (MessageFormatterService as jest.Mock).mockImplementation(() => ({
      formatMessages: jest.fn(),
    }));

    (ChatOrchestrationService as jest.Mock).mockImplementation(() => ({
      processUserMessage: jest.fn(),
      buildAgentContext: jest.fn(),
    }));

    (MainProcessSystemPromptResolvers as jest.Mock).mockImplementation(() => ({
      resolveRole: jest.fn(),
      resolvePersonality: jest.fn(),
    }));

    (MainProcessLlmBridge as jest.Mock).mockImplementation(() => ({
      sendToProvider: jest.fn(),
    }));
  });

  describe("create", () => {
    it("should create ChatOrchestrationService with all dependencies injected", () => {
      // Act
      const result = ChatOrchestrationServiceFactory.create(
        mockMainProcessServices,
      );

      // Assert
      expect(result).toBeDefined();
      expect(MainProcessSystemPromptResolvers).toHaveBeenCalledTimes(1);
      expect(SystemPromptFactory).toHaveBeenCalledWith(
        expect.any(Object), // MainProcessSystemPromptResolvers instance
        expect.any(String), // template
        mockLogger,
      );
      expect(MessageFormatterService).toHaveBeenCalledTimes(1);
      expect(MainProcessLlmBridge).toHaveBeenCalledTimes(1);
      expect(ChatOrchestrationService).toHaveBeenCalledWith(
        expect.any(Object), // MainProcessLlmBridge instance
        mockMessagesRepository,
        mockConversationAgentsRepository,
        expect.any(Object), // SystemPromptFactory instance
        expect.any(Object), // MessageFormatterService instance
        expect.any(Function), // agentsResolver function
      );
    });

    it("should create functional agents resolver that loads agent data", async () => {
      // Arrange
      const agentsData = {
        agents: [mockAgentData],
        lastUpdated: "2024-01-01T00:00:00Z",
      };
      mockAgentsRepository.loadAgents.mockResolvedValue(agentsData);

      // Act
      ChatOrchestrationServiceFactory.create(mockMainProcessServices);

      // Get the agents resolver function from the ChatOrchestrationService constructor call
      const constructorCalls = (ChatOrchestrationService as jest.Mock).mock
        .calls;
      expect(constructorCalls).toHaveLength(1);
      const agentsResolver = constructorCalls[0][5]; // 6th parameter (index 5)

      const result = await agentsResolver("test-agent-id");

      // Assert
      expect(result).toEqual(mockAgentData);
      expect(agentsRepositoryManager.get).toHaveBeenCalledTimes(1);
      expect(mockAgentsRepository.loadAgents).toHaveBeenCalledTimes(1);
    });

    it("should handle agent not found in agents resolver", async () => {
      // Arrange
      const agentsData = {
        agents: [mockAgentData],
        lastUpdated: "2024-01-01T00:00:00Z",
      };
      mockAgentsRepository.loadAgents.mockResolvedValue(agentsData);

      // Act
      ChatOrchestrationServiceFactory.create(mockMainProcessServices);

      // Get the agents resolver function
      const constructorCalls = (ChatOrchestrationService as jest.Mock).mock
        .calls;
      const agentsResolver = constructorCalls[0][5];

      // Assert
      await expect(agentsResolver("non-existent-agent")).rejects.toThrow(
        "Agent not found: non-existent-agent",
      );
    });

    it("should handle agents array being undefined in resolver", async () => {
      // Arrange
      const agentsData = {
        agents: undefined,
        lastUpdated: "2024-01-01T00:00:00Z",
      };
      mockAgentsRepository.loadAgents.mockResolvedValue(agentsData);

      // Act
      ChatOrchestrationServiceFactory.create(mockMainProcessServices);

      // Get the agents resolver function
      const constructorCalls = (ChatOrchestrationService as jest.Mock).mock
        .calls;
      const agentsResolver = constructorCalls[0][5];

      // Assert
      await expect(agentsResolver("test-agent-id")).rejects.toThrow(
        "Agent not found: test-agent-id",
      );
    });

    it("should propagate repository errors in agents resolver", async () => {
      // Arrange
      const error = new Error("Repository failed to load agents");
      mockAgentsRepository.loadAgents.mockRejectedValue(error);

      // Act
      ChatOrchestrationServiceFactory.create(mockMainProcessServices);

      // Get the agents resolver function
      const constructorCalls = (ChatOrchestrationService as jest.Mock).mock
        .calls;
      const agentsResolver = constructorCalls[0][5];

      // Assert
      await expect(agentsResolver("test-agent-id")).rejects.toThrow(error);
    });

    it("should handle repository manager errors in agents resolver", async () => {
      // Arrange
      const error = new Error("Repository not initialized");
      (agentsRepositoryManager.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act
      ChatOrchestrationServiceFactory.create(mockMainProcessServices);

      // Get the agents resolver function
      const constructorCalls = (ChatOrchestrationService as jest.Mock).mock
        .calls;
      const agentsResolver = constructorCalls[0][5];

      // Assert
      await expect(agentsResolver("test-agent-id")).rejects.toThrow(error);
    });

    it("should throw error if SystemPromptResolvers creation fails", () => {
      // Arrange
      (MainProcessSystemPromptResolvers as jest.Mock).mockImplementation(() => {
        throw new Error("SystemPromptResolvers creation failed");
      });

      // Act & Assert
      expect(() =>
        ChatOrchestrationServiceFactory.create(mockMainProcessServices),
      ).toThrow(
        "Failed to create ChatOrchestrationService: SystemPromptResolvers creation failed",
      );
    });

    it("should throw error if SystemPromptFactory creation fails", () => {
      // Arrange
      (SystemPromptFactory as jest.Mock).mockImplementation(() => {
        throw new Error("SystemPromptFactory creation failed");
      });

      // Act & Assert
      expect(() =>
        ChatOrchestrationServiceFactory.create(mockMainProcessServices),
      ).toThrow(
        "Failed to create ChatOrchestrationService: SystemPromptFactory creation failed",
      );
    });

    it("should throw error if MessageFormatterService creation fails", () => {
      // Arrange
      (MessageFormatterService as jest.Mock).mockImplementation(() => {
        throw new Error("MessageFormatterService creation failed");
      });

      // Act & Assert
      expect(() =>
        ChatOrchestrationServiceFactory.create(mockMainProcessServices),
      ).toThrow(
        "Failed to create ChatOrchestrationService: MessageFormatterService creation failed",
      );
    });

    it("should throw error if MainProcessLlmBridge creation fails", () => {
      // Arrange
      (MainProcessLlmBridge as jest.Mock).mockImplementation(() => {
        throw new Error("MainProcessLlmBridge creation failed");
      });

      // Act & Assert
      expect(() =>
        ChatOrchestrationServiceFactory.create(mockMainProcessServices),
      ).toThrow(
        "Failed to create ChatOrchestrationService: MainProcessLlmBridge creation failed",
      );
    });

    it("should throw error if ChatOrchestrationService creation fails", () => {
      // Arrange
      (ChatOrchestrationService as jest.Mock).mockImplementation(() => {
        throw new Error("ChatOrchestrationService creation failed");
      });

      // Act & Assert
      expect(() =>
        ChatOrchestrationServiceFactory.create(mockMainProcessServices),
      ).toThrow(
        "Failed to create ChatOrchestrationService: ChatOrchestrationService creation failed",
      );
    });

    it("should handle non-Error exceptions", () => {
      // Arrange
      (ChatOrchestrationService as jest.Mock).mockImplementation(() => {
        throw "String error";
      });

      // Act & Assert
      expect(() =>
        ChatOrchestrationServiceFactory.create(mockMainProcessServices),
      ).toThrow("Failed to create ChatOrchestrationService: Unknown error");
    });

    it("should use correct template structure for SystemPromptFactory", () => {
      // Act
      ChatOrchestrationServiceFactory.create(mockMainProcessServices);

      // Assert
      const constructorCalls = (SystemPromptFactory as jest.Mock).mock.calls;
      expect(constructorCalls).toHaveLength(1);

      const template = constructorCalls[0][1]; // Second parameter (index 1)
      expect(typeof template).toBe("string");
      expect(template).toContain("{{agentName}}");
      expect(template).toContain("{{roleName}}");
      expect(template).toContain("{{roleDescription}}");
      expect(template).toContain("{{personalityName}}");
    });

    it("should pass correct logger to SystemPromptFactory", () => {
      // Act
      ChatOrchestrationServiceFactory.create(mockMainProcessServices);

      // Assert
      const constructorCalls = (SystemPromptFactory as jest.Mock).mock.calls;
      expect(constructorCalls).toHaveLength(1);
      expect(constructorCalls[0][2]).toBe(mockLogger); // Third parameter (index 2)
    });
  });

  describe("static factory pattern", () => {
    it("should be a static method", () => {
      expect(typeof ChatOrchestrationServiceFactory.create).toBe("function");
      expect(ChatOrchestrationServiceFactory.create).toHaveProperty(
        "length",
        1,
      ); // takes 1 parameter
    });

    it("should not require instantiation", () => {
      // This test verifies we can call create without new
      expect(() =>
        ChatOrchestrationServiceFactory.create(mockMainProcessServices),
      ).not.toThrow();
    });
  });
});
