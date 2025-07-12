/**
 * Unit tests for BackupManager
 */
import { vol } from 'memfs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackupManager } from '../../../../../src/main/database/backup/BackupManager';
import { BackupOptions } from '../../../../../src/main/database/backup/BackupOptions';

// Mock Electron
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/app-data'),
  },
}));

// Mock dependencies
vi.mock('../../../../../src/main/database/backup/ensureBackupDirectory', () => ({
  ensureBackupDirectory: vi.fn(),
}));

vi.mock('../../../../../src/main/database/backup/generateBackupFileName', () => ({
  generateBackupFileName: vi.fn(() => 'backup-2024-01-01-120000.sqlite'),
}));

vi.mock('../../../../../src/main/database/backup/createBackupFile', () => ({
  createBackupFile: vi.fn(),
}));

vi.mock('../../../../../src/main/database/backup/validateBackupIntegrity', () => ({
  validateBackupIntegrity: vi.fn(() => true),
}));

vi.mock('../../../../../src/main/database/backup/listBackups', () => ({
  listBackups: vi.fn(() => []),
}));

vi.mock('../../../../../src/main/database/backup/cleanupOldBackups', () => ({
  cleanupOldBackups: vi.fn(() => 0),
}));

vi.mock('../../../../../src/main/database/backup/getDatabasePath', () => ({
  getDatabasePath: vi.fn(() => '/data/database.sqlite'),
}));

vi.mock('../../../../../src/main/database/backup/calculateChecksum', () => ({
  calculateChecksum: vi.fn(() => 'abc123'),
}));

// Mock fs module using memfs
vi.mock('fs');
vi.mock('fs/promises');

vi.mock('../../../../../src/main/database/connection/state', () => ({
  databaseState: {
    getInstance: vi.fn(() => ({
      close: vi.fn(),
    })),
    setInstance: vi.fn(),
  },
}));

vi.mock('../../../../../src/main/database/checkpoint/checkpointManagerInstance', () => ({
  checkpointManagerInstance: {
    performCheckpoint: vi.fn(),
  },
}));

describe('BackupManager', () => {
  let manager: BackupManager;
  const options: BackupOptions = {
    directory: '/backups',
    compression: false,
    includeWal: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset memfs state
    vol.reset();

    // Set up virtual file system for tests
    vol.fromJSON({
      '/backups': null, // Create directory
      '/data/database.sqlite': 'fake database content',
    });

    manager = new BackupManager(options);
  });

  it('should create backup successfully', async () => {
    const { ensureBackupDirectory } = await import(
      '../../../../../src/main/database/backup/ensureBackupDirectory'
    );
    const { createBackupFile } = await import(
      '../../../../../src/main/database/backup/createBackupFile'
    );
    const { calculateChecksum } = await import(
      '../../../../../src/main/database/backup/calculateChecksum'
    );

    // Create the backup file in memfs so fs.stat succeeds
    vol.writeFileSync('/backups/backup-2024-01-01-120000.sqlite', Buffer.alloc(1024 * 1024));

    const result = await manager.createBackup({
      customFileName: 'test-backup',
    });

    expect(ensureBackupDirectory).toHaveBeenCalledWith('/backups');
    expect(createBackupFile).toHaveBeenCalled();
    expect(calculateChecksum).toHaveBeenCalled();

    expect(result.success).toBe(true);
    expect(result.filePath).toBe('/backups/backup-2024-01-01-120000.sqlite');
    expect(result.size).toBe(1024 * 1024);
    expect(result.timestamp).toBeDefined();
  });

  it('should handle backup creation errors', async () => {
    const { createBackupFile } = await import(
      '../../../../../src/main/database/backup/createBackupFile'
    );

    vi.mocked(createBackupFile).mockImplementation(() => {
      throw new Error('Backup failed');
    });

    const result = await manager.createBackup();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Backup failed');
  });

  it('should restore backup successfully', async () => {
    const { validateBackupIntegrity } = await import(
      '../../../../../src/main/database/backup/validateBackupIntegrity'
    );
    const { databaseState } = await import('../../../../../src/main/database/connection/state');

    // Create backup file to restore from
    vol.writeFileSync('/backups/backup.sqlite', 'backup content');

    const result = await manager.restoreFromBackup('/backups/backup.sqlite', {
      validateIntegrity: true,
    });

    expect(validateBackupIntegrity).toHaveBeenCalledWith('/backups/backup.sqlite');
    expect(databaseState.getInstance).toHaveBeenCalled();

    expect(result.success).toBe(true);
    expect(result.restoredFile).toBe('/backups/backup.sqlite');
  });

  it('should skip validation when validateIntegrity is false', async () => {
    const { validateBackupIntegrity } = await import(
      '../../../../../src/main/database/backup/validateBackupIntegrity'
    );

    await manager.restoreFromBackup('/backups/backup.sqlite', {
      validateIntegrity: false,
    });

    expect(validateBackupIntegrity).not.toHaveBeenCalled();
  });

  it('should handle restore validation failure', async () => {
    const { validateBackupIntegrity } = await import(
      '../../../../../src/main/database/backup/validateBackupIntegrity'
    );

    vi.mocked(validateBackupIntegrity).mockReturnValue(false);

    const result = await manager.restoreFromBackup('/backups/backup.sqlite', {
      validateIntegrity: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('integrity validation failed');
  });

  it('should list backups', async () => {
    const { listBackups } = await import('../../../../../src/main/database/backup/listBackups');

    const mockBackups = [
      {
        id: 'backup1',
        timestamp: Date.now(),
        filePath: '/backups/backup1.sqlite',
        size: 1024,
        compressed: false,
        dbVersion: 3,
        appVersion: '1.0.0',
        checksum: 'abc',
        walIncluded: true,
        shmIncluded: false,
      },
    ];

    vi.mocked(listBackups).mockResolvedValue(mockBackups);

    const backups = await manager.listBackups();

    expect(listBackups).toHaveBeenCalledWith('/backups');
    expect(backups).toEqual(mockBackups);
  });

  it('should delete backup', async () => {
    // Create backup file to delete
    vol.writeFileSync('/backups/backup.sqlite', 'backup content');

    const success = await manager.deleteBackup('backup.sqlite');

    expect(success).toBe(true);
    // Verify file was actually deleted
    expect(vol.existsSync('/backups/backup.sqlite')).toBe(false);
  });

  it('should handle delete errors', async () => {
    // Try to delete non-existent file
    const success = await manager.deleteBackup('nonexistent.sqlite');

    expect(success).toBe(false);
  });

  it('should validate backup', async () => {
    const { validateBackupIntegrity } = await import(
      '../../../../../src/main/database/backup/validateBackupIntegrity'
    );

    // Ensure the mock returns true
    vi.mocked(validateBackupIntegrity).mockReturnValue(true);

    const isValid = manager.validateBackup('/backups/backup.sqlite');

    expect(validateBackupIntegrity).toHaveBeenCalledWith('/backups/backup.sqlite');
    expect(isValid).toBe(true);
  });

  it('should cleanup old backups', async () => {
    const { cleanupOldBackups } = await import(
      '../../../../../src/main/database/backup/cleanupOldBackups'
    );

    vi.mocked(cleanupOldBackups).mockResolvedValue([
      'backup1.sqlite',
      'backup2.sqlite',
      'backup3.sqlite',
    ]);

    const deleted = await manager.cleanupOldBackups();

    expect(cleanupOldBackups).toHaveBeenCalledWith('/backups', 10);
    expect(deleted).toEqual(['backup1.sqlite', 'backup2.sqlite', 'backup3.sqlite']);
  });

  it('should get backup statistics', async () => {
    const { listBackups } = await import('../../../../../src/main/database/backup/listBackups');

    const mockBackups = [
      {
        id: 'backup1',
        timestamp: Date.now() - 86400000, // 1 day ago
        filePath: '/backups/backup1.sqlite',
        size: 1024 * 1024, // 1MB
        compressed: false,
        dbVersion: 3,
        appVersion: '1.0.0',
        checksum: 'abc',
        walIncluded: true,
        shmIncluded: false,
      },
      {
        id: 'backup2',
        timestamp: Date.now(),
        filePath: '/backups/backup2.sqlite',
        size: 2 * 1024 * 1024, // 2MB
        compressed: false,
        dbVersion: 3,
        appVersion: '1.0.0',
        checksum: 'def',
        walIncluded: true,
        shmIncluded: false,
      },
    ];

    vi.mocked(listBackups).mockResolvedValue(mockBackups);

    const stats = await manager.getBackupStats();

    expect(stats.totalBackups).toBe(2);
    expect(stats.totalSize).toBe(3 * 1024 * 1024);
    expect(stats.oldestBackup).toBeDefined();
    expect(stats.newestBackup).toBeDefined();
  });

  it('should handle empty backup stats', async () => {
    const { listBackups } = await import('../../../../../src/main/database/backup/listBackups');

    vi.mocked(listBackups).mockResolvedValue([]);

    const stats = await manager.getBackupStats();

    expect(stats.totalBackups).toBe(0);
    expect(stats.totalSize).toBe(0);
    expect(stats.oldestBackup).toBeUndefined();
    expect(stats.newestBackup).toBeUndefined();
  });
});
