import * as path from "path";
import { promises as fs } from "fs";
import * as os from "os";
import { getDirectoryStats } from "../getDirectoryStats";
import { NodeFileSystemBridge } from "../../NodeFileSystemBridge";
import { FileSystemBridge } from "../../FileSystemBridge";

// Mock FileSystemBridge for non-Node environments
class MockFileSystemBridge implements FileSystemBridge {
  async readFile(): Promise<string> {
    throw new Error("File not found");
  }
  async writeFile(): Promise<void> {}
  async mkdir(): Promise<void> {}
  async unlink(): Promise<void> {}
  async rename(): Promise<void> {}
}

describe("getDirectoryStats", () => {
  let testDir: string;
  let bridge: NodeFileSystemBridge;

  beforeEach(async () => {
    bridge = new NodeFileSystemBridge();
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), "dir-stats-test-"));
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it("should report existing directories", async () => {
    const stats = await getDirectoryStats(testDir, bridge);
    expect(stats).toEqual({
      exists: true,
      isDirectory: true,
      isWritable: true,
    });
  });

  it("should report non-existent paths", async () => {
    const stats = await getDirectoryStats(
      path.join(testDir, "missing"),
      bridge,
    );
    expect(stats).toEqual({
      exists: false,
      isDirectory: false,
      isWritable: false,
    });
  });

  it("should detect files vs directories", async () => {
    const file = path.join(testDir, "file.txt");
    await fs.writeFile(file, "test");

    const stats = await getDirectoryStats(file, bridge);
    expect(stats).toEqual({
      exists: true,
      isDirectory: false,
      isWritable: false,
    });
  });

  it("should detect non-writable directories", async () => {
    if (process.platform === "win32") {
      return; // Skip on Windows
    }

    const readOnlyDir = path.join(testDir, "readonly");
    await fs.mkdir(readOnlyDir, { mode: 0o555 });

    const stats = await getDirectoryStats(readOnlyDir, bridge);
    expect(stats).toEqual({
      exists: true,
      isDirectory: true,
      isWritable: false,
    });

    // Cleanup - restore permissions so we can delete
    await fs.chmod(readOnlyDir, 0o755);
  });

  it("should return default values for non-Node bridges", async () => {
    const mockBridge = new MockFileSystemBridge();
    const stats = await getDirectoryStats("/any/path", mockBridge);
    expect(stats).toEqual({
      exists: true,
      isDirectory: true,
      isWritable: true,
    });
  });

  it("should handle permission denied access", async () => {
    if (process.platform === "win32") {
      return; // Skip on Windows
    }

    const restrictedDir = path.join(testDir, "restricted");
    await fs.mkdir(restrictedDir, { mode: 0o000 });

    // Should still detect as directory but not writable
    const stats = await getDirectoryStats(restrictedDir, bridge);
    expect(stats.exists).toBe(true);
    expect(stats.isDirectory).toBe(true);
    expect(stats.isWritable).toBe(false);

    // Cleanup - restore permissions so we can delete
    await fs.chmod(restrictedDir, 0o755);
  });

  it("should handle nested paths", async () => {
    const nested = path.join(testDir, "a", "b", "c");
    await fs.mkdir(nested, { recursive: true });

    const stats = await getDirectoryStats(nested, bridge);
    expect(stats).toEqual({
      exists: true,
      isDirectory: true,
      isWritable: true,
    });
  });
});
