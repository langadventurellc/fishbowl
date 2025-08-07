import { ipcMain } from "electron";
import { setupLlmConfigHandlers } from "../../handlers/llmConfigHandlers";
import {
  LLM_CONFIG_CHANNELS,
  type LlmConfigCreateRequest,
  type LlmConfigCreateResponse,
  type LlmConfigReadRequest,
  type LlmConfigReadResponse,
  type LlmConfigUpdateRequest,
  type LlmConfigUpdateResponse,
  type LlmConfigDeleteRequest,
  type LlmConfigDeleteResponse,
  type LlmConfigListRequest,
  type LlmConfigListResponse,
} from "../../../shared/ipc";
import { serializeError } from "../../utils/errorSerialization";
import { llmConfigServiceManager } from "../../getLlmConfigService";
import { LlmConfig, LlmConfigInput } from "@fishbowl-ai/shared";

// Mock electron
jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

// Mock llmConfigServiceManager module
jest.mock("../../getLlmConfigService", () => ({
  llmConfigServiceManager: {
    get: jest.fn(),
  },
}));

// Mock errorSerialization
jest.mock("../../utils/errorSerialization", () => ({
  serializeError: jest.fn((error) => ({
    message: error.message,
    name: error.name,
  })),
}));

describe("llmConfigHandlers", () => {
  let mockService: {
    create: jest.Mock;
    read: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    list: jest.Mock;
    initialize: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock service
    mockService = {
      create: jest.fn(),
      read: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      initialize: jest.fn(),
    };

    (llmConfigServiceManager.get as jest.Mock).mockReturnValue(mockService);
  });

  describe("setupLlmConfigHandlers", () => {
    it("should register all LLM config handlers", () => {
      setupLlmConfigHandlers(ipcMain as any, mockService as any);

      expect(ipcMain.handle).toHaveBeenCalledWith(
        LLM_CONFIG_CHANNELS.CREATE,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        LLM_CONFIG_CHANNELS.READ,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        LLM_CONFIG_CHANNELS.UPDATE,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        LLM_CONFIG_CHANNELS.DELETE,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        LLM_CONFIG_CHANNELS.LIST,
        expect.any(Function),
      );
    });

    it("should require both ipcMain and service parameters", () => {
      expect(() =>
        setupLlmConfigHandlers(null as any, mockService as any),
      ).toThrow("IpcMain instance is required");

      expect(() => setupLlmConfigHandlers(ipcMain as any, null as any)).toThrow(
        "LlmConfigService instance is required",
      );
    });

    it("should register initialize handler", () => {
      setupLlmConfigHandlers(ipcMain as any, mockService as any);

      expect(ipcMain.handle).toHaveBeenCalledWith(
        LLM_CONFIG_CHANNELS.INITIALIZE,
        expect.any(Function),
      );
    });
  });

  describe("CREATE handler", () => {
    it("should create LLM configuration successfully", async () => {
      const mockConfig: LlmConfig = {
        id: "test-uuid",
        customName: "Test Config",
        provider: "openai",
        apiKey: "encrypted-key",
        baseUrl: "https://api.openai.com",
        useAuthHeader: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const request: LlmConfigCreateRequest = {
        config: {
          customName: "Test Config",
          provider: "openai",
          apiKey: "test-api-key",
          baseUrl: "https://api.openai.com",
          useAuthHeader: true,
        },
      };

      mockService.create.mockResolvedValue(mockConfig);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.CREATE,
      )[1];

      const result: LlmConfigCreateResponse = await handler(null, request);

      expect(mockService.create).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockConfig });
    });

    it("should handle service validation errors", async () => {
      const validationError = new Error(
        "Validation failed: customName is required",
      );
      const request: LlmConfigCreateRequest = {
        config: {
          customName: "", // Invalid - empty name
          provider: "invalid-provider" as any,
          apiKey: "test-key",
        } as LlmConfigInput,
      };

      mockService.create.mockRejectedValue(validationError);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.CREATE,
      )[1];

      const result: LlmConfigCreateResponse = await handler(null, request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockService.create).toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      const error = new Error("Failed to create configuration");
      const request: LlmConfigCreateRequest = {
        config: {
          customName: "Test Config",
          provider: "openai",
          apiKey: "test-api-key",
          useAuthHeader: true,
        },
      };

      mockService.create.mockRejectedValue(error);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.CREATE,
      )[1];

      const result: LlmConfigCreateResponse = await handler(null, request);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, name: error.name },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });

    it("should use injected service in handler", async () => {
      const customService = {
        create: jest.fn().mockResolvedValue({
          id: "test-uuid",
          customName: "Test Config",
          provider: "openai",
          apiKey: "encrypted-key",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        read: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        list: jest.fn(),
        initialize: jest.fn(),
      };

      const request: LlmConfigCreateRequest = {
        config: {
          customName: "Test Config",
          provider: "openai",
          apiKey: "test-api-key",
          useAuthHeader: true,
        },
      };

      setupLlmConfigHandlers(ipcMain as any, customService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.CREATE,
      )[1];

      await handler(null, request);

      expect(customService.create).toHaveBeenCalled();
      expect(llmConfigServiceManager.get).not.toHaveBeenCalled();
    });
  });

  describe("READ handler", () => {
    it("should read LLM configuration successfully", async () => {
      const mockConfig: LlmConfig = {
        id: "test-uuid-123e4567-e89b-12d3-a456-426614174000",
        customName: "Test Config",
        provider: "openai",
        apiKey: "encrypted-key",
        useAuthHeader: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const request: LlmConfigReadRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      mockService.read.mockResolvedValue(mockConfig);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.READ,
      )[1];

      const result: LlmConfigReadResponse = await handler(null, request);

      expect(mockService.read).toHaveBeenCalledWith(request.id);
      expect(result).toEqual({ success: true, data: mockConfig });
    });

    it("should return null when configuration not found", async () => {
      const request: LlmConfigReadRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      mockService.read.mockResolvedValue(null);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.READ,
      )[1];

      const result: LlmConfigReadResponse = await handler(null, request);

      expect(result).toEqual({ success: true, data: null });
    });

    it("should handle invalid UUID format", async () => {
      const validationError = new Error("Invalid UUID format");
      const request: LlmConfigReadRequest = {
        id: "invalid-uuid",
      };

      mockService.read.mockRejectedValue(validationError);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.READ,
      )[1];

      const result: LlmConfigReadResponse = await handler(null, request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockService.read).toHaveBeenCalledWith("invalid-uuid");
    });

    it("should handle repository errors", async () => {
      const error = new Error("Failed to read configuration");
      const request: LlmConfigReadRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      mockService.read.mockRejectedValue(error);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.READ,
      )[1];

      const result: LlmConfigReadResponse = await handler(null, request);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, name: error.name },
      });
    });
  });

  describe("UPDATE handler", () => {
    it("should update LLM configuration successfully", async () => {
      const mockUpdatedConfig: LlmConfig = {
        id: "test-uuid",
        customName: "Updated Config",
        provider: "openai",
        apiKey: "encrypted-key",
        baseUrl: "https://api.openai.com/v2",
        useAuthHeader: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const request: LlmConfigUpdateRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        updates: {
          customName: "Updated Config",
          baseUrl: "https://api.openai.com/v2",
        },
      };

      mockService.update.mockResolvedValue(mockUpdatedConfig);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.UPDATE,
      )[1];

      const result: LlmConfigUpdateResponse = await handler(null, request);

      expect(mockService.update).toHaveBeenCalledWith(
        request.id,
        request.updates,
      );
      expect(result).toEqual({ success: true, data: mockUpdatedConfig });
    });

    it("should handle empty updates", async () => {
      const mockConfig: LlmConfig = {
        id: "test-uuid",
        customName: "Test Config",
        provider: "openai",
        apiKey: "encrypted-key",
        useAuthHeader: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const request: LlmConfigUpdateRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        updates: {},
      };

      mockService.update.mockResolvedValue(mockConfig);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.UPDATE,
      )[1];

      const result: LlmConfigUpdateResponse = await handler(null, request);

      expect(result).toEqual({ success: true, data: mockConfig });
    });

    it("should handle invalid UUID format", async () => {
      const validationError = new Error("Invalid UUID format");
      const request: LlmConfigUpdateRequest = {
        id: "invalid-uuid",
        updates: { customName: "New Name" },
      };

      mockService.update.mockRejectedValue(validationError);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.UPDATE,
      )[1];

      const result: LlmConfigUpdateResponse = await handler(null, request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockService.update).toHaveBeenCalledWith("invalid-uuid", {
        customName: "New Name",
      });
    });

    it("should handle validation errors in updates", async () => {
      const validationError = new Error(
        "Validation failed: customName cannot be empty",
      );
      const request: LlmConfigUpdateRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        updates: {
          customName: "", // Invalid - empty name
          provider: "invalid-provider" as any,
        },
      };

      mockService.update.mockRejectedValue(validationError);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.UPDATE,
      )[1];

      const result: LlmConfigUpdateResponse = await handler(null, request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockService.update).toHaveBeenCalled();
    });
  });

  describe("DELETE handler", () => {
    it("should delete LLM configuration successfully", async () => {
      const request: LlmConfigDeleteRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      mockService.delete.mockResolvedValue(undefined);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.DELETE,
      )[1];

      const result: LlmConfigDeleteResponse = await handler(null, request);

      expect(mockService.delete).toHaveBeenCalledWith(request.id);
      expect(result).toEqual({ success: true });
    });

    it("should handle invalid UUID format", async () => {
      const validationError = new Error("Invalid UUID format");
      const request: LlmConfigDeleteRequest = {
        id: "invalid-uuid",
      };

      mockService.delete.mockRejectedValue(validationError);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.DELETE,
      )[1];

      const result: LlmConfigDeleteResponse = await handler(null, request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockService.delete).toHaveBeenCalledWith("invalid-uuid");
    });

    it("should handle repository errors", async () => {
      const error = new Error("Failed to delete configuration");
      const request: LlmConfigDeleteRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      mockService.delete.mockRejectedValue(error);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.DELETE,
      )[1];

      const result: LlmConfigDeleteResponse = await handler(null, request);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, name: error.name },
      });
    });
  });

  describe("LIST handler", () => {
    it("should list LLM configurations successfully", async () => {
      const mockConfigs: LlmConfig[] = [
        {
          id: "uuid-1",
          customName: "Config 1",
          provider: "openai",
          apiKey: "encrypted-key-1",
          useAuthHeader: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "uuid-2",
          customName: "Config 2",
          provider: "anthropic",
          apiKey: "encrypted-key-2",
          useAuthHeader: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const request: LlmConfigListRequest = {};

      mockService.list.mockResolvedValue(mockConfigs);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.LIST,
      )[1];

      const result: LlmConfigListResponse = await handler(null, request);

      expect(mockService.list).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockConfigs });
    });

    it("should return empty array when no configurations exist", async () => {
      const request: LlmConfigListRequest = {};

      mockService.list.mockResolvedValue([]);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.LIST,
      )[1];

      const result: LlmConfigListResponse = await handler(null, request);

      expect(result).toEqual({ success: true, data: [] });
    });

    it("should handle repository errors", async () => {
      const error = new Error("Failed to list configurations");
      const request: LlmConfigListRequest = {};

      mockService.list.mockRejectedValue(error);

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.LIST,
      )[1];

      const result: LlmConfigListResponse = await handler(null, request);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, name: error.name },
      });
    });
  });

  describe("Input validation", () => {
    it("should handle missing request in CREATE handler", async () => {
      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.CREATE,
      )[1];

      const result: LlmConfigCreateResponse = await handler(null, null);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Request is required");
    });

    it("should handle missing config in CREATE handler", async () => {
      const request: LlmConfigCreateRequest = {
        config: null as any,
      };

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.CREATE,
      )[1];

      const result: LlmConfigCreateResponse = await handler(null, request);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Configuration input is required");
    });

    it("should handle missing ID in READ handler", async () => {
      const request: LlmConfigReadRequest = {
        id: null as any,
      };

      setupLlmConfigHandlers(ipcMain as any, mockService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.READ,
      )[1];

      const result: LlmConfigReadResponse = await handler(null, request);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Configuration ID is required");
    });
  });
});
