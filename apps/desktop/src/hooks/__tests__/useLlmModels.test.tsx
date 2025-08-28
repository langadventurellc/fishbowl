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
import { useLlmConfig } from "../useLlmConfig";
import type { LlmConfigMetadata, Provider } from "@fishbowl-ai/shared";

// Mock the useServices hook
jest.mock("../../contexts/useServices");
const mockUseServices = useServices as jest.MockedFunction<typeof useServices>;

// Mock the useLlmConfig hook
jest.mock("../useLlmConfig");
const mockUseLlmConfig = useLlmConfig as jest.MockedFunction<
  typeof useLlmConfig
>;

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

// Mock Electron API
const mockElectronAPI = {
  llmModels: {
    load: jest.fn(),
  },
};

// Mock window.electronAPI
Object.defineProperty(window, "electronAPI", {
  value: mockElectronAPI,
  writable: true,
});

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();

  // Setup default mock implementation
  mockUseServices.mockReturnValue(mockServices as any);

  // Default useLlmConfig mock - no configurations loaded
  mockUseLlmConfig.mockReturnValue({
    configurations: [],
    isLoading: false,
    error: null,
    createConfiguration: jest.fn(),
    updateConfiguration: jest.fn(),
    deleteConfiguration: jest.fn(),
    getConfiguration: jest.fn(),
    refreshConfigurations: jest.fn(),
    clearError: jest.fn(),
  });

  // Default Electron API mock - empty models
  mockElectronAPI.llmModels.load.mockResolvedValue({
    providers: [],
  });
});

describe("useLlmModels", () => {
  it("should return empty models array when no configurations exist", async () => {
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

  it("should populate configId and configLabel from configurations", async () => {
    // Setup mock configurations
    const mockConfigurations: LlmConfigMetadata[] = [
      {
        id: "config-1",
        customName: "My OpenAI",
        provider: "openai" as Provider,
        baseUrl: undefined,
        useAuthHeader: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "config-2",
        customName: "",
        provider: "anthropic" as Provider,
        baseUrl: undefined,
        useAuthHeader: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ];

    // Setup mock models
    mockElectronAPI.llmModels.load.mockResolvedValue({
      providers: [
        {
          name: "openai",
          models: [
            {
              id: "gpt-4",
              name: "GPT-4",
              contextLength: 8192,
            },
          ],
        },
        {
          name: "anthropic",
          models: [
            {
              id: "claude-3-sonnet",
              name: "Claude 3 Sonnet",
              contextLength: 200000,
            },
          ],
        },
      ],
    });

    mockUseLlmConfig.mockReturnValue({
      configurations: mockConfigurations,
      isLoading: false,
      error: null,
      createConfiguration: jest.fn(),
      updateConfiguration: jest.fn(),
      deleteConfiguration: jest.fn(),
      getConfiguration: jest.fn(),
      refreshConfigurations: jest.fn(),
      clearError: jest.fn(),
    });

    const { result } = renderHook(() => useLlmModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toHaveLength(2);
    expect(result.current.error).toBeNull();

    // Check first model (OpenAI with custom name)
    expect(result.current.models[0]).toEqual({
      id: "gpt-4",
      name: "GPT-4",
      provider: "openai",
      configId: "config-1",
      configLabel: "My OpenAI",
      contextLength: 8192,
    });

    // Check second model (Anthropic without custom name)
    expect(result.current.models[1]).toEqual({
      id: "claude-3-sonnet",
      name: "Claude 3 Sonnet",
      provider: "anthropic",
      configId: "config-2",
      configLabel: "anthropic",
      contextLength: 200000,
    });
  });

  it("should create separate model entries for multiple configurations of same provider", async () => {
    // Setup multiple OpenAI configurations
    const mockConfigurations: LlmConfigMetadata[] = [
      {
        id: "openai-personal",
        customName: "Personal OpenAI",
        provider: "openai" as Provider,
        baseUrl: undefined,
        useAuthHeader: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "openai-work",
        customName: "Work OpenAI",
        provider: "openai" as Provider,
        baseUrl: undefined,
        useAuthHeader: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ];

    mockElectronAPI.llmModels.load.mockResolvedValue({
      providers: [
        {
          name: "openai",
          models: [
            {
              id: "gpt-4",
              name: "GPT-4",
              contextLength: 8192,
            },
          ],
        },
      ],
    });

    mockUseLlmConfig.mockReturnValue({
      configurations: mockConfigurations,
      isLoading: false,
      error: null,
      createConfiguration: jest.fn(),
      updateConfiguration: jest.fn(),
      deleteConfiguration: jest.fn(),
      getConfiguration: jest.fn(),
      refreshConfigurations: jest.fn(),
      clearError: jest.fn(),
    });

    const { result } = renderHook(() => useLlmModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have two separate model entries with same model but different configs
    expect(result.current.models).toHaveLength(2);
    expect(result.current.error).toBeNull();

    expect(result.current.models[0]).toEqual({
      id: "gpt-4",
      name: "GPT-4",
      provider: "openai",
      configId: "openai-personal",
      configLabel: "Personal OpenAI",
      contextLength: 8192,
    });

    expect(result.current.models[1]).toEqual({
      id: "gpt-4",
      name: "GPT-4",
      provider: "openai",
      configId: "openai-work",
      configLabel: "Work OpenAI",
      contextLength: 8192,
    });
  });

  it("should keep provider as canonical provider name for grouping", async () => {
    const mockConfigurations: LlmConfigMetadata[] = [
      {
        id: "config-1",
        customName: "My Custom OpenAI Name",
        provider: "openai" as Provider,
        baseUrl: undefined,
        useAuthHeader: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ];

    mockElectronAPI.llmModels.load.mockResolvedValue({
      providers: [
        {
          name: "openai",
          models: [
            {
              id: "gpt-4",
              name: "GPT-4",
              contextLength: 8192,
            },
          ],
        },
      ],
    });

    mockUseLlmConfig.mockReturnValue({
      configurations: mockConfigurations,
      isLoading: false,
      error: null,
      createConfiguration: jest.fn(),
      updateConfiguration: jest.fn(),
      deleteConfiguration: jest.fn(),
      getConfiguration: jest.fn(),
      refreshConfigurations: jest.fn(),
      clearError: jest.fn(),
    });

    const { result } = renderHook(() => useLlmModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toHaveLength(1);

    // Provider should remain as canonical "openai", not the custom name
    expect(result.current.models[0]?.provider).toBe("openai");
    // But configLabel should show the custom name
    expect(result.current.models[0]?.configLabel).toBe("My Custom OpenAI Name");
  });

  it("should handle configuration loading errors", async () => {
    mockUseLlmConfig.mockReturnValue({
      configurations: [],
      isLoading: false,
      error: "Failed to load configurations",
      createConfiguration: jest.fn(),
      updateConfiguration: jest.fn(),
      deleteConfiguration: jest.fn(),
      getConfiguration: jest.fn(),
      refreshConfigurations: jest.fn(),
      clearError: jest.fn(),
    });

    const { result } = renderHook(() => useLlmModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toEqual([]);
    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(
      "Failed to load configurations",
    );
  });
});
