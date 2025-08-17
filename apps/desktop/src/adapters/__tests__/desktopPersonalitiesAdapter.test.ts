/**
 * Unit tests for DesktopPersonalitiesAdapter.
 *
 * Tests the desktop-specific implementation of PersonalitiesPersistenceAdapter,
 * including proper error handling, type transformation, and IPC integration.
 *
 * @module adapters/__tests__/desktopPersonalitiesAdapter.test
 */

import type { PersistedPersonalitiesSettingsData } from "@fishbowl-ai/shared";
import { PersonalitiesPersistenceError } from "@fishbowl-ai/ui-shared";
import {
  DesktopPersonalitiesAdapter,
  desktopPersonalitiesAdapter,
} from "../desktopPersonalitiesAdapter";

// Mock window.electronAPI
const mockPersonalitiesSave = jest.fn();
const mockPersonalitiesLoad = jest.fn();
const mockPersonalitiesReset = jest.fn();

// Mock console methods for testing
const mockConsoleError = jest.fn();

beforeEach(() => {
  // Reset mocks
  mockPersonalitiesSave.mockClear();
  mockPersonalitiesLoad.mockClear();
  mockPersonalitiesReset.mockClear();
  mockConsoleError.mockClear();

  // Mock window.electronAPI
  Object.defineProperty(window, "electronAPI", {
    value: {
      personalities: {
        save: mockPersonalitiesSave,
        load: mockPersonalitiesLoad,
        reset: mockPersonalitiesReset,
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
const mockPersonalitiesData: PersistedPersonalitiesSettingsData = {
  schemaVersion: "1.0.0",
  personalities: [
    {
      id: "personality-1",
      name: "Analyst",
      bigFive: {
        openness: 85,
        conscientiousness: 90,
        extraversion: 40,
        agreeableness: 70,
        neuroticism: 20,
      },
      behaviors: {
        analytical: 95,
        methodical: 90,
        detail_oriented: 85,
      },
      customInstructions: "Focus on data analysis and logical reasoning",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
  ],
  lastUpdated: new Date().toISOString(),
};

describe("DesktopPersonalitiesAdapter", () => {
  describe("Instance Creation", () => {
    it("should create a new instance successfully", () => {
      const adapter = new DesktopPersonalitiesAdapter();
      expect(adapter).toBeInstanceOf(DesktopPersonalitiesAdapter);
    });

    it("should export a singleton instance", () => {
      expect(desktopPersonalitiesAdapter).toBeInstanceOf(
        DesktopPersonalitiesAdapter,
      );
    });
  });

  describe("save method", () => {
    it("should save personalities successfully", async () => {
      mockPersonalitiesSave.mockResolvedValue(undefined);

      const adapter = new DesktopPersonalitiesAdapter();
      await expect(
        adapter.save(mockPersonalitiesData),
      ).resolves.toBeUndefined();

      expect(mockPersonalitiesSave).toHaveBeenCalledTimes(1);
      expect(mockPersonalitiesSave).toHaveBeenCalledWith(mockPersonalitiesData);
    });

    it("should throw PersonalitiesPersistenceError when electronAPI.personalities.save throws", async () => {
      const errorMessage = "Database connection failed";
      mockPersonalitiesSave.mockRejectedValue(new Error(errorMessage));

      const adapter = new DesktopPersonalitiesAdapter();

      await expect(adapter.save(mockPersonalitiesData)).rejects.toThrow(
        PersonalitiesPersistenceError,
      );
      await expect(adapter.save(mockPersonalitiesData)).rejects.toMatchObject({
        operation: "save",
        message: errorMessage,
      });

      expect(mockPersonalitiesSave).toHaveBeenCalledWith(mockPersonalitiesData);
    });

    it("should throw PersonalitiesPersistenceError with generic message for non-Error objects", async () => {
      mockPersonalitiesSave.mockRejectedValue("String error");

      const adapter = new DesktopPersonalitiesAdapter();

      await expect(adapter.save(mockPersonalitiesData)).rejects.toThrow(
        PersonalitiesPersistenceError,
      );
      await expect(adapter.save(mockPersonalitiesData)).rejects.toMatchObject({
        operation: "save",
        message: "Failed to save personalities",
      });
    });

    it("should preserve PersonalitiesPersistenceError if already thrown", async () => {
      const originalError = new PersonalitiesPersistenceError(
        "Original error",
        "save",
      );
      mockPersonalitiesSave.mockRejectedValue(originalError);

      const adapter = new DesktopPersonalitiesAdapter();

      await expect(adapter.save(mockPersonalitiesData)).rejects.toBe(
        originalError,
      );
    });

    it("should include original error in PersonalitiesPersistenceError", async () => {
      const originalError = new Error("Original error");
      mockPersonalitiesSave.mockRejectedValue(originalError);

      const adapter = new DesktopPersonalitiesAdapter();

      try {
        await adapter.save(mockPersonalitiesData);
      } catch (error) {
        expect(error).toBeInstanceOf(PersonalitiesPersistenceError);
        expect((error as PersonalitiesPersistenceError).cause).toBe(
          originalError,
        );
      }
    });

    it("should handle undefined electronAPI gracefully", async () => {
      delete (window as any).electronAPI;

      const adapter = new DesktopPersonalitiesAdapter();

      await expect(adapter.save(mockPersonalitiesData)).rejects.toThrow(
        PersonalitiesPersistenceError,
      );
    });

    it("should handle null error objects", async () => {
      mockPersonalitiesSave.mockRejectedValue(null);

      const adapter = new DesktopPersonalitiesAdapter();

      await expect(adapter.save(mockPersonalitiesData)).rejects.toMatchObject({
        operation: "save",
        message: "Failed to save personalities",
      });
    });

    it("should handle undefined error objects", async () => {
      mockPersonalitiesSave.mockRejectedValue(undefined);

      const adapter = new DesktopPersonalitiesAdapter();

      await expect(adapter.save(mockPersonalitiesData)).rejects.toMatchObject({
        operation: "save",
        message: "Failed to save personalities",
      });
    });
  });

  describe("Interface Compliance", () => {
    it("should implement all PersonalitiesPersistenceAdapter methods", () => {
      const adapter = new DesktopPersonalitiesAdapter();

      expect(typeof adapter.save).toBe("function");
      expect(typeof adapter.load).toBe("function");
      expect(typeof adapter.reset).toBe("function");
    });

    it("should return correct types from save method", async () => {
      mockPersonalitiesSave.mockResolvedValue(undefined);

      const adapter = new DesktopPersonalitiesAdapter();

      // save should return Promise<void>
      const saveResult = adapter.save(mockPersonalitiesData);
      expect(saveResult).toBeInstanceOf(Promise);
      await expect(saveResult).resolves.toBeUndefined();
    });
  });

  describe("Singleton Instance", () => {
    it("should export the same instance on multiple imports", () => {
      expect(desktopPersonalitiesAdapter).toBe(desktopPersonalitiesAdapter);
    });

    it("should work correctly with the singleton instance", async () => {
      mockPersonalitiesSave.mockResolvedValue(undefined);

      await expect(
        desktopPersonalitiesAdapter.save(mockPersonalitiesData),
      ).resolves.toBeUndefined();

      expect(mockPersonalitiesSave).toHaveBeenCalledWith(mockPersonalitiesData);
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle IPC timeout errors", async () => {
      const timeoutError = new Error("IPC timeout");
      timeoutError.name = "TimeoutError";
      mockPersonalitiesSave.mockRejectedValue(timeoutError);

      const adapter = new DesktopPersonalitiesAdapter();

      await expect(adapter.save(mockPersonalitiesData)).rejects.toThrow(
        PersonalitiesPersistenceError,
      );
      await expect(adapter.save(mockPersonalitiesData)).rejects.toMatchObject({
        operation: "save",
        message: "IPC timeout",
      });
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network unavailable");
      networkError.name = "NetworkError";
      mockPersonalitiesSave.mockRejectedValue(networkError);

      const adapter = new DesktopPersonalitiesAdapter();

      await expect(adapter.save(mockPersonalitiesData)).rejects.toThrow(
        PersonalitiesPersistenceError,
      );
      await expect(adapter.save(mockPersonalitiesData)).rejects.toMatchObject({
        operation: "save",
        message: "Network unavailable",
      });
    });

    it("should handle large personality datasets", async () => {
      const largeDataset: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: Array.from({ length: 100 }, (_, i) => ({
          id: `personality-${i}`,
          name: `Personality ${i}`,
          bigFive: {
            openness: 50,
            conscientiousness: 50,
            extraversion: 50,
            agreeableness: 50,
            neuroticism: 50,
          },
          behaviors: {
            analytical: 50,
          },
          customInstructions: "Standard personality",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        })),
        lastUpdated: new Date().toISOString(),
      };

      mockPersonalitiesSave.mockResolvedValue(undefined);

      const adapter = new DesktopPersonalitiesAdapter();
      await expect(adapter.save(largeDataset)).resolves.toBeUndefined();

      expect(mockPersonalitiesSave).toHaveBeenCalledWith(largeDataset);
    });

    it("should handle empty personalities array", async () => {
      const emptyData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [],
        lastUpdated: new Date().toISOString(),
      };

      mockPersonalitiesSave.mockResolvedValue(undefined);

      const adapter = new DesktopPersonalitiesAdapter();
      await expect(adapter.save(emptyData)).resolves.toBeUndefined();

      expect(mockPersonalitiesSave).toHaveBeenCalledWith(emptyData);
    });
  });

  describe("Performance Tests", () => {
    it("should complete save operation within reasonable time", async () => {
      mockPersonalitiesSave.mockResolvedValue(undefined);

      const adapter = new DesktopPersonalitiesAdapter();
      const startTime = Date.now();

      await adapter.save(mockPersonalitiesData);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 200ms for typical dataset
      expect(duration).toBeLessThan(200);
    });

    it("should handle concurrent save operations", async () => {
      mockPersonalitiesSave.mockResolvedValue(undefined);

      const adapter = new DesktopPersonalitiesAdapter();

      // Start multiple save operations concurrently
      const promises = Array.from({ length: 5 }, () =>
        adapter.save(mockPersonalitiesData),
      );

      await expect(Promise.all(promises)).resolves.toEqual(
        Array(5).fill(undefined),
      );

      expect(mockPersonalitiesSave).toHaveBeenCalledTimes(5);
    });
  });
});
