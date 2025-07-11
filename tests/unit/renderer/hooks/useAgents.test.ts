/**
 * Tests for useAgents hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAgents } from '../../../../src/renderer/hooks/useAgents';
import type { Agent, CreateAgentData, UpdateAgentData } from '../../../../src/shared/types';

// Mock the window.electronAPI
const mockElectronAPI = {
  dbAgentsList: vi.fn(),
  dbAgentsGet: vi.fn(),
  dbAgentsCreate: vi.fn(),
  dbAgentsUpdate: vi.fn(),
  dbAgentsDelete: vi.fn(),
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

// Mock database utilities
vi.mock('../../../../src/renderer/utils/database/index', () => ({
  createPaginatedResult: vi.fn(),
  DatabaseCache: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  })),
  paginationToFilter: vi.fn(),
}));

// Mock validation utility
vi.mock('../../../../src/renderer/utils/validation/validateAgentData', () => ({
  validateAgentData: vi.fn(),
}));

import { useStore } from '../../../../src/renderer/store';
import { createIPCStoreBridge } from '../../../../src/renderer/store/utils';
import { validateAgentData } from '../../../../src/renderer/utils/validation/validateAgentData';

const mockUseStore = useStore as unknown as ReturnType<typeof vi.fn>;
const mockCreateIPCStoreBridge = createIPCStoreBridge as unknown as ReturnType<typeof vi.fn>;
const mockValidateAgentData = validateAgentData as unknown as ReturnType<typeof vi.fn>;

describe('useAgents', () => {
  const mockSetAgents = vi.fn();
  const mockAddAgent = vi.fn();
  const mockUpdateAgentInStore = vi.fn();
  const mockRemoveAgent = vi.fn();
  const mockSetLoading = vi.fn();
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up store mock with default state
    mockUseStore.mockReturnValue({
      agents: [],
      loading: false,
      error: null,
      setAgents: mockSetAgents,
      addAgent: mockAddAgent,
      updateAgent: mockUpdateAgentInStore,
      removeAgent: mockRemoveAgent,
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
            if (result !== undefined) {
              storeUpdater(result);
            } else {
              // For operations that return undefined (like delete), call storeUpdater with no args
              storeUpdater();
            }
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

    // Set up validation mock to return no errors by default
    mockValidateAgentData.mockReturnValue([]);
  });

  it('should initialize with empty agents array', () => {
    const { result } = renderHook(() => useAgents());

    expect(result.current.agents).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.totalCount).toBe(0);
    expect(typeof result.current.listAgents).toBe('function');
    expect(typeof result.current.getAgent).toBe('function');
    expect(typeof result.current.createAgent).toBe('function');
    expect(typeof result.current.updateAgent).toBe('function');
    expect(typeof result.current.deleteAgent).toBe('function');
    expect(typeof result.current.listAgentsPaginated).toBe('function');
    expect(typeof result.current.clearCache).toBe('function');
  });

  it('should list agents successfully', async () => {
    const mockAgents: Agent[] = [
      {
        id: '1',
        name: 'Test Agent',
        role: 'assistant',
        personality: 'helpful',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    mockElectronAPI.dbAgentsList.mockResolvedValue(mockAgents);

    const { result } = renderHook(() => useAgents());

    await act(async () => {
      const agents = await result.current.listAgents();
      expect(agents).toEqual(mockAgents);
    });

    expect(mockElectronAPI.dbAgentsList).toHaveBeenCalledWith(undefined);
    expect(mockSetAgents).toHaveBeenCalledWith(mockAgents);
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should handle listAgents error', async () => {
    mockElectronAPI.dbAgentsList.mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useAgents());

    await act(async () => {
      const agents = await result.current.listAgents();
      expect(agents).toEqual([]);
    });

    expect(mockElectronAPI.dbAgentsList).toHaveBeenCalledWith(undefined);
    expect(mockSetError).toHaveBeenCalledWith('Database error');
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should get agent successfully', async () => {
    const mockAgent: Agent = {
      id: '1',
      name: 'Test Agent',
      role: 'assistant',
      personality: 'helpful',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockElectronAPI.dbAgentsGet.mockResolvedValue(mockAgent);

    const { result } = renderHook(() => useAgents());

    await act(async () => {
      const agent = await result.current.getAgent('1');
      expect(agent).toEqual(mockAgent);
    });

    expect(mockElectronAPI.dbAgentsGet).toHaveBeenCalledWith('1');
    expect(mockUpdateAgentInStore).toHaveBeenCalledWith('1', mockAgent);
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should create agent successfully', async () => {
    const createData: CreateAgentData = {
      name: 'New Agent',
      role: 'assistant',
      personality: 'helpful',
    };

    const mockAgent: Agent = {
      id: '1',
      ...createData,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockElectronAPI.dbAgentsCreate.mockResolvedValue(mockAgent);

    const { result } = renderHook(() => useAgents());

    await act(async () => {
      const agent = await result.current.createAgent(createData);
      expect(agent).toEqual(mockAgent);
    });

    expect(mockValidateAgentData).toHaveBeenCalledWith(createData);
    expect(mockElectronAPI.dbAgentsCreate).toHaveBeenCalledWith(createData);
    expect(mockAddAgent).toHaveBeenCalledWith(mockAgent);
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should update agent successfully', async () => {
    const updateData: UpdateAgentData = {
      name: 'Updated Agent',
    };

    const mockAgent: Agent = {
      id: '1',
      name: 'Updated Agent',
      role: 'assistant',
      personality: 'helpful',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockElectronAPI.dbAgentsUpdate.mockResolvedValue(mockAgent);

    const { result } = renderHook(() => useAgents());

    await act(async () => {
      const agent = await result.current.updateAgent('1', updateData);
      expect(agent).toEqual(mockAgent);
    });

    expect(mockElectronAPI.dbAgentsUpdate).toHaveBeenCalledWith('1', updateData);
    expect(mockUpdateAgentInStore).toHaveBeenCalledWith('1', mockAgent);
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should delete agent successfully', async () => {
    mockElectronAPI.dbAgentsDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAgents());

    await act(async () => {
      const success = await result.current.deleteAgent('1');
      expect(success).toBe(true);
    });

    expect(mockElectronAPI.dbAgentsDelete).toHaveBeenCalledWith('1');
    expect(mockRemoveAgent).toHaveBeenCalledWith('1');
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should handle error when electronAPI is not available', async () => {
    // Temporarily remove electronAPI to test error handling
    const originalWindow = global.window;
    global.window = {} as any;

    const { result } = renderHook(() => useAgents());

    await act(async () => {
      const agents = await result.current.listAgents();
      expect(agents).toEqual([]);
    });

    expect(mockSetError).toHaveBeenCalledWith('Electron API not available');

    // Restore original window
    global.window = originalWindow;
  });
});
