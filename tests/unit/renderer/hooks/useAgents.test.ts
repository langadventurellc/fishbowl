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

describe('useAgents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty agents array', () => {
    const { result } = renderHook(() => useAgents());

    expect(result.current.agents).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
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

    expect(result.current.agents).toEqual(mockAgents);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle listAgents error', async () => {
    mockElectronAPI.dbAgentsList.mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useAgents());

    await act(async () => {
      const agents = await result.current.listAgents();
      expect(agents).toEqual([]);
    });

    expect(result.current.error).toBe('Database error');
    expect(result.current.loading).toBe(false);
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

    expect(result.current.error).toBeNull();
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

    expect(result.current.agents).toContain(mockAgent);
    expect(result.current.error).toBeNull();
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

    // Set initial state
    act(() => {
      result.current.agents.push({
        id: '1',
        name: 'Original Agent',
        role: 'assistant',
        personality: 'helpful',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    await act(async () => {
      const agent = await result.current.updateAgent('1', updateData);
      expect(agent).toEqual(mockAgent);
    });

    expect(result.current.error).toBeNull();
  });

  it('should delete agent successfully', async () => {
    mockElectronAPI.dbAgentsDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAgents());

    await act(async () => {
      const success = await result.current.deleteAgent('1');
      expect(success).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle error when electronAPI is not available', async () => {
    global.window = {} as any;

    const { result } = renderHook(() => useAgents());

    await act(async () => {
      const agents = await result.current.listAgents();
      expect(agents).toEqual([]);
    });

    expect(result.current.error).toBe('Electron API not available');
  });
});
