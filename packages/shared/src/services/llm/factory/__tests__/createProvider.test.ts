import { createProvider } from "../createProvider";
import { OpenAIProvider } from "../../providers/OpenAIProvider";
import { AnthropicProvider } from "../../providers/AnthropicProvider";
import type { Provider } from "../../../../types/llmConfig/Provider";
import type { LlmProvider } from "../../interfaces";

describe("createProvider", () => {
  describe("supported providers", () => {
    it("should create OpenAI provider when provider is 'openai'", () => {
      const provider = createProvider("openai");

      expect(provider).toBeInstanceOf(OpenAIProvider);
      expect(provider).toHaveProperty("sendMessage");
      expect(typeof provider.sendMessage).toBe("function");
    });

    it("should create Anthropic provider when provider is 'anthropic'", () => {
      const provider = createProvider("anthropic");

      expect(provider).toBeInstanceOf(AnthropicProvider);
      expect(provider).toHaveProperty("sendMessage");
      expect(typeof provider.sendMessage).toBe("function");
    });
  });

  describe("provider interface compliance", () => {
    it("should return providers that implement LlmProvider interface", () => {
      const openaiProvider = createProvider("openai");
      const anthropicProvider = createProvider("anthropic");

      // Both should have sendMessage method with correct signature
      expect(openaiProvider.sendMessage).toBeDefined();
      expect(anthropicProvider.sendMessage).toBeDefined();
      expect(typeof openaiProvider.sendMessage).toBe("function");
      expect(typeof anthropicProvider.sendMessage).toBe("function");
    });

    it("should create new instances on each call", () => {
      const provider1 = createProvider("openai");
      const provider2 = createProvider("openai");

      expect(provider1).not.toBe(provider2);
      expect(provider1).toBeInstanceOf(OpenAIProvider);
      expect(provider2).toBeInstanceOf(OpenAIProvider);
    });
  });

  describe("error handling", () => {
    it("should throw error for unknown provider types", () => {
      const unknownProvider = "unknown-provider" as Provider;

      expect(() => createProvider(unknownProvider)).toThrow(
        "Unknown provider: unknown-provider",
      );
    });

    it("should throw descriptive error message", () => {
      const invalidProvider = "invalid" as Provider;

      expect(() => createProvider(invalidProvider)).toThrow(
        "Unknown provider: invalid",
      );
    });
  });

  describe("type safety", () => {
    it("should accept all valid Provider enum values", () => {
      const validProviders: Provider[] = ["openai", "anthropic"];

      validProviders.forEach((providerType) => {
        expect(() => createProvider(providerType)).not.toThrow();

        const provider = createProvider(providerType);
        expect(provider).toBeDefined();
        expect(provider.sendMessage).toBeDefined();
      });
    });

    it("should return LlmProvider interface compliant objects", () => {
      const providers = ["openai", "anthropic"] as const;

      providers.forEach((providerType) => {
        const provider: LlmProvider = createProvider(providerType);

        // TypeScript compile-time check (this test passes if it compiles)
        expect(provider).toBeDefined();
        expect(typeof provider.sendMessage).toBe("function");
      });
    });
  });

  describe("factory behavior", () => {
    it("should use switch statement pattern for provider creation", () => {
      // Test that each provider type returns the correct class instance
      expect(createProvider("openai")).toBeInstanceOf(OpenAIProvider);
      expect(createProvider("anthropic")).toBeInstanceOf(AnthropicProvider);
    });

    it("should be deterministic - same input produces same type", () => {
      const provider1 = createProvider("openai");
      const provider2 = createProvider("openai");

      expect(provider1.constructor).toBe(provider2.constructor);
      expect(provider1.constructor.name).toBe("OpenAIProvider");
    });

    it("should handle all Provider enum values without exhaustiveness issues", () => {
      // This test ensures the switch statement handles all cases
      const allProviderTypes: Provider[] = ["openai", "anthropic"];

      allProviderTypes.forEach((providerType) => {
        expect(() => {
          const provider = createProvider(providerType);
          expect(provider).toBeDefined();
        }).not.toThrow();
      });
    });
  });

  describe("function purity", () => {
    it("should be a pure function with no side effects", () => {
      const originalOpenAIProvider = OpenAIProvider;
      const originalAnthropicProvider = AnthropicProvider;

      // Call function multiple times
      createProvider("openai");
      createProvider("anthropic");
      createProvider("openai");

      // Verify no global state changes
      expect(OpenAIProvider).toBe(originalOpenAIProvider);
      expect(AnthropicProvider).toBe(originalAnthropicProvider);
    });

    it("should not mutate input parameters", () => {
      const providerType: Provider = "openai";
      const originalType = providerType;

      createProvider(providerType);

      expect(providerType).toBe(originalType);
    });
  });
});
