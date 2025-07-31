import * as path from "path";
import { promises as fs } from "fs";
import * as os from "os";
import { createTempFile } from "../createTempFile";
import { NodeFileSystemBridge } from "../../NodeFileSystemBridge";

describe("createTempFile", () => {
  let testDir: string;
  let bridge: NodeFileSystemBridge;

  beforeEach(async () => {
    bridge = new NodeFileSystemBridge();
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), "temp-file-test-"));
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it("should create unique temp files", async () => {
    const files = await Promise.all(
      Array(5)
        .fill(null)
        .map(() => createTempFile(testDir, "test-", bridge)),
    );

    // All files should be unique
    expect(new Set(files).size).toBe(5);

    // All files should exist
    for (const file of files) {
      const stats = await fs.stat(file);
      expect(stats.isFile()).toBe(true);
    }

    // All files should have correct naming pattern
    for (const file of files) {
      const basename = path.basename(file);
      expect(basename).toMatch(/^test-[a-f0-9]{32}\.tmp$/);
    }
  });

  it("should set secure permissions", async () => {
    if (process.platform === "win32") {
      return; // Skip on Windows
    }

    const tempFile = await createTempFile(testDir, "secure-", bridge);
    const stats = await fs.stat(tempFile);
    expect(stats.mode & 0o777).toBe(0o600);
  });

  it("should create parent directories", async () => {
    const deepPath = path.join(testDir, "deep", "nested", "temp");
    const tempFile = await createTempFile(deepPath, "auto-", bridge);

    expect(tempFile).toMatch(/auto-[a-f0-9]{32}\.tmp$/);
    await expect(fs.access(tempFile)).resolves.not.toThrow();

    // Check that parent directories were created
    const stats = await fs.stat(deepPath);
    expect(stats.isDirectory()).toBe(true);
  });

  it("should create empty files", async () => {
    const tempFile = await createTempFile(testDir, "empty-", bridge);
    const content = await fs.readFile(tempFile, "utf8");
    expect(content).toBe("");
  });

  it("should handle different prefixes", async () => {
    const prefixes = ["", "test-", "prefix_", "long-prefix-name-"];
    const files = await Promise.all(
      prefixes.map((prefix) => createTempFile(testDir, prefix, bridge)),
    );

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const prefix = prefixes[i];

      expect(file).toBeDefined();
      expect(prefix).toBeDefined();

      const basename = path.basename(file!);
      const expectedPattern = new RegExp(
        `^${prefix!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[a-f0-9]{32}\\.tmp$`,
      );
      expect(basename).toMatch(expectedPattern);
    }
  });

  it("should place files in correct directory", async () => {
    const tempFile = await createTempFile(testDir, "location-", bridge);
    const dirname = path.dirname(tempFile);
    expect(dirname).toBe(testDir);
  });

  it("should generate cryptographically random names", async () => {
    // Create many temp files and ensure no collisions
    const files = await Promise.all(
      Array(100)
        .fill(null)
        .map(() => createTempFile(testDir, "random-", bridge)),
    );

    // Extract the random parts
    const randomParts = files.map((file) => {
      const basename = path.basename(file);
      return basename.replace(/^random-/, "").replace(/\.tmp$/, "");
    });

    // All should be unique (very high probability with crypto random)
    expect(new Set(randomParts).size).toBe(100);

    // All should be valid hex strings of correct length
    for (const part of randomParts) {
      expect(part).toMatch(/^[a-f0-9]{32}$/);
    }
  });
});
