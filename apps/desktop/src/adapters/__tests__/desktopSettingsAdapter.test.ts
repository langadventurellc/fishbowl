/**
 * Unit tests for DesktopSettingsAdapter.
 *
 * Tests the desktop-specific implementation of SettingsPersistenceAdapter,
 * including proper error handling, type transformation, and IPC integration.
 *
 * @module adapters/__tests__/desktopSettingsAdapter.test
 */

import type { PersistedSettingsData } from "@fishbowl-ai/shared";
import { SettingsPersistenceError } from "@fishbowl-ai/ui-shared";
import {
  DesktopSettingsAdapter,
  desktopSettingsAdapter,
} from "../desktopSettingsAdapter";

// Mock window.electronAPI
const mockSettingsSave = jest.fn();
const mockSettingsLoad = jest.fn();
const mockSettingsReset = jest.fn();

// Mock console methods for testing
const mockConsoleError = jest.fn();

beforeEach(() => {
  // Reset mocks
  mockSettingsSave.mockClear();
  mockSettingsLoad.mockClear();
  mockSettingsReset.mockClear();
  mockConsoleError.mockClear();

  // Mock window.electronAPI
  Object.defineProperty(window, "electronAPI", {
    value: {
      settings: {
        save: mockSettingsSave,
        load: mockSettingsLoad,
        reset: mockSettingsReset,
      },
    },
    writable: true,
    configurable: true,
  });

  // Mock console methods
  jest.spyOn(console, "error").mockImplementation(mockConsoleError);
});

afterEach(() => {
  jest.restoreAllMocks();
  delete (window as any).electronAPI;
});

// Sample test data
const mockSettingsData: PersistedSettingsData = {
  schemaVersion: "1.0.0",
  general: {
    responseDelay: 2000,
    maximumMessages: 50,
    maximumWaitTime: 30000,
    defaultMode: "manual" as const,
    maximumAgents: 4,
    checkUpdates: true,
  },
  appearance: {
    theme: "system" as const,
    showTimestamps: "hover" as const,
    showActivityTime: true,
    compactList: false,
    fontSize: 14,
    messageSpacing: "normal" as const,
  },
  advanced: {
    debugLogging: false,
    experimentalFeatures: false,
  },
  lastUpdated: new Date().toISOString(),
};

describe("DesktopSettingsAdapter", () => {
  describe("Instance Creation", () => {
    it("should create a new instance successfully", () => {
      const adapter = new DesktopSettingsAdapter();
      expect(adapter).toBeInstanceOf(DesktopSettingsAdapter);
    });

    it("should export a singleton instance", () => {
      expect(desktopSettingsAdapter).toBeInstanceOf(DesktopSettingsAdapter);
    });
  });

  describe("save method", () => {
    it("should save settings successfully", async () => {
      mockSettingsSave.mockResolvedValue(undefined);

      const adapter = new DesktopSettingsAdapter();
      await expect(adapter.save(mockSettingsData)).resolves.toBeUndefined();

      expect(mockSettingsSave).toHaveBeenCalledTimes(1);
      expect(mockSettingsSave).toHaveBeenCalledWith(mockSettingsData);
    });

    it("should throw SettingsPersistenceError when electronAPI.settings.save throws", async () => {
      const errorMessage = "Database connection failed";
      mockSettingsSave.mockRejectedValue(new Error(errorMessage));

      const adapter = new DesktopSettingsAdapter();

      await expect(adapter.save(mockSettingsData)).rejects.toThrow(
        SettingsPersistenceError,
      );
      await expect(adapter.save(mockSettingsData)).rejects.toMatchObject({
        operation: "save",
        message: errorMessage,
      });

      expect(mockSettingsSave).toHaveBeenCalledWith(mockSettingsData);
    });

    it("should throw SettingsPersistenceError with generic message for non-Error objects", async () => {
      mockSettingsSave.mockRejectedValue("String error");

      const adapter = new DesktopSettingsAdapter();

      await expect(adapter.save(mockSettingsData)).rejects.toThrow(
        SettingsPersistenceError,
      );
      await expect(adapter.save(mockSettingsData)).rejects.toMatchObject({
        operation: "save",
        message: "Failed to save settings",
      });
    });

    it("should preserve SettingsPersistenceError if already thrown", async () => {
      const originalError = new SettingsPersistenceError(
        "Original error",
        "save",
      );
      mockSettingsSave.mockRejectedValue(originalError);

      const adapter = new DesktopSettingsAdapter();

      await expect(adapter.save(mockSettingsData)).rejects.toBe(originalError);
    });

    it("should include original error in SettingsPersistenceError", async () => {
      const originalError = new Error("Original error");
      mockSettingsSave.mockRejectedValue(originalError);

      const adapter = new DesktopSettingsAdapter();

      try {
        await adapter.save(mockSettingsData);
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsPersistenceError);
        expect((error as SettingsPersistenceError).cause).toBe(originalError);
      }
    });
  });

  describe("load method", () => {
    it("should load settings successfully", async () => {
      mockSettingsLoad.mockResolvedValue(mockSettingsData);

      const adapter = new DesktopSettingsAdapter();
      const result = await adapter.load();

      expect(result).toEqual(mockSettingsData);
      expect(mockSettingsLoad).toHaveBeenCalledTimes(1);
      expect(mockSettingsLoad).toHaveBeenCalledWith();
    });

    it("should return settings data when electronAPI returns data", async () => {
      const testData = {
        ...mockSettingsData,
        general: { ...mockSettingsData.general, responseDelay: 2000 },
      };
      mockSettingsLoad.mockResolvedValue(testData);

      const adapter = new DesktopSettingsAdapter();
      const result = await adapter.load();

      expect(result).toEqual(testData);
      expect(result).not.toBe(mockSettingsData); // Should be different object
    });

    it("should return null when settings load fails with specific error message", async () => {
      mockSettingsLoad.mockRejectedValue(new Error("Failed to load settings"));

      const adapter = new DesktopSettingsAdapter();
      const result = await adapter.load();

      expect(result).toBeNull();
      expect(mockSettingsLoad).toHaveBeenCalledTimes(1);
    });

    it("should throw SettingsPersistenceError for other error messages", async () => {
      const errorMessage = "Database corrupted";
      mockSettingsLoad.mockRejectedValue(new Error(errorMessage));

      const adapter = new DesktopSettingsAdapter();

      await expect(adapter.load()).rejects.toThrow(SettingsPersistenceError);
      await expect(adapter.load()).rejects.toMatchObject({
        operation: "load",
        message: errorMessage,
      });
    });

    it("should throw SettingsPersistenceError with generic message for non-Error objects", async () => {
      mockSettingsLoad.mockRejectedValue("String error");

      const adapter = new DesktopSettingsAdapter();

      await expect(adapter.load()).rejects.toThrow(SettingsPersistenceError);
      await expect(adapter.load()).rejects.toMatchObject({
        operation: "load",
        message: "Failed to load settings",
      });
    });

    it("should preserve SettingsPersistenceError if already thrown", async () => {
      const originalError = new SettingsPersistenceError(
        "Original error",
        "load",
      );
      mockSettingsLoad.mockRejectedValue(originalError);

      const adapter = new DesktopSettingsAdapter();

      await expect(adapter.load()).rejects.toBe(originalError);
    });

    it("should include original error in SettingsPersistenceError", async () => {
      const originalError = new Error("Database error");
      mockSettingsLoad.mockRejectedValue(originalError);

      const adapter = new DesktopSettingsAdapter();

      try {
        await adapter.load();
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsPersistenceError);
        expect((error as SettingsPersistenceError).cause).toBe(originalError);
      }
    });
  });

  describe("reset method", () => {
    it("should reset settings successfully", async () => {
      mockSettingsReset.mockResolvedValue(mockSettingsData);

      const adapter = new DesktopSettingsAdapter();
      await expect(adapter.reset()).resolves.toBeUndefined();

      expect(mockSettingsReset).toHaveBeenCalledTimes(1);
      expect(mockSettingsReset).toHaveBeenCalledWith();
    });

    it("should return void even when electronAPI returns data", async () => {
      mockSettingsReset.mockResolvedValue(mockSettingsData);

      const adapter = new DesktopSettingsAdapter();
      const result = await adapter.reset();

      expect(result).toBeUndefined();
    });

    it("should throw SettingsPersistenceError when electronAPI.settings.reset throws", async () => {
      const errorMessage = "Reset operation failed";
      mockSettingsReset.mockRejectedValue(new Error(errorMessage));

      const adapter = new DesktopSettingsAdapter();

      await expect(adapter.reset()).rejects.toThrow(SettingsPersistenceError);
      await expect(adapter.reset()).rejects.toMatchObject({
        operation: "reset",
        message: errorMessage,
      });

      expect(mockSettingsReset).toHaveBeenCalledTimes(2);
    });

    it("should throw SettingsPersistenceError with generic message for non-Error objects", async () => {
      mockSettingsReset.mockRejectedValue("String error");

      const adapter = new DesktopSettingsAdapter();

      await expect(adapter.reset()).rejects.toThrow(SettingsPersistenceError);
      await expect(adapter.reset()).rejects.toMatchObject({
        operation: "reset",
        message: "Failed to reset settings",
      });
    });

    it("should preserve SettingsPersistenceError if already thrown", async () => {
      const originalError = new SettingsPersistenceError(
        "Original error",
        "reset",
      );
      mockSettingsReset.mockRejectedValue(originalError);

      const adapter = new DesktopSettingsAdapter();

      await expect(adapter.reset()).rejects.toBe(originalError);
    });

    it("should include original error in SettingsPersistenceError", async () => {
      const originalError = new Error("Reset failed");
      mockSettingsReset.mockRejectedValue(originalError);

      const adapter = new DesktopSettingsAdapter();

      try {
        await adapter.reset();
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsPersistenceError);
        expect((error as SettingsPersistenceError).cause).toBe(originalError);
      }
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle undefined electronAPI gracefully", async () => {
      delete (window as any).electronAPI;

      const adapter = new DesktopSettingsAdapter();

      await expect(adapter.save(mockSettingsData)).rejects.toThrow(
        SettingsPersistenceError,
      );
      await expect(adapter.load()).rejects.toThrow(SettingsPersistenceError);
      await expect(adapter.reset()).rejects.toThrow(SettingsPersistenceError);
    });

    it("should handle null error objects", async () => {
      mockSettingsSave.mockRejectedValue(null);
      mockSettingsLoad.mockRejectedValue(null);
      mockSettingsReset.mockRejectedValue(null);

      const adapter = new DesktopSettingsAdapter();

      await expect(adapter.save(mockSettingsData)).rejects.toMatchObject({
        operation: "save",
        message: "Failed to save settings",
      });

      await expect(adapter.load()).rejects.toMatchObject({
        operation: "load",
        message: "Failed to load settings",
      });

      await expect(adapter.reset()).rejects.toMatchObject({
        operation: "reset",
        message: "Failed to reset settings",
      });
    });

    it("should handle undefined error objects", async () => {
      mockSettingsSave.mockRejectedValue(undefined);
      mockSettingsLoad.mockRejectedValue(undefined);
      mockSettingsReset.mockRejectedValue(undefined);

      const adapter = new DesktopSettingsAdapter();

      await expect(adapter.save(mockSettingsData)).rejects.toMatchObject({
        operation: "save",
        message: "Failed to save settings",
      });

      await expect(adapter.load()).rejects.toMatchObject({
        operation: "load",
        message: "Failed to load settings",
      });

      await expect(adapter.reset()).rejects.toMatchObject({
        operation: "reset",
        message: "Failed to reset settings",
      });
    });
  });

  describe("Interface Compliance", () => {
    it("should implement all SettingsPersistenceAdapter methods", () => {
      const adapter = new DesktopSettingsAdapter();

      expect(typeof adapter.save).toBe("function");
      expect(typeof adapter.load).toBe("function");
      expect(typeof adapter.reset).toBe("function");
    });

    it("should return correct types from all methods", async () => {
      mockSettingsSave.mockResolvedValue(undefined);
      mockSettingsLoad.mockResolvedValue(mockSettingsData);
      mockSettingsReset.mockResolvedValue(mockSettingsData);

      const adapter = new DesktopSettingsAdapter();

      // save should return Promise<void>
      const saveResult = adapter.save(mockSettingsData);
      expect(saveResult).toBeInstanceOf(Promise);
      await expect(saveResult).resolves.toBeUndefined();

      // load should return Promise<PersistedSettingsData | null>
      const loadResult = adapter.load();
      expect(loadResult).toBeInstanceOf(Promise);
      await expect(loadResult).resolves.toEqual(mockSettingsData);

      // reset should return Promise<void>
      const resetResult = adapter.reset();
      expect(resetResult).toBeInstanceOf(Promise);
      await expect(resetResult).resolves.toBeUndefined();
    });
  });

  describe("Singleton Instance", () => {
    it("should export the same instance on multiple imports", () => {
      expect(desktopSettingsAdapter).toBe(desktopSettingsAdapter);
    });

    it("should work correctly with the singleton instance", async () => {
      mockSettingsSave.mockResolvedValue(undefined);
      mockSettingsLoad.mockResolvedValue(mockSettingsData);
      mockSettingsReset.mockResolvedValue(mockSettingsData);

      await expect(
        desktopSettingsAdapter.save(mockSettingsData),
      ).resolves.toBeUndefined();
      await expect(desktopSettingsAdapter.load()).resolves.toEqual(
        mockSettingsData,
      );
      await expect(desktopSettingsAdapter.reset()).resolves.toBeUndefined();

      expect(mockSettingsSave).toHaveBeenCalledWith(mockSettingsData);
      expect(mockSettingsLoad).toHaveBeenCalled();
      expect(mockSettingsReset).toHaveBeenCalled();
    });
  });
});
