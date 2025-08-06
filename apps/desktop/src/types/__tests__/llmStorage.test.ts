import type {
  LlmConfigMetadata,
  SecureStorageInterface,
  StorageResult,
} from "../llmStorage";
import { StorageError } from "../llmStorage";

describe("llmStorage types", () => {
  describe("StorageError", () => {
    test("should create error instance with code", () => {
      const error = new StorageError("Encryption failed", "ENCRYPTION_FAILED");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(StorageError);
      expect(error.message).toBe("Encryption failed");
      expect(error.code).toBe("ENCRYPTION_FAILED");
      expect(error.name).toBe("StorageError");
    });

    test("should maintain stack trace", () => {
      const error = new StorageError("Test error", "TEST_CODE");

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("StorageError");
    });
  });

  describe("LlmConfigMetadata interface", () => {
    test("should be implementable with required fields", () => {
      const metadata: LlmConfigMetadata = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        customName: "Production OpenAI",
        provider: "openai",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(metadata).toBeDefined();
      expect(metadata.id).toBeDefined();
      expect(metadata.customName).toBeDefined();
    });

    test("should allow optional fields", () => {
      const metadata: LlmConfigMetadata = {
        id: "test-id",
        customName: "Custom Model",
        provider: "custom",
        baseUrl: "https://api.custom.com",
        authHeaderType: "Bearer",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(metadata.baseUrl).toBe("https://api.custom.com");
      expect(metadata.authHeaderType).toBe("Bearer");
    });
  });

  describe("SecureStorageInterface", () => {
    test("should be implementable", () => {
      const mockStorage: SecureStorageInterface = {
        isAvailable: () => true,
        store: (_id: string, _apiKey: string) => {
          // Mock implementation
        },
        retrieve: (_id: string) => "mock-api-key",
        delete: (_id: string) => {
          // Mock implementation
        },
      };

      expect(mockStorage.isAvailable()).toBe(true);
      expect(mockStorage.retrieve("test")).toBe("mock-api-key");
    });
  });

  describe("StorageResult interface", () => {
    test("should handle success case", () => {
      const result: StorageResult<string> = {
        success: true,
        data: "test-data",
      };

      expect(result.success).toBe(true);
      expect(result.data).toBe("test-data");
      expect(result.error).toBeUndefined();
    });

    test("should handle failure case", () => {
      const result: StorageResult<string> = {
        success: false,
        error: "Operation failed",
      };

      expect(result.success).toBe(false);
      expect(result.error).toBe("Operation failed");
      expect(result.data).toBeUndefined();
    });
  });
});
