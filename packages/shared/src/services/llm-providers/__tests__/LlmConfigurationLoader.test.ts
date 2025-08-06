import { validateProvidersFile } from "../../../types/llm-providers/validation/validateProvidersFile";
import { FileStorageService } from "../../storage/FileStorageService";
import { FileNotFoundError } from "../../storage/errors/FileNotFoundError";
import { LlmConfigurationLoader } from "../LlmConfigurationLoader";
import { ConfigurationValidator } from "../validation/ConfigurationValidator";

// Mock dependencies
jest.mock("../../storage/FileStorageService");
jest.mock("../../../types/llm-providers/validation/validateProvidersFile");
jest.mock("../validation/ConfigurationValidator");

const MockFileStorageService = FileStorageService as jest.MockedClass<
  typeof FileStorageService
>;
const mockValidateProvidersFile = validateProvidersFile as jest.MockedFunction<
  typeof validateProvidersFile
>;
const MockConfigurationValidator = ConfigurationValidator as jest.MockedClass<
  typeof ConfigurationValidator
>;

describe("LlmConfigurationLoader", () => {
  let mockFileStorage: jest.Mocked<FileStorageService>;
  let mockValidator: jest.Mocked<ConfigurationValidator>;
  let loader: LlmConfigurationLoader;

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

    // Mock FileStorageService
    mockFileStorage = {
      readJsonFile: jest.fn(),
    } as unknown as jest.Mocked<FileStorageService>;
    MockFileStorageService.mockImplementation(() => mockFileStorage);

    // Mock ConfigurationValidator
    mockValidator = {
      validateConfigurationFile: jest.fn(),
      createUserFriendlyError: jest.fn(),
    } as unknown as jest.Mocked<ConfigurationValidator>;
    MockConfigurationValidator.mockImplementation(() => mockValidator);

    // Mock validateProvidersFile to return success by default
    mockValidateProvidersFile.mockReturnValue({
      success: true,
      data: mockValidConfig,
    });

    // Mock process.env.NODE_ENV
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    if (loader) {
      loader.dispose();
    }
  });

  describe("constructor", () => {
    it("should create loader with default options", () => {
      loader = new LlmConfigurationLoader("test-config.json");

      // FileStorageService should be called once for the loader
      // ConfigurationValidator should be created with default options
      expect(MockFileStorageService).toHaveBeenCalledTimes(1);
      expect(MockConfigurationValidator).toHaveBeenCalledTimes(1);
    });
  });

  describe("initialize", () => {
    beforeEach(() => {
      loader = new LlmConfigurationLoader("test-config.json");
    });

    it("should load configuration on first initialization", async () => {
      // Mock successful validation result
      mockValidator.validateConfigurationFile.mockResolvedValue({
        isValid: true,
        data: mockValidConfig,
        metadata: {
          providerCount: 1,
          schemaVersion: "1.0.0",
          validationDuration: 10,
        },
      });

      await loader.initialize();

      expect(mockValidator.validateConfigurationFile).toHaveBeenCalledWith(
        "test-config.json",
      );
    });

    it("should skip loading on subsequent initialization calls", async () => {
      // Mock successful validation result for first call
      mockValidator.validateConfigurationFile.mockResolvedValue({
        isValid: true,
        data: mockValidConfig,
        metadata: {
          providerCount: 1,
          schemaVersion: "1.0.0",
          validationDuration: 10,
        },
      });

      await loader.initialize();
      await loader.initialize();

      expect(mockValidator.validateConfigurationFile).toHaveBeenCalledTimes(1);
    });

    it("should handle missing file gracefully", async () => {
      const fileNotFoundError = new FileNotFoundError(
        "test-config.json",
        "read",
      );

      // Mock validator to return error result for missing file
      mockValidator.validateConfigurationFile.mockRejectedValue(
        fileNotFoundError,
      );

      await loader.initialize();
      const providers = await loader.getProviders();

      expect(providers).toEqual([]);
    });
  });

  describe("getProviders", () => {
    beforeEach(() => {
      loader = new LlmConfigurationLoader("test-config.json");
    });

    it("should throw error when not initialized", async () => {
      await expect(loader.getProviders()).rejects.toThrow(
        "LlmConfigurationLoader not initialized. Call initialize() first.",
      );
    });

    it("should return providers from loaded configuration", async () => {
      // Mock successful validation result
      mockValidator.validateConfigurationFile.mockResolvedValue({
        isValid: true,
        data: mockValidConfig,
        metadata: {
          providerCount: 1,
          schemaVersion: "1.0.0",
          validationDuration: 10,
        },
      });

      await loader.initialize();
      const providers = await loader.getProviders();

      expect(providers).toEqual(mockValidConfig.providers);
    });

    it("should return empty array when no providers loaded", async () => {
      const emptyConfig = { version: "1.0.0", providers: [] };

      // Mock successful validation result with empty providers
      mockValidator.validateConfigurationFile.mockResolvedValue({
        isValid: true,
        data: emptyConfig,
        metadata: {
          providerCount: 0,
          schemaVersion: "1.0.0",
          validationDuration: 10,
        },
      });

      await loader.initialize();
      const providers = await loader.getProviders();

      expect(providers).toEqual([]);
    });
  });

  describe("getProvider", () => {
    beforeEach(() => {
      loader = new LlmConfigurationLoader("test-config.json");
    });

    it("should throw error when not initialized", async () => {
      await expect(loader.getProvider("openai")).rejects.toThrow(
        "LlmConfigurationLoader not initialized. Call initialize() first.",
      );
    });

    it("should return specific provider by ID", async () => {
      // Mock successful validation result
      mockValidator.validateConfigurationFile.mockResolvedValue({
        isValid: true,
        data: mockValidConfig,
        metadata: {
          providerCount: 1,
          schemaVersion: "1.0.0",
          validationDuration: 10,
        },
      });

      await loader.initialize();
      const provider = await loader.getProvider("openai");

      expect(provider).toEqual(mockValidConfig.providers[0]);
    });

    it("should return undefined for non-existent provider", async () => {
      // Mock successful validation result
      mockValidator.validateConfigurationFile.mockResolvedValue({
        isValid: true,
        data: mockValidConfig,
        metadata: {
          providerCount: 1,
          schemaVersion: "1.0.0",
          validationDuration: 10,
        },
      });

      await loader.initialize();
      const provider = await loader.getProvider("nonexistent");

      expect(provider).toBeUndefined();
    });
  });

  describe("getModelsForProvider", () => {
    beforeEach(() => {
      loader = new LlmConfigurationLoader("test-config.json");
    });

    it("should throw error when not initialized", async () => {
      await expect(loader.getModelsForProvider("openai")).rejects.toThrow(
        "LlmConfigurationLoader not initialized. Call initialize() first.",
      );
    });

    it("should return models for existing provider", async () => {
      // Mock successful validation result
      mockValidator.validateConfigurationFile.mockResolvedValue({
        isValid: true,
        data: mockValidConfig,
        metadata: {
          providerCount: 1,
          schemaVersion: "1.0.0",
          validationDuration: 10,
        },
      });

      await loader.initialize();
      const models = await loader.getModelsForProvider("openai");

      expect(models).toEqual(mockValidConfig.providers[0]?.models);
    });

    it("should return empty object for non-existent provider", async () => {
      // Mock successful validation result
      mockValidator.validateConfigurationFile.mockResolvedValue({
        isValid: true,
        data: mockValidConfig,
        metadata: {
          providerCount: 1,
          schemaVersion: "1.0.0",
          validationDuration: 10,
        },
      });

      await loader.initialize();
      const models = await loader.getModelsForProvider("nonexistent");

      expect(models).toEqual({});
    });
  });

  describe("reload", () => {
    beforeEach(() => {
      loader = new LlmConfigurationLoader("test-config.json");
    });

    it("should reload configuration from file", async () => {
      // Mock initial successful validation result
      mockValidator.validateConfigurationFile.mockResolvedValue({
        isValid: true,
        data: mockValidConfig,
        metadata: {
          providerCount: 1,
          schemaVersion: "1.0.0",
          validationDuration: 10,
        },
      });

      await loader.initialize();

      const updatedConfig = {
        ...mockValidConfig,
        providers: [
          ...mockValidConfig.providers,
          {
            id: "anthropic",
            name: "Anthropic",
            models: { "claude-3": "Claude 3" },
            configuration: { fields: [] },
          },
        ],
      };

      // Mock updated validation result for reload
      mockValidator.validateConfigurationFile.mockResolvedValue({
        isValid: true,
        data: updatedConfig,
        metadata: {
          providerCount: 2,
          schemaVersion: "1.0.0",
          validationDuration: 10,
        },
      });

      await loader.reload();
      const providers = await loader.getProviders();

      expect(providers).toHaveLength(2);
      expect(providers[1]?.id).toBe("anthropic");
    });
  });

  describe("dispose", () => {
    it("should clear cache when disposed", async () => {
      loader = new LlmConfigurationLoader("test-config.json");

      // Mock successful validation result
      mockValidator.validateConfigurationFile.mockResolvedValue({
        isValid: true,
        data: mockValidConfig,
        metadata: {
          providerCount: 1,
          schemaVersion: "1.0.0",
          validationDuration: 10,
        },
      });

      await loader.initialize();
      const providersBeforeDispose = await loader.getProviders();
      expect(providersBeforeDispose).toHaveLength(1);

      loader.dispose();

      // After dispose, cache is cleared but loader remains initialized
      // getProviders should return empty array since cache is empty
      const providersAfterDispose = await loader.getProviders();
      expect(providersAfterDispose).toEqual([]);
    });
  });

  describe("caching behavior", () => {
    beforeEach(() => {
      loader = new LlmConfigurationLoader("test-config.json");
    });

    it("should use cache for repeated operations", async () => {
      // Mock successful validation result
      mockValidator.validateConfigurationFile.mockResolvedValue({
        isValid: true,
        data: mockValidConfig,
        metadata: {
          providerCount: 1,
          schemaVersion: "1.0.0",
          validationDuration: 10,
        },
      });

      await loader.initialize();
      await loader.getProviders();
      await loader.getProvider("openai");
      await loader.getModelsForProvider("openai");

      // Validator should only be called once during initialization
      expect(mockValidator.validateConfigurationFile).toHaveBeenCalledTimes(1);
    });
  });
});
