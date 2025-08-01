import type { SettingsPersistenceAdapter } from "../SettingsPersistenceAdapter";
import type { PersistedSettingsData } from "@fishbowl-ai/shared";

describe("SettingsPersistenceAdapter", () => {
  describe("Interface Contract", () => {
    it("should define required methods", () => {
      // This test verifies the interface structure at compile time
      const mockAdapter: SettingsPersistenceAdapter = {
        save: jest.fn(),
        load: jest.fn(),
        reset: jest.fn(),
      };

      expect(mockAdapter.save).toBeDefined();
      expect(mockAdapter.load).toBeDefined();
      expect(mockAdapter.reset).toBeDefined();
    });

    it("should enforce correct method signatures", async () => {
      const testSettings: PersistedSettingsData = {
        schemaVersion: "1.0.0",
        lastUpdated: new Date().toISOString(),
        general: {
          responseDelay: 2000,
          maximumMessages: 50,
          maximumWaitTime: 30000,
          defaultMode: "manual",
          maximumAgents: 4,
          checkUpdates: true,
        },
        appearance: {
          theme: "dark",
          showTimestamps: "hover",
          showActivityTime: true,
          compactList: false,
          fontSize: 14,
          messageSpacing: "normal",
        },
        advanced: {
          debugMode: false,
          experimentalFeatures: false,
        },
      };

      const mockAdapter: SettingsPersistenceAdapter = {
        save: jest.fn().mockResolvedValue(undefined),
        load: jest.fn().mockResolvedValue(testSettings),
        reset: jest.fn().mockResolvedValue(undefined),
      };

      // Test save method
      await expect(mockAdapter.save(testSettings)).resolves.toBeUndefined();
      expect(mockAdapter.save).toHaveBeenCalledWith(testSettings);

      // Test load method
      await expect(mockAdapter.load()).resolves.toBe(testSettings);
      expect(mockAdapter.load).toHaveBeenCalled();

      // Test reset method
      await expect(mockAdapter.reset()).resolves.toBeUndefined();
      expect(mockAdapter.reset).toHaveBeenCalled();
    });

    it("should handle null return from load", async () => {
      const mockAdapter: SettingsPersistenceAdapter = {
        save: jest.fn(),
        load: jest.fn().mockResolvedValue(null),
        reset: jest.fn(),
      };

      const result = await mockAdapter.load();
      expect(result).toBeNull();
    });

    it("should support async operations", () => {
      const mockAdapter: SettingsPersistenceAdapter = {
        save: jest.fn().mockResolvedValue(undefined),
        load: jest.fn().mockResolvedValue(null),
        reset: jest.fn().mockResolvedValue(undefined),
      };

      // Verify all methods return promises
      expect(mockAdapter.save({} as PersistedSettingsData)).toBeInstanceOf(
        Promise,
      );
      expect(mockAdapter.load()).toBeInstanceOf(Promise);
      expect(mockAdapter.reset()).toBeInstanceOf(Promise);
    });
  });
});
