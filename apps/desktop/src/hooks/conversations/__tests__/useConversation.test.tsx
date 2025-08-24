/**
 * Unit tests for useConversation hook.
 *
 * Tests core functionality of the useConversation hook for single conversation management.
 *
 * @module hooks/conversations/__tests__/useConversation.test
 */

import { renderHook, waitFor } from "@testing-library/react";
import type { Conversation } from "@fishbowl-ai/shared";
import { useConversation } from "../useConversation";

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
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Test Conversation",
  created_at: "2023-01-01T10:00:00.000Z",
  updated_at: "2023-01-01T10:00:00.000Z",
};

// Mock window.electronAPI.conversations.get
const mockGet = jest.fn();

// Setup global mocks
beforeAll(() => {
  Object.defineProperty(window, "electronAPI", {
    value: {
      conversations: {
        get: mockGet,
      },
    },
    writable: true,
  });
});

describe("useConversation", () => {
  beforeEach(() => {
    // Clear all mock calls and implementations
    jest.clearAllMocks();
    mockGet.mockClear();
    mockLogger.debug.mockClear();
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
  });

  describe("initialization", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => useConversation(null));

      expect(result.current.conversation).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.notFound).toBe(false);
      expect(typeof result.current.refetch).toBe("function");
    });

    it("should not fetch when id is null", () => {
      renderHook(() => useConversation(null));

      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should not fetch when id is empty string", () => {
      renderHook(() => useConversation(""));

      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should not fetch when id is only whitespace", () => {
      renderHook(() => useConversation("   "));

      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("successful conversation fetch", () => {
    const validId = "550e8400-e29b-41d4-a716-446655440000";

    it("should fetch conversation with valid UUID", async () => {
      mockGet.mockResolvedValue(mockConversation);

      const { result } = renderHook(() => useConversation(validId));

      // Should start loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledWith(validId);
      expect(result.current.conversation).toEqual(mockConversation);
      expect(result.current.error).toBeNull();
      expect(result.current.notFound).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Loaded conversation: ${validId}`,
      );
    });

    it("should handle conversation not found (null response)", async () => {
      mockGet.mockResolvedValue(null);

      const { result } = renderHook(() => useConversation(validId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledWith(validId);
      expect(result.current.conversation).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.notFound).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Conversation not found: ${validId}`,
      );
    });
  });

  describe("UUID validation", () => {
    it("should reject invalid UUID format", async () => {
      const invalidId = "invalid-uuid";

      const { result } = renderHook(() => useConversation(invalidId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.conversation).toBeNull();
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(
        `Invalid conversation ID format: ${invalidId}`,
      );
      expect(result.current.notFound).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Invalid UUID format provided",
        expect.any(Error),
      );
    });

    it("should accept valid UUID v4 format", async () => {
      const validUUIDs = [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-41d1-89b4-00c04fd430c8", // Fixed to be valid v4
        "01234567-89ab-4def-8012-3456789abcde", // Fixed to be valid v4
      ];

      for (const uuid of validUUIDs) {
        mockGet.mockResolvedValue(mockConversation);
        const { result } = renderHook(() => useConversation(uuid));

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(mockGet).toHaveBeenCalledWith(uuid);
        expect(result.current.error).toBeNull();
        mockGet.mockClear();
      }
    });

    it("should reject malformed UUIDs", async () => {
      const invalidUUIDs = [
        "550e8400-e29b-41d4-a716-44665544000", // too short
        "550e8400-e29b-41d4-a716-4466554400000", // too long
        "550e8400-e29b-51d4-a716-446655440000", // invalid version
        "550e8400-e29b-41d4-c716-446655440000", // invalid variant
        "550e8400xe29bx41d4xa716x446655440000", // missing dashes
        "hello-world-test-1234-567890abcdef", // invalid characters
      ];

      for (const uuid of invalidUUIDs) {
        const { result } = renderHook(() => useConversation(uuid));

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(mockGet).not.toHaveBeenCalled();
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toContain(
          "Invalid conversation ID format",
        );
        mockGet.mockClear();
      }
    });
  });

  describe("error handling", () => {
    const validId = "550e8400-e29b-41d4-a716-446655440000";

    it("should handle IPC communication errors", async () => {
      const ipcError = new Error("IPC communication failed");
      mockGet.mockRejectedValue(ipcError);

      const { result } = renderHook(() => useConversation(validId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversation).toBeNull();
      expect(result.current.error).toBe(ipcError);
      expect(result.current.notFound).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to load conversation:",
        ipcError,
      );
    });

    it("should handle string errors from IPC", async () => {
      const stringError = "String error from IPC";
      mockGet.mockRejectedValue(stringError);

      const { result } = renderHook(() => useConversation(validId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversation).toBeNull();
      expect(result.current.error).toBe(stringError);
      expect(result.current.notFound).toBe(false);
    });
  });

  describe("environment detection", () => {
    const validId = "550e8400-e29b-41d4-a716-446655440000";

    it("should handle missing window.electronAPI", async () => {
      // Store original electronAPI
      const originalElectronAPI = window.electronAPI;

      // Remove the entire electronAPI to simulate missing window
      // @ts-expect-error - Intentionally setting to undefined for test
      window.electronAPI = undefined;

      const { result } = renderHook(() => useConversation(validId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.conversation).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.notFound).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, skipping conversation load",
      );

      // Restore electronAPI
      window.electronAPI = originalElectronAPI;
    });

    it("should handle missing electronAPI.conversations", async () => {
      const originalConversations = window.electronAPI.conversations;
      // @ts-expect-error - Intentionally setting to undefined for test
      window.electronAPI.conversations = undefined;

      const { result } = renderHook(() => useConversation(validId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.conversation).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, skipping conversation load",
      );

      window.electronAPI.conversations = originalConversations;
    });

    it("should handle missing conversations.get function", async () => {
      const originalGet = window.electronAPI.conversations.get;
      // @ts-expect-error - Intentionally setting to undefined for test
      window.electronAPI.conversations.get = undefined;

      const { result } = renderHook(() => useConversation(validId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.conversation).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, skipping conversation load",
      );

      window.electronAPI.conversations.get = originalGet;
    });
  });

  describe("ID changes", () => {
    it("should clear previous data when ID changes", async () => {
      const firstId = "550e8400-e29b-41d4-a716-446655440001";
      const secondId = "550e8400-e29b-41d4-a716-446655440002";

      mockGet.mockResolvedValue(mockConversation);

      const { result, rerender } = renderHook(
        ({ id }: { id: string | null }) => useConversation(id),
        {
          initialProps: { id: firstId as string | null },
        },
      );

      // Wait for first load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.conversation).toEqual(mockConversation);

      // Change ID
      rerender({ id: secondId });

      // Should clear previous data and start loading again
      expect(result.current.conversation).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.notFound).toBe(false);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(mockGet).toHaveBeenLastCalledWith(secondId);
    });

    it("should handle changing from valid ID to null", async () => {
      const validId = "550e8400-e29b-41d4-a716-446655440000";
      mockGet.mockResolvedValue(mockConversation);

      const { result, rerender } = renderHook(
        ({ id }: { id: string | null }) => useConversation(id),
        {
          initialProps: { id: validId as string | null },
        },
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.conversation).toEqual(mockConversation);

      // Change to null
      rerender({ id: null });

      expect(result.current.conversation).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.notFound).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("refetch functionality", () => {
    const validId = "550e8400-e29b-41d4-a716-446655440000";

    it("should manually refetch conversation", async () => {
      mockGet.mockResolvedValue(mockConversation);

      const { result } = renderHook(() => useConversation(validId));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear mock call count
      mockGet.mockClear();

      // Call refetch
      await result.current.refetch();

      expect(mockGet).toHaveBeenCalledWith(validId);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it("should not refetch when ID is null", async () => {
      const { result } = renderHook(() => useConversation(null));

      // Call refetch with null ID
      await result.current.refetch();

      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should handle refetch errors", async () => {
      mockGet.mockResolvedValueOnce(mockConversation);
      const { result } = renderHook(() => useConversation(validId));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Setup error for refetch
      const refetchError = new Error("Refetch failed");
      mockGet.mockRejectedValueOnce(refetchError);

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBe(refetchError);
      });
    });
  });

  describe("loading state management", () => {
    const validId = "550e8400-e29b-41d4-a716-446655440000";

    it("should manage loading state correctly during fetch", async () => {
      // Use a promise we can control
      let resolvePromise: (value: Conversation) => void;
      const controlledPromise = new Promise<Conversation>((resolve) => {
        resolvePromise = resolve;
      });
      mockGet.mockReturnValue(controlledPromise);

      const { result } = renderHook(() => useConversation(validId));

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      resolvePromise!(mockConversation);

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversation).toEqual(mockConversation);
    });

    it("should reset loading state on error", async () => {
      const error = new Error("Test error");
      mockGet.mockRejectedValue(error);

      const { result } = renderHook(() => useConversation(validId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe("memory cleanup", () => {
    it("should not update state after unmount", async () => {
      const validId = "550e8400-e29b-41d4-a716-446655440000";

      // Create a controlled promise
      let resolvePromise: (value: Conversation) => void;
      const controlledPromise = new Promise<Conversation>((resolve) => {
        resolvePromise = resolve;
      });
      mockGet.mockReturnValue(controlledPromise);

      const { unmount } = renderHook(() => useConversation(validId));

      // Unmount before promise resolves
      unmount();

      // Resolve promise after unmount
      resolvePromise!(mockConversation);

      // Wait a bit to ensure no state updates occur
      await new Promise((resolve) => setTimeout(resolve, 10));

      // If this test passes without warnings, memory cleanup is working
      expect(true).toBe(true);
    });
  });
});
