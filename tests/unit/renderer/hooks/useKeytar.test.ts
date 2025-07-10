/**
 * Tests for useKeytar hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeytar } from '../../../../src/renderer/hooks/useKeytar';

// Mock the window.electronAPI
const mockElectronAPI = {
  secureKeytarGet: vi.fn(),
  secureKeytarSet: vi.fn(),
  secureKeytarDelete: vi.fn(),
};

// Mock window
global.window = {
  electronAPI: mockElectronAPI,
} as any;

describe('useKeytar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useKeytar());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.getPassword).toBe('function');
    expect(typeof result.current.setPassword).toBe('function');
    expect(typeof result.current.deletePassword).toBe('function');
  });

  it('should get password successfully', async () => {
    const mockPassword = 'test-password';
    mockElectronAPI.secureKeytarGet.mockResolvedValue(mockPassword);

    const { result } = renderHook(() => useKeytar());

    await act(async () => {
      const password = await result.current.getPassword('test-service', 'test-account');
      expect(password).toBe(mockPassword);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should handle getPassword error', async () => {
    mockElectronAPI.secureKeytarGet.mockRejectedValue(new Error('Keytar error'));

    const { result } = renderHook(() => useKeytar());

    await act(async () => {
      const password = await result.current.getPassword('test-service', 'test-account');
      expect(password).toBeNull();
    });

    expect(result.current.error).toBe('Keytar error');
    expect(result.current.loading).toBe(false);
  });

  it('should set password successfully', async () => {
    mockElectronAPI.secureKeytarSet.mockResolvedValue(undefined);

    const { result } = renderHook(() => useKeytar());

    await act(async () => {
      const success = await result.current.setPassword(
        'test-service',
        'test-account',
        'test-password',
      );
      expect(success).toBe(true);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should handle setPassword error', async () => {
    mockElectronAPI.secureKeytarSet.mockRejectedValue(new Error('Keytar error'));

    const { result } = renderHook(() => useKeytar());

    await act(async () => {
      const success = await result.current.setPassword(
        'test-service',
        'test-account',
        'test-password',
      );
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe('Keytar error');
    expect(result.current.loading).toBe(false);
  });

  it('should delete password successfully', async () => {
    mockElectronAPI.secureKeytarDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useKeytar());

    await act(async () => {
      const success = await result.current.deletePassword('test-service', 'test-account');
      expect(success).toBe(true);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should handle deletePassword error', async () => {
    mockElectronAPI.secureKeytarDelete.mockRejectedValue(new Error('Keytar error'));

    const { result } = renderHook(() => useKeytar());

    await act(async () => {
      const success = await result.current.deletePassword('test-service', 'test-account');
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe('Keytar error');
    expect(result.current.loading).toBe(false);
  });

  it('should handle error when electronAPI is not available', async () => {
    global.window = {} as any;

    const { result } = renderHook(() => useKeytar());

    await act(async () => {
      const password = await result.current.getPassword('test-service', 'test-account');
      expect(password).toBeNull();
    });

    expect(result.current.error).toBe('Electron API not available');
  });
});
