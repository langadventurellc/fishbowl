/**
 * Tests for useMessages hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMessages } from '../../../../src/renderer/hooks/useMessages';
import type { Message, CreateMessageData } from '../../../../src/shared/types';

// Mock the window.electronAPI
const mockElectronAPI = {
  dbMessagesList: vi.fn(),
  dbMessagesGet: vi.fn(),
  dbMessagesCreate: vi.fn(),
  dbMessagesDelete: vi.fn(),
};

// Mock window
global.window = {
  electronAPI: mockElectronAPI,
} as any;

describe('useMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty messages array', () => {
    const { result } = renderHook(() => useMessages());

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should list messages successfully', async () => {
    const mockMessages: Message[] = [
      {
        id: '1',
        conversationId: 'conv-1',
        agentId: 'agent-1',
        isActive: true,
        content: 'Hello world',
        type: 'text',
        metadata: '{}',
        timestamp: Date.now(),
      },
    ];

    mockElectronAPI.dbMessagesList.mockResolvedValue(mockMessages);

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const messages = await result.current.listMessages('conv-1');
      expect(messages).toEqual(mockMessages);
    });

    expect(result.current.messages).toEqual(mockMessages);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle listMessages error', async () => {
    mockElectronAPI.dbMessagesList.mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const messages = await result.current.listMessages('conv-1');
      expect(messages).toEqual([]);
    });

    expect(result.current.error).toBe('Database error');
    expect(result.current.loading).toBe(false);
  });

  it('should get message successfully', async () => {
    const mockMessage: Message = {
      id: '1',
      conversationId: 'conv-1',
      agentId: 'agent-1',
      isActive: true,
      content: 'Hello world',
      type: 'text',
      metadata: '{}',
      timestamp: Date.now(),
    };

    mockElectronAPI.dbMessagesGet.mockResolvedValue(mockMessage);

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const message = await result.current.getMessage('1');
      expect(message).toEqual(mockMessage);
    });

    expect(result.current.error).toBeNull();
  });

  it('should create message successfully', async () => {
    const createData: CreateMessageData = {
      conversationId: 'conv-1',
      agentId: 'agent-1',
      content: 'Hello world',
      type: 'text',
    };

    const mockMessage: Message = {
      id: '1',
      ...createData,
      isActive: true,
      metadata: '{}',
      timestamp: Date.now(),
    };

    mockElectronAPI.dbMessagesCreate.mockResolvedValue(mockMessage);

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const message = await result.current.createMessage(createData);
      expect(message).toEqual(mockMessage);
    });

    expect(result.current.messages).toContain(mockMessage);
    expect(result.current.error).toBeNull();
  });

  it('should delete message successfully', async () => {
    mockElectronAPI.dbMessagesDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const success = await result.current.deleteMessage('1');
      expect(success).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle error when electronAPI is not available', async () => {
    global.window = {} as any;

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const messages = await result.current.listMessages('conv-1');
      expect(messages).toEqual([]);
    });

    expect(result.current.error).toBe('Electron API not available');
  });
});
