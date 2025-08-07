import { LlmStorageService } from "../LlmStorageService";
import type { LlmConfig, LlmConfigMetadata } from "@fishbowl-ai/shared";

// Mock electron app
jest.mock("electron", () => ({
  app: {
    getPath: jest.fn().mockReturnValue("/mock/user/data"),
  },
}));

// Mock shared package
jest.mock("@fishbowl-ai/shared", () => ({
  LlmConfigRepository: jest.fn(),
  FileStorageService: jest.fn(),
  NodeFileSystemBridge: jest.fn(),
  createLoggerSync: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
  })),
}));

// Mock LlmSecureStorage
jest.mock("../LlmSecureStorage", () => ({
  LlmSecureStorage: jest.fn().mockImplementation(() => ({
    isAvailable: jest.fn().mockReturnValue(true),
  })),
}));

// Import the mocked classes
const { LlmConfigRepository } = jest.requireMock("@fishbowl-ai/shared");

describe("LlmStorageService", () => {
  let service: LlmStorageService;
  let mockRepository: jest.Mocked<{
    create: jest.Mock;
    read: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    list: jest.Mock;
    exists: jest.Mock;
    isSecureStorageAvailable: jest.Mock;
  }>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock repository
    mockRepository = {
      create: jest.fn(),
      read: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      exists: jest.fn(),
      isSecureStorageAvailable: jest.fn().mockReturnValue(true),
    };

    // Mock repository constructor to return our mock
    LlmConfigRepository.mockImplementation(() => mockRepository);

    service = new LlmStorageService();
  });

  const createValidConfig = (): LlmConfigMetadata => ({
    id: "test-id-123",
    customName: "Test OpenAI",
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    authHeaderType: "Bearer",
    createdAt: "2023-10-01T00:00:00.000Z",
    updatedAt: "2023-10-01T00:00:00.000Z",
  });

  const createCompleteConfig = (): LlmConfig => ({
    ...createValidConfig(),
    apiKey: "sk-test123456789",
  });

  describe("saveConfiguration()", () => {
    it("should use repository create method successfully", async () => {
      const config = {
        customName: "Test OpenAI",
        provider: "openai",
        baseUrl: "https://api.openai.com/v1",
        authHeaderType: "Bearer",
      };
      const apiKey = "sk-test123456789";
      const createdConfig = createCompleteConfig();

      mockRepository.create.mockResolvedValue(createdConfig);

      const result = await service.saveConfiguration(config, apiKey);

      expect(result.success).toBe(true);
      expect(result.data).toBe(createdConfig.id);
      expect(mockRepository.create).toHaveBeenCalledWith({
        customName: config.customName,
        provider: config.provider,
        apiKey,
        baseUrl: config.baseUrl,
        authHeaderType: config.authHeaderType,
      });
    });

    it("should handle validation errors from repository", async () => {
      const config = {
        customName: "",
        provider: "openai",
      };
      const apiKey = "sk-test123456789";

      // Create a proper ZodError for testing using the constructor directly
      const { ZodError } = jest.requireActual("zod");
      const zodError = new ZodError([
        {
          code: "too_small",
          message: "Custom name is required",
          path: ["customName"],
        },
      ]);

      mockRepository.create.mockRejectedValue(zodError);

      const result = await service.saveConfiguration(config, apiKey);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Validation failed: customName: Custom name is required",
      );
    });

    it("should handle general errors from repository", async () => {
      const config = {
        customName: "Test",
        provider: "openai",
      };
      const apiKey = "sk-test123456789";

      mockRepository.create.mockRejectedValue(new Error("Storage failed"));

      const result = await service.saveConfiguration(config, apiKey);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Storage failed");
    });
  });

  describe("updateConfiguration()", () => {
    it("should use repository update method successfully", async () => {
      const id = "test-id-123";
      const updates = { customName: "Updated Name" };
      const newApiKey = "sk-new-key";
      const updatedConfig = createCompleteConfig();

      mockRepository.update.mockResolvedValue(updatedConfig);

      const result = await service.updateConfiguration(id, updates, newApiKey);

      expect(result.success).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(id, {
        customName: updates.customName,
        apiKey: newApiKey,
      });
    });

    it("should filter out undefined values before calling repository", async () => {
      const id = "test-id-123";
      const updates = { customName: "Updated Name" };
      const updatedConfig = createCompleteConfig();

      mockRepository.update.mockResolvedValue(updatedConfig);

      const result = await service.updateConfiguration(id, updates);

      expect(result.success).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(id, {
        customName: updates.customName,
      });
    });

    it("should handle errors from repository", async () => {
      const id = "test-id-123";
      const updates = { customName: "Updated Name" };

      mockRepository.update.mockRejectedValue(new Error("Update failed"));

      const result = await service.updateConfiguration(id, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Update failed");
    });
  });

  describe("getConfiguration()", () => {
    it("should return configuration metadata without API key", async () => {
      const id = "test-id-123";
      const completeConfig = createCompleteConfig();
      const expectedMetadata = createValidConfig();

      mockRepository.read.mockResolvedValue(completeConfig);

      const result = await service.getConfiguration(id);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedMetadata);
      expect(result.data).not.toHaveProperty("apiKey");
      expect(mockRepository.read).toHaveBeenCalledWith(id);
    });

    it("should return null for non-existent configuration", async () => {
      const id = "non-existent-id";

      mockRepository.read.mockResolvedValue(null);

      const result = await service.getConfiguration(id);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should handle errors from repository", async () => {
      const id = "test-id-123";

      mockRepository.read.mockRejectedValue(new Error("Read failed"));

      const result = await service.getConfiguration(id);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Read failed");
    });
  });

  describe("getAllConfigurations()", () => {
    it("should return all configurations from repository", async () => {
      const configs = [createValidConfig()];

      mockRepository.list.mockResolvedValue(configs);

      const result = await service.getAllConfigurations();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(configs);
      expect(mockRepository.list).toHaveBeenCalled();
    });

    it("should handle errors from repository", async () => {
      mockRepository.list.mockRejectedValue(new Error("List failed"));

      const result = await service.getAllConfigurations();

      expect(result.success).toBe(false);
      expect(result.error).toBe("List failed");
    });
  });

  describe("deleteConfiguration()", () => {
    it("should delete configuration using repository", async () => {
      const id = "test-id-123";

      mockRepository.delete.mockResolvedValue(undefined);

      const result = await service.deleteConfiguration(id);

      expect(result.success).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });

    it("should handle errors from repository", async () => {
      const id = "test-id-123";

      mockRepository.delete.mockRejectedValue(new Error("Delete failed"));

      const result = await service.deleteConfiguration(id);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Delete failed");
    });
  });

  describe("getCompleteConfiguration()", () => {
    it("should return complete configuration with API key", async () => {
      const id = "test-id-123";
      const completeConfig = createCompleteConfig();

      mockRepository.read.mockResolvedValue(completeConfig);

      const result = await service.getCompleteConfiguration(id);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(completeConfig);
      expect(result.data).toHaveProperty("apiKey");
    });

    it("should return null for non-existent configuration", async () => {
      const id = "non-existent-id";

      mockRepository.read.mockResolvedValue(null);

      const result = await service.getCompleteConfiguration(id);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should handle errors from repository", async () => {
      const id = "test-id-123";

      mockRepository.read.mockRejectedValue(new Error("Read failed"));

      const result = await service.getCompleteConfiguration(id);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Read failed");
    });
  });

  describe("configurationExists()", () => {
    it("should check configuration existence using repository", async () => {
      const id = "test-id-123";

      mockRepository.exists.mockResolvedValue(true);

      const result = await service.configurationExists(id);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(mockRepository.exists).toHaveBeenCalledWith(id);
    });

    it("should return false for non-existent configuration", async () => {
      const id = "non-existent-id";

      mockRepository.exists.mockResolvedValue(false);

      const result = await service.configurationExists(id);

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });

    it("should handle errors from repository", async () => {
      const id = "test-id-123";

      mockRepository.exists.mockRejectedValue(new Error("Check failed"));

      const result = await service.configurationExists(id);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Check failed");
    });
  });

  describe("isSecureStorageAvailable()", () => {
    it("should return secure storage availability from repository", () => {
      mockRepository.isSecureStorageAvailable.mockReturnValue(true);

      const result = service.isSecureStorageAvailable();

      expect(result).toBe(true);
      expect(mockRepository.isSecureStorageAvailable).toHaveBeenCalled();
    });

    it("should return false when secure storage is unavailable", () => {
      mockRepository.isSecureStorageAvailable.mockReturnValue(false);

      const result = service.isSecureStorageAvailable();

      expect(result).toBe(false);
    });
  });

  describe("Error message extraction", () => {
    it("should format Zod validation errors with field paths", async () => {
      // Create a proper ZodError for testing using the constructor directly
      const { ZodError } = jest.requireActual("zod");
      const zodError = new ZodError([
        {
          code: "too_small",
          message: "Custom name is required",
          path: ["customName"],
        },
        {
          code: "invalid_string",
          message: "Invalid URL format",
          path: ["baseUrl"],
        },
      ]);

      mockRepository.create.mockRejectedValue(zodError);

      const result = await service.saveConfiguration(
        { customName: "", provider: "openai" },
        "key",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Validation failed: customName: Custom name is required, baseUrl: Invalid URL format",
      );
    });

    it("should handle Zod errors with empty paths", async () => {
      // Create a proper ZodError for testing using the constructor directly
      const { ZodError } = jest.requireActual("zod");
      const zodError = new ZodError([
        {
          code: "invalid_type",
          expected: "object",
          received: "string",
          message: "Expected object",
          path: [],
        },
      ]);

      mockRepository.create.mockRejectedValue(zodError);

      const result = await service.saveConfiguration(
        { customName: "Test", provider: "openai" },
        "key",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Validation failed: Expected object");
    });

    it("should handle regular Error instances", async () => {
      mockRepository.create.mockRejectedValue(new Error("Regular error"));

      const result = await service.saveConfiguration(
        { customName: "Test", provider: "openai" },
        "key",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Regular error");
    });

    it("should handle unknown error types", async () => {
      mockRepository.create.mockRejectedValue("String error");

      const result = await service.saveConfiguration(
        { customName: "Test", provider: "openai" },
        "key",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown error occurred");
    });
  });

  describe("Constructor initialization", () => {
    it("should initialize repository with correct dependencies", () => {
      // Constructor is called in beforeEach
      expect(LlmConfigRepository).toHaveBeenCalledWith(
        expect.any(Object), // FileStorageService
        expect.any(Object), // LlmSecureStorage
        "/mock/user/data/llm_config.json", // Config file path
      );
    });
  });
});
