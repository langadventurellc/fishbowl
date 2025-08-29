/**
 * Unit tests for useUpdateMessage hook.
 *
 * Tests core functionality of the useUpdateMessage hook for message updates.
 *
 * @module hooks/messages/__tests__/useUpdateMessage.test
 */

import { renderHook, waitFor } from "@testing-library/react";
import type { Message } from "@fishbowl-ai/shared";
import { useUpdateMessage } from "../useUpdateMessage";

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

const mockUpdatedMessage: Message = {
  ...mockMessage,
  included: false,
};

// Mock electronAPI
const mockUpdateInclusion = jest.fn();

beforeEach(() => {
  // Reset mocks
  mockUpdateInclusion.mockClear();
  mockLogger.debug.mockClear();
  mockLogger.info.mockClear();
  mockLogger.warn.mockClear();
  mockLogger.error.mockClear();

  // Mock window.electronAPI
  Object.defineProperty(window, "electronAPI", {
    value: {
      messages: {
        updateInclusion: mockUpdateInclusion,
      },
    },
    writable: true,
    configurable: true,
  });

  // Default successful response
  mockUpdateInclusion.mockResolvedValue(mockUpdatedMessage);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useUpdateMessage", () => {
  describe("initial state", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useUpdateMessage());

      expect(result.current.updating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.updateInclusion).toBe("function");
      expect(typeof result.current.reset).toBe("function");
    });
  });

  describe("updateInclusion function", () => {
    it("should update inclusion to false successfully", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      const updatedMessage = await result.current.updateInclusion(
        "message-123",
        false,
      );

      expect(mockUpdateInclusion).toHaveBeenCalledTimes(1);
      expect(mockUpdateInclusion).toHaveBeenCalledWith("message-123", false);
      expect(updatedMessage).toEqual(mockUpdatedMessage);
      expect(result.current.error).toBeNull();
      expect(result.current.updating).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Updated message inclusion: message-123",
        {
          id: "message-123",
          included: false,
          messageId: mockUpdatedMessage.id,
        },
      );
    });

    it("should update inclusion to true successfully", async () => {
      const { result } = renderHook(() => useUpdateMessage());
      const includedMessage = { ...mockMessage, included: true };
      mockUpdateInclusion.mockResolvedValue(includedMessage);

      const updatedMessage = await result.current.updateInclusion(
        "message-123",
        true,
      );

      expect(mockUpdateInclusion).toHaveBeenCalledWith("message-123", true);
      expect(updatedMessage).toEqual(includedMessage);
      expect(result.current.error).toBeNull();
    });

    it("should manage loading state during update", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      // Create a controllable promise to test loading state
      let resolveUpdate: (value: Message) => void;
      const slowUpdate = new Promise<Message>((resolve) => {
        resolveUpdate = resolve;
      });
      mockUpdateInclusion.mockReturnValue(slowUpdate);

      // Start update without waiting
      const updatePromise = result.current.updateInclusion(
        "message-123",
        false,
      );

      // Check if loading state is set
      await waitFor(() => {
        expect(result.current.updating).toBe(true);
      });

      // Resolve the promise
      resolveUpdate!(mockUpdatedMessage);
      await updatePromise;

      // Should no longer be loading
      await waitFor(() => {
        expect(result.current.updating).toBe(false);
      });
    });

    it("should clear previous errors on new update attempt", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      // First, cause an error
      const firstError = new Error("First error");
      mockUpdateInclusion.mockRejectedValueOnce(firstError);

      try {
        await result.current.updateInclusion("message-123", false);
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.error).toBe(firstError);
      });

      // Reset mock for successful call
      mockUpdateInclusion.mockResolvedValue(mockUpdatedMessage);

      // Make another call
      await result.current.updateInclusion("message-123", false);

      // Error should be cleared
      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe("validation error handling", () => {
    it("should throw error for empty message ID", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      await expect(result.current.updateInclusion("", false)).rejects.toThrow(
        "Message ID is required",
      );

      await waitFor(() => {
        expect(result.current.error?.message).toBe("Message ID is required");
        expect(result.current.updating).toBe(false);
      });

      expect(mockUpdateInclusion).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to update message:",
        expect.any(Error),
      );
    });

    it("should throw error for whitespace-only message ID", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      await expect(
        result.current.updateInclusion("   ", false),
      ).rejects.toThrow("Message ID is required");

      await waitFor(() => {
        expect(result.current.error?.message).toBe("Message ID is required");
      });
    });

    it("should accept any non-empty message ID", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      await result.current.updateInclusion("message-123", false);

      expect(mockUpdateInclusion).toHaveBeenCalledWith("message-123", false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("IPC error handling", () => {
    it("should handle IPC call failures", async () => {
      const { result } = renderHook(() => useUpdateMessage());
      const ipcError = new Error("IPC call failed");
      mockUpdateInclusion.mockRejectedValue(ipcError);

      await expect(
        result.current.updateInclusion("message-123", false),
      ).rejects.toThrow("IPC call failed");

      await waitFor(() => {
        expect(result.current.error).toBe(ipcError);
        expect(result.current.updating).toBe(false);
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to update message:",
        ipcError,
      );
    });

    it("should handle message not found errors", async () => {
      const { result } = renderHook(() => useUpdateMessage());
      const notFoundError = new Error("Message not found");
      mockUpdateInclusion.mockRejectedValue(notFoundError);

      await expect(
        result.current.updateInclusion("nonexistent-message", false),
      ).rejects.toThrow("Message not found");

      await waitFor(() => {
        expect(result.current.error?.message).toBe("Message not found");
      });
    });

    it("should handle constraint violation errors", async () => {
      const { result } = renderHook(() => useUpdateMessage());
      const constraintError = new Error("Database constraint violation");
      mockUpdateInclusion.mockRejectedValue(constraintError);

      await expect(
        result.current.updateInclusion("message-123", false),
      ).rejects.toThrow("Database constraint violation");

      await waitFor(() => {
        expect(result.current.error?.message).toBe(
          "Database constraint violation",
        );
      });
    });

    it("should convert non-Error objects to Error instances", async () => {
      const { result } = renderHook(() => useUpdateMessage());
      mockUpdateInclusion.mockRejectedValue("String error");

      await expect(
        result.current.updateInclusion("message-123", false),
      ).rejects.toThrow("String error");

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe("String error");
      });
    });
  });

  describe("environment detection", () => {
    it("should throw error when window electronAPI is unavailable", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      // Mock undefined electronAPI (simulating non-Electron environment)
      Object.defineProperty(window, "electronAPI", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      await expect(
        result.current.updateInclusion("message-123", false),
      ).rejects.toThrow(
        "Message updates are not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error?.message).toBe(
          "Message updates are not available in this environment",
        );
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, message updates not available",
      );
    });

    it("should throw error when electronAPI is undefined", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      // Mock undefined electronAPI
      Object.defineProperty(window, "electronAPI", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      await expect(
        result.current.updateInclusion("message-123", false),
      ).rejects.toThrow(
        "Message updates are not available in this environment",
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, message updates not available",
      );
    });

    it("should throw error when messages API is undefined", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      // Mock electronAPI without messages
      Object.defineProperty(window, "electronAPI", {
        value: {},
        writable: true,
        configurable: true,
      });

      await expect(
        result.current.updateInclusion("message-123", false),
      ).rejects.toThrow(
        "Message updates are not available in this environment",
      );
    });

    it("should throw error when updateInclusion is not a function", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      // Mock electronAPI with non-function updateInclusion
      Object.defineProperty(window, "electronAPI", {
        value: {
          messages: {
            updateInclusion: "not a function",
          },
        },
        writable: true,
        configurable: true,
      });

      await expect(
        result.current.updateInclusion("message-123", false),
      ).rejects.toThrow(
        "Message updates are not available in this environment",
      );
    });
  });

  describe("reset functionality", () => {
    it("should clear error state when reset is called", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      // Cause an error first
      mockUpdateInclusion.mockRejectedValue(new Error("Test error"));

      try {
        await result.current.updateInclusion("message-123", false);
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // Reset the error
      result.current.reset();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it("should not affect other states when reset is called", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      // Set error state
      mockUpdateInclusion.mockRejectedValue(new Error("Test error"));
      try {
        await result.current.updateInclusion("message-123", false);
      } catch {
        // Expected
      }

      // Reset
      result.current.reset();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.updating).toBe(false);
        expect(typeof result.current.updateInclusion).toBe("function");
        expect(typeof result.current.reset).toBe("function");
      });
    });
  });

  describe("multiple update attempts", () => {
    it("should handle sequential message updates", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      // First update
      await result.current.updateInclusion("message-1", false);
      expect(mockUpdateInclusion).toHaveBeenCalledWith("message-1", false);

      // Second update
      await result.current.updateInclusion("message-2", true);
      expect(mockUpdateInclusion).toHaveBeenCalledWith("message-2", true);

      expect(mockUpdateInclusion).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBeNull();
    });

    it("should handle error recovery between attempts", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      // First call fails
      mockUpdateInclusion.mockRejectedValueOnce(new Error("First failure"));
      try {
        await result.current.updateInclusion("message-1", false);
      } catch {
        // Expected
      }

      await waitFor(() => {
        expect(result.current.error?.message).toBe("First failure");
      });

      // Second call succeeds
      mockUpdateInclusion.mockResolvedValue(mockUpdatedMessage);
      await result.current.updateInclusion("message-2", true);

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe("concurrent update handling", () => {
    it("should handle concurrent update operations", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      // Create two concurrent promises
      const promise1 = result.current.updateInclusion("message-1", false);
      const promise2 = result.current.updateInclusion("message-2", true);

      await Promise.all([promise1, promise2]);

      expect(mockUpdateInclusion).toHaveBeenCalledTimes(2);
      expect(mockUpdateInclusion).toHaveBeenCalledWith("message-1", false);
      expect(mockUpdateInclusion).toHaveBeenCalledWith("message-2", true);
    });

    it("should properly manage state with overlapping operations", async () => {
      const { result } = renderHook(() => useUpdateMessage());

      // Create controllable promises
      let resolve1: (value: Message) => void;
      let resolve2: (value: Message) => void;

      const promise1 = new Promise<Message>((resolve) => {
        resolve1 = resolve;
      });
      const promise2 = new Promise<Message>((resolve) => {
        resolve2 = resolve;
      });

      mockUpdateInclusion
        .mockReturnValueOnce(promise1)
        .mockReturnValueOnce(promise2);

      // Start both operations
      const update1 = result.current.updateInclusion("message-1", false);
      const update2 = result.current.updateInclusion("message-2", true);

      // Both should show updating state
      await waitFor(() => {
        expect(result.current.updating).toBe(true);
      });

      // Resolve first
      resolve1!(mockMessage);
      await update1;

      // Still updating because second is not done
      expect(result.current.updating).toBe(true);

      // Resolve second
      resolve2!(mockMessage);
      await update2;

      // Now should be done
      await waitFor(() => {
        expect(result.current.updating).toBe(false);
      });
    });
  });
});
