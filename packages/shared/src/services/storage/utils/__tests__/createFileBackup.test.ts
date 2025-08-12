import { createFileBackup } from "../createFileBackup";
import { FileSystemBridge } from "../../FileSystemBridge";

// Mock the logger
jest.mock("../../../../logging", () => ({
  createLoggerSync: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe("createFileBackup", () => {
  let mockFs: jest.Mocked<FileSystemBridge>;

  beforeEach(() => {
    mockFs = {
      readFile: jest.fn(),
      writeFile: jest.fn(),
      unlink: jest.fn(),
      mkdir: jest.fn(),
      rename: jest.fn(),
    };

    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-15T10:30:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("successful backup creation", () => {
    it("should create backup with timestamp", async () => {
      const originalPath = "/path/to/roles.json";
      const fileContent = '{"roles": []}';

      mockFs.readFile.mockResolvedValue(fileContent);
      mockFs.writeFile.mockResolvedValue();

      const result = await createFileBackup(originalPath, mockFs);

      expect(result).toBe("/path/to/roles.json.2025-01-15T10-30-00-000Z.bak");
      expect(mockFs.readFile).toHaveBeenCalledWith(originalPath, "utf8");
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        "/path/to/roles.json.2025-01-15T10-30-00-000Z.bak",
        fileContent,
        { encoding: "utf8", mode: 0o600 },
      );
    });

    it("should preserve file content exactly", async () => {
      const originalPath = "/test/file.json";
      const complexContent = JSON.stringify(
        {
          version: "1.0.0",
          data: ["item1", "item2"],
          metadata: { created: "2025-01-01" },
        },
        null,
        2,
      );

      mockFs.readFile.mockResolvedValue(complexContent);
      mockFs.writeFile.mockResolvedValue();

      await createFileBackup(originalPath, mockFs);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(".bak"),
        complexContent,
        expect.objectContaining({ encoding: "utf8" }),
      );
    });

    it("should set correct file permissions", async () => {
      const originalPath = "/path/to/file.json";

      mockFs.readFile.mockResolvedValue("content");
      mockFs.writeFile.mockResolvedValue();

      await createFileBackup(originalPath, mockFs);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ mode: 0o600 }),
      );
    });
  });

  describe("error handling", () => {
    it("should return null when file read fails", async () => {
      const originalPath = "/nonexistent/file.json";

      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await createFileBackup(originalPath, mockFs);

      expect(result).toBeNull();
      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });

    it("should return null when file write fails", async () => {
      const originalPath = "/path/to/file.json";

      mockFs.readFile.mockResolvedValue("content");
      mockFs.writeFile.mockRejectedValue(new Error("Write permission denied"));

      const result = await createFileBackup(originalPath, mockFs);

      expect(result).toBeNull();
    });

    it("should handle non-Error exceptions", async () => {
      const originalPath = "/path/to/file.json";

      mockFs.readFile.mockRejectedValue("string error");

      const result = await createFileBackup(originalPath, mockFs);

      expect(result).toBeNull();
    });
  });

  describe("timestamp formatting", () => {
    it("should format timestamps consistently", async () => {
      const originalPath = "/test.json";

      mockFs.readFile.mockResolvedValue("test");
      mockFs.writeFile.mockResolvedValue();

      // Test different times to ensure consistent formatting
      jest.setSystemTime(new Date("2025-12-31T23:59:59.999Z"));

      const result = await createFileBackup(originalPath, mockFs);

      expect(result).toBe("/test.json.2025-12-31T23-59-59-999Z.bak");
    });

    it("should handle different date formats", async () => {
      const originalPath = "/test.json";

      mockFs.readFile.mockResolvedValue("test");
      mockFs.writeFile.mockResolvedValue();

      jest.setSystemTime(new Date("2025-01-01T00:00:00.001Z"));

      const result = await createFileBackup(originalPath, mockFs);

      expect(result).toBe("/test.json.2025-01-01T00-00-00-001Z.bak");
    });
  });

  describe("file path handling", () => {
    it("should work with absolute paths", async () => {
      const originalPath = "/absolute/path/to/file.json";

      mockFs.readFile.mockResolvedValue("content");
      mockFs.writeFile.mockResolvedValue();

      const result = await createFileBackup(originalPath, mockFs);

      expect(result).toMatch(
        /^\/absolute\/path\/to\/file\.json\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.bak$/,
      );
    });

    it("should work with relative paths", async () => {
      const originalPath = "relative/file.json";

      mockFs.readFile.mockResolvedValue("content");
      mockFs.writeFile.mockResolvedValue();

      const result = await createFileBackup(originalPath, mockFs);

      expect(result).toMatch(
        /^relative\/file\.json\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.bak$/,
      );
    });

    it("should handle files without extensions", async () => {
      const originalPath = "/path/to/filename";

      mockFs.readFile.mockResolvedValue("content");
      mockFs.writeFile.mockResolvedValue();

      const result = await createFileBackup(originalPath, mockFs);

      expect(result).toMatch(
        /^\/path\/to\/filename\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.bak$/,
      );
    });

    it("should handle complex file extensions", async () => {
      const originalPath = "/path/to/file.backup.json";

      mockFs.readFile.mockResolvedValue("content");
      mockFs.writeFile.mockResolvedValue();

      const result = await createFileBackup(originalPath, mockFs);

      expect(result).toMatch(
        /^\/path\/to\/file\.backup\.json\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.bak$/,
      );
    });
  });

  describe("default filesystem bridge", () => {
    it("should use default filesystem bridge when none provided", async () => {
      // This is more of an integration test to ensure the default parameter works
      // We can't easily test the NodeFileSystemBridge without mocking modules
      const originalPath = "/test.json";

      // Create a spy to see if createFileBackup attempts to call methods
      // Since we're using the default parameter, we expect it to work
      const result = await createFileBackup(originalPath);

      // Should return null because the file doesn't exist in our test environment
      expect(result).toBeNull();
    });
  });
});
