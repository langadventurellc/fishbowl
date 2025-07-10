/**
 * Tests for useSecureStorage hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSecureStorage } from '../../../../src/renderer/hooks/useSecureStorage';
import type { CredentialInfo } from '../../../../src/shared/types';

// Mock the window.electronAPI
const mockElectronAPI = {
  secureCredentialsGet: vi.fn(),
  secureCredentialsSet: vi.fn(),
  secureCredentialsDelete: vi.fn(),
  secureCredentialsList: vi.fn(),
};

// Mock window
global.window = {
  electronAPI: mockElectronAPI,
} as any;

describe('useSecureStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty credentials array', () => {
    const { result } = renderHook(() => useSecureStorage());

    expect(result.current.credentials).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should get credential successfully', async () => {
    const mockCredential: CredentialInfo = {
      provider: 'openai',
      hasApiKey: true,
      lastUpdated: Date.now(),
      metadata: {},
    };

    mockElectronAPI.secureCredentialsGet.mockResolvedValue(mockCredential);

    const { result } = renderHook(() => useSecureStorage());

    await act(async () => {
      const credential = await result.current.getCredential('openai');
      expect(credential).toEqual(mockCredential);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle getCredential error', async () => {
    mockElectronAPI.secureCredentialsGet.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useSecureStorage());

    await act(async () => {
      const credential = await result.current.getCredential('openai');
      expect(credential).toBeNull();
    });

    expect(result.current.error).toBe('Storage error');
    expect(result.current.loading).toBe(false);
  });

  it('should set credential successfully', async () => {
    mockElectronAPI.secureCredentialsSet.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSecureStorage());

    await act(async () => {
      const success = await result.current.setCredential('openai', 'test-key', { model: 'gpt-4' });
      expect(success).toBe(true);
    });

    expect(result.current.credentials).toHaveLength(1);
    expect(result.current.credentials[0]).toEqual({
      provider: 'openai',
      hasApiKey: true,
      lastUpdated: expect.any(Number),
      metadata: { model: 'gpt-4' },
    });
    expect(result.current.error).toBeNull();
  });

  it('should update existing credential when setting', async () => {
    mockElectronAPI.secureCredentialsSet.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSecureStorage());

    // Set initial credential
    await act(async () => {
      await result.current.setCredential('openai', 'test-key', { model: 'gpt-4' });
    });

    // Update the same credential
    await act(async () => {
      await result.current.setCredential('openai', 'new-key', { model: 'gpt-4-turbo' });
    });

    expect(result.current.credentials).toHaveLength(1);
    expect(result.current.credentials[0].metadata).toEqual({ model: 'gpt-4-turbo' });
  });

  it('should delete credential successfully', async () => {
    mockElectronAPI.secureCredentialsDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSecureStorage());

    // Set initial credential
    await act(async () => {
      await result.current.setCredential('openai', 'test-key');
    });

    // Delete credential
    await act(async () => {
      const success = await result.current.deleteCredential('openai');
      expect(success).toBe(true);
    });

    expect(result.current.credentials).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it('should list credentials successfully', async () => {
    const mockCredentials: CredentialInfo[] = [
      {
        provider: 'openai',
        hasApiKey: true,
        lastUpdated: Date.now(),
        metadata: {},
      },
      {
        provider: 'anthropic',
        hasApiKey: true,
        lastUpdated: Date.now(),
        metadata: {},
      },
    ];

    mockElectronAPI.secureCredentialsList.mockResolvedValue(mockCredentials);

    const { result } = renderHook(() => useSecureStorage());

    await act(async () => {
      const credentials = await result.current.listCredentials();
      expect(credentials).toEqual(mockCredentials);
    });

    expect(result.current.credentials).toEqual(mockCredentials);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when electronAPI is not available', async () => {
    global.window = {} as any;

    const { result } = renderHook(() => useSecureStorage());

    await act(async () => {
      const credential = await result.current.getCredential('openai');
      expect(credential).toBeNull();
    });

    expect(result.current.error).toBe('Electron API not available');
  });
});
