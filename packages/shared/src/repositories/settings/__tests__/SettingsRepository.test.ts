import { SettingsRepository } from "../SettingsRepository";
import { FileStorageService } from "../../../services/storage/FileStorageService";
import {
  FileStorageError,
  SettingsValidationError,
} from "../../../services/storage/errors";
import { createDefaultPersistedSettings } from "../../../types/settings/createDefaultPersistedSettings";
import type { PersistedSettings } from "../../../types/settings/PersistedSettings";

// Mock FileStorageService
jest.mock("../../../services/storage/FileStorageService");
const MockedFileStorageService = FileStorageService as jest.MockedClass<
  typeof FileStorageService
>;

describe("SettingsRepository", () => {
  let repository: SettingsRepository;
  let mockFileStorageService: jest.Mocked<FileStorageService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFileStorageService =
      new MockedFileStorageService() as jest.Mocked<FileStorageService>;
    repository = new SettingsRepository(mockFileStorageService);
  });

  describe("getDefaultSettings", () => {
    it("should return complete default settings", () => {
      const defaults = repository.getDefaultSettings();

      expect(defaults).toHaveProperty("schemaVersion");
      expect(defaults).toHaveProperty("general");
      expect(defaults).toHaveProperty("appearance");
      expect(defaults).toHaveProperty("advanced");
      expect(defaults).toHaveProperty("lastUpdated");
      expect(typeof defaults.lastUpdated).toBe("string");
    });

    it("should return settings that match the default factory", () => {
      const defaults = repository.getDefaultSettings();
      const factoryDefaults = createDefaultPersistedSettings();

      // Compare structure (timestamps will differ)
      expect(defaults.schemaVersion).toBe(factoryDefaults.schemaVersion);
      expect(defaults.general).toEqual(factoryDefaults.general);
      expect(defaults.appearance).toEqual(factoryDefaults.appearance);
      expect(defaults.advanced).toEqual(factoryDefaults.advanced);
    });
  });

  describe("validateSettings", () => {
    it("should validate and return complete settings object", () => {
      const validSettings = createDefaultPersistedSettings();

      const result = repository.validateSettings(validSettings);

      expect(result).toEqual(validSettings);
    });

    it("should apply defaults for missing fields", () => {
      const partialSettings = {
        schemaVersion: "1.0.0",
        general: {},
        appearance: {},
        advanced: {},
      };

      const result = repository.validateSettings(partialSettings);

      expect(result.general).toHaveProperty("responseDelay");
      expect(result.general).toHaveProperty("checkUpdates");
      expect(result.appearance).toHaveProperty("theme");
      expect(result.advanced).toHaveProperty("debugMode");
      expect(result).toHaveProperty("lastUpdated");
    });

    it("should throw SettingsValidationError for invalid data", () => {
      const invalidSettings = {
        schemaVersion: 123, // Should be string
        general: "invalid", // Should be object
      };

      expect(() => repository.validateSettings(invalidSettings)).toThrow(
        SettingsValidationError,
      );
    });

    it("should provide detailed error information for validation failures", () => {
      const invalidSettings = {
        schemaVersion: 123,
        general: "invalid",
      };

      try {
        repository.validateSettings(invalidSettings);
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors.length).toBeGreaterThan(0);
          expect(
            error.fieldErrors.some((e) => e.path.includes("schemaVersion")),
          ).toBe(true);
          expect(
            error.fieldErrors.some((e) => e.path.includes("general")),
          ).toBe(true);
        }
      }
    });
  });

  describe("loadSettings", () => {
    it("should load and validate settings from file", async () => {
      const storedSettings = createDefaultPersistedSettings();
      mockFileStorageService.readJsonFile.mockResolvedValue(storedSettings);

      const result = await repository.loadSettings();

      expect(mockFileStorageService.readJsonFile).toHaveBeenCalledWith(
        "preferences.json",
      );
      expect(result).toEqual(storedSettings);
    });

    it("should return defaults when file does not exist", async () => {
      const fileNotFoundError = new (class extends FileStorageError {
        constructor() {
          super("File not found", "read", "preferences.json");
        }
      })();

      mockFileStorageService.readJsonFile.mockRejectedValue(fileNotFoundError);
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      const result = await repository.loadSettings();

      expect(result).toHaveProperty("schemaVersion");
      expect(result).toHaveProperty("general");
      expect(result).toHaveProperty("appearance");
      expect(result).toHaveProperty("advanced");
    });

    it("should attempt to save defaults when file does not exist", async () => {
      const fileNotFoundError = new (class extends FileStorageError {
        constructor() {
          super("File not found", "read", "preferences.json");
        }
      })();

      mockFileStorageService.readJsonFile.mockRejectedValue(fileNotFoundError);
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      await repository.loadSettings();

      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledWith(
        "preferences.json",
        expect.objectContaining({
          schemaVersion: expect.any(String),
          general: expect.any(Object),
          appearance: expect.any(Object),
          advanced: expect.any(Object),
        }),
      );
    });

    it("should re-throw non-FileStorageError exceptions", async () => {
      const unexpectedError = new Error("Unexpected error");
      mockFileStorageService.readJsonFile.mockRejectedValue(unexpectedError);

      await expect(repository.loadSettings()).rejects.toThrow(
        "Unexpected error",
      );
    });
  });

  describe("saveSettings", () => {
    const existingSettings = createDefaultPersistedSettings();

    beforeEach(() => {
      mockFileStorageService.readJsonFile.mockResolvedValue(existingSettings);
      mockFileStorageService.writeJsonFile.mockResolvedValue();
    });

    it("should merge partial settings with existing settings", async () => {
      const partialUpdate = {
        general: {
          responseDelay: 3000,
        },
      } as Partial<PersistedSettings>;

      await repository.saveSettings(partialUpdate);

      expect(mockFileStorageService.writeJsonFile).toHaveBeenCalledWith(
        "preferences.json",
        expect.objectContaining({
          general: expect.objectContaining({
            responseDelay: 3000,
            checkUpdates: existingSettings.general.checkUpdates, // Should preserve existing
          }),
          appearance: existingSettings.appearance, // Should preserve unchanged categories
          advanced: existingSettings.advanced,
        }),
      );
    });

    it("should update lastUpdated timestamp", async () => {
      const beforeTime = Date.now();
      const partialUpdate = {
        general: {
          responseDelay: 5000,
        },
      } as Partial<PersistedSettings>;

      await repository.saveSettings(partialUpdate);

      const savedSettings = mockFileStorageService.writeJsonFile.mock
        .calls[0]?.[1] as PersistedSettings;
      const savedTime = new Date(savedSettings.lastUpdated).getTime();

      expect(savedTime).toBeGreaterThanOrEqual(beforeTime);
      expect(savedTime).toBeLessThanOrEqual(Date.now());
    });

    it("should perform deep merge for nested objects", async () => {
      const partialUpdate = {
        general: {
          responseDelay: 4000,
        },
        appearance: {
          theme: "dark" as const,
        },
      } as Partial<PersistedSettings>;

      await repository.saveSettings(partialUpdate);

      const savedSettings = mockFileStorageService.writeJsonFile.mock
        .calls[0]?.[1] as PersistedSettings;

      expect(savedSettings.general.responseDelay).toBe(4000);
      expect(savedSettings.general.checkUpdates).toBe(
        existingSettings.general.checkUpdates,
      );
      expect(savedSettings.appearance.theme).toBe("dark");
      expect(savedSettings.appearance.fontSize).toBe(
        existingSettings.appearance.fontSize,
      );
    });

    it("should validate merged settings before saving", async () => {
      const invalidUpdate = {
        general: {
          maximumMessages: -5, // Invalid: should be positive
        },
      } as Partial<PersistedSettings>;

      await expect(repository.saveSettings(invalidUpdate)).rejects.toThrow(
        SettingsValidationError,
      );

      expect(mockFileStorageService.writeJsonFile).not.toHaveBeenCalled();
    });

    it("should re-throw FileStorageError from write operations", async () => {
      const writeError = new (class extends FileStorageError {
        constructor() {
          super("Write failed", "write", "preferences.json");
        }
      })();

      mockFileStorageService.writeJsonFile.mockRejectedValue(writeError);

      await expect(
        repository.saveSettings({
          general: {
            responseDelay: 1500,
          },
        } as Partial<PersistedSettings>),
      ).rejects.toThrow("Write failed");
    });

    it("should re-throw SettingsValidationError from validation", async () => {
      const validationError = new SettingsValidationError(
        "preferences.json",
        "validation",
        [{ path: "test", message: "test error" }],
      );

      mockFileStorageService.readJsonFile.mockRejectedValue(validationError);

      await expect(
        repository.saveSettings({
          general: {
            responseDelay: 2500,
          },
        } as Partial<PersistedSettings>),
      ).rejects.toThrow(SettingsValidationError);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete settings lifecycle", async () => {
      // First load returns file not found
      const fileNotFoundError = new (class extends FileStorageError {
        constructor() {
          super("File not found", "read", "preferences.json");
        }
      })();

      mockFileStorageService.readJsonFile.mockRejectedValueOnce(
        fileNotFoundError,
      );
      mockFileStorageService.writeJsonFile.mockResolvedValue();

      // First load creates defaults
      const initialSettings = await repository.loadSettings();
      expect(initialSettings.general.responseDelay).toBe(2000);

      // For the saveSettings call, the loadSettings will be called again internally
      // So we need to mock the second read to return the settings we just saved
      mockFileStorageService.readJsonFile.mockResolvedValueOnce(
        initialSettings,
      );

      // Update settings
      await repository.saveSettings({
        general: { responseDelay: 3000 },
        appearance: { theme: "dark" },
      } as Partial<PersistedSettings>);

      // Verify the write was called with merged data
      const savedData = mockFileStorageService.writeJsonFile.mock
        .calls[1]?.[1] as PersistedSettings; // Index 1 because first call was saving defaults
      expect(savedData.general.responseDelay).toBe(3000);
      expect(savedData.appearance.theme).toBe("dark");
      expect(savedData.general.checkUpdates).toBe(true); // Preserved from defaults
    });
  });
});
