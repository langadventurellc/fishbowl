// Mock crypto module before any imports
const mockRandomBytes = jest.fn();
jest.mock("crypto", () => ({
  randomBytes: mockRandomBytes,
}));

import { NodeCryptoUtils } from "../NodeCryptoUtils";

describe("NodeCryptoUtils", () => {
  let cryptoUtils: NodeCryptoUtils;

  beforeEach(() => {
    cryptoUtils = new NodeCryptoUtils();
    jest.clearAllMocks();
  });

  describe("randomBytes", () => {
    it("should generate random bytes using Node.js crypto", async () => {
      const mockBytes = Buffer.from([1, 2, 3, 4, 5]);
      mockRandomBytes.mockReturnValue(mockBytes);

      const result = await cryptoUtils.randomBytes(5);

      expect(mockRandomBytes).toHaveBeenCalledWith(5);
      expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it("should handle different byte sizes", async () => {
      const sizes = [16, 32, 64];

      for (const size of sizes) {
        const mockBytes = Buffer.alloc(size).fill(42);
        mockRandomBytes.mockReturnValue(mockBytes);

        const result = await cryptoUtils.randomBytes(size);

        expect(mockRandomBytes).toHaveBeenCalledWith(size);
        expect(result.length).toBe(size);
        expect(result).toBeInstanceOf(Uint8Array);
      }
    });

    it("should handle zero bytes", async () => {
      const mockBytes = Buffer.alloc(0);
      mockRandomBytes.mockReturnValue(mockBytes);

      const result = await cryptoUtils.randomBytes(0);

      expect(mockRandomBytes).toHaveBeenCalledWith(0);
      expect(result.length).toBe(0);
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe("generateId", () => {
    beforeEach(() => {
      // Mock 16 bytes of data for UUID generation
      const mockBytes = Buffer.from([
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x11, 0x22, 0x33, 0x44,
        0x55, 0x66, 0x77, 0x88,
      ]);
      mockRandomBytes.mockReturnValue(mockBytes);
    });

    it("should generate a UUID v4 format identifier", () => {
      const result = cryptoUtils.generateId();

      expect(mockRandomBytes).toHaveBeenCalledWith(16);
      expect(result).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("should generate different IDs on subsequent calls", () => {
      // First call
      const mockBytes1 = Buffer.from([
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x11, 0x22, 0x33, 0x44,
        0x55, 0x66, 0x77, 0x88,
      ]);
      mockRandomBytes.mockReturnValueOnce(mockBytes1);

      // Second call
      const mockBytes2 = Buffer.from([
        0x88, 0x77, 0x66, 0x55, 0x44, 0x33, 0x22, 0x11, 0xf0, 0xde, 0xbc, 0x9a,
        0x78, 0x56, 0x34, 0x12,
      ]);
      mockRandomBytes.mockReturnValueOnce(mockBytes2);

      const id1 = cryptoUtils.generateId();
      const id2 = cryptoUtils.generateId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      expect(id2).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("should set version 4 in the UUID", () => {
      const result = cryptoUtils.generateId();

      // Version 4 UUIDs have '4' as the first character of the third group
      const parts = result.split("-");
      expect(parts[2]).toBeDefined();
      const versionChar = parts[2]![0];
      expect(versionChar).toBe("4");
    });

    it("should set variant bits correctly", () => {
      const result = cryptoUtils.generateId();

      // Variant bits should be 10xx (8, 9, A, or B)
      const parts = result.split("-");
      expect(parts[3]).toBeDefined();
      const variantChar = parts[3]![0]!.toLowerCase();
      expect(["8", "9", "a", "b"]).toContain(variantChar);
    });
  });

  describe("getByteLength", () => {
    it("should return byte length for ASCII string", async () => {
      const result = await cryptoUtils.getByteLength("hello");

      expect(result).toBe(5);
    });

    it("should return correct byte length for UTF-8 string", async () => {
      const result = await cryptoUtils.getByteLength("héllo");

      // 'é' is 2 bytes in UTF-8
      expect(result).toBe(6);
    });

    it("should handle empty string", async () => {
      const result = await cryptoUtils.getByteLength("");

      expect(result).toBe(0);
    });

    it("should handle strings with emoji", async () => {
      const result = await cryptoUtils.getByteLength("👋 hello");

      // '👋' is 4 bytes, space is 1 byte, 'hello' is 5 bytes = 10 total
      expect(result).toBe(10);
    });

    it("should handle multi-byte Unicode characters", async () => {
      const result = await cryptoUtils.getByteLength("🌟✨💫");

      // Unicode emoji characters vary in byte length
      expect(result).toBe(11);
    });

    it("should handle long strings", async () => {
      const longString = "a".repeat(1000);
      const result = await cryptoUtils.getByteLength(longString);

      expect(result).toBe(1000);
    });
  });

  describe("interface compliance", () => {
    it("should implement all CryptoUtilsInterface methods", () => {
      expect(typeof cryptoUtils.randomBytes).toBe("function");
      expect(typeof cryptoUtils.generateId).toBe("function");
      expect(typeof cryptoUtils.getByteLength).toBe("function");
    });

    it("should return promises for async methods", () => {
      const randomBytesPromise = cryptoUtils.randomBytes(16);
      const getByteLengthPromise = cryptoUtils.getByteLength("test");

      expect(randomBytesPromise).toBeInstanceOf(Promise);
      expect(getByteLengthPromise).toBeInstanceOf(Promise);
    });

    it("should return string for generateId", () => {
      const mockBytes = Buffer.from([
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x11, 0x22, 0x33, 0x44,
        0x55, 0x66, 0x77, 0x88,
      ]);
      mockRandomBytes.mockReturnValue(mockBytes);

      const result = cryptoUtils.generateId();

      expect(typeof result).toBe("string");
    });
  });

  describe("error handling", () => {
    it("should handle crypto.randomBytes errors gracefully", async () => {
      mockRandomBytes.mockImplementation(() => {
        throw new Error("Crypto error");
      });

      await expect(cryptoUtils.randomBytes(16)).rejects.toThrow("Crypto error");
    });

    it("should handle generateId crypto errors gracefully", () => {
      mockRandomBytes.mockImplementation(() => {
        throw new Error("Crypto error");
      });

      expect(() => cryptoUtils.generateId()).toThrow("Crypto error");
    });
  });
});
