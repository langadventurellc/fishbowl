import { ipcMain } from "electron";
import { setupAgentsHandlers } from "../agentsHandlers";
import {
  AGENTS_CHANNELS,
  type AgentsLoadResponse,
  type AgentsSaveRequest,
  type AgentsSaveResponse,
  type AgentsResetResponse,
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
    saveAgents: jest.Mock;
    resetAgents: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock repository
    mockRepository = {
      loadAgents: jest.fn(),
      saveAgents: jest.fn(),
      resetAgents: jest.fn(),
    };

    (agentsRepositoryManager.get as jest.Mock).mockReturnValue(mockRepository);
  });

  describe("setupAgentsHandlers", () => {
    it("should register load, save, and reset handlers", () => {
      setupAgentsHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        AGENTS_CHANNELS.LOAD,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        AGENTS_CHANNELS.SAVE,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        AGENTS_CHANNELS.RESET,
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
        defaults: {
          temperature: 1.0,
          maxTokens: 1000,
          topP: 0.95,
        },
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
        defaults: {
          temperature: 1.0,
          maxTokens: 1000,
          topP: 0.95,
        },
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

  describe("SAVE handler", () => {
    it("should save agents to repository", async () => {
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
        defaults: {
          temperature: 1.0,
          maxTokens: 1000,
          topP: 0.95,
        },
        lastUpdated: "2025-01-01T12:00:00.000Z",
      };

      const saveRequest: AgentsSaveRequest = { agents: mockAgents };
      mockRepository.saveAgents.mockResolvedValue(undefined);

      setupAgentsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === AGENTS_CHANNELS.SAVE,
      )[1];

      const result: AgentsSaveResponse = await handler(null, saveRequest);

      expect(mockRepository.saveAgents).toHaveBeenCalledWith(mockAgents);
      expect(result).toEqual({ success: true });
    });

    it("should handle save validation errors", async () => {
      const invalidAgents = { invalid: "data" };
      const saveRequest: AgentsSaveRequest = { agents: invalidAgents as any };
      const error = new Error("Invalid agents data");
      mockRepository.saveAgents.mockRejectedValue(error);

      setupAgentsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === AGENTS_CHANNELS.SAVE,
      )[1];

      const result: AgentsSaveResponse = await handler(null, saveRequest);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });

    it("should handle repository save failures", async () => {
      const mockAgents: PersistedAgentsSettingsData = {
        schemaVersion: "1.0.0",
        agents: [],
        defaults: {
          temperature: 1.0,
          maxTokens: 1000,
          topP: 0.95,
        },
        lastUpdated: "2025-01-01T12:00:00.000Z",
      };

      const saveRequest: AgentsSaveRequest = { agents: mockAgents };
      const error = new Error("Failed to save agents");
      mockRepository.saveAgents.mockRejectedValue(error);

      setupAgentsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === AGENTS_CHANNELS.SAVE,
      )[1];

      const result: AgentsSaveResponse = await handler(null, saveRequest);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
    });

    it("should handle repository not initialized error during save", async () => {
      const mockAgents: PersistedAgentsSettingsData = {
        schemaVersion: "1.0.0",
        agents: [],
        defaults: {
          temperature: 1.0,
          maxTokens: 1000,
          topP: 0.95,
        },
        lastUpdated: "2025-01-01T12:00:00.000Z",
      };

      const saveRequest: AgentsSaveRequest = { agents: mockAgents };
      const error = new Error("Agents repository not initialized");
      (agentsRepositoryManager.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      setupAgentsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === AGENTS_CHANNELS.SAVE,
      )[1];

      const result: AgentsSaveResponse = await handler(null, saveRequest);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
    });
  });

  describe("RESET handler", () => {
    it("should reset agents and return undefined", async () => {
      mockRepository.resetAgents.mockResolvedValue(undefined);

      setupAgentsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === AGENTS_CHANNELS.RESET,
      )[1];

      const result: AgentsResetResponse = await handler();

      expect(mockRepository.resetAgents).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: undefined });
    });

    it("should handle errors during reset operation", async () => {
      const error = new Error("Failed to reset agents");
      mockRepository.resetAgents.mockRejectedValue(error);

      setupAgentsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === AGENTS_CHANNELS.RESET,
      )[1];

      const result: AgentsResetResponse = await handler();

      expect(mockRepository.resetAgents).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });

    it("should handle repository not initialized error during reset", async () => {
      const error = new Error("Agents repository not initialized");
      (agentsRepositoryManager.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      setupAgentsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === AGENTS_CHANNELS.RESET,
      )[1];

      const result: AgentsResetResponse = await handler();

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
    });
  });
});
