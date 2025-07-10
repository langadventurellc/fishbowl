/**
 * Tests for useConversations hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConversations } from '../../../../src/renderer/hooks/useConversations';
import type {
  Conversation,
  CreateConversationData,
  UpdateConversationData,
} from '../../../../src/shared/types';

// Mock the window.electronAPI
const mockElectronAPI = {
  dbConversationsList: vi.fn(),
  dbConversationsGet: vi.fn(),
  dbConversationsCreate: vi.fn(),
  dbConversationsUpdate: vi.fn(),
  dbConversationsDelete: vi.fn(),
};

// Mock window
global.window = {
  electronAPI: mockElectronAPI,
} as any;

describe('useConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty conversations array', () => {
    const { result } = renderHook(() => useConversations());

    expect(result.current.conversations).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should list conversations successfully', async () => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        name: 'Test Conversation',
        description: 'A test conversation',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    mockElectronAPI.dbConversationsList.mockResolvedValue(mockConversations);

    const { result } = renderHook(() => useConversations());

    await act(async () => {
      const conversations = await result.current.listConversations();
      expect(conversations).toEqual(mockConversations);
    });

    expect(result.current.conversations).toEqual(mockConversations);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle listConversations error', async () => {
    mockElectronAPI.dbConversationsList.mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useConversations());

    await act(async () => {
      const conversations = await result.current.listConversations();
      expect(conversations).toEqual([]);
    });

    expect(result.current.error).toBe('Database error');
    expect(result.current.loading).toBe(false);
  });

  it('should get conversation successfully', async () => {
    const mockConversation: Conversation = {
      id: '1',
      name: 'Test Conversation',
      description: 'A test conversation',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockElectronAPI.dbConversationsGet.mockResolvedValue(mockConversation);

    const { result } = renderHook(() => useConversations());

    await act(async () => {
      const conversation = await result.current.getConversation('1');
      expect(conversation).toEqual(mockConversation);
    });

    expect(result.current.error).toBeNull();
  });

  it('should create conversation successfully', async () => {
    const createData: CreateConversationData = {
      name: 'New Conversation',
      description: 'A new conversation',
    };

    const mockConversation: Conversation = {
      id: '1',
      name: createData.name,
      description: createData.description ?? '',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockElectronAPI.dbConversationsCreate.mockResolvedValue(mockConversation);

    const { result } = renderHook(() => useConversations());

    await act(async () => {
      const conversation = await result.current.createConversation(createData);
      expect(conversation).toEqual(mockConversation);
    });

    expect(result.current.conversations).toContain(mockConversation);
    expect(result.current.error).toBeNull();
  });

  it('should update conversation successfully', async () => {
    const updateData: UpdateConversationData = {
      name: 'Updated Conversation',
    };

    const mockConversation: Conversation = {
      id: '1',
      name: 'Updated Conversation',
      description: 'A test conversation',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockElectronAPI.dbConversationsUpdate.mockResolvedValue(mockConversation);

    const { result } = renderHook(() => useConversations());

    await act(async () => {
      const conversation = await result.current.updateConversation('1', updateData);
      expect(conversation).toEqual(mockConversation);
    });

    expect(result.current.error).toBeNull();
  });

  it('should delete conversation successfully', async () => {
    mockElectronAPI.dbConversationsDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useConversations());

    await act(async () => {
      const success = await result.current.deleteConversation('1');
      expect(success).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle error when electronAPI is not available', async () => {
    global.window = {} as any;

    const { result } = renderHook(() => useConversations());

    await act(async () => {
      const conversations = await result.current.listConversations();
      expect(conversations).toEqual([]);
    });

    expect(result.current.error).toBe('Electron API not available');
  });
});
