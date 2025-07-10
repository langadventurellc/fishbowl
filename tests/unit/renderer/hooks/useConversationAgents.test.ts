/**
 * Tests for useConversationAgents hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConversationAgents } from '../../../../src/renderer/hooks/useConversationAgents';
import type { ConversationAgent } from '../../../../src/shared/types';

// Mock the window.electronAPI
const mockElectronAPI = {
  dbConversationAgentsList: vi.fn(),
  dbConversationAgentsAdd: vi.fn(),
  dbConversationAgentsRemove: vi.fn(),
};

// Mock window
global.window = {
  electronAPI: mockElectronAPI,
} as any;

describe('useConversationAgents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty conversation agents array', () => {
    const { result } = renderHook(() => useConversationAgents());

    expect(result.current.conversationAgents).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should list conversation agents successfully', async () => {
    const mockConversationAgents: ConversationAgent[] = [
      {
        conversationId: 'conv-1',
        agentId: 'agent-1',
      },
    ];

    mockElectronAPI.dbConversationAgentsList.mockResolvedValue(mockConversationAgents);

    const { result } = renderHook(() => useConversationAgents());

    await act(async () => {
      const conversationAgents = await result.current.listConversationAgents('conv-1');
      expect(conversationAgents).toEqual(mockConversationAgents);
    });

    expect(result.current.conversationAgents).toEqual(mockConversationAgents);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle listConversationAgents error', async () => {
    mockElectronAPI.dbConversationAgentsList.mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useConversationAgents());

    await act(async () => {
      const conversationAgents = await result.current.listConversationAgents('conv-1');
      expect(conversationAgents).toEqual([]);
    });

    expect(result.current.error).toBe('Database error');
    expect(result.current.loading).toBe(false);
  });

  it('should add conversation agent successfully', async () => {
    mockElectronAPI.dbConversationAgentsAdd.mockResolvedValue(undefined);

    const { result } = renderHook(() => useConversationAgents());

    await act(async () => {
      const success = await result.current.addConversationAgent('conv-1', 'agent-1');
      expect(success).toBe(true);
    });

    expect(result.current.conversationAgents).toContainEqual({
      conversationId: 'conv-1',
      agentId: 'agent-1',
    });
    expect(result.current.error).toBeNull();
  });

  it('should remove conversation agent successfully', async () => {
    mockElectronAPI.dbConversationAgentsRemove.mockResolvedValue(undefined);

    const { result } = renderHook(() => useConversationAgents());

    // Add initial state
    act(() => {
      result.current.conversationAgents.push({
        conversationId: 'conv-1',
        agentId: 'agent-1',
      });
    });

    await act(async () => {
      const success = await result.current.removeConversationAgent('conv-1', 'agent-1');
      expect(success).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle error when electronAPI is not available', async () => {
    global.window = {} as any;

    const { result } = renderHook(() => useConversationAgents());

    await act(async () => {
      const conversationAgents = await result.current.listConversationAgents('conv-1');
      expect(conversationAgents).toEqual([]);
    });

    expect(result.current.error).toBe('Electron API not available');
  });
});
