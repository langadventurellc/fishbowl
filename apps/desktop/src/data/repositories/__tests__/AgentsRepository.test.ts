import { AgentsRepository } from "../AgentsRepository";
import { FileStorageService, FileStorageError } from "@fishbowl-ai/shared";
import { NodeFileSystemBridge } from "../../../main/services/NodeFileSystemBridge";
import { NodeCryptoUtils } from "../../../main/utils/NodeCryptoUtils";
import { NodePathUtils } from "../../../main/utils/NodePathUtils";

// Helper to create mock FileStorageError
const createMockFileStorageError = (
  message: string,
  operation: string,
): FileStorageError => {
  const error = new Error(message) as any;
  error.operation = operation;
  error.name = "FileStorageError";
  Object.setPrototypeOf(error, FileStorageError.prototype);
  return error;
};

jest.mock("@fishbowl-ai/shared", () => {
  const actual = jest.requireActual("@fishbowl-ai/shared");
  return {
    ...actual,
    FileStorageService: jest.fn(),
    createLoggerSync: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
    createDefaultAgentsSettings: jest.fn().mockReturnValue({
      schemaVersion: "1.0.0",
      agents: [],
      lastUpdated: "2025-01-10T10:00:00.000Z",
    }),
    persistedAgentsSettingsSchema: {
      safeParse: jest.fn(),
    },
  };
});

jest.mock("../../../main/services/NodeFileSystemBridge");
jest.mock("../../../main/utils/NodeCryptoUtils");
jest.mock("../../../main/utils/NodePathUtils");

describe("AgentsRepository", () => {
  let repository: AgentsRepository;
  let mockFileStorageService: jest.Mocked<FileStorageService>;

  const mockValidAgentsData = {
    schemaVersion: "1.0.0",
    agents: [
      {
        id: "agent-1",
        name: "Test Agent",
        model: "Claude 3.5 Sonnet",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
        systemPrompt: "You are a helpful assistant",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-10T09:00:00.000Z",
      },
    ],
    lastUpdated: "2025-01-10T10:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockFileStorageService = {
      readJsonFile: jest.fn(),
      writeJsonFile: jest.fn(),
    } as any;

    (FileStorageService as jest.Mock).mockImplementation(
      () => mockFileStorageService,
    );

    const { persistedAgentsSettingsSchema } = require("@fishbowl-ai/shared");
    persistedAgentsSettingsSchema.safeParse.mockImplementation(
      (input: any) => ({
        success: true,
        data: input,
      }),
    );

    repository = new AgentsRepository("/test/data");
  });

  describe("loadAgents", () => {
    it("should load agents from file successfully", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue(
        mockValidAgentsData,
      );

      const result = await repository.loadAgents();

      expect(mockFileStorageService.readJsonFile).toHaveBeenCalledWith(
        "/test/data/agents.json",
      );
      expect(result).toEqual(mockValidAgentsData);
    });

    it("should create default agents when file not found", async () => {
      const fileNotFoundError = createMockFileStorageError(
        "File not found",
        "read",
      );
      mockFileStorageService.readJsonFile.mockRejectedValue(fileNotFoundError);
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      const result = await repository.loadAgents();

      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledWith(
        "/test/data/agents.json",
        expect.objectContaining({
          schemaVersion: "1.0.0",
          agents: [],
          lastUpdated: expect.any(String),
        }),
      );
      expect(result.agents).toEqual([]);
      expect(result.schemaVersion).toEqual("1.0.0");
    });

    it("should return defaults if file not found and save fails", async () => {
      const fileNotFoundError = createMockFileStorageError(
        "File not found",
        "read",
      );
      mockFileStorageService.readJsonFile.mockRejectedValue(fileNotFoundError);
      mockFileStorageService.writeJsonFile.mockRejectedValue(
        new Error("Save failed"),
      );

      const result = await repository.loadAgents();

      expect(result.agents).toEqual([]);
      expect(result.schemaVersion).toEqual("1.0.0");
    });

    it("should handle invalid JSON with fallback to defaults", async () => {
      const invalidJsonError = new Error("Invalid JSON");
      mockFileStorageService.readJsonFile.mockRejectedValue(invalidJsonError);

      await expect(repository.loadAgents()).rejects.toThrow(
        "Failed to load agents: Invalid JSON",
      );
    });

    it("should validate loaded data against schema", async () => {
      const { persistedAgentsSettingsSchema } = require("@fishbowl-ai/shared");
      persistedAgentsSettingsSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          issues: [{ path: ["agents"], message: "Required" }],
        },
      });

      mockFileStorageService.readJsonFile.mockResolvedValue({
        invalid: "data",
      });

      await expect(repository.loadAgents()).rejects.toThrow(
        "Agents validation failed: agents: Required",
      );
    });
  });

  describe("saveAgents", () => {
    it("should save agents to file successfully", async () => {
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      await repository.saveAgents(mockValidAgentsData);

      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledWith(
        "/test/data/agents.json",
        expect.objectContaining({
          ...mockValidAgentsData,
          lastUpdated: expect.any(String),
        }),
      );
    });

    it("should validate agents before saving", async () => {
      const { persistedAgentsSettingsSchema } = require("@fishbowl-ai/shared");
      persistedAgentsSettingsSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          issues: [{ path: ["agents", "0", "name"], message: "Required" }],
        },
      });

      await expect(repository.saveAgents(mockValidAgentsData)).rejects.toThrow(
        "Agents validation failed: agents.0.name: Required",
      );
    });

    it("should handle file write errors", async () => {
      const writeError = createMockFileStorageError("Write failed", "write");
      mockFileStorageService.writeJsonFile.mockRejectedValue(writeError);

      await expect(repository.saveAgents(mockValidAgentsData)).rejects.toThrow(
        "Failed to save agents",
      );
    });

    it("should update lastUpdated timestamp when saving", async () => {
      const beforeSave = Date.now();
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      await repository.saveAgents(mockValidAgentsData);

      const writeCall = mockFileStorageService.writeJsonFile.mock.calls[0];
      const savedData = writeCall?.[1] as any;
      const afterSave = Date.now();

      expect(savedData).toBeDefined();
      const savedTimestamp = new Date(savedData.lastUpdated).getTime();
      expect(savedTimestamp).toBeGreaterThanOrEqual(beforeSave);
      expect(savedTimestamp).toBeLessThanOrEqual(afterSave);
    });
  });

  describe("resetAgents", () => {
    it("should reset agents to defaults and save them", async () => {
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      await repository.resetAgents();

      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledWith(
        "/test/data/agents.json",
        expect.objectContaining({
          schemaVersion: "1.0.0",
          agents: [],
          lastUpdated: expect.any(String),
        }),
      );
    });

    it("should handle reset failure", async () => {
      const { createDefaultAgentsSettings } = require("@fishbowl-ai/shared");
      createDefaultAgentsSettings.mockImplementation(() => {
        throw new Error("Failed to create defaults");
      });

      await expect(repository.resetAgents()).rejects.toThrow(
        "Failed to reset agents",
      );
    });
  });

  describe("error handling", () => {
    it("should map file system errors appropriately", async () => {
      const permissionError = new Error("Permission denied") as any;
      permissionError.code = "EPERM";
      mockFileStorageService.readJsonFile.mockRejectedValue(permissionError);

      await expect(repository.loadAgents()).rejects.toThrow(
        "Permission denied during agents load",
      );
    });

    it("should map disk space errors appropriately", async () => {
      const diskSpaceError = new Error("No space left") as any;
      diskSpaceError.code = "ENOSPC";
      mockFileStorageService.writeJsonFile.mockRejectedValue(diskSpaceError);

      await expect(repository.saveAgents(mockValidAgentsData)).rejects.toThrow(
        "Insufficient disk space for agents save",
      );
    });

    it("should handle unknown errors gracefully", async () => {
      const unknownError = "Unknown error";
      mockFileStorageService.readJsonFile.mockRejectedValue(unknownError);

      await expect(repository.loadAgents()).rejects.toThrow(
        "Failed to load agents: Unknown error",
      );
    });
  });

  describe("validation", () => {
    it("should reject non-object data", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue(
        "invalid string data",
      );

      await expect(repository.loadAgents()).rejects.toThrow(
        "Agents data must be an object",
      );
    });

    it("should reject array data", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue([]);

      await expect(repository.loadAgents()).rejects.toThrow(
        "Agents data must be an object",
      );
    });

    it("should reject null data", async () => {
      mockFileStorageService.readJsonFile.mockResolvedValue(null);

      await expect(repository.loadAgents()).rejects.toThrow(
        "Agents data must be an object",
      );
    });
  });

  describe("file path construction", () => {
    it("should construct correct file path", () => {
      new AgentsRepository("/custom/path");
      expect(NodeFileSystemBridge).toHaveBeenCalled();
      expect(NodeCryptoUtils).toHaveBeenCalled();
      expect(NodePathUtils).toHaveBeenCalled();
      expect(FileStorageService).toHaveBeenCalled();
    });
  });
});
