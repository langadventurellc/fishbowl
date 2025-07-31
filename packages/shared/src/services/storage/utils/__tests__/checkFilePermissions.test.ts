import * as path from "path";
import { promises as fs } from "fs";
import * as os from "os";
import { checkFilePermissions } from "../checkFilePermissions";
import { NodeFileSystemBridge } from "../../NodeFileSystemBridge";
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

describe("checkFilePermissions", () => {
  let testDir: string;
  let bridge: NodeFileSystemBridge;

  beforeEach(async () => {
    bridge = new NodeFileSystemBridge();
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), "permissions-test-"));
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it("should detect read/write permissions", async () => {
    const file = path.join(testDir, "test.txt");
    await fs.writeFile(file, "test", { mode: 0o644 });

    const perms = await checkFilePermissions(file, bridge);
    expect(perms.read).toBe(true);
    expect(perms.write).toBe(true);
  });

  it("should detect read-only files", async () => {
    if (process.platform === "win32") {
      return; // Skip on Windows
    }

    const file = path.join(testDir, "readonly.txt");
    await fs.writeFile(file, "test", { mode: 0o444 });

    const perms = await checkFilePermissions(file, bridge);
    expect(perms.read).toBe(true);
    expect(perms.write).toBe(false);
  });

  it("should handle non-existent files", async () => {
    const perms = await checkFilePermissions(
      path.join(testDir, "missing.txt"),
      bridge,
    );
    expect(perms.read).toBe(false);
    expect(perms.write).toBe(false);
  });

  it("should return default permissions for non-Node bridges", async () => {
    const mockBridge = new MockFileSystemBridge();
    const perms = await checkFilePermissions("/any/path", mockBridge);
    expect(perms).toEqual({ read: true, write: true });
  });

  it("should check directory permissions", async () => {
    const perms = await checkFilePermissions(testDir, bridge);
    expect(perms.read).toBe(true);
    expect(perms.write).toBe(true);
  });

  it("should handle permission denied directories", async () => {
    if (process.platform === "win32") {
      return; // Skip on Windows
    }

    const restrictedDir = path.join(testDir, "restricted");
    await fs.mkdir(restrictedDir, { mode: 0o000 });

    const perms = await checkFilePermissions(restrictedDir, bridge);
    expect(perms.read).toBe(false);
    expect(perms.write).toBe(false);

    // Cleanup - restore permissions so we can delete
    await fs.chmod(restrictedDir, 0o755);
  });
});
