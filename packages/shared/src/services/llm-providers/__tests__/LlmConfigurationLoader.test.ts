import { validateProvidersFile } from "../../../types/llm-providers/validation/validateProvidersFile";
import { FileStorageService } from "../../storage/FileStorageService";
import { FileNotFoundError } from "../../storage/errors/FileNotFoundError";
import { LlmConfigurationLoader } from "../LlmConfigurationLoader";

// Mock dependencies
jest.mock("../../storage/FileStorageService");
jest.mock("../../../types/llm-providers/validation/validateProvidersFile");

const MockFileStorageService = FileStorageService as jest.MockedClass<
  typeof FileStorageService
>;
const mockValidateProvidersFile = validateProvidersFile as jest.MockedFunction<
  typeof validateProvidersFile
>;

describe("LlmConfigurationLoader", () => {
  let mockFileStorage: jest.Mocked<FileStorageService>;
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

      expect(MockFileStorageService).toHaveBeenCalledTimes(1);
    });
  });

  describe("initialize", () => {
    beforeEach(() => {
      loader = new LlmConfigurationLoader("test-config.json");
    });

    it("should load configuration on first initialization", async () => {
      mockFileStorage.readJsonFile.mockResolvedValue(mockValidConfig);

      await loader.initialize();

      expect(mockFileStorage.readJsonFile).toHaveBeenCalledWith(
        "test-config.json",
      );
      expect(mockValidateProvidersFile).toHaveBeenCalledWith(mockValidConfig);
    });

    it("should skip loading on subsequent initialization calls", async () => {
      mockFileStorage.readJsonFile.mockResolvedValue(mockValidConfig);

      await loader.initialize();
      await loader.initialize();

      expect(mockFileStorage.readJsonFile).toHaveBeenCalledTimes(1);
    });

    it("should handle missing file gracefully", async () => {
      const fileNotFoundError = new FileNotFoundError(
        "test-config.json",
        "read",
      );
      mockFileStorage.readJsonFile.mockRejectedValue(fileNotFoundError);

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
      mockFileStorage.readJsonFile.mockResolvedValue(mockValidConfig);

      await loader.initialize();
      const providers = await loader.getProviders();

      expect(providers).toEqual(mockValidConfig.providers);
    });

    it("should return empty array when no providers loaded", async () => {
      const emptyConfig = { version: "1.0.0", providers: [] };
      mockFileStorage.readJsonFile.mockResolvedValue(emptyConfig);
      mockValidateProvidersFile.mockReturnValue({
        success: true,
        data: emptyConfig,
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
      mockFileStorage.readJsonFile.mockResolvedValue(mockValidConfig);

      await loader.initialize();
      const provider = await loader.getProvider("openai");

      expect(provider).toEqual(mockValidConfig.providers[0]);
    });

    it("should return undefined for non-existent provider", async () => {
      mockFileStorage.readJsonFile.mockResolvedValue(mockValidConfig);

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
      mockFileStorage.readJsonFile.mockResolvedValue(mockValidConfig);

      await loader.initialize();
      const models = await loader.getModelsForProvider("openai");

      expect(models).toEqual(mockValidConfig.providers[0]?.models);
    });

    it("should return empty object for non-existent provider", async () => {
      mockFileStorage.readJsonFile.mockResolvedValue(mockValidConfig);

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
      mockFileStorage.readJsonFile.mockResolvedValue(mockValidConfig);

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

      mockFileStorage.readJsonFile.mockResolvedValue(updatedConfig);
      mockValidateProvidersFile.mockReturnValue({
        success: true,
        data: updatedConfig,
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
      mockFileStorage.readJsonFile.mockResolvedValue(mockValidConfig);

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
      mockFileStorage.readJsonFile.mockResolvedValue(mockValidConfig);

      await loader.initialize();
      await loader.getProviders();
      await loader.getProvider("openai");
      await loader.getModelsForProvider("openai");

      // File should only be read once during initialization
      expect(mockFileStorage.readJsonFile).toHaveBeenCalledTimes(1);
    });
  });
});
