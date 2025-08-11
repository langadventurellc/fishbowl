/**
 * Unit tests for Electron preload script roles API.
 *
 * Tests the roles API exposure through contextBridge, including proper
 * IPC invocation, error handling, and parameter validation.
 *
 * @module electron/__tests__/preload.test
 */

import type {
  RolesLoadResponse,
  RolesSaveResponse,
  RolesResetResponse,
  RolesSaveRequest,
} from "../../shared/ipc/index";
import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";

// Create mocks first
const mockContextBridge = {
  exposeInMainWorld: jest.fn(),
};

const mockIpcRenderer = {
  invoke: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
};

const mockLogger = {
  error: jest.fn(),
};

// Mock electron
jest.mock("electron", () => ({
  contextBridge: mockContextBridge,
  ipcRenderer: mockIpcRenderer,
}));

// Mock logger
jest.mock("@fishbowl-ai/shared", () => ({
  createLoggerSync: jest.fn(() => mockLogger),
}));

describe("Preload Roles API", () => {
  const mockRolesData: PersistedRolesSettingsData = {
    schemaVersion: "1.0.0",
    roles: [
      {
        id: "test-role",
        name: "Test Role",
        description: "Test description",
        systemPrompt: "Test prompt",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    lastUpdated: "2025-01-01T00:00:00.000Z",
  };

  let exposedAPI: any;

  beforeAll(() => {
    // Import preload to trigger setup
    require("../preload");

    // Get the exposed API
    const calls = mockContextBridge.exposeInMainWorld.mock.calls;
    const electronAPICall = calls.find((call) => call[0] === "electronAPI");
    if (electronAPICall) {
      exposedAPI = electronAPICall[1];
    }
  });

  beforeEach(() => {
    // Clear IPC mock calls but keep the exposed API
    mockIpcRenderer.invoke.mockClear();
    mockLogger.error.mockClear();
  });

  describe("roles.load", () => {
    it("should invoke correct IPC channel and return data on success", async () => {
      const response: RolesLoadResponse = {
        success: true,
        data: mockRolesData,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.roles.load();

      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("roles:load");
      expect(result).toEqual(mockRolesData);
    });

    it("should throw error when response indicates failure", async () => {
      const response: RolesLoadResponse = {
        success: false,
        error: { message: "Load failed", code: "LOAD_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.roles.load()).rejects.toThrow("Load failed");
    });

    it("should throw error with default message when no error message provided", async () => {
      const response: RolesLoadResponse = {
        success: false,
        error: { message: "", code: "LOAD_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.roles.load()).rejects.toThrow(
        "Failed to load roles",
      );
    });

    it("should handle IPC communication errors", async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC error"));

      await expect(exposedAPI.roles.load()).rejects.toThrow("IPC error");
    });

    it("should handle non-Error rejections", async () => {
      mockIpcRenderer.invoke.mockRejectedValue("string error");

      await expect(exposedAPI.roles.load()).rejects.toThrow(
        "Failed to communicate with main process",
      );
    });
  });

  describe("roles.save", () => {
    it("should invoke correct IPC channel with roles data", async () => {
      const response: RolesSaveResponse = {
        success: true,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await exposedAPI.roles.save(mockRolesData);

      const expectedRequest: RolesSaveRequest = { roles: mockRolesData };
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "roles:save",
        expectedRequest,
      );
    });

    it("should complete successfully when save succeeds", async () => {
      const response: RolesSaveResponse = {
        success: true,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(
        exposedAPI.roles.save(mockRolesData),
      ).resolves.toBeUndefined();
    });

    it("should throw error when save fails", async () => {
      const response: RolesSaveResponse = {
        success: false,
        error: { message: "Save failed", code: "SAVE_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.roles.save(mockRolesData)).rejects.toThrow(
        "Save failed",
      );
    });

    it("should throw error with default message when no error message provided", async () => {
      const response: RolesSaveResponse = {
        success: false,
        error: { message: "", code: "SAVE_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.roles.save(mockRolesData)).rejects.toThrow(
        "Failed to save roles",
      );
    });

    it("should handle IPC communication errors", async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC error"));

      await expect(exposedAPI.roles.save(mockRolesData)).rejects.toThrow(
        "IPC error",
      );
    });

    it("should handle non-Error rejections", async () => {
      mockIpcRenderer.invoke.mockRejectedValue("string error");

      await expect(exposedAPI.roles.save(mockRolesData)).rejects.toThrow(
        "Failed to communicate with main process",
      );
    });
  });

  describe("roles.reset", () => {
    const emptyRoles: PersistedRolesSettingsData = {
      schemaVersion: "1.0.0",
      roles: [],
      lastUpdated: "2025-01-01T00:00:00.000Z",
    };

    it("should invoke correct IPC channel and return reset data", async () => {
      const response: RolesResetResponse = {
        success: true,
        data: emptyRoles,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.roles.reset();

      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("roles:reset");
      expect(result).toEqual(emptyRoles);
    });

    it("should throw error when reset fails", async () => {
      const response: RolesResetResponse = {
        success: false,
        error: { message: "Reset failed", code: "RESET_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.roles.reset()).rejects.toThrow("Reset failed");
    });

    it("should throw error with default message when no error message provided", async () => {
      const response: RolesResetResponse = {
        success: false,
        error: { message: "", code: "RESET_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.roles.reset()).rejects.toThrow(
        "Failed to reset roles",
      );
    });

    it("should handle IPC communication errors", async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC error"));

      await expect(exposedAPI.roles.reset()).rejects.toThrow("IPC error");
    });

    it("should handle non-Error rejections", async () => {
      mockIpcRenderer.invoke.mockRejectedValue("string error");

      await expect(exposedAPI.roles.reset()).rejects.toThrow(
        "Failed to communicate with main process",
      );
    });
  });

  describe("contextBridge integration", () => {
    it("should expose roles API through electronAPI", () => {
      expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledWith(
        "electronAPI",
        expect.objectContaining({
          roles: expect.objectContaining({
            load: expect.any(Function),
            save: expect.any(Function),
            reset: expect.any(Function),
          }),
        }),
      );
    });

    it("should maintain existing API structure", () => {
      expect(exposedAPI).toHaveProperty("platform");
      expect(exposedAPI).toHaveProperty("versions");
      expect(exposedAPI).toHaveProperty("onOpenSettings");
      expect(exposedAPI).toHaveProperty("removeAllListeners");
      expect(exposedAPI).toHaveProperty("settings");
      expect(exposedAPI).toHaveProperty("llmConfig");
      expect(exposedAPI).toHaveProperty("roles");
    });

    it("should have all required roles methods", () => {
      expect(exposedAPI.roles).toHaveProperty("load");
      expect(exposedAPI.roles).toHaveProperty("save");
      expect(exposedAPI.roles).toHaveProperty("reset");
      expect(typeof exposedAPI.roles.load).toBe("function");
      expect(typeof exposedAPI.roles.save).toBe("function");
      expect(typeof exposedAPI.roles.reset).toBe("function");
    });
  });

  describe("error logging", () => {
    it("should log errors when load fails", async () => {
      const error = new Error("Load failed");
      mockIpcRenderer.invoke.mockRejectedValue(error);

      try {
        await exposedAPI.roles.load();
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error loading roles:",
        error,
      );
    });

    it("should log errors when save fails", async () => {
      const error = new Error("Save failed");
      mockIpcRenderer.invoke.mockRejectedValue(error);

      try {
        await exposedAPI.roles.save(mockRolesData);
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error saving roles:",
        error,
      );
    });

    it("should log errors when reset fails", async () => {
      const error = new Error("Reset failed");
      mockIpcRenderer.invoke.mockRejectedValue(error);

      try {
        await exposedAPI.roles.reset();
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error resetting roles:",
        error,
      );
    });

    it("should convert non-Error objects to Error for logging", async () => {
      const nonError = "string error";
      mockIpcRenderer.invoke.mockRejectedValue(nonError);

      try {
        await exposedAPI.roles.load();
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error loading roles:",
        expect.any(Error),
      );
    });
  });
});
