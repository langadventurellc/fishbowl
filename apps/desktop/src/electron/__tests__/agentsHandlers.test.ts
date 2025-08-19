import { ipcMain } from "electron";
import { setupAgentsHandlers } from "../agentsHandlers";
import {
  AGENTS_CHANNELS,
  type AgentsLoadResponse,
} from "../../shared/ipc/index";
import { serializeError } from "../utils/errorSerialization";
import { agentsRepositoryManager } from "../../data/repositories/agentsRepositoryManager";
import { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";

// Mock electron
jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

// Mock agentsRepositoryManager module
jest.mock("../../data/repositories/agentsRepositoryManager", () => ({
  agentsRepositoryManager: {
    get: jest.fn(),
  },
}));

// Mock errorSerialization
jest.mock("../utils/errorSerialization", () => ({
  serializeError: jest.fn((error) => ({
    message: error.message,
    code: "TEST_ERROR",
  })),
}));

describe("agentsHandlers", () => {
  let mockRepository: {
    loadAgents: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock repository
    mockRepository = {
      loadAgents: jest.fn(),
    };

    (agentsRepositoryManager.get as jest.Mock).mockReturnValue(mockRepository);
  });

  describe("setupAgentsHandlers", () => {
    it("should register load handler", () => {
      setupAgentsHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        AGENTS_CHANNELS.LOAD,
        expect.any(Function),
      );
    });
  });

  describe("LOAD handler", () => {
    it("should load agents from repository", async () => {
      const mockAgents: PersistedAgentsSettingsData = {
        schemaVersion: "1.0.0",
        agents: [
          {
            id: "agent-1",
            name: "Test Agent",
            model: "claude-3-sonnet",
            role: "test-role",
            personality: "test-personality",
            temperature: 0.7,
            maxTokens: 1000,
            topP: 0.9,
            systemPrompt: "Test system prompt",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z",
          },
        ],
        lastUpdated: "2025-01-01T12:00:00.000Z",
      };

      mockRepository.loadAgents.mockResolvedValue(mockAgents);

      setupAgentsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === AGENTS_CHANNELS.LOAD,
      )[1];

      const result: AgentsLoadResponse = await handler();

      expect(mockRepository.loadAgents).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockAgents });
    });

    it("should return default agents when agents file doesn't exist", async () => {
      const mockDefaultAgents: PersistedAgentsSettingsData = {
        schemaVersion: "1.0.0",
        agents: [
          {
            id: "default-agent",
            name: "Default Agent",
            model: "claude-3-haiku",
            role: "default-role",
            personality: "default-personality",
            temperature: 0.7,
            maxTokens: 1000,
            topP: 1.0,
            systemPrompt: "Default system prompt",
            createdAt: null,
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      mockRepository.loadAgents.mockResolvedValue(mockDefaultAgents);

      setupAgentsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === AGENTS_CHANNELS.LOAD,
      )[1];

      const result: AgentsLoadResponse = await handler();

      expect(mockRepository.loadAgents).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockDefaultAgents });
    });

    it("should handle errors when loading fails", async () => {
      const error = new Error("Failed to load agents");
      mockRepository.loadAgents.mockRejectedValue(error);

      setupAgentsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === AGENTS_CHANNELS.LOAD,
      )[1];

      const result: AgentsLoadResponse = await handler();

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });

    it("should handle repository not initialized error", async () => {
      const error = new Error("Agents repository not initialized");
      (agentsRepositoryManager.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      setupAgentsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === AGENTS_CHANNELS.LOAD,
      )[1];

      const result: AgentsLoadResponse = await handler();

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
    });
  });
});
