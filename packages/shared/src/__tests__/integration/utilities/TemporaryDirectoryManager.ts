/**
 * @fileoverview Enhanced Temporary Directory Manager for Configuration File Tests
 *
 * Extends the base TemporaryDirectoryManager with configuration-specific methods
 * for atomic file operations, validation testing, and cross-platform compatibility.
 */

import { promises as fs } from "fs";
import * as path from "path";
import * as os from "os";
import { TemporaryDirectoryManager as BaseTemporaryDirectoryManager } from "../support/temp-directory-manager";

/**
 * Configuration data structure for configuration files
 */
export interface ConfigurationData {
  version: string;
  format: string;
  encoding: string;
  metadata: {
    createdAt: string;
    createdBy: string;
    lastModified?: string;
    description?: string;
    operation?: string;
  };
  data: {
    agents: Record<string, unknown>[];
    personalities: Record<string, unknown>[];
    roles: Record<string, unknown>[];
  };
}

/**
 * Configuration for configuration file temporary directories
 */
export interface ConfigFileTempDirConfig {
  prefix?: string;
  cleanup?: boolean;
  permissions?: string;
  enableBackups?: boolean;
  enableVersioning?: boolean;
}

/**
 * Result from creating a configuration file temporary directory
 */
export interface ConfigTempDirResult {
  path: string;
  cleanup: () => Promise<void>;
  writeFile: (filename: string, content: string) => Promise<string>;
  readFile: (filename: string) => Promise<string>;
  exists: (filename: string) => Promise<boolean>;
  listFiles: () => Promise<string[]>;

  // Configuration-specific methods
  createConfigFile: (
    filename: string,
    config: ConfigurationData,
  ) => Promise<string>;
  readConfigFile: (filename: string) => Promise<ConfigurationData>;
  createAtomicWrite: (
    filename: string,
    config: ConfigurationData,
  ) => Promise<string>;
  createBackupFile: (filename: string) => Promise<string>;
  verifyFileIntegrity: (
    filename: string,
    expectedConfig: ConfigurationData,
  ) => Promise<boolean>;
  simulateAtomicFailure: (
    filename: string,
    config: ConfigurationData,
    failurePoint: "staging" | "commit" | "validation",
  ) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Options for atomic write operations
 */
export interface AtomicWriteOptions {
  shouldFail?: boolean;
  failAt?: "staging" | "commit" | "validation";
  validateConfig?: boolean;
  createBackup?: boolean;
}

/**
 * Result from atomic write operations
 */
export interface AtomicWriteResult {
  success: boolean;
  path?: string;
  error?: string;
  backupPath?: string;
  stagingFiles?: string[];
}

/**
 * Enhanced Temporary Directory Manager for Configuration File Operations
 */
export class EnhancedTemporaryDirectoryManager extends BaseTemporaryDirectoryManager {
  /**
   * Create temporary directory specifically for configuration file testing
   */
  static async createForConfigurationFiles(
    config: ConfigFileTempDirConfig = {},
  ): Promise<ConfigTempDirResult> {
    const {
      prefix = "config-file-test-",
      cleanup = true,
      permissions = "0755",
      enableBackups = true,
      enableVersioning = false,
    } = config;

    // Create base temporary directory
    const baseTempDir = await this.create({
      prefix,
      cleanup,
      permissions,
    });

    // Create subdirectories for organization
    const backupDir = path.join(baseTempDir.path, "backups");
    const stagingDir = path.join(baseTempDir.path, "staging");
    const versionsDir = path.join(baseTempDir.path, "versions");

    await fs.mkdir(backupDir, { recursive: true });
    await fs.mkdir(stagingDir, { recursive: true });

    if (enableVersioning) {
      await fs.mkdir(versionsDir, { recursive: true });
    }

    const createConfigFile = async (
      filename: string,
      config: ConfigurationData,
    ): Promise<string> => {
      const content = JSON.stringify(config, null, 2);
      const filePath = path.join(baseTempDir.path, filename);
      await fs.writeFile(filePath, content, "utf8");
      return filePath;
    };

    const readConfigFile = async (
      filename: string,
    ): Promise<ConfigurationData> => {
      const content = await baseTempDir.readFile(filename);
      return JSON.parse(content) as ConfigurationData;
    };

    const createAtomicWrite = async (
      filename: string,
      config: ConfigurationData,
    ): Promise<string> => {
      // Step 1: Create staging file
      const stagingFilename = `${filename}.staging`;
      const stagingPath = path.join(stagingDir, stagingFilename);
      const content = JSON.stringify(config, null, 2);

      await fs.writeFile(stagingPath, content, "utf8");

      // Step 2: Create backup if original exists
      const finalPath = path.join(baseTempDir.path, filename);

      try {
        await fs.access(finalPath);
        if (enableBackups) {
          await createBackupFile(filename);
        }
      } catch {
        // Original file doesn't exist, no backup needed
      }

      // Step 3: Atomic commit (rename staging to final)
      await fs.rename(stagingPath, finalPath);

      return finalPath;
    };

    const createBackupFile = async (filename: string): Promise<string> => {
      const originalPath = path.join(baseTempDir.path, filename);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFilename = `${filename}.backup.${timestamp}`;
      const backupPath = path.join(backupDir, backupFilename);

      try {
        await fs.copyFile(originalPath, backupPath);
        return backupPath;
      } catch (error) {
        throw new Error(`Failed to create backup: ${error}`);
      }
    };

    const verifyFileIntegrity = async (
      filename: string,
      expectedConfig: ConfigurationData,
    ): Promise<boolean> => {
      try {
        const actualConfig = await readConfigFile(filename);
        return JSON.stringify(actualConfig) === JSON.stringify(expectedConfig);
      } catch {
        return false;
      }
    };

    const simulateAtomicFailure = async (
      filename: string,
      config: ConfigurationData,
      failurePoint: "staging" | "commit" | "validation",
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        if (failurePoint === "staging") {
          // Simulate staging failure
          throw new Error("ENOSPC: no space left on device");
        }

        // Create staging file
        const stagingFilename = `${filename}.staging`;
        const stagingPath = path.join(stagingDir, stagingFilename);
        const content = JSON.stringify(config, null, 2);
        await fs.writeFile(stagingPath, content, "utf8");

        if (failurePoint === "validation") {
          // Simulate validation failure
          throw new Error("VALIDATION_ERROR: Invalid configuration data");
        }

        if (failurePoint === "commit") {
          // Simulate commit failure
          throw new Error("EPERM: operation not permitted");
        }

        // If we get here, the operation should succeed
        const finalPath = path.join(baseTempDir.path, filename);
        await fs.rename(stagingPath, finalPath);

        return { success: true };
      } catch (error) {
        // Clean up staging file on failure
        try {
          const stagingFilename = `${filename}.staging`;
          const stagingPath = path.join(stagingDir, stagingFilename);
          await fs.unlink(stagingPath);
        } catch {
          // Ignore cleanup errors
        }

        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    };

    // Enhanced cleanup that removes subdirectories
    const enhancedCleanup = async (): Promise<void> => {
      await baseTempDir.cleanup();
    };

    return {
      ...baseTempDir,
      cleanup: enhancedCleanup,
      createConfigFile,
      readConfigFile,
      createAtomicWrite,
      createBackupFile,
      verifyFileIntegrity,
      simulateAtomicFailure,
    };
  }

  /**
   * Create temporary directory with realistic configuration file structure
   */
  static async createWithConfigurationStructure(): Promise<ConfigTempDirResult> {
    const tempDir = await this.createForConfigurationFiles({
      prefix: "config-structure-",
      enableBackups: true,
      enableVersioning: true,
    });

    // Create a realistic configuration structure
    const sampleConfig: ConfigurationData = {
      version: "1.0.0",
      format: "json",
      encoding: "utf8",
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: "test-suite",
        description: "Sample configuration for testing",
      },
      data: {
        agents: [
          {
            id: "sample-agent",
            name: "Sample Test Agent",
            personalityId: "sample-personality",
            roleId: "sample-role",
            modelConfig: {
              provider: "openai",
              modelId: "gpt-4",
              parameters: { temperature: 0.7 },
            },
          },
        ],
        personalities: [
          {
            id: "sample-personality",
            name: "Sample Personality",
            openness: 50,
            conscientiousness: 50,
            extraversion: 50,
            agreeableness: 50,
            neuroticism: 50,
            formality: 50,
            humor: 50,
            assertiveness: 50,
            empathy: 50,
            storytelling: 50,
            brevity: 50,
            imagination: 50,
            playfulness: 50,
            dramaticism: 50,
            analyticalDepth: 50,
            contrarianism: 50,
            encouragement: 50,
            curiosity: 50,
            patience: 50,
            isTemplate: false,
          },
        ],
        roles: [
          {
            id: "sample-role",
            name: "Sample Role",
            description: "A sample role for testing",
            systemPrompt: "You are a helpful assistant.",
            focusAreas: ["general assistance"],
            isTemplate: false,
          },
        ],
      },
    };

    // Create the sample configuration file
    await tempDir.createConfigFile("config.json", sampleConfig);

    return tempDir;
  }

  /**
   * Create temporary directory for cross-platform testing
   */
  static async createForCrossPlatformTesting(): Promise<ConfigTempDirResult> {
    const tempDir = await this.createForConfigurationFiles({
      prefix: "cross-platform-test-",
      permissions: os.platform() === "win32" ? undefined : "0755",
    });

    // Create test files with platform-specific considerations
    const testConfig: ConfigurationData = {
      version: "1.0.0",
      format: "json",
      encoding: "utf8",
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: "cross-platform-test",
        description: "Cross-platform compatibility test configuration",
      },
      data: {
        agents: [],
        personalities: [],
        roles: [],
      },
    };

    // Test different filename patterns
    const testFiles = [
      "simple-config.json",
      "config-with-spaces.json",
      "config.with.dots.json",
    ];

    for (const filename of testFiles) {
      await tempDir.createConfigFile(filename, testConfig);
    }

    return tempDir;
  }

  /**
   * Create temporary directory for concurrent access testing
   */
  static async createForConcurrencyTesting(): Promise<ConfigTempDirResult> {
    return this.createForConfigurationFiles({
      prefix: "concurrency-test-",
      enableBackups: true,
    });
  }

  /**
   * Clean up all configuration test directories
   */
  static async cleanupAllConfigurationDirectories(): Promise<void> {
    await this.cleanupAll();
  }
}

/**
 * Jest helper for configuration file temporary directory management
 */
export function useConfigurationTempDirectory(): {
  createConfigTemp: (
    config?: ConfigFileTempDirConfig,
  ) => Promise<ConfigTempDirResult>;
  createWithStructure: () => Promise<ConfigTempDirResult>;
  cleanup: () => Promise<void>;
} {
  const tempDirs: ConfigTempDirResult[] = [];

  const createConfigTemp = async (
    config?: ConfigFileTempDirConfig,
  ): Promise<ConfigTempDirResult> => {
    const tempDir =
      await EnhancedTemporaryDirectoryManager.createForConfigurationFiles(
        config,
      );
    tempDirs.push(tempDir);
    return tempDir;
  };

  const createWithStructure = async (): Promise<ConfigTempDirResult> => {
    const tempDir =
      await EnhancedTemporaryDirectoryManager.createWithConfigurationStructure();
    tempDirs.push(tempDir);
    return tempDir;
  };

  const cleanup = async (): Promise<void> => {
    const cleanupPromises = tempDirs.map((dir) => dir.cleanup());
    await Promise.all(cleanupPromises);
    tempDirs.length = 0;
  };

  // Auto-cleanup after each test
  afterEach(async () => {
    await cleanup();
  });

  return {
    createConfigTemp,
    createWithStructure,
    cleanup,
  };
}
