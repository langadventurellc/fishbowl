/**
 * Unit tests for useLlmModels hook.
 *
 * Tests core functionality of the useLlmModels hook for loading available models.
 *
 * @module hooks/__tests__/useLlmModels.test
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useLlmModels } from "../useLlmModels";
import { useServices } from "../../contexts/useServices";

// Mock the useServices hook
jest.mock("../../contexts/useServices");
const mockUseServices = useServices as jest.MockedFunction<typeof useServices>;

// Mock services
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

const mockServices = {
  logger: mockLogger,
};

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();

  // Setup default mock implementation
  mockUseServices.mockReturnValue(mockServices as any);
});

describe("useLlmModels", () => {
  it("should return empty models array initially", async () => {
    const { result } = renderHook(() => useLlmModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should provide refresh functionality", () => {
    const { result } = renderHook(() => useLlmModels());

    expect(typeof result.current.refresh).toBe("function");

    // Should not throw when called
    expect(() => result.current.refresh()).not.toThrow();
  });

  it("should complete loading quickly with empty results", async () => {
    const { result } = renderHook(() => useLlmModels());

    // Wait for loading to complete (should be very fast with current implementation)
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should handle services being available", async () => {
    const { result } = renderHook(() => useLlmModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should not have any errors since services are properly mocked
    expect(result.current.error).toBeNull();
    expect(result.current.models).toEqual([]);
  });
});
