/**
 * Unit tests for LlmModelsRepository.
 *
 * Tests the repository implementation for LLM models data persistence,
 * including file operations, validation, error handling, and edge cases.
 *
 * @module data/repositories/__tests__/LlmModelsRepository.test
 */

import { LlmModelsRepository } from "../LlmModelsRepository";
import {
  PersistedLlmModelsSettingsData,
  FileStorageService,
  FileStorageError,
} from "@fishbowl-ai/shared";

// Mock FileStorageService and createDefaultLlmModelsSettings
jest.mock("@fishbowl-ai/shared", () => ({
  ...jest.requireActual("@fishbowl-ai/shared"),
  FileStorageService: jest.fn(),
  createLoggerSync: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  })),
  createDefaultLlmModelsSettings: jest.fn(),
}));

const MockedFileStorageService = FileStorageService as jest.MockedClass<
  typeof FileStorageService
>;

describe("LlmModelsRepository", () => {
  let repository: LlmModelsRepository;
  let mockFileStorageService: jest.Mocked<FileStorageService>;

  const testDataPath = "/test/data";
  const expectedFilePath = "/test/data/llmModels.json";

  // Sample test data
  const mockLlmModelsData: PersistedLlmModelsSettingsData = {
    schemaVersion: "1.0.0",
    providers: [
      {
        id: "test-provider-1",
        name: "Test Provider 1",
        models: [
          {
            id: "test-model-1",
            name: "Test Model 1",
            contextLength: 8000,
          },
          {
            id: "test-model-2",
            name: "Test Model 2",
            contextLength: 32000,
          },
        ],
      },
      {
        id: "test-provider-2",
        name: "Test Provider 2",
        models: [
          {
            id: "test-model-3",
            name: "Test Model 3",
            contextLength: 128000,
          },
        ],
      },
    ],
    lastUpdated: "2025-01-15T10:30:00.000Z",
  };

  // Mock default LLM models data
  const mockDefaultLlmModelsData: PersistedLlmModelsSettingsData = {
    schemaVersion: "1.0.0",
    providers: [
      {
        id: "openai",
        name: "OpenAI",
        models: [
          {
            id: "gpt-4-turbo",
            name: "GPT-4 Turbo",
            contextLength: 128000,
          },
          {
            id: "gpt-4",
            name: "GPT-4",
            contextLength: 8000,
          },
        ],
      },
      {
        id: "anthropic",
        name: "Anthropic",
        models: [
          {
            id: "claude-3-opus",
            name: "Claude 3 Opus",
            contextLength: 200000,
          },
          {
            id: "claude-3-sonnet",
            name: "Claude 3 Sonnet",
            contextLength: 200000,
          },
        ],
      },
    ],
    lastUpdated: "2025-01-15T10:30:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock FileStorageService
    mockFileStorageService = {
      readJsonFile: jest.fn(),
      writeJsonFile: jest.fn(),
      deleteJsonFile: jest.fn(),
    } as any;

    MockedFileStorageService.mockImplementation(() => mockFileStorageService);

    // Set up default behavior for createDefaultLlmModelsSettings mock
    const mockShared = jest.requireMock("@fishbowl-ai/shared");
    mockShared.createDefaultLlmModelsSettings.mockReturnValue(
      mockDefaultLlmModelsData,
    );

    repository = new LlmModelsRepository(testDataPath);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Constructor", () => {
    it("should create repository with correct file path", () => {
      expect(repository).toBeInstanceOf(LlmModelsRepository);
      expect(MockedFileStorageService).toHaveBeenCalledTimes(1);
    });

    it("should construct file path correctly", () => {
      const customPath = "/custom/path";
      const customRepository = new LlmModelsRepository(customPath);
      expect(customRepository).toBeInstanceOf(LlmModelsRepository);
    });
  });

  describe("loadLlmModels", () => {
    it("should load LLM models successfully with valid data", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue(mockLlmModelsData);

      const result = await repository.loadLlmModels();

      expect(result).toEqual(mockLlmModelsData);
      expect(mockFileStorageService.readJsonFile).toHaveBeenCalledTimes(1);
      expect(mockFileStorageService.readJsonFile).toHaveBeenCalledWith(
        expectedFilePath,
      );
    });

    it("should create and return default LLM models when file does not exist", async () => {
      const fileNotFoundError = new (class extends FileStorageError {
        constructor() {
          super("File not found", "read", "llmModels.json");
        }
      })();
      mockFileStorageService.readJsonFile.mockRejectedValue(fileNotFoundError);
      mockFileStorageService.writeJsonFile.mockResolvedValue(undefined);

      const result = await repository.loadLlmModels();

      expect(result).toEqual(mockDefaultLlmModelsData);
      expect(mockFileStorageService.readJsonFile).toHaveBeenCalledWith(
        expectedFilePath,
      );
      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledWith(
        expectedFilePath,
        expect.objectContaining({
          schemaVersion: "1.0.0",
          providers: expect.any(Array),
        }),
      );
    });

    it("should throw error for file system errors other than file not found", async () => {
      const permissionError = new (class extends FileStorageError {
        constructor() {
          super("Permission denied", "write", "llmModels.json");
        }
      })();
      mockFileStorageService.readJsonFile.mockRejectedValue(permissionError);

      await expect(repository.loadLlmModels()).rejects.toThrow(
        "Failed to load LLM models: Permission denied",
      );
    });

    it("should validate LLM models data and throw error for invalid structure", async () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        providers: "invalid-providers", // Should be array, not string
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };
      mockFileStorageService.readJsonFile.mockResolvedValue(invalidData);

      await expect(repository.loadLlmModels()).rejects.toThrow(
        "LLM models validation failed",
      );
    });

    it("should throw error for array input", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue([]);

      await expect(repository.loadLlmModels()).rejects.toThrow(
        "LLM models data must be an object",
      );
    });

    it("should throw error for null input", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue(null);

      await expect(repository.loadLlmModels()).rejects.toThrow(
        "LLM models data must be an object",
      );
    });

    it("should throw error for primitive input", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue("invalid");

      await expect(repository.loadLlmModels()).rejects.toThrow(
        "LLM models data must be an object",
      );
    });

    it("should validate schema and throw error for invalid providers", async () => {
      const invalidProviders = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "", // Invalid - empty ID
            name: "Test Provider",
            models: [
              {
                id: "test-model",
                name: "Test Model",
                contextLength: 8000,
              },
            ],
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };
      mockFileStorageService.readJsonFile.mockResolvedValue(invalidProviders);

      await expect(repository.loadLlmModels()).rejects.toThrow(
        "LLM models validation failed",
      );
    });

    it("should validate schema and throw error for invalid models", async () => {
      const invalidModels = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "test-provider",
            name: "Test Provider",
            models: [
              {
                id: "test-model",
                name: "", // Invalid - empty name
                contextLength: 8000,
              },
            ],
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };
      mockFileStorageService.readJsonFile.mockResolvedValue(invalidModels);

      await expect(repository.loadLlmModels()).rejects.toThrow(
        "LLM models validation failed",
      );
    });

    it("should validate schema and throw error for invalid context length", async () => {
      const invalidContextLength = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "test-provider",
            name: "Test Provider",
            models: [
              {
                id: "test-model",
                name: "Test Model",
                contextLength: 500, // Invalid - too small
              },
            ],
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };
      mockFileStorageService.readJsonFile.mockResolvedValue(
        invalidContextLength,
      );

      await expect(repository.loadLlmModels()).rejects.toThrow(
        "LLM models validation failed",
      );
    });
  });

  describe("saveLlmModels", () => {
    it("should save LLM models successfully with timestamp update", async () => {
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      // Mock Date.now to get predictable timestamp
      const mockDate = new Date("2025-01-15T12:00:00.000Z");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate);

      await repository.saveLlmModels(mockLlmModelsData);

      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledTimes(1);
      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledWith(
        expectedFilePath,
        {
          ...mockLlmModelsData,
          lastUpdated: mockDate.toISOString(),
        },
      );

      jest.restoreAllMocks();
    });

    it("should validate LLM models before saving", async () => {
      const invalidLlmModels = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "", // Invalid - empty ID
            name: "Test Provider",
            models: [
              {
                id: "test-model",
                name: "Test Model",
                contextLength: 8000,
              },
            ],
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      } as PersistedLlmModelsSettingsData;

      await expect(repository.saveLlmModels(invalidLlmModels)).rejects.toThrow(
        "LLM models validation failed",
      );
      expect(mockFileStorageService.writeJsonFile).not.toHaveBeenCalled();
    });

    it("should throw error when file storage service fails", async () => {
      const storageError = new (class extends FileStorageError {
        constructor() {
          super("Disk full", "write", "llmModels.json");
        }
      })();
      mockFileStorageService.writeJsonFile.mockRejectedValue(storageError);

      await expect(repository.saveLlmModels(mockLlmModelsData)).rejects.toThrow(
        "Failed to save LLM models: Disk full",
      );
    });

    it("should handle permission errors", async () => {
      const permissionError = new Error("EPERM");
      (permissionError as any).code = "EPERM";
      mockFileStorageService.writeJsonFile.mockRejectedValue(permissionError);

      await expect(repository.saveLlmModels(mockLlmModelsData)).rejects.toThrow(
        "Permission denied during LLM models save",
      );
    });
  });

  describe("resetLlmModels", () => {
    it("should reset LLM models by loading and saving defaults", async () => {
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      const mockShared = jest.requireMock("@fishbowl-ai/shared");
      mockShared.createDefaultLlmModelsSettings.mockClear();

      const mockDate = new Date("2025-01-20T15:45:00.000Z");
      jest.spyOn(globalThis, "Date").mockImplementation(() => mockDate);

      await repository.resetLlmModels();

      expect(mockShared.createDefaultLlmModelsSettings).toHaveBeenCalledTimes(
        1,
      );
      expect(mockShared.createDefaultLlmModelsSettings).toHaveBeenCalledWith();

      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledWith(
        expectedFilePath,
        expect.objectContaining({
          schemaVersion: "1.0.0",
          providers: expect.any(Array),
          lastUpdated: "2025-01-20T15:45:00.000Z",
        }),
      );

      jest.restoreAllMocks();
    });

    it("should handle createDefaultLlmModelsSettings throwing error", async () => {
      const mockShared = jest.requireMock("@fishbowl-ai/shared");
      mockShared.createDefaultLlmModelsSettings.mockImplementationOnce(() => {
        throw new Error("Invalid default LLM models configuration");
      });

      await expect(repository.resetLlmModels()).rejects.toThrow(
        "Invalid default LLM models configuration",
      );
    });

    it("should handle save errors during reset", async () => {
      const storageError = new (class extends FileStorageError {
        constructor() {
          super("Disk full", "write", "llmModels.json");
        }
      })();
      mockFileStorageService.writeJsonFile.mockRejectedValue(storageError);

      await expect(repository.resetLlmModels()).rejects.toThrow(
        "Failed to reset LLM models: Failed to save LLM models: Disk full",
      );
    });

    it("should preserve error stack traces from createDefaultLlmModelsSettings", async () => {
      const originalError = new Error("Schema validation failed");
      const mockShared = jest.requireMock("@fishbowl-ai/shared");
      mockShared.createDefaultLlmModelsSettings.mockImplementationOnce(() => {
        throw originalError;
      });

      await expect(repository.resetLlmModels()).rejects.toThrow(
        "Failed to reset LLM models: Schema validation failed",
      );
    });

    it("should log info level messages during reset", async () => {
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      const mockLogger = (repository as any).logger;
      mockLogger.info.mockClear();

      await repository.resetLlmModels();

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Resetting LLM models to defaults",
        expect.objectContaining({
          filePath: expectedFilePath,
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        "LLM models reset to defaults successfully",
      );
    });
  });

  describe("Error Mapping", () => {
    it("should map ENOENT errors correctly", async () => {
      const enoentError = new Error("File not found");
      (enoentError as any).code = "ENOENT";
      mockFileStorageService.writeJsonFile.mockRejectedValue(enoentError);

      await expect(repository.saveLlmModels(mockLlmModelsData)).rejects.toThrow(
        "LLM models file not found during save",
      );
    });

    it("should map EACCES errors correctly", async () => {
      const eaccesError = new Error("Access denied");
      (eaccesError as any).code = "EACCES";
      mockFileStorageService.writeJsonFile.mockRejectedValue(eaccesError);

      await expect(repository.saveLlmModels(mockLlmModelsData)).rejects.toThrow(
        "Permission denied during LLM models save",
      );
    });

    it("should map ENOSPC errors correctly", async () => {
      const enospcError = new Error("No space left");
      (enospcError as any).code = "ENOSPC";
      mockFileStorageService.writeJsonFile.mockRejectedValue(enospcError);

      await expect(repository.saveLlmModels(mockLlmModelsData)).rejects.toThrow(
        "Insufficient disk space for LLM models save",
      );
    });

    it("should handle errors without codes", async () => {
      const genericError = new Error("Generic error");
      mockFileStorageService.writeJsonFile.mockRejectedValue(genericError);

      await expect(repository.saveLlmModels(mockLlmModelsData)).rejects.toThrow(
        "Failed to save LLM models: Generic error",
      );
    });

    it("should handle non-Error exceptions", async () => {
      mockFileStorageService.writeJsonFile.mockRejectedValue("String error");

      await expect(repository.saveLlmModels(mockLlmModelsData)).rejects.toThrow(
        "Failed to save LLM models: Unknown error",
      );
    });
  });

  describe("Validation Edge Cases", () => {
    it("should accept empty providers array", async () => {
      const emptyProviders = {
        schemaVersion: "1.0.0",
        providers: [],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(emptyProviders);

      await expect(repository.loadLlmModels()).rejects.toThrow(
        "LLM models validation failed",
      );
    });

    it("should accept models with additional properties (passthrough)", async () => {
      const modelsWithExtraProps = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "test-provider",
            name: "Test Provider",
            description: "Extra property",
            models: [
              {
                id: "test-model",
                name: "Test Model",
                contextLength: 8000,
                extraProp: "allowed",
              },
            ],
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
        extraField: "also allowed",
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(
        modelsWithExtraProps,
      );

      const result = await repository.loadLlmModels();
      expect(result).toEqual(modelsWithExtraProps);
    });

    it("should reject providers with invalid schema version", async () => {
      const invalidSchema = {
        schemaVersion: "", // Invalid - empty schema version
        providers: [
          {
            id: "test-provider",
            name: "Test Provider",
            models: [
              {
                id: "test-model",
                name: "Test Model",
                contextLength: 8000,
              },
            ],
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(invalidSchema);

      await expect(repository.loadLlmModels()).rejects.toThrow(
        "LLM models validation failed",
      );
    });

    it("should reject providers with invalid lastUpdated", async () => {
      const invalidLastUpdated = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "test-provider",
            name: "Test Provider",
            models: [
              {
                id: "test-model",
                name: "Test Model",
                contextLength: 8000,
              },
            ],
          },
        ],
        lastUpdated: "invalid-date", // Invalid timestamp
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(invalidLastUpdated);

      await expect(repository.loadLlmModels()).rejects.toThrow(
        "LLM models validation failed",
      );
    });

    it("should reject models with context length too high", async () => {
      const contextTooHigh = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "test-provider",
            name: "Test Provider",
            models: [
              {
                id: "test-model",
                name: "Test Model",
                contextLength: 20000000, // Too high
              },
            ],
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(contextTooHigh);

      await expect(repository.loadLlmModels()).rejects.toThrow(
        "LLM models validation failed",
      );
    });

    it("should reject providers with too many models", async () => {
      const tooManyModels = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "test-provider",
            name: "Test Provider",
            models: Array(60).fill({
              id: "test-model",
              name: "Test Model",
              contextLength: 8000,
            }), // Too many models (max is 50)
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(tooManyModels);

      await expect(repository.loadLlmModels()).rejects.toThrow(
        "LLM models validation failed",
      );
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle concurrent load operations", async () => {
      mockFileStorageService.readJsonFile.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockLlmModelsData), 10),
          ),
      );

      const results = await Promise.all([
        repository.loadLlmModels(),
        repository.loadLlmModels(),
        repository.loadLlmModels(),
      ]);

      expect(results[0]).toEqual(mockLlmModelsData);
      expect(results[1]).toEqual(mockLlmModelsData);
      expect(results[2]).toEqual(mockLlmModelsData);
      expect(mockFileStorageService.readJsonFile).toHaveBeenCalledTimes(3);
    });

    it("should handle concurrent save operations", async () => {
      mockFileStorageService.writeJsonFile.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10)),
      );

      await Promise.all([
        repository.saveLlmModels(mockLlmModelsData),
        repository.saveLlmModels(mockLlmModelsData),
        repository.saveLlmModels(mockLlmModelsData),
      ]);

      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledTimes(3);
    });

    it("should handle concurrent reset operations", async () => {
      mockFileStorageService.writeJsonFile.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10)),
      );

      const mockShared = jest.requireMock("@fishbowl-ai/shared");
      mockShared.createDefaultLlmModelsSettings.mockClear();

      await Promise.all([
        repository.resetLlmModels(),
        repository.resetLlmModels(),
        repository.resetLlmModels(),
      ]);

      expect(mockShared.createDefaultLlmModelsSettings).toHaveBeenCalledTimes(
        3,
      );
      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledTimes(3);
    });
  });
});
