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

// Mock the store
vi.mock('../../../../src/renderer/store', () => ({
  useStore: vi.fn(),
}));

// Mock the createIPCStoreBridge utility
vi.mock('../../../../src/renderer/store/utils', () => ({
  createIPCStoreBridge: vi.fn(),
}));

import { useStore } from '../../../../src/renderer/store';
import { createIPCStoreBridge } from '../../../../src/renderer/store/utils';

const mockUseStore = useStore as unknown as ReturnType<typeof vi.fn>;
const mockCreateIPCStoreBridge = createIPCStoreBridge as unknown as ReturnType<typeof vi.fn>;

describe('useConversations', () => {
  const mockSetConversations = vi.fn();
  const mockAddConversation = vi.fn();
  const mockUpdateConversationInStore = vi.fn();
  const mockRemoveConversation = vi.fn();
  const mockSetLoading = vi.fn();
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up store mock with default state
    mockUseStore.mockReturnValue({
      conversations: [],
      loading: false,
      error: null,
      setConversations: mockSetConversations,
      addConversation: mockAddConversation,
      updateConversation: mockUpdateConversationInStore,
      removeConversation: mockRemoveConversation,
      setLoading: mockSetLoading,
      setError: mockSetError,
    });

    // Set up createIPCStoreBridge mock to execute operations immediately
    mockCreateIPCStoreBridge.mockImplementation(
      (ipcOperation, storeUpdater, errorHandler, loadingSetter) => {
        return async (...args: any[]) => {
          loadingSetter(true);
          try {
            const result = await ipcOperation(...args);
            storeUpdater(result);
            return result;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errorHandler(errorMessage);
            return null;
          } finally {
            loadingSetter(false);
          }
        };
      },
    );
  });

  it('should initialize with empty conversations array', () => {
    const { result } = renderHook(() => useConversations());

    expect(result.current.conversations).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.listConversations).toBe('function');
    expect(typeof result.current.getConversation).toBe('function');
    expect(typeof result.current.createConversation).toBe('function');
    expect(typeof result.current.updateConversation).toBe('function');
    expect(typeof result.current.deleteConversation).toBe('function');
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

    expect(mockElectronAPI.dbConversationsList).toHaveBeenCalledWith(undefined);
    expect(mockSetConversations).toHaveBeenCalledWith(mockConversations);
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should handle listConversations error', async () => {
    mockElectronAPI.dbConversationsList.mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useConversations());

    await act(async () => {
      const conversations = await result.current.listConversations();
      expect(conversations).toEqual([]);
    });

    expect(mockElectronAPI.dbConversationsList).toHaveBeenCalledWith(undefined);
    expect(mockSetError).toHaveBeenCalledWith('Database error');
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
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

    expect(mockElectronAPI.dbConversationsGet).toHaveBeenCalledWith('1');
    expect(mockUpdateConversationInStore).toHaveBeenCalledWith('1', mockConversation);
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
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

    expect(mockElectronAPI.dbConversationsCreate).toHaveBeenCalledWith(createData);
    expect(mockAddConversation).toHaveBeenCalledWith(mockConversation);
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
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

    expect(mockElectronAPI.dbConversationsUpdate).toHaveBeenCalledWith('1', updateData);
    expect(mockUpdateConversationInStore).toHaveBeenCalledWith('1', mockConversation);
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should delete conversation successfully', async () => {
    mockElectronAPI.dbConversationsDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useConversations());

    await act(async () => {
      const success = await result.current.deleteConversation('1');
      expect(success).toBe(true);
    });

    expect(mockElectronAPI.dbConversationsDelete).toHaveBeenCalledWith('1');
    expect(mockRemoveConversation).toHaveBeenCalledWith('1');
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should handle error when electronAPI is not available', async () => {
    // Temporarily remove electronAPI to test error handling
    const originalWindow = global.window;
    global.window = {} as any;

    const { result } = renderHook(() => useConversations());

    await act(async () => {
      const conversations = await result.current.listConversations();
      expect(conversations).toEqual([]);
    });

    expect(mockSetError).toHaveBeenCalledWith('Electron API not available');

    // Restore original window
    global.window = originalWindow;
  });
});
