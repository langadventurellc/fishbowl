import { ipcMain } from "electron";
import { setupSettingsHandlers } from "../settingsHandlers";
import {
  SETTINGS_CHANNELS,
  type SettingsLoadResponse,
  type SettingsSaveRequest,
  type SettingsSaveResponse,
  type SettingsResetRequest,
  type SettingsResetResponse,
} from "../../shared/ipc/index";
import { serializeError } from "../utils/errorSerialization";
import { getSettingsRepository } from "../getSettingsRepository";
import { PersistedSettingsData } from "@fishbowl-ai/shared";

// Mock electron
jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

// Mock getSettingsRepository module
jest.mock("../getSettingsRepository", () => ({
  getSettingsRepository: jest.fn(),
}));

// Mock errorSerialization
jest.mock("../utils/errorSerialization", () => ({
  serializeError: jest.fn((error) => ({
    message: error.message,
    name: error.name,
  })),
}));

describe("settingsHandlers", () => {
  let mockRepository: {
    loadSettings: jest.Mock;
    saveSettings: jest.Mock;
    initialize: jest.Mock;
    resetSettings: jest.Mock;
    isInitialized: jest.Mock;
    subscribe: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock repository
    mockRepository = {
      loadSettings: jest.fn(),
      saveSettings: jest.fn(),
      initialize: jest.fn(),
      resetSettings: jest.fn(),
      isInitialized: jest.fn().mockReturnValue(true),
      subscribe: jest.fn(),
    };

    (getSettingsRepository as jest.Mock).mockReturnValue(mockRepository);
  });

  describe("setupSettingsHandlers", () => {
    it("should register all settings handlers", () => {
      setupSettingsHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        SETTINGS_CHANNELS.LOAD,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        SETTINGS_CHANNELS.SAVE,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        SETTINGS_CHANNELS.RESET,
        expect.any(Function),
      );
    });
  });

  describe("LOAD handler", () => {
    it("should load settings from repository", async () => {
      const mockSettings: PersistedSettingsData = {
        schemaVersion: "1.0.0",
        general: {
          responseDelay: 3000,
          maximumMessages: 75,
          maximumWaitTime: 45000,
          defaultMode: "auto",
          maximumAgents: 6,
          checkUpdates: false,
        },
        appearance: {
          theme: "dark",
          showTimestamps: "always",
          showActivityTime: false,
          compactList: true,
          fontSize: 16,
          messageSpacing: "compact",
        },
        advanced: {
          debugLogging: true,
          experimentalFeatures: true,
        },
        lastUpdated: "2025-01-01T12:00:00.000Z",
      };

      mockRepository.loadSettings.mockResolvedValue(mockSettings);

      setupSettingsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === SETTINGS_CHANNELS.LOAD,
      )[1];

      const result: SettingsLoadResponse = await handler();

      expect(mockRepository.loadSettings).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockSettings });
    });

    it("should handle errors when loading fails", async () => {
      const error = new Error("Failed to load settings");
      mockRepository.loadSettings.mockRejectedValue(error);

      setupSettingsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === SETTINGS_CHANNELS.LOAD,
      )[1];

      const result: SettingsLoadResponse = await handler();

      expect(result).toEqual({
        success: false,
        error: { message: error.message, name: error.name },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });

    it("should handle repository not initialized error", async () => {
      const error = new Error("Settings repository not initialized");
      (getSettingsRepository as jest.Mock).mockImplementation(() => {
        throw error;
      });

      setupSettingsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === SETTINGS_CHANNELS.LOAD,
      )[1];

      const result: SettingsLoadResponse = await handler();

      expect(result).toEqual({
        success: false,
        error: { message: error.message, name: error.name },
      });
    });
  });

  describe("SAVE handler", () => {
    it("should save settings to repository", async () => {
      const newSettings: PersistedSettingsData = {
        schemaVersion: "1.0.0",
        general: {
          responseDelay: 1500,
          maximumMessages: 100,
          maximumWaitTime: 60000,
          defaultMode: "manual",
          maximumAgents: 8,
          checkUpdates: true,
        },
        appearance: {
          theme: "light",
          showTimestamps: "never",
          showActivityTime: true,
          compactList: false,
          fontSize: 12,
          messageSpacing: "relaxed",
        },
        advanced: {
          debugLogging: false,
          experimentalFeatures: false,
        },
        lastUpdated: "2025-01-02T10:30:00.000Z",
      };

      const request: SettingsSaveRequest = {
        settings: newSettings,
        section: "general",
      };

      mockRepository.saveSettings.mockResolvedValue(undefined);

      setupSettingsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === SETTINGS_CHANNELS.SAVE,
      )[1];

      const result: SettingsSaveResponse = await handler(null, request);

      expect(mockRepository.saveSettings).toHaveBeenCalledWith(newSettings);
      expect(result).toEqual({ success: true });
    });

    it("should handle save errors", async () => {
      const error = new Error("Failed to save settings");
      const newSettings: PersistedSettingsData = {
        schemaVersion: "1.0.0",
        general: {
          responseDelay: 2000,
          maximumMessages: 50,
          maximumWaitTime: 30000,
          defaultMode: "manual",
          maximumAgents: 4,
          checkUpdates: true,
        },
        appearance: {
          theme: "system",
          showTimestamps: "hover",
          showActivityTime: true,
          compactList: false,
          fontSize: 14,
          messageSpacing: "normal",
        },
        advanced: {
          debugLogging: false,
          experimentalFeatures: false,
        },
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const request: SettingsSaveRequest = {
        settings: newSettings,
        section: "appearance",
      };

      mockRepository.saveSettings.mockRejectedValue(error);

      setupSettingsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === SETTINGS_CHANNELS.SAVE,
      )[1];

      const result: SettingsSaveResponse = await handler(null, request);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, name: error.name },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });

    it("should handle repository not initialized error during save", async () => {
      const error = new Error("Settings repository not initialized");
      (getSettingsRepository as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const request: SettingsSaveRequest = {
        settings: {} as PersistedSettingsData,
        section: "general",
      };

      setupSettingsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === SETTINGS_CHANNELS.SAVE,
      )[1];

      const result: SettingsSaveResponse = await handler(null, request);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, name: error.name },
      });
    });
  });

  describe("RESET handler", () => {
    it("should reset settings by saving empty object and loading defaults", async () => {
      const defaultSettings: PersistedSettingsData = {
        schemaVersion: "1.0.0",
        general: {
          responseDelay: 2000,
          maximumMessages: 50,
          maximumWaitTime: 30000,
          defaultMode: "manual",
          maximumAgents: 4,
          checkUpdates: true,
        },
        appearance: {
          theme: "system",
          showTimestamps: "hover",
          showActivityTime: true,
          compactList: false,
          fontSize: 14,
          messageSpacing: "normal",
        },
        advanced: {
          debugLogging: false,
          experimentalFeatures: false,
        },
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      mockRepository.saveSettings.mockResolvedValue(undefined);
      mockRepository.loadSettings.mockResolvedValue(defaultSettings);

      setupSettingsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === SETTINGS_CHANNELS.RESET,
      )[1];

      const result: SettingsResetResponse = await handler();

      expect(mockRepository.saveSettings).toHaveBeenCalledWith({});
      expect(mockRepository.loadSettings).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: defaultSettings });
    });

    it("should handle reset with section parameter", async () => {
      const defaultSettings: PersistedSettingsData = {
        schemaVersion: "1.0.0",
        general: {
          responseDelay: 2000,
          maximumMessages: 50,
          maximumWaitTime: 30000,
          defaultMode: "manual",
          maximumAgents: 4,
          checkUpdates: true,
        },
        appearance: {
          theme: "system",
          showTimestamps: "hover",
          showActivityTime: true,
          compactList: false,
          fontSize: 14,
          messageSpacing: "normal",
        },
        advanced: {
          debugLogging: false,
          experimentalFeatures: false,
        },
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const request: SettingsResetRequest = {
        section: "advanced",
      };

      mockRepository.saveSettings.mockResolvedValue(undefined);
      mockRepository.loadSettings.mockResolvedValue(defaultSettings);

      setupSettingsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === SETTINGS_CHANNELS.RESET,
      )[1];

      const result: SettingsResetResponse = await handler(null, request);

      expect(mockRepository.saveSettings).toHaveBeenCalledWith({});
      expect(mockRepository.loadSettings).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: defaultSettings });
    });

    it("should handle errors during reset save operation", async () => {
      const error = new Error("Failed to save during reset");
      mockRepository.saveSettings.mockRejectedValue(error);

      setupSettingsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === SETTINGS_CHANNELS.RESET,
      )[1];

      const result: SettingsResetResponse = await handler();

      expect(mockRepository.saveSettings).toHaveBeenCalledWith({});
      expect(mockRepository.loadSettings).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: { message: error.message, name: error.name },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });

    it("should handle errors during reset load operation", async () => {
      const error = new Error("Failed to load after reset");
      mockRepository.saveSettings.mockResolvedValue(undefined);
      mockRepository.loadSettings.mockRejectedValue(error);

      setupSettingsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === SETTINGS_CHANNELS.RESET,
      )[1];

      const result: SettingsResetResponse = await handler();

      expect(mockRepository.saveSettings).toHaveBeenCalledWith({});
      expect(mockRepository.loadSettings).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: { message: error.message, name: error.name },
      });
    });

    it("should handle repository not initialized error during reset", async () => {
      const error = new Error("Settings repository not initialized");
      (getSettingsRepository as jest.Mock).mockImplementation(() => {
        throw error;
      });

      setupSettingsHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === SETTINGS_CHANNELS.RESET,
      )[1];

      const result: SettingsResetResponse = await handler();

      expect(result).toEqual({
        success: false,
        error: { message: error.message, name: error.name },
      });
    });
  });
});
