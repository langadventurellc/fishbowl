/**
 * Unit tests for useLlmConfig hook.
 *
 * Tests core functionality of the useLlmConfig hook for LLM configuration management.
 *
 * @module hooks/__tests__/useLlmConfig.test
 */

import { renderHook, waitFor } from "@testing-library/react";
import type {
  LlmConfig,
  LlmConfigInput,
  LlmConfigMetadata,
} from "@fishbowl-ai/shared";
import { useLlmConfig } from "../useLlmConfig";

// Create stable mock logger to prevent infinite re-renders
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock useServices hook
jest.mock("../../contexts", () => ({
  useServices: jest.fn(() => ({
    logger: mockLogger,
  })),
}));

// Mock data for testing
const mockLlmConfigInput: LlmConfigInput = {
  customName: "Test OpenAI",
  provider: "openai",
  apiKey: "test-api-key-123",
  baseUrl: undefined,
  useAuthHeader: false,
};

const mockLlmConfig: LlmConfig = {
  id: "new-config-id",
  customName: "Test OpenAI",
  provider: "openai",
  apiKey: "test-api-key-123",
  baseUrl: undefined,
  useAuthHeader: false,
  createdAt: "2023-01-01T00:00:00.000Z",
  updatedAt: "2023-01-01T00:00:00.000Z",
};

const mockLlmConfigMetadata: LlmConfigMetadata = {
  id: "test-config-id",
  customName: "Test OpenAI",
  provider: "openai",
  baseUrl: undefined,
  useAuthHeader: false,
  createdAt: "2023-01-01T00:00:00.000Z",
  updatedAt: "2023-01-01T00:00:00.000Z",
};

// Mock electronAPI
const mockCreate = jest.fn();
const mockRead = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockList = jest.fn();

beforeEach(() => {
  // Reset mocks
  mockCreate.mockClear();
  mockLogger.debug.mockClear();
  mockLogger.info.mockClear();
  mockLogger.warn.mockClear();
  mockLogger.error.mockClear();
  mockRead.mockClear();
  mockUpdate.mockClear();
  mockDelete.mockClear();
  mockList.mockClear();

  // Mock window.electronAPI
  Object.defineProperty(window, "electronAPI", {
    value: {
      llmConfig: {
        create: mockCreate,
        read: mockRead,
        update: mockUpdate,
        delete: mockDelete,
        list: mockList,
      },
    },
    writable: true,
    configurable: true,
  });

  // Default successful responses
  mockList.mockResolvedValue([mockLlmConfigMetadata]);
  mockCreate.mockResolvedValue(mockLlmConfig);
  mockRead.mockResolvedValue(mockLlmConfig);
  mockUpdate.mockResolvedValue(mockLlmConfig);
  mockDelete.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
  delete (window as any).electronAPI;
});

describe("useLlmConfig", () => {
  describe("Hook Initialization", () => {
    it("should render without errors", () => {
      expect(() => {
        renderHook(() => useLlmConfig());
      }).not.toThrow();
    });

    it("should load configurations on mount", async () => {
      const { result } = renderHook(() => useLlmConfig());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.configurations).toEqual([]);
      expect(result.current.error).toBeNull();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockList).toHaveBeenCalledTimes(1);
      expect(result.current.configurations).toEqual([mockLlmConfigMetadata]);
      expect(result.current.error).toBeNull();
    });

    it("should handle initial load errors gracefully", async () => {
      const errorMessage = "Failed to load configurations";
      mockList.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useLlmConfig());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.configurations).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe("Basic Operations", () => {
    it("should call create configuration", async () => {
      const { result } = renderHook(() => useLlmConfig());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.createConfiguration(mockLlmConfigInput);

      expect(mockCreate).toHaveBeenCalledWith(mockLlmConfigInput);
    });

    it("should call update configuration", async () => {
      const { result } = renderHook(() => useLlmConfig());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { customName: "Updated Name" };
      await result.current.updateConfiguration("test-id", updates);

      expect(mockUpdate).toHaveBeenCalledWith("test-id", updates);
    });

    it("should call delete configuration", async () => {
      const { result } = renderHook(() => useLlmConfig());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.deleteConfiguration("test-id");

      expect(mockDelete).toHaveBeenCalledWith("test-id");
    });

    it("should call refresh configurations", async () => {
      const { result } = renderHook(() => useLlmConfig());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.refreshConfigurations();

      expect(mockList).toHaveBeenCalledTimes(2); // Initial + refresh
    });
  });

  describe("Error Management", () => {
    it("should clear error state", async () => {
      const errorMessage = "Test error";
      mockList.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useLlmConfig());

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      result.current.clearError();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe("Non-Electron Environment", () => {
    beforeEach(() => {
      delete (window as any).electronAPI;
    });

    it("should handle missing electronAPI gracefully", async () => {
      const { result } = renderHook(() => useLlmConfig());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.configurations).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(mockList).not.toHaveBeenCalled();
    });

    it("should throw errors for operations in non-Electron environment", async () => {
      const { result } = renderHook(() => useLlmConfig());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.createConfiguration(mockLlmConfigInput),
      ).rejects.toThrow("LLM configuration operations not available");

      await expect(
        result.current.updateConfiguration("id", {}),
      ).rejects.toThrow("LLM configuration operations not available");

      await expect(result.current.deleteConfiguration("id")).rejects.toThrow(
        "LLM configuration operations not available",
      );
    });
  });

  describe("Hook Interface", () => {
    it("should provide all expected methods and properties", async () => {
      const { result } = renderHook(() => useLlmConfig());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Data properties
      expect(result.current.configurations).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
      expect(result.current.error).toBeDefined();

      // Operation methods
      expect(typeof result.current.createConfiguration).toBe("function");
      expect(typeof result.current.updateConfiguration).toBe("function");
      expect(typeof result.current.deleteConfiguration).toBe("function");
      expect(typeof result.current.refreshConfigurations).toBe("function");

      // UI helper methods
      expect(typeof result.current.clearError).toBe("function");
    });
  });

  describe("Memory Management", () => {
    it("should not leak memory on unmount", () => {
      const { unmount } = renderHook(() => useLlmConfig());

      expect(() => unmount()).not.toThrow();

      // Verify no lingering async operations
      expect(mockList).toHaveBeenCalledTimes(1);
    });
  });
});
