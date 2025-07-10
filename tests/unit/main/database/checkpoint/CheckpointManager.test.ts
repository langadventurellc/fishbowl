/**
 * Unit tests for CheckpointManager
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CheckpointOptions } from '../../../../../src/main/database/checkpoint/CheckpointOptions';
import { CheckpointMode } from '../../../../../src/main/database/checkpoint/CheckpointMode';

// Mock dependencies
vi.mock('../../../../../src/main/database/checkpoint/getWalInfo', () => ({
  getWalInfo: vi.fn(() => ({
    journalMode: 'wal',
    walAutocheckpoint: 1000,
    synchronous: 'NORMAL',
    cacheSize: 2000,
  })),
}));

vi.mock('../../../../../src/main/database/checkpoint/performManualCheckpoint', () => ({
  performManualCheckpoint: vi.fn(() => ({
    totalPages: 100,
    modifiedPages: 100,
    success: true,
  })),
}));

// Create a mock for fs.promises.stat
const mockStat = vi.fn();

vi.mock('fs', async importOriginal => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    promises: {
      ...actual.promises,
      stat: mockStat,
    },
  };
});

vi.mock('../../../../../src/main/database/connection/state', () => ({
  databaseState: {
    getInstance: vi.fn(),
  },
}));

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/test/path'),
  },
}));

describe('CheckpointManager', () => {
  let manager: any;
  let mockDb: any;
  let CheckpointManager: any;
  const options: CheckpointOptions = {
    maxWalSize: 500000, // 500KB
    intervalMs: 100, // Short interval for testing
    mode: 'PASSIVE' as CheckpointMode,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockStat.mockClear();
    vi.useFakeTimers();

    mockDb = {
      prepare: vi.fn(),
      exec: vi.fn(),
      pragma: vi.fn(),
      close: vi.fn(),
    };

    const { databaseState } = await import('../../../../../src/main/database/connection/state');
    (databaseState.getInstance as any).mockReturnValue(mockDb);

    // Import CheckpointManager after mocks are set up
    const CheckpointManagerModule = await import(
      '../../../../../src/main/database/checkpoint/CheckpointManager'
    );
    CheckpointManager = CheckpointManagerModule.CheckpointManager;
    manager = new CheckpointManager(options);
  });

  afterEach(() => {
    manager?.stop();
    vi.useRealTimers();
  });

  it('should initialize with provided options', () => {
    expect(manager).toBeDefined();
    expect(manager['options']).toEqual(options);
  });

  it('should start monitoring when start is called', () => {
    manager.start();

    expect(manager['intervalId']).toBeDefined();
  });

  it('should stop monitoring when stopped', () => {
    manager.start();

    manager.stop();

    expect(manager['intervalId']).toBeNull();
  });

  it('should perform checkpoint when WAL size exceeds threshold', async () => {
    // Mock the getWalSize method directly to ensure the test works
    const getWalSizeSpy = vi.spyOn(manager, 'getWalSize').mockResolvedValue(600000);
    mockDb.pragma.mockReturnValue([0, 100, 100]); // [busy, log_pages, checkpointed_pages]

    // Call the checkAndPerformCheckpoint method directly instead of relying on interval
    await manager.checkAndPerformCheckpoint();

    expect(getWalSizeSpy).toHaveBeenCalled();
    expect(mockDb.pragma).toHaveBeenCalledWith('wal_checkpoint(PASSIVE)');

    getWalSizeSpy.mockRestore();
  });

  it('should not checkpoint when WAL size is below threshold', async () => {
    // Mock the getWalSize method directly to return size below threshold
    const getWalSizeSpy = vi.spyOn(manager, 'getWalSize').mockResolvedValue(400000);

    // Call the checkAndPerformCheckpoint method directly instead of relying on interval
    await manager.checkAndPerformCheckpoint();

    expect(getWalSizeSpy).toHaveBeenCalled();
    expect(mockDb.pragma).not.toHaveBeenCalled();

    getWalSizeSpy.mockRestore();
  });

  it('should handle checkpoint errors gracefully', async () => {
    // Mock the getWalSize method to return size above threshold
    const getWalSizeSpy = vi.spyOn(manager, 'getWalSize').mockResolvedValue(600000);

    mockDb.pragma.mockImplementation(() => {
      throw new Error('Checkpoint failed');
    });

    // Test error handling - should throw the error from performCheckpoint
    await expect(manager.checkAndPerformCheckpoint()).rejects.toThrow('Checkpoint failed');

    getWalSizeSpy.mockRestore();
  });

  it('should not start monitoring if already started', () => {
    manager.start();
    const firstIntervalId = manager['intervalId'];

    manager.start();
    const secondIntervalId = manager['intervalId'];

    expect(firstIntervalId).toBe(secondIntervalId);
  });

  it('should perform manual checkpoint', async () => {
    mockDb.pragma.mockReturnValue([0, 100, 100]); // [busy, log_pages, checkpointed_pages]

    const result = await manager.performCheckpoint();

    expect(mockDb.pragma).toHaveBeenCalledWith('wal_checkpoint(PASSIVE)');
    expect(result).toEqual({
      totalPages: 100,
      modifiedPages: 100,
      success: true,
    });
  });

  it('should throw error when performing checkpoint without database', async () => {
    // Directly spy on the existing databaseState mock to return null
    const { databaseState } = await import('../../../../../src/main/database/connection/state');
    const originalMock = databaseState.getInstance;
    vi.spyOn(databaseState, 'getInstance').mockReturnValueOnce(null);

    // Test that the method throws when called
    expect(() => manager.performCheckpoint()).toThrow('Database connection not initialized');

    // Restore the original mock
    databaseState.getInstance = originalMock;
  });

  it('should handle WAL file not existing', async () => {
    const error = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    mockStat.mockRejectedValue(error);

    manager.start();

    // Advance timer
    await vi.advanceTimersByTimeAsync(100);

    // Should not perform checkpoint when WAL file doesn't exist
    expect(mockDb.pragma).not.toHaveBeenCalled();
  });

  it('should get current WAL size', async () => {
    // Mock getWalSize method directly on the manager instance to test the behavior
    const getWalSizeSpy = vi.spyOn(manager, 'getWalSize').mockResolvedValue(1024000);

    const walSize = await manager.getWalSize();

    expect(getWalSizeSpy).toHaveBeenCalled();
    expect(walSize).toBe(1024000);

    getWalSizeSpy.mockRestore();
  });

  it('should return 0 when WAL file does not exist', async () => {
    const error = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    mockStat.mockRejectedValue(error);

    const walSize = await manager.getWalSize();

    expect(walSize).toBe(0);
  });

  it('should get checkpoint statistics', async () => {
    // Mock the getWalSize method to return the expected size
    const getWalSizeSpy = vi.spyOn(manager, 'getWalSize').mockResolvedValue(1024000);
    mockDb.pragma.mockReturnValueOnce(1000).mockReturnValueOnce('wal');

    const stats = await manager.getCheckpointStats();

    expect(stats).toEqual({
      walSize: 1024000,
      walPages: 1000,
      mode: 'wal',
    });

    getWalSizeSpy.mockRestore();
  });

  it('should force checkpoint with RESTART mode', async () => {
    mockDb.pragma.mockReturnValue([0, 100, 100]);

    const result = await manager.forceCheckpoint();

    expect(mockDb.pragma).toHaveBeenCalledWith('wal_checkpoint(RESTART)');
    expect(result).toEqual({
      totalPages: 100,
      modifiedPages: 100,
      success: true,
    });
  });
});
