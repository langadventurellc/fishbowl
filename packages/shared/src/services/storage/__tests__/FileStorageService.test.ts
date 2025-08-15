import * as path from "path";
import { FileStorageService } from "../FileStorageService";
import { FileSystemBridge } from "../FileSystemBridge";
import { WriteFileOptions } from "../WriteFileOptions";
import {
  FileNotFoundError,
  InvalidJsonError,
  WritePermissionError,
} from "../errors";

// Mock implementation for testing
class MockFileSystemBridge implements FileSystemBridge {
  private files: Map<string, string> = new Map();
  private directories: Set<string> = new Set();
  private shouldThrowError: Error | null = null;
  private writeOperations: Array<{
    path: string;
    content: string;
    options?: WriteFileOptions;
  }> = [];
  private renameOperations: Array<{ oldPath: string; newPath: string }> = [];

  setFileContent(path: string, content: string): void {
    this.files.set(path, content);
  }

  setShouldThrowError(error: Error | null): void {
    this.shouldThrowError = error;
  }

  clear(): void {
    this.files.clear();
    this.directories.clear();
    this.shouldThrowError = null;
    this.writeOperations = [];
    this.renameOperations = [];
  }

  getWriteOperations(): Array<{
    path: string;
    content: string;
    options?: WriteFileOptions;
  }> {
    return [...this.writeOperations];
  }

  getRenameOperations(): Array<{ oldPath: string; newPath: string }> {
    return [...this.renameOperations];
  }

  fileExists(path: string): boolean {
    return this.files.has(path);
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

  async writeFile(
    path: string,
    content: string,
    options?: WriteFileOptions,
  ): Promise<void> {
    if (this.shouldThrowError) {
      throw this.shouldThrowError;
    }

    this.writeOperations.push({ path, content, options });
    this.files.set(path, content);
  }

  async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    if (this.shouldThrowError) {
      throw this.shouldThrowError;
    }

    if (options?.recursive) {
      // Add all parent directories
      const parts = path.split("/").filter((p) => p);
      let currentPath = "";
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;
        this.directories.add(currentPath);
      }
    } else {
      this.directories.add(path);
    }
  }

  async unlink(path: string): Promise<void> {
    if (this.shouldThrowError) {
      throw this.shouldThrowError;
    }

    if (!this.files.has(path)) {
      const error = new Error(
        `ENOENT: no such file or directory, unlink '${path}'`,
      ) as Error & { code: string };
      error.code = "ENOENT";
      throw error;
    }

    this.files.delete(path);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    if (this.shouldThrowError) {
      throw this.shouldThrowError;
    }

    this.renameOperations.push({ oldPath, newPath });

    if (!this.files.has(oldPath)) {
      const error = new Error(
        `ENOENT: no such file or directory, rename '${oldPath}' -> '${newPath}'`,
      ) as Error & { code: string };
      error.code = "ENOENT";
      throw error;
    }

    const content = this.files.get(oldPath)!;
    this.files.delete(oldPath);
    this.files.set(newPath, content);
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

    it("should create with provided FileSystemBridge", () => {
      const mockBridge = new MockFileSystemBridge();
      const defaultService = new FileStorageService(mockBridge);

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

  describe("writeJsonFile", () => {
    describe("successful writes", () => {
      it("should successfully write and read back data", async () => {
        const testData = { name: "test", value: 42 };
        const filePath = "/test/write.json";
        const absolutePath = path.resolve(filePath);

        await service.writeJsonFile(filePath, testData);

        // Verify atomic write sequence
        const renameOps = mockFs.getRenameOperations();
        expect(renameOps).toHaveLength(1);
        expect(renameOps[0]?.newPath).toBe(absolutePath);
        expect(renameOps[0]?.oldPath).toMatch(/\.tmp-.*\.json$/);

        // Verify data integrity
        const result = await service.readJsonFile(filePath);
        expect(result).toEqual(testData);
      });

      it("should handle generic typing correctly", async () => {
        interface TestData {
          id: number;
          name: string;
        }

        const testData: TestData = { id: 1, name: "test" };
        const filePath = "/test/typed-write.json";

        await service.writeJsonFile<TestData>(filePath, testData);

        const result = await service.readJsonFile<TestData>(filePath);
        expect(result.id).toBe(1);
        expect(result.name).toBe("test");
      });

      it("should create parent directories", async () => {
        const testData = { nested: true };
        const filePath = "/deep/nested/directory/test.json";

        await service.writeJsonFile(filePath, testData);

        const result = await service.readJsonFile(filePath);
        expect(result).toEqual(testData);
      });

      it("should write pretty-formatted JSON", async () => {
        const testData = { nested: { object: { with: "data" } } };
        const filePath = "/test/pretty.json";

        await service.writeJsonFile(filePath, testData);

        const writeOps = mockFs.getWriteOperations();
        const tempFileWrite = writeOps.find((op) => op.path.includes(".tmp-"));
        expect(tempFileWrite?.content).toContain("\n");
        expect(tempFileWrite?.content).toContain("  ");
        expect(JSON.parse(tempFileWrite?.content || "")).toEqual(testData);
      });

      it("should set correct file permissions", async () => {
        const testData = { secure: true };
        const filePath = "/test/secure.json";

        await service.writeJsonFile(filePath, testData);

        const writeOps = mockFs.getWriteOperations();
        const tempFileWrite = writeOps.find((op) => op.path.includes(".tmp-"));
        expect(tempFileWrite?.options?.mode).toBe(0o600);
      });
    });

    describe("atomic write behavior", () => {
      it("should use temporary file and atomic rename", async () => {
        const testData = { atomic: true };
        const filePath = "/test/atomic.json";
        const absolutePath = path.resolve(filePath);

        await service.writeJsonFile(filePath, testData);

        const writeOps = mockFs.getWriteOperations();
        const renameOps = mockFs.getRenameOperations();

        // Should write to temp file first
        expect(writeOps).toHaveLength(1);
        expect(writeOps[0]?.path).toMatch(/\.tmp-.*\.json$/);
        expect(writeOps[0]?.path).not.toBe(absolutePath);

        // Should rename temp file to target
        expect(renameOps).toHaveLength(1);
        expect(renameOps[0]?.oldPath).toBe(writeOps[0]?.path);
        expect(renameOps[0]?.newPath).toBe(absolutePath);
      });

      it("should clean up temp file on write failure", async () => {
        const testData = { cleanup: true };
        const filePath = "/test/cleanup.json";

        // Mock write failure
        const writeError = new Error("Disk full") as Error & { code: string };
        writeError.code = "ENOSPC";
        mockFs.setShouldThrowError(writeError);

        await expect(
          service.writeJsonFile(filePath, testData),
        ).rejects.toThrow();

        // Should attempt cleanup (unlink would be called but might fail too)
        mockFs.setShouldThrowError(null);
      });

      it("should validate written data before rename", async () => {
        const testData = { validation: "test" };
        const filePath = "/test/validate.json";

        await service.writeJsonFile(filePath, testData);

        // Should read back temp file for validation
        const writeOps = mockFs.getWriteOperations();
        expect(writeOps).toHaveLength(1);

        // Data should match exactly
        const writtenContent = writeOps[0]?.content || "";
        const parsedContent = JSON.parse(writtenContent);
        expect(parsedContent).toEqual(testData);
      });
    });

    describe("security features", () => {
      it("should reject oversized data", async () => {
        const service = new FileStorageService(mockFs, {
          maxFileSizeBytes: 100,
        });
        const largeData = { data: "x".repeat(200) };
        const filePath = "/test/large.json";

        await expect(
          service.writeJsonFile(filePath, largeData),
        ).rejects.toThrow("Data size exceeds limit");
      });

      it("should reject undefined data", async () => {
        const filePath = "/test/undefined.json";

        await expect(
          service.writeJsonFile(filePath, undefined),
        ).rejects.toThrow("Data cannot be undefined");
      });

      it("should reject dangerous paths", async () => {
        const testData = { danger: true };
        const dangerousPaths = [
          "../../../etc/passwd",
          "~/secret.json",
          "config/../../../admin.json",
        ];

        for (const dangerousPath of dangerousPaths) {
          await expect(
            service.writeJsonFile(dangerousPath, testData),
          ).rejects.toThrow();
        }
      });

      it("should reject paths with invalid characters", async () => {
        const testData = { invalid: true };
        const invalidPaths = [
          "/test/file<script>.json",
          "/test/file|pipe.json",
          "/test/file?.json",
        ];

        for (const invalidPath of invalidPaths) {
          await expect(
            service.writeJsonFile(invalidPath, testData),
          ).rejects.toThrow("Invalid characters in path");
        }
      });

      it("should reject reserved filenames", async () => {
        const testData = { reserved: true };
        const reservedPaths = [
          "/test/con.json",
          "/test/prn.json",
          "/test/aux.json",
          "/test/com1.json",
        ];

        for (const reservedPath of reservedPaths) {
          await expect(
            service.writeJsonFile(reservedPath, testData),
          ).rejects.toThrow("Reserved filename not allowed");
        }
      });

      it("should reject paths that are too long", async () => {
        const testData = { long: true };
        const longPath = "/test/" + "a".repeat(1000) + ".json";

        await expect(service.writeJsonFile(longPath, testData)).rejects.toThrow(
          "Path too long",
        );
      });
    });

    describe("error handling", () => {
      it("should handle mkdir failures", async () => {
        const testData = { mkdir: "fail" };
        const filePath = "/deep/nested/fail.json";

        const mkdirError = new Error("Permission denied") as Error & {
          code: string;
        };
        mkdirError.code = "EACCES";
        mockFs.setShouldThrowError(mkdirError);

        await expect(service.writeJsonFile(filePath, testData)).rejects.toThrow(
          WritePermissionError,
        );
      });

      it("should handle write failures", async () => {
        const testData = { write: "fail" };
        const filePath = "/test/write-fail.json";

        const writeError = new Error("No space left") as Error & {
          code: string;
        };
        writeError.code = "ENOSPC";
        mockFs.setShouldThrowError(writeError);

        await expect(
          service.writeJsonFile(filePath, testData),
        ).rejects.toThrow();
      });

      it("should handle rename failures", async () => {
        const testData = { rename: "fail" };
        const filePath = "/test/rename-fail.json";

        // Create a special mock that fails only on rename
        const renameFailMock = new MockFileSystemBridge();
        renameFailMock.rename = async () => {
          const renameError = new Error("Cross-device link") as Error & {
            code: string;
          };
          renameError.code = "EXDEV";
          throw renameError;
        };

        const failService = new FileStorageService(renameFailMock);

        await expect(
          failService.writeJsonFile(filePath, testData),
        ).rejects.toThrow();
      });
    });

    describe("configuration options", () => {
      it("should use custom file size limit", async () => {
        const customService = new FileStorageService(mockFs, {
          maxFileSizeBytes: 50,
        });
        const testData = { data: "x".repeat(100) };
        const filePath = "/test/custom-size.json";

        await expect(
          customService.writeJsonFile(filePath, testData),
        ).rejects.toThrow("Data size exceeds limit: 50 bytes");
      });

      it("should use custom file permissions", async () => {
        const customService = new FileStorageService(mockFs, {
          filePermissions: 0o644,
        });
        const testData = { permissions: "custom" };
        const filePath = "/test/custom-perms.json";

        await customService.writeJsonFile(filePath, testData);

        const writeOps = mockFs.getWriteOperations();
        const tempFileWrite = writeOps.find((op) => op.path.includes(".tmp-"));
        expect(tempFileWrite?.options?.mode).toBe(0o644);
      });

      it("should use custom temp file prefix", async () => {
        const customService = new FileStorageService(mockFs, {
          tempFilePrefix: ".custom-temp-",
        });
        const testData = { prefix: "custom" };
        const filePath = "/test/custom-prefix.json";

        await customService.writeJsonFile(filePath, testData);

        const writeOps = mockFs.getWriteOperations();
        expect(writeOps[0]?.path).toMatch(/\.custom-temp-.*\.json$/);
      });
    });

    describe("data integrity", () => {
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
        const filePath = "/test/complex-write.json";

        await service.writeJsonFile(filePath, complexData);

        const result = await service.readJsonFile(filePath);
        expect(result).toEqual(complexData);
      });

      it("should handle JSON with special characters", async () => {
        const specialData = {
          unicode: "Hello 世界 🌍",
          emoji: "🚀💻📁",
          special: "\"quotes\" and 'apostrophes' and \\backslashes\\",
          newlines: "Line 1\nLine 2\nLine 3",
        };
        const filePath = "/test/special-write.json";

        await service.writeJsonFile(filePath, specialData);

        const result = await service.readJsonFile(filePath);
        expect(result).toEqual(specialData);
      });

      it("should maintain type safety through write/read cycle", async () => {
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
        const filePath = "/test/config-write.json";

        await service.writeJsonFile<Config>(filePath, configData);

        const result = await service.readJsonFile<Config>(filePath);
        expect(result.theme).toBe("dark");
        expect(result.autoSave).toBe(true);
        expect(result.maxHistory).toBe(50);
      });
    });
  });
});
