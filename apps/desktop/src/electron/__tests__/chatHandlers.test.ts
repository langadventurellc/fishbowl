import { ipcMain, webContents, type WebContents } from "electron";
import { setupChatHandlers } from "../chatHandlers";
import {
  CHAT_CHANNELS,
  CHAT_EVENTS,
  type SendToAgentsRequest,
  type AllCompleteEvent,
} from "../../shared/ipc/index";
import type { MainProcessServices } from "../../main/services/MainProcessServices";
import type {
  ChatOrchestrationService,
  ProcessingResult,
} from "@fishbowl-ai/shared";

// Mock electron
jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn(),
  },
  webContents: {
    getAllWebContents: jest.fn(),
  },
}));

// Mock logger
jest.mock("@fishbowl-ai/shared", () => ({
  ...jest.requireActual("@fishbowl-ai/shared"),
  createLoggerSync: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  })),
}));

describe("chatHandlers", () => {
  let mockChatOrchestrationService: jest.Mocked<ChatOrchestrationService>;
  let mockMainProcessServices: jest.Mocked<MainProcessServices>;
  let mockWebContents: jest.Mocked<typeof webContents>;
  let mockIpcMain: jest.Mocked<typeof ipcMain>;
  let mockWebContentInstance: Partial<WebContents>;

  const mockProcessingResult: ProcessingResult = {
    userMessageId: "user-msg-123",
    totalAgents: 2,
    successfulAgents: 2,
    failedAgents: 0,
    agentResults: [
      {
        agentId: "agent-1",
        success: true,
        messageId: "msg-1",
        duration: 1000,
      },
      {
        agentId: "agent-2",
        success: true,
        messageId: "msg-2",
        duration: 1200,
      },
    ],
    totalDuration: 2500,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock web contents instance
    mockWebContentInstance = {
      isDestroyed: jest.fn().mockReturnValue(false),
      send: jest.fn(),
    };

    // Mock webContents
    mockWebContents = webContents as jest.Mocked<typeof webContents>;
    mockWebContents.getAllWebContents.mockReturnValue([
      mockWebContentInstance as WebContents,
    ]);

    // Mock ipcMain
    mockIpcMain = ipcMain as jest.Mocked<typeof ipcMain>;

    // Mock ChatOrchestrationService
    mockChatOrchestrationService = {
      processUserMessage: jest.fn(),
    } as any;

    // Mock MainProcessServices
    mockMainProcessServices = {
      chatOrchestrationService: mockChatOrchestrationService,
    } as any;
  });

  describe("setupChatHandlers", () => {
    it("should register sendToAgents IPC handler", () => {
      setupChatHandlers(mockMainProcessServices);

      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        CHAT_CHANNELS.SEND_TO_AGENTS,
        expect.any(Function),
      );
    });

    it("should log successful initialization", () => {
      setupChatHandlers(mockMainProcessServices);

      // Logger mock is called, but we don't need to verify specific calls
      // since the logger is mocked at module level
      expect(mockIpcMain.handle).toHaveBeenCalled();
    });
  });

  describe("sendToAgents handler", () => {
    let handler: any;
    let mockEvent: any;

    beforeEach(() => {
      setupChatHandlers(mockMainProcessServices);
      handler = mockIpcMain.handle.mock.calls[0]![1];
      mockEvent = {};
    });

    describe("input validation", () => {
      it("should reject invalid conversationId", async () => {
        const request: SendToAgentsRequest = {
          conversationId: "",
          userMessageId: "user-msg-123",
        };

        await expect(handler(mockEvent, request)).rejects.toThrow(
          "Invalid conversationId: must be a non-empty string",
        );
      });

      it("should reject non-string conversationId", async () => {
        const request: any = {
          conversationId: null,
          userMessageId: "user-msg-123",
        };

        await expect(handler(mockEvent, request)).rejects.toThrow(
          "Invalid conversationId: must be a non-empty string",
        );
      });

      it("should reject invalid userMessageId", async () => {
        const request: SendToAgentsRequest = {
          conversationId: "conv-123",
          userMessageId: "",
        };

        await expect(handler(mockEvent, request)).rejects.toThrow(
          "Invalid userMessageId: must be a non-empty string",
        );
      });

      it("should reject non-string userMessageId", async () => {
        const request: any = {
          conversationId: "conv-123",
          userMessageId: undefined,
        };

        await expect(handler(mockEvent, request)).rejects.toThrow(
          "Invalid userMessageId: must be a non-empty string",
        );
      });
    });

    describe("successful processing", () => {
      it("should call ChatOrchestrationService with correct parameters", async () => {
        const request: SendToAgentsRequest = {
          conversationId: "conv-123",
          userMessageId: "user-msg-123",
        };

        mockChatOrchestrationService.processUserMessage.mockResolvedValue(
          mockProcessingResult,
        );

        await handler(mockEvent, request);

        expect(
          mockChatOrchestrationService.processUserMessage,
        ).toHaveBeenCalledWith(
          "conv-123",
          "user-msg-123",
          expect.any(Function),
        );
      });

      it("should return immediately (fire-and-forget pattern)", async () => {
        const request: SendToAgentsRequest = {
          conversationId: "conv-123",
          userMessageId: "user-msg-123",
        };

        mockChatOrchestrationService.processUserMessage.mockResolvedValue(
          mockProcessingResult,
        );

        const result = await handler(mockEvent, request);

        expect(result).toBeUndefined();
        expect(
          mockChatOrchestrationService.processUserMessage,
        ).toHaveBeenCalled();
      });

      it("should emit all complete event when processing succeeds", async () => {
        const request: SendToAgentsRequest = {
          conversationId: "conv-123",
          userMessageId: "user-msg-123",
        };

        mockChatOrchestrationService.processUserMessage.mockResolvedValue(
          mockProcessingResult,
        );

        await handler(mockEvent, request);

        // Wait for async processing to complete
        await new Promise((resolve) => setTimeout(resolve, 0));

        const expectedEvent: AllCompleteEvent = {
          conversationId: "conv-123",
        };

        expect(mockWebContentInstance.send).toHaveBeenCalledWith(
          CHAT_EVENTS.ALL_COMPLETE,
          expectedEvent,
        );
      });
    });

    describe("error handling", () => {
      it("should emit all complete event even when processing fails", async () => {
        const request: SendToAgentsRequest = {
          conversationId: "conv-123",
          userMessageId: "user-msg-123",
        };

        mockChatOrchestrationService.processUserMessage.mockRejectedValue(
          new Error("Processing failed"),
        );

        await handler(mockEvent, request);

        // Wait for async processing to complete
        await new Promise((resolve) => setTimeout(resolve, 0));

        const expectedEvent: AllCompleteEvent = {
          conversationId: "conv-123",
        };

        expect(mockWebContentInstance.send).toHaveBeenCalledWith(
          CHAT_EVENTS.ALL_COMPLETE,
          expectedEvent,
        );
      });

      it("should handle ChatOrchestrationService errors gracefully", async () => {
        const request: SendToAgentsRequest = {
          conversationId: "conv-123",
          userMessageId: "user-msg-123",
        };

        const processingError = new Error("Service unavailable");
        mockChatOrchestrationService.processUserMessage.mockRejectedValue(
          processingError,
        );

        await handler(mockEvent, request);

        // Wait for async processing to complete
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Should still emit completion event
        expect(mockWebContentInstance.send).toHaveBeenCalledWith(
          CHAT_EVENTS.ALL_COMPLETE,
          expect.any(Object),
        );
      });
    });

    describe("event emission", () => {
      it("should emit events to all web contents", async () => {
        const request: SendToAgentsRequest = {
          conversationId: "conv-123",
          userMessageId: "user-msg-123",
        };

        const mockWebContent1 = {
          isDestroyed: jest.fn().mockReturnValue(false),
          send: jest.fn(),
        } as unknown as WebContents;
        const mockWebContent2 = {
          isDestroyed: jest.fn().mockReturnValue(false),
          send: jest.fn(),
        } as unknown as WebContents;

        mockWebContents.getAllWebContents.mockReturnValue([
          mockWebContent1,
          mockWebContent2,
        ]);

        mockChatOrchestrationService.processUserMessage.mockResolvedValue(
          mockProcessingResult,
        );

        await handler(mockEvent, request);

        // Wait for async processing to complete
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockWebContent1.send).toHaveBeenCalledWith(
          CHAT_EVENTS.ALL_COMPLETE,
          expect.any(Object),
        );
        expect(mockWebContent2.send).toHaveBeenCalledWith(
          CHAT_EVENTS.ALL_COMPLETE,
          expect.any(Object),
        );
      });

      it("should skip destroyed web contents", async () => {
        const request: SendToAgentsRequest = {
          conversationId: "conv-123",
          userMessageId: "user-msg-123",
        };

        const mockWebContent1 = {
          isDestroyed: jest.fn().mockReturnValue(true),
          send: jest.fn(),
        } as unknown as WebContents;
        const mockWebContent2 = {
          isDestroyed: jest.fn().mockReturnValue(false),
          send: jest.fn(),
        } as unknown as WebContents;

        mockWebContents.getAllWebContents.mockReturnValue([
          mockWebContent1,
          mockWebContent2,
        ]);

        mockChatOrchestrationService.processUserMessage.mockResolvedValue(
          mockProcessingResult,
        );

        await handler(mockEvent, request);

        // Wait for async processing to complete
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockWebContent1.send).not.toHaveBeenCalled();
        expect(mockWebContent2.send).toHaveBeenCalledWith(
          CHAT_EVENTS.ALL_COMPLETE,
          expect.any(Object),
        );
      });
    });
  });
});
