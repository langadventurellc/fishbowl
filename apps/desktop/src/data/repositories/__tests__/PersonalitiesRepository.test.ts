/**
 * Unit tests for PersonalitiesRepository.
 *
 * Tests the repository implementation for personalities data persistence,
 * including file operations, validation, error handling, and edge cases.
 *
 * @module data/repositories/__tests__/PersonalitiesRepository.test
 */

import { PersonalitiesRepository } from "../PersonalitiesRepository";
import {
  PersistedPersonalitiesSettingsData,
  FileStorageService,
  FileStorageError,
} from "@fishbowl-ai/shared";

// Mock FileStorageService and createDefaultPersonalitiesSettings
jest.mock("@fishbowl-ai/shared", () => ({
  ...jest.requireActual("@fishbowl-ai/shared"),
  FileStorageService: jest.fn(),
  createLoggerSync: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  })),
  createDefaultPersonalitiesSettings: jest.fn(),
}));

const MockedFileStorageService = FileStorageService as jest.MockedClass<
  typeof FileStorageService
>;

describe("PersonalitiesRepository", () => {
  let repository: PersonalitiesRepository;
  let mockFileStorageService: jest.Mocked<FileStorageService>;

  const testDataPath = "/test/data";
  const expectedFilePath = "/test/data/personalities.json";

  // Sample test data
  const mockPersonalitiesData: PersistedPersonalitiesSettingsData = {
    schemaVersion: "1.0.0",
    personalities: [
      {
        id: "test-personality-1",
        name: "Test Personality 1",
        bigFive: {
          openness: 75,
          conscientiousness: 80,
          extraversion: 60,
          agreeableness: 85,
          neuroticism: 25,
        },
        behaviors: {
          analytical: 80,
          creative: 75,
          supportive: 90,
          detail_oriented: 85,
        },
        customInstructions:
          "You are a helpful test assistant with a specific personality",
        createdAt: "2025-01-15T10:30:00.000Z",
        updatedAt: "2025-01-15T10:30:00.000Z",
      },
      {
        id: "test-personality-2",
        name: "Test Personality 2",
        bigFive: {
          openness: 50,
          conscientiousness: 90,
          extraversion: 30,
          agreeableness: 70,
          neuroticism: 15,
        },
        behaviors: {
          focused: 95,
          methodical: 90,
          precise: 85,
        },
        customInstructions:
          "You are a focused assistant specialized in testing",
        createdAt: null,
        updatedAt: null,
      },
    ],
    lastUpdated: "2025-01-15T10:30:00.000Z",
  };

  // Mock default personalities data
  const mockDefaultPersonalitiesData: PersistedPersonalitiesSettingsData = {
    schemaVersion: "1.0.0",
    personalities: [
      {
        id: "default-personality-1",
        name: "Creative Writer",
        bigFive: {
          openness: 95,
          conscientiousness: 60,
          extraversion: 70,
          agreeableness: 80,
          neuroticism: 20,
        },
        behaviors: {
          creative: 95,
          imaginative: 90,
          expressive: 85,
          storytelling: 95,
        },
        customInstructions:
          "You are a creative writing assistant focused on storytelling and imagination",
        createdAt: "2025-01-15T10:30:00.000Z",
        updatedAt: "2025-01-15T10:30:00.000Z",
      },
      {
        id: "default-personality-2",
        name: "Data Analyst",
        bigFive: {
          openness: 70,
          conscientiousness: 95,
          extraversion: 40,
          agreeableness: 60,
          neuroticism: 10,
        },
        behaviors: {
          analytical: 95,
          methodical: 90,
          detail_oriented: 95,
          logical: 90,
        },
        customInstructions:
          "You are a data analysis expert focused on insights and patterns",
        createdAt: "2025-01-15T10:30:00.000Z",
        updatedAt: "2025-01-15T10:30:00.000Z",
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

    // Set up default behavior for createDefaultPersonalitiesSettings mock
    const mockShared = jest.requireMock("@fishbowl-ai/shared");
    mockShared.createDefaultPersonalitiesSettings.mockReturnValue(
      mockDefaultPersonalitiesData,
    );

    repository = new PersonalitiesRepository(testDataPath);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Constructor", () => {
    it("should create repository with correct file path", () => {
      expect(repository).toBeInstanceOf(PersonalitiesRepository);
      expect(MockedFileStorageService).toHaveBeenCalledTimes(1);
    });

    it("should construct file path correctly", () => {
      const customPath = "/custom/path";
      const customRepository = new PersonalitiesRepository(customPath);
      expect(customRepository).toBeInstanceOf(PersonalitiesRepository);
    });
  });

  describe("loadPersonalities", () => {
    it("should load personalities successfully with valid data", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue(
        mockPersonalitiesData,
      );

      const result = await repository.loadPersonalities();

      expect(result).toEqual(mockPersonalitiesData);
      expect(mockFileStorageService.readJsonFile).toHaveBeenCalledTimes(1);
      expect(mockFileStorageService.readJsonFile).toHaveBeenCalledWith(
        expectedFilePath,
      );
    });

    it("should return null when file does not exist", async () => {
      const fileNotFoundError = new (class extends FileStorageError {
        constructor() {
          super("File not found", "read", "personalities.json");
        }
      })();
      mockFileStorageService.readJsonFile.mockRejectedValue(fileNotFoundError);

      const result = await repository.loadPersonalities();

      expect(result).toBeNull();
      expect(mockFileStorageService.readJsonFile).toHaveBeenCalledWith(
        expectedFilePath,
      );
    });

    it("should throw error for file system errors other than file not found", async () => {
      const permissionError = new (class extends FileStorageError {
        constructor() {
          super("Permission denied", "write", "personalities.json");
        }
      })();
      mockFileStorageService.readJsonFile.mockRejectedValue(permissionError);

      await expect(repository.loadPersonalities()).rejects.toThrow(
        "Failed to load personalities: Permission denied",
      );
    });

    it("should validate personalities data and throw error for invalid structure", async () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        personalities: "invalid-personalities", // Should be array, not string
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };
      mockFileStorageService.readJsonFile.mockResolvedValue(invalidData);

      await expect(repository.loadPersonalities()).rejects.toThrow(
        "Personalities validation failed",
      );
    });

    it("should throw error for array input", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue([]);

      await expect(repository.loadPersonalities()).rejects.toThrow(
        "Personalities data must be an object",
      );
    });

    it("should throw error for null input", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue(null);

      await expect(repository.loadPersonalities()).rejects.toThrow(
        "Personalities data must be an object",
      );
    });

    it("should throw error for primitive input", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue("invalid");

      await expect(repository.loadPersonalities()).rejects.toThrow(
        "Personalities data must be an object",
      );
    });

    it("should validate schema and throw error for invalid personalities", async () => {
      const invalidPersonalities = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "", // Invalid - empty ID
            name: "Test",
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {
              test: 50,
            },
            customInstructions: "Test",
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };
      mockFileStorageService.readJsonFile.mockResolvedValue(
        invalidPersonalities,
      );

      await expect(repository.loadPersonalities()).rejects.toThrow(
        "Personalities validation failed",
      );
    });
  });

  describe("savePersonalities", () => {
    it("should save personalities successfully with timestamp update", async () => {
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      // Mock Date.now to get predictable timestamp
      const mockDate = new Date("2025-01-15T12:00:00.000Z");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate);

      await repository.savePersonalities(mockPersonalitiesData);

      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledTimes(1);
      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledWith(
        expectedFilePath,
        {
          ...mockPersonalitiesData,
          lastUpdated: mockDate.toISOString(),
        },
      );

      jest.restoreAllMocks();
    });

    it("should validate personalities before saving", async () => {
      const invalidPersonalities = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "", // Invalid - empty ID
            name: "Test",
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {
              test: 50,
            },
            customInstructions: "Test",
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      } as PersistedPersonalitiesSettingsData;

      await expect(
        repository.savePersonalities(invalidPersonalities),
      ).rejects.toThrow("Personalities validation failed");
      expect(mockFileStorageService.writeJsonFile).not.toHaveBeenCalled();
    });

    it("should throw error when file storage service fails", async () => {
      const storageError = new (class extends FileStorageError {
        constructor() {
          super("Disk full", "write", "personalities.json");
        }
      })();
      mockFileStorageService.writeJsonFile.mockRejectedValue(storageError);

      await expect(
        repository.savePersonalities(mockPersonalitiesData),
      ).rejects.toThrow("Failed to save personalities: Disk full");
    });

    it("should handle permission errors", async () => {
      const permissionError = new Error("EPERM");
      (permissionError as any).code = "EPERM";
      mockFileStorageService.writeJsonFile.mockRejectedValue(permissionError);

      await expect(
        repository.savePersonalities(mockPersonalitiesData),
      ).rejects.toThrow("Permission denied during personalities save");
    });
  });

  describe("resetPersonalities", () => {
    it("should reset personalities by loading and saving defaults", async () => {
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      const mockShared = jest.requireMock("@fishbowl-ai/shared");
      mockShared.createDefaultPersonalitiesSettings.mockClear();

      const mockDate = new Date("2025-01-20T15:45:00.000Z");
      jest.spyOn(globalThis, "Date").mockImplementation(() => mockDate);

      await repository.resetPersonalities();

      expect(
        mockShared.createDefaultPersonalitiesSettings,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockShared.createDefaultPersonalitiesSettings,
      ).toHaveBeenCalledWith();

      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledWith(
        expectedFilePath,
        expect.objectContaining({
          schemaVersion: "1.0.0",
          personalities: expect.any(Array),
          lastUpdated: "2025-01-20T15:45:00.000Z",
        }),
      );

      jest.restoreAllMocks();
    });

    it("should handle createDefaultPersonalitiesSettings throwing error", async () => {
      const mockShared = jest.requireMock("@fishbowl-ai/shared");
      mockShared.createDefaultPersonalitiesSettings.mockImplementationOnce(
        () => {
          throw new Error("Invalid default personalities configuration");
        },
      );

      await expect(repository.resetPersonalities()).rejects.toThrow(
        "Invalid default personalities configuration",
      );
    });

    it("should handle save errors during reset", async () => {
      const storageError = new (class extends FileStorageError {
        constructor() {
          super("Disk full", "write", "personalities.json");
        }
      })();
      mockFileStorageService.writeJsonFile.mockRejectedValue(storageError);

      await expect(repository.resetPersonalities()).rejects.toThrow(
        "Failed to reset personalities: Failed to save personalities: Disk full",
      );
    });

    it("should preserve error stack traces from createDefaultPersonalitiesSettings", async () => {
      const originalError = new Error("Schema validation failed");
      const mockShared = jest.requireMock("@fishbowl-ai/shared");
      mockShared.createDefaultPersonalitiesSettings.mockImplementationOnce(
        () => {
          throw originalError;
        },
      );

      await expect(repository.resetPersonalities()).rejects.toThrow(
        "Failed to reset personalities: Schema validation failed",
      );
    });

    it("should log info level messages during reset", async () => {
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      const mockLogger = (repository as any).logger;
      mockLogger.info.mockClear();

      await repository.resetPersonalities();

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Resetting personalities to defaults",
        expect.objectContaining({
          filePath: expectedFilePath,
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Personalities reset to defaults successfully",
      );
    });
  });

  describe("Error Mapping", () => {
    it("should map ENOENT errors correctly", async () => {
      const enoentError = new Error("File not found");
      (enoentError as any).code = "ENOENT";
      mockFileStorageService.writeJsonFile.mockRejectedValue(enoentError);

      await expect(
        repository.savePersonalities(mockPersonalitiesData),
      ).rejects.toThrow("Personalities file not found during save");
    });

    it("should map EACCES errors correctly", async () => {
      const eaccesError = new Error("Access denied");
      (eaccesError as any).code = "EACCES";
      mockFileStorageService.writeJsonFile.mockRejectedValue(eaccesError);

      await expect(
        repository.savePersonalities(mockPersonalitiesData),
      ).rejects.toThrow("Permission denied during personalities save");
    });

    it("should map ENOSPC errors correctly", async () => {
      const enospcError = new Error("No space left");
      (enospcError as any).code = "ENOSPC";
      mockFileStorageService.writeJsonFile.mockRejectedValue(enospcError);

      await expect(
        repository.savePersonalities(mockPersonalitiesData),
      ).rejects.toThrow("Insufficient disk space for personalities save");
    });

    it("should handle errors without codes", async () => {
      const genericError = new Error("Generic error");
      mockFileStorageService.writeJsonFile.mockRejectedValue(genericError);

      await expect(
        repository.savePersonalities(mockPersonalitiesData),
      ).rejects.toThrow("Failed to save personalities: Generic error");
    });

    it("should handle non-Error exceptions", async () => {
      mockFileStorageService.writeJsonFile.mockRejectedValue("String error");

      await expect(
        repository.savePersonalities(mockPersonalitiesData),
      ).rejects.toThrow("Failed to save personalities: Unknown error");
    });
  });

  describe("Validation Edge Cases", () => {
    it("should accept personalities with null timestamps", async () => {
      const personalitiesWithNullTimestamps = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "test-personality",
            name: "Test Personality",
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {
              test: 50,
            },
            customInstructions: "Test custom instructions",
            createdAt: null,
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(
        personalitiesWithNullTimestamps,
      );

      const result = await repository.loadPersonalities();
      expect(result).toEqual(personalitiesWithNullTimestamps);
    });

    it("should accept personalities with missing timestamps", async () => {
      const personalitiesWithoutTimestamps = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "test-personality",
            name: "Test Personality",
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {
              test: 50,
            },
            customInstructions: "Test custom instructions",
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(
        personalitiesWithoutTimestamps,
      );

      const result = await repository.loadPersonalities();
      expect(result).toEqual(personalitiesWithoutTimestamps);
    });

    it("should accept empty personalities array", async () => {
      const emptyPersonalities = {
        schemaVersion: "1.0.0",
        personalities: [],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(emptyPersonalities);

      const result = await repository.loadPersonalities();
      expect(result).toEqual(emptyPersonalities);
    });

    it("should reject personalities with invalid schema version", async () => {
      const invalidSchema = {
        schemaVersion: "", // Invalid - empty schema version
        personalities: [],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(invalidSchema);

      await expect(repository.loadPersonalities()).rejects.toThrow(
        "Personalities validation failed",
      );
    });

    it("should reject personalities with invalid lastUpdated", async () => {
      const invalidLastUpdated = {
        schemaVersion: "1.0.0",
        personalities: [],
        lastUpdated: "invalid-date", // Invalid timestamp
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(invalidLastUpdated);

      await expect(repository.loadPersonalities()).rejects.toThrow(
        "Personalities validation failed",
      );
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle concurrent load operations", async () => {
      mockFileStorageService.readJsonFile.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockPersonalitiesData), 10),
          ),
      );

      const results = await Promise.all([
        repository.loadPersonalities(),
        repository.loadPersonalities(),
        repository.loadPersonalities(),
      ]);

      expect(results[0]).toEqual(mockPersonalitiesData);
      expect(results[1]).toEqual(mockPersonalitiesData);
      expect(results[2]).toEqual(mockPersonalitiesData);
      expect(mockFileStorageService.readJsonFile).toHaveBeenCalledTimes(3);
    });

    it("should handle concurrent save operations", async () => {
      mockFileStorageService.writeJsonFile.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10)),
      );

      await Promise.all([
        repository.savePersonalities(mockPersonalitiesData),
        repository.savePersonalities(mockPersonalitiesData),
        repository.savePersonalities(mockPersonalitiesData),
      ]);

      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledTimes(3);
    });

    it("should handle concurrent reset operations", async () => {
      mockFileStorageService.writeJsonFile.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10)),
      );

      const mockShared = jest.requireMock("@fishbowl-ai/shared");
      mockShared.createDefaultPersonalitiesSettings.mockClear();

      await Promise.all([
        repository.resetPersonalities(),
        repository.resetPersonalities(),
        repository.resetPersonalities(),
      ]);

      expect(
        mockShared.createDefaultPersonalitiesSettings,
      ).toHaveBeenCalledTimes(3);
      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledTimes(3);
    });
  });
});
