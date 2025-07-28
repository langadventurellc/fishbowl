/**
 * @fileoverview Atomic Operation Fixtures for Test Scenarios
 *
 * Provides predefined fixtures and scenarios for testing atomic file operations,
 * concurrent access patterns, error recovery, and performance characteristics.
 */

import { ConfigurationData } from "./TemporaryDirectoryManager";
import { ConcurrentOperation } from "./FileOperationTestUtilities";
import { ConfigurationFileBuilder } from "./ConfigurationFileBuilder";

/**
 * Atomic operation scenario definition
 */
export interface AtomicOperationScenario {
  name: string;
  description: string;
  configuration: ConfigurationData;
  expectation: "success" | "rollback" | "error";
  failurePoint?: "staging" | "commit" | "validation";
  simulatedError?: string;
  expectedFiles?: string[];
  unexpectedFiles?: string[];
  verificationSteps?: string[];
}

/**
 * Concurrent access scenario definition
 */
export interface ConcurrentAccessScenario {
  name: string;
  description: string;
  operations: ConcurrentOperation[];
  expectedBehavior:
    | "last-writer-wins"
    | "first-writer-wins"
    | "merge"
    | "error"
    | "serialized";
  lockingStrategy?:
    | "file-lock"
    | "read-write-lock"
    | "optimistic"
    | "pessimistic";
  timeoutMs?: number;
  maxConcurrency?: number;
}

/**
 * Error recovery scenario definition
 */
export interface ErrorRecoveryScenario {
  name: string;
  description: string;
  simulatedConditions: {
    errorType:
      | "ENOSPC"
      | "EACCES"
      | "EPERM"
      | "ENOENT"
      | "EMFILE"
      | "CORRUPTION";
    errorTiming: "before-write" | "during-write" | "after-write";
    additionalContext?: Record<string, unknown>;
  };
  expectedBehavior:
    | "graceful-error-handling"
    | "retry-with-backoff"
    | "fallback"
    | "user-intervention";
  expectedError?: string;
  recoveryActions: string[];
  successCriteria: string[];
}

/**
 * Performance test scenario definition
 */
export interface PerformanceTestScenario {
  name: string;
  description: string;
  fileSize: string;
  operationType:
    | "atomic-write"
    | "concurrent-read"
    | "bulk-update"
    | "large-file";
  concurrencyLevel?: number;
  duration?: string;
  expectedPerformance: {
    maxLatency?: string;
    minThroughput?: string;
    maxMemoryUsage?: string;
    errorRate?: string;
  };
}

/**
 * Cross-platform scenario definition
 */
export interface CrossPlatformScenario {
  name: string;
  description: string;
  platforms: ("windows" | "macos" | "linux")[];
  pathVariations: string[];
  expectedBehavior:
    | "correct-path-normalization"
    | "permission-handling"
    | "encoding-consistency";
  platformSpecific?: {
    windows?: Record<string, unknown>;
    macos?: Record<string, unknown>;
    linux?: Record<string, unknown>;
  };
}

/**
 * Main fixtures class providing all test scenarios
 */
export class AtomicOperationFixtures {
  /**
   * Get all atomic operation test scenarios
   */
  static getAtomicOperationScenarios(): AtomicOperationScenario[] {
    return [
      this.getSuccessfulAtomicWriteScenario(),
      this.getRollbackOnStagingFailureScenario(),
      this.getRollbackOnCommitFailureScenario(),
      this.getRollbackOnValidationFailureScenario(),
      this.getIntegrityVerificationScenario(),
      this.getBackupCreationScenario(),
      this.getCleanupOnFailureScenario(),
    ];
  }

  /**
   * Get all concurrent access test scenarios
   */
  static getConcurrentAccessScenarios(): ConcurrentAccessScenario[] {
    return [
      this.getMultipleWritersSameFileScenario(),
      this.getReaderWriterConflictScenario(),
      this.getHighConcurrencyScenario(),
      this.getPriorityBasedAccessScenario(),
      this.getDeadlockPreventionScenario(),
    ];
  }

  /**
   * Get all error recovery test scenarios
   */
  static getErrorRecoveryScenarios(): ErrorRecoveryScenario[] {
    return [
      this.getDiskSpaceExhaustionScenario(),
      this.getPermissionDeniedScenario(),
      this.getFileSystemCorruptionScenario(),
      this.getNetworkFileSystemIssuesScenario(),
      this.getFileHandleExhaustionScenario(),
    ];
  }

  /**
   * Get all performance test scenarios
   */
  static getPerformanceTestScenarios(): PerformanceTestScenario[] {
    return [
      this.getLargeFileOperationsScenario(),
      this.getFrequentUpdatesScenario(),
      this.getBulkOperationsScenario(),
      this.getMemoryConstrainedScenario(),
    ];
  }

  /**
   * Get all cross-platform test scenarios
   */
  static getCrossPlatformScenarios(): CrossPlatformScenario[] {
    return [
      this.getWindowsPathHandlingScenario(),
      this.getUnixPathHandlingScenario(),
      this.getPermissionDifferencesScenario(),
      this.getEncodingConsistencyScenario(),
    ];
  }

  // Atomic Operation Scenarios

  private static getSuccessfulAtomicWriteScenario(): AtomicOperationScenario {
    return {
      name: "successful-atomic-write",
      description: "Normal atomic write operation that succeeds completely",
      configuration: new ConfigurationFileBuilder()
        .withCompleteValidConfiguration()
        .withMetadata({ operation: "atomic-write-success" })
        .build(),
      expectation: "success",
      expectedFiles: ["config.json", "config.json.backup"],
      unexpectedFiles: ["config.json.tmp", "config.json.staging"],
      verificationSteps: [
        "Verify final file exists and is valid",
        "Verify backup was created",
        "Verify no temporary files remain",
        "Verify file integrity matches expected content",
      ],
    };
  }

  private static getRollbackOnStagingFailureScenario(): AtomicOperationScenario {
    return {
      name: "rollback-on-staging-failure",
      description:
        "Atomic write fails during staging phase and rolls back cleanly",
      configuration: new ConfigurationFileBuilder()
        .withMinimalValidConfiguration()
        .withMetadata({ operation: "staging-failure-test" })
        .build(),
      expectation: "rollback",
      failurePoint: "staging",
      simulatedError: "ENOSPC",
      expectedFiles: ["original-config.json"],
      unexpectedFiles: [
        "config.json.tmp",
        "config.json.staging",
        "config.json.backup",
      ],
      verificationSteps: [
        "Verify original file is unchanged",
        "Verify no staging files remain",
        "Verify no backup was created",
        "Verify error is properly propagated",
      ],
    };
  }

  private static getRollbackOnCommitFailureScenario(): AtomicOperationScenario {
    return {
      name: "rollback-on-commit-failure",
      description:
        "Atomic write fails during commit phase and rolls back with cleanup",
      configuration: new ConfigurationFileBuilder()
        .withCompleteValidConfiguration()
        .withMetadata({ operation: "commit-failure-test" })
        .build(),
      expectation: "rollback",
      failurePoint: "commit",
      simulatedError: "EPERM",
      expectedFiles: ["original-config.json"],
      unexpectedFiles: ["config.json.tmp", "config.json.staging"],
      verificationSteps: [
        "Verify original file is restored",
        "Verify staging files are cleaned up",
        "Verify backup is restored if it existed",
        "Verify file system is in consistent state",
      ],
    };
  }

  private static getRollbackOnValidationFailureScenario(): AtomicOperationScenario {
    return {
      name: "rollback-on-validation-failure",
      description:
        "Atomic write fails validation and prevents any file changes",
      configuration: new ConfigurationFileBuilder()
        .withInvalidConfiguration("invalid-references")
        .withMetadata({ operation: "validation-failure-test" })
        .build(),
      expectation: "rollback",
      failurePoint: "validation",
      simulatedError: "VALIDATION_ERROR",
      expectedFiles: ["original-config.json"],
      unexpectedFiles: [
        "config.json.tmp",
        "config.json.staging",
        "config.json.backup",
      ],
      verificationSteps: [
        "Verify validation error is caught early",
        "Verify no file operations were performed",
        "Verify original file is completely unchanged",
        "Verify detailed validation error information is available",
      ],
    };
  }

  private static getIntegrityVerificationScenario(): AtomicOperationScenario {
    return {
      name: "integrity-verification",
      description:
        "Verify file integrity is maintained through atomic operations",
      configuration: new ConfigurationFileBuilder()
        .withMultipleAgents(5)
        .withMetadata({ operation: "integrity-verification-test" })
        .build(),
      expectation: "success",
      expectedFiles: ["config.json"],
      verificationSteps: [
        "Calculate checksum before operation",
        "Perform atomic write operation",
        "Calculate checksum after operation",
        "Verify content matches exactly",
        "Verify file size is correct",
        "Verify no corruption occurred",
      ],
    };
  }

  private static getBackupCreationScenario(): AtomicOperationScenario {
    return {
      name: "backup-creation",
      description: "Verify proper backup creation during atomic operations",
      configuration: new ConfigurationFileBuilder()
        .withCompleteValidConfiguration()
        .withMetadata({ operation: "backup-creation-test" })
        .build(),
      expectation: "success",
      expectedFiles: ["config.json", "config.json.backup"],
      verificationSteps: [
        "Create initial configuration file",
        "Perform atomic update operation",
        "Verify backup was created with timestamp",
        "Verify backup contains original content",
        "Verify new file contains updated content",
      ],
    };
  }

  private static getCleanupOnFailureScenario(): AtomicOperationScenario {
    return {
      name: "cleanup-on-failure",
      description:
        "Verify proper cleanup of temporary files when operations fail",
      configuration: new ConfigurationFileBuilder()
        .withMinimalValidConfiguration()
        .withMetadata({ operation: "cleanup-test" })
        .build(),
      expectation: "rollback",
      failurePoint: "commit",
      simulatedError: "EPERM",
      unexpectedFiles: ["config.json.tmp", "config.json.staging", "temp-*"],
      verificationSteps: [
        "Force operation to fail at commit stage",
        "Verify all temporary files are cleaned up",
        "Verify no orphaned staging files remain",
        "Verify directory is in clean state",
      ],
    };
  }

  // Concurrent Access Scenarios

  private static getMultipleWritersSameFileScenario(): ConcurrentAccessScenario {
    return {
      name: "multiple-writers-same-file",
      description:
        "Multiple processes attempting to write the same configuration file",
      operations: [
        {
          id: "writer-1",
          type: "write",
          content: new ConfigurationFileBuilder()
            .withAgent({ id: "writer-1-agent", name: "Writer 1 Agent" })
            .build(),
          delay: 0,
          priority: "normal",
        },
        {
          id: "writer-2",
          type: "write",
          content: new ConfigurationFileBuilder()
            .withAgent({ id: "writer-2-agent", name: "Writer 2 Agent" })
            .build(),
          delay: 10,
          priority: "high",
        },
        {
          id: "writer-3",
          type: "write",
          content: new ConfigurationFileBuilder()
            .withAgent({ id: "writer-3-agent", name: "Writer 3 Agent" })
            .build(),
          delay: 20,
          priority: "low",
        },
      ],
      expectedBehavior: "last-writer-wins",
      lockingStrategy: "file-lock",
      timeoutMs: 5000,
    };
  }

  private static getReaderWriterConflictScenario(): ConcurrentAccessScenario {
    return {
      name: "reader-writer-conflict",
      description:
        "Reader and writer operations on same file with different timing",
      operations: [
        {
          id: "reader-1",
          type: "read",
          delay: 0,
        },
        {
          id: "writer-1",
          type: "write",
          content: new ConfigurationFileBuilder()
            .withCompleteValidConfiguration()
            .build(),
          delay: 50,
        },
        {
          id: "reader-2",
          type: "read",
          delay: 100,
        },
      ],
      expectedBehavior: "serialized",
      lockingStrategy: "read-write-lock",
      timeoutMs: 3000,
    };
  }

  private static getHighConcurrencyScenario(): ConcurrentAccessScenario {
    const operations: ConcurrentOperation[] = [];

    // Create 10 readers and 5 writers with random delays
    for (let i = 0; i < 10; i++) {
      operations.push({
        id: `reader-${i}`,
        type: "read",
        delay: Math.floor(Math.random() * 1000),
      });
    }

    for (let i = 0; i < 5; i++) {
      operations.push({
        id: `writer-${i}`,
        type: "write",
        content: new ConfigurationFileBuilder()
          .withAgent({
            id: `concurrent-agent-${i}`,
            name: `Concurrent Agent ${i}`,
          })
          .build(),
        delay: Math.floor(Math.random() * 1000),
      });
    }

    return {
      name: "high-concurrency-scenario",
      description:
        "High number of concurrent operations to test locking performance",
      operations,
      expectedBehavior: "serialized",
      lockingStrategy: "optimistic",
      timeoutMs: 10000,
      maxConcurrency: 15,
    };
  }

  private static getPriorityBasedAccessScenario(): ConcurrentAccessScenario {
    return {
      name: "priority-based-access",
      description: "Test priority-based access control for file operations",
      operations: [
        {
          id: "low-priority-writer",
          type: "write",
          content: new ConfigurationFileBuilder()
            .withAgent({ id: "low-priority-agent", name: "Low Priority Agent" })
            .build(),
          delay: 0,
          priority: "low",
        },
        {
          id: "high-priority-writer",
          type: "write",
          content: new ConfigurationFileBuilder()
            .withAgent({
              id: "high-priority-agent",
              name: "High Priority Agent",
            })
            .build(),
          delay: 100,
          priority: "high",
        },
        {
          id: "normal-priority-reader",
          type: "read",
          delay: 50,
          priority: "normal",
        },
      ],
      expectedBehavior: "first-writer-wins", // High priority should win despite delay
      lockingStrategy: "pessimistic",
      timeoutMs: 5000,
    };
  }

  private static getDeadlockPreventionScenario(): ConcurrentAccessScenario {
    return {
      name: "deadlock-prevention",
      description:
        "Test deadlock prevention mechanisms in concurrent file access",
      operations: [
        {
          id: "operation-a",
          type: "write",
          content: new ConfigurationFileBuilder()
            .withAgent({ id: "agent-a", name: "Agent A" })
            .build(),
          delay: 0,
        },
        {
          id: "operation-b",
          type: "write",
          content: new ConfigurationFileBuilder()
            .withAgent({ id: "agent-b", name: "Agent B" })
            .build(),
          delay: 50,
        },
      ],
      expectedBehavior: "error", // Should detect potential deadlock
      lockingStrategy: "pessimistic",
      timeoutMs: 2000,
    };
  }

  // Error Recovery Scenarios

  private static getDiskSpaceExhaustionScenario(): ErrorRecoveryScenario {
    return {
      name: "disk-space-exhaustion",
      description: "File operations when disk space is insufficient",
      simulatedConditions: {
        errorType: "ENOSPC",
        errorTiming: "during-write",
        additionalContext: {
          availableDiskSpace: "0bytes",
          requiredSpace: "1MB",
        },
      },
      expectedBehavior: "graceful-error-handling",
      expectedError: "ENOSPC",
      recoveryActions: [
        "cleanup-temp-files",
        "notify-user-of-space-issue",
        "retry-with-smaller-file",
        "suggest-cleanup-actions",
      ],
      successCriteria: [
        "No partial files left on disk",
        "Clear error message provided",
        "Original file remains intact",
        "System remains stable",
      ],
    };
  }

  private static getPermissionDeniedScenario(): ErrorRecoveryScenario {
    return {
      name: "permission-denied",
      description: "File operations when permissions are insufficient",
      simulatedConditions: {
        errorType: "EACCES",
        errorTiming: "before-write",
        additionalContext: {
          filePermissions: "444",
          requiredPermissions: "644",
        },
      },
      expectedBehavior: "graceful-error-handling",
      expectedError: "EACCES",
      recoveryActions: [
        "check-file-permissions",
        "request-permission-elevation",
        "suggest-fallback-location",
        "provide-permission-fix-instructions",
      ],
      successCriteria: [
        "Permission error clearly identified",
        "Helpful error message with next steps",
        "No system instability",
        "Fallback options presented",
      ],
    };
  }

  private static getFileSystemCorruptionScenario(): ErrorRecoveryScenario {
    return {
      name: "filesystem-corruption",
      description: "Operations on corrupted configuration files",
      simulatedConditions: {
        errorType: "CORRUPTION",
        errorTiming: "during-write",
        additionalContext: {
          corruptionType: "partial-write",
          corruptionLocation: "middle",
        },
      },
      expectedBehavior: "retry-with-backoff",
      recoveryActions: [
        "detect-corruption",
        "restore-from-backup",
        "validate-file-integrity",
        "recreate-file-if-necessary",
      ],
      successCriteria: [
        "Corruption detected reliably",
        "Backup restoration works",
        "File integrity verified",
        "Data loss minimized",
      ],
    };
  }

  private static getNetworkFileSystemIssuesScenario(): ErrorRecoveryScenario {
    return {
      name: "network-filesystem-issues",
      description:
        "Operations on network-mounted file systems with connectivity issues",
      simulatedConditions: {
        errorType: "ENOENT",
        errorTiming: "during-write",
        additionalContext: {
          networkLatency: "5000ms",
          intermittentFailures: true,
        },
      },
      expectedBehavior: "retry-with-backoff",
      recoveryActions: [
        "retry-with-exponential-backoff",
        "cache-locally-if-possible",
        "enable-offline-mode",
        "queue-operations-for-retry",
      ],
      successCriteria: [
        "Network issues handled gracefully",
        "Local caching works",
        "Operations eventually succeed",
        "User informed of network status",
      ],
    };
  }

  private static getFileHandleExhaustionScenario(): ErrorRecoveryScenario {
    return {
      name: "file-handle-exhaustion",
      description: "Operations when system file handle limit is reached",
      simulatedConditions: {
        errorType: "EMFILE",
        errorTiming: "before-write",
        additionalContext: {
          openFileHandles: 1024,
          maxFileHandles: 1024,
        },
      },
      expectedBehavior: "retry-with-backoff",
      expectedError: "EMFILE",
      recoveryActions: [
        "close-unused-file-handles",
        "retry-after-handle-cleanup",
        "implement-handle-pooling",
        "warn-about-resource-limits",
      ],
      successCriteria: [
        "File handles managed efficiently",
        "Resource cleanup works",
        "Operations eventually succeed",
        "System remains stable",
      ],
    };
  }

  // Performance Test Scenarios

  private static getLargeFileOperationsScenario(): PerformanceTestScenario {
    return {
      name: "large-file-operations",
      description: "Operations on large configuration files",
      fileSize: "10MB",
      operationType: "atomic-write",
      expectedPerformance: {
        maxLatency: "2000ms",
        maxMemoryUsage: "50MB",
        errorRate: "< 0.1%",
      },
    };
  }

  private static getFrequentUpdatesScenario(): PerformanceTestScenario {
    return {
      name: "frequent-updates",
      description: "Frequent small updates to configuration files",
      fileSize: "1MB",
      operationType: "atomic-write",
      concurrencyLevel: 10,
      duration: "60s",
      expectedPerformance: {
        maxLatency: "50ms",
        minThroughput: "100ops/sec",
        errorRate: "< 1%",
      },
    };
  }

  private static getBulkOperationsScenario(): PerformanceTestScenario {
    return {
      name: "bulk-operations",
      description: "Bulk updates with multiple configuration changes",
      fileSize: "5MB",
      operationType: "bulk-update",
      concurrencyLevel: 5,
      expectedPerformance: {
        maxLatency: "1000ms",
        minThroughput: "50ops/sec",
        maxMemoryUsage: "100MB",
      },
    };
  }

  private static getMemoryConstrainedScenario(): PerformanceTestScenario {
    return {
      name: "memory-constrained",
      description: "Operations under memory pressure",
      fileSize: "50MB",
      operationType: "large-file",
      expectedPerformance: {
        maxLatency: "5000ms",
        maxMemoryUsage: "200MB",
        errorRate: "< 5%",
      },
    };
  }

  // Cross-Platform Scenarios

  private static getWindowsPathHandlingScenario(): CrossPlatformScenario {
    return {
      name: "windows-path-handling",
      description: "Path handling on Windows systems",
      platforms: ["windows"],
      pathVariations: [
        "C:\\Users\\test\\config.json",
        "\\\\server\\share\\config.json",
        "config.json",
        ".\\config.json",
        "..\\config.json",
      ],
      expectedBehavior: "correct-path-normalization",
      platformSpecific: {
        windows: {
          pathSeparator: "\\",
          driveLetters: true,
          uncPaths: true,
          maxPathLength: 260,
        },
      },
    };
  }

  private static getUnixPathHandlingScenario(): CrossPlatformScenario {
    return {
      name: "unix-path-handling",
      description: "Path handling on Unix-like systems",
      platforms: ["macos", "linux"],
      pathVariations: [
        "/home/user/config.json",
        "/tmp/config.json",
        "./config.json",
        "../config.json",
        "~/config.json",
      ],
      expectedBehavior: "correct-path-normalization",
      platformSpecific: {
        macos: {
          pathSeparator: "/",
          caseSensitive: false,
          homeDirectory: "~",
        },
        linux: {
          pathSeparator: "/",
          caseSensitive: true,
          homeDirectory: "~",
        },
      },
    };
  }

  private static getPermissionDifferencesScenario(): CrossPlatformScenario {
    return {
      name: "permission-differences",
      description: "Platform-specific permission handling",
      platforms: ["windows", "macos", "linux"],
      pathVariations: ["config.json"],
      expectedBehavior: "permission-handling",
      platformSpecific: {
        windows: {
          permissionModel: "access-control-list",
          defaultPermissions: "read-write",
        },
        macos: {
          permissionModel: "unix-permissions",
          defaultPermissions: "644",
        },
        linux: {
          permissionModel: "unix-permissions",
          defaultPermissions: "644",
        },
      },
    };
  }

  private static getEncodingConsistencyScenario(): CrossPlatformScenario {
    return {
      name: "encoding-consistency",
      description: "Character encoding consistency across platforms",
      platforms: ["windows", "macos", "linux"],
      pathVariations: ["config-utf8.json", "config-unicode.json"],
      expectedBehavior: "encoding-consistency",
      platformSpecific: {
        windows: {
          defaultEncoding: "utf8",
          lineEndings: "\r\n",
          bomHandling: true,
        },
        macos: {
          defaultEncoding: "utf8",
          lineEndings: "\n",
          bomHandling: false,
        },
        linux: {
          defaultEncoding: "utf8",
          lineEndings: "\n",
          bomHandling: false,
        },
      },
    };
  }

  /**
   * Get a scenario by name from any category
   */
  static getScenarioByName(
    name: string,
  ):
    | AtomicOperationScenario
    | ConcurrentAccessScenario
    | ErrorRecoveryScenario
    | PerformanceTestScenario
    | CrossPlatformScenario
    | null {
    const allScenarios = [
      ...this.getAtomicOperationScenarios(),
      ...this.getConcurrentAccessScenarios(),
      ...this.getErrorRecoveryScenarios(),
      ...this.getPerformanceTestScenarios(),
      ...this.getCrossPlatformScenarios(),
    ];

    return allScenarios.find((scenario) => scenario.name === name) || null;
  }

  /**
   * Get all scenarios for a specific category
   */
  static getScenariosByCategory(
    category:
      | "atomic"
      | "concurrent"
      | "error"
      | "performance"
      | "cross-platform",
  ): unknown[] {
    switch (category) {
      case "atomic":
        return this.getAtomicOperationScenarios();
      case "concurrent":
        return this.getConcurrentAccessScenarios();
      case "error":
        return this.getErrorRecoveryScenarios();
      case "performance":
        return this.getPerformanceTestScenarios();
      case "cross-platform":
        return this.getCrossPlatformScenarios();
      default:
        return [];
    }
  }
}
