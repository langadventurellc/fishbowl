import * as path from "path";
import { promises as fs } from "fs";
import * as os from "os";
import { setFilePermissions } from "../setFilePermissions";
import { NodeFileSystemBridge } from "../../NodeFileSystemBridge";
import { PathValidationError } from "../PathValidationError";
import { FileSystemBridge } from "../../FileSystemBridge";

// Mock FileSystemBridge for non-Node environments
class MockFileSystemBridge implements FileSystemBridge {
  async readFile(): Promise<string> {
    return "";
  }
  async writeFile(): Promise<void> {}
  async mkdir(): Promise<void> {}
  async unlink(): Promise<void> {}
  async rename(): Promise<void> {}
}

describe("setFilePermissions", () => {
  let testDir: string;
  let bridge: NodeFileSystemBridge;

  beforeEach(async () => {
    bridge = new NodeFileSystemBridge();
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), "set-perms-test-"));
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it("should set file permissions", async () => {
    if (process.platform === "win32") {
      return; // Skip on Windows
    }

    const file = path.join(testDir, "perms.txt");
    await fs.writeFile(file, "test");

    await setFilePermissions(file, 0o600, bridge);
    const stats = await fs.stat(file);
    expect(stats.mode & 0o777).toBe(0o600);
  });

  it("should set directory permissions", async () => {
    if (process.platform === "win32") {
      return; // Skip on Windows
    }

    const dir = path.join(testDir, "permdir");
    await fs.mkdir(dir);

    await setFilePermissions(dir, 0o755, bridge);
    const stats = await fs.stat(dir);
    expect(stats.mode & 0o777).toBe(0o755);
  });

  it("should reject invalid permission values", async () => {
    const file = path.join(testDir, "test.txt");
    await fs.writeFile(file, "test");

    await expect(setFilePermissions(file, 999, bridge)).rejects.toThrow(
      PathValidationError,
    );

    await expect(setFilePermissions(file, -1, bridge)).rejects.toThrow(
      PathValidationError,
    );
  });

  it("should be no-op for non-Node bridges", async () => {
    const mockBridge = new MockFileSystemBridge();
    await expect(
      setFilePermissions("/any/path", 0o600, mockBridge),
    ).resolves.not.toThrow();
  });

  it("should handle non-existent files", async () => {
    await expect(
      setFilePermissions(path.join(testDir, "missing.txt"), 0o600, bridge),
    ).rejects.toThrow();
  });

  it("should accept valid permission ranges", async () => {
    if (process.platform === "win32") {
      return; // Skip on Windows
    }

    const file = path.join(testDir, "valid-perms.txt");
    await fs.writeFile(file, "test");

    // Test various valid permissions
    const validPerms = [0o000, 0o644, 0o755, 0o777];
    for (const perm of validPerms) {
      await expect(
        setFilePermissions(file, perm, bridge),
      ).resolves.not.toThrow();
    }
  });
});
