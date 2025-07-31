import * as path from "path";
import { FileStorageService } from "../FileStorageService";
import { FileSystemBridge } from "../FileSystemBridge";
import {
  FileNotFoundError,
  InvalidJsonError,
  WritePermissionError,
} from "../errors";

// Mock implementation for testing
class MockFileSystemBridge implements FileSystemBridge {
  private files: Map<string, string> = new Map();
  private shouldThrowError: Error | null = null;

  setFileContent(path: string, content: string): void {
    this.files.set(path, content);
  }

  setShouldThrowError(error: Error | null): void {
    this.shouldThrowError = error;
  }

  clear(): void {
    this.files.clear();
    this.shouldThrowError = null;
  }

  async readFile(path: string, _encoding: string): Promise<string> {
    if (this.shouldThrowError) {
      throw this.shouldThrowError;
    }

    if (!this.files.has(path)) {
      const error = new Error(
        `ENOENT: no such file or directory, open '${path}'`,
      ) as Error & { code: string };
      error.code = "ENOENT";
      throw error;
    }

    return this.files.get(path)!;
  }

  async writeFile(): Promise<void> {
    // Not needed for read functionality tests
    throw new Error("writeFile not implemented in mock");
  }

  async mkdir(): Promise<void> {
    // Not needed for read functionality tests
    throw new Error("mkdir not implemented in mock");
  }

  async unlink(): Promise<void> {
    // Not needed for read functionality tests
    throw new Error("unlink not implemented in mock");
  }

  async rename(): Promise<void> {
    // Not needed for read functionality tests
    throw new Error("rename not implemented in mock");
  }
}

describe("FileStorageService", () => {
  let service: FileStorageService;
  let mockFs: MockFileSystemBridge;

  beforeEach(() => {
    mockFs = new MockFileSystemBridge();
    service = new FileStorageService(mockFs);
  });

  describe("readJsonFile", () => {
    it("should successfully read and parse valid JSON", async () => {
      const testData = { name: "test", value: 42 };
      const filePath = "/test/data.json";
      const absolutePath = path.resolve(filePath);

      mockFs.setFileContent(absolutePath, JSON.stringify(testData));

      const result = await service.readJsonFile(filePath);

      expect(result).toEqual(testData);
    });

    it("should handle generic typing correctly", async () => {
      interface TestData {
        id: number;
        name: string;
      }

      const testData: TestData = { id: 1, name: "test" };
      const filePath = "/test/typed.json";
      const absolutePath = path.resolve(filePath);

      mockFs.setFileContent(absolutePath, JSON.stringify(testData));

      const result = await service.readJsonFile<TestData>(filePath);

      expect(result.id).toBe(1);
      expect(result.name).toBe("test");
      expect(typeof result.id).toBe("number");
      expect(typeof result.name).toBe("string");
    });

    it("should handle various JSON data types", async () => {
      const testCases = [
        { name: "string", data: "hello world" },
        { name: "number", data: 42.5 },
        { name: "boolean", data: true },
        { name: "array", data: [1, 2, 3] },
        { name: "object", data: { nested: { value: "test" } } },
        { name: "null", data: null },
      ];

      for (const testCase of testCases) {
        const filePath = `/test/${testCase.name}.json`;
        const absolutePath = path.resolve(filePath);

        mockFs.setFileContent(absolutePath, JSON.stringify(testCase.data));
        const result = await service.readJsonFile(filePath);
        expect(result).toEqual(testCase.data);
      }
    });

    it("should handle complex nested objects", async () => {
      const complexData = {
        users: [
          { id: 1, name: "Alice", settings: { theme: "dark", lang: "en" } },
          { id: 2, name: "Bob", settings: { theme: "light", lang: "fr" } },
        ],
        metadata: {
          version: "1.0.0",
          lastUpdated: "2025-01-01T00:00:00Z",
          features: ["auth", "persistence", "themes"],
        },
      };
      const filePath = "/test/complex.json";
      const absolutePath = path.resolve(filePath);

      mockFs.setFileContent(absolutePath, JSON.stringify(complexData));

      const result = await service.readJsonFile(filePath);

      expect(result).toEqual(complexData);
      expect((result as typeof complexData).users).toHaveLength(2);
      expect((result as typeof complexData).metadata.features).toContain(
        "auth",
      );
    });
  });

  describe("error handling", () => {
    it("should throw FileNotFoundError for missing files", async () => {
      const filePath = "/nonexistent.json";

      await expect(service.readJsonFile(filePath)).rejects.toThrow(
        FileNotFoundError,
      );
    });

    it("should throw InvalidJsonError for malformed JSON", async () => {
      const filePath = "/test/bad.json";
      const absolutePath = path.resolve(filePath);

      mockFs.setFileContent(absolutePath, "{ invalid json }");

      await expect(service.readJsonFile(filePath)).rejects.toThrow(
        InvalidJsonError,
      );
    });

    it("should throw InvalidJsonError for incomplete JSON", async () => {
      const filePath = "/test/incomplete.json";
      const absolutePath = path.resolve(filePath);

      mockFs.setFileContent(absolutePath, '{ "name": "test", "value": ');

      await expect(service.readJsonFile(filePath)).rejects.toThrow(
        InvalidJsonError,
      );
    });

    it("should preserve file path in FileNotFoundError", async () => {
      const filePath = "/test/missing.json";

      try {
        await service.readJsonFile(filePath);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(FileNotFoundError);
        expect((error as FileNotFoundError).filePath).toBe(
          path.resolve(filePath),
        );
        expect((error as FileNotFoundError).operation).toBe("read");
      }
    });

    it("should preserve file path and parse error in InvalidJsonError", async () => {
      const filePath = "/test/invalid.json";
      const absolutePath = path.resolve(filePath);

      mockFs.setFileContent(absolutePath, "{ broken json");

      try {
        await service.readJsonFile(filePath);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidJsonError);
        expect((error as InvalidJsonError).filePath).toBe(absolutePath);
        expect((error as InvalidJsonError).operation).toBe("parse");
        expect((error as InvalidJsonError).parseError).toMatch(
          /Expected property name|Unexpected token/,
        );
      }
    });

    it("should handle other file system errors", async () => {
      const filePath = "/test/permission-denied.json";
      const fsError = new Error("EACCES: permission denied") as Error & {
        code: string;
      };
      fsError.code = "EACCES";

      mockFs.setShouldThrowError(fsError);

      await expect(service.readJsonFile(filePath)).rejects.toThrow(
        WritePermissionError,
      );
    });

    it("should re-throw custom errors unchanged", async () => {
      const filePath = "/test/custom-error.json";
      const customError = new FileNotFoundError(filePath, "test");

      mockFs.setShouldThrowError(customError);

      await expect(service.readJsonFile(filePath)).rejects.toThrow(customError);
    });
  });

  describe("path validation", () => {
    it("should reject empty paths", async () => {
      await expect(service.readJsonFile("")).rejects.toThrow(
        "File path cannot be empty",
      );
      await expect(service.readJsonFile("   ")).rejects.toThrow(
        "File path cannot be empty",
      );
      await expect(service.readJsonFile("\t")).rejects.toThrow(
        "File path cannot be empty",
      );
    });

    it("should reject path traversal attempts", async () => {
      const dangerousPaths = [
        "../../../etc/passwd",
        "../../config.json",
        "test/../../../secret.json",
        "./../../admin/config.json",
        "config/../../secrets.json",
      ];

      for (const dangerousPath of dangerousPaths) {
        await expect(service.readJsonFile(dangerousPath)).rejects.toThrow(
          "Dangerous path detected",
        );
      }
    });

    it("should reject home directory paths", async () => {
      const homePaths = [
        "~/secret.json",
        "~/.ssh/config",
        "~/Documents/private.json",
        "~root/admin.json",
      ];

      for (const homePath of homePaths) {
        await expect(service.readJsonFile(homePath)).rejects.toThrow(
          "Home directory paths not allowed",
        );
      }
    });

    it("should accept valid relative paths", async () => {
      const validPath = "config/settings.json";
      const absolutePath = path.resolve(validPath);
      const testData = { valid: true };

      mockFs.setFileContent(absolutePath, JSON.stringify(testData));

      const result = await service.readJsonFile(validPath);
      expect(result).toEqual(testData);
    });

    it("should accept valid absolute paths", async () => {
      const absolutePath = "/var/data/config.json";
      const testData = { absolute: true };

      mockFs.setFileContent(absolutePath, JSON.stringify(testData));

      const result = await service.readJsonFile(absolutePath);
      expect(result).toEqual(testData);
    });

    it("should normalize paths correctly", async () => {
      const unnormalizedPath = "config//settings/../settings.json";
      const normalizedPath = path.resolve("config/settings.json");
      const testData = { normalized: true };

      mockFs.setFileContent(normalizedPath, JSON.stringify(testData));

      const result = await service.readJsonFile(unnormalizedPath);
      expect(result).toEqual(testData);
    });
  });

  describe("constructor and dependency injection", () => {
    it("should use provided FileSystemBridge", async () => {
      const customMock = new MockFileSystemBridge();
      const customService = new FileStorageService(customMock);
      const testData = { custom: true };
      const filePath = "/test/custom.json";
      const absolutePath = path.resolve(filePath);

      customMock.setFileContent(absolutePath, JSON.stringify(testData));

      const result = await customService.readJsonFile(filePath);
      expect(result).toEqual(testData);
    });

    it("should create with default NodeFileSystemBridge when no bridge provided", () => {
      const defaultService = new FileStorageService();

      // Test that it's a valid FileStorageService instance
      expect(defaultService).toBeInstanceOf(FileStorageService);
      expect(typeof defaultService.readJsonFile).toBe("function");
    });
  });

  describe("edge cases", () => {
    it("should handle empty JSON files", async () => {
      const filePath = "/test/empty.json";
      const absolutePath = path.resolve(filePath);

      mockFs.setFileContent(absolutePath, "");

      await expect(service.readJsonFile(filePath)).rejects.toThrow(
        InvalidJsonError,
      );
    });

    it("should handle whitespace-only JSON files", async () => {
      const filePath = "/test/whitespace.json";
      const absolutePath = path.resolve(filePath);

      mockFs.setFileContent(absolutePath, "   \n\t  \n   ");

      await expect(service.readJsonFile(filePath)).rejects.toThrow(
        InvalidJsonError,
      );
    });

    it("should handle valid JSON with leading/trailing whitespace", async () => {
      const filePath = "/test/whitespace-valid.json";
      const absolutePath = path.resolve(filePath);
      const testData = { whitespace: "handled" };

      mockFs.setFileContent(
        absolutePath,
        `\n\t  ${JSON.stringify(testData)}  \n\t`,
      );

      const result = await service.readJsonFile(filePath);
      expect(result).toEqual(testData);
    });

    it("should handle JSON with special characters", async () => {
      const filePath = "/test/special-chars.json";
      const absolutePath = path.resolve(filePath);
      const testData = {
        unicode: "Hello 世界 🌍",
        emoji: "🚀💻📁",
        special: "\"quotes\" and 'apostrophes' and \\backslashes\\",
        newlines: "Line 1\nLine 2\nLine 3",
      };

      mockFs.setFileContent(absolutePath, JSON.stringify(testData));

      const result = await service.readJsonFile(filePath);
      expect(result).toEqual(testData);
    });
  });

  describe("type safety", () => {
    it("should maintain type safety with generic parameters", async () => {
      interface Config {
        theme: "light" | "dark";
        autoSave: boolean;
        maxHistory: number;
      }

      const configData: Config = {
        theme: "dark",
        autoSave: true,
        maxHistory: 50,
      };

      const filePath = "/test/config.json";
      const absolutePath = path.resolve(filePath);

      mockFs.setFileContent(absolutePath, JSON.stringify(configData));

      const result = await service.readJsonFile<Config>(filePath);

      // TypeScript compilation ensures type safety, runtime checks verify data
      expect(result.theme).toBe("dark");
      expect(result.autoSave).toBe(true);
      expect(result.maxHistory).toBe(50);
    });

    it("should work with union types", async () => {
      type StringOrNumber = string | number;

      const filePath1 = "/test/string.json";
      const filePath2 = "/test/number.json";
      const absolutePath1 = path.resolve(filePath1);
      const absolutePath2 = path.resolve(filePath2);

      mockFs.setFileContent(absolutePath1, JSON.stringify("hello"));
      mockFs.setFileContent(absolutePath2, JSON.stringify(42));

      const result1 = await service.readJsonFile<StringOrNumber>(filePath1);
      const result2 = await service.readJsonFile<StringOrNumber>(filePath2);

      expect(typeof result1).toBe("string");
      expect(typeof result2).toBe("number");
      expect(result1).toBe("hello");
      expect(result2).toBe(42);
    });
  });
});
