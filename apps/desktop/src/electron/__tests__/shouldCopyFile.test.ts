import fs from "node:fs";
import { shouldCopy } from "../startup/shouldCopyFile";

// Mock fs module
jest.mock("node:fs");
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock the logger
jest.mock("@fishbowl-ai/shared", () => ({
  createLoggerSync: jest.fn(() => ({
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe("shouldCopy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true when destination file does not exist", () => {
    // Arrange
    const sourcePath = "/source/file.txt";
    const destPath = "/dest/file.txt";
    mockedFs.existsSync.mockReturnValue(false);

    // Act
    const result = shouldCopy(sourcePath, destPath);

    // Assert
    expect(result).toBe(true);
    expect(mockedFs.existsSync).toHaveBeenCalledWith(destPath);
    expect(mockedFs.statSync).not.toHaveBeenCalled();
  });

  it("should return true when source file is newer than destination", () => {
    // Arrange
    const sourcePath = "/source/file.txt";
    const destPath = "/dest/file.txt";
    const newerTime = new Date("2023-12-25T10:00:00Z");
    const olderTime = new Date("2023-12-20T10:00:00Z");

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.statSync
      .mockReturnValueOnce({ mtime: newerTime } as fs.Stats)
      .mockReturnValueOnce({ mtime: olderTime } as fs.Stats);

    // Act
    const result = shouldCopy(sourcePath, destPath);

    // Assert
    expect(result).toBe(true);
    expect(mockedFs.existsSync).toHaveBeenCalledWith(destPath);
    expect(mockedFs.statSync).toHaveBeenCalledWith(sourcePath);
    expect(mockedFs.statSync).toHaveBeenCalledWith(destPath);
  });

  it("should return false when destination file is newer than source", () => {
    // Arrange
    const sourcePath = "/source/file.txt";
    const destPath = "/dest/file.txt";
    const newerTime = new Date("2023-12-25T10:00:00Z");
    const olderTime = new Date("2023-12-20T10:00:00Z");

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.statSync
      .mockReturnValueOnce({ mtime: olderTime } as fs.Stats)
      .mockReturnValueOnce({ mtime: newerTime } as fs.Stats);

    // Act
    const result = shouldCopy(sourcePath, destPath);

    // Assert
    expect(result).toBe(false);
    expect(mockedFs.existsSync).toHaveBeenCalledWith(destPath);
    expect(mockedFs.statSync).toHaveBeenCalledWith(sourcePath);
    expect(mockedFs.statSync).toHaveBeenCalledWith(destPath);
  });

  it("should return false when files have the same modification time", () => {
    // Arrange
    const sourcePath = "/source/file.txt";
    const destPath = "/dest/file.txt";
    const sameTime = new Date("2023-12-25T10:00:00Z");

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.statSync
      .mockReturnValueOnce({ mtime: sameTime } as fs.Stats)
      .mockReturnValueOnce({ mtime: sameTime } as fs.Stats);

    // Act
    const result = shouldCopy(sourcePath, destPath);

    // Assert
    expect(result).toBe(false);
  });

  it("should return true when stat comparison fails and log warning", () => {
    // Arrange
    const sourcePath = "/source/file.txt";
    const destPath = "/dest/file.txt";
    const error = new Error("Stat failed");

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.statSync.mockImplementation(() => {
      throw error;
    });

    // Act
    const result = shouldCopy(sourcePath, destPath);

    // Assert
    expect(result).toBe(true);
    expect(mockedFs.existsSync).toHaveBeenCalledWith(destPath);
    expect(mockedFs.statSync).toHaveBeenCalledWith(sourcePath);
  });

  it("should handle partial stat failures gracefully", () => {
    // Arrange - source stat succeeds, dest stat fails
    const sourcePath = "/source/file.txt";
    const destPath = "/dest/file.txt";
    const sourceTime = new Date("2023-12-25T10:00:00Z");

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.statSync
      .mockReturnValueOnce({ mtime: sourceTime } as fs.Stats)
      .mockImplementationOnce(() => {
        throw new Error("Dest stat failed");
      });

    // Act
    const result = shouldCopy(sourcePath, destPath);

    // Assert
    expect(result).toBe(true);
    expect(mockedFs.statSync).toHaveBeenCalledTimes(2);
  });
});
