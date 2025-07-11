/**
 * Tests for IPC store integration utilities
 */

import { describe, expect, it, vi } from 'vitest';
import {
  createIPCStoreBridge,
  createOptimisticUpdate,
  validateStoreUpdate,
} from '../../../../src/renderer/store/utils';

describe('IPC Store Integration Utilities', () => {
  describe('createIPCStoreBridge', () => {
    it('should execute IPC operation and update store on success', async () => {
      const mockIpcOperation = vi.fn().mockResolvedValue('test-data');
      const mockStoreUpdater = vi.fn();
      const mockErrorHandler = vi.fn();
      const mockLoadingSetter = vi.fn();

      const bridgedOperation = createIPCStoreBridge(
        mockIpcOperation,
        mockStoreUpdater,
        mockErrorHandler,
        mockLoadingSetter,
      );

      const result = await bridgedOperation('arg1', 'arg2');

      expect(mockLoadingSetter).toHaveBeenCalledWith(true);
      expect(mockIpcOperation).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockStoreUpdater).toHaveBeenCalledWith('test-data');
      expect(mockErrorHandler).not.toHaveBeenCalled();
      expect(mockLoadingSetter).toHaveBeenCalledWith(false);
      expect(result).toBe('test-data');
    });

    it('should handle IPC operation errors', async () => {
      const mockError = new Error('IPC failed');
      const mockIpcOperation = vi.fn().mockRejectedValue(mockError);
      const mockStoreUpdater = vi.fn();
      const mockErrorHandler = vi.fn();
      const mockLoadingSetter = vi.fn();

      const bridgedOperation = createIPCStoreBridge(
        mockIpcOperation,
        mockStoreUpdater,
        mockErrorHandler,
        mockLoadingSetter,
      );

      const result = await bridgedOperation();

      expect(mockLoadingSetter).toHaveBeenCalledWith(true);
      expect(mockStoreUpdater).not.toHaveBeenCalled();
      expect(mockErrorHandler).toHaveBeenCalledWith('IPC failed');
      expect(mockLoadingSetter).toHaveBeenCalledWith(false);
      expect(result).toBeNull();
    });

    it('should handle non-Error exceptions', async () => {
      const mockIpcOperation = vi.fn().mockRejectedValue('string error');
      const mockStoreUpdater = vi.fn();
      const mockErrorHandler = vi.fn();
      const mockLoadingSetter = vi.fn();

      const bridgedOperation = createIPCStoreBridge(
        mockIpcOperation,
        mockStoreUpdater,
        mockErrorHandler,
        mockLoadingSetter,
      );

      const result = await bridgedOperation();

      expect(mockErrorHandler).toHaveBeenCalledWith('Unknown error');
      expect(result).toBeNull();
    });

    it('should always call loading setter in finally block', async () => {
      const mockIpcOperation = vi.fn().mockRejectedValue(new Error('test'));
      const mockStoreUpdater = vi.fn();
      const mockErrorHandler = vi.fn();
      const mockLoadingSetter = vi.fn();

      const bridgedOperation = createIPCStoreBridge(
        mockIpcOperation,
        mockStoreUpdater,
        mockErrorHandler,
        mockLoadingSetter,
      );

      await bridgedOperation();

      expect(mockLoadingSetter).toHaveBeenCalledWith(true);
      expect(mockLoadingSetter).toHaveBeenCalledWith(false);
      expect(mockLoadingSetter).toHaveBeenCalledTimes(2);
    });
  });

  describe('createOptimisticUpdate', () => {
    it('should apply optimistic update and confirm with server data', async () => {
      const mockOptimisticUpdater = vi.fn();
      const mockIpcOperation = vi.fn().mockResolvedValue('server-data');
      const mockConfirmedUpdater = vi.fn();
      const mockRevertUpdater = vi.fn();
      const mockErrorHandler = vi.fn();

      const optimisticOperation = createOptimisticUpdate(
        mockOptimisticUpdater,
        mockIpcOperation,
        mockConfirmedUpdater,
        mockRevertUpdater,
        mockErrorHandler,
      );

      const result = await optimisticOperation('arg1', 'arg2');

      expect(mockOptimisticUpdater).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockIpcOperation).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockConfirmedUpdater).toHaveBeenCalledWith('server-data');
      expect(mockRevertUpdater).not.toHaveBeenCalled();
      expect(mockErrorHandler).not.toHaveBeenCalled();
      expect(result).toBe('server-data');
    });

    it('should revert optimistic update on IPC failure', async () => {
      const mockError = new Error('Server error');
      const mockOptimisticUpdater = vi.fn();
      const mockIpcOperation = vi.fn().mockRejectedValue(mockError);
      const mockConfirmedUpdater = vi.fn();
      const mockRevertUpdater = vi.fn();
      const mockErrorHandler = vi.fn();

      const optimisticOperation = createOptimisticUpdate(
        mockOptimisticUpdater,
        mockIpcOperation,
        mockConfirmedUpdater,
        mockRevertUpdater,
        mockErrorHandler,
      );

      const result = await optimisticOperation('arg1', 'arg2');

      expect(mockOptimisticUpdater).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockConfirmedUpdater).not.toHaveBeenCalled();
      expect(mockRevertUpdater).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockErrorHandler).toHaveBeenCalledWith('Server error');
      expect(result).toBeNull();
    });
  });

  describe('validateStoreUpdate', () => {
    it('should return true for valid data', () => {
      const validator = vi.fn().mockReturnValue(true);
      const errorHandler = vi.fn();

      const result = validateStoreUpdate('test-data', validator, errorHandler);

      expect(validator).toHaveBeenCalledWith('test-data');
      expect(errorHandler).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false for invalid data', () => {
      const validator = vi.fn().mockReturnValue(false);
      const errorHandler = vi.fn();

      const result = validateStoreUpdate('test-data', validator, errorHandler);

      expect(validator).toHaveBeenCalledWith('test-data');
      expect(errorHandler).toHaveBeenCalledWith(
        'Store update validation failed: Invalid data structure',
      );
      expect(result).toBe(false);
    });

    it('should handle validator exceptions', () => {
      const validator = vi.fn().mockImplementation(() => {
        throw new Error('Validation failed');
      });
      const errorHandler = vi.fn();

      const result = validateStoreUpdate('test-data', validator, errorHandler);

      expect(errorHandler).toHaveBeenCalledWith('Store update validation error: Validation failed');
      expect(result).toBe(false);
    });

    it('should work without error handler', () => {
      const validator = vi.fn().mockReturnValue(false);

      const result = validateStoreUpdate('test-data', validator);

      expect(result).toBe(false);
    });

    it('should handle non-Error exceptions in validator', () => {
      const validator = vi.fn().mockImplementation(() => {
        throw new Error('string error');
      });
      const errorHandler = vi.fn();

      const result = validateStoreUpdate('test-data', validator, errorHandler);

      expect(errorHandler).toHaveBeenCalledWith('Store update validation error: string error');
      expect(result).toBe(false);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complex IPC to store workflow', async () => {
      const mockData = { id: '1', name: 'test' };
      const mockIpcOperation = vi.fn().mockResolvedValue(mockData);
      const mockStoreUpdater = vi.fn();
      const mockErrorHandler = vi.fn();
      const mockLoadingSetter = vi.fn();
      const validator = vi.fn().mockReturnValue(true);

      const bridgedOperation = createIPCStoreBridge(
        mockIpcOperation,
        data => {
          if (validateStoreUpdate(data, validator, mockErrorHandler)) {
            mockStoreUpdater(data);
          }
        },
        mockErrorHandler,
        mockLoadingSetter,
      );

      const result = await bridgedOperation();

      expect(validator).toHaveBeenCalledWith(mockData);
      expect(mockStoreUpdater).toHaveBeenCalledWith(mockData);
      expect(result).toBe(mockData);
    });
  });
});
