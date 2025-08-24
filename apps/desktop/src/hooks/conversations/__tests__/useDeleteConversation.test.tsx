/**
 * Unit tests for useDeleteConversation hook.
 *
 * Tests core functionality of the useDeleteConversation hook for conversation deletion.
 *
 * @module hooks/conversations/__tests__/useDeleteConversation.test
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useDeleteConversation } from "../useDeleteConversation";

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

// Mock electronAPI
const mockDelete = jest.fn();

beforeEach(() => {
  // Reset mocks
  mockDelete.mockClear();
  mockLogger.debug.mockClear();
  mockLogger.info.mockClear();
  mockLogger.warn.mockClear();
  mockLogger.error.mockClear();

  // Mock window.electronAPI
  Object.defineProperty(window, "electronAPI", {
    value: {
      conversations: {
        delete: mockDelete,
      },
    },
    writable: true,
    configurable: true,
  });

  // Default successful response
  mockDelete.mockResolvedValue(true);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useDeleteConversation", () => {
  describe("initial state", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useDeleteConversation());

      expect(result.current.isDeleting).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.deleteConversation).toBe("function");
      expect(typeof result.current.reset).toBe("function");
    });
  });

  describe("deleteConversation function", () => {
    it("should delete conversation successfully", async () => {
      const { result } = renderHook(() => useDeleteConversation());
      const conversationId = "conversation-123";

      const success = await result.current.deleteConversation(conversationId);

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith(conversationId);
      expect(success).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isDeleting).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Deleted conversation: ${conversationId}`,
      );
    });

    it("should return false when deletion is unsuccessful", async () => {
      const { result } = renderHook(() => useDeleteConversation());
      const conversationId = "conversation-456";
      mockDelete.mockResolvedValue(false);

      const success = await result.current.deleteConversation(conversationId);

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith(conversationId);
      expect(success).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isDeleting).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Deleted conversation: ${conversationId}`,
      );
    });

    it("should manage loading state during deletion", async () => {
      const { result } = renderHook(() => useDeleteConversation());

      // Create a controllable promise to test loading state
      let resolveDelete: (value: boolean) => void;
      const slowDelete = new Promise<boolean>((resolve) => {
        resolveDelete = resolve;
      });
      mockDelete.mockReturnValue(slowDelete);

      // Start deletion without waiting
      const deletePromise = result.current.deleteConversation("test-id");

      // Check if loading state is set
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(true);
      });

      // Resolve the promise
      resolveDelete!(true);
      await deletePromise;

      // Should no longer be loading
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });

    it("should clear previous errors on new deletion attempt", async () => {
      const { result } = renderHook(() => useDeleteConversation());

      // First, cause an error
      const firstError = new Error("First error");
      mockDelete.mockRejectedValueOnce(firstError);

      try {
        await result.current.deleteConversation("test-id");
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.error).toBe(firstError);
      });

      // Now make a successful call
      mockDelete.mockResolvedValue(true);

      await result.current.deleteConversation("test-id-2");

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe("error handling", () => {
    it("should handle IPC communication errors", async () => {
      const { result } = renderHook(() => useDeleteConversation());
      const testError = new Error("IPC communication failed");
      mockDelete.mockRejectedValue(testError);

      await expect(
        result.current.deleteConversation("test-id"),
      ).rejects.toThrow("IPC communication failed");

      await waitFor(() => {
        expect(result.current.error).toBe(testError);
        expect(result.current.isDeleting).toBe(false);
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to delete conversation:",
        testError,
      );
    });

    it("should handle non-Error objects as errors", async () => {
      const { result } = renderHook(() => useDeleteConversation());
      const stringError = "String error message";
      mockDelete.mockRejectedValue(stringError);

      await expect(
        result.current.deleteConversation("test-id"),
      ).rejects.toThrow("String error message");

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe("String error message");
        expect(result.current.isDeleting).toBe(false);
      });
    });

    it("should handle deletion errors from API", async () => {
      const { result } = renderHook(() => useDeleteConversation());
      const apiError = new Error("Failed to delete conversation from database");
      mockDelete.mockRejectedValue(apiError);

      await expect(
        result.current.deleteConversation("test-id"),
      ).rejects.toThrow("Failed to delete conversation from database");

      await waitFor(() => {
        expect(result.current.error).toBe(apiError);
        expect(result.current.isDeleting).toBe(false);
      });
    });
  });

  describe("non-Electron environment", () => {
    beforeEach(() => {
      // Remove electronAPI to simulate non-Electron environment
      delete (window as any).electronAPI;
    });

    it("should handle missing electronAPI gracefully", async () => {
      const { result } = renderHook(() => useDeleteConversation());

      await expect(
        result.current.deleteConversation("test-id"),
      ).rejects.toThrow(
        "Delete conversation not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.isDeleting).toBe(false);
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, conversation deletion not available",
      );
    });

    it("should handle missing conversations API gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {},
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useDeleteConversation());

      await expect(
        result.current.deleteConversation("test-id"),
      ).rejects.toThrow(
        "Delete conversation not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.isDeleting).toBe(false);
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, conversation deletion not available",
      );
    });

    it("should handle missing delete method gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {
          conversations: {},
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useDeleteConversation());

      await expect(
        result.current.deleteConversation("test-id"),
      ).rejects.toThrow(
        "Delete conversation not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.isDeleting).toBe(false);
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, conversation deletion not available",
      );
    });

    it("should handle non-function delete method gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {
          conversations: {
            delete: "not a function",
          },
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useDeleteConversation());

      await expect(
        result.current.deleteConversation("test-id"),
      ).rejects.toThrow(
        "Delete conversation not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.isDeleting).toBe(false);
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, conversation deletion not available",
      );
    });
  });

  describe("reset function", () => {
    it("should clear error state", async () => {
      const { result } = renderHook(() => useDeleteConversation());
      const testError = new Error("Test error");
      mockDelete.mockRejectedValue(testError);

      // Cause an error
      try {
        await result.current.deleteConversation("test-id");
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
      const { result } = renderHook(() => useDeleteConversation());

      // Create a slow promise to test loading state persistence
      let resolveDelete: (value: boolean) => void;
      const slowDelete = new Promise<boolean>((resolve) => {
        resolveDelete = resolve;
      });
      mockDelete.mockReturnValue(slowDelete);

      // Start deletion
      const deletePromise = result.current.deleteConversation("test-id");

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(true);
      });

      // Reset should not affect loading state
      result.current.reset();
      expect(result.current.isDeleting).toBe(true);

      // Complete the deletion
      resolveDelete!(true);
      await deletePromise;

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });
  });

  describe("memory cleanup", () => {
    it("should not cause memory leaks on unmount", () => {
      const { unmount } = renderHook(() => useDeleteConversation());

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it("should not update state after unmount", async () => {
      let resolveDelete: (value: boolean) => void;
      const slowDelete = new Promise<boolean>((resolve) => {
        resolveDelete = resolve;
      });
      mockDelete.mockReturnValue(slowDelete);

      const { unmount } = renderHook(() => useDeleteConversation());

      // Unmount immediately
      unmount();

      // Resolve the promise after unmount
      resolveDelete!(true);

      // Should not cause any errors or warnings
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  describe("function stability", () => {
    it("should maintain stable function references", () => {
      const { result, rerender } = renderHook(() => useDeleteConversation());

      const firstDeleteConversation = result.current.deleteConversation;
      const firstReset = result.current.reset;

      rerender();

      expect(result.current.deleteConversation).toBe(firstDeleteConversation);
      expect(result.current.reset).toBe(firstReset);
    });
  });
});
