import { safeStorage } from "electron";
import { LlmSecureStorage } from "../LlmSecureStorage";
import { StorageError } from "../../../types/llmStorage";

// Mock electron
jest.mock("electron", () => ({
  safeStorage: {
    isEncryptionAvailable: jest.fn(),
    encryptString: jest.fn(),
    decryptString: jest.fn(),
  },
}));

// Mock logger
jest.mock("@fishbowl-ai/shared", () => ({
  createLoggerSync: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe("LlmSecureStorage", () => {
  let storage: LlmSecureStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear global storage
    delete global.llmSecureStorage;
    storage = new LlmSecureStorage();
  });

  describe("isAvailable", () => {
    it("should return true when encryption is available", () => {
      (safeStorage.isEncryptionAvailable as jest.Mock).mockReturnValue(true);

      const result = storage.isAvailable();

      expect(result).toBe(true);
      expect(safeStorage.isEncryptionAvailable).toHaveBeenCalled();
    });

    it("should return false when encryption is not available", () => {
      (safeStorage.isEncryptionAvailable as jest.Mock).mockReturnValue(false);

      const result = storage.isAvailable();

      expect(result).toBe(false);
    });

    it("should return false when checking availability throws", () => {
      (safeStorage.isEncryptionAvailable as jest.Mock).mockImplementation(
        () => {
          throw new Error("System error");
        },
      );

      const result = storage.isAvailable();

      expect(result).toBe(false);
    });
  });

  describe("store", () => {
    beforeEach(() => {
      (safeStorage.isEncryptionAvailable as jest.Mock).mockReturnValue(true);
    });

    it("should store encrypted API key successfully", () => {
      const testBuffer = Buffer.from("encrypted");
      (safeStorage.encryptString as jest.Mock).mockReturnValue(testBuffer);

      storage.store("test-id", "test-api-key");

      expect(safeStorage.encryptString).toHaveBeenCalledWith("test-api-key");
      expect(global.llmSecureStorage).toBeDefined();
      expect(global.llmSecureStorage?.has("llm_api_key_test-id")).toBe(true);
      expect(global.llmSecureStorage?.get("llm_api_key_test-id")).toBe(
        testBuffer.toString("base64"),
      );
    });

    it("should throw StorageError for invalid ID", () => {
      expect(() => storage.store("", "api-key")).toThrow(StorageError);
      expect(() => storage.store(null as any, "api-key")).toThrow(StorageError);
    });

    it("should throw StorageError for invalid API key", () => {
      expect(() => storage.store("id", "")).toThrow(StorageError);
      expect(() => storage.store("id", null as any)).toThrow(StorageError);
    });

    it("should throw StorageError when encryption is not available", () => {
      (safeStorage.isEncryptionAvailable as jest.Mock).mockReturnValue(false);

      expect(() => storage.store("id", "api-key")).toThrow(
        new StorageError(
          "Secure storage is not available on this system",
          "STORAGE_UNAVAILABLE",
        ),
      );
    });

    it("should throw StorageError when encryption fails", () => {
      (safeStorage.encryptString as jest.Mock).mockImplementation(() => {
        throw new Error("Encryption failed");
      });

      expect(() => storage.store("id", "api-key")).toThrow(
        new StorageError(
          "Failed to encrypt and store API key",
          "ENCRYPTION_FAILED",
        ),
      );
    });
  });

  describe("retrieve", () => {
    beforeEach(() => {
      (safeStorage.isEncryptionAvailable as jest.Mock).mockReturnValue(true);
    });

    it("should retrieve and decrypt API key successfully", () => {
      // Setup: Store an encrypted key
      const encryptedData = "encrypted-base64-data";
      global.llmSecureStorage = new Map();
      global.llmSecureStorage.set("llm_api_key_test-id", encryptedData);

      (safeStorage.decryptString as jest.Mock).mockReturnValue(
        "decrypted-api-key",
      );

      const result = storage.retrieve("test-id");

      expect(result).toBe("decrypted-api-key");
      expect(safeStorage.decryptString).toHaveBeenCalledWith(
        Buffer.from(encryptedData, "base64"),
      );
    });

    it("should return null for non-existent key", () => {
      const result = storage.retrieve("non-existent");

      expect(result).toBeNull();
      expect(safeStorage.decryptString).not.toHaveBeenCalled();
    });

    it("should return null for invalid ID", () => {
      expect(storage.retrieve("")).toBeNull();
      expect(storage.retrieve(null as any)).toBeNull();
    });

    it("should return null when encryption is not available", () => {
      (safeStorage.isEncryptionAvailable as jest.Mock).mockReturnValue(false);

      const result = storage.retrieve("test-id");

      expect(result).toBeNull();
    });

    it("should throw StorageError when decryption fails", () => {
      global.llmSecureStorage = new Map();
      global.llmSecureStorage.set("llm_api_key_test-id", "encrypted");

      (safeStorage.decryptString as jest.Mock).mockImplementation(() => {
        throw new Error("Decryption failed");
      });

      expect(() => storage.retrieve("test-id")).toThrow(
        new StorageError("Failed to decrypt API key", "DECRYPTION_FAILED"),
      );
    });
  });

  describe("delete", () => {
    it("should delete API key successfully", () => {
      global.llmSecureStorage = new Map();
      global.llmSecureStorage.set("llm_api_key_test-id", "encrypted");

      storage.delete("test-id");

      expect(global.llmSecureStorage.has("llm_api_key_test-id")).toBe(false);
    });

    it("should not throw when deleting non-existent key", () => {
      expect(() => storage.delete("non-existent")).not.toThrow();
    });

    it("should not throw for invalid ID", () => {
      expect(() => storage.delete("")).not.toThrow();
      expect(() => storage.delete(null as any)).not.toThrow();
    });

    it("should not throw when global storage doesn't exist", () => {
      delete global.llmSecureStorage;

      expect(() => storage.delete("test-id")).not.toThrow();
    });
  });

  describe("store and retrieve round-trip", () => {
    it("should successfully store and retrieve the same API key", () => {
      (safeStorage.isEncryptionAvailable as jest.Mock).mockReturnValue(true);

      const apiKey = "sk-test-1234567890abcdef";
      const encryptedBuffer = Buffer.from("encrypted-content");

      (safeStorage.encryptString as jest.Mock).mockReturnValue(encryptedBuffer);
      (safeStorage.decryptString as jest.Mock).mockReturnValue(apiKey);

      // Store the API key
      storage.store("config-123", apiKey);

      // Retrieve it back
      const retrieved = storage.retrieve("config-123");

      expect(retrieved).toBe(apiKey);
      expect(safeStorage.encryptString).toHaveBeenCalledWith(apiKey);
      expect(safeStorage.decryptString).toHaveBeenCalledWith(encryptedBuffer);
    });
  });
});
