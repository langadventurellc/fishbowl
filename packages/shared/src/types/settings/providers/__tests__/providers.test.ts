import {
  PROVIDERS,
  getProviderConfig,
  getAllProviders,
  validateProviderData,
  createInitialProviderState,
  isValidProvider,
  createProviderFormSchema,
} from "../index";

describe("Provider Configuration System", () => {
  describe("PROVIDERS constant", () => {
    it("should contain OpenAI and Anthropic providers", () => {
      expect(PROVIDERS.openai).toBeDefined();
      expect(PROVIDERS.anthropic).toBeDefined();
      expect(Object.keys(PROVIDERS)).toHaveLength(2);
    });

    it("should have valid OpenAI configuration", () => {
      const openai = PROVIDERS.openai!;
      expect(openai.id).toBe("openai");
      expect(openai.name).toBe("OpenAI");
      expect(openai.defaultBaseUrl).toBe("https://api.openai.com/v1");
      expect(openai.apiKeyValidation.minLength).toBe(20);
      expect(openai.apiKeyValidation.pattern).toBeInstanceOf(RegExp);
      expect(openai.apiKeyValidation.placeholder).toContain("OpenAI");
    });

    it("should have valid Anthropic configuration", () => {
      const anthropic = PROVIDERS.anthropic!;
      expect(anthropic.id).toBe("anthropic");
      expect(anthropic.name).toBe("Anthropic");
      expect(anthropic.defaultBaseUrl).toBe("https://api.anthropic.com/v1");
      expect(anthropic.apiKeyValidation.minLength).toBe(20);
      expect(anthropic.apiKeyValidation.pattern).toBeInstanceOf(RegExp);
      expect(anthropic.apiKeyValidation.placeholder).toContain("Anthropic");
    });
  });

  describe("getProviderConfig", () => {
    it("should return provider config for valid ID", () => {
      const config = getProviderConfig("openai");
      expect(config).toBe(PROVIDERS.openai);
    });

    it("should return undefined for invalid ID", () => {
      const config = getProviderConfig("invalid");
      expect(config).toBeUndefined();
    });
  });

  describe("getAllProviders", () => {
    it("should return all provider configurations", () => {
      const providers = getAllProviders();
      expect(providers).toHaveLength(2);
      expect(providers).toContain(PROVIDERS.openai);
      expect(providers).toContain(PROVIDERS.anthropic);
    });
  });

  describe("isValidProvider", () => {
    it("should return true for valid provider IDs", () => {
      expect(isValidProvider("openai")).toBe(true);
      expect(isValidProvider("anthropic")).toBe(true);
    });

    it("should return false for invalid provider IDs", () => {
      expect(isValidProvider("invalid")).toBe(false);
      expect(isValidProvider("")).toBe(false);
    });
  });

  describe("createInitialProviderState", () => {
    it("should create valid initial state for OpenAI", () => {
      const state = createInitialProviderState("openai");
      expect(state).toEqual({
        apiKey: "",
        baseUrl: "https://api.openai.com/v1",
        providerId: "openai",
        status: "untested",
        showApiKey: false,
        showAdvanced: false,
      });
    });

    it("should throw error for invalid provider ID", () => {
      expect(() => createInitialProviderState("invalid")).toThrow(
        "Unknown provider: invalid",
      );
    });
  });
});

describe("Validation Schemas", () => {
  describe("OpenAI validation", () => {
    const schema = createProviderFormSchema(PROVIDERS.openai!);

    it("should validate correct OpenAI data", () => {
      const validData = {
        apiKey: "sk-1234567890123456789012345678901234567890",
        baseUrl: "https://api.openai.com/v1",
        providerId: "openai" as const,
      };

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid API key format", () => {
      const invalidData = {
        apiKey: "invalid-key",
        baseUrl: "https://api.openai.com/v1",
        providerId: "openai" as const,
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues.find((issue) =>
          issue.message.includes("Invalid OpenAI API key format"),
        );
        expect(errorMessage).toBeDefined();
      }
    });

    it("should reject non-HTTPS URLs", () => {
      const invalidData = {
        apiKey: "sk-1234567890123456789012345678901234567890",
        baseUrl: "http://api.openai.com/v1",
        providerId: "openai" as const,
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues.find((issue) =>
          issue.message.includes("HTTPS"),
        );
        expect(errorMessage).toBeDefined();
      }
    });

    it("should reject short API keys", () => {
      const invalidData = {
        apiKey: "sk-short",
        baseUrl: "https://api.openai.com/v1",
        providerId: "openai" as const,
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues.find((issue) =>
          issue.message.includes("at least 20 characters"),
        );
        expect(errorMessage).toBeDefined();
      }
    });

    it("should reject empty API key", () => {
      const invalidData = {
        apiKey: "",
        baseUrl: "https://api.openai.com/v1",
        providerId: "openai" as const,
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues.find((issue) =>
          issue.message.includes("API key is required"),
        );
        expect(errorMessage).toBeDefined();
      }
    });

    it("should reject whitespace-only API key", () => {
      const invalidData = {
        apiKey: "   ",
        baseUrl: "https://api.openai.com/v1",
        providerId: "openai" as const,
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues.find((issue) =>
          issue.message.includes("API key cannot be empty"),
        );
        expect(errorMessage).toBeDefined();
      }
    });

    it("should reject invalid URL format", () => {
      const invalidData = {
        apiKey: "sk-1234567890123456789012345678901234567890",
        baseUrl: "not-a-url",
        providerId: "openai" as const,
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues.find((issue) =>
          issue.message.includes("Must be a valid URL"),
        );
        expect(errorMessage).toBeDefined();
      }
    });
  });

  describe("Anthropic validation", () => {
    const schema = createProviderFormSchema(PROVIDERS.anthropic!);

    it("should validate correct Anthropic data", () => {
      const validData = {
        apiKey: "sk-ant-api03-1234567890123456789012345678901234567890",
        baseUrl: "https://api.anthropic.com/v1",
        providerId: "anthropic" as const,
      };

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid Anthropic API key format", () => {
      const invalidData = {
        apiKey: "sk-1234567890123456789012345678901234567890", // OpenAI format
        baseUrl: "https://api.anthropic.com/v1",
        providerId: "anthropic" as const,
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues.find((issue) =>
          issue.message.includes("Invalid Anthropic API key format"),
        );
        expect(errorMessage).toBeDefined();
      }
    });
  });
});

describe("validateProviderData utility", () => {
  it("should return success for valid data", () => {
    const result = validateProviderData("openai", {
      apiKey: "sk-1234567890123456789012345678901234567890",
      baseUrl: "https://api.openai.com/v1",
      providerId: "openai",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.providerId).toBe("openai");
    }
  });

  it("should return error for invalid data", () => {
    const result = validateProviderData("openai", {
      apiKey: "invalid",
      baseUrl: "http://invalid.com",
      providerId: "openai",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it("should throw error for unknown provider", () => {
    expect(() =>
      validateProviderData("unknown", {
        apiKey: "test",
        baseUrl: "https://test.com",
        providerId: "unknown",
      }),
    ).toThrow("Unknown provider: unknown");
  });

  it("should handle partial data validation", () => {
    const result = validateProviderData("openai", {
      apiKey: "sk-1234567890123456789012345678901234567890",
      // Missing baseUrl and providerId
    });

    expect(result.success).toBe(false);
  });
});
