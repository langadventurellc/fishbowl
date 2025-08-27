import { ipcMain } from "electron";
import { setupPersonalityDefinitionsHandlers } from "../personalityDefinitionsHandlers";
import {
  PERSONALITY_DEFINITIONS_CHANNELS,
  type GetDefinitionsResponse,
} from "../../../shared/ipc/index";
import { serializeError } from "../../utils/errorSerialization";
import { DesktopPersonalityDefinitionsService } from "../../services/DesktopPersonalityDefinitionsService";
import { PersonalityDefinitions } from "@fishbowl-ai/shared";

// Mock electron
jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

// Mock DesktopPersonalityDefinitionsService
jest.mock("../../services/DesktopPersonalityDefinitionsService", () => ({
  DesktopPersonalityDefinitionsService: {
    getInstance: jest.fn(),
  },
}));

// Mock errorSerialization
jest.mock("../../utils/errorSerialization", () => ({
  serializeError: jest.fn((error) => ({
    message: error.message,
    code: "TEST_ERROR",
  })),
}));

describe("personalityDefinitionsHandlers", () => {
  let mockService: {
    loadDefinitions: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock service
    mockService = {
      loadDefinitions: jest.fn(),
    };

    // Setup mock getInstance to return mock service
    (
      DesktopPersonalityDefinitionsService.getInstance as jest.Mock
    ).mockReturnValue(mockService);
  });

  describe("setupPersonalityDefinitionsHandlers", () => {
    it("should register IPC handler for personality:get-definitions", () => {
      setupPersonalityDefinitionsHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        PERSONALITY_DEFINITIONS_CHANNELS.GET_DEFINITIONS,
        expect.any(Function),
      );
    });

    describe("personality:get-definitions handler", () => {
      let handlerFunction: Function;

      beforeEach(() => {
        setupPersonalityDefinitionsHandlers();
        // Extract the handler function that was passed to ipcMain.handle
        const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
          (call) =>
            call[0] === PERSONALITY_DEFINITIONS_CHANNELS.GET_DEFINITIONS,
        );
        handlerFunction = handleCall[1];
      });

      it("should return personality definitions on success", async () => {
        const mockDefinitions: PersonalityDefinitions = {
          sections: [
            {
              id: "big5",
              name: "Big 5 Personality Traits",
              values: [
                {
                  id: "openness",
                  name: "Openness",
                  values: {
                    "0": { short: "Conservative", prompt: "Prefers tradition" },
                    "20": { short: "Cautious", prompt: "Somewhat traditional" },
                    "40": { short: "Moderate", prompt: "Balanced approach" },
                    "60": { short: "Open", prompt: "Welcomes new ideas" },
                    "80": { short: "Creative", prompt: "Highly innovative" },
                    "100": {
                      short: "Adventurous",
                      prompt: "Extremely open-minded",
                    },
                  },
                },
              ],
            },
          ],
        };

        mockService.loadDefinitions.mockResolvedValue(mockDefinitions);

        const result: GetDefinitionsResponse = await handlerFunction({});

        expect(result).toEqual({
          success: true,
          data: mockDefinitions,
        });
        expect(mockService.loadDefinitions).toHaveBeenCalledTimes(1);
      });

      it("should return error response when service throws", async () => {
        const error = new Error("Failed to load definitions");
        mockService.loadDefinitions.mockRejectedValue(error);

        const result: GetDefinitionsResponse = await handlerFunction({});

        expect(result).toEqual({
          success: false,
          error: {
            message: "Failed to load definitions",
            code: "TEST_ERROR",
          },
        });
        expect(serializeError).toHaveBeenCalledWith(error);
      });

      it("should handle service instance not available", async () => {
        (
          DesktopPersonalityDefinitionsService.getInstance as jest.Mock
        ).mockImplementation(() => {
          throw new Error("Service not available");
        });

        const result: GetDefinitionsResponse = await handlerFunction({});

        expect(result).toEqual({
          success: false,
          error: {
            message: "Service not available",
            code: "TEST_ERROR",
          },
        });
      });
    });
  });
});
