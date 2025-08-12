/**
 * Unit tests for DesktopRolesAdapter.
 *
 * Tests the desktop-specific implementation of RolesPersistenceAdapter,
 * including proper error handling, type transformation, and IPC integration.
 *
 * @module adapters/__tests__/desktopRolesAdapter.test
 */

import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";
import { RolesPersistenceError } from "@fishbowl-ai/ui-shared";
import {
  DesktopRolesAdapter,
  desktopRolesAdapter,
} from "../desktopRolesAdapter";

// Mock window.electronAPI
const mockRolesSave = jest.fn();
const mockRolesLoad = jest.fn();
const mockRolesReset = jest.fn();

// Mock console methods for testing
const mockConsoleError = jest.fn();

beforeEach(() => {
  // Reset mocks
  mockRolesSave.mockClear();
  mockRolesLoad.mockClear();
  mockRolesReset.mockClear();
  mockConsoleError.mockClear();

  // Mock window.electronAPI
  Object.defineProperty(window, "electronAPI", {
    value: {
      roles: {
        save: mockRolesSave,
        load: mockRolesLoad,
        reset: mockRolesReset,
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
const mockRolesData: PersistedRolesSettingsData = {
  schemaVersion: "1.0.0",
  roles: [
    {
      id: "role-1",
      name: "Assistant",
      description: "Helpful assistant",
      systemPrompt: "You are a helpful assistant",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
  ],
  lastUpdated: new Date().toISOString(),
};

describe("DesktopRolesAdapter", () => {
  describe("Instance Creation", () => {
    it("should create a new instance successfully", () => {
      const adapter = new DesktopRolesAdapter();
      expect(adapter).toBeInstanceOf(DesktopRolesAdapter);
    });

    it("should export a singleton instance", () => {
      expect(desktopRolesAdapter).toBeInstanceOf(DesktopRolesAdapter);
    });
  });

  describe("save method", () => {
    it("should save roles successfully", async () => {
      mockRolesSave.mockResolvedValue(undefined);

      const adapter = new DesktopRolesAdapter();
      await expect(adapter.save(mockRolesData)).resolves.toBeUndefined();

      expect(mockRolesSave).toHaveBeenCalledTimes(1);
      expect(mockRolesSave).toHaveBeenCalledWith(mockRolesData);
    });

    it("should throw RolesPersistenceError when electronAPI.roles.save throws", async () => {
      const errorMessage = "Database connection failed";
      mockRolesSave.mockRejectedValue(new Error(errorMessage));

      const adapter = new DesktopRolesAdapter();

      await expect(adapter.save(mockRolesData)).rejects.toThrow(
        RolesPersistenceError,
      );
      await expect(adapter.save(mockRolesData)).rejects.toMatchObject({
        operation: "save",
        message: errorMessage,
      });

      expect(mockRolesSave).toHaveBeenCalledWith(mockRolesData);
    });

    it("should throw RolesPersistenceError with generic message for non-Error objects", async () => {
      mockRolesSave.mockRejectedValue("String error");

      const adapter = new DesktopRolesAdapter();

      await expect(adapter.save(mockRolesData)).rejects.toThrow(
        RolesPersistenceError,
      );
      await expect(adapter.save(mockRolesData)).rejects.toMatchObject({
        operation: "save",
        message: "Failed to save roles",
      });
    });

    it("should preserve RolesPersistenceError if already thrown", async () => {
      const originalError = new RolesPersistenceError("Original error", "save");
      mockRolesSave.mockRejectedValue(originalError);

      const adapter = new DesktopRolesAdapter();

      await expect(adapter.save(mockRolesData)).rejects.toBe(originalError);
    });

    it("should include original error in RolesPersistenceError", async () => {
      const originalError = new Error("Original error");
      mockRolesSave.mockRejectedValue(originalError);

      const adapter = new DesktopRolesAdapter();

      try {
        await adapter.save(mockRolesData);
      } catch (error) {
        expect(error).toBeInstanceOf(RolesPersistenceError);
        expect((error as RolesPersistenceError).cause).toBe(originalError);
      }
    });
  });

  describe("load method", () => {
    it("should load roles successfully", async () => {
      mockRolesLoad.mockResolvedValue(mockRolesData);

      const adapter = new DesktopRolesAdapter();
      const result = await adapter.load();

      expect(result).toEqual(mockRolesData);
      expect(mockRolesLoad).toHaveBeenCalledTimes(1);
      expect(mockRolesLoad).toHaveBeenCalledWith();
    });

    it("should return roles data when electronAPI returns data", async () => {
      const testData = {
        ...mockRolesData,
        roles: [
          {
            ...mockRolesData.roles[0],
            name: "Modified Assistant",
          },
        ],
      };
      mockRolesLoad.mockResolvedValue(testData);

      const adapter = new DesktopRolesAdapter();
      const result = await adapter.load();

      expect(result).toEqual(testData);
      expect(result).not.toBe(mockRolesData); // Should be different object
    });

    it("should return null when roles load fails with specific error message", async () => {
      mockRolesLoad.mockRejectedValue(new Error("Failed to load roles"));

      const adapter = new DesktopRolesAdapter();
      const result = await adapter.load();

      expect(result).toBeNull();
      expect(mockRolesLoad).toHaveBeenCalledTimes(1);
    });

    it("should throw RolesPersistenceError for other error messages", async () => {
      const errorMessage = "Database corrupted";
      mockRolesLoad.mockRejectedValue(new Error(errorMessage));

      const adapter = new DesktopRolesAdapter();

      await expect(adapter.load()).rejects.toThrow(RolesPersistenceError);
      await expect(adapter.load()).rejects.toMatchObject({
        operation: "load",
        message: errorMessage,
      });
    });

    it("should throw RolesPersistenceError with generic message for non-Error objects", async () => {
      mockRolesLoad.mockRejectedValue("String error");

      const adapter = new DesktopRolesAdapter();

      await expect(adapter.load()).rejects.toThrow(RolesPersistenceError);
      await expect(adapter.load()).rejects.toMatchObject({
        operation: "load",
        message: "Failed to load roles",
      });
    });

    it("should preserve RolesPersistenceError if already thrown", async () => {
      const originalError = new RolesPersistenceError("Original error", "load");
      mockRolesLoad.mockRejectedValue(originalError);

      const adapter = new DesktopRolesAdapter();

      await expect(adapter.load()).rejects.toBe(originalError);
    });

    it("should include original error in RolesPersistenceError", async () => {
      const originalError = new Error("Database error");
      mockRolesLoad.mockRejectedValue(originalError);

      const adapter = new DesktopRolesAdapter();

      try {
        await adapter.load();
      } catch (error) {
        expect(error).toBeInstanceOf(RolesPersistenceError);
        expect((error as RolesPersistenceError).cause).toBe(originalError);
      }
    });
  });

  describe("reset method", () => {
    it("should reset roles successfully", async () => {
      mockRolesReset.mockResolvedValue(mockRolesData);

      const adapter = new DesktopRolesAdapter();
      await expect(adapter.reset()).resolves.toBeUndefined();

      expect(mockRolesReset).toHaveBeenCalledTimes(1);
      expect(mockRolesReset).toHaveBeenCalledWith();
    });

    it("should return void even when electronAPI returns data", async () => {
      mockRolesReset.mockResolvedValue(mockRolesData);

      const adapter = new DesktopRolesAdapter();
      const result = await adapter.reset();

      expect(result).toBeUndefined();
    });

    it("should throw RolesPersistenceError when electronAPI.roles.reset throws", async () => {
      const errorMessage = "Reset operation failed";
      mockRolesReset.mockRejectedValue(new Error(errorMessage));

      const adapter = new DesktopRolesAdapter();

      await expect(adapter.reset()).rejects.toThrow(RolesPersistenceError);
      await expect(adapter.reset()).rejects.toMatchObject({
        operation: "reset",
        message: errorMessage,
      });

      expect(mockRolesReset).toHaveBeenCalledTimes(2);
    });

    it("should throw RolesPersistenceError with generic message for non-Error objects", async () => {
      mockRolesReset.mockRejectedValue("String error");

      const adapter = new DesktopRolesAdapter();

      await expect(adapter.reset()).rejects.toThrow(RolesPersistenceError);
      await expect(adapter.reset()).rejects.toMatchObject({
        operation: "reset",
        message: "Failed to reset roles",
      });
    });

    it("should preserve RolesPersistenceError if already thrown", async () => {
      const originalError = new RolesPersistenceError(
        "Original error",
        "reset",
      );
      mockRolesReset.mockRejectedValue(originalError);

      const adapter = new DesktopRolesAdapter();

      await expect(adapter.reset()).rejects.toBe(originalError);
    });

    it("should include original error in RolesPersistenceError", async () => {
      const originalError = new Error("Reset failed");
      mockRolesReset.mockRejectedValue(originalError);

      const adapter = new DesktopRolesAdapter();

      try {
        await adapter.reset();
      } catch (error) {
        expect(error).toBeInstanceOf(RolesPersistenceError);
        expect((error as RolesPersistenceError).cause).toBe(originalError);
      }
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle undefined electronAPI gracefully", async () => {
      delete (window as any).electronAPI;

      const adapter = new DesktopRolesAdapter();

      await expect(adapter.save(mockRolesData)).rejects.toThrow(
        RolesPersistenceError,
      );
      await expect(adapter.load()).rejects.toThrow(RolesPersistenceError);
      await expect(adapter.reset()).rejects.toThrow(RolesPersistenceError);
    });

    it("should handle null error objects", async () => {
      mockRolesSave.mockRejectedValue(null);
      mockRolesLoad.mockRejectedValue(null);
      mockRolesReset.mockRejectedValue(null);

      const adapter = new DesktopRolesAdapter();

      await expect(adapter.save(mockRolesData)).rejects.toMatchObject({
        operation: "save",
        message: "Failed to save roles",
      });

      await expect(adapter.load()).rejects.toMatchObject({
        operation: "load",
        message: "Failed to load roles",
      });

      await expect(adapter.reset()).rejects.toMatchObject({
        operation: "reset",
        message: "Failed to reset roles",
      });
    });

    it("should handle undefined error objects", async () => {
      mockRolesSave.mockRejectedValue(undefined);
      mockRolesLoad.mockRejectedValue(undefined);
      mockRolesReset.mockRejectedValue(undefined);

      const adapter = new DesktopRolesAdapter();

      await expect(adapter.save(mockRolesData)).rejects.toMatchObject({
        operation: "save",
        message: "Failed to save roles",
      });

      await expect(adapter.load()).rejects.toMatchObject({
        operation: "load",
        message: "Failed to load roles",
      });

      await expect(adapter.reset()).rejects.toMatchObject({
        operation: "reset",
        message: "Failed to reset roles",
      });
    });
  });

  describe("Interface Compliance", () => {
    it("should implement all RolesPersistenceAdapter methods", () => {
      const adapter = new DesktopRolesAdapter();

      expect(typeof adapter.save).toBe("function");
      expect(typeof adapter.load).toBe("function");
      expect(typeof adapter.reset).toBe("function");
    });

    it("should return correct types from all methods", async () => {
      mockRolesSave.mockResolvedValue(undefined);
      mockRolesLoad.mockResolvedValue(mockRolesData);
      mockRolesReset.mockResolvedValue(mockRolesData);

      const adapter = new DesktopRolesAdapter();

      // save should return Promise<void>
      const saveResult = adapter.save(mockRolesData);
      expect(saveResult).toBeInstanceOf(Promise);
      await expect(saveResult).resolves.toBeUndefined();

      // load should return Promise<PersistedRolesSettingsData | null>
      const loadResult = adapter.load();
      expect(loadResult).toBeInstanceOf(Promise);
      await expect(loadResult).resolves.toEqual(mockRolesData);

      // reset should return Promise<void>
      const resetResult = adapter.reset();
      expect(resetResult).toBeInstanceOf(Promise);
      await expect(resetResult).resolves.toBeUndefined();
    });
  });

  describe("Singleton Instance", () => {
    it("should export the same instance on multiple imports", () => {
      expect(desktopRolesAdapter).toBe(desktopRolesAdapter);
    });

    it("should work correctly with the singleton instance", async () => {
      mockRolesSave.mockResolvedValue(undefined);
      mockRolesLoad.mockResolvedValue(mockRolesData);
      mockRolesReset.mockResolvedValue(mockRolesData);

      await expect(
        desktopRolesAdapter.save(mockRolesData),
      ).resolves.toBeUndefined();
      await expect(desktopRolesAdapter.load()).resolves.toEqual(mockRolesData);
      await expect(desktopRolesAdapter.reset()).resolves.toBeUndefined();

      expect(mockRolesSave).toHaveBeenCalledWith(mockRolesData);
      expect(mockRolesLoad).toHaveBeenCalled();
      expect(mockRolesReset).toHaveBeenCalled();
    });
  });
});
