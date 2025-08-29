/**
 * Unit tests for useMessages hook.
 *
 * Tests core functionality of the useMessages hook for message management.
 *
 * @module hooks/messages/__tests__/useMessages.test
 */

import { renderHook, waitFor } from "@testing-library/react";
import type { Message } from "@fishbowl-ai/shared";
import { useMessages } from "../useMessages";

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

const TEST_CONVERSATION_ID = "test-conversation-id";

// Mock data for testing
const mockMessage1: Message = {
  id: "message-1",
  conversation_id: TEST_CONVERSATION_ID,
  conversation_agent_id: null,
  role: "user",
  content: "First message",
  included: true,
  created_at: "2023-01-01T10:00:00.000Z",
};

const mockMessage2: Message = {
  id: "message-2",
  conversation_id: TEST_CONVERSATION_ID,
  conversation_agent_id: "agent-1",
  role: "agent",
  content: "Second message",
  included: true,
  created_at: "2023-01-01T11:00:00.000Z",
};

const mockMessage3: Message = {
  id: "message-3",
  conversation_id: TEST_CONVERSATION_ID,
  conversation_agent_id: null,
  role: "user",
  content: "Third message",
  included: false,
  created_at: "2023-01-01T12:00:00.000Z",
};

// Message with same timestamp as message1 to test ID-based sorting
const mockMessage4: Message = {
  id: "message-0",
  conversation_id: TEST_CONVERSATION_ID,
  conversation_agent_id: null,
  role: "system",
  content: "Earlier ID, same timestamp",
  included: true,
  created_at: "2023-01-01T10:00:00.000Z", // Same as mockMessage1
};

const mockMessages = [mockMessage1, mockMessage2, mockMessage3, mockMessage4];

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
      messages: {
        list: mockList,
      },
    },
    writable: true,
    configurable: true,
  });

  // Default successful response - unsorted to test sorting
  mockList.mockResolvedValue([
    mockMessage3,
    mockMessage1,
    mockMessage4,
    mockMessage2,
  ]);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useMessages", () => {
  describe("initial load", () => {
    it("should initialize with loading state", () => {
      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isEmpty).toBe(true);
    });

    it("should load messages successfully and sort by created_at ascending, then by id ascending", async () => {
      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockList).toHaveBeenCalledTimes(1);
      expect(mockList).toHaveBeenCalledWith(TEST_CONVERSATION_ID);
      expect(result.current.messages).toEqual([
        mockMessage4, // 2023-01-01T10:00:00.000Z, id: message-0 (earlier ID)
        mockMessage1, // 2023-01-01T10:00:00.000Z, id: message-1 (later ID)
        mockMessage2, // 2023-01-01T11:00:00.000Z
        mockMessage3, // 2023-01-01T12:00:00.000Z
      ]);
      expect(result.current.error).toBeNull();
      expect(result.current.isEmpty).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Loaded 4 messages for conversation ${TEST_CONVERSATION_ID}`,
      );
    });

    it("should handle empty messages list", async () => {
      mockList.mockResolvedValue([]);
      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isEmpty).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Loaded 0 messages for conversation ${TEST_CONVERSATION_ID}`,
      );
    });

    it("should reload messages when conversationId changes", async () => {
      const { result, rerender } = renderHook(
        ({ conversationId }: { conversationId: string }) =>
          useMessages(conversationId),
        {
          initialProps: { conversationId: "conversation-1" },
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockList).toHaveBeenCalledWith("conversation-1");

      // Change conversation ID
      rerender({ conversationId: "conversation-2" });

      await waitFor(() => {
        expect(mockList).toHaveBeenCalledWith("conversation-2");
      });

      expect(mockList).toHaveBeenCalledTimes(2);
    });
  });

  describe("error handling", () => {
    it("should handle API errors during initial load", async () => {
      const testError = new Error("Failed to fetch messages");
      mockList.mockRejectedValue(testError);

      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBe(testError);
      expect(result.current.isEmpty).toBe(true);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to load messages:",
        testError,
      );
    });

    it("should handle non-Error objects as errors", async () => {
      const testError = "String error message";
      mockList.mockRejectedValue(testError);

      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.messages).toEqual([]);
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
      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isEmpty).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, skipping messages load",
      );
    });

    it("should handle missing messages API gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {},
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isEmpty).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, skipping messages load",
      );
    });

    it("should handle non-function list method gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {
          messages: {
            list: "not a function",
          },
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isEmpty).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, skipping messages load",
      );
    });
  });

  describe("refetch functionality", () => {
    it("should refetch messages successfully", async () => {
      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockList).toHaveBeenCalledTimes(1);

      // Update mock data and refetch
      const newMockMessages = [
        { ...mockMessage1, content: "Updated message content" },
      ];
      mockList.mockResolvedValue(newMockMessages);

      await waitFor(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(mockList).toHaveBeenCalledTimes(2);
        expect(mockList).toHaveBeenCalledWith(TEST_CONVERSATION_ID);
        expect(result.current.messages).toEqual(newMockMessages);
        expect(result.current.error).toBeNull();
      });
    });

    it("should handle refetch errors", async () => {
      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

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
      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Mock successful refetch
      mockList.mockResolvedValue(mockMessages);

      await waitFor(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.messages).toEqual([
          mockMessage4, // Sorted by created_at asc, then id asc
          mockMessage1,
          mockMessage2,
          mockMessage3,
        ]);
      });
    });

    it("should set loading state during refetch", async () => {
      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Create a controllable promise to test loading state
      let resolveRefetch: (value: Message[]) => void;
      const slowRefetch = new Promise<Message[]>((resolve) => {
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
      resolveRefetch!(mockMessages);
      await refetchPromise;

      // Should no longer be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("sorting behavior", () => {
    it("should sort messages by created_at in ascending order", async () => {
      // Mix up the order to ensure sorting works
      const unsortedMessages = [
        { ...mockMessage2, created_at: "2023-01-01T15:00:00.000Z" },
        { ...mockMessage1, created_at: "2023-01-01T10:00:00.000Z" },
        { ...mockMessage3, created_at: "2023-01-01T20:00:00.000Z" },
      ];
      mockList.mockResolvedValue(unsortedMessages);

      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should be sorted oldest first
      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages[0]?.created_at).toBe(
        "2023-01-01T10:00:00.000Z",
      );
      expect(result.current.messages[1]?.created_at).toBe(
        "2023-01-01T15:00:00.000Z",
      );
      expect(result.current.messages[2]?.created_at).toBe(
        "2023-01-01T20:00:00.000Z",
      );
    });

    it("should use id as secondary sort when timestamps are equal", async () => {
      const messagesWithSameTimestamp = [
        {
          ...mockMessage2,
          id: "message-z",
          created_at: "2023-01-01T10:00:00.000Z",
        },
        {
          ...mockMessage1,
          id: "message-a",
          created_at: "2023-01-01T10:00:00.000Z",
        },
        {
          ...mockMessage3,
          id: "message-m",
          created_at: "2023-01-01T10:00:00.000Z",
        },
      ];
      mockList.mockResolvedValue(messagesWithSameTimestamp);

      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should be sorted by id alphabetically when timestamps are equal
      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages[0]?.id).toBe("message-a");
      expect(result.current.messages[1]?.id).toBe("message-m");
      expect(result.current.messages[2]?.id).toBe("message-z");
    });

    it("should handle invalid dates gracefully", async () => {
      const messagesWithInvalidDates = [
        { ...mockMessage1, created_at: "invalid-date" },
        { ...mockMessage2, created_at: "2023-01-15T10:00:00.000Z" },
      ];
      mockList.mockResolvedValue(messagesWithInvalidDates);

      const { result } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still return messages without throwing
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });
  });

  describe("memory cleanup", () => {
    it("should not cause memory leaks on unmount", () => {
      const { unmount } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it("should not update state after unmount", async () => {
      let resolveList: (value: Message[]) => void;
      const slowList = new Promise<Message[]>((resolve) => {
        resolveList = resolve;
      });
      mockList.mockReturnValue(slowList);

      const { unmount } = renderHook(() => useMessages(TEST_CONVERSATION_ID));

      // Unmount immediately
      unmount();

      // Resolve the promise after unmount
      resolveList!(mockMessages);

      // Should not cause any errors or warnings
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });
});
