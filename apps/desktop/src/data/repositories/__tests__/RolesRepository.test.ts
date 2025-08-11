/**
 * Unit tests for RolesRepository.
 *
 * Tests the repository implementation for roles data persistence,
 * including file operations, validation, error handling, and edge cases.
 *
 * @module data/repositories/__tests__/RolesRepository.test
 */

import { RolesRepository } from "../RolesRepository";
import {
  PersistedRolesSettingsData,
  FileStorageService,
  FileStorageError,
} from "@fishbowl-ai/shared";

// Mock FileStorageService
jest.mock("@fishbowl-ai/shared", () => ({
  ...jest.requireActual("@fishbowl-ai/shared"),
  FileStorageService: jest.fn(),
  createLoggerSync: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  })),
}));

// Mock fs.promises for resetRoles
jest.mock("fs", () => ({
  promises: {
    unlink: jest.fn(),
  },
}));

const MockedFileStorageService = FileStorageService as jest.MockedClass<
  typeof FileStorageService
>;
const mockFs = require("fs").promises;

describe("RolesRepository", () => {
  let repository: RolesRepository;
  let mockFileStorageService: jest.Mocked<FileStorageService>;

  const testDataPath = "/test/data";
  const expectedFilePath = "/test/data/roles.json";

  // Sample test data
  const mockRolesData: PersistedRolesSettingsData = {
    schemaVersion: "1.0.0",
    roles: [
      {
        id: "test-role-1",
        name: "Test Role 1",
        description: "A test role for unit testing",
        systemPrompt: "You are a helpful test assistant",
        createdAt: "2025-01-15T10:30:00.000Z",
        updatedAt: "2025-01-15T10:30:00.000Z",
      },
      {
        id: "test-role-2",
        name: "Test Role 2",
        description: "",
        systemPrompt: "",
        createdAt: null,
        updatedAt: null,
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
    } as any;

    MockedFileStorageService.mockImplementation(() => mockFileStorageService);

    repository = new RolesRepository(testDataPath);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Constructor", () => {
    it("should create repository with correct file path", () => {
      expect(repository).toBeInstanceOf(RolesRepository);
      expect(MockedFileStorageService).toHaveBeenCalledTimes(1);
    });

    it("should construct file path correctly", () => {
      const customPath = "/custom/path";
      const customRepository = new RolesRepository(customPath);
      expect(customRepository).toBeInstanceOf(RolesRepository);
    });
  });

  describe("loadRoles", () => {
    it("should load roles successfully with valid data", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue(mockRolesData);

      const result = await repository.loadRoles();

      expect(result).toEqual(mockRolesData);
      expect(mockFileStorageService.readJsonFile).toHaveBeenCalledTimes(1);
      expect(mockFileStorageService.readJsonFile).toHaveBeenCalledWith(
        expectedFilePath,
      );
    });

    it("should return null when file does not exist", async () => {
      const fileNotFoundError = new (class extends FileStorageError {
        constructor() {
          super("File not found", "read", "roles.json");
        }
      })();
      mockFileStorageService.readJsonFile.mockRejectedValue(fileNotFoundError);

      const result = await repository.loadRoles();

      expect(result).toBeNull();
      expect(mockFileStorageService.readJsonFile).toHaveBeenCalledWith(
        expectedFilePath,
      );
    });

    it("should throw error for file system errors other than file not found", async () => {
      const permissionError = new (class extends FileStorageError {
        constructor() {
          super("Permission denied", "write", "roles.json");
        }
      })();
      mockFileStorageService.readJsonFile.mockRejectedValue(permissionError);

      await expect(repository.loadRoles()).rejects.toThrow(
        "Failed to load roles: Permission denied",
      );
    });

    it("should validate roles data and throw error for invalid structure", async () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: "invalid-roles", // Should be array, not string
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };
      mockFileStorageService.readJsonFile.mockResolvedValue(invalidData);

      await expect(repository.loadRoles()).rejects.toThrow(
        "Roles validation failed",
      );
    });

    it("should throw error for array input", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue([]);

      await expect(repository.loadRoles()).rejects.toThrow(
        "Roles data must be an object",
      );
    });

    it("should throw error for null input", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue(null);

      await expect(repository.loadRoles()).rejects.toThrow(
        "Roles data must be an object",
      );
    });

    it("should throw error for primitive input", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue("invalid");

      await expect(repository.loadRoles()).rejects.toThrow(
        "Roles data must be an object",
      );
    });

    it("should validate schema and throw error for invalid roles", async () => {
      const invalidRoles = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "", // Invalid - empty ID
            name: "Test",
            description: "Test",
            systemPrompt: "Test",
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };
      mockFileStorageService.readJsonFile.mockResolvedValue(invalidRoles);

      await expect(repository.loadRoles()).rejects.toThrow(
        "Roles validation failed",
      );
    });
  });

  describe("saveRoles", () => {
    it("should save roles successfully with timestamp update", async () => {
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      // Mock Date.now to get predictable timestamp
      const mockDate = new Date("2025-01-15T12:00:00.000Z");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate);

      await repository.saveRoles(mockRolesData);

      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledTimes(1);
      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledWith(
        expectedFilePath,
        {
          ...mockRolesData,
          lastUpdated: mockDate.toISOString(),
        },
      );

      jest.restoreAllMocks();
    });

    it("should validate roles before saving", async () => {
      const invalidRoles = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "", // Invalid - empty ID
            name: "Test",
            description: "Test",
            systemPrompt: "Test",
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      } as PersistedRolesSettingsData;

      await expect(repository.saveRoles(invalidRoles)).rejects.toThrow(
        "Roles validation failed",
      );
      expect(mockFileStorageService.writeJsonFile).not.toHaveBeenCalled();
    });

    it("should throw error when file storage service fails", async () => {
      const storageError = new (class extends FileStorageError {
        constructor() {
          super("Disk full", "write", "roles.json");
        }
      })();
      mockFileStorageService.writeJsonFile.mockRejectedValue(storageError);

      await expect(repository.saveRoles(mockRolesData)).rejects.toThrow(
        "Failed to save roles: Disk full",
      );
    });

    it("should handle permission errors", async () => {
      const permissionError = new Error("EPERM");
      (permissionError as any).code = "EPERM";
      mockFileStorageService.writeJsonFile.mockRejectedValue(permissionError);

      await expect(repository.saveRoles(mockRolesData)).rejects.toThrow(
        "Permission denied during roles save",
      );
    });
  });

  describe("resetRoles", () => {
    it("should delete roles file successfully", async () => {
      mockFs.unlink.mockResolvedValue();

      await repository.resetRoles();

      expect(mockFs.unlink).toHaveBeenCalledTimes(1);
      expect(mockFs.unlink).toHaveBeenCalledWith(expectedFilePath);
    });

    it("should not throw error when file does not exist", async () => {
      const enoentError = new Error("File not found");
      (enoentError as any).code = "ENOENT";
      mockFs.unlink.mockRejectedValue(enoentError);

      await expect(repository.resetRoles()).resolves.not.toThrow();
      expect(mockFs.unlink).toHaveBeenCalledWith(expectedFilePath);
    });

    it("should throw error for permission issues", async () => {
      const permissionError = new Error("Permission denied");
      (permissionError as any).code = "EPERM";
      mockFs.unlink.mockRejectedValue(permissionError);

      await expect(repository.resetRoles()).rejects.toThrow(
        "Permission denied during roles reset",
      );
    });

    it("should throw error for other file system issues", async () => {
      const unknownError = new Error("Unknown error");
      mockFs.unlink.mockRejectedValue(unknownError);

      await expect(repository.resetRoles()).rejects.toThrow(
        "Failed to reset roles: Unknown error",
      );
    });

    it("should handle non-Error exceptions", async () => {
      mockFs.unlink.mockRejectedValue("String error");

      await expect(repository.resetRoles()).rejects.toThrow(
        "Failed to reset roles: Unknown error",
      );
    });
  });

  describe("Error Mapping", () => {
    it("should map ENOENT errors correctly", async () => {
      const enoentError = new Error("File not found");
      (enoentError as any).code = "ENOENT";
      mockFileStorageService.writeJsonFile.mockRejectedValue(enoentError);

      await expect(repository.saveRoles(mockRolesData)).rejects.toThrow(
        "Roles file not found during save",
      );
    });

    it("should map EACCES errors correctly", async () => {
      const eaccesError = new Error("Access denied");
      (eaccesError as any).code = "EACCES";
      mockFileStorageService.writeJsonFile.mockRejectedValue(eaccesError);

      await expect(repository.saveRoles(mockRolesData)).rejects.toThrow(
        "Permission denied during roles save",
      );
    });

    it("should map ENOSPC errors correctly", async () => {
      const enospcError = new Error("No space left");
      (enospcError as any).code = "ENOSPC";
      mockFileStorageService.writeJsonFile.mockRejectedValue(enospcError);

      await expect(repository.saveRoles(mockRolesData)).rejects.toThrow(
        "Insufficient disk space for roles save",
      );
    });

    it("should handle errors without codes", async () => {
      const genericError = new Error("Generic error");
      mockFileStorageService.writeJsonFile.mockRejectedValue(genericError);

      await expect(repository.saveRoles(mockRolesData)).rejects.toThrow(
        "Failed to save roles: Generic error",
      );
    });

    it("should handle non-Error exceptions", async () => {
      mockFileStorageService.writeJsonFile.mockRejectedValue("String error");

      await expect(repository.saveRoles(mockRolesData)).rejects.toThrow(
        "Failed to save roles: Unknown error",
      );
    });
  });

  describe("Validation Edge Cases", () => {
    it("should accept roles with null timestamps", async () => {
      const rolesWithNullTimestamps = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "test-role",
            name: "Test Role",
            description: "Test description",
            systemPrompt: "Test prompt",
            createdAt: null,
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(
        rolesWithNullTimestamps,
      );

      const result = await repository.loadRoles();
      expect(result).toEqual(rolesWithNullTimestamps);
    });

    it("should accept roles with missing timestamps", async () => {
      const rolesWithoutTimestamps = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "test-role",
            name: "Test Role",
            description: "Test description",
            systemPrompt: "Test prompt",
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(
        rolesWithoutTimestamps,
      );

      const result = await repository.loadRoles();
      expect(result).toEqual(rolesWithoutTimestamps);
    });

    it("should accept empty roles array", async () => {
      const emptyRoles = {
        schemaVersion: "1.0.0",
        roles: [],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(emptyRoles);

      const result = await repository.loadRoles();
      expect(result).toEqual(emptyRoles);
    });

    it("should reject roles with invalid schema version", async () => {
      const invalidSchema = {
        schemaVersion: "", // Invalid - empty schema version
        roles: [],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(invalidSchema);

      await expect(repository.loadRoles()).rejects.toThrow(
        "Roles validation failed",
      );
    });

    it("should reject roles with invalid lastUpdated", async () => {
      const invalidLastUpdated = {
        schemaVersion: "1.0.0",
        roles: [],
        lastUpdated: "invalid-date", // Invalid timestamp
      };

      mockFileStorageService.readJsonFile.mockResolvedValue(invalidLastUpdated);

      await expect(repository.loadRoles()).rejects.toThrow(
        "Roles validation failed",
      );
    });
  });
});
