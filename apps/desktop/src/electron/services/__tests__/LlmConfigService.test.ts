import { LlmConfigService } from "../LlmConfigService";
import { LlmStorageService } from "../LlmStorageService";
import {
  DuplicateConfigError,
  ConfigNotFoundError,
  ConfigOperationError,
  InvalidConfigError,
} from "../errors";
import type { LlmConfig, LlmConfigInput } from "@fishbowl-ai/shared";

// Mock dependencies
jest.mock("../LlmStorageService");
jest.mock("@fishbowl-ai/shared", () => ({
  createLoggerSync: jest.fn(() => ({
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  })),
}));

// Mock crypto.randomUUID
const mockRandomUUID = jest.fn();
jest.mock("crypto", () => ({
  randomUUID: () => mockRandomUUID(),
}));

describe("LlmConfigService", () => {
  let service: LlmConfigService;
  let mockStorageService: jest.Mocked<LlmStorageService>;
  let mockRepository: jest.Mocked<any>;

  const createValidInput = (): LlmConfigInput => ({
    customName: "Test OpenAI",
    provider: "openai",
    apiKey: "sk-test123",
    baseUrl: "https://api.openai.com/v1",
    useAuthHeader: true,
  });

  const createValidConfig = (): LlmConfig => ({
    id: "test-uuid-123",
    ...createValidInput(),
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock repository
    mockRepository = {
      create: jest.fn(),
      read: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    };

    // Setup mock storage service
    mockStorageService = {
      repository: mockRepository,
      getCompleteConfiguration: jest.fn(),
      getAllConfigurations: jest.fn(),
      deleteConfiguration: jest.fn(),
    } as any;

    // Setup UUID mock
    mockRandomUUID.mockReturnValue("test-uuid-123");

    // Create service with mock
    service = new LlmConfigService(mockStorageService);
  });

  describe("create()", () => {
    it("should create configuration with unique UUID", async () => {
      const input = createValidInput();
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [],
      });
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: null,
      });
      mockRepository.create.mockResolvedValue(createValidConfig());

      const result = await service.create(input);

      expect(result.id).toBe("test-uuid-123");
      expect(mockRandomUUID).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(input);
    });

    it("should prevent duplicate configuration names", async () => {
      const input = createValidInput();
      const existingConfig = createValidConfig();

      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [existingConfig],
      });
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: existingConfig,
      });

      await expect(service.create(input)).rejects.toThrow(DuplicateConfigError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should set timestamps on creation", async () => {
      const input = createValidInput();
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [],
      });

      const createdConfig = createValidConfig();
      mockRepository.create.mockResolvedValue(createdConfig);

      const result = await service.create(input);

      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
    });

    it("should handle storage failures", async () => {
      const input = createValidInput();
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [],
      });
      mockRepository.create.mockRejectedValue(new Error("Storage failed"));

      await expect(service.create(input)).rejects.toThrow(ConfigOperationError);
    });
  });

  describe("read()", () => {
    it("should retrieve existing configuration", async () => {
      const config = createValidConfig();

      // Initialize cache with the config
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [config],
      });
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: config,
      });
      await service.initialize();

      const result = await service.read("test-uuid-123");

      expect(result).toEqual(config);
      // Storage should NOT be called for reads after initialization - we read from cache
    });

    it("should return null for non-existent configuration", async () => {
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await service.read("non-existent");

      expect(result).toBeNull();
    });

    it("should handle invalid ID", async () => {
      await expect(service.read("")).rejects.toThrow(InvalidConfigError);
      await expect(service.read(null as any)).rejects.toThrow(
        InvalidConfigError,
      );
    });

    it("should handle storage errors during initialization gracefully", async () => {
      // Mock storage failure during initialization
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: false,
        error: "Storage error",
      });

      // read() should work with empty cache after failed initialization
      const result = await service.read("test-id");
      expect(result).toBeNull();
    });
  });

  describe("update()", () => {
    it("should update existing configuration", async () => {
      const existing = createValidConfig();
      const updates = { customName: "Updated Name" };
      const updated = { ...existing, ...updates };

      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: existing,
      });
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [existing],
      });
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.update("test-uuid-123", updates);

      expect(result.customName).toBe("Updated Name");
      expect(mockRepository.update).toHaveBeenCalledWith(
        "test-uuid-123",
        updates,
      );
    });

    it("should throw error for non-existent configuration", async () => {
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: null,
      });

      await expect(
        service.update("non-existent", { customName: "New" }),
      ).rejects.toThrow(ConfigNotFoundError);
    });

    it("should prevent duplicate names on update", async () => {
      const existing1 = createValidConfig();
      const existing2 = {
        ...createValidConfig(),
        id: "other-id",
        customName: "Other Config",
      };

      // Initialize cache with both configs
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [existing1, existing2],
      });
      mockStorageService.getCompleteConfiguration.mockResolvedValueOnce({
        success: true,
        data: existing1,
      });
      mockStorageService.getCompleteConfiguration.mockResolvedValueOnce({
        success: true,
        data: existing2,
      });
      await service.initialize();

      await expect(
        service.update("test-uuid-123", { customName: "Other Config" }),
      ).rejects.toThrow(DuplicateConfigError);
    });

    it("should update timestamp on modification", async () => {
      const existing = createValidConfig();
      const updates = { customName: "Updated" };
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: existing,
      });
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [existing],
      });
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.update("test-uuid-123", updates);

      expect(result.updatedAt).not.toBe(existing.updatedAt);
      expect(result.createdAt).toBe(existing.createdAt);
    });

    it("should handle storage failures", async () => {
      const existing = createValidConfig();
      const updates = { customName: "Updated" };

      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: existing,
      });
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [existing],
      });
      mockRepository.update.mockRejectedValue(new Error("Storage failed"));

      await expect(service.update("test-uuid-123", updates)).rejects.toThrow(
        ConfigOperationError,
      );
    });
  });

  describe("delete()", () => {
    it("should delete existing configuration", async () => {
      const config = createValidConfig();

      // Initialize cache with the config
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [config],
      });
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: config,
      });
      await service.initialize();

      // Mock successful deletion
      mockStorageService.deleteConfiguration.mockResolvedValue({
        success: true,
      });

      await service.delete("test-uuid-123");

      expect(mockStorageService.deleteConfiguration).toHaveBeenCalledWith(
        "test-uuid-123",
      );
    });

    it("should handle deletion of non-existent configuration gracefully", async () => {
      // Initialize service cache first
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [],
      });
      await service.initialize();

      // Now delete a non-existent config - should not call storage since not in cache
      await expect(service.delete("non-existent")).resolves.not.toThrow();
      expect(mockStorageService.deleteConfiguration).not.toHaveBeenCalled();
    });

    it("should handle storage failures", async () => {
      const config = createValidConfig();

      // Initialize service cache with the config
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [config],
      });
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: config,
      });
      await service.initialize();

      // Mock storage failure
      mockStorageService.deleteConfiguration.mockResolvedValue({
        success: false,
        error: "Delete failed",
      });

      await expect(service.delete("test-uuid-123")).rejects.toThrow(
        ConfigOperationError,
      );
    });
  });

  describe("list()", () => {
    it("should return all configurations", async () => {
      const configs = [createValidConfig()];
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: configs,
      });
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: configs[0],
      });

      const result = await service.list();

      expect(result).toEqual(configs);
      expect(mockStorageService.getAllConfigurations).toHaveBeenCalled();
    });

    it("should return empty array when no configurations exist", async () => {
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await service.list();

      expect(result).toEqual([]);
    });

    it("should handle storage failures during initialization", async () => {
      // Mock storage failure during initialization - service should continue with empty cache
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: false,
        error: "List failed",
      });

      // list() should return empty array from cache, not throw
      const result = await service.list();
      expect(result).toEqual([]);
    });

    it("should skip incomplete configurations", async () => {
      const metadata = [
        {
          id: "test-1",
          customName: "Config 1",
          provider: "openai" as const,
          useAuthHeader: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        {
          id: "test-2",
          customName: "Config 2",
          provider: "anthropic" as const,
          useAuthHeader: false,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ];
      const config1 = { ...createValidConfig(), id: "test-1" };

      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: metadata,
      });

      // First call returns config, second call returns null
      mockStorageService.getCompleteConfiguration
        .mockResolvedValueOnce({
          success: true,
          data: config1,
        })
        .mockResolvedValueOnce({
          success: true,
          data: null,
        });

      const result = await service.list();

      expect(result).toEqual([config1]);
      expect(result).toHaveLength(1);
    });
  });

  describe("initialize()", () => {
    it("should initialize cache with existing configurations from storage", async () => {
      const configs = [
        createValidConfig(),
        { ...createValidConfig(), id: "test-2" },
      ];
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: configs,
      });
      mockStorageService.getCompleteConfiguration
        .mockResolvedValueOnce({
          success: true,
          data: configs[0],
        })
        .mockResolvedValueOnce({
          success: true,
          data: configs[1],
        });

      await service.initialize();

      // Verify cache was populated
      const cache = (service as any).cache;
      expect(cache.size).toBe(2);
      expect(cache.get("test-uuid-123")).toEqual(configs[0]);
      expect(cache.get("test-2")).toEqual(configs[1]);
      expect((service as any).initialized).toBe(true);
    });

    it("should initialize cache with empty storage (no configurations)", async () => {
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [],
      });

      await service.initialize();

      // Verify empty cache was created
      const cache = (service as any).cache;
      expect(cache.size).toBe(0);
      expect((service as any).initialized).toBe(true);

      const mockLogger = (service as any).logger;
      expect(mockLogger.info).toHaveBeenCalledWith(
        "LlmConfigService initialized successfully",
        expect.objectContaining({ configCount: 0 }),
      );
    });

    it("should handle storage errors during initialization gracefully", async () => {
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: false,
        error: "Storage failed",
      });

      // Should not throw but continue with empty cache
      await expect(service.initialize()).resolves.not.toThrow();

      // Verify empty cache and initialized flag set
      const cache = (service as any).cache;
      expect(cache.size).toBe(0);
      expect((service as any).initialized).toBe(true);

      // Verify error was logged
      const mockLogger = (service as any).logger;
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to initialize LlmConfigService",
        expect.any(Error),
      );
    });

    it("should be idempotent and not reload cache on subsequent calls", async () => {
      const configs = [createValidConfig()];
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: configs,
      });
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: configs[0],
      });

      // First initialization
      await service.initialize();
      expect(mockStorageService.getAllConfigurations).toHaveBeenCalledTimes(1);

      // Second initialization should not call storage again
      await service.initialize();
      expect(mockStorageService.getAllConfigurations).toHaveBeenCalledTimes(1);

      // Cache should still have the same data
      const cache = (service as any).cache;
      expect(cache.size).toBe(1);
      expect((service as any).initialized).toBe(true);
    });

    it("should log configuration count on successful initialization", async () => {
      const configs = [createValidConfig()];
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: configs,
      });
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: configs[0],
      });

      await service.initialize();

      // Verify logger.info was called with correct parameters
      const mockLogger = (service as any).logger;
      expect(mockLogger.info).toHaveBeenCalledWith(
        "LlmConfigService initialized successfully",
        expect.objectContaining({ configCount: 1 }),
      );
    });
  });

  describe("Cache functionality", () => {
    it("should ensure initialization before operations via ensureInitialized", async () => {
      const configs = [createValidConfig()];
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: configs,
      });
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: configs[0],
      });

      // Service not initialized yet
      expect((service as any).initialized).toBe(false);

      // Call private method ensureInitialized
      await (service as any).ensureInitialized();

      // Should now be initialized with cache populated
      expect((service as any).initialized).toBe(true);
      const cache = (service as any).cache;
      expect(cache.size).toBe(1);
    });

    it("should not reinitialize if already initialized via ensureInitialized", async () => {
      // First initialize manually
      await service.initialize();
      expect(mockStorageService.getAllConfigurations).toHaveBeenCalledTimes(1);

      // Call ensureInitialized - should not call storage again
      await (service as any).ensureInitialized();
      expect(mockStorageService.getAllConfigurations).toHaveBeenCalledTimes(1);
    });

    it("should handle partial configuration load failures during cache initialization", async () => {
      const metadata = [
        {
          id: "test-1",
          customName: "Config 1",
          provider: "openai" as const,
          useAuthHeader: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        {
          id: "test-2",
          customName: "Config 2",
          provider: "anthropic" as const,
          useAuthHeader: false,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ];
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: metadata,
      });

      // First config loads successfully, second fails
      mockStorageService.getCompleteConfiguration
        .mockResolvedValueOnce({
          success: true,
          data: createValidConfig(),
        })
        .mockResolvedValueOnce({
          success: false,
          error: "Failed to load config 2",
        });

      await service.initialize();

      // Should continue with partial data
      const cache = (service as any).cache;
      expect(cache.size).toBe(1); // Only successfully loaded config
      expect((service as any).initialized).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("should preserve custom error types", async () => {
      const input = createValidInput();
      const existingConfig = createValidConfig();

      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [existingConfig],
      });
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: existingConfig,
      });

      const error = await service.create(input).catch((e) => e);

      expect(error).toBeInstanceOf(DuplicateConfigError);
      expect(error.code).toBe("DUPLICATE_CONFIG_NAME");
      expect(error.context).toEqual({ attemptedName: input.customName });
    });

    it("should wrap unexpected errors in ConfigOperationError", async () => {
      const input = createValidInput();

      // Initialize cache successfully first
      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [],
      });
      await service.initialize();

      // Then cause repository.create to throw an unexpected error
      mockRepository.create.mockRejectedValue(new Error("Unexpected error"));

      const error = await service.create(input).catch((e) => e);

      expect(error).toBeInstanceOf(ConfigOperationError);
      expect(error.context.operation).toBe("create");
      expect(error.message).toBe("Configuration creation failed");
    });
  });

  describe("Business rules", () => {
    it("should generate unique IDs for each configuration", async () => {
      const input = createValidInput();

      // Setup different UUIDs for multiple calls
      mockRandomUUID
        .mockReturnValueOnce("uuid-1")
        .mockReturnValueOnce("uuid-2");

      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [],
      });
      mockRepository.create
        .mockResolvedValueOnce({ ...createValidConfig(), id: "uuid-1" })
        .mockResolvedValueOnce({ ...createValidConfig(), id: "uuid-2" });

      const result1 = await service.create(input);
      const result2 = await service.create({
        ...input,
        customName: "Different Name",
      });

      expect(result1.id).toBe("uuid-1");
      expect(result2.id).toBe("uuid-2");
      expect(result1.id).not.toBe(result2.id);
    });

    it("should enforce unique custom names across providers", async () => {
      const input1 = createValidInput();
      const input2 = { ...input1, provider: "anthropic" as const }; // Different provider, same name

      const existingConfig = createValidConfig();

      mockStorageService.getAllConfigurations.mockResolvedValue({
        success: true,
        data: [existingConfig],
      });
      mockStorageService.getCompleteConfiguration.mockResolvedValue({
        success: true,
        data: existingConfig,
      });

      await expect(service.create(input2)).rejects.toThrow(
        DuplicateConfigError,
      );
    });
  });
});
