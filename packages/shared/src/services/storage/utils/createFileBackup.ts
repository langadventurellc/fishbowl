import { FileSystemBridge } from "../FileSystemBridge";
import { NodeFileSystemBridge } from "../NodeFileSystemBridge";
import { createLoggerSync } from "../../../logging";

const logger = createLoggerSync({
  context: { metadata: { component: "FileBackup" } },
});

export async function createFileBackup(
  filePath: string,
  fs: FileSystemBridge = new NodeFileSystemBridge(),
): Promise<string | null> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const timestampedBackupPath = `${filePath}.${timestamp}.bak`;

    const content = await fs.readFile(filePath, "utf8");

    await fs.writeFile(timestampedBackupPath, content, {
      encoding: "utf8",
      mode: 0o600,
    });

    logger.info("File backup created", {
      originalPath: filePath,
      backupPath: timestampedBackupPath,
    });

    return timestampedBackupPath;
  } catch (error) {
    logger.error(
      `Failed to create file backup for ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}
