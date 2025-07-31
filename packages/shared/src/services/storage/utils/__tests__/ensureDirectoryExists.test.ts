import * as path from "path";
import { promises as fs } from "fs";
import * as os from "os";
import { ensureDirectoryExists } from "../ensureDirectoryExists";
import { NodeFileSystemBridge } from "../../NodeFileSystemBridge";
import { PathValidationError } from "../PathValidationError";

describe("ensureDirectoryExists", () => {
  let testDir: string;
  let bridge: NodeFileSystemBridge;

  beforeEach(async () => {
    bridge = new NodeFileSystemBridge();
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), "ensure-dir-test-"));
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it("should create nested directories", async () => {
    const nestedPath = path.join(testDir, "a", "b", "c");
    await ensureDirectoryExists(nestedPath, bridge);

    const stats = await fs.stat(nestedPath);
    expect(stats.isDirectory()).toBe(true);
  });

  it("should handle existing directories gracefully", async () => {
    await ensureDirectoryExists(testDir, bridge);
    await ensureDirectoryExists(testDir, bridge); // Should not throw

    const stats = await fs.stat(testDir);
    expect(stats.isDirectory()).toBe(true);
  });

  it("should handle concurrent creation", async () => {
    const targetDir = path.join(testDir, "concurrent");
    const promises = Array(5)
      .fill(null)
      .map(() => ensureDirectoryExists(targetDir, bridge));

    await expect(Promise.all(promises)).resolves.not.toThrow();

    const stats = await fs.stat(targetDir);
    expect(stats.isDirectory()).toBe(true);
  });

  it("should reject invalid paths", async () => {
    await expect(ensureDirectoryExists("../../../etc", bridge)).rejects.toThrow(
      PathValidationError,
    );
  });

  it("should create single level directory", async () => {
    const singleDir = path.join(testDir, "single");
    await ensureDirectoryExists(singleDir, bridge);

    const stats = await fs.stat(singleDir);
    expect(stats.isDirectory()).toBe(true);
  });

  it("should handle empty path gracefully", async () => {
    await expect(ensureDirectoryExists("", bridge)).rejects.toThrow(
      PathValidationError,
    );
  });
});
