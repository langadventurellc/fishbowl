/**
 * @fileoverview File Operation Test Utilities
 *
 * Provides utilities for testing atomic file operations, concurrent access,
 * error recovery, and file integrity verification in configuration management.
 */

import { promises as fs } from "fs";
import * as path from "path";
import {
  ConfigTempDirResult,
  ConfigurationData,
  AtomicWriteOptions,
  AtomicWriteResult,
} from "./TemporaryDirectoryManager";

/**
 * Configuration for concurrent operation testing
 */
export interface ConcurrentOperation {
  id: string;
  type: "read" | "write";
  content?: ConfigurationData;
  delay: number;
  priority?: "low" | "normal" | "high";
  options?: AtomicWriteOptions;
}

/**
 * Result from concurrent access testing
 */
export interface ConcurrentAccessResult {
  operations: number;
  successful: number;
  failed: number;
  results: PromiseSettledResult<AtomicWriteResult | ConfigurationData>[];
  duration: number;
  conflictResolution?:
    | "last-writer-wins"
    | "first-writer-wins"
    | "merge"
    | "error";
}

/**
 * File integrity verification result
 */
export interface FileIntegrityResult {
  isValid: boolean;
  actualContent?: ConfigurationData;
  expectedContent?: ConfigurationData;
  error?: string;
  checksumMatch?: boolean;
  sizeMatch?: boolean;
}

/**
 * File operation performance metrics
 */
export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  fileSize: number;
  operationType: string;
  memoryUsage?: number;
  cpuUsage?: number;
}

/**
 * File locking simulation options
 */
export interface FileLockOptions {
  timeout: number;
  retryInterval: number;
  lockType: "exclusive" | "shared";
  failOnTimeout: boolean;
}

/**
 * Cross-platform file operation options
 */
export interface CrossPlatformOptions {
  normalizeLineEndings: boolean;
  handlePermissions: boolean;
  validatePaths: boolean;
  encoding: BufferEncoding;
}

/**
 * Utilities for testing file operations
 */
export class FileOperationTestUtilities {
  /**
   * Perform atomic file write with comprehensive testing options
   */
  static async performAtomicWrite(
    tempDir: ConfigTempDirResult,
    filename: string,
    content: ConfigurationData,
    options: AtomicWriteOptions = {},
  ): Promise<AtomicWriteResult> {
    const startTime = Date.now();
    const {
      shouldFail = false,
      failAt = "write",
      validateConfig = true,
      createBackup = true,
    } = options;

    const stagingFiles: string[] = [];

    try {
      // Step 1: Validation phase
      if (validateConfig) {
        const validationResult = this.validateConfiguration(content);
        if (!validationResult.isValid) {
          if (shouldFail && failAt === "validation") {
            throw new Error(`Validation failure: ${validationResult.error}`);
          }
          if (!shouldFail) {
            throw new Error(
              `Configuration validation failed: ${validationResult.error}`,
            );
          }
        }
      }

      // Step 2: Staging phase
      if (shouldFail && failAt === "staging") {
        throw new Error(
          "ENOSPC: no space left on device - simulated staging failure",
        );
      }

      const stagingFilename = `${filename}.staging.${Date.now()}`;
      const stagingPath = path.join(tempDir.path, "staging", stagingFilename);
      stagingFiles.push(stagingPath);

      // Ensure staging directory exists
      await fs.mkdir(path.dirname(stagingPath), { recursive: true });

      const contentJson = JSON.stringify(content, null, 2);
      await fs.writeFile(stagingPath, contentJson, "utf8");

      // Step 3: Backup phase (if original exists)
      const finalPath = path.join(tempDir.path, filename);
      let backupPath: string | undefined;

      if (createBackup) {
        try {
          await fs.access(finalPath);
          backupPath = await tempDir.createBackupFile(filename);
        } catch {
          // Original file doesn't exist, no backup needed
        }
      }

      // Step 4: Commit phase
      if (shouldFail && failAt === "commit") {
        throw new Error(
          "EPERM: operation not permitted - simulated commit failure",
        );
      }

      // Atomic rename from staging to final
      await fs.rename(stagingPath, finalPath);

      // Remove staging file from tracking since it was renamed
      const stagingIndex = stagingFiles.indexOf(stagingPath);
      if (stagingIndex > -1) {
        stagingFiles.splice(stagingIndex, 1);
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        path: finalPath,
        backupPath,
        stagingFiles: [],
      };
    } catch (error) {
      // Cleanup staging files on failure
      const cleanupPromises = stagingFiles.map(async (stagingPath) => {
        try {
          await fs.unlink(stagingPath);
        } catch {
          // Ignore cleanup errors
        }
      });
      await Promise.allSettled(cleanupPromises);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stagingFiles,
      };
    }
  }

  /**
   * Verify file integrity after operations
   */
  static async verifyFileIntegrity(
    tempDir: ConfigTempDirResult,
    filename: string,
    expectedContent: ConfigurationData,
  ): Promise<FileIntegrityResult> {
    try {
      const actualContent = await tempDir.readConfigFile(filename);

      // Deep equality check
      const actualJson = JSON.stringify(actualContent, null, 2);
      const expectedJson = JSON.stringify(expectedContent, null, 2);
      const isValid = actualJson === expectedJson;

      // Additional integrity checks
      const filePath = path.join(tempDir.path, filename);
      const stats = await fs.stat(filePath);
      const sizeMatch = stats.size === Buffer.byteLength(expectedJson, "utf8");

      // Simple checksum verification
      const checksumMatch =
        this.calculateSimpleChecksum(actualJson) ===
        this.calculateSimpleChecksum(expectedJson);

      return {
        isValid,
        actualContent,
        expectedContent,
        checksumMatch,
        sizeMatch,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test concurrent file access scenarios
   */
  static async testConcurrentAccess(
    tempDir: ConfigTempDirResult,
    filename: string,
    operations: ConcurrentOperation[],
  ): Promise<ConcurrentAccessResult> {
    const startTime = Date.now();

    // Sort operations by delay to ensure proper timing
    const sortedOperations = [...operations].sort((a, b) => a.delay - b.delay);

    // Create promises for all operations
    const operationPromises = sortedOperations.map(async (operation) => {
      // Wait for the specified delay
      if (operation.delay > 0) {
        await this.sleep(operation.delay);
      }

      if (operation.type === "read") {
        return tempDir.readConfigFile(filename);
      } else {
        return this.performAtomicWrite(
          tempDir,
          filename,
          operation.content!,
          operation.options,
        );
      }
    });

    // Execute all operations concurrently
    const results = await Promise.allSettled(operationPromises);
    const endTime = Date.now();

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return {
      operations: operations.length,
      successful,
      failed,
      results,
      duration: endTime - startTime,
      conflictResolution: "last-writer-wins", // Default conflict resolution
    };
  }

  /**
   * Simulate file system errors for testing error recovery
   */
  static async simulateFileSystemError(
    tempDir: ConfigTempDirResult,
    filename: string,
    errorType: "ENOSPC" | "EACCES" | "EPERM" | "ENOENT" | "EMFILE",
  ): Promise<{ error: string; recovered: boolean }> {
    const filePath = path.join(tempDir.path, filename);

    try {
      switch (errorType) {
        case "ENOSPC":
          // Simulate disk space exhaustion
          throw Object.assign(new Error("ENOSPC: no space left on device"), {
            code: "ENOSPC",
          });

        case "EACCES":
          // Simulate permission denied
          throw Object.assign(new Error("EACCES: permission denied"), {
            code: "EACCES",
          });

        case "EPERM":
          // Simulate operation not permitted
          throw Object.assign(new Error("EPERM: operation not permitted"), {
            code: "EPERM",
          });

        case "ENOENT":
          // Simulate file not found
          throw Object.assign(new Error("ENOENT: no such file or directory"), {
            code: "ENOENT",
          });

        case "EMFILE":
          // Simulate too many open files
          throw Object.assign(new Error("EMFILE: too many open files"), {
            code: "EMFILE",
          });

        default:
          throw new Error(`Unknown error type: ${errorType}`);
      }
    } catch (error) {
      // Attempt recovery based on error type
      let recovered = false;

      try {
        switch (errorType) {
          case "ENOSPC":
            // Recovery: cleanup temp files
            await this.cleanupTempFiles(tempDir);
            recovered = true;
            break;

          case "EACCES":
          case "EPERM":
            // Recovery: check if file exists and is accessible
            await fs.access(filePath, fs.constants.F_OK);
            recovered = true;
            break;

          case "ENOENT":
            // Recovery: create directory structure
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            recovered = true;
            break;

          case "EMFILE":
            // Recovery: close file handles (simulated)
            recovered = true;
            break;
        }
      } catch {
        recovered = false;
      }

      return {
        error: error instanceof Error ? error.message : String(error),
        recovered,
      };
    }
  }

  /**
   * Test cross-platform file operations
   */
  static async testCrossPlatformOperations(
    tempDir: ConfigTempDirResult,
    filename: string,
    content: ConfigurationData,
    options: CrossPlatformOptions = {
      normalizeLineEndings: true,
      handlePermissions: true,
      validatePaths: true,
      encoding: "utf8",
    },
  ): Promise<{
    success: boolean;
    platformSpecific: Record<string, unknown>;
    errors: string[];
  }> {
    const errors: string[] = [];
    const platformSpecific: Record<string, unknown> = {};

    try {
      // Path validation
      if (options.validatePaths) {
        const normalizedPath = path.normalize(filename);
        if (normalizedPath !== filename) {
          platformSpecific.pathNormalized = {
            original: filename,
            normalized: normalizedPath,
          };
        }
      }

      // Content preparation with platform-specific handling
      let contentJson = JSON.stringify(content, null, 2);

      if (options.normalizeLineEndings) {
        // Normalize to platform-specific line endings
        contentJson = contentJson.replace(/\r\n|\n|\r/g, require("os").EOL);
        platformSpecific.lineEndingsNormalized = true;
      }

      // Write file with platform-appropriate encoding
      const filePath = path.join(tempDir.path, filename);
      await fs.writeFile(filePath, contentJson, { encoding: options.encoding });

      // Set platform-appropriate permissions
      if (options.handlePermissions && process.platform !== "win32") {
        await fs.chmod(filePath, 0o644); // rw-r--r--
        platformSpecific.permissionsSet = "644";
      }

      return { success: true, platformSpecific, errors };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      return { success: false, platformSpecific, errors };
    }
  }

  /**
   * Measure file operation performance
   */
  static async measurePerformance<T>(
    operation: () => Promise<T>,
    operationType: string,
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    const result = await operation();

    const endTime = Date.now();
    const endMemory = process.memoryUsage();

    const metrics: PerformanceMetrics = {
      startTime,
      endTime,
      duration: endTime - startTime,
      fileSize: 0, // Would need actual file size
      operationType,
      memoryUsage: endMemory.heapUsed - startMemory.heapUsed,
    };

    return { result, metrics };
  }

  /**
   * Clean up temporary files and directories
   */
  private static async cleanupTempFiles(
    tempDir: ConfigTempDirResult,
  ): Promise<void> {
    const stagingDir = path.join(tempDir.path, "staging");
    const backupDir = path.join(tempDir.path, "backups");

    try {
      const stagingFiles = await fs.readdir(stagingDir);
      for (const file of stagingFiles) {
        if (file.includes(".staging") || file.includes(".tmp")) {
          await fs.unlink(path.join(stagingDir, file));
        }
      }
    } catch {
      // Ignore errors if staging directory doesn't exist
    }

    try {
      const backupFiles = await fs.readdir(backupDir);
      const oldBackups = backupFiles.filter((file) => {
        const filePath = path.join(backupDir, file);
        // Remove backups older than 1 hour for cleanup
        const now = Date.now();
        const fileTime = parseInt(file.split(".").pop() || "0");
        return now - fileTime > 3600000; // 1 hour
      });

      for (const backup of oldBackups) {
        await fs.unlink(path.join(backupDir, backup));
      }
    } catch {
      // Ignore errors if backup directory doesn't exist
    }
  }

  /**
   * Validate configuration data structure
   */
  private static validateConfiguration(config: ConfigurationData): {
    isValid: boolean;
    error?: string;
  } {
    try {
      // Basic structure validation
      if (!config.version || !config.format || !config.encoding) {
        return { isValid: false, error: "Missing required metadata fields" };
      }

      if (!config.data || typeof config.data !== "object") {
        return { isValid: false, error: "Missing or invalid data section" };
      }

      if (
        !Array.isArray(config.data.agents) ||
        !Array.isArray(config.data.personalities) ||
        !Array.isArray(config.data.roles)
      ) {
        return { isValid: false, error: "Data arrays must be arrays" };
      }

      // Validate agents have required references
      for (const agent of config.data.agents) {
        const typedAgent = agent as Record<string, unknown>;
        if (!typedAgent.personalityId || !typedAgent.roleId) {
          return {
            isValid: false,
            error: "Agents must have personalityId and roleId",
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error:
          error instanceof Error ? error.message : "Unknown validation error",
      };
    }
  }

  /**
   * Calculate simple checksum for content verification
   */
  private static calculateSimpleChecksum(content: string): number {
    let checksum = 0;
    for (let i = 0; i < content.length; i++) {
      checksum += content.charCodeAt(i);
    }
    return checksum;
  }

  /**
   * Sleep utility for timing delays
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create file with specific size for performance testing
   */
  static async createLargeConfigurationFile(
    tempDir: ConfigTempDirResult,
    filename: string,
    targetSizeKB: number,
  ): Promise<ConfigurationData> {
    const baseConfig: ConfigurationData = {
      version: "1.0.0",
      format: "json",
      encoding: "utf8",
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: "performance-test",
        description: `Large configuration file for performance testing (~${targetSizeKB}KB)`,
      },
      data: {
        agents: [],
        personalities: [],
        roles: [],
      },
    };

    // Calculate approximate number of agents needed to reach target size
    const sampleAgent = {
      id: "sample-agent",
      name: "Sample Agent for Size Calculation",
      personalityId: "sample-personality",
      roleId: "sample-role",
      modelConfig: {
        provider: "openai",
        modelId: "gpt-4-turbo-preview",
        parameters: { temperature: 0.7, maxTokens: 2000 },
      },
    };

    const sampleSize = JSON.stringify(sampleAgent).length;
    const targetBytes = targetSizeKB * 1024;
    const approximateAgentCount = Math.floor(targetBytes / sampleSize / 3); // Divide by 3 for agents, personalities, roles

    // Generate the required number of entities
    for (let i = 0; i < approximateAgentCount; i++) {
      baseConfig.data.agents.push({
        id: `perf-agent-${i}`,
        name: `Performance Test Agent ${i}`,
        description: `This is agent ${i} created for performance testing purposes`,
        personalityId: `perf-personality-${i}`,
        roleId: `perf-role-${i}`,
        modelConfig: {
          provider: "openai",
          modelId: "gpt-4-turbo-preview",
          parameters: {
            temperature: 0.5 + (i % 10) * 0.05,
            maxTokens: 1000 + (i % 5) * 500,
            topP: 0.8 + (i % 3) * 0.1,
          },
        },
      } as Record<string, unknown>);

      baseConfig.data.personalities.push({
        id: `perf-personality-${i}`,
        name: `Performance Personality ${i}`,
        description: `Performance test personality ${i}`,
        openness: 40 + (i % 20),
        conscientiousness: 50 + (i % 15),
        extraversion: 45 + (i % 25),
        agreeableness: 60 + (i % 10),
        neuroticism: 30 + (i % 18),
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
      } as Record<string, unknown>);

      baseConfig.data.roles.push({
        id: `perf-role-${i}`,
        name: `Performance Role ${i}`,
        description: `Performance test role ${i} with extensive description for size padding`,
        systemPrompt: `You are performance test role ${i}. This role is designed for performance testing purposes and includes additional text to increase file size.`,
        focusAreas: [
          `performance-area-${i}`,
          `testing-domain-${i}`,
          `benchmark-category-${i}`,
        ],
        isTemplate: false,
      } as Record<string, unknown>);
    }

    await tempDir.createConfigFile(filename, baseConfig);
    return baseConfig;
  }
}
