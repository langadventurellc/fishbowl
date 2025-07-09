/**
 * Tests for useDatabase hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDatabase } from '../../../../src/renderer/hooks/useDatabase';

// Mock the individual hooks
vi.mock('../../../../src/renderer/hooks/useAgents', () => ({
  useAgents: vi.fn(),
}));

vi.mock('../../../../src/renderer/hooks/useConversations', () => ({
  useConversations: vi.fn(),
}));

vi.mock('../../../../src/renderer/hooks/useMessages', () => ({
  useMessages: vi.fn(),
}));

vi.mock('../../../../src/renderer/hooks/useConversationAgents', () => ({
  useConversationAgents: vi.fn(),
}));

import { useAgents } from '../../../../src/renderer/hooks/useAgents';
import { useConversations } from '../../../../src/renderer/hooks/useConversations';
import { useMessages } from '../../../../src/renderer/hooks/useMessages';
import { useConversationAgents } from '../../../../src/renderer/hooks/useConversationAgents';

describe('useDatabase', () => {
  const mockAgentsHook = {
    agents: [],
    loading: false,
    error: null,
    listAgents: vi.fn(),
    getAgent: vi.fn(),
    createAgent: vi.fn(),
    updateAgent: vi.fn(),
    deleteAgent: vi.fn(),
  };

  const mockConversationsHook = {
    conversations: [],
    loading: false,
    error: null,
    listConversations: vi.fn(),
    getConversation: vi.fn(),
    createConversation: vi.fn(),
    updateConversation: vi.fn(),
    deleteConversation: vi.fn(),
  };

  const mockMessagesHook = {
    messages: [],
    loading: false,
    error: null,
    listMessages: vi.fn(),
    getMessage: vi.fn(),
    createMessage: vi.fn(),
    deleteMessage: vi.fn(),
  };

  const mockConversationAgentsHook = {
    conversationAgents: [],
    loading: false,
    error: null,
    listConversationAgents: vi.fn(),
    addConversationAgent: vi.fn(),
    removeConversationAgent: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAgents as any).mockReturnValue(mockAgentsHook);
    (useConversations as any).mockReturnValue(mockConversationsHook);
    (useMessages as any).mockReturnValue(mockMessagesHook);
    (useConversationAgents as any).mockReturnValue(mockConversationAgentsHook);
  });

  it('should combine all database hooks', () => {
    const { result } = renderHook(() => useDatabase());

    expect(result.current.agents).toBe(mockAgentsHook);
    expect(result.current.conversations).toBe(mockConversationsHook);
    expect(result.current.messages).toBe(mockMessagesHook);
    expect(result.current.conversationAgents).toBe(mockConversationAgentsHook);
  });

  it('should memoize the result', () => {
    const { result, rerender } = renderHook(() => useDatabase());

    const firstResult = result.current;

    rerender();

    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
  });

  it('should update when hooks change', () => {
    const { result, rerender } = renderHook(() => useDatabase());

    const firstResult = result.current;

    // Change one of the hooks
    const newAgentsHook = { ...mockAgentsHook, loading: true };
    (useAgents as any).mockReturnValue(newAgentsHook);

    rerender();

    const secondResult = result.current;

    expect(firstResult).not.toBe(secondResult);
    expect(secondResult.agents).toBe(newAgentsHook);
  });
});
