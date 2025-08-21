import type { IpcMain } from "electron";
import {
  LLM_MODELS_CHANNELS,
  type LlmModelsLoadResponse,
} from "../../../shared/ipc/index";
import { setupLlmModelsHandlers } from "../llmModelsHandlers";
import { llmModelsRepositoryManager } from "../../../data/repositories/llmModelsRepositoryManager";
import type { LlmModelsRepository } from "../../../data/repositories/LlmModelsRepository";
import type { PersistedLlmModelsSettingsData } from "@fishbowl-ai/shared";

// Mock the repository manager
jest.mock("../../../data/repositories/llmModelsRepositoryManager");

// Mock console.error to prevent test output pollution
const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

describe("llmModelsHandlers", () => {
  let mockIpcMain: jest.Mocked<IpcMain>;
  let mockRepository: jest.Mocked<LlmModelsRepository>;

  beforeEach(() => {
    // Create mock IpcMain
    mockIpcMain = {
      handle: jest.fn(),
    } as unknown as jest.Mocked<IpcMain>;

    // Create mock repository
    mockRepository = {
      loadLlmModels: jest.fn(),
    } as unknown as jest.Mocked<LlmModelsRepository>;

    // Reset mocks
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("setupLlmModelsHandlers", () => {
    it("should register LOAD handler with ipcMain", () => {
      setupLlmModelsHandlers(mockIpcMain);

      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        LLM_MODELS_CHANNELS.LOAD,
        expect.any(Function),
      );
    });

    describe("LOAD handler", () => {
      it("should return success response when repository loads models successfully", async () => {
        const mockLlmModels: PersistedLlmModelsSettingsData = {
          schemaVersion: "1.0.0",
          providers: [
            {
              id: "openai",
              name: "OpenAI",
              models: [
                {
                  id: "gpt-4-turbo",
                  name: "GPT-4 Turbo",
                  contextLength: 128000,
                },
              ],
            },
          ],
          lastUpdated: "2025-01-21T10:00:00.000Z",
        };

        (llmModelsRepositoryManager.get as jest.Mock).mockReturnValue(
          mockRepository,
        );
        mockRepository.loadLlmModels.mockResolvedValue(mockLlmModels);

        setupLlmModelsHandlers(mockIpcMain);
        const handler = (mockIpcMain.handle as jest.Mock).mock.calls.find(
          ([channel]) => channel === LLM_MODELS_CHANNELS.LOAD,
        )?.[1];

        const result: LlmModelsLoadResponse = await handler(null);

        expect(result).toEqual({
          success: true,
          data: mockLlmModels,
        });
        expect(llmModelsRepositoryManager.get).toHaveBeenCalled();
        expect(mockRepository.loadLlmModels).toHaveBeenCalled();
      });

      it("should return error response when repository is not initialized", async () => {
        (llmModelsRepositoryManager.get as jest.Mock).mockImplementation(() => {
          throw new Error("LLM models repository not initialized");
        });

        setupLlmModelsHandlers(mockIpcMain);
        const handler = (mockIpcMain.handle as jest.Mock).mock.calls.find(
          ([channel]) => channel === LLM_MODELS_CHANNELS.LOAD,
        )?.[1];

        const result: LlmModelsLoadResponse = await handler(null);

        expect(result).toEqual({
          success: false,
          error: {
            message: "LLM models repository not initialized",
            code: "Error",
          },
        });
        expect(console.error).toHaveBeenCalledWith(
          "Failed to load LLM models:",
          expect.any(Error),
        );
      });

      it("should return error response when repository throws during load", async () => {
        const loadError = new Error("Failed to read file");
        (llmModelsRepositoryManager.get as jest.Mock).mockReturnValue(
          mockRepository,
        );
        mockRepository.loadLlmModels.mockRejectedValue(loadError);

        setupLlmModelsHandlers(mockIpcMain);
        const handler = (mockIpcMain.handle as jest.Mock).mock.calls.find(
          ([channel]) => channel === LLM_MODELS_CHANNELS.LOAD,
        )?.[1];

        const result: LlmModelsLoadResponse = await handler(null);

        expect(result).toEqual({
          success: false,
          error: {
            message: "Failed to read file",
            code: "Error",
          },
        });
        expect(console.error).toHaveBeenCalledWith(
          "Failed to load LLM models:",
          loadError,
        );
      });

      it("should handle non-Error exceptions gracefully", async () => {
        (llmModelsRepositoryManager.get as jest.Mock).mockImplementation(() => {
          throw "String error";
        });

        setupLlmModelsHandlers(mockIpcMain);
        const handler = (mockIpcMain.handle as jest.Mock).mock.calls.find(
          ([channel]) => channel === LLM_MODELS_CHANNELS.LOAD,
        )?.[1];

        const result: LlmModelsLoadResponse = await handler(null);

        expect(result).toEqual({
          success: false,
          error: {
            message: "String error",
            code: "UNKNOWN_ERROR",
          },
        });
        expect(console.error).toHaveBeenCalledWith(
          "Failed to load LLM models:",
          "String error",
        );
      });
    });
  });
});
