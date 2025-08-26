/**
 * Unit tests for useUpdateConversation hook.
 *
 * Tests core functionality of the useUpdateConversation hook for conversation updates.
 *
 * @module hooks/conversations/__tests__/useUpdateConversation.test
 */

import { renderHook, waitFor } from "@testing-library/react";
import type {
  Conversation,
  UpdateConversationInput,
} from "@fishbowl-ai/shared";
import { useUpdateConversation } from "../useUpdateConversation";

// Create stable mock logger to prevent infinite re-renders
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock useServices hook
jest.mock("../../../contexts", () => ({
  useServices: jest.fn(() => ({
    logger: mockLogger,
  })),
}));

// Mock data for testing
const mockConversation: Conversation = {
  id: "conversation-123",
  title: "Updated Test Conversation",
  created_at: "2023-01-01T10:00:00.000Z",
  updated_at: "2023-01-01T11:00:00.000Z",
};

const mockUpdateInput: UpdateConversationInput = {
  title: "Updated Test Conversation",
};

// Mock electronAPI
const mockUpdate = jest.fn();

beforeEach(() => {
  // Reset mocks
  mockUpdate.mockClear();
  mockLogger.debug.mockClear();
  mockLogger.info.mockClear();
  mockLogger.warn.mockClear();
  mockLogger.error.mockClear();

  // Mock window.electronAPI
  Object.defineProperty(window, "electronAPI", {
    value: {
      conversations: {
        update: mockUpdate,
      },
    },
    writable: true,
    configurable: true,
  });

  // Default successful response
  mockUpdate.mockResolvedValue(mockConversation);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useUpdateConversation", () => {
  describe("initial state", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useUpdateConversation());

      expect(result.current.isUpdating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.updateConversation).toBe("function");
      expect(typeof result.current.reset).toBe("function");
    });
  });

  describe("updateConversation function", () => {
    it("should update conversation successfully", async () => {
      const { result } = renderHook(() => useUpdateConversation());
      const conversationId = "conversation-123";

      const updatedConversation = await result.current.updateConversation(
        conversationId,
        mockUpdateInput,
      );

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(conversationId, mockUpdateInput);
      expect(updatedConversation).toEqual(mockConversation);
      expect(result.current.error).toBeNull();
      expect(result.current.isUpdating).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Updated conversation: ${mockConversation.id}`,
        {
          id: mockConversation.id,
          title: mockConversation.title,
          updates: mockUpdateInput,
        },
      );
    });

    it("should update conversation with partial data", async () => {
      const { result } = renderHook(() => useUpdateConversation());
      const conversationId = "conversation-123";
      const partialUpdate = { title: "Just Title Update" };

      const updatedConversation = await result.current.updateConversation(
        conversationId,
        partialUpdate,
      );

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(conversationId, partialUpdate);
      expect(updatedConversation).toEqual(mockConversation);
      expect(result.current.error).toBeNull();
      expect(result.current.isUpdating).toBe(false);
    });

    it("should manage loading state during update", async () => {
      const { result } = renderHook(() => useUpdateConversation());

      // Create a controllable promise to test loading state
      let resolveUpdate: (value: Conversation) => void;
      const slowUpdate = new Promise<Conversation>((resolve) => {
        resolveUpdate = resolve;
      });
      mockUpdate.mockReturnValue(slowUpdate);

      // Start update without waiting
      const updatePromise = result.current.updateConversation(
        "conversation-123",
        mockUpdateInput,
      );

      // Check if loading state is set
      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true);
      });

      // Resolve the promise
      resolveUpdate!(mockConversation);
      await updatePromise;

      // Should no longer be loading
      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });

    it("should clear previous errors on new update attempt", async () => {
      const { result } = renderHook(() => useUpdateConversation());

      // First, cause an error
      const firstError = new Error("First error");
      mockUpdate.mockRejectedValueOnce(firstError);

      try {
        await result.current.updateConversation(
          "conversation-123",
          mockUpdateInput,
        );
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.error).toBe(firstError);
      });

      // Now make a successful call
      mockUpdate.mockResolvedValue(mockConversation);

      await result.current.updateConversation(
        "conversation-123",
        mockUpdateInput,
      );

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe("error handling", () => {
    it("should handle IPC communication errors", async () => {
      const { result } = renderHook(() => useUpdateConversation());
      const testError = new Error("IPC communication failed");
      mockUpdate.mockRejectedValue(testError);

      await expect(
        result.current.updateConversation("conversation-123", mockUpdateInput),
      ).rejects.toThrow("IPC communication failed");

      await waitFor(() => {
        expect(result.current.error).toBe(testError);
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to update conversation:",
        testError,
      );
    });

    it("should handle non-Error objects as errors", async () => {
      const { result } = renderHook(() => useUpdateConversation());
      const stringError = "String error message";
      mockUpdate.mockRejectedValue(stringError);

      await expect(
        result.current.updateConversation("conversation-123", mockUpdateInput),
      ).rejects.toThrow("String error message");

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe("String error message");
        expect(result.current.isUpdating).toBe(false);
      });
    });

    it("should handle update errors from API", async () => {
      const { result } = renderHook(() => useUpdateConversation());
      const apiError = new Error("Failed to update conversation in database");
      mockUpdate.mockRejectedValue(apiError);

      await expect(
        result.current.updateConversation("conversation-123", mockUpdateInput),
      ).rejects.toThrow("Failed to update conversation in database");

      await waitFor(() => {
        expect(result.current.error).toBe(apiError);
        expect(result.current.isUpdating).toBe(false);
      });
    });

    it("should handle conversation not found errors", async () => {
      const { result } = renderHook(() => useUpdateConversation());
      const notFoundError = new Error("Conversation not found");
      mockUpdate.mockRejectedValue(notFoundError);

      await expect(
        result.current.updateConversation("nonexistent-id", mockUpdateInput),
      ).rejects.toThrow("Conversation not found");

      await waitFor(() => {
        expect(result.current.error).toBe(notFoundError);
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe("non-Electron environment", () => {
    beforeEach(() => {
      // Remove electronAPI to simulate non-Electron environment
      delete (window as any).electronAPI;
    });

    it("should handle missing electronAPI gracefully", async () => {
      const { result } = renderHook(() => useUpdateConversation());

      await expect(
        result.current.updateConversation("conversation-123", mockUpdateInput),
      ).rejects.toThrow(
        "Conversation update is not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, conversation update not available",
      );
    });

    it("should handle missing conversations API gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {},
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useUpdateConversation());

      await expect(
        result.current.updateConversation("conversation-123", mockUpdateInput),
      ).rejects.toThrow(
        "Conversation update is not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, conversation update not available",
      );
    });

    it("should handle non-function update method gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {
          conversations: {
            update: "not a function",
          },
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useUpdateConversation());

      await expect(
        result.current.updateConversation("conversation-123", mockUpdateInput),
      ).rejects.toThrow(
        "Conversation update is not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe("reset function", () => {
    it("should clear error state", async () => {
      const { result } = renderHook(() => useUpdateConversation());
      const testError = new Error("Test error");
      mockUpdate.mockRejectedValue(testError);

      // Cause an error
      try {
        await result.current.updateConversation(
          "conversation-123",
          mockUpdateInput,
        );
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
      const { result } = renderHook(() => useUpdateConversation());

      // Create a slow promise to test loading state persistence
      let resolveUpdate: (value: Conversation) => void;
      const slowUpdate = new Promise<Conversation>((resolve) => {
        resolveUpdate = resolve;
      });
      mockUpdate.mockReturnValue(slowUpdate);

      // Start update
      const updatePromise = result.current.updateConversation(
        "conversation-123",
        mockUpdateInput,
      );

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true);
      });

      // Reset should not affect loading state
      result.current.reset();
      expect(result.current.isUpdating).toBe(true);

      // Complete the update
      resolveUpdate!(mockConversation);
      await updatePromise;

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe("memory cleanup", () => {
    it("should not cause memory leaks on unmount", () => {
      const { unmount } = renderHook(() => useUpdateConversation());

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it("should not update state after unmount", async () => {
      let resolveUpdate: (value: Conversation) => void;
      const slowUpdate = new Promise<Conversation>((resolve) => {
        resolveUpdate = resolve;
      });
      mockUpdate.mockReturnValue(slowUpdate);

      const { unmount } = renderHook(() => useUpdateConversation());

      // Unmount immediately
      unmount();

      // Resolve the promise after unmount
      resolveUpdate!(mockConversation);

      // Should not cause any errors or warnings
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  describe("function stability", () => {
    it("should maintain stable function references", () => {
      const { result, rerender } = renderHook(() => useUpdateConversation());

      const firstUpdateConversation = result.current.updateConversation;
      const firstReset = result.current.reset;

      rerender();

      expect(result.current.updateConversation).toBe(firstUpdateConversation);
      expect(result.current.reset).toBe(firstReset);
    });
  });
});
