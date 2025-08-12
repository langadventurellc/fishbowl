import { ipcMain } from "electron";
import { setupRolesHandlers } from "../rolesHandlers";
import {
  ROLES_CHANNELS,
  type RolesLoadResponse,
  type RolesSaveRequest,
  type RolesSaveResponse,
  type RolesResetResponse,
} from "../../shared/ipc/index";
import { serializeError } from "../utils/errorSerialization";
import { rolesRepositoryManager } from "../../data/repositories/rolesRepositoryManager";
import { PersistedRolesSettingsData } from "@fishbowl-ai/shared";

// Mock electron
jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

// Mock rolesRepositoryManager module
jest.mock("../../data/repositories/rolesRepositoryManager", () => ({
  rolesRepositoryManager: {
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

describe("rolesHandlers", () => {
  let mockRepository: {
    loadRoles: jest.Mock;
    saveRoles: jest.Mock;
    resetRoles: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock repository
    mockRepository = {
      loadRoles: jest.fn(),
      saveRoles: jest.fn(),
      resetRoles: jest.fn(),
    };

    (rolesRepositoryManager.get as jest.Mock).mockReturnValue(mockRepository);
  });

  describe("setupRolesHandlers", () => {
    it("should register all roles handlers", () => {
      setupRolesHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        ROLES_CHANNELS.LOAD,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        ROLES_CHANNELS.SAVE,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        ROLES_CHANNELS.RESET,
        expect.any(Function),
      );
    });
  });

  describe("LOAD handler", () => {
    it("should load roles from repository", async () => {
      const mockRoles: PersistedRolesSettingsData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-1",
            name: "Test Role",
            description: "Test description",
            systemPrompt: "Test prompt",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z",
          },
        ],
        lastUpdated: "2025-01-01T12:00:00.000Z",
      };

      mockRepository.loadRoles.mockResolvedValue(mockRoles);

      setupRolesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === ROLES_CHANNELS.LOAD,
      )[1];

      const result: RolesLoadResponse = await handler();

      expect(mockRepository.loadRoles).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockRoles });
    });

    it("should handle null response when roles file doesn't exist", async () => {
      mockRepository.loadRoles.mockResolvedValue(null);

      setupRolesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === ROLES_CHANNELS.LOAD,
      )[1];

      const result: RolesLoadResponse = await handler();

      expect(mockRepository.loadRoles).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: undefined });
    });

    it("should handle errors when loading fails", async () => {
      const error = new Error("Failed to load roles");
      mockRepository.loadRoles.mockRejectedValue(error);

      setupRolesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === ROLES_CHANNELS.LOAD,
      )[1];

      const result: RolesLoadResponse = await handler();

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });

    it("should handle repository not initialized error", async () => {
      const error = new Error("Roles repository not initialized");
      (rolesRepositoryManager.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      setupRolesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === ROLES_CHANNELS.LOAD,
      )[1];

      const result: RolesLoadResponse = await handler();

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
    });
  });

  describe("SAVE handler", () => {
    it("should save roles to repository", async () => {
      const rolesData: PersistedRolesSettingsData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-1",
            name: "Updated Role",
            description: "Updated description",
            systemPrompt: "Updated prompt",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-02T00:00:00.000Z",
          },
        ],
        lastUpdated: "2025-01-02T10:30:00.000Z",
      };

      const request: RolesSaveRequest = {
        roles: rolesData,
      };

      mockRepository.saveRoles.mockResolvedValue(undefined);

      setupRolesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === ROLES_CHANNELS.SAVE,
      )[1];

      const result: RolesSaveResponse = await handler(null, request);

      expect(mockRepository.saveRoles).toHaveBeenCalledWith(rolesData);
      expect(result).toEqual({ success: true });
    });

    it("should handle save errors", async () => {
      const error = new Error("Failed to save roles");
      const rolesData: PersistedRolesSettingsData = {
        schemaVersion: "1.0.0",
        roles: [],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const request: RolesSaveRequest = {
        roles: rolesData,
      };

      mockRepository.saveRoles.mockRejectedValue(error);

      setupRolesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === ROLES_CHANNELS.SAVE,
      )[1];

      const result: RolesSaveResponse = await handler(null, request);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });

    it("should handle repository not initialized error during save", async () => {
      const error = new Error("Roles repository not initialized");
      (rolesRepositoryManager.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const request: RolesSaveRequest = {
        roles: {} as PersistedRolesSettingsData,
      };

      setupRolesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === ROLES_CHANNELS.SAVE,
      )[1];

      const result: RolesSaveResponse = await handler(null, request);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
    });
  });

  describe("RESET handler", () => {
    it("should reset roles and return undefined", async () => {
      mockRepository.resetRoles.mockResolvedValue(undefined);

      setupRolesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === ROLES_CHANNELS.RESET,
      )[1];

      const result: RolesResetResponse = await handler();

      expect(mockRepository.resetRoles).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: undefined });
    });

    it("should handle errors during reset operation", async () => {
      const error = new Error("Failed to reset roles");
      mockRepository.resetRoles.mockRejectedValue(error);

      setupRolesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === ROLES_CHANNELS.RESET,
      )[1];

      const result: RolesResetResponse = await handler();

      expect(mockRepository.resetRoles).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });

    it("should handle repository not initialized error during reset", async () => {
      const error = new Error("Roles repository not initialized");
      (rolesRepositoryManager.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      setupRolesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === ROLES_CHANNELS.RESET,
      )[1];

      const result: RolesResetResponse = await handler();

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
    });
  });
});
