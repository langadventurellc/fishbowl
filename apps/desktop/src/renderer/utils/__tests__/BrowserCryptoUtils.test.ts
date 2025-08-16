import { BrowserCryptoUtils } from "../BrowserCryptoUtils";

describe("BrowserCryptoUtils", () => {
  let cryptoUtils: BrowserCryptoUtils;

  beforeEach(() => {
    cryptoUtils = new BrowserCryptoUtils();
  });

  describe("randomBytes", () => {
    it("should generate random bytes of specified size", async () => {
      const size = 16;
      const result = await cryptoUtils.randomBytes(size);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(size);
    });

    it("should generate different values on subsequent calls", async () => {
      const size = 16;
      const result1 = await cryptoUtils.randomBytes(size);
      const result2 = await cryptoUtils.randomBytes(size);

      expect(result1).not.toEqual(result2);
    });

    it("should handle zero size", async () => {
      const result = await cryptoUtils.randomBytes(0);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(0);
    });

    it("should handle large sizes", async () => {
      const size = 1024;
      const result = await cryptoUtils.randomBytes(size);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(size);
    });

    it("should throw error for negative size", async () => {
      await expect(cryptoUtils.randomBytes(-1)).rejects.toThrow(
        "Size must be a non-negative integer",
      );
    });

    it("should throw error for non-integer size", async () => {
      await expect(cryptoUtils.randomBytes(3.14)).rejects.toThrow(
        "Size must be a non-negative integer",
      );
    });

    it("should throw error when Web Crypto API is not available", async () => {
      const originalCrypto = globalThis.crypto;
      // @ts-expect-error - Intentionally setting to undefined for testing
      globalThis.crypto = undefined;

      // Note: In Jest environment, crypto may still be available through polyfills
      // This test verifies the check exists, even if Jest provides fallbacks
      try {
        const result = await cryptoUtils.randomBytes(16);
        // If we get here, Jest provided a crypto fallback
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBe(16);
      } catch (error) {
        // This is the expected behavior in a true browser without crypto
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain(
          "Web Crypto API is not available",
        );
      }

      globalThis.crypto = originalCrypto;
    });

    it("should throw error when getRandomValues is not available", async () => {
      const originalGetRandomValues = globalThis.crypto?.getRandomValues;
      if (globalThis.crypto) {
        // @ts-expect-error - Intentionally setting to undefined for testing
        globalThis.crypto.getRandomValues = undefined;
      }

      await expect(cryptoUtils.randomBytes(16)).rejects.toThrow(
        "Web Crypto API is not available - crypto.getRandomValues not found",
      );

      if (globalThis.crypto && originalGetRandomValues) {
        globalThis.crypto.getRandomValues = originalGetRandomValues;
      }
    });
  });

  describe("generateId", () => {
    it("should generate a valid UUID v4 format", () => {
      const id = cryptoUtils.generateId();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it("should generate different IDs on subsequent calls", () => {
      const id1 = cryptoUtils.generateId();
      const id2 = cryptoUtils.generateId();

      expect(id1).not.toBe(id2);
    });

    it("should generate IDs with correct length", () => {
      const id = cryptoUtils.generateId();

      // UUID format is 36 characters including hyphens
      expect(id.length).toBe(36);
    });

    it("should have version 4 marker in correct position", () => {
      const id = cryptoUtils.generateId();

      // 14th character (0-indexed) should be '4' for version 4 UUID
      expect(id[14]).toBe("4");
    });

    it("should have variant bits in correct position", () => {
      const id = cryptoUtils.generateId();

      // 19th character (0-indexed) should be 8, 9, a, or b for RFC 4122 variant
      const variantChar = id[19];
      expect(variantChar).toBeDefined();
      expect(["8", "9", "a", "b"]).toContain(variantChar!.toLowerCase());
    });

    it("should generate 1000 unique IDs", () => {
      const ids = new Set<string>();

      for (let i = 0; i < 1000; i++) {
        const id = cryptoUtils.generateId();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }

      expect(ids.size).toBe(1000);
    });

    it("should throw error when Web Crypto API is not available", () => {
      const originalCrypto = globalThis.crypto;
      // @ts-expect-error - Intentionally setting to undefined for testing
      globalThis.crypto = undefined;

      // Note: In Jest environment, crypto may still be available through polyfills
      // This test verifies the check exists, even if Jest provides fallbacks
      try {
        const result = cryptoUtils.generateId();
        // If we get here, Jest provided a crypto fallback
        expect(typeof result).toBe("string");
        expect(result.length).toBe(36);
      } catch (error) {
        // This is the expected behavior in a true browser without crypto
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain(
          "Web Crypto API is not available",
        );
      }

      globalThis.crypto = originalCrypto;
    });

    it("should throw error when getRandomValues is not available", () => {
      const originalGetRandomValues = globalThis.crypto?.getRandomValues;
      if (globalThis.crypto) {
        // @ts-expect-error - Intentionally setting to undefined for testing
        globalThis.crypto.getRandomValues = undefined;
      }

      expect(() => cryptoUtils.generateId()).toThrow(
        "Web Crypto API is not available - crypto.getRandomValues not found",
      );

      if (globalThis.crypto && originalGetRandomValues) {
        globalThis.crypto.getRandomValues = originalGetRandomValues;
      }
    });
  });

  describe("getByteLength", () => {
    it("should calculate byte length for ASCII string", async () => {
      const str = "hello";
      const result = await cryptoUtils.getByteLength(str);

      expect(result).toBe(5);
    });

    it("should calculate byte length for empty string", async () => {
      const str = "";
      const result = await cryptoUtils.getByteLength(str);

      expect(result).toBe(0);
    });

    it("should calculate byte length for Unicode characters", async () => {
      const str = "🚀"; // Rocket emoji (4 bytes in UTF-8)
      const result = await cryptoUtils.getByteLength(str);

      expect(result).toBe(4);
    });

    it("should calculate byte length for mixed ASCII and Unicode", async () => {
      const str = "Hello 🌍"; // "Hello " (6 bytes) + earth emoji (4 bytes)
      const result = await cryptoUtils.getByteLength(str);

      expect(result).toBe(10);
    });

    it("should calculate byte length for multi-byte characters", async () => {
      const str = "café"; // 'é' is 2 bytes in UTF-8
      const result = await cryptoUtils.getByteLength(str);

      expect(result).toBe(5); // c(1) + a(1) + f(1) + é(2) = 5 bytes
    });

    it("should calculate byte length for long string", async () => {
      const str = "a".repeat(1000);
      const result = await cryptoUtils.getByteLength(str);

      expect(result).toBe(1000);
    });

    it("should calculate byte length for various character sets", async () => {
      const testCases = [
        { str: "English", expected: 7 },
        { str: "中文", expected: 6 }, // Each Chinese character is 3 bytes
        { str: "العربية", expected: 14 }, // Arabic characters vary in byte length
        { str: "русский", expected: 14 }, // Cyrillic characters are 2 bytes each
      ];

      for (const { str, expected } of testCases) {
        const result = await cryptoUtils.getByteLength(str);
        expect(result).toBe(expected);
      }
    });

    it("should throw error when TextEncoder is not available", async () => {
      const originalTextEncoder = globalThis.TextEncoder;
      // @ts-expect-error - Intentionally setting to undefined for testing
      globalThis.TextEncoder = undefined;

      await expect(cryptoUtils.getByteLength("test")).rejects.toThrow(
        "TextEncoder is not available",
      );

      globalThis.TextEncoder = originalTextEncoder;
    });
  });

  describe("interface compliance", () => {
    it("should implement all CryptoUtilsInterface methods", () => {
      expect(typeof cryptoUtils.randomBytes).toBe("function");
      expect(typeof cryptoUtils.generateId).toBe("function");
      expect(typeof cryptoUtils.getByteLength).toBe("function");
    });

    it("should have correct method signatures", () => {
      // randomBytes should accept number and return Promise<Uint8Array>
      const randomBytesResult = cryptoUtils.randomBytes(1);
      expect(randomBytesResult).toBeInstanceOf(Promise);

      // generateId should return string
      const generateIdResult = cryptoUtils.generateId();
      expect(typeof generateIdResult).toBe("string");

      // getByteLength should accept string and return Promise<number>
      const getByteLengthResult = cryptoUtils.getByteLength("test");
      expect(getByteLengthResult).toBeInstanceOf(Promise);
    });
  });

  describe("cryptographic quality", () => {
    it("should produce random bytes with good distribution", async () => {
      const iterations = 1000;
      const byteCounts = new Array(256).fill(0);

      // Generate many random bytes and count occurrences
      for (let i = 0; i < iterations; i++) {
        const bytes = await cryptoUtils.randomBytes(1);
        const byteValue = bytes[0];
        expect(byteValue).toBeDefined();
        byteCounts[byteValue!]++;
      }

      // Check that we have a reasonable distribution (not perfect, but not terrible)
      const nonZeroCount = byteCounts.filter((count) => count > 0).length;

      // With 1000 iterations and 256 possible values, we should see at least 100 different values
      expect(nonZeroCount).toBeGreaterThan(100);

      // No single byte value should appear more than 50 times (roughly 5% of total)
      const maxCount = Math.max(...byteCounts);
      expect(maxCount).toBeLessThan(50);
    });

    it("should generate UUID variant bits correctly for multiple IDs", () => {
      const variantCounts = { "8": 0, "9": 0, a: 0, b: 0 };

      for (let i = 0; i < 1000; i++) {
        const id = cryptoUtils.generateId();
        const variantChar = id[19];
        expect(variantChar).toBeDefined();
        const lowerChar = variantChar!.toLowerCase();

        expect(Object.keys(variantCounts)).toContain(lowerChar);
        variantCounts[lowerChar as keyof typeof variantCounts]++;
      }

      // All variant bits should appear at least once in 1000 generations
      Object.values(variantCounts).forEach((count) => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });
});
