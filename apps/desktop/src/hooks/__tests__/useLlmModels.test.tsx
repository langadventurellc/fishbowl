/**
 * Unit tests for useLlmModels hook.
 *
 * Tests core functionality of the useLlmModels hook for loading and processing model options.
 *
 * @module hooks/__tests__/useLlmModels.test
 */

import { renderHook, waitFor } from "@testing-library/react";
import type { LlmConfigMetadata } from "@fishbowl-ai/shared";
import { useLlmModels } from "../useLlmModels";

// Mock data for testing
const mockLlmConfigs: LlmConfigMetadata[] = [
  {
    id: "openai-config-1",
    customName: "My OpenAI",
    provider: "openai",
    useAuthHeader: true,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  },
  {
    id: "anthropic-config-1",
    customName: "My Anthropic",
    provider: "anthropic",
    baseUrl: "https://api.anthropic.com",
    useAuthHeader: true,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  },
];

// Mock electronAPI
const mockList = jest.fn();

beforeEach(() => {
  // Reset mocks
  mockList.mockClear();

  // Mock window.electronAPI
  Object.defineProperty(window, "electronAPI", {
    value: {
      llmConfig: {
        list: mockList,
      },
    },
    writable: true,
    configurable: true,
  });

  // Default successful response
  mockList.mockResolvedValue(mockLlmConfigs);
});

afterEach(() => {
  // Clean up global mocks
  delete (window as any).electronAPI;
});

describe("useLlmModels", () => {
  it("should load models from LLM configurations", async () => {
    const { result } = renderHook(() => useLlmModels());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.models).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that models were properly created
    expect(result.current.models.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();

    // Verify models contain expected properties
    const firstModel = result.current.models[0];
    expect(firstModel).toHaveProperty("id");
    expect(firstModel).toHaveProperty("name");
    expect(firstModel).toHaveProperty("provider");
    expect(firstModel).toHaveProperty("providerName");
    expect(firstModel).toHaveProperty("configId");

    // Check that models from both providers are included
    const providers = [
      ...new Set(result.current.models.map((m) => m.provider)),
    ];
    expect(providers).toContain("openai");
    expect(providers).toContain("anthropic");
  });

  it("should create proper model IDs", async () => {
    const { result } = renderHook(() => useLlmModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that model IDs follow the expected format: configId:modelId
    const model = result.current.models.find((m) => m.provider === "openai");
    expect(model?.id).toMatch(/^openai-config-1:.+/);
    expect(model?.configId).toBe("openai-config-1");
  });

  it("should include correct provider display names", async () => {
    const { result } = renderHook(() => useLlmModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const openaiModel = result.current.models.find(
      (m) => m.provider === "openai",
    );
    const anthropicModel = result.current.models.find(
      (m) => m.provider === "anthropic",
    );

    expect(openaiModel?.providerName).toBe("OpenAI");
    expect(anthropicModel?.providerName).toBe("Anthropic");
  });

  it("should handle empty configuration list", async () => {
    mockList.mockResolvedValue([]);

    const { result } = renderHook(() => useLlmModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should handle API errors", async () => {
    const errorMessage = "Failed to load configurations";
    mockList.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useLlmModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toEqual([]);
    expect(result.current.error?.message).toBe(errorMessage);
  });

  it("should handle missing electronAPI gracefully", async () => {
    // Remove electronAPI to simulate non-Electron environment
    delete (window as any).electronAPI;

    const { result } = renderHook(() => useLlmModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should include expected OpenAI models", async () => {
    const { result } = renderHook(() => useLlmModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const openaiModels = result.current.models.filter(
      (m) => m.provider === "openai",
    );
    const modelNames = openaiModels.map((m) => m.name);

    expect(modelNames).toContain("GPT-4o");
    expect(modelNames).toContain("GPT-4");
    expect(modelNames).toContain("GPT-3.5 Turbo");
  });

  it("should include expected Anthropic models", async () => {
    const { result } = renderHook(() => useLlmModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const anthropicModels = result.current.models.filter(
      (m) => m.provider === "anthropic",
    );
    const modelNames = anthropicModels.map((m) => m.name);

    expect(modelNames).toContain("Claude 3.5 Sonnet");
    expect(modelNames).toContain("Claude 3 Opus");
    expect(modelNames).toContain("Claude 3 Haiku");
  });
});
