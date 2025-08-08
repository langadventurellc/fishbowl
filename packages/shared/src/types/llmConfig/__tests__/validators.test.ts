import {
  validateApiKeyWithError,
  validateLlmConfig,
  validateProviderRequirements,
  validateUniqueConfigName,
} from "../index";
import type { Provider } from "../Provider";

describe("validators", () => {
  describe("validateApiKeyWithError", () => {
    it("returns success for valid OpenAI key", () => {
      const result = validateApiKeyWithError("sk-" + "a".repeat(37), "openai");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("returns success for minimum length OpenAI key", () => {
      const result = validateApiKeyWithError("sk-" + "a".repeat(37), "openai"); // exactly 40 chars
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("returns error for invalid OpenAI key", () => {
      const result = validateApiKeyWithError("invalid", "openai");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('OpenAI API key must start with "sk-"');
    });

    it("returns success for valid Anthropic key", () => {
      const result = validateApiKeyWithError(
        "sk-ant-" + "a".repeat(43),
        "anthropic",
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("returns error for invalid Anthropic key", () => {
      const result = validateApiKeyWithError("sk-wrong", "anthropic");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain(
        'Anthropic API key must start with "sk-ant-"',
      );
    });

    it("returns error for null/undefined API key", () => {
      const result = validateApiKeyWithError(
        null as unknown as string,
        "openai",
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("API key must be a non-empty string");
    });

    it("returns error for non-string API key", () => {
      const result = validateApiKeyWithError(
        123 as unknown as string,
        "openai",
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("API key must be a non-empty string");
    });
  });

  describe("validateUniqueConfigName", () => {
    const existingNames = ["Config 1", "Config 2", "Test Config"];

    it("accepts unique name", () => {
      const result = validateUniqueConfigName("New Config", existingNames);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("rejects duplicate name (exact match)", () => {
      const result = validateUniqueConfigName("Config 1", existingNames);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Configuration name already exists");
    });

    it("rejects duplicate name (case-insensitive)", () => {
      const result = validateUniqueConfigName("CONFIG 1", existingNames);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Configuration name already exists");
    });

    it("rejects duplicate name (with extra spaces)", () => {
      const result = validateUniqueConfigName("  Config 1  ", existingNames);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Configuration name already exists");
    });

    it("allows keeping same name when updating", () => {
      const result = validateUniqueConfigName(
        "Config 1",
        existingNames,
        "id-1",
        "Config 1",
      );
      expect(result.isValid).toBe(true);
    });

    it("rejects empty name", () => {
      const result = validateUniqueConfigName("", existingNames);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Configuration name must be a non-empty string",
      );
    });

    it("rejects null/undefined name", () => {
      const result = validateUniqueConfigName(
        null as unknown as string,
        existingNames,
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Configuration name must be a non-empty string",
      );
    });

    it("handles empty existing names array", () => {
      const result = validateUniqueConfigName("Any Name", []);
      expect(result.isValid).toBe(true);
    });

    it("handles undefined existing names array", () => {
      const result = validateUniqueConfigName("Any Name");
      expect(result.isValid).toBe(true);
    });

    it("handles mixed case duplicates", () => {
      const result = validateUniqueConfigName("test config", existingNames);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Configuration name already exists");
    });

    it("trims whitespace properly", () => {
      const result = validateUniqueConfigName("   ", existingNames);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Configuration name must be a non-empty string",
      );
    });
  });

  describe("validateProviderRequirements", () => {
    it("accepts OpenAI without baseUrl", () => {
      const result = validateProviderRequirements("openai", {});
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("accepts OpenAI with valid baseUrl", () => {
      const result = validateProviderRequirements("openai", {
        baseUrl: "https://custom.openai.com",
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("rejects OpenAI with invalid baseUrl", () => {
      const result = validateProviderRequirements("openai", {
        baseUrl: "invalid-url",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Base URL must be a valid URL when provided",
      );
    });

    it("accepts Anthropic without baseUrl", () => {
      const result = validateProviderRequirements("anthropic", {});
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("handles unknown provider", () => {
      const result = validateProviderRequirements("unknown" as Provider, {});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Unknown provider: unknown");
    });

    it("accepts standard provider with valid custom baseUrl", () => {
      const result = validateProviderRequirements("anthropic", {
        baseUrl: "https://custom.anthropic.com/api",
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
  });

  describe("validateLlmConfig", () => {
    const validConfig = {
      customName: "My Config",
      provider: "openai" as Provider,
      apiKey: "sk-" + "a".repeat(37),
      baseUrl: "https://api.openai.com",
    };

    const existingConfigs = [
      { id: "1", customName: "Existing Config" },
      { id: "2", customName: "Another Config" },
    ];

    it("validates complete valid configuration", () => {
      const result = validateLlmConfig(validConfig, existingConfigs);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("collects multiple validation errors", () => {
      const invalidConfig = {
        customName: "Existing Config", // Duplicate
        provider: "openai" as Provider,
        apiKey: "invalid", // Invalid format
        baseUrl: "https://api.openai.com",
      };

      const result = validateLlmConfig(invalidConfig, existingConfigs);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2); // API key and name errors
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("OpenAI API key must"),
          expect.stringContaining("Configuration name already exists"),
        ]),
      );
    });

    it("skips name uniqueness check for updates", () => {
      const updateConfig = {
        customName: "Existing Config",
        provider: "openai" as Provider,
        apiKey: "sk-" + "a".repeat(37),
      };

      const result = validateLlmConfig(updateConfig, existingConfigs, true);
      expect(result.isValid).toBe(true);
    });

    it("handles empty existing configs", () => {
      const result = validateLlmConfig(validConfig, []);
      expect(result.isValid).toBe(true);
    });

    it("handles undefined existing configs gracefully", () => {
      const result = validateLlmConfig(
        validConfig,
        undefined as unknown as Array<{ id: string; customName: string }>,
      );
      expect(result.isValid).toBe(true);
    });

    it("validates Anthropic API key correctly", () => {
      const anthropicConfig = {
        customName: "Anthropic Config",
        provider: "anthropic" as Provider,
        apiKey: "sk-ant-" + "a".repeat(43), // Valid Anthropic key
      };

      const result = validateLlmConfig(anthropicConfig, []);
      expect(result.isValid).toBe(true);
    });
  });
});
