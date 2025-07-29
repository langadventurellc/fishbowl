/**
 * @fileoverview Temporary Directory Manager for Test Isolation
 *
 * Manages isolated file operations for configuration tests with automatic cleanup.
 * Ensures test independence and prevents state leakage between test runs.
 */

import { promises as fs } from "fs";
import * as os from "os";
import * as path from "path";

/**
 * Configuration for temporary directory creation
 */
interface TempDirConfig {
  prefix?: string;
  cleanup?: boolean;
  permissions?: string;
}

/**
 * Result from creating a temporary directory
 */
interface TempDirResult {
  path: string;
  cleanup: () => Promise<void>;
  writeFile: (filename: string, content: string) => Promise<string>;
  readFile: (filename: string) => Promise<string>;
  exists: (filename: string) => Promise<boolean>;
  listFiles: () => Promise<string[]>;
}

/**
 * Manager for temporary directories in tests
 */
export class TemporaryDirectoryManager {
  private static activeDirs: Set<string> = new Set();

  /**
   * Create a temporary directory for test isolation
   */
  static async create(config: TempDirConfig = {}): Promise<TempDirResult> {
    const {
      prefix = "personality-test-",
      cleanup = true,
      permissions = "0755",
    } = config;

    // Create unique temporary directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));

    // Set permissions if specified
    if (permissions) {
      await fs.chmod(tempDir, permissions);
    }

    // Track active directory for cleanup
    this.activeDirs.add(tempDir);

    const writeFile = async (
      filename: string,
      content: string,
    ): Promise<string> => {
      const filePath = path.join(tempDir, filename);
      await fs.writeFile(filePath, content, "utf8");
      return filePath;
    };

    const readFile = async (filename: string): Promise<string> => {
      const filePath = path.join(tempDir, filename);
      return await fs.readFile(filePath, "utf8");
    };

    const exists = async (filename: string): Promise<boolean> => {
      try {
        const filePath = path.join(tempDir, filename);
        await fs.access(filePath);
        return true;
      } catch {
        return false;
      }
    };

    const listFiles = async (): Promise<string[]> => {
      try {
        return await fs.readdir(tempDir);
      } catch {
        return [];
      }
    };

    const cleanupDir = async (): Promise<void> => {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        this.activeDirs.delete(tempDir);
      } catch (error) {
        console.warn(`Failed to cleanup temp directory ${tempDir}:`, error);
      }
    };

    // Auto-cleanup on process exit if enabled
    if (cleanup) {
      process.on("exit", () => {
        try {
          // Synchronous cleanup on exit
          const fsSync = eval("require")("fs");
          fsSync.rmSync(tempDir, { recursive: true, force: true });
        } catch {
          // Ignore errors during exit cleanup
        }
      });
    }

    return {
      path: tempDir,
      cleanup: cleanupDir,
      writeFile,
      readFile,
      exists,
      listFiles,
    };
  }

  /**
   * Create temporary directory with realistic personality files
   */
  static async createWithPersonalityFiles(): Promise<TempDirResult> {
    const tempDir = await this.create({ prefix: "personality-files-" });

    // Create sample personality configuration files
    await tempDir.writeFile(
      "creative-template.json",
      JSON.stringify(
        {
          id: "creative-001",
          name: "Creative Innovator",
          description: "Highly creative and open to new experiences",
          isTemplate: true,
          openness: 90,
          conscientiousness: 60,
          extraversion: 70,
          agreeableness: 75,
          neuroticism: 45,
          formality: 40,
          humor: 80,
          assertiveness: 70,
          empathy: 85,
          storytelling: 90,
          brevity: 30,
          imagination: 95,
          playfulness: 85,
          dramaticism: 70,
          analyticalDepth: 60,
          contrarianism: 40,
          encouragement: 80,
          curiosity: 95,
          patience: 60,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );

    await tempDir.writeFile(
      "analytical-template.json",
      JSON.stringify(
        {
          id: "analytical-001",
          name: "Analytical Thinker",
          description: "Detail-oriented and methodical approach",
          isTemplate: true,
          openness: 70,
          conscientiousness: 95,
          extraversion: 40,
          agreeableness: 60,
          neuroticism: 30,
          formality: 80,
          humor: 40,
          assertiveness: 60,
          empathy: 70,
          storytelling: 30,
          brevity: 80,
          imagination: 50,
          playfulness: 20,
          dramaticism: 25,
          analyticalDepth: 95,
          contrarianism: 60,
          encouragement: 70,
          curiosity: 85,
          patience: 90,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );

    return tempDir;
  }

  /**
   * Clean up all active temporary directories
   */
  static async cleanupAll(): Promise<void> {
    const cleanupPromises = Array.from(this.activeDirs).map(async (dir) => {
      try {
        await fs.rm(dir, { recursive: true, force: true });
        this.activeDirs.delete(dir);
      } catch (error) {
        console.warn(`Failed to cleanup directory ${dir}:`, error);
      }
    });

    await Promise.all(cleanupPromises);
  }

  /**
   * Get count of active temporary directories
   */
  static getActiveDirectoryCount(): number {
    return this.activeDirs.size;
  }

  /**
   * Create a scoped temporary directory for a specific test
   */
  static async createScoped(testName: string): Promise<TempDirResult> {
    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, "-");
    return this.create({
      prefix: `test-${sanitizedTestName}-`,
      cleanup: true,
    });
  }
}

/**
 * Helper for test setup and teardown
 */
export class TestDirectoryHelper {
  private tempDirs: TempDirResult[] = [];

  /**
   * Create a temporary directory and track it for cleanup
   */
  async createTemp(config?: TempDirConfig): Promise<TempDirResult> {
    const tempDir = await TemporaryDirectoryManager.create(config);
    this.tempDirs.push(tempDir);
    return tempDir;
  }

  /**
   * Clean up all tracked temporary directories
   */
  async cleanupAll(): Promise<void> {
    const cleanupPromises = this.tempDirs.map((dir) => dir.cleanup());
    await Promise.all(cleanupPromises);
    this.tempDirs = [];
  }

  /**
   * Get count of tracked directories
   */
  getTrackedCount(): number {
    return this.tempDirs.length;
  }
}

/**
 * Jest helper for automatic temp directory management
 */
export function useTempDirectory(): {
  createTemp: (config?: TempDirConfig) => Promise<TempDirResult>;
  cleanup: () => Promise<void>;
} {
  const helper = new TestDirectoryHelper();

  // Auto-cleanup after each test
  globalThis.afterEach(async () => {
    await helper.cleanupAll();
  });

  return {
    createTemp: (config?: TempDirConfig) => helper.createTemp(config),
    cleanup: () => helper.cleanupAll(),
  };
}
