import { ResilienceLayer } from "../ResilienceLayer";
import type { LlmProviderDefinition } from "../../../../types/llm-providers/LlmProviderDefinition";

interface TestSystemError extends Error {
  code: string;
}

describe("ResilienceLayer", () => {
  let resilienceLayer: ResilienceLayer;

  const mockProviders: LlmProviderDefinition[] = [
    {
      id: "openai",
      name: "OpenAI",
      models: {
        "gpt-4": "GPT-4",
      },
      configuration: {
        fields: [
          {
            id: "apiKey",
            type: "secure-text",
            label: "API Key",
            required: true,
          },
        ],
      },
    },
  ];

  beforeEach(() => {
    resilienceLayer = new ResilienceLayer({
      retry: {
        maxAttempts: 2,
        baseDelayMs: 10,
      },
      circuitBreaker: {
        failureThreshold: 2,
        recoveryTimeoutMs: 100,
      },
      fallback: {
        maxAge: 1000,
        maxEntries: 5,
      },
    });
  });

  describe("successful operations", () => {
    it("should execute successful load operations", async () => {
      const mockOperation = jest.fn().mockResolvedValue(mockProviders);

      const result = await resilienceLayer.loadWithResilience(
        "/path/to/config.json",
        mockOperation,
      );

      expect(result).toEqual(mockProviders);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it("should store successful results as fallback", async () => {
      const mockOperation = jest.fn().mockResolvedValue(mockProviders);

      await resilienceLayer.loadWithResilience(
        "/path/to/config.json",
        mockOperation,
      );

      // Subsequent failure should use fallback (non-retryable error)
      const failingOperation = jest
        .fn()
        .mockRejectedValue(new Error("Load failed"));

      const result = await resilienceLayer.loadWithResilience(
        "/path/to/config.json",
        failingOperation,
      );

      expect(result).toEqual(mockProviders);
      expect(failingOperation).toHaveBeenCalledTimes(1); // Not retried (no error code)
    });
  });

  describe("retry integration", () => {
    it("should retry retryable errors through the layer", async () => {
      const error: TestSystemError = new Error(
        "File not found",
      ) as TestSystemError;
      error.code = "ENOENT";

      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue(mockProviders);

      const result = await resilienceLayer.loadWithResilience(
        "/path/to/config.json",
        mockOperation,
      );

      expect(result).toEqual(mockProviders);
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it("should not retry non-retryable errors", async () => {
      const syntaxError = new SyntaxError("Invalid JSON");
      const mockOperation = jest.fn().mockRejectedValue(syntaxError);

      await expect(
        resilienceLayer.loadWithResilience(
          "/path/to/config.json",
          mockOperation,
        ),
      ).rejects.toThrow("Invalid JSON");

      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe("fallback activation", () => {
    it("should use fallback when all retries fail", async () => {
      // First, establish fallback data
      const mockOperation = jest.fn().mockResolvedValue(mockProviders);
      await resilienceLayer.loadWithResilience(
        "/path/to/config.json",
        mockOperation,
      );

      // Then fail consistently
      const error: TestSystemError = new Error(
        "Persistent error",
      ) as TestSystemError;
      error.code = "EBUSY";

      const failingOperation = jest.fn().mockRejectedValue(error);

      const result = await resilienceLayer.loadWithResilience(
        "/path/to/config.json",
        failingOperation,
      );

      expect(result).toEqual(mockProviders);
      expect(failingOperation).toHaveBeenCalledTimes(2); // Max attempts

      const metrics = resilienceLayer.getMetrics();
      expect(metrics.fallbackActivations).toBe(1);
    });

    it("should fail if no fallback is available", async () => {
      const error = new Error("Load failed");
      const mockOperation = jest.fn().mockRejectedValue(error);

      await expect(
        resilienceLayer.loadWithResilience(
          "/path/to/config.json",
          mockOperation,
        ),
      ).rejects.toThrow("Load failed");

      expect(mockOperation).toHaveBeenCalledTimes(1); // Not retried (no error code)
    });
  });

  describe("metrics collection", () => {
    it("should track operation duration", async () => {
      const mockOperation = jest.fn().mockResolvedValue(mockProviders);

      await resilienceLayer.loadWithResilience(
        "/path/to/config.json",
        mockOperation,
      );

      const metrics = resilienceLayer.getMetrics();
      expect(metrics.operationDuration).toBeGreaterThanOrEqual(0);
    });

    it("should track fallback activations", async () => {
      // Establish fallback
      await resilienceLayer.loadWithResilience("/path/to/config.json", () =>
        Promise.resolve(mockProviders),
      );

      // Use fallback
      await resilienceLayer.loadWithResilience("/path/to/config.json", () =>
        Promise.reject(new Error("Failed")),
      );

      const metrics = resilienceLayer.getMetrics();
      expect(metrics.fallbackActivations).toBe(1);
    });

    it("should reset metrics", () => {
      const metrics = resilienceLayer.getMetrics();
      metrics.fallbackActivations = 5; // Simulate some activity

      resilienceLayer.resetMetrics();

      const resetMetrics = resilienceLayer.getMetrics();
      expect(resetMetrics.fallbackActivations).toBe(0);
      expect(resetMetrics.operationDuration).toBe(0);
    });
  });
});
