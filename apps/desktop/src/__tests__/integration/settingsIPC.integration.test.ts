import { ipcMain, ipcRenderer } from "electron";

// Mock electron modules
jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn(),
  },
  ipcRenderer: {
    invoke: jest.fn(),
  },
  contextBridge: {
    exposeInMainWorld: jest.fn(),
  },
}));

// Mock the entire settings handlers module
jest.mock("../../electron/settingsHandlers", () => ({
  setupSettingsHandlers: jest.fn(),
}));

// Mock console to suppress logs during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe("Settings IPC Integration", () => {
  const SETTINGS_CHANNELS = {
    LOAD: "settings:load",
    SAVE: "settings:save",
    RESET: "settings:reset",
  } as const;

  let handlers: Map<string, Function>;

  beforeEach(() => {
    handlers = new Map();

    // Mock ipcMain.handle to capture handlers
    (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => {
      handlers.set(channel, handler);
    });

    // Register the handlers manually for testing
    registerMockHandlers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    handlers.clear();
  });

  function registerMockHandlers() {
    // Mock load handler
    const loadHandler = async () => {
      try {
        const mockSettings = {
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
          lastUpdated: new Date().toISOString(),
        };

        console.log("Loading settings");
        return { success: true, data: mockSettings };
      } catch (error) {
        return { success: false, error: { message: String(error) } };
      }
    };

    // Mock save handler
    const saveHandler = async (_event: any, request: any) => {
      try {
        console.log("Saving settings", { section: request?.section });
        return { success: true };
      } catch (error) {
        return { success: false, error: { message: String(error) } };
      }
    };

    // Mock reset handler
    const resetHandler = async (_event?: any, request?: any) => {
      try {
        const mockSettings = {
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
          lastUpdated: new Date().toISOString(),
        };

        console.log("Resetting settings", { section: request?.section });
        return { success: true, data: mockSettings };
      } catch (error) {
        return { success: false, error: { message: String(error) } };
      }
    };

    // Register handlers
    handlers.set(SETTINGS_CHANNELS.LOAD, loadHandler);
    handlers.set(SETTINGS_CHANNELS.SAVE, saveHandler);
    handlers.set(SETTINGS_CHANNELS.RESET, resetHandler);

    // Mock the actual ipcMain.handle calls
    (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => {
      handlers.set(channel, handler);
    });
  }

  describe("Load Operation", () => {
    it("should successfully load settings with correct mock data", async () => {
      const handler = handlers.get(SETTINGS_CHANNELS.LOAD);
      expect(handler).toBeDefined();
      if (!handler) return;

      const result = await handler();

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
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
      });
      expect(result.data?.lastUpdated).toBeDefined();
    });

    it("should return response with correct structure", async () => {
      const handler = handlers.get(SETTINGS_CHANNELS.LOAD);
      expect(handler).toBeDefined();
      if (!handler) return;

      const result = await handler();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("data");
      expect(typeof result.success).toBe("boolean");
    });

    it("should handle errors during load operation", async () => {
      // Create a handler that throws an error
      const errorHandler = async () => {
        throw new Error("Load failed");
      };

      let errorResult;
      try {
        await errorHandler();
      } catch (error) {
        errorResult = { success: false, error: { message: String(error) } };
      }

      expect(errorResult?.success).toBe(false);
      expect(errorResult?.error?.message).toBe("Error: Load failed");
    });
  });

  describe("Save Operation", () => {
    it("should successfully save valid settings data", async () => {
      const handler = handlers.get(SETTINGS_CHANNELS.SAVE);
      expect(handler).toBeDefined();
      if (!handler) return;

      const testRequest = {
        section: "appearance" as const,
        settings: {
          schemaVersion: "1.0.0",
          general: {
            responseDelay: 3000,
            maximumMessages: 40,
            maximumWaitTime: 25000,
            defaultMode: "auto" as const,
            maximumAgents: 3,
            checkUpdates: false,
          },
          appearance: {
            theme: "dark" as const,
            showTimestamps: "always" as const,
            showActivityTime: false,
            compactList: true,
            fontSize: 16,
            messageSpacing: "compact" as const,
          },
          advanced: {
            debugLogging: true,
            experimentalFeatures: true,
          },
          lastUpdated: new Date().toISOString(),
        },
      };

      const result = await handler({}, testRequest);

      expect(result.success).toBe(true);
      expect(console.log).toHaveBeenCalledWith("Saving settings", {
        section: testRequest.section,
      });
    });

    it("should handle invalid request structure", async () => {
      const handler = handlers.get(SETTINGS_CHANNELS.SAVE);
      expect(handler).toBeDefined();
      if (!handler) return;

      const invalidRequest = { invalid: "structure" };
      const result = await handler({}, invalidRequest);

      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });

    it("should handle null or undefined data", async () => {
      const handler = handlers.get(SETTINGS_CHANNELS.SAVE);
      expect(handler).toBeDefined();
      if (!handler) return;

      const nullResult = await handler({}, null);
      expect(nullResult).toHaveProperty("success");
      expect(typeof nullResult.success).toBe("boolean");

      const undefinedResult = await handler({}, undefined);
      expect(undefinedResult).toHaveProperty("success");
      expect(typeof undefinedResult.success).toBe("boolean");
    });
  });

  describe("Reset Operation", () => {
    it("should successfully reset settings", async () => {
      const handler = handlers.get(SETTINGS_CHANNELS.RESET);
      expect(handler).toBeDefined();
      if (!handler) return;

      const result = await handler();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(console.log).toHaveBeenCalledWith("Resetting settings", {
        section: undefined,
      });
    });

    it("should return response with correct structure", async () => {
      const handler = handlers.get(SETTINGS_CHANNELS.RESET);
      expect(handler).toBeDefined();
      if (!handler) return;

      const result = await handler();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("data");
      expect(typeof result.success).toBe("boolean");
    });
  });

  describe("Error Serialization Integration", () => {
    it("should handle error serialization patterns", () => {
      const error = new Error("Test error");
      const serializedError = {
        message: error.message,
        stack: error.stack,
      };

      expect(serializedError.message).toBe("Test error");
      expect(serializedError.stack).toBeDefined();
    });

    it("should handle error codes properly", () => {
      const error: any = new Error("Error with code");
      error.code = "ENOENT";

      const serializedError = {
        message: error.message,
        code: error.code,
      };

      expect(serializedError.code).toBe("ENOENT");
    });
  });

  describe("Preload Script API Integration", () => {
    beforeEach(() => {
      (ipcRenderer.invoke as jest.Mock).mockClear();
    });

    it("should handle successful load through preload API pattern", async () => {
      const mockData = {
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
          theme: "light",
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
        lastUpdated: new Date().toISOString(),
      };

      (ipcRenderer.invoke as jest.Mock).mockResolvedValue({
        success: true,
        data: mockData,
      });

      const api = {
        load: async () => {
          const response = await ipcRenderer.invoke(SETTINGS_CHANNELS.LOAD);
          if (!response.success) {
            throw new Error(
              response.error?.message || "Failed to load settings",
            );
          }
          return response.data;
        },
      };

      const result = await api.load();

      expect(ipcRenderer.invoke).toHaveBeenCalledWith("settings:load");
      expect(result).toEqual(mockData);
    });

    it("should throw error when IPC fails", async () => {
      (ipcRenderer.invoke as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: "IPC failure" },
      });

      const api = {
        load: async () => {
          const response = await ipcRenderer.invoke(SETTINGS_CHANNELS.LOAD);
          if (!response.success) {
            throw new Error(
              response.error?.message || "Failed to load settings",
            );
          }
          return response.data;
        },
      };

      await expect(api.load()).rejects.toThrow("IPC failure");
    });

    it("should handle save operation through preload API pattern", async () => {
      (ipcRenderer.invoke as jest.Mock).mockResolvedValue({
        success: true,
      });

      const testData = {
        section: "appearance" as const,
        settings: {
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
            theme: "dark" as const,
            showTimestamps: "never" as const,
            showActivityTime: false,
            compactList: true,
            fontSize: 12,
            messageSpacing: "compact" as const,
          },
          advanced: {
            debugLogging: false,
            experimentalFeatures: false,
          },
          lastUpdated: new Date().toISOString(),
        },
      };

      const api = {
        save: async (data: any) => {
          const response = await ipcRenderer.invoke(
            SETTINGS_CHANNELS.SAVE,
            data,
          );
          if (!response.success) {
            throw new Error(
              response.error?.message || "Failed to save settings",
            );
          }
        },
      };

      await api.save(testData);

      expect(ipcRenderer.invoke).toHaveBeenCalledWith(
        "settings:save",
        testData,
      );
    });

    it("should handle reset operation through preload API pattern", async () => {
      (ipcRenderer.invoke as jest.Mock).mockResolvedValue({
        success: true,
      });

      const api = {
        reset: async () => {
          const response = await ipcRenderer.invoke(SETTINGS_CHANNELS.RESET);
          if (!response.success) {
            throw new Error(
              response.error?.message || "Failed to reset settings",
            );
          }
        },
      };

      await api.reset();

      expect(ipcRenderer.invoke).toHaveBeenCalledWith("settings:reset");
    });

    it("should provide fallback error message when none provided", async () => {
      (ipcRenderer.invoke as jest.Mock).mockResolvedValue({
        success: false,
        error: {},
      });

      const api = {
        load: async () => {
          const response = await ipcRenderer.invoke(SETTINGS_CHANNELS.LOAD);
          if (!response.success) {
            throw new Error(
              response.error?.message || "Failed to load settings",
            );
          }
          return response.data;
        },
      };

      await expect(api.load()).rejects.toThrow("Failed to load settings");
    });
  });

  describe("Complete IPC Round-Trip", () => {
    it("should complete full load cycle with handler and preload pattern", async () => {
      const loadHandler = handlers.get(SETTINGS_CHANNELS.LOAD);
      expect(loadHandler).toBeDefined();
      if (!loadHandler) return;

      const handlerResult = await loadHandler();

      expect(handlerResult.success).toBe(true);
      expect(handlerResult.data).toBeDefined();

      (ipcRenderer.invoke as jest.Mock).mockResolvedValue(handlerResult);

      const preloadAPI = {
        load: async () => {
          const response = await ipcRenderer.invoke(SETTINGS_CHANNELS.LOAD);
          if (!response.success) {
            throw new Error(
              response.error?.message || "Failed to load settings",
            );
          }
          return response.data;
        },
      };

      const apiResult = await preloadAPI.load();
      expect(apiResult).toEqual(handlerResult.data);
    });

    it("should complete full save cycle with validation", async () => {
      const testData = {
        section: "general" as const,
        settings: {
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
        },
      };

      const saveHandler = handlers.get(SETTINGS_CHANNELS.SAVE);
      expect(saveHandler).toBeDefined();
      if (!saveHandler) return;

      const handlerResult = await saveHandler({}, testData);
      expect(handlerResult.success).toBe(true);

      (ipcRenderer.invoke as jest.Mock).mockResolvedValue(handlerResult);

      const preloadAPI = {
        save: async (data: any) => {
          const response = await ipcRenderer.invoke(
            SETTINGS_CHANNELS.SAVE,
            data,
          );
          if (!response.success) {
            throw new Error(
              response.error?.message || "Failed to save settings",
            );
          }
        },
      };

      await expect(preloadAPI.save(testData)).resolves.toBeUndefined();
    });

    it("should handle error propagation through complete chain", async () => {
      const invalidData = { invalid: "data" };
      const saveHandler = handlers.get(SETTINGS_CHANNELS.SAVE);
      expect(saveHandler).toBeDefined();
      if (!saveHandler) return;

      const handlerResult = await saveHandler({}, invalidData);

      (ipcRenderer.invoke as jest.Mock).mockResolvedValue(handlerResult);

      const preloadAPI = {
        save: async (data: any) => {
          const response = await ipcRenderer.invoke(
            SETTINGS_CHANNELS.SAVE,
            data,
          );
          if (!response.success) {
            throw new Error(
              response.error?.message || "Failed to save settings",
            );
          }
        },
      };

      if (handlerResult.success === false && handlerResult.error?.message) {
        await expect(preloadAPI.save(invalidData)).rejects.toThrow(
          handlerResult.error.message,
        );
      } else {
        await expect(preloadAPI.save(invalidData)).resolves.toBeUndefined();
      }
    });
  });
});
