/**
 * Integration tests for useAgents hook with Zustand store
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAgents } from '../../../../src/renderer/hooks/useAgents';
import { useStore } from '../../../../src/renderer/store';
import type { Agent, CreateAgentData } from '../../../../src/shared/types';

// Mock the store
vi.mock('../../../../src/renderer/store', () => ({
  useStore: vi.fn(),
}));

// Mock window.electronAPI
(global.window as any).electronAPI = {
  dbAgentsList: vi.fn(),
  dbAgentsGet: vi.fn(),
  dbAgentsCreate: vi.fn(),
  dbAgentsUpdate: vi.fn(),
  dbAgentsDelete: vi.fn(),
};

const mockUseStore = useStore as unknown as ReturnType<typeof vi.fn>;

describe('useAgents Hook Integration', () => {
  const mockAgents: Agent[] = [
    {
      id: '1',
      name: 'Agent 1',
      role: 'assistant',
      personality: 'helpful',
      isActive: true,
      createdAt: 1234567890,
      updatedAt: 1234567890,
    },
    {
      id: '2',
      name: 'Agent 2',
      role: 'specialist',
      personality: 'analytical',
      isActive: true,
      createdAt: 1234567891,
      updatedAt: 1234567891,
    },
  ];

  const mockStoreActions = {
    agents: mockAgents,
    loading: false,
    error: null,
    setAgents: vi.fn(),
    addAgent: vi.fn(),
    updateAgent: vi.fn(),
    removeAgent: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStore.mockReturnValue(mockStoreActions);
  });

  describe('Store Integration', () => {
    it('should use store state for agents, loading, and error', () => {
      const { result } = renderHook(() => useAgents());

      expect(result.current.agents).toBe(mockAgents);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.totalCount).toBe(2);
    });

    it('should provide all expected hook methods', () => {
      const { result } = renderHook(() => useAgents());

      expect(typeof result.current.listAgents).toBe('function');
      expect(typeof result.current.getAgent).toBe('function');
      expect(typeof result.current.createAgent).toBe('function');
      expect(typeof result.current.updateAgent).toBe('function');
      expect(typeof result.current.deleteAgent).toBe('function');
      expect(typeof result.current.listAgentsPaginated).toBe('function');
      expect(typeof result.current.clearCache).toBe('function');
    });
  });

  describe('listAgents Integration', () => {
    it('should call IPC and update store on successful list', async () => {
      const newAgents = [mockAgents[0]];
      ((window as any).electronAPI.dbAgentsList as ReturnType<typeof vi.fn>).mockResolvedValue(
        newAgents,
      );

      const { result } = renderHook(() => useAgents());

      await act(async () => {
        const response = await result.current.listAgents();
        expect(response).toEqual(newAgents);
      });

      expect((window as any).electronAPI.dbAgentsList).toHaveBeenCalled();
      expect(mockStoreActions.setAgents).toHaveBeenCalledWith(newAgents);
      expect(mockStoreActions.setLoading).toHaveBeenCalledWith(true);
      expect(mockStoreActions.setLoading).toHaveBeenCalledWith(false);
    });

    it('should handle list agents errors', async () => {
      const error = new Error('Database error');
      ((window as any).electronAPI.dbAgentsList as ReturnType<typeof vi.fn>).mockRejectedValue(
        error,
      );

      const { result } = renderHook(() => useAgents());

      await act(async () => {
        const response = await result.current.listAgents();
        expect(response).toEqual([]);
      });

      expect(mockStoreActions.setError).toHaveBeenCalledWith('Database error');
      expect(mockStoreActions.setAgents).not.toHaveBeenCalled();
    });

    it('should handle Electron API unavailability', async () => {
      // Temporarily remove electronAPI
      const originalAPI = (window as any).electronAPI;
      delete (window as any).electronAPI;

      const { result } = renderHook(() => useAgents());

      await act(async () => {
        const response = await result.current.listAgents();
        expect(response).toEqual([]);
      });

      expect(mockStoreActions.setError).toHaveBeenCalledWith('Electron API not available');

      // Restore API
      (window as any).electronAPI = originalAPI;
    });
  });

  describe('createAgent Integration', () => {
    const newAgentData = {
      name: 'New Agent',
      role: 'assistant' as const,
      personality: 'friendly',
    };

    const createdAgent: Agent = {
      id: '3',
      ...newAgentData,
      isActive: true,
      createdAt: 1234567892,
      updatedAt: 1234567892,
    };

    it('should validate, create agent, and update store', async () => {
      ((window as any).electronAPI.dbAgentsCreate as ReturnType<typeof vi.fn>).mockResolvedValue(
        createdAgent,
      );

      const { result } = renderHook(() => useAgents());

      await act(async () => {
        const response = await result.current.createAgent(newAgentData);
        expect(response).toEqual(createdAgent);
      });

      expect((window as any).electronAPI.dbAgentsCreate).toHaveBeenCalledWith(newAgentData);
      expect(mockStoreActions.addAgent).toHaveBeenCalledWith(createdAgent);
    });

    it('should handle validation errors', async () => {
      const invalidData = { name: '', role: 'invalid' } as CreateAgentData;

      const { result } = renderHook(() => useAgents());

      await act(async () => {
        const response = await result.current.createAgent(invalidData);
        expect(response).toBeNull();
      });

      expect(mockStoreActions.setError).toHaveBeenCalledWith(
        expect.stringContaining('Validation failed'),
      );
      expect((window as any).electronAPI.dbAgentsCreate).not.toHaveBeenCalled();
    });
  });

  describe('updateAgent Integration', () => {
    const updateData = { name: 'Updated Agent' };
    const updatedAgent: Agent = {
      ...mockAgents[0],
      ...updateData,
      updatedAt: 1234567893,
    };

    it('should update agent via IPC and store', async () => {
      ((window as any).electronAPI.dbAgentsUpdate as ReturnType<typeof vi.fn>).mockResolvedValue(
        updatedAgent,
      );

      const { result } = renderHook(() => useAgents());

      await act(async () => {
        const response = await result.current.updateAgent('1', updateData);
        expect(response).toEqual(updatedAgent);
      });

      expect((window as any).electronAPI.dbAgentsUpdate).toHaveBeenCalledWith('1', updateData);
      expect(mockStoreActions.updateAgent).toHaveBeenCalledWith('1', updatedAgent);
    });
  });

  describe('deleteAgent Integration', () => {
    it('should delete agent via IPC and remove from store', async () => {
      ((window as any).electronAPI.dbAgentsDelete as ReturnType<typeof vi.fn>).mockResolvedValue(
        undefined,
      );

      const { result } = renderHook(() => useAgents());

      await act(async () => {
        const response = await result.current.deleteAgent('1');
        expect(response).toBe(true);
      });

      expect((window as any).electronAPI.dbAgentsDelete).toHaveBeenCalledWith('1');
      expect(mockStoreActions.removeAgent).toHaveBeenCalledWith('1');
    });

    it('should return false on delete failure', async () => {
      ((window as any).electronAPI.dbAgentsDelete as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Delete failed'),
      );

      const { result } = renderHook(() => useAgents());

      await act(async () => {
        const response = await result.current.deleteAgent('1');
        expect(response).toBe(false);
      });

      expect(mockStoreActions.setError).toHaveBeenCalledWith('Delete failed');
      expect(mockStoreActions.removeAgent).not.toHaveBeenCalled();
    });
  });

  describe('getAgent Integration', () => {
    it('should get agent and update store with individual agent', async () => {
      const agent = mockAgents[0];
      ((window as any).electronAPI.dbAgentsGet as ReturnType<typeof vi.fn>).mockResolvedValue(
        agent,
      );

      const { result } = renderHook(() => useAgents());

      await act(async () => {
        const response = await result.current.getAgent('1');
        expect(response).toEqual(agent);
      });

      expect((window as any).electronAPI.dbAgentsGet).toHaveBeenCalledWith('1');
      expect(mockStoreActions.updateAgent).toHaveBeenCalledWith('1', agent);
    });
  });

  describe('Error Handling', () => {
    it('should maintain loading state consistency during errors', async () => {
      ((window as any).electronAPI.dbAgentsList as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error'),
      );

      const { result } = renderHook(() => useAgents());

      await act(async () => {
        await result.current.listAgents();
      });

      // Should call setLoading(true) and setLoading(false) even on error
      expect(mockStoreActions.setLoading).toHaveBeenCalledWith(true);
      expect(mockStoreActions.setLoading).toHaveBeenCalledWith(false);
      expect(mockStoreActions.setError).toHaveBeenCalledWith('Network error');
    });
  });
});
