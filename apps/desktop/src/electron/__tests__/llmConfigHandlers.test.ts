import { ipcMain } from "electron";
import { setupLlmConfigHandlers } from "../llmConfigHandlers";
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
} from "../../shared/ipc";
import { serializeError } from "../utils/errorSerialization";
import { llmStorageServiceManager } from "../getLlmStorageService";
import { LlmConfig, LlmConfigInput } from "@fishbowl-ai/shared";

// Mock electron
jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

// Mock llmStorageServiceManager module
jest.mock("../getLlmStorageService", () => ({
  llmStorageServiceManager: {
    get: jest.fn(),
  },
}));

// Mock errorSerialization
jest.mock("../utils/errorSerialization", () => ({
  serializeError: jest.fn((error) => ({
    message: error.message,
    name: error.name,
  })),
}));

describe("llmConfigHandlers", () => {
  let mockService: {
    repository: {
      create: jest.Mock;
      read: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      list: jest.Mock;
      exists: jest.Mock;
    };
    isSecureStorageAvailable: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock service
    mockService = {
      repository: {
        create: jest.fn(),
        read: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        list: jest.fn(),
        exists: jest.fn(),
      },
      isSecureStorageAvailable: jest.fn().mockReturnValue(true),
    };

    (llmStorageServiceManager.get as jest.Mock).mockReturnValue(mockService);
  });

  describe("setupLlmConfigHandlers", () => {
    it("should register all LLM config handlers", () => {
      setupLlmConfigHandlers();

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

    it("should use injected service when provided", () => {
      const customService = {
        repository: {
          create: jest.fn(),
          read: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          list: jest.fn(),
          exists: jest.fn(),
        },
        isSecureStorageAvailable: jest.fn().mockReturnValue(true),
      };

      setupLlmConfigHandlers(customService as any);

      // Should not call the manager when custom service is provided
      expect(llmStorageServiceManager.get).not.toHaveBeenCalled();
    });

    it("should handle service manager not initialized", () => {
      const error = new Error("LLM storage service not initialized");
      (llmStorageServiceManager.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Should not throw during setup
      expect(() => setupLlmConfigHandlers()).not.toThrow();
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
        authHeaderType: "Bearer",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const request: LlmConfigCreateRequest = {
        config: {
          customName: "Test Config",
          provider: "openai",
          apiKey: "test-api-key",
          baseUrl: "https://api.openai.com",
          authHeaderType: "Bearer",
        },
      };

      mockService.repository.create.mockResolvedValue(mockConfig);

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.CREATE,
      )[1];

      const result: LlmConfigCreateResponse = await handler(null, request);

      expect(mockService.repository.create).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockConfig });
    });

    it("should handle validation errors", async () => {
      const request: LlmConfigCreateRequest = {
        config: {
          customName: "", // Invalid - empty name
          provider: "invalid-provider" as any,
          apiKey: "test-key",
        } as LlmConfigInput,
      };

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.CREATE,
      )[1];

      const result: LlmConfigCreateResponse = await handler(null, request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockService.repository.create).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      const error = new Error("Failed to create configuration");
      const request: LlmConfigCreateRequest = {
        config: {
          customName: "Test Config",
          provider: "openai",
          apiKey: "test-api-key",
        },
      };

      mockService.repository.create.mockRejectedValue(error);

      setupLlmConfigHandlers();
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
        repository: {
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
          exists: jest.fn(),
        },
        isSecureStorageAvailable: jest.fn().mockReturnValue(true),
      };

      const request: LlmConfigCreateRequest = {
        config: {
          customName: "Test Config",
          provider: "openai",
          apiKey: "test-api-key",
        },
      };

      setupLlmConfigHandlers(customService as any);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.CREATE,
      )[1];

      await handler(null, request);

      expect(customService.repository.create).toHaveBeenCalled();
      expect(llmStorageServiceManager.get).not.toHaveBeenCalled();
    });
  });

  describe("READ handler", () => {
    it("should read LLM configuration successfully", async () => {
      const mockConfig: LlmConfig = {
        id: "test-uuid-123e4567-e89b-12d3-a456-426614174000",
        customName: "Test Config",
        provider: "openai",
        apiKey: "encrypted-key",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const request: LlmConfigReadRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      mockService.repository.read.mockResolvedValue(mockConfig);

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.READ,
      )[1];

      const result: LlmConfigReadResponse = await handler(null, request);

      expect(mockService.repository.read).toHaveBeenCalledWith(request.id);
      expect(result).toEqual({ success: true, data: mockConfig });
    });

    it("should return null when configuration not found", async () => {
      const request: LlmConfigReadRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      mockService.repository.read.mockResolvedValue(null);

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.READ,
      )[1];

      const result: LlmConfigReadResponse = await handler(null, request);

      expect(result).toEqual({ success: true, data: null });
    });

    it("should handle invalid UUID format", async () => {
      const request: LlmConfigReadRequest = {
        id: "invalid-uuid",
      };

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.READ,
      )[1];

      const result: LlmConfigReadResponse = await handler(null, request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockService.repository.read).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      const error = new Error("Failed to read configuration");
      const request: LlmConfigReadRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      mockService.repository.read.mockRejectedValue(error);

      setupLlmConfigHandlers();
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

      mockService.repository.update.mockResolvedValue(mockUpdatedConfig);

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.UPDATE,
      )[1];

      const result: LlmConfigUpdateResponse = await handler(null, request);

      expect(mockService.repository.update).toHaveBeenCalledWith(
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const request: LlmConfigUpdateRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        updates: {},
      };

      mockService.repository.update.mockResolvedValue(mockConfig);

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.UPDATE,
      )[1];

      const result: LlmConfigUpdateResponse = await handler(null, request);

      expect(result).toEqual({ success: true, data: mockConfig });
    });

    it("should handle invalid UUID format", async () => {
      const request: LlmConfigUpdateRequest = {
        id: "invalid-uuid",
        updates: { customName: "New Name" },
      };

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.UPDATE,
      )[1];

      const result: LlmConfigUpdateResponse = await handler(null, request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockService.repository.update).not.toHaveBeenCalled();
    });

    it("should handle validation errors in updates", async () => {
      const request: LlmConfigUpdateRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        updates: {
          customName: "", // Invalid - empty name
          provider: "invalid-provider" as any,
        },
      };

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.UPDATE,
      )[1];

      const result: LlmConfigUpdateResponse = await handler(null, request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockService.repository.update).not.toHaveBeenCalled();
    });
  });

  describe("DELETE handler", () => {
    it("should delete LLM configuration successfully", async () => {
      const request: LlmConfigDeleteRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      mockService.repository.delete.mockResolvedValue(undefined);

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.DELETE,
      )[1];

      const result: LlmConfigDeleteResponse = await handler(null, request);

      expect(mockService.repository.delete).toHaveBeenCalledWith(request.id);
      expect(result).toEqual({ success: true });
    });

    it("should handle invalid UUID format", async () => {
      const request: LlmConfigDeleteRequest = {
        id: "invalid-uuid",
      };

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.DELETE,
      )[1];

      const result: LlmConfigDeleteResponse = await handler(null, request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockService.repository.delete).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      const error = new Error("Failed to delete configuration");
      const request: LlmConfigDeleteRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      mockService.repository.delete.mockRejectedValue(error);

      setupLlmConfigHandlers();
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "uuid-2",
          customName: "Config 2",
          provider: "anthropic",
          apiKey: "encrypted-key-2",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const request: LlmConfigListRequest = {};

      mockService.repository.list.mockResolvedValue(mockConfigs);

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.LIST,
      )[1];

      const result: LlmConfigListResponse = await handler(null, request);

      expect(mockService.repository.list).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockConfigs });
    });

    it("should return empty array when no configurations exist", async () => {
      const request: LlmConfigListRequest = {};

      mockService.repository.list.mockResolvedValue([]);

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.LIST,
      )[1];

      const result: LlmConfigListResponse = await handler(null, request);

      expect(result).toEqual({ success: true, data: [] });
    });

    it("should handle repository errors", async () => {
      const error = new Error("Failed to list configurations");
      const request: LlmConfigListRequest = {};

      mockService.repository.list.mockRejectedValue(error);

      setupLlmConfigHandlers();
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

  describe("Service manager error handling", () => {
    it("should handle service manager not initialized in CREATE handler", async () => {
      const error = new Error("LLM storage service not initialized");
      (llmStorageServiceManager.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const request: LlmConfigCreateRequest = {
        config: {
          customName: "Test Config",
          provider: "openai",
          apiKey: "test-key",
        },
      };

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.CREATE,
      )[1];

      const result: LlmConfigCreateResponse = await handler(null, request);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, name: error.name },
      });
    });

    it("should handle service manager not initialized in READ handler", async () => {
      const error = new Error("LLM storage service not initialized");
      (llmStorageServiceManager.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const request: LlmConfigReadRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      setupLlmConfigHandlers();
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        ([channel]) => channel === LLM_CONFIG_CHANNELS.READ,
      )[1];

      const result: LlmConfigReadResponse = await handler(null, request);

      expect(result).toEqual({
        success: false,
        error: { message: error.message, name: error.name },
      });
    });

    it("should handle service manager not initialized in LIST handler", async () => {
      const error = new Error("LLM storage service not initialized");
      (llmStorageServiceManager.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const request: LlmConfigListRequest = {};

      setupLlmConfigHandlers();
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
});
