import { ipcMain } from "electron";
import { setupPersonalitiesHandlers } from "../personalitiesHandlers";
import {
  PERSONALITIES_CHANNELS,
  type PersonalitiesLoadResponse,
  type PersonalitiesSaveRequest,
  type PersonalitiesSaveResponse,
  type PersonalitiesResetResponse,
} from "../../shared/ipc/index";
import { serializeError } from "../utils/errorSerialization";
import { personalitiesRepositoryManager } from "../../data/repositories/personalitiesRepositoryManager";
import { PersistedPersonalitiesSettingsData } from "@fishbowl-ai/shared";

// Mock electron
jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

// Mock personalitiesRepositoryManager module
jest.mock("../../data/repositories/personalitiesRepositoryManager", () => ({
  personalitiesRepositoryManager: {
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

describe("personalitiesHandlers", () => {
  let mockRepository: {
    loadPersonalities: jest.Mock;
    savePersonalities: jest.Mock;
    resetPersonalities: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock repository
    mockRepository = {
      loadPersonalities: jest.fn(),
      savePersonalities: jest.fn(),
      resetPersonalities: jest.fn(),
    };

    (personalitiesRepositoryManager.get as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  describe("setupPersonalitiesHandlers", () => {
    it("should register all personalities handlers", () => {
      setupPersonalitiesHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        PERSONALITIES_CHANNELS.LOAD,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        PERSONALITIES_CHANNELS.SAVE,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        PERSONALITIES_CHANNELS.RESET,
        expect.any(Function),
      );
    });
  });

  describe("LOAD handler", () => {
    it("should load personalities from repository", async () => {
      const mockPersonalities: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Test Personality",
            bigFive: {
              openness: 75,
              conscientiousness: 80,
              extraversion: 60,
              agreeableness: 85,
              neuroticism: 30,
            },
            behaviors: {
              creativity: 80,
              analytical: 70,
            },
            customInstructions: "Test instructions",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z",
          },
        ],
        lastUpdated: "2025-01-01T12:00:00.000Z",
      };

      mockRepository.loadPersonalities.mockResolvedValue(mockPersonalities);

      setupPersonalitiesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === PERSONALITIES_CHANNELS.LOAD,
      )[1];

      const result: PersonalitiesLoadResponse = await handler();

      expect(mockRepository.loadPersonalities).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockPersonalities });
    });

    it("should return default personalities when personalities file doesn't exist", async () => {
      const mockDefaultPersonalities: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "default-personality",
            name: "Default Personality",
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {
              creativity: 50,
              analytical: 50,
            },
            customInstructions: "Default instructions",
            createdAt: null,
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      mockRepository.loadPersonalities.mockResolvedValue(
        mockDefaultPersonalities,
      );

      setupPersonalitiesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === PERSONALITIES_CHANNELS.LOAD,
      )[1];

      const result: PersonalitiesLoadResponse = await handler();

      expect(mockRepository.loadPersonalities).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockDefaultPersonalities });
    });

    it("should handle errors when loading fails", async () => {
      const error = new Error("Failed to load personalities");
      mockRepository.loadPersonalities.mockRejectedValue(error);

      setupPersonalitiesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === PERSONALITIES_CHANNELS.LOAD,
      )[1];

      const result: PersonalitiesLoadResponse = await handler();

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });

    it("should handle repository not initialized error", async () => {
      const error = new Error("Personalities repository not initialized");
      (personalitiesRepositoryManager.get as jest.Mock).mockImplementation(
        () => {
          throw error;
        },
      );

      setupPersonalitiesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === PERSONALITIES_CHANNELS.LOAD,
      )[1];

      const result: PersonalitiesLoadResponse = await handler();

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
    });
  });

  describe("SAVE handler", () => {
    it("should save personalities to repository", async () => {
      const personalitiesData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Updated Personality",
            bigFive: {
              openness: 85,
              conscientiousness: 90,
              extraversion: 70,
              agreeableness: 95,
              neuroticism: 20,
            },
            behaviors: {
              creativity: 90,
              analytical: 80,
              leadership: 75,
            },
            customInstructions: "Updated instructions",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-02T00:00:00.000Z",
          },
        ],
        lastUpdated: "2025-01-02T10:30:00.000Z",
      };

      const request: PersonalitiesSaveRequest = {
        personalities: personalitiesData,
      };

      mockRepository.savePersonalities.mockResolvedValue(undefined);

      setupPersonalitiesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === PERSONALITIES_CHANNELS.SAVE,
      )[1];

      const result: PersonalitiesSaveResponse = await handler(null, request);

      expect(mockRepository.savePersonalities).toHaveBeenCalledWith(
        personalitiesData,
      );
      expect(result).toEqual({ success: true });
    });

    it("should handle save errors", async () => {
      const error = new Error("Failed to save personalities");
      const personalitiesData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const request: PersonalitiesSaveRequest = {
        personalities: personalitiesData,
      };

      mockRepository.savePersonalities.mockRejectedValue(error);

      setupPersonalitiesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === PERSONALITIES_CHANNELS.SAVE,
      )[1];

      const result: PersonalitiesSaveResponse = await handler(null, request);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });

    it("should handle repository not initialized error during save", async () => {
      const error = new Error("Personalities repository not initialized");
      (personalitiesRepositoryManager.get as jest.Mock).mockImplementation(
        () => {
          throw error;
        },
      );

      const request: PersonalitiesSaveRequest = {
        personalities: {} as PersistedPersonalitiesSettingsData,
      };

      setupPersonalitiesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === PERSONALITIES_CHANNELS.SAVE,
      )[1];

      const result: PersonalitiesSaveResponse = await handler(null, request);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
    });
  });

  describe("RESET handler", () => {
    it("should reset personalities and return undefined", async () => {
      mockRepository.resetPersonalities.mockResolvedValue(undefined);

      setupPersonalitiesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === PERSONALITIES_CHANNELS.RESET,
      )[1];

      const result: PersonalitiesResetResponse = await handler();

      expect(mockRepository.resetPersonalities).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: undefined });
    });

    it("should handle errors during reset operation", async () => {
      const error = new Error("Failed to reset personalities");
      mockRepository.resetPersonalities.mockRejectedValue(error);

      setupPersonalitiesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === PERSONALITIES_CHANNELS.RESET,
      )[1];

      const result: PersonalitiesResetResponse = await handler();

      expect(mockRepository.resetPersonalities).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });

    it("should handle repository not initialized error during reset", async () => {
      const error = new Error("Personalities repository not initialized");
      (personalitiesRepositoryManager.get as jest.Mock).mockImplementation(
        () => {
          throw error;
        },
      );

      setupPersonalitiesHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === PERSONALITIES_CHANNELS.RESET,
      )[1];

      const result: PersonalitiesResetResponse = await handler();

      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
    });
  });
});
