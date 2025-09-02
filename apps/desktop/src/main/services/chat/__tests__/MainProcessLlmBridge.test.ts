// Mock logger first
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock shared dependencies
jest.mock("@fishbowl-ai/shared", () => ({
  ...jest.requireActual("@fishbowl-ai/shared"),
  createLoggerSync: jest.fn(() => mockLogger),
}));

// Mock storage service
jest.mock("../../../../electron/services/LlmStorageService");

// Import after mocking
import { MainProcessLlmBridge } from "../MainProcessLlmBridge";
import { LlmStorageService } from "../../../../electron/services/LlmStorageService";

interface FormattedMessage {
  role: "user" | "assistant";
  content: string;
}

describe("MainProcessLlmBridge", () => {
  let bridge: MainProcessLlmBridge;
  let mockStorageService: jest.Mocked<LlmStorageService>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock storage service instance
    mockStorageService = {
      getCompleteConfiguration: jest.fn(),
    } as any;

    // Setup mocks
    (LlmStorageService as any).getInstance = jest
      .fn()
      .mockReturnValue(mockStorageService);

    // Create bridge instance
    bridge = new MainProcessLlmBridge();
  });

  describe("sendToProvider", () => {
    const mockAgentConfig = {
      llmConfigId: "test-llm-config",
      model: "test-model",
    };
    const mockContext = {
      systemPrompt: "You are a helpful assistant",
      messages: [
        { role: "user" as const, content: "Hello" },
        { role: "assistant" as const, content: "Hi there!" },
      ] as FormattedMessage[],
    };

    it("should handle provider configuration not found", async () => {
      // Setup mock to return null data
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: null,
      });

      // Execute and verify error
      await expect(
        bridge.sendToProvider(mockAgentConfig, mockContext),
      ).rejects.toThrow("LLM configuration not found: test-llm-config");
    });

    it("should handle storage service failure", async () => {
      // Setup mock to return error
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: false,
        error: "Storage service error",
      });

      // Execute and verify error
      await expect(
        bridge.sendToProvider(mockAgentConfig, mockContext),
      ).rejects.toThrow(
        "Failed to get LLM configuration: Storage service error",
      );
    });

    it("should handle missing provider field", async () => {
      const configWithoutProvider = {
        id: "test-config",
        customName: "Test",
        apiKey: "test-key",
        useAuthHeader: true,
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z",
      };

      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: configWithoutProvider as any,
      });

      await expect(
        bridge.sendToProvider(mockAgentConfig, mockContext),
      ).rejects.toThrow(
        "Invalid LLM configuration - missing provider: test-llm-config",
      );
    });

    it("should handle missing API key", async () => {
      const configWithoutApiKey = {
        id: "test-config",
        customName: "Test",
        provider: "openai" as const,
        useAuthHeader: true,
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z",
      };

      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: configWithoutApiKey as any,
      });

      await expect(
        bridge.sendToProvider(mockAgentConfig, mockContext),
      ).rejects.toThrow(
        "Invalid LLM configuration - missing API key: test-llm-config",
      );
    });
  });
});
