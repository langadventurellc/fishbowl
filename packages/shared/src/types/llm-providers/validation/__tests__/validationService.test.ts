import { LlmProviderConfigurationValidator } from "../validationService";
import { LlmValidationErrorCode } from "../LlmValidationErrorCode";
import type { LlmProviderDefinition } from "../../LlmProviderDefinition";
import type { LlmConfigurationValues } from "../../LlmConfigurationValues";

describe("LlmProviderConfigurationValidator", () => {
  describe("validateFile", () => {
    it("should validate a complete valid file", () => {
      const validFile = {
        version: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: { "gpt-4": "GPT-4" },
            configuration: { fields: [] },
          },
        ],
      };

      const result = LlmProviderConfigurationValidator.validateFile(validFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject file with missing version", () => {
      const invalidFile = {
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: { "gpt-4": "GPT-4" },
            configuration: { fields: [] },
          },
        ],
      };

      const result =
        LlmProviderConfigurationValidator.validateFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.fieldId === "version")).toBe(true);
    });

    it("should reject file with invalid version format", () => {
      const invalidFile = {
        version: "1.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: { "gpt-4": "GPT-4" },
            configuration: { fields: [] },
          },
        ],
      };

      const result =
        LlmProviderConfigurationValidator.validateFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.fieldId === "version")).toBe(true);
    });

    it("should reject file with empty providers array", () => {
      const invalidFile = {
        version: "1.0.0",
        providers: [],
      };

      const result =
        LlmProviderConfigurationValidator.validateFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.fieldId === "providers")).toBe(true);
    });

    it("should reject file with duplicate provider IDs", () => {
      const invalidFile = {
        version: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: { "gpt-4": "GPT-4" },
            configuration: { fields: [] },
          },
          {
            id: "openai", // duplicate ID
            name: "OpenAI Alternative",
            models: { "gpt-3.5": "GPT-3.5" },
            configuration: { fields: [] },
          },
        ],
      };

      const result =
        LlmProviderConfigurationValidator.validateFile(invalidFile);
      expect(result.valid).toBe(false);
    });
  });

  describe("validateFileWithDetails", () => {
    it("should return detailed provider validation for valid file", () => {
      const validFile = {
        version: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: { "gpt-4": "GPT-4" },
            configuration: { fields: [] },
          },
          {
            id: "anthropic",
            name: "Anthropic",
            models: { "claude-3": "Claude 3" },
            configuration: { fields: [] },
          },
        ],
      };

      const result =
        LlmProviderConfigurationValidator.validateFileWithDetails(validFile);
      expect(result.result.valid).toBe(true);
      expect(result.providers).toHaveLength(2);

      if (result.providers && result.providers.length >= 2) {
        expect(result.providers[0]).toEqual({
          id: "openai",
          valid: true,
          errors: [],
        });
        expect(result.providers[1]).toEqual({
          id: "anthropic",
          valid: true,
          errors: [],
        });
      }
    });

    it("should return detailed provider validation for file with invalid providers", () => {
      const invalidFile = {
        version: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: { "gpt-4": "GPT-4" },
            configuration: { fields: [] },
          },
          {
            id: "", // invalid empty ID
            name: "Bad Provider",
            models: { "model-1": "Model 1" },
            configuration: { fields: [] },
          },
        ],
      };

      const result =
        LlmProviderConfigurationValidator.validateFileWithDetails(invalidFile);
      expect(result.result.valid).toBe(false);
      expect(result.providers).toBeDefined();
      expect(result.providers).toHaveLength(2);

      if (result.providers && result.providers.length >= 2) {
        const firstProvider = result.providers[0];
        const secondProvider = result.providers[1];

        expect(firstProvider?.valid).toBe(true);
        expect(secondProvider?.valid).toBe(false);
        expect(secondProvider?.errors.length).toBeGreaterThan(0);
      }
    });

    it("should not return providers array for invalid file structure", () => {
      const invalidFile = {
        version: "invalid",
        providers: "not an array",
      };

      const result =
        LlmProviderConfigurationValidator.validateFileWithDetails(invalidFile);
      expect(result.result.valid).toBe(false);
      expect(result.providers).toBeUndefined();
    });
  });

  describe("validateProvider", () => {
    it("should validate a complete valid provider", () => {
      const validProvider = {
        id: "openai",
        name: "OpenAI",
        models: { "gpt-4": "GPT-4" },
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
      };

      const result =
        LlmProviderConfigurationValidator.validateProvider(validProvider);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject provider with missing required fields", () => {
      const invalidProvider = {
        name: "OpenAI",
        models: { "gpt-4": "GPT-4" },
      };

      const result =
        LlmProviderConfigurationValidator.validateProvider(invalidProvider);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject provider with invalid field configuration", () => {
      const invalidProvider = {
        id: "openai",
        name: "OpenAI",
        models: { "gpt-4": "GPT-4" },
        configuration: {
          fields: [
            {
              id: "", // empty field ID
              type: "secure-text",
              label: "API Key",
              required: true,
            },
          ],
        },
      };

      const result =
        LlmProviderConfigurationValidator.validateProvider(invalidProvider);
      expect(result.valid).toBe(false);
    });
  });

  describe("validateProviderWithRules", () => {
    it("should pass validation for valid provider with business rules", () => {
      const validProvider: LlmProviderDefinition = {
        id: "openai",
        name: "OpenAI",
        models: { "gpt-4": "GPT-4" },
        configuration: {
          fields: [
            {
              id: "apiKey",
              type: "secure-text",
              label: "API Key",
              required: true,
            },
            {
              id: "baseUrl",
              type: "text",
              label: "Base URL",
              required: false,
            },
          ],
        },
      };

      const result =
        LlmProviderConfigurationValidator.validateProviderWithRules(
          validProvider,
        );
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should fail validation for provider with no models", () => {
      const invalidProvider: LlmProviderDefinition = {
        id: "openai",
        name: "OpenAI",
        models: {}, // empty models object
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
      };

      const result =
        LlmProviderConfigurationValidator.validateProviderWithRules(
          invalidProvider,
        );
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(
          (e) =>
            e.fieldId === "models" &&
            e.code === LlmValidationErrorCode.INVALID_CONFIGURATION,
        ),
      ).toBe(true);
    });

    it("should fail validation for provider with duplicate field IDs", () => {
      const invalidProvider: LlmProviderDefinition = {
        id: "openai",
        name: "OpenAI",
        models: { "gpt-4": "GPT-4" },
        configuration: {
          fields: [
            {
              id: "apiKey",
              type: "secure-text",
              label: "API Key",
              required: true,
            },
            {
              id: "apiKey", // duplicate field ID
              type: "text",
              label: "API Key Alt",
              required: false,
            },
          ],
        },
      };

      const result =
        LlmProviderConfigurationValidator.validateProviderWithRules(
          invalidProvider,
        );
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(
        result.errors.some(
          (e) =>
            e.code === LlmValidationErrorCode.INVALID_CONFIGURATION &&
            e.message.includes("Field IDs must be unique"),
        ),
      ).toBe(true);
    });
  });

  describe("validateValues", () => {
    const mockProvider: LlmProviderDefinition = {
      id: "openai",
      name: "OpenAI",
      models: { "gpt-4": "GPT-4" },
      configuration: {
        fields: [
          {
            id: "apiKey",
            type: "secure-text",
            label: "API Key",
            required: true,
          },
          {
            id: "baseUrl",
            type: "text",
            label: "Base URL",
            required: false,
          },
          {
            id: "useAuth",
            type: "checkbox",
            label: "Use Authentication",
            required: false,
          },
        ],
      },
    };

    it("should validate complete valid configuration values", () => {
      const validValues: LlmConfigurationValues = {
        apiKey: "sk-1234567890abcdef",
        baseUrl: "https://api.openai.com/v1",
        useAuth: true,
      };

      const result = LlmProviderConfigurationValidator.validateValues(
        validValues,
        mockProvider,
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject values missing required fields", () => {
      const invalidValues: LlmConfigurationValues = {
        baseUrl: "https://api.openai.com/v1",
        // missing required apiKey
      };

      const result = LlmProviderConfigurationValidator.validateValues(
        invalidValues,
        mockProvider,
      );
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(
          (e) =>
            e.fieldId === "apiKey" &&
            e.code === LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
        ),
      ).toBe(true);
    });

    it("should reject values with wrong types", () => {
      const invalidValues: LlmConfigurationValues = {
        apiKey: "sk-1234567890abcdef",
        baseUrl: 123, // should be string
        useAuth: "yes", // should be boolean
      };

      const result = LlmProviderConfigurationValidator.validateValues(
        invalidValues,
        mockProvider,
      );
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("validatePartialValues", () => {
    const mockProvider: LlmProviderDefinition = {
      id: "openai",
      name: "OpenAI",
      models: { "gpt-4": "GPT-4" },
      configuration: {
        fields: [
          {
            id: "apiKey",
            type: "secure-text",
            label: "API Key",
            required: true,
          },
          {
            id: "baseUrl",
            type: "text",
            label: "Base URL",
            required: false,
          },
        ],
      },
    };

    const currentValues: LlmConfigurationValues = {
      apiKey: "sk-existing-key",
      baseUrl: "https://api.openai.com/v1",
    };

    it("should validate partial updates with valid values", () => {
      const updates: Partial<LlmConfigurationValues> = {
        baseUrl: "https://api.openai.com/v2",
      };

      const result = LlmProviderConfigurationValidator.validatePartialValues(
        updates,
        currentValues,
        mockProvider,
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject partial updates with invalid values", () => {
      const updates: Partial<LlmConfigurationValues> = {
        baseUrl: 123, // wrong type
      };

      const result = LlmProviderConfigurationValidator.validatePartialValues(
        updates,
        currentValues,
        mockProvider,
      );
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should allow partial updates that clear optional fields", () => {
      const updates: Partial<LlmConfigurationValues> = {
        baseUrl: "",
      };

      const result = LlmProviderConfigurationValidator.validatePartialValues(
        updates,
        currentValues,
        mockProvider,
      );
      expect(result.valid).toBe(true);
    });
  });

  describe("validateWithLogging", () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("should log validation errors in development mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const invalidFile = {
        version: "invalid",
        providers: [],
      };

      const result = LlmProviderConfigurationValidator.validateWithLogging(
        invalidFile,
        "Test Context",
      );

      expect(result.valid).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "[Test Context] Validation failed:",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/- .+: .+/),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it("should not log validation errors in production mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const invalidFile = {
        version: "invalid",
        providers: [],
      };

      const result =
        LlmProviderConfigurationValidator.validateWithLogging(invalidFile);

      expect(result.valid).toBe(false);
      expect(consoleSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should not log anything for valid files", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const validFile = {
        version: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: { "gpt-4": "GPT-4" },
            configuration: { fields: [] },
          },
        ],
      };

      const result =
        LlmProviderConfigurationValidator.validateWithLogging(validFile);

      expect(result.valid).toBe(true);
      expect(consoleSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should use default context when none provided", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const invalidFile = {
        version: "invalid",
        providers: [],
      };

      LlmProviderConfigurationValidator.validateWithLogging(invalidFile);

      expect(consoleSpy).toHaveBeenCalledWith(
        "[Validation] Validation failed:",
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("performance", () => {
    it("should validate typical files under 10ms", () => {
      const typicalFile = {
        version: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: {
              "gpt-4": "GPT-4",
              "gpt-3.5-turbo": "GPT-3.5 Turbo",
            },
            configuration: {
              fields: [
                {
                  id: "apiKey",
                  type: "secure-text",
                  label: "API Key",
                  required: true,
                },
                {
                  id: "baseUrl",
                  type: "text",
                  label: "Base URL",
                  required: false,
                },
              ],
            },
          },
          {
            id: "anthropic",
            name: "Anthropic",
            models: {
              "claude-3-opus": "Claude 3 Opus",
              "claude-3-sonnet": "Claude 3 Sonnet",
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
        ],
      };

      const startTime = Date.now();
      const result =
        LlmProviderConfigurationValidator.validateFile(typicalFile);
      const endTime = Date.now();

      expect(result.valid).toBe(true);
      expect(endTime - startTime).toBeLessThan(10);
    });
  });
});
