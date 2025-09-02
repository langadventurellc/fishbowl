/**
 * Unit tests for useCreateMessage hook.
 *
 * Tests core functionality of the useCreateMessage hook for message creation.
 *
 * @module hooks/messages/__tests__/useCreateMessage.test
 */

import { renderHook, waitFor } from "@testing-library/react";
import type { Message, CreateMessageInput } from "@fishbowl-ai/shared";
import { useCreateMessage } from "../useCreateMessage";

// Create stable mock logger to prevent infinite re-renders
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock useServices hook
jest.mock("../../../contexts/useServices", () => ({
  useServices: jest.fn(() => ({
    logger: mockLogger,
  })),
}));

// Mock data for testing
const mockMessage: Message = {
  id: "message-123",
  conversation_id: "conversation-123",
  conversation_agent_id: null,
  role: "user",
  content: "Hello, world!",
  included: true,
  created_at: "2023-01-01T10:00:00.000Z",
};

const validCreateMessageInput: CreateMessageInput = {
  conversation_id: "conversation-123",
  role: "user",
  content: "Hello, world!",
};

// Mock electronAPI
const mockCreate = jest.fn();

beforeEach(() => {
  // Reset mocks
  mockCreate.mockClear();
  mockLogger.debug.mockClear();
  mockLogger.info.mockClear();
  mockLogger.warn.mockClear();
  mockLogger.error.mockClear();

  // Mock window.electronAPI
  Object.defineProperty(window, "electronAPI", {
    value: {
      messages: {
        create: mockCreate,
      },
    },
    writable: true,
    configurable: true,
  });

  // Default successful response
  mockCreate.mockResolvedValue(mockMessage);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useCreateMessage", () => {
  describe("initial state", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useCreateMessage());

      expect(result.current.sending).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.createMessage).toBe("function");
      expect(typeof result.current.reset).toBe("function");
    });
  });

  describe("createMessage function", () => {
    it("should create message successfully with valid input", async () => {
      const { result } = renderHook(() => useCreateMessage());

      const createdMessage = await result.current.createMessage(
        validCreateMessageInput,
      );

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(validCreateMessageInput);
      expect(createdMessage).toEqual(mockMessage);
      expect(result.current.error).toBeNull();
      expect(result.current.sending).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Created message in conversation ${validCreateMessageInput.conversation_id}`,
        {
          messageId: mockMessage.id,
          role: mockMessage.role,
          conversationId: mockMessage.conversation_id,
        },
      );
    });

    it("should create system message successfully", async () => {
      const { result } = renderHook(() => useCreateMessage());
      const systemInput: CreateMessageInput = {
        conversation_id: "conversation-123",
        role: "system",
        content: "System message content",
      };
      const systemMessage: Message = {
        ...mockMessage,
        role: "system",
        content: "System message content",
      };
      mockCreate.mockResolvedValue(systemMessage);

      const createdMessage = await result.current.createMessage(systemInput);

      expect(mockCreate).toHaveBeenCalledWith(systemInput);
      expect(createdMessage).toEqual(systemMessage);
      expect(result.current.error).toBeNull();
    });

    it("should create agent message successfully", async () => {
      const { result } = renderHook(() => useCreateMessage());
      const agentInput: CreateMessageInput = {
        conversation_id: "conversation-123",
        conversation_agent_id: "agent-123",
        role: "agent",
        content: "Agent message content",
      };
      const agentMessage: Message = {
        ...mockMessage,
        role: "agent",
        conversation_agent_id: "agent-123",
        content: "Agent message content",
      };
      mockCreate.mockResolvedValue(agentMessage);

      const createdMessage = await result.current.createMessage(agentInput);

      expect(mockCreate).toHaveBeenCalledWith(agentInput);
      expect(createdMessage).toEqual(agentMessage);
      expect(result.current.error).toBeNull();
    });

    it("should manage loading state during creation", async () => {
      const { result } = renderHook(() => useCreateMessage());

      // Create a controllable promise to test loading state
      let resolveCreate: (value: Message) => void;
      const slowCreate = new Promise<Message>((resolve) => {
        resolveCreate = resolve;
      });
      mockCreate.mockReturnValue(slowCreate);

      // Start creation without waiting
      const createPromise = result.current.createMessage(
        validCreateMessageInput,
      );

      // Check if loading state is set
      await waitFor(() => {
        expect(result.current.sending).toBe(true);
      });

      // Resolve the promise
      resolveCreate!(mockMessage);
      await createPromise;

      // Should no longer be loading
      await waitFor(() => {
        expect(result.current.sending).toBe(false);
      });
    });

    it("should clear previous errors on new creation attempt", async () => {
      const { result } = renderHook(() => useCreateMessage());

      // First, cause an error
      const firstError = new Error("First error");
      mockCreate.mockRejectedValueOnce(firstError);

      try {
        await result.current.createMessage(validCreateMessageInput);
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.error).toBe(firstError);
      });

      // Now make a successful call
      mockCreate.mockResolvedValue(mockMessage);

      await result.current.createMessage(validCreateMessageInput);

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe("validation error handling", () => {
    it("should reject empty content", async () => {
      const { result } = renderHook(() => useCreateMessage());
      const invalidInput: CreateMessageInput = {
        conversation_id: "conversation-123",
        role: "user",
        content: "",
      };

      await expect(result.current.createMessage(invalidInput)).rejects.toThrow(
        "Message content cannot be empty",
      );

      await waitFor(() => {
        expect(result.current.error?.message).toBe(
          "Message content cannot be empty",
        );
        expect(result.current.sending).toBe(false);
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should reject whitespace-only content", async () => {
      const { result } = renderHook(() => useCreateMessage());
      const invalidInput: CreateMessageInput = {
        conversation_id: "conversation-123",
        role: "user",
        content: "   \n\t   ",
      };

      await expect(result.current.createMessage(invalidInput)).rejects.toThrow(
        "Message content cannot be empty",
      );

      await waitFor(() => {
        expect(result.current.error?.message).toBe(
          "Message content cannot be empty",
        );
        expect(result.current.sending).toBe(false);
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should reject missing conversation_id", async () => {
      const { result } = renderHook(() => useCreateMessage());
      const invalidInput: CreateMessageInput = {
        conversation_id: "",
        role: "user",
        content: "Valid content",
      };

      await expect(result.current.createMessage(invalidInput)).rejects.toThrow(
        "Conversation ID is required",
      );

      await waitFor(() => {
        expect(result.current.error?.message).toBe(
          "Conversation ID is required",
        );
        expect(result.current.sending).toBe(false);
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should reject whitespace-only conversation_id", async () => {
      const { result } = renderHook(() => useCreateMessage());
      const invalidInput: CreateMessageInput = {
        conversation_id: "   ",
        role: "user",
        content: "Valid content",
      };

      await expect(result.current.createMessage(invalidInput)).rejects.toThrow(
        "Conversation ID is required",
      );

      await waitFor(() => {
        expect(result.current.error?.message).toBe(
          "Conversation ID is required",
        );
        expect(result.current.sending).toBe(false);
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe("IPC error handling", () => {
    it("should handle IPC communication errors", async () => {
      const { result } = renderHook(() => useCreateMessage());
      const testError = new Error("IPC communication failed");
      mockCreate.mockRejectedValue(testError);

      await expect(
        result.current.createMessage(validCreateMessageInput),
      ).rejects.toThrow("IPC communication failed");

      await waitFor(() => {
        expect(result.current.error).toBe(testError);
        expect(result.current.sending).toBe(false);
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to create message:",
        testError,
      );
    });

    it("should handle non-Error objects as errors", async () => {
      const { result } = renderHook(() => useCreateMessage());
      const stringError = "String error message";
      mockCreate.mockRejectedValue(stringError);

      await expect(
        result.current.createMessage(validCreateMessageInput),
      ).rejects.toThrow("String error message");

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe("String error message");
        expect(result.current.sending).toBe(false);
      });
    });

    it("should handle creation errors from API", async () => {
      const { result } = renderHook(() => useCreateMessage());
      const apiError = new Error("Failed to create message in database");
      mockCreate.mockRejectedValue(apiError);

      await expect(
        result.current.createMessage(validCreateMessageInput),
      ).rejects.toThrow("Failed to create message in database");

      await waitFor(() => {
        expect(result.current.error).toBe(apiError);
        expect(result.current.sending).toBe(false);
      });
    });
  });

  describe("non-Electron environment", () => {
    beforeEach(() => {
      // Remove electronAPI to simulate non-Electron environment
      delete (window as any).electronAPI;
    });

    it("should handle missing electronAPI gracefully", async () => {
      const { result } = renderHook(() => useCreateMessage());

      await expect(
        result.current.createMessage(validCreateMessageInput),
      ).rejects.toThrow(
        "Message creation is not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.sending).toBe(false);
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, message creation not available",
      );
    });

    it("should handle missing messages API gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {},
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useCreateMessage());

      await expect(
        result.current.createMessage(validCreateMessageInput),
      ).rejects.toThrow(
        "Message creation is not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.sending).toBe(false);
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, message creation not available",
      );
    });

    it("should handle non-function create method gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {
          messages: {
            create: "not a function",
          },
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useCreateMessage());

      await expect(
        result.current.createMessage(validCreateMessageInput),
      ).rejects.toThrow(
        "Message creation is not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.sending).toBe(false);
      });
    });
  });

  describe("reset function", () => {
    it("should clear error state", async () => {
      const { result } = renderHook(() => useCreateMessage());
      const testError = new Error("Test error");
      mockCreate.mockRejectedValue(testError);

      // Cause an error
      try {
        await result.current.createMessage(validCreateMessageInput);
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.error).toBe(testError);
      });

      // Reset the error
      result.current.reset();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it("should not affect loading state", async () => {
      const { result } = renderHook(() => useCreateMessage());

      // Create a slow promise to test loading state persistence
      let resolveCreate: (value: Message) => void;
      const slowCreate = new Promise<Message>((resolve) => {
        resolveCreate = resolve;
      });
      mockCreate.mockReturnValue(slowCreate);

      // Start creation
      const createPromise = result.current.createMessage(
        validCreateMessageInput,
      );

      await waitFor(() => {
        expect(result.current.sending).toBe(true);
      });

      // Reset should not affect loading state
      result.current.reset();
      expect(result.current.sending).toBe(true);

      // Complete the creation
      resolveCreate!(mockMessage);
      await createPromise;

      await waitFor(() => {
        expect(result.current.sending).toBe(false);
      });
    });
  });

  describe("memory cleanup", () => {
    it("should not cause memory leaks on unmount", () => {
      const { unmount } = renderHook(() => useCreateMessage());

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it("should not update state after unmount", async () => {
      let resolveCreate: (value: Message) => void;
      const slowCreate = new Promise<Message>((resolve) => {
        resolveCreate = resolve;
      });
      mockCreate.mockReturnValue(slowCreate);

      const { unmount } = renderHook(() => useCreateMessage());

      // Unmount immediately
      unmount();

      // Resolve the promise after unmount
      resolveCreate!(mockMessage);

      // Should not cause any errors or warnings
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  describe("function stability", () => {
    it("should maintain stable function references", () => {
      const { result, rerender } = renderHook(() => useCreateMessage());

      const firstCreateMessage = result.current.createMessage;
      const firstReset = result.current.reset;

      rerender();

      expect(result.current.createMessage).toBe(firstCreateMessage);
      expect(result.current.reset).toBe(firstReset);
    });
  });

  describe("multiple creation attempts", () => {
    it("should handle sequential message creation properly", async () => {
      const { result } = renderHook(() => useCreateMessage());

      // First creation
      await result.current.createMessage(validCreateMessageInput);
      expect(result.current.error).toBeNull();
      expect(mockCreate).toHaveBeenCalledTimes(1);

      // Second creation
      const secondInput: CreateMessageInput = {
        conversation_id: "conversation-456",
        role: "system",
        content: "Second message",
      };
      const secondMessage: Message = {
        ...mockMessage,
        id: "message-456",
        conversation_id: "conversation-456",
        role: "system",
        content: "Second message",
      };
      mockCreate.mockResolvedValue(secondMessage);

      await result.current.createMessage(secondInput);
      expect(result.current.error).toBeNull();
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it("should handle error recovery between attempts", async () => {
      const { result } = renderHook(() => useCreateMessage());

      // First attempt fails
      const firstError = new Error("First attempt failed");
      mockCreate.mockRejectedValueOnce(firstError);

      try {
        await result.current.createMessage(validCreateMessageInput);
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.error).toBe(firstError);
      });

      // Second attempt succeeds
      mockCreate.mockResolvedValue(mockMessage);

      await result.current.createMessage(validCreateMessageInput);

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });
});
