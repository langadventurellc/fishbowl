import { safeStorage, app } from "electron";
import * as fs from "fs";
import { LlmSecureStorage } from "../LlmSecureStorage";

// Mock electron
jest.mock("electron", () => ({
  safeStorage: {
    isEncryptionAvailable: jest.fn(),
    encryptString: jest.fn(),
    decryptString: jest.fn(),
  },
  app: {
    getPath: jest.fn(),
  },
}));

// Mock fs
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
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
  const mockUserDataPath = "/test/userData";
  const expectedFilePath = "/test/userData/secure_keys.json";

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock app.getPath to return test directory
    (app.getPath as jest.Mock).mockReturnValue(mockUserDataPath);
    // Mock fs methods
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.readFileSync as jest.Mock).mockReturnValue("{}");
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

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

    it("should return false when safeStorage throws error", () => {
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
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expectedFilePath,
        JSON.stringify(
          {
            "llm_api_key_test-id": testBuffer.toString("base64"),
          },
          null,
          2,
        ),
        "utf8",
      );
    });

    it("should throw Error for invalid ID", () => {
      expect(() => storage.store("", "api-key")).toThrow(Error);
      expect(() => storage.store(null as any, "api-key")).toThrow(Error);
    });

    it("should throw Error for invalid API key", () => {
      expect(() => storage.store("id", "")).toThrow(Error);
      expect(() => storage.store("id", null as any)).toThrow(Error);
    });

    it("should throw Error when encryption is not available", () => {
      (safeStorage.isEncryptionAvailable as jest.Mock).mockReturnValue(false);

      expect(() => storage.store("id", "api-key")).toThrow(
        "Secure storage is not available on this system",
      );
    });
  });

  describe("retrieve", () => {
    beforeEach(() => {
      (safeStorage.isEncryptionAvailable as jest.Mock).mockReturnValue(true);
    });

    it("should retrieve and decrypt API key successfully", () => {
      const testBuffer = Buffer.from("encrypted");
      const testData = {
        "llm_api_key_test-id": testBuffer.toString("base64"),
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(testData));
      (safeStorage.decryptString as jest.Mock).mockReturnValue(
        "decrypted-api-key",
      );

      const result = storage.retrieve("test-id");

      expect(fs.readFileSync).toHaveBeenCalledWith(expectedFilePath, "utf8");
      expect(safeStorage.decryptString).toHaveBeenCalledWith(testBuffer);
      expect(result).toBe("decrypted-api-key");
    });

    it("should return null when API key not found", () => {
      const result = storage.retrieve("non-existent");

      expect(result).toBeNull();
    });

    it("should return null when storage file does not exist", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = storage.retrieve("test-id");

      expect(result).toBeNull();
    });

    it("should return null for invalid ID", () => {
      const result1 = storage.retrieve("");
      const result2 = storage.retrieve(null as any);

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it("should return null when encryption is not available", () => {
      (safeStorage.isEncryptionAvailable as jest.Mock).mockReturnValue(false);

      const result = storage.retrieve("test-id");

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete API key successfully", () => {
      const existingData = {
        "llm_api_key_test-id": "encrypted-data",
        llm_api_key_other: "other-data",
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(existingData),
      );

      storage.delete("test-id");

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expectedFilePath,
        JSON.stringify(
          {
            llm_api_key_other: "other-data",
          },
          null,
          2,
        ),
        "utf8",
      );
    });

    it("should handle deletion when key does not exist", () => {
      const existingData = {
        llm_api_key_other: "other-data",
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(existingData),
      );

      storage.delete("non-existent");

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expectedFilePath,
        JSON.stringify(existingData, null, 2),
        "utf8",
      );
    });

    it("should handle invalid ID gracefully", () => {
      expect(() => storage.delete("")).not.toThrow();
      expect(() => storage.delete(null as any)).not.toThrow();
    });
  });
});
