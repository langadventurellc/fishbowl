/**
 * Integration tests for useConversations hook with Zustand store
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useConversations } from '../../../../src/renderer/hooks/useConversations';
import { useStore } from '../../../../src/renderer/store';
import type {
  Conversation,
  CreateConversationData,
  UpdateConversationData,
} from '../../../../src/shared/types';

// Mock the store
vi.mock('../../../../src/renderer/store', () => ({
  useStore: vi.fn(),
}));

// Mock window.electronAPI
(global.window as any).electronAPI = {
  dbConversationsList: vi.fn(),
  dbConversationsGet: vi.fn(),
  dbConversationsCreate: vi.fn(),
  dbConversationsUpdate: vi.fn(),
  dbConversationsDelete: vi.fn(),
};

const mockUseStore = useStore as unknown as ReturnType<typeof vi.fn>;

describe('useConversations Hook Integration', () => {
  const mockConversations: Conversation[] = [
    {
      id: '1',
      name: 'Conversation 1',
      description: 'Test conversation 1',
      isActive: true,
      createdAt: 1234567890,
      updatedAt: 1234567890,
    },
    {
      id: '2',
      name: 'Conversation 2',
      description: 'Test conversation 2',
      isActive: false,
      createdAt: 1234567891,
      updatedAt: 1234567891,
    },
  ];

  const mockStoreActions = {
    conversations: mockConversations,
    loading: false,
    error: null,
    setConversations: vi.fn(),
    addConversation: vi.fn(),
    updateConversation: vi.fn(),
    removeConversation: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStore.mockReturnValue(mockStoreActions);
  });

  describe('Store Integration', () => {
    it('should use store state for conversations, loading, and error', () => {
      const { result } = renderHook(() => useConversations());

      expect(result.current.conversations).toBe(mockConversations);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should provide all expected hook methods', () => {
      const { result } = renderHook(() => useConversations());

      expect(typeof result.current.listConversations).toBe('function');
      expect(typeof result.current.getConversation).toBe('function');
      expect(typeof result.current.createConversation).toBe('function');
      expect(typeof result.current.updateConversation).toBe('function');
      expect(typeof result.current.deleteConversation).toBe('function');
    });
  });

  describe('listConversations Integration', () => {
    it('should call IPC and update store on successful list', async () => {
      const newConversations = [mockConversations[0]];
      (
        (window as any).electronAPI.dbConversationsList as ReturnType<typeof vi.fn>
      ).mockResolvedValue(newConversations);

      const { result } = renderHook(() => useConversations());

      await act(async () => {
        const response = await result.current.listConversations();
        expect(response).toEqual(newConversations);
      });

      expect((window as any).electronAPI.dbConversationsList).toHaveBeenCalled();
      expect(mockStoreActions.setConversations).toHaveBeenCalledWith(newConversations);
      expect(mockStoreActions.setLoading).toHaveBeenCalledWith(true);
      expect(mockStoreActions.setLoading).toHaveBeenCalledWith(false);
    });

    it('should handle list conversations errors', async () => {
      const error = new Error('Database error');
      (
        (window as any).electronAPI.dbConversationsList as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderHook(() => useConversations());

      await act(async () => {
        const response = await result.current.listConversations();
        expect(response).toEqual([]);
      });

      expect(mockStoreActions.setError).toHaveBeenCalledWith('Database error');
      expect(mockStoreActions.setConversations).not.toHaveBeenCalled();
    });

    it('should handle Electron API unavailability', async () => {
      // Temporarily remove electronAPI
      const originalAPI = (window as any).electronAPI;
      delete (window as any).electronAPI;

      const { result } = renderHook(() => useConversations());

      await act(async () => {
        const response = await result.current.listConversations();
        expect(response).toEqual([]);
      });

      expect(mockStoreActions.setError).toHaveBeenCalledWith('Electron API not available');

      // Restore API
      (window as any).electronAPI = originalAPI;
    });
  });

  describe('createConversation Integration', () => {
    const newConversationData: CreateConversationData = {
      name: 'New Conversation',
      description: 'Test conversation creation',
    };

    const createdConversation: Conversation = {
      id: '3',
      name: newConversationData.name,
      description: newConversationData.description ?? 'Default description',
      isActive: false,
      createdAt: 1234567892,
      updatedAt: 1234567892,
    };

    it('should create conversation and update store', async () => {
      (
        (window as any).electronAPI.dbConversationsCreate as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createdConversation);

      const { result } = renderHook(() => useConversations());

      await act(async () => {
        const response = await result.current.createConversation(newConversationData);
        expect(response).toEqual(createdConversation);
      });

      expect((window as any).electronAPI.dbConversationsCreate).toHaveBeenCalledWith(
        newConversationData,
      );
      expect(mockStoreActions.addConversation).toHaveBeenCalledWith(createdConversation);
    });
  });

  describe('updateConversation Integration', () => {
    const updateData: UpdateConversationData = { name: 'Updated Conversation' };
    const updatedConversation: Conversation = {
      ...mockConversations[0],
      ...updateData,
      updatedAt: 1234567893,
    };

    it('should update conversation via IPC and store', async () => {
      (
        (window as any).electronAPI.dbConversationsUpdate as ReturnType<typeof vi.fn>
      ).mockResolvedValue(updatedConversation);

      const { result } = renderHook(() => useConversations());

      await act(async () => {
        const response = await result.current.updateConversation('1', updateData);
        expect(response).toEqual(updatedConversation);
      });

      expect((window as any).electronAPI.dbConversationsUpdate).toHaveBeenCalledWith(
        '1',
        updateData,
      );
      expect(mockStoreActions.updateConversation).toHaveBeenCalledWith('1', updatedConversation);
    });
  });

  describe('deleteConversation Integration', () => {
    it('should delete conversation via IPC and remove from store', async () => {
      (
        (window as any).electronAPI.dbConversationsDelete as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);

      const { result } = renderHook(() => useConversations());

      await act(async () => {
        const response = await result.current.deleteConversation('1');
        expect(response).toBe(true);
      });

      expect((window as any).electronAPI.dbConversationsDelete).toHaveBeenCalledWith('1');
      expect(mockStoreActions.removeConversation).toHaveBeenCalledWith('1');
    });

    it('should return false on delete failure', async () => {
      (
        (window as any).electronAPI.dbConversationsDelete as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useConversations());

      await act(async () => {
        const response = await result.current.deleteConversation('1');
        expect(response).toBe(false);
      });

      expect(mockStoreActions.setError).toHaveBeenCalledWith('Delete failed');
      expect(mockStoreActions.removeConversation).not.toHaveBeenCalled();
    });
  });

  describe('getConversation Integration', () => {
    it('should get conversation and update store with individual conversation', async () => {
      const conversation = mockConversations[0];
      (
        (window as any).electronAPI.dbConversationsGet as ReturnType<typeof vi.fn>
      ).mockResolvedValue(conversation);

      const { result } = renderHook(() => useConversations());

      await act(async () => {
        const response = await result.current.getConversation('1');
        expect(response).toEqual(conversation);
      });

      expect((window as any).electronAPI.dbConversationsGet).toHaveBeenCalledWith('1');
      expect(mockStoreActions.updateConversation).toHaveBeenCalledWith('1', conversation);
    });
  });

  describe('Error Handling', () => {
    it('should maintain loading state consistency during errors', async () => {
      (
        (window as any).electronAPI.dbConversationsList as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useConversations());

      await act(async () => {
        await result.current.listConversations();
      });

      // Should call setLoading(true) and setLoading(false) even on error
      expect(mockStoreActions.setLoading).toHaveBeenCalledWith(true);
      expect(mockStoreActions.setLoading).toHaveBeenCalledWith(false);
      expect(mockStoreActions.setError).toHaveBeenCalledWith('Network error');
    });
  });
});
