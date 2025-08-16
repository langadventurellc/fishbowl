import { NodeFileSystemBridge } from "../NodeFileSystemBridge";
import { FileSystemBridge } from "@fishbowl-ai/shared";
import * as fs from "fs/promises";

// Mock fs/promises for unit tests
jest.mock("fs/promises");
const mockedFs = fs as jest.Mocked<typeof fs>;

describe("NodeFileSystemBridge", () => {
  let bridge: FileSystemBridge;

  beforeEach(() => {
    bridge = new NodeFileSystemBridge();
    jest.clearAllMocks();
  });

  describe("readFile", () => {
    it("should call fs.readFile with correct parameters", async () => {
      const filePath = "/test/path/file.txt";
      const encoding = "utf8";
      const expectedContent = "test content";

      mockedFs.readFile.mockResolvedValue(expectedContent);

      const result = await bridge.readFile(filePath, encoding);

      expect(mockedFs.readFile).toHaveBeenCalledWith(filePath, encoding);
      expect(result).toBe(expectedContent);
    });

    it("should propagate fs errors", async () => {
      const filePath = "/test/nonexistent.txt";
      const fsError = new Error("ENOENT: no such file or directory");

      mockedFs.readFile.mockRejectedValue(fsError);

      await expect(bridge.readFile(filePath, "utf8")).rejects.toThrow(fsError);
    });

    it("should work with different encodings", async () => {
      const filePath = "/test/file.txt";
      const content = "test content";

      mockedFs.readFile.mockResolvedValue(content);

      await bridge.readFile(filePath, "ascii");
      expect(mockedFs.readFile).toHaveBeenCalledWith(filePath, "ascii");

      await bridge.readFile(filePath, "base64");
      expect(mockedFs.readFile).toHaveBeenCalledWith(filePath, "base64");
    });
  });

  describe("writeFile", () => {
    it("should call fs.writeFile with correct parameters", async () => {
      const filePath = "/test/file.txt";
      const data = "test content";
      const options = { encoding: "utf8" as const, mode: 0o644 };

      mockedFs.writeFile.mockResolvedValue();

      await bridge.writeFile(filePath, data, options);

      expect(mockedFs.writeFile).toHaveBeenCalledWith(filePath, data, options);
    });

    it("should work without options", async () => {
      const filePath = "/test/file.txt";
      const data = "test content";

      mockedFs.writeFile.mockResolvedValue();

      await bridge.writeFile(filePath, data);

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        filePath,
        data,
        undefined,
      );
    });

    it("should propagate write errors", async () => {
      const filePath = "/test/readonly.txt";
      const data = "test content";
      const fsError = new Error("EACCES: permission denied");

      mockedFs.writeFile.mockRejectedValue(fsError);

      await expect(bridge.writeFile(filePath, data)).rejects.toThrow(fsError);
    });
  });

  describe("mkdir", () => {
    it("should call fs.mkdir with recursive option", async () => {
      const dirPath = "/test/nested/dirs";

      mockedFs.mkdir.mockResolvedValue(undefined);

      await bridge.mkdir(dirPath, { recursive: true });

      expect(mockedFs.mkdir).toHaveBeenCalledWith(dirPath, { recursive: true });
    });

    it("should work without options", async () => {
      const dirPath = "/test/single";

      mockedFs.mkdir.mockResolvedValue(undefined);

      await bridge.mkdir(dirPath);

      expect(mockedFs.mkdir).toHaveBeenCalledWith(dirPath, undefined);
    });

    it("should propagate mkdir errors", async () => {
      const dirPath = "/test/invalid";
      const fsError = new Error("EEXIST: file already exists");

      mockedFs.mkdir.mockRejectedValue(fsError);

      await expect(bridge.mkdir(dirPath)).rejects.toThrow(fsError);
    });
  });

  describe("unlink", () => {
    it("should call fs.unlink with correct path", async () => {
      const filePath = "/test/file.txt";

      mockedFs.unlink.mockResolvedValue();

      await bridge.unlink(filePath);

      expect(mockedFs.unlink).toHaveBeenCalledWith(filePath);
    });

    it("should propagate unlink errors", async () => {
      const filePath = "/test/nonexistent.txt";
      const fsError = new Error("ENOENT: no such file or directory");

      mockedFs.unlink.mockRejectedValue(fsError);

      await expect(bridge.unlink(filePath)).rejects.toThrow(fsError);
    });
  });

  describe("rename", () => {
    it("should call fs.rename with correct paths", async () => {
      const oldPath = "/test/old.txt";
      const newPath = "/test/new.txt";

      mockedFs.rename.mockResolvedValue();

      await bridge.rename(oldPath, newPath);

      expect(mockedFs.rename).toHaveBeenCalledWith(oldPath, newPath);
    });

    it("should propagate rename errors", async () => {
      const oldPath = "/test/nonexistent.txt";
      const newPath = "/test/new.txt";
      const fsError = new Error("ENOENT: no such file or directory");

      mockedFs.rename.mockRejectedValue(fsError);

      await expect(bridge.rename(oldPath, newPath)).rejects.toThrow(fsError);
    });
  });

  describe("interface compliance", () => {
    it("should implement all FileSystemBridge methods", () => {
      expect(typeof bridge.readFile).toBe("function");
      expect(typeof bridge.writeFile).toBe("function");
      expect(typeof bridge.mkdir).toBe("function");
      expect(typeof bridge.unlink).toBe("function");
      expect(typeof bridge.rename).toBe("function");
    });

    it("should return promises from all methods", () => {
      mockedFs.readFile.mockResolvedValue("test");
      mockedFs.writeFile.mockResolvedValue();
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.unlink.mockResolvedValue();
      mockedFs.rename.mockResolvedValue();

      expect(bridge.readFile("/test", "utf8")).toBeInstanceOf(Promise);
      expect(bridge.writeFile("/test", "data")).toBeInstanceOf(Promise);
      expect(bridge.mkdir("/test")).toBeInstanceOf(Promise);
      expect(bridge.unlink("/test")).toBeInstanceOf(Promise);
      expect(bridge.rename("/old", "/new")).toBeInstanceOf(Promise);
    });
  });
});
