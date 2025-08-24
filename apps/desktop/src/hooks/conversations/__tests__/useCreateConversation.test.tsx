/**
 * Unit tests for useCreateConversation hook.
 *
 * Tests core functionality of the useCreateConversation hook for conversation creation.
 *
 * @module hooks/conversations/__tests__/useCreateConversation.test
 */

import { renderHook, waitFor } from "@testing-library/react";
import type { Conversation } from "@fishbowl-ai/shared";
import { useCreateConversation } from "../useCreateConversation";

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
  title: "Test Conversation",
  created_at: "2023-01-01T10:00:00.000Z",
  updated_at: "2023-01-01T10:00:00.000Z",
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
      conversations: {
        create: mockCreate,
      },
    },
    writable: true,
    configurable: true,
  });

  // Default successful response
  mockCreate.mockResolvedValue(mockConversation);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useCreateConversation", () => {
  describe("initial state", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useCreateConversation());

      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.createConversation).toBe("function");
      expect(typeof result.current.reset).toBe("function");
    });
  });

  describe("createConversation function", () => {
    it("should create conversation successfully with title", async () => {
      const { result } = renderHook(() => useCreateConversation());
      const title = "My New Conversation";

      const createdConversation =
        await result.current.createConversation(title);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(title);
      expect(createdConversation).toEqual(mockConversation);
      expect(result.current.error).toBeNull();
      expect(result.current.isCreating).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Created conversation: ${mockConversation.id}`,
        {
          id: mockConversation.id,
          title: mockConversation.title,
        },
      );
    });

    it("should create conversation successfully without title", async () => {
      const { result } = renderHook(() => useCreateConversation());

      const createdConversation = await result.current.createConversation();

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(undefined);
      expect(createdConversation).toEqual(mockConversation);
      expect(result.current.error).toBeNull();
      expect(result.current.isCreating).toBe(false);
    });

    it("should manage loading state during creation", async () => {
      const { result } = renderHook(() => useCreateConversation());

      // Create a controllable promise to test loading state
      let resolveCreate: (value: Conversation) => void;
      const slowCreate = new Promise<Conversation>((resolve) => {
        resolveCreate = resolve;
      });
      mockCreate.mockReturnValue(slowCreate);

      // Start creation without waiting
      const createPromise = result.current.createConversation("Test Title");

      // Check if loading state is set
      await waitFor(() => {
        expect(result.current.isCreating).toBe(true);
      });

      // Resolve the promise
      resolveCreate!(mockConversation);
      await createPromise;

      // Should no longer be loading
      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });

    it("should clear previous errors on new creation attempt", async () => {
      const { result } = renderHook(() => useCreateConversation());

      // First, cause an error
      const firstError = new Error("First error");
      mockCreate.mockRejectedValueOnce(firstError);

      try {
        await result.current.createConversation("Test");
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.error).toBe(firstError);
      });

      // Now make a successful call
      mockCreate.mockResolvedValue(mockConversation);

      await result.current.createConversation("Test Success");

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe("error handling", () => {
    it("should handle IPC communication errors", async () => {
      const { result } = renderHook(() => useCreateConversation());
      const testError = new Error("IPC communication failed");
      mockCreate.mockRejectedValue(testError);

      await expect(
        result.current.createConversation("Test Title"),
      ).rejects.toThrow("IPC communication failed");

      await waitFor(() => {
        expect(result.current.error).toBe(testError);
        expect(result.current.isCreating).toBe(false);
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to create conversation:",
        testError,
      );
    });

    it("should handle non-Error objects as errors", async () => {
      const { result } = renderHook(() => useCreateConversation());
      const stringError = "String error message";
      mockCreate.mockRejectedValue(stringError);

      await expect(
        result.current.createConversation("Test Title"),
      ).rejects.toThrow("String error message");

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe("String error message");
        expect(result.current.isCreating).toBe(false);
      });
    });

    it("should handle creation errors from API", async () => {
      const { result } = renderHook(() => useCreateConversation());
      const apiError = new Error("Failed to create conversation in database");
      mockCreate.mockRejectedValue(apiError);

      await expect(
        result.current.createConversation("Test Title"),
      ).rejects.toThrow("Failed to create conversation in database");

      await waitFor(() => {
        expect(result.current.error).toBe(apiError);
        expect(result.current.isCreating).toBe(false);
      });
    });
  });

  describe("non-Electron environment", () => {
    beforeEach(() => {
      // Remove electronAPI to simulate non-Electron environment
      delete (window as any).electronAPI;
    });

    it("should handle missing electronAPI gracefully", async () => {
      const { result } = renderHook(() => useCreateConversation());

      await expect(
        result.current.createConversation("Test Title"),
      ).rejects.toThrow(
        "Conversation creation is not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.isCreating).toBe(false);
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, conversation creation not available",
      );
    });

    it("should handle missing conversations API gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {},
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useCreateConversation());

      await expect(
        result.current.createConversation("Test Title"),
      ).rejects.toThrow(
        "Conversation creation is not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.isCreating).toBe(false);
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, conversation creation not available",
      );
    });

    it("should handle non-function create method gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {
          conversations: {
            create: "not a function",
          },
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useCreateConversation());

      await expect(
        result.current.createConversation("Test Title"),
      ).rejects.toThrow(
        "Conversation creation is not available in this environment",
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.isCreating).toBe(false);
      });
    });
  });

  describe("reset function", () => {
    it("should clear error state", async () => {
      const { result } = renderHook(() => useCreateConversation());
      const testError = new Error("Test error");
      mockCreate.mockRejectedValue(testError);

      // Cause an error
      try {
        await result.current.createConversation("Test");
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
      const { result } = renderHook(() => useCreateConversation());

      // Create a slow promise to test loading state persistence
      let resolveCreate: (value: Conversation) => void;
      const slowCreate = new Promise<Conversation>((resolve) => {
        resolveCreate = resolve;
      });
      mockCreate.mockReturnValue(slowCreate);

      // Start creation
      const createPromise = result.current.createConversation("Test");

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true);
      });

      // Reset should not affect loading state
      result.current.reset();
      expect(result.current.isCreating).toBe(true);

      // Complete the creation
      resolveCreate!(mockConversation);
      await createPromise;

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });
  });

  describe("memory cleanup", () => {
    it("should not cause memory leaks on unmount", () => {
      const { unmount } = renderHook(() => useCreateConversation());

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it("should not update state after unmount", async () => {
      let resolveCreate: (value: Conversation) => void;
      const slowCreate = new Promise<Conversation>((resolve) => {
        resolveCreate = resolve;
      });
      mockCreate.mockReturnValue(slowCreate);

      const { unmount } = renderHook(() => useCreateConversation());

      // Unmount immediately
      unmount();

      // Resolve the promise after unmount
      resolveCreate!(mockConversation);

      // Should not cause any errors or warnings
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  describe("function stability", () => {
    it("should maintain stable function references", () => {
      const { result, rerender } = renderHook(() => useCreateConversation());

      const firstCreateConversation = result.current.createConversation;
      const firstReset = result.current.reset;

      rerender();

      expect(result.current.createConversation).toBe(firstCreateConversation);
      expect(result.current.reset).toBe(firstReset);
    });
  });
});
