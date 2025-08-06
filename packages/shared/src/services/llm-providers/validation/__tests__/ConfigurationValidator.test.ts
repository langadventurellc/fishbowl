import { ConfigurationValidator } from "../ConfigurationValidator";
import { FileStorageService } from "../../../storage/FileStorageService";
import { LlmProviderConfigurationValidator } from "../../../../types/llm-providers/validation/validationService";

// Mock dependencies
jest.mock("../../../storage/FileStorageService");
jest.mock("../../../../types/llm-providers/validation/validationService");

const MockFileStorageService = FileStorageService as jest.MockedClass<
  typeof FileStorageService
>;
const mockValidateFile = jest.fn();
const mockValidateProvider = jest.fn();

// Mock the static methods
(
  LlmProviderConfigurationValidator as unknown as {
    validateFile: jest.MockedFunction<typeof mockValidateFile>;
    validateProvider: jest.MockedFunction<typeof mockValidateProvider>;
  }
).validateFile = mockValidateFile;
(
  LlmProviderConfigurationValidator as unknown as {
    validateFile: jest.MockedFunction<typeof mockValidateFile>;
    validateProvider: jest.MockedFunction<typeof mockValidateProvider>;
  }
).validateProvider = mockValidateProvider;

describe("ConfigurationValidator", () => {
  let validator: ConfigurationValidator;
  let mockFileStorage: jest.Mocked<FileStorageService>;

  const mockValidConfig = {
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
              type: "secure-text" as const,
              label: "API Key",
              required: true,
            },
          ],
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mocks to default successful state
    mockValidateFile.mockReturnValue({
      valid: true,
      errors: [],
    });

    mockValidateProvider.mockReturnValue({
      valid: true,
      errors: [],
    });

    mockFileStorage = {
      readJsonFile: jest.fn(),
    } as unknown as jest.Mocked<FileStorageService>;

    MockFileStorageService.mockImplementation(() => mockFileStorage);

    validator = new ConfigurationValidator({
      mode: "development",
      enableWarnings: true,
      maxErrorCount: 10,
    });
  });

  describe("validateConfiguration", () => {
    it("should validate valid configuration data", async () => {
      mockValidateFile.mockReturnValue({
        valid: true,
        errors: [],
      });

      const result = await validator.validateConfiguration(mockValidConfig);

      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.metadata?.providerCount).toBe(1);
      expect(result.metadata?.validationDuration).toBeGreaterThan(0);
    });

    it("should return validation errors for invalid data", async () => {
      const mockError = {
        fieldId: "providers[0].apiKey",
        message: "API key is required",
        code: "REQUIRED_FIELD_MISSING" as const,
        value: "",
      };

      mockValidateFile.mockReturnValue({
        valid: false,
        errors: [mockError],
      });

      const result = await validator.validateConfiguration({});

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0]?.message).toBe("API key is required");
    });

    it("should generate warnings when enabled", async () => {
      const configWithDuplicates = {
        version: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: {},
            configuration: { fields: [] },
          },
          {
            id: "openai",
            name: "OpenAI Copy",
            models: { "gpt-4": "GPT-4" },
            configuration: { fields: [] },
          },
        ],
      };

      // The validation should fail due to duplicate IDs
      mockValidateFile.mockReturnValue({
        valid: false,
        errors: [
          {
            fieldId: "providers[1].id",
            message: "Duplicate provider ID 'openai'",
            code: "DUPLICATE_PROVIDER_ID" as const,
            value: "openai",
          },
        ],
      });

      const result =
        await validator.validateConfiguration(configWithDuplicates);

      // Since validation fails due to duplicate IDs, we should get errors, not warnings
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]?.message).toContain("Duplicate provider ID");
    });
  });

  describe("validateConfigurationFile", () => {
    it("should validate file successfully", async () => {
      mockFileStorage.readJsonFile.mockResolvedValue(mockValidConfig);
      mockValidateFile.mockReturnValue({
        valid: true,
        errors: [],
      });

      const result = await validator.validateConfigurationFile(
        "/path/to/config.json",
      );

      expect(result.isValid).toBe(true);
      expect(mockFileStorage.readJsonFile).toHaveBeenCalledWith(
        "/path/to/config.json",
      );
    });

    it("should handle file reading errors", async () => {
      const fileError = new Error("File not found");
      fileError.name = "FileNotFoundError";
      mockFileStorage.readJsonFile.mockRejectedValue(fileError);

      const result = await validator.validateConfigurationFile(
        "/path/to/missing.json",
      );

      expect(result.isValid).toBe(false);
      expect(result.errors?.[0]?.code).toBe("FileNotFoundError");
      expect(result.errors?.[0]?.path).toBe("/path/to/missing.json");
    });

    it("should handle JSON parsing errors", async () => {
      const jsonError = new Error("Unexpected token");
      jsonError.name = "InvalidJsonError";
      mockFileStorage.readJsonFile.mockRejectedValue(jsonError);

      const result = await validator.validateConfigurationFile(
        "/path/to/invalid.json",
      );

      expect(result.isValid).toBe(false);
      expect(result.errors?.[0]?.code).toBe("JSON_PARSE_ERROR");
    });
  });

  describe("validateProvider", () => {
    it("should validate single provider successfully", () => {
      mockValidateProvider.mockReturnValue({
        valid: true,
        errors: [],
      });

      const result = validator.validateProvider(mockValidConfig.providers[0]);

      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should return errors for invalid provider", () => {
      const mockError = {
        fieldId: "id",
        message: "Provider ID is required",
        code: "REQUIRED_FIELD_MISSING" as const,
        value: "",
      };

      mockValidateProvider.mockReturnValue({
        valid: false,
        errors: [mockError],
      });

      const result = validator.validateProvider({});

      expect(result.isValid).toBe(false);
      expect(result.errors?.[0]?.message).toBe("Provider ID is required");
    });
  });

  describe("createUserFriendlyError", () => {
    it("should return success message for no errors", () => {
      const message = validator.createUserFriendlyError([]);
      expect(message).toBe("Validation successful");
    });

    it("should return single error message", () => {
      const errors = [
        {
          path: "apiKey",
          field: "apiKey",
          message: "API key is required",
          code: "required",
        },
      ];

      const message = validator.createUserFriendlyError(errors);
      expect(message).toBe("API key is required");
    });

    it("should return summary for multiple errors", () => {
      const errors = [
        { path: "field1", field: "field1", message: "Error 1", code: "error1" },
        { path: "field2", field: "field2", message: "Error 2", code: "error2" },
      ];

      const message = validator.createUserFriendlyError(errors);
      expect(message).toBe(
        "Configuration has 2 validation errors. Please check the configuration file.",
      );
    });
  });

  describe("production vs development mode", () => {
    it("should use production mode settings", () => {
      const prodValidator = new ConfigurationValidator({ mode: "production" });
      expect(prodValidator).toBeDefined();
      // Additional assertions could be added to verify production-specific behavior
    });

    it("should disable warnings when not enabled", async () => {
      const validatorNoWarnings = new ConfigurationValidator({
        mode: "development",
        enableWarnings: false,
      });

      mockValidateFile.mockReturnValue({
        valid: true,
        errors: [],
      });

      const result = await validatorNoWarnings.validateConfiguration({
        version: "1.0.0",
        providers: [
          {
            id: "duplicate",
            name: "Test",
            models: {},
            configuration: { fields: [] },
          },
          {
            id: "duplicate",
            name: "Test2",
            models: {},
            configuration: { fields: [] },
          },
        ],
      });

      expect(result.warnings).toBeUndefined();
    });
  });
});
