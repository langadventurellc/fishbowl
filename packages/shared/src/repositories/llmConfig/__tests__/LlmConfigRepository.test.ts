import { FileStorageService } from "../../../services/storage/FileStorageService";
import {
  FileNotFoundError,
  WritePermissionError,
} from "../../../services/storage/errors";
import type { SecureStorageInterface } from "../../../services/storage/SecureStorageInterface";
import type {
  LlmConfigMetadata,
  LlmConfigInput,
} from "../../../types/llmConfig";
import { LlmConfigRepository } from "../LlmConfigRepository";

// Mock dependencies
jest.mock("../../../services/storage/FileStorageService");
jest.mock("../../../utils/generateId");
jest.mock("../../../logging/createLoggerSync", () => ({
  createLoggerSync: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  })),
}));

const MockedFileStorageService = FileStorageService as jest.MockedClass<
  typeof FileStorageService
>;

// Mock generateId to return predictable IDs
const mockGenerateId = jest.requireMock("../../../utils/generateId")
  .generateId as jest.MockedFunction<() => string>;

describe("LlmConfigRepository", () => {
  let repository: LlmConfigRepository;
  let mockFileStorage: jest.Mocked<FileStorageService<LlmConfigMetadata[]>>;
  let mockSecureStorage: jest.Mocked<SecureStorageInterface>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock file storage
    mockFileStorage = new MockedFileStorageService() as jest.Mocked<
      FileStorageService<LlmConfigMetadata[]>
    >;

    // Setup mock secure storage
    mockSecureStorage = {
      isAvailable: jest.fn().mockReturnValue(true),
      store: jest.fn(),
      retrieve: jest.fn(),
      delete: jest.fn(),
    };

    // Setup mock ID generator
    mockGenerateId.mockReturnValue("test-id-123");

    repository = new LlmConfigRepository(mockFileStorage, mockSecureStorage);
  });

  const createValidConfig = (): LlmConfigInput => ({
    customName: "Test OpenAI",
    provider: "openai",
    apiKey: "sk-test123456789",
    baseUrl: "https://api.openai.com/v1",
    useAuthHeader: true,
  });

  const createValidMetadata = (): LlmConfigMetadata => ({
    id: "test-id-123",
    customName: "Test OpenAI",
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    useAuthHeader: true,
    createdAt: "2023-10-01T00:00:00.000Z",
    updatedAt: "2023-10-01T00:00:00.000Z",
  });

  describe("create()", () => {
    beforeEach(() => {
      mockFileStorage.readJsonFile.mockResolvedValue([]);
      mockFileStorage.writeJsonFile.mockResolvedValue();
      mockSecureStorage.store.mockReturnValue(undefined);
    });

    it("should create config with valid input", async () => {
      const config = createValidConfig();

      const result = await repository.create(config);

      expect(result.id).toBe("test-id-123");
      expect(result.customName).toBe(config.customName);
      expect(result.provider).toBe(config.provider);
      expect(result.apiKey).toBe(config.apiKey);
      expect(result.baseUrl).toBe(config.baseUrl);
      expect(result.useAuthHeader).toBe(config.useAuthHeader);
      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
    });

    it("should validate input using Zod schema", async () => {
      const invalidConfig = {
        customName: "", // Invalid: empty required field
        provider: "openai",
        apiKey: "sk-test123456789",
      } as LlmConfigInput;

      await expect(repository.create(invalidConfig)).rejects.toThrow(
        "Custom name is required",
      );
    });

    it("should store API key in secure storage with correct key", async () => {
      const config = createValidConfig();

      await repository.create(config);

      expect(mockSecureStorage.store).toHaveBeenCalledWith(
        "llm_api_key_test-id-123",
        config.apiKey,
      );
    });

    it("should store metadata in file storage", async () => {
      const config = createValidConfig();

      await repository.create(config);

      expect(mockFileStorage.writeJsonFile).toHaveBeenCalledWith(
        "llm_config.json",
        expect.arrayContaining([
          expect.objectContaining({
            id: "test-id-123",
            customName: config.customName,
            provider: config.provider,
            baseUrl: config.baseUrl,
            useAuthHeader: config.useAuthHeader,
          }),
        ]),
      );
    });

    it("should throw error when secure storage is unavailable", async () => {
      mockSecureStorage.isAvailable.mockReturnValue(false);
      const config = createValidConfig();

      await expect(repository.create(config)).rejects.toThrow(
        "Secure storage is not available on this system",
      );

      expect(mockSecureStorage.store).not.toHaveBeenCalled();
      expect(mockFileStorage.writeJsonFile).not.toHaveBeenCalled();
    });

    it("should rollback secure storage on file storage failure", async () => {
      const config = createValidConfig();
      const fileError = new WritePermissionError("llm_config.json", "write");
      mockFileStorage.writeJsonFile.mockRejectedValue(fileError);

      await expect(repository.create(config)).rejects.toThrow(
        "Write permission denied",
      );

      expect(mockSecureStorage.store).toHaveBeenCalled();
      expect(mockSecureStorage.delete).toHaveBeenCalledWith(
        "llm_api_key_test-id-123",
      );
    });

    it("should append to existing configurations", async () => {
      const existingConfig = createValidMetadata();
      existingConfig.id = "existing-id";
      mockFileStorage.readJsonFile.mockResolvedValue([existingConfig]);
      const config = createValidConfig();

      await repository.create(config);

      expect(mockFileStorage.writeJsonFile).toHaveBeenCalledWith(
        "llm_config.json",
        expect.arrayContaining([
          existingConfig,
          expect.objectContaining({ id: "test-id-123" }),
        ]),
      );
    });
  });

  describe("read()", () => {
    it("should return complete config with API key", async () => {
      const metadata = createValidMetadata();
      mockFileStorage.readJsonFile.mockResolvedValue([metadata]);
      mockSecureStorage.retrieve.mockReturnValue("sk-test123456789");

      const result = await repository.read("test-id-123");

      expect(result).toEqual({
        ...metadata,
        apiKey: "sk-test123456789",
      });
      expect(mockSecureStorage.retrieve).toHaveBeenCalledWith(
        "llm_api_key_test-id-123",
      );
    });

    it("should return null for non-existent config", async () => {
      mockFileStorage.readJsonFile.mockResolvedValue([]);

      const result = await repository.read("non-existent-id");

      expect(result).toBeNull();
    });

    it("should return null when secure storage is unavailable", async () => {
      const metadata = createValidMetadata();
      mockFileStorage.readJsonFile.mockResolvedValue([metadata]);
      mockSecureStorage.isAvailable.mockReturnValue(false);

      const result = await repository.read("test-id-123");

      expect(result).toBeNull();
    });

    it("should return null when API key is missing", async () => {
      const metadata = createValidMetadata();
      mockFileStorage.readJsonFile.mockResolvedValue([metadata]);
      mockSecureStorage.retrieve.mockReturnValue(null);

      const result = await repository.read("test-id-123");

      expect(result).toBeNull();
    });
  });

  describe("update()", () => {
    beforeEach(() => {
      const existingConfig = createValidMetadata();
      mockFileStorage.readJsonFile.mockResolvedValue([existingConfig]);
      mockFileStorage.writeJsonFile.mockResolvedValue();
      mockSecureStorage.retrieve.mockReturnValue("sk-original-key");
    });

    it("should update existing config with partial data", async () => {
      const updates = { customName: "Updated Name" };

      const result = await repository.update("test-id-123", updates);

      expect(result.customName).toBe("Updated Name");
      expect(result.provider).toBe("openai"); // Should preserve existing
      expect(result.apiKey).toBe("sk-original-key");
      expect(typeof result.updatedAt).toBe("string");
    });

    it("should update API key when provided", async () => {
      const updates = { apiKey: "sk-new-key" };

      const result = await repository.update("test-id-123", updates);

      expect(result.apiKey).toBe("sk-new-key");
      expect(mockSecureStorage.store).toHaveBeenCalledWith(
        "llm_api_key_test-id-123",
        "sk-new-key",
      );
    });

    it("should handle optional fields correctly", async () => {
      // Start with metadata that has undefined optional fields
      const existingConfig = createValidMetadata();
      existingConfig.baseUrl = undefined;
      existingConfig.useAuthHeader = false;
      mockFileStorage.readJsonFile.mockResolvedValue([existingConfig]);

      const updates = { baseUrl: undefined, useAuthHeader: true };

      const result = await repository.update("test-id-123", updates);

      expect(result.baseUrl).toBeUndefined();
      expect(result.useAuthHeader).toBe(true);
    });

    it("should throw error for non-existent config", async () => {
      mockFileStorage.readJsonFile.mockResolvedValue([]);

      await expect(
        repository.update("non-existent-id", { customName: "Updated" }),
      ).rejects.toThrow("Configuration not found: non-existent-id");
    });

    it("should throw error when secure storage is unavailable for API key update", async () => {
      mockSecureStorage.isAvailable.mockReturnValue(false);

      await expect(
        repository.update("test-id-123", { apiKey: "new-key" }),
      ).rejects.toThrow("Secure storage is not available for API key update");
    });

    it("should throw error when API key is missing and no new key provided", async () => {
      mockSecureStorage.retrieve.mockReturnValue(null);

      await expect(
        repository.update("test-id-123", { customName: "Updated" }),
      ).rejects.toThrow("API key not found for configuration: test-id-123");
    });

    it("should validate partial updates", async () => {
      const invalidUpdates = { customName: "" }; // Invalid: empty string

      await expect(
        repository.update("test-id-123", invalidUpdates),
      ).rejects.toThrow("Custom name is required");
    });
  });

  describe("delete()", () => {
    beforeEach(() => {
      const existingConfig = createValidMetadata();
      mockFileStorage.readJsonFile.mockResolvedValue([existingConfig]);
      mockFileStorage.writeJsonFile.mockResolvedValue();
    });

    it("should delete config successfully", async () => {
      await repository.delete("test-id-123");

      expect(mockFileStorage.writeJsonFile).toHaveBeenCalledWith(
        "llm_config.json",
        [],
      );
      expect(mockSecureStorage.delete).toHaveBeenCalledWith(
        "llm_api_key_test-id-123",
      );
    });

    it("should throw error for non-existent config", async () => {
      mockFileStorage.readJsonFile.mockResolvedValue([]);

      await expect(repository.delete("non-existent-id")).rejects.toThrow(
        "Configuration not found",
      );
    });
  });

  describe("list()", () => {
    it("should return all configurations metadata", async () => {
      const configs = [createValidMetadata()];
      mockFileStorage.readJsonFile.mockResolvedValue(configs);

      const result = await repository.list();

      expect(result).toEqual(configs);
    });

    it("should return empty array when no configurations exist", async () => {
      mockFileStorage.readJsonFile.mockResolvedValue([]);

      const result = await repository.list();

      expect(result).toEqual([]);
    });

    it("should throw error on file storage failure", async () => {
      // Use a general error that won't be caught by the FileStorageError handler
      mockFileStorage.readJsonFile.mockRejectedValue(
        new Error("General storage failure"),
      );

      await expect(repository.list()).rejects.toThrow(
        "General storage failure",
      );
    });
  });

  describe("exists()", () => {
    it("should return true for existing config", async () => {
      const metadata = createValidMetadata();
      mockFileStorage.readJsonFile.mockResolvedValue([metadata]);

      const result = await repository.exists("test-id-123");

      expect(result).toBe(true);
    });

    it("should return false for non-existent config", async () => {
      mockFileStorage.readJsonFile.mockResolvedValue([]);

      const result = await repository.exists("non-existent-id");

      expect(result).toBe(false);
    });
  });

  // Legacy methods tests for backward compatibility
  describe("Legacy methods", () => {
    describe("saveConfiguration()", () => {
      beforeEach(() => {
        mockFileStorage.readJsonFile.mockResolvedValue([]);
        mockFileStorage.writeJsonFile.mockResolvedValue();
        mockSecureStorage.store.mockReturnValue(undefined);
      });

      it("should save configuration and return success with ID", async () => {
        const config = {
          customName: "Test OpenAI",
          provider: "openai" as const,
          useAuthHeader: true,
        };
        const apiKey = "sk-test123456789";

        const result = await repository.saveConfiguration(config, apiKey);

        expect(result.success).toBe(true);
        expect(result.data).toBe("test-id-123");
      });

      it("should return error when secure storage unavailable", async () => {
        mockSecureStorage.isAvailable.mockReturnValue(false);
        const config = {
          customName: "Test",
          provider: "openai" as const,
          useAuthHeader: true,
        };

        const result = await repository.saveConfiguration(config, "sk-key");

        expect(result.success).toBe(false);
        expect(result.error).toBe(
          "Secure storage is not available on this system",
        );
      });
    });

    describe("updateConfiguration()", () => {
      beforeEach(() => {
        const existingConfig = createValidMetadata();
        mockFileStorage.readJsonFile.mockResolvedValue([existingConfig]);
        mockFileStorage.writeJsonFile.mockResolvedValue();
      });

      it("should update configuration successfully", async () => {
        const updates = { customName: "Updated Name" };

        const result = await repository.updateConfiguration(
          "test-id-123",
          updates,
        );

        expect(result.success).toBe(true);
      });

      it("should return error for non-existent config", async () => {
        mockFileStorage.readJsonFile.mockResolvedValue([]);

        const result = await repository.updateConfiguration("non-existent", {});

        expect(result.success).toBe(false);
        expect(result.error).toBe("Configuration not found");
      });
    });

    describe("getConfiguration()", () => {
      it("should return configuration metadata", async () => {
        const metadata = createValidMetadata();
        mockFileStorage.readJsonFile.mockResolvedValue([metadata]);
        mockSecureStorage.retrieve.mockReturnValue("sk-key");

        const result = await repository.getConfiguration("test-id-123");

        expect(result.success).toBe(true);
        expect(result.data).toEqual(metadata);
      });

      it("should return null for non-existent config", async () => {
        mockFileStorage.readJsonFile.mockResolvedValue([]);

        const result = await repository.getConfiguration("non-existent");

        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      });
    });

    describe("getAllConfigurations()", () => {
      it("should return all configurations", async () => {
        const configs = [createValidMetadata()];
        mockFileStorage.readJsonFile.mockResolvedValue(configs);

        const result = await repository.getAllConfigurations();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(configs);
      });
    });

    describe("deleteConfiguration()", () => {
      beforeEach(() => {
        const existingConfig = createValidMetadata();
        mockFileStorage.readJsonFile.mockResolvedValue([existingConfig]);
        mockFileStorage.writeJsonFile.mockResolvedValue();
      });

      it("should delete configuration successfully", async () => {
        const result = await repository.deleteConfiguration("test-id-123");

        expect(result.success).toBe(true);
      });

      it("should return error for non-existent config", async () => {
        mockFileStorage.readJsonFile.mockResolvedValue([]);

        const result = await repository.deleteConfiguration("non-existent");

        expect(result.success).toBe(false);
        expect(result.error).toBe("Configuration not found");
      });
    });

    describe("isSecureStorageAvailable()", () => {
      it("should return secure storage availability", () => {
        mockSecureStorage.isAvailable.mockReturnValue(true);

        const result = repository.isSecureStorageAvailable();

        expect(result).toBe(true);
        expect(mockSecureStorage.isAvailable).toHaveBeenCalled();
      });
    });
  });

  describe("Error handling", () => {
    it("should handle file storage errors gracefully in loadConfigurationsInternal", async () => {
      const fileError = new FileNotFoundError("llm_config.json", "read");
      mockFileStorage.readJsonFile.mockRejectedValue(fileError);

      const result = await repository.list();

      expect(result).toEqual([]);
    });

    it("should propagate non-FileStorageError exceptions", async () => {
      const unexpectedError = new Error("Unexpected error");
      mockFileStorage.readJsonFile.mockRejectedValue(unexpectedError);

      await expect(repository.list()).rejects.toThrow("Unexpected error");
    });
  });

  describe("Constructor with custom config file path", () => {
    it("should use custom file path when provided", async () => {
      const customPath = "/custom/path/llm_config.json";
      const customRepository = new LlmConfigRepository(
        mockFileStorage,
        mockSecureStorage,
        customPath,
      );
      mockFileStorage.readJsonFile.mockResolvedValue([]);

      await customRepository.list();

      expect(mockFileStorage.readJsonFile).toHaveBeenCalledWith(customPath);
    });

    it("should use default file path when none provided", async () => {
      mockFileStorage.readJsonFile.mockResolvedValue([]);

      await repository.list();

      expect(mockFileStorage.readJsonFile).toHaveBeenCalledWith(
        "llm_config.json",
      );
    });
  });
});
