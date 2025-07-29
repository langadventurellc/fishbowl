/**
 * @fileoverview Configuration File Lifecycle Management Integration Tests
 *
 * Comprehensive BDD integration tests for configuration file lifecycle management
 * covering creation, updates, deletion, and recovery with metadata management.
 */

import { FileLifecycleManager } from "./utilities/FileLifecycleManager";
import { FileServiceMockFactory } from "./support/FileServiceMockFactory";
import { BackupServiceMockFactory } from "./support/BackupServiceMockFactory";
import { DependencyServiceMockFactory } from "./support/DependencyServiceMockFactory";
import {
  EnhancedTemporaryDirectoryManager,
  type ConfigurationData,
  type ConfigTempDirResult,
} from "./utilities/TemporaryDirectoryManager";
import type {
  FileService,
  BackupService,
  DependencyService,
} from "../../types/services";

describe("Configuration File Lifecycle Management", () => {
  let fileService: jest.Mocked<FileService>;
  let backupService: jest.Mocked<BackupService>;
  let dependencyService: jest.Mocked<DependencyService>;
  let lifecycleManager: FileLifecycleManager;
  let tempDirManager: ConfigTempDirResult;
  let testDataPath: string;

  beforeEach(async () => {
    // Setup services with mock factories
    fileService = FileServiceMockFactory.createSuccess();
    backupService = BackupServiceMockFactory.createSuccess();
    dependencyService = DependencyServiceMockFactory.createSuccess();

    // Create lifecycle manager
    lifecycleManager = new FileLifecycleManager(
      fileService,
      backupService,
      dependencyService,
    );

    // Setup temporary directory for test files
    tempDirManager =
      await EnhancedTemporaryDirectoryManager.createForConfigurationFiles({
        prefix: "config-lifecycle-test",
        cleanup: true,
      });
    testDataPath = tempDirManager.path;
  });

  afterEach(async () => {
    await tempDirManager.cleanup();
  });

  describe("Scenario 1: Configuration File Creation with Metadata", () => {
    it("should create a configuration file with proper metadata and permissions", async () => {
      // Given: A new configuration file to create
      const filePath = `${testDataPath}/new-config.json`;
      const configurationData: ConfigurationData = {
        version: "1.0",
        format: "json",
        encoding: "utf-8",
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: "test-user",
          description: "Test configuration file",
          operation: "create",
        },
        data: {
          agents: [
            {
              id: "agent-1",
              name: "Test Agent",
              role: "assistant",
            },
          ],
          personalities: [],
          roles: [],
        },
      };

      // When: Creating the file with metadata options
      const result = await lifecycleManager.createFile(
        filePath,
        configurationData,
        {
          permissions: "644",
          atomic: true,
          validateContent: true,
          overwriteExisting: false,
        },
      );

      // Then: File should be created successfully
      expect(result.success).toBe(true);
      expect(result.path).toBe(filePath);
      expect(result.operation).toBe("create");
      expect(result.timestamp).toBeDefined();

      // And: File service should have been called with correct parameters
      expect(fileService.createFile).toHaveBeenCalledWith(
        filePath,
        configurationData,
        expect.objectContaining({
          permissions: "644",
          atomic: true,
          validateContent: true,
          overwriteExisting: false,
        }),
      );

      // And: Backup should be created for atomic operations
      expect(backupService.createBackup).toHaveBeenCalledWith(
        filePath,
        expect.objectContaining({
          reason: "Initial creation backup",
        }),
      );
    });

    it("should handle file creation errors gracefully", async () => {
      // Given: A file service that will fail
      fileService = FileServiceMockFactory.createFailure("Permission denied");
      lifecycleManager = new FileLifecycleManager(
        fileService,
        backupService,
        dependencyService,
      );

      const filePath = `${testDataPath}/failed-config.json`;
      const configurationData: ConfigurationData = {
        version: "1.0",
        format: "json",
        encoding: "utf-8",
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: "test-user",
          operation: "create",
        },
        data: {
          agents: [],
          personalities: [],
          roles: [],
        },
      };

      // When: Attempting to create the file
      const result = await lifecycleManager.createFile(
        filePath,
        configurationData,
      );

      // Then: Operation should fail gracefully
      expect(result.success).toBe(false);
      expect(result.error).toContain("Permission denied");
      expect(result.path).toBe(filePath);
      expect(result.operation).toBe("create");
    });
  });

  describe("Scenario 2: File Updates with Backup and Version History", () => {
    it("should update a file with automatic backup creation", async () => {
      // Given: An existing configuration file
      const filePath = `${testDataPath}/existing-config.json`;
      const originalData: ConfigurationData = {
        version: "1.0",
        format: "json",
        encoding: "utf-8",
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: "test-user",
          operation: "create",
        },
        data: {
          agents: [{ id: "agent-1", name: "Original Agent" }],
          personalities: [],
          roles: [],
        },
      };

      const updatedData: ConfigurationData = {
        ...originalData,
        version: "1.1",
        metadata: {
          ...originalData.metadata,
          lastModified: new Date().toISOString(),
          operation: "update",
        },
        data: {
          ...originalData.data,
          agents: [{ id: "agent-1", name: "Updated Agent" }],
        },
      };

      // When: Updating the file with backup enabled
      const result = await lifecycleManager.updateFile(filePath, updatedData, {
        createBackup: true,
        atomic: true,
        validateContent: true,
        maintainVersionHistory: true,
      });

      // Then: Update should succeed
      expect(result.success).toBe(true);
      expect(result.path).toBe(filePath);
      expect(result.operation).toBe("update");
      expect(result.backupCreated).toBe(true);

      // And: Backup should be created before update
      expect(backupService.createBackup).toHaveBeenCalledWith(
        filePath,
        expect.objectContaining({
          reason: "Pre-update backup",
        }),
      );

      // And: File service should update with correct data
      expect(fileService.updateFile).toHaveBeenCalledWith(
        filePath,
        updatedData,
        expect.objectContaining({
          createBackup: true,
          atomic: true,
          validateContent: true,
          maintainVersionHistory: true,
        }),
      );
    });

    it("should handle update failures with rollback capability", async () => {
      // Given: A file service that will fail updates
      fileService = FileServiceMockFactory.createFailure(
        "Write permission denied",
      );
      lifecycleManager = new FileLifecycleManager(
        fileService,
        backupService,
        dependencyService,
      );

      const filePath = `${testDataPath}/update-fail-config.json`;
      const updatedData: ConfigurationData = {
        version: "1.1",
        format: "json",
        encoding: "utf-8",
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: "test-user",
          operation: "update",
        },
        data: {
          agents: [],
          personalities: [],
          roles: [],
        },
      };

      // When: Attempting to update the file
      const result = await lifecycleManager.updateFile(filePath, updatedData, {
        createBackup: true,
      });

      // Then: Operation should fail gracefully
      expect(result.success).toBe(false);
      expect(result.error).toContain("Write permission denied");
      expect(result.operation).toBe("update");

      // And: Backup might still be created but update fails
      // This tests the atomic nature of operations
    });
  });

  describe("Scenario 3: File Deletion with Dependency Checking", () => {
    it("should prevent deletion of files with active dependencies", async () => {
      // Given: A file with dependencies
      const filePath = `${testDataPath}/config-has-dependencies.json`;
      dependencyService =
        DependencyServiceMockFactory.createWithDependencies(filePath);
      lifecycleManager = new FileLifecycleManager(
        fileService,
        backupService,
        dependencyService,
      );

      // When: Attempting to delete the file with dependency checking
      const result = await lifecycleManager.deleteFile(filePath, {
        checkDependencies: true,
        forceDeletion: false,
      });

      // Then: Deletion should be prevented
      expect(result.success).toBe(false);
      expect(result.error).toContain("blocking dependencies");
      expect(result.operation).toBe("delete");

      // And: Dependency check should have been performed
      expect(dependencyService.checkDependencies).toHaveBeenCalledWith(
        filePath,
      );

      // And: File should not be deleted
      expect(fileService.deleteFile).not.toHaveBeenCalled();
    });

    it("should allow forced deletion of files with dependencies", async () => {
      // Given: A file with dependencies
      const filePath = `${testDataPath}/config-force-delete.json`;
      dependencyService =
        DependencyServiceMockFactory.createWithDependencies(filePath);
      lifecycleManager = new FileLifecycleManager(
        fileService,
        backupService,
        dependencyService,
      );

      // When: Force deleting the file
      const result = await lifecycleManager.deleteFile(filePath, {
        checkDependencies: true,
        forceDeletion: true,
        removeBackups: true,
      });

      // Then: Deletion should succeed
      expect(result.success).toBe(true);
      expect(result.operation).toBe("delete");

      // And: File should be deleted
      expect(fileService.deleteFile).toHaveBeenCalledWith(
        filePath,
        expect.objectContaining({
          checkDependencies: true,
          forceDeletion: true,
          removeBackups: true,
        }),
      );

      // And: Backups should be cleaned up
      expect(backupService.listBackups).toHaveBeenCalledWith(filePath);
      expect(backupService.deleteBackup).toHaveBeenCalled();
    });

    it("should delete files without dependencies successfully", async () => {
      // Given: A file without dependencies
      const filePath = `${testDataPath}/config-no-deps.json`;

      // When: Deleting the file with dependency checking
      const result = await lifecycleManager.deleteFile(filePath, {
        checkDependencies: true,
        removeBackups: false,
      });

      // Then: Deletion should succeed
      expect(result.success).toBe(true);
      expect(result.operation).toBe("delete");

      // And: Dependencies should be checked first
      expect(dependencyService.checkDependencies).toHaveBeenCalledWith(
        filePath,
      );

      // And: File should be deleted
      expect(fileService.deleteFile).toHaveBeenCalledWith(
        filePath,
        expect.objectContaining({
          checkDependencies: true,
          removeBackups: false,
        }),
      );
    });
  });

  describe("Scenario 4: File Recovery from Backup Systems", () => {
    it("should restore a file from backup with integrity validation", async () => {
      // Given: A backup that exists and is valid
      const filePath = `${testDataPath}/restore-config.json`;
      const backupId = "backup-12345";

      // Mock backup integrity check to pass
      backupService.verifyBackupIntegrity.mockResolvedValue(true);

      // When: Restoring the file from backup
      const result = await lifecycleManager.restoreFile(
        backupId,
        filePath,
        true, // validateBeforeRestore
      );

      // Then: Restoration should succeed
      expect(result.success).toBe(true);
      expect(result.path).toBe(filePath);
      expect(result.operation).toBe("restore");
      expect(result.timestamp).toBeDefined();

      // And: Backup integrity should be verified first
      expect(backupService.verifyBackupIntegrity).toHaveBeenCalledWith(
        backupId,
      );

      // And: Restoration should be performed
      expect(backupService.restoreFromBackup).toHaveBeenCalledWith(
        backupId,
        filePath,
        expect.objectContaining({
          overwriteExisting: true,
          validateContent: true,
        }),
      );
    });

    it("should handle backup integrity validation failures", async () => {
      // Given: A backup with integrity issues
      const filePath = `${testDataPath}/corrupt-restore-config.json`;
      const backupId = "backup-corrupt";

      // Mock backup integrity check to fail
      backupService.verifyBackupIntegrity.mockResolvedValue(false);

      // When: Attempting to restore from corrupt backup
      const result = await lifecycleManager.restoreFile(
        backupId,
        filePath,
        true, // validateBeforeRestore
      );

      // Then: Restoration should fail
      expect(result.success).toBe(false);
      expect(result.error).toContain("Backup integrity validation failed");
      expect(result.operation).toBe("restore");

      // And: Backup integrity should be verified
      expect(backupService.verifyBackupIntegrity).toHaveBeenCalledWith(
        backupId,
      );

      // And: Restoration should not be attempted
      expect(backupService.restoreFromBackup).not.toHaveBeenCalled();
    });

    it("should perform complete lifecycle test with all operations", async () => {
      // Given: Initial and updated configuration data
      const filePath = `${testDataPath}/lifecycle-test-config.json`;
      const initialData: ConfigurationData = {
        version: "1.0",
        format: "json",
        encoding: "utf-8",
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: "lifecycle-test",
          operation: "create",
        },
        data: {
          agents: [{ id: "initial-agent", name: "Initial Agent" }],
          personalities: [],
          roles: [],
        },
      };

      const updatedData: ConfigurationData = {
        ...initialData,
        version: "2.0",
        metadata: {
          ...initialData.metadata,
          operation: "update",
          lastModified: new Date().toISOString(),
        },
        data: {
          ...initialData.data,
          agents: [{ id: "updated-agent", name: "Updated Agent" }],
        },
      };

      // When: Performing complete lifecycle test
      const results = await lifecycleManager.performLifecycleTest(
        filePath,
        initialData,
        updatedData,
      );

      // Then: All operations should succeed
      expect(results.create.success).toBe(true);
      expect(results.update.success).toBe(true);
      expect(results.delete.success).toBe(true);
      expect(results.restore.success).toBe(true);

      // And: Operations should be performed in correct order
      expect(results.create.operation).toBe("create");
      expect(results.update.operation).toBe("update");
      expect(results.delete.operation).toBe("delete");
      expect(results.restore.operation).toBe("restore");

      // And: All services should be involved appropriately
      expect(fileService.createFile).toHaveBeenCalled();
      expect(fileService.updateFile).toHaveBeenCalled();
      expect(fileService.deleteFile).toHaveBeenCalled();
      expect(backupService.createBackup).toHaveBeenCalled();
      expect(backupService.listBackups).toHaveBeenCalled();
      expect(backupService.restoreFromBackup).toHaveBeenCalled();
      expect(dependencyService.checkDependencies).toHaveBeenCalled();
    });
  });

  describe("File Information and Metadata Retrieval", () => {
    it("should retrieve comprehensive file information", async () => {
      // Given: A configuration file with metadata, backups, and dependencies
      const filePath = `${testDataPath}/info-test-config.json`;

      // When: Getting file information
      const info = await lifecycleManager.getFileInfo(filePath);

      // Then: All information should be retrieved
      expect(info.metadata).toBeDefined();
      expect(info.backups).toBeDefined();
      expect(info.dependencies).toBeDefined();

      // And: All services should be called
      expect(fileService.getMetadata).toHaveBeenCalledWith(filePath);
      expect(backupService.listBackups).toHaveBeenCalledWith(filePath);
      expect(dependencyService.checkDependencies).toHaveBeenCalledWith(
        filePath,
      );

      // And: Information should have expected structure
      expect(info.metadata.size).toBeDefined();
      expect(info.metadata.createdAt).toBeDefined();
      expect(info.backups).toBeInstanceOf(Array);
      expect(info.dependencies.canDelete).toBeDefined();
    });
  });
});
