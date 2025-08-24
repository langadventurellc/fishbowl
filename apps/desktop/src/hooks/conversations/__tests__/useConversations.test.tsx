/**
 * Unit tests for useConversations hook.
 *
 * Tests core functionality of the useConversations hook for conversation management.
 *
 * @module hooks/conversations/__tests__/useConversations.test
 */

import { renderHook, waitFor } from "@testing-library/react";
import type { Conversation } from "@fishbowl-ai/shared";
import { useConversations } from "../useConversations";

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
const mockConversation1: Conversation = {
  id: "conversation-1",
  title: "First Conversation",
  created_at: "2023-01-01T10:00:00.000Z",
  updated_at: "2023-01-01T10:00:00.000Z",
};

const mockConversation2: Conversation = {
  id: "conversation-2",
  title: "Second Conversation",
  created_at: "2023-01-02T10:00:00.000Z",
  updated_at: "2023-01-02T10:00:00.000Z",
};

const mockConversation3: Conversation = {
  id: "conversation-3",
  title: "Third Conversation",
  created_at: "2023-01-03T10:00:00.000Z",
  updated_at: "2023-01-03T10:00:00.000Z",
};

const mockConversations = [
  mockConversation1,
  mockConversation2,
  mockConversation3,
];

// Mock electronAPI
const mockList = jest.fn();

beforeEach(() => {
  // Reset mocks
  mockList.mockClear();
  mockLogger.debug.mockClear();
  mockLogger.info.mockClear();
  mockLogger.warn.mockClear();
  mockLogger.error.mockClear();

  // Mock window.electronAPI
  Object.defineProperty(window, "electronAPI", {
    value: {
      conversations: {
        list: mockList,
      },
    },
    writable: true,
    configurable: true,
  });

  // Default successful response - unsorted to test sorting
  mockList.mockResolvedValue([
    mockConversation1,
    mockConversation3,
    mockConversation2,
  ]);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useConversations", () => {
  describe("initial load", () => {
    it("should initialize with loading state", () => {
      const { result } = renderHook(() => useConversations());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.conversations).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isEmpty).toBe(true);
    });

    it("should load conversations successfully and sort by created_at descending", async () => {
      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockList).toHaveBeenCalledTimes(1);
      expect(result.current.conversations).toEqual([
        mockConversation3, // 2023-01-03 (newest first)
        mockConversation2, // 2023-01-02
        mockConversation1, // 2023-01-01
      ]);
      expect(result.current.error).toBeNull();
      expect(result.current.isEmpty).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith("Loaded 3 conversations");
    });

    it("should handle empty conversations list", async () => {
      mockList.mockResolvedValue([]);
      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversations).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isEmpty).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith("Loaded 0 conversations");
    });
  });

  describe("error handling", () => {
    it("should handle API errors during initial load", async () => {
      const testError = new Error("Failed to fetch conversations");
      mockList.mockRejectedValue(testError);

      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversations).toEqual([]);
      expect(result.current.error).toBe(testError);
      expect(result.current.isEmpty).toBe(true);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to load conversations:",
        testError,
      );
    });

    it("should handle non-Error objects as errors", async () => {
      const testError = "String error message";
      mockList.mockRejectedValue(testError);

      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversations).toEqual([]);
      expect(result.current.error).toBe(testError);
      expect(result.current.isEmpty).toBe(true);
    });
  });

  describe("non-Electron environment", () => {
    beforeEach(() => {
      // Remove electronAPI to simulate non-Electron environment
      delete (window as any).electronAPI;
    });

    it("should handle missing electronAPI gracefully", async () => {
      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversations).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isEmpty).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, skipping conversations load",
      );
    });

    it("should handle missing conversations API gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {},
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversations).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isEmpty).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, skipping conversations load",
      );
    });

    it("should handle non-function list method gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {
          conversations: {
            list: "not a function",
          },
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversations).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isEmpty).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, skipping conversations load",
      );
    });
  });

  describe("refetch functionality", () => {
    it("should refetch conversations successfully", async () => {
      const { result } = renderHook(() => useConversations());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockList).toHaveBeenCalledTimes(1);

      // Update mock data and refetch
      const newMockConversations = [
        { ...mockConversation1, title: "Updated Conversation" },
      ];
      mockList.mockResolvedValue(newMockConversations);

      await waitFor(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(mockList).toHaveBeenCalledTimes(2);
        expect(result.current.conversations).toEqual(newMockConversations);
        expect(result.current.error).toBeNull();
      });
    });

    it("should handle refetch errors", async () => {
      const { result } = renderHook(() => useConversations());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock error on refetch
      const refetchError = new Error("Refetch failed");
      mockList.mockRejectedValue(refetchError);

      await waitFor(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(refetchError);
      });
    });

    it("should clear previous errors on successful refetch", async () => {
      // Start with an error
      mockList.mockRejectedValue(new Error("Initial error"));
      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Mock successful refetch
      mockList.mockResolvedValue(mockConversations);

      await waitFor(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.conversations).toEqual([
          mockConversation3, // Sorted by created_at desc
          mockConversation2,
          mockConversation1,
        ]);
      });
    });

    it("should set loading state during refetch", async () => {
      const { result } = renderHook(() => useConversations());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Create a controllable promise to test loading state
      let resolveRefetch: (value: Conversation[]) => void;
      const slowRefetch = new Promise<Conversation[]>((resolve) => {
        resolveRefetch = resolve;
      });
      mockList.mockReturnValue(slowRefetch);

      // Start refetch without waiting
      const refetchPromise = result.current.refetch();

      // Check if loading state is set (may need to wait briefly)
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve the promise
      resolveRefetch!(mockConversations);
      await refetchPromise;

      // Should no longer be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("sorting behavior", () => {
    it("should sort conversations by created_at in descending order", async () => {
      // Mix up the order to ensure sorting works
      const unsortedConversations = [
        { ...mockConversation2, created_at: "2023-01-15T10:00:00.000Z" },
        { ...mockConversation1, created_at: "2023-01-10T10:00:00.000Z" },
        { ...mockConversation3, created_at: "2023-01-20T10:00:00.000Z" },
      ];
      mockList.mockResolvedValue(unsortedConversations);

      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should be sorted newest first
      expect(result.current.conversations).toHaveLength(3);
      expect(result.current.conversations[0]?.created_at).toBe(
        "2023-01-20T10:00:00.000Z",
      );
      expect(result.current.conversations[1]?.created_at).toBe(
        "2023-01-15T10:00:00.000Z",
      );
      expect(result.current.conversations[2]?.created_at).toBe(
        "2023-01-10T10:00:00.000Z",
      );
    });

    it("should handle invalid dates gracefully", async () => {
      const conversationsWithInvalidDates = [
        { ...mockConversation1, created_at: "invalid-date" },
        { ...mockConversation2, created_at: "2023-01-15T10:00:00.000Z" },
      ];
      mockList.mockResolvedValue(conversationsWithInvalidDates);

      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still return conversations without throwing
      expect(result.current.conversations).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });
  });

  describe("memory cleanup", () => {
    it("should not cause memory leaks on unmount", () => {
      const { unmount } = renderHook(() => useConversations());

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it("should not update state after unmount", async () => {
      let resolveList: (value: Conversation[]) => void;
      const slowList = new Promise<Conversation[]>((resolve) => {
        resolveList = resolve;
      });
      mockList.mockReturnValue(slowList);

      const { unmount } = renderHook(() => useConversations());

      // Unmount immediately
      unmount();

      // Resolve the promise after unmount
      resolveList!(mockConversations);

      // Should not cause any errors or warnings
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });
});
