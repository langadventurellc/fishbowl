/**
 * Tests for agent slice functionality and selectors
 *
 * Uses Zustand's recommended testing approach with automatic store reset
 * between tests to ensure proper test isolation.
 */

import { describe, expect, it } from 'vitest';
import { useStore } from '../../../../../src/renderer/store';
import {
  selectActiveAgentCount,
  selectActiveAgentObjects,
  selectActiveAgents,
  selectAddAgent,
  selectAgentById,
  selectAgentCount,
  selectAgentError,
  selectAgentLoading,
  selectAgentMetadata,
  selectAgents,
  selectAgentsInConversation,
  selectAgentState,
  selectAgentStatuses,
  selectCacheValid,
  selectLastFetch,
  selectOnlineAgentCount,
  selectOnlineAgents,
  selectSetAgents,
} from '../../../../../src/renderer/store/selectors';
import type { Agent, AgentMetadata, AgentStatus } from '../../../../../src/renderer/store/types';

/**
 * Create mock agent for testing
 */
const createMockAgent = (id: string, overrides: Partial<Agent> = {}): Agent => ({
  id,
  name: `Agent ${id}`,
  role: 'assistant',
  personality: 'helpful',
  isActive: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

/**
 * Create mock agent status for testing
 */
const createMockAgentStatus = (id: string, overrides: Partial<AgentStatus> = {}): AgentStatus => ({
  id,
  isOnline: false,
  lastActivity: Date.now(),
  currentConversations: [],
  participationCount: 0,
  ...overrides,
});

/**
 * Create mock agent metadata for testing
 */
const createMockAgentMetadata = (
  id: string,
  overrides: Partial<AgentMetadata> = {},
): AgentMetadata => ({
  id,
  lastUpdated: Date.now(),
  cacheExpiry: Date.now() + 300000, // 5 minutes
  conversationHistory: [],
  messageCount: 0,
  averageResponseTime: 0,
  ...overrides,
});

describe('Agent Slice Tests', () => {
  // Store is automatically reset between tests by the Zustand mock

  describe('Basic Data Selectors', () => {
    it('should select agents correctly', () => {
      const mockAgents = [createMockAgent('1'), createMockAgent('2')];
      useStore.getState().setAgents(mockAgents);

      const state = useStore.getState();
      expect(selectAgents(state)).toEqual(mockAgents);
    });

    it('should select empty agents array initially', () => {
      const state = useStore.getState();
      expect(selectAgents(state)).toEqual([]);
    });

    it('should select active agent IDs correctly', () => {
      const agents = [createMockAgent('1'), createMockAgent('2')];
      const activeAgentIds = ['1', '2'];

      useStore.getState().setAgents(agents);
      useStore.getState().setActiveAgents(activeAgentIds);

      const state = useStore.getState();
      expect(selectActiveAgents(state)).toEqual(activeAgentIds);
    });

    it('should select empty active agents array initially', () => {
      const state = useStore.getState();
      expect(selectActiveAgents(state)).toEqual([]);
    });

    it('should select agent loading state correctly', () => {
      useStore.getState().setLoading(true);

      const state = useStore.getState();
      expect(selectAgentLoading(state)).toBe(true);
    });

    it('should select agent loading state as false initially', () => {
      const state = useStore.getState();
      expect(selectAgentLoading(state)).toBe(false);
    });

    it('should select agent error state correctly', () => {
      const errorMessage = 'Test error';
      useStore.getState().setError(errorMessage);

      const state = useStore.getState();
      expect(selectAgentError(state)).toBe(errorMessage);
    });

    it('should select agent error state as null initially', () => {
      const state = useStore.getState();
      expect(selectAgentError(state)).toBeNull();
    });
  });

  describe('Computed Selectors', () => {
    it('should select active agent objects correctly', () => {
      const agents = [createMockAgent('1'), createMockAgent('2'), createMockAgent('3')];
      const activeAgentIds = ['1', '3'];

      useStore.getState().setAgents(agents);
      useStore.getState().setActiveAgents(activeAgentIds);

      const state = useStore.getState();
      const activeAgentObjects = selectActiveAgentObjects(state);

      expect(activeAgentObjects).toHaveLength(2);
      expect(activeAgentObjects.map(a => a.id)).toEqual(['1', '3']);
    });

    it('should return empty array when no active agents', () => {
      const agents = [createMockAgent('1'), createMockAgent('2')];
      useStore.getState().setAgents(agents);

      const state = useStore.getState();
      expect(selectActiveAgentObjects(state)).toEqual([]);
    });

    it('should select online agents correctly', () => {
      const agents = [createMockAgent('1'), createMockAgent('2'), createMockAgent('3')];

      useStore.getState().setAgents(agents);
      useStore.getState().setAgentStatus('1', { isOnline: true });
      useStore.getState().setAgentStatus('2', { isOnline: false });
      useStore.getState().setAgentStatus('3', { isOnline: true });

      const state = useStore.getState();
      const onlineAgents = selectOnlineAgents(state);

      expect(onlineAgents).toHaveLength(2);
      expect(onlineAgents.map(a => a.id)).toEqual(['1', '3']);
    });

    it('should return empty array when no agents are online', () => {
      const agents = [createMockAgent('1'), createMockAgent('2')];
      useStore.getState().setAgents(agents);
      // Set agents explicitly offline
      useStore.getState().setAgentStatus('1', { isOnline: false });
      useStore.getState().setAgentStatus('2', { isOnline: false });

      const state = useStore.getState();
      expect(selectOnlineAgents(state)).toEqual([]);
    });

    it('should handle agents with default status when selecting online agents', () => {
      const agents = [createMockAgent('1'), createMockAgent('2')];
      useStore.getState().setAgents(agents);
      // Agents automatically get default status with isOnline: false

      const state = useStore.getState();
      expect(selectOnlineAgents(state)).toEqual([]);
    });
  });

  describe('Count Selectors', () => {
    it('should select correct agent count', () => {
      const agents = [createMockAgent('1'), createMockAgent('2'), createMockAgent('3')];
      useStore.getState().setAgents(agents);

      const state = useStore.getState();
      expect(selectAgentCount(state)).toBe(3);
    });

    it('should return zero for empty agents array', () => {
      const state = useStore.getState();
      expect(selectAgentCount(state)).toBe(0);
    });

    it('should select correct active agent count', () => {
      const agents = [
        createMockAgent('1'),
        createMockAgent('2'),
        createMockAgent('3'),
        createMockAgent('4'),
      ];
      const activeAgentIds = ['1', '2', '3', '4'];

      useStore.getState().setAgents(agents);
      useStore.getState().setActiveAgents(activeAgentIds);

      const state = useStore.getState();
      expect(selectActiveAgentCount(state)).toBe(4);
    });

    it('should return zero for no active agents', () => {
      const state = useStore.getState();
      expect(selectActiveAgentCount(state)).toBe(0);
    });

    it('should select correct online agent count', () => {
      const agents = [
        createMockAgent('1'),
        createMockAgent('2'),
        createMockAgent('3'),
        createMockAgent('4'),
      ];

      useStore.getState().setAgents(agents);
      useStore.getState().setAgentStatus('1', { isOnline: true });
      useStore.getState().setAgentStatus('2', { isOnline: false });
      useStore.getState().setAgentStatus('3', { isOnline: true });
      useStore.getState().setAgentStatus('4', { isOnline: true });

      const state = useStore.getState();
      expect(selectOnlineAgentCount(state)).toBe(3);
    });

    it('should return zero when no agents are online', () => {
      const agents = [createMockAgent('1'), createMockAgent('2')];
      useStore.getState().setAgents(agents);
      // Set agents explicitly offline
      useStore.getState().setAgentStatus('1', { isOnline: false });
      useStore.getState().setAgentStatus('2', { isOnline: false });

      const state = useStore.getState();
      expect(selectOnlineAgentCount(state)).toBe(0);
    });
  });

  describe('Parameterized Selectors', () => {
    it('should select agent by ID correctly', () => {
      const agents = [
        createMockAgent('1', { name: 'Agent One' }),
        createMockAgent('2', { name: 'Agent Two' }),
      ];
      useStore.getState().setAgents(agents);

      const state = useStore.getState();
      const agent = selectAgentById('1')(state);

      expect(agent).not.toBeNull();
      expect(agent?.id).toBe('1');
      expect(agent?.name).toBe('Agent One');
    });

    it('should return null for non-existent agent ID', () => {
      const agents = [createMockAgent('1')];
      useStore.getState().setAgents(agents);

      const state = useStore.getState();
      const agent = selectAgentById('999')(state);

      expect(agent).toBeNull();
    });

    it('should return null when searching empty agents array', () => {
      const state = useStore.getState();
      const agent = selectAgentById('1')(state);

      expect(agent).toBeNull();
    });

    it('should select agents in conversation correctly', () => {
      const agents = [createMockAgent('1'), createMockAgent('2'), createMockAgent('3')];
      const conversationId = 'conv-123';

      useStore.getState().setAgents(agents);
      useStore.getState().setAgentStatus('1', { currentConversations: [conversationId] });
      useStore.getState().setAgentStatus('2', { currentConversations: ['other-conv'] });
      useStore
        .getState()
        .setAgentStatus('3', { currentConversations: [conversationId, 'other-conv'] });

      const state = useStore.getState();
      const agentsInConversation = selectAgentsInConversation(conversationId)(state);

      expect(agentsInConversation).toHaveLength(2);
      expect(agentsInConversation.map(a => a.id)).toEqual(['1', '3']);
    });

    it('should return empty array when no agents in conversation', () => {
      const agents = [createMockAgent('1'), createMockAgent('2')];
      useStore.getState().setAgents(agents);
      // Agents have default status with empty currentConversations array
      // The selector checks if currentConversations includes the specific conversation ID
      // Since the default status has an empty array, it should return empty

      const state = useStore.getState();
      const agentsInConversation = selectAgentsInConversation('conv-123')(state);

      expect(agentsInConversation).toEqual([]);
    });

    it('should handle agents without status when selecting by conversation', () => {
      const agents = [createMockAgent('1'), createMockAgent('2')];
      useStore.getState().setAgents(agents);
      // Agents automatically get default status with empty currentConversations array
      // The selector should return empty since no agents are in the specific conversation

      const state = useStore.getState();
      const agentsInConversation = selectAgentsInConversation('conv-123')(state);

      expect(agentsInConversation).toEqual([]);
    });
  });

  describe('Status and Metadata Selectors', () => {
    it('should select agent statuses correctly', () => {
      const status1 = createMockAgentStatus('1', { isOnline: true });
      const status2 = createMockAgentStatus('2', { isOnline: false });

      useStore.getState().setAgentStatus('1', status1);
      useStore.getState().setAgentStatus('2', status2);

      const state = useStore.getState();
      const statuses = selectAgentStatuses(state);

      expect(statuses['1']).toMatchObject({ id: '1', isOnline: true });
      expect(statuses['2']).toMatchObject({ id: '2', isOnline: false });
    });

    it('should select empty agent statuses when no agents exist', () => {
      // Store is automatically reset to initial state before each test
      const state = useStore.getState();
      expect(selectAgentStatuses(state)).toEqual({});
    });

    it('should select agent metadata correctly', () => {
      const metadata1 = createMockAgentMetadata('1', { messageCount: 10 });
      const metadata2 = createMockAgentMetadata('2', { messageCount: 5 });

      useStore.getState().setAgentMetadata('1', metadata1);
      useStore.getState().setAgentMetadata('2', metadata2);

      const state = useStore.getState();
      const metadata = selectAgentMetadata(state);

      expect(metadata['1']).toMatchObject({ id: '1', messageCount: 10 });
      expect(metadata['2']).toMatchObject({ id: '2', messageCount: 5 });
    });

    it('should select empty agent metadata when no agents exist', () => {
      // Store is automatically reset to initial state before each test
      const state = useStore.getState();
      expect(selectAgentMetadata(state)).toEqual({});
    });
  });

  describe('Cache Selectors', () => {
    it('should select cache validity correctly', () => {
      // Set cache as valid
      useStore.getState().setAgents([createMockAgent('1')]);

      const state = useStore.getState();
      expect(selectCacheValid(state)).toBe(true);
    });

    it('should select cache as invalid initially', () => {
      const state = useStore.getState();
      expect(selectCacheValid(state)).toBe(false);
    });

    it('should select last fetch timestamp correctly', () => {
      const agents = [createMockAgent('1')];
      useStore.getState().setAgents(agents);

      const state = useStore.getState();
      const lastFetch = selectLastFetch(state);

      expect(lastFetch).toBeTypeOf('number');
      expect(lastFetch).toBeGreaterThan(0);
    });

    it('should select last fetch as null initially', () => {
      const state = useStore.getState();
      expect(selectLastFetch(state)).toBeNull();
    });
  });

  describe('Action Selectors', () => {
    it('should select setAgents action function', () => {
      const state = useStore.getState();
      const setAgentsAction = selectSetAgents(state);

      expect(setAgentsAction).toBeTypeOf('function');
      expect(setAgentsAction).toBe(state.setAgents);
    });

    it('should select addAgent action function', () => {
      const state = useStore.getState();
      const addAgentAction = selectAddAgent(state);

      expect(addAgentAction).toBeTypeOf('function');
      expect(addAgentAction).toBe(state.addAgent);
    });
  });

  describe('Comprehensive State Selector', () => {
    it('should select complete agent state and actions', () => {
      const agents = [createMockAgent('1')];
      const activeAgents = ['1'];

      useStore.getState().setAgents(agents);
      useStore.getState().setActiveAgents(activeAgents);
      useStore.getState().setLoading(true);
      useStore.getState().setError('test error');

      const state = useStore.getState();
      const agentState = selectAgentState(state);

      // Verify state properties
      expect(agentState.agents).toEqual(agents);
      expect(agentState.activeAgents).toEqual(activeAgents);
      expect(agentState.loading).toBe(true);
      expect(agentState.error).toBe('test error');
      // agentStatuses and agentMetadata are auto-created for agents
      expect(Object.keys(agentState.agentStatuses as Record<string, unknown>)).toContain('1');
      expect(Object.keys(agentState.agentMetadata as Record<string, unknown>)).toContain('1');
      expect(agentState.cacheValid).toBe(true);
      expect(agentState.lastFetch).toBeTypeOf('number');

      // Verify action functions are included
      expect(agentState.setAgents).toBeTypeOf('function');
      expect(agentState.addAgent).toBeTypeOf('function');
      expect(agentState.updateAgent).toBeTypeOf('function');
      expect(agentState.removeAgent).toBeTypeOf('function');
      expect(agentState.setActiveAgents).toBeTypeOf('function');
      expect(agentState.addActiveAgent).toBeTypeOf('function');
      expect(agentState.removeActiveAgent).toBeTypeOf('function');
      expect(agentState.setAgentStatus).toBeTypeOf('function');
      expect(agentState.updateAgentParticipation).toBeTypeOf('function');
      expect(agentState.setAgentOnlineStatus).toBeTypeOf('function');
      expect(agentState.setAgentMetadata).toBeTypeOf('function');
      expect(agentState.updateAgentActivity).toBeTypeOf('function');
      expect(agentState.clearAgentCache).toBeTypeOf('function');
      expect(agentState.refreshAgentData).toBeTypeOf('function');
      expect(agentState.setLoading).toBeTypeOf('function');
      expect(agentState.setError).toBeTypeOf('function');
      expect(agentState.clearError).toBeTypeOf('function');
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle rapid agent updates without race conditions', () => {
      const agent1 = createMockAgent('1', { name: 'Agent 1' });
      const agent2 = createMockAgent('1', { name: 'Agent 1 Updated' });

      useStore.getState().addAgent(agent1);
      useStore.getState().addAgent(agent2);

      const state = useStore.getState();
      const agents = selectAgents(state);

      expect(agents).toHaveLength(1);
      expect(agents[0].name).toBe('Agent 1 Updated');
    });

    it('should handle empty string IDs gracefully', () => {
      const agents = [createMockAgent('1'), createMockAgent('2')];
      useStore.getState().setAgents(agents);

      const state = useStore.getState();
      const agent = selectAgentById('')(state);

      expect(agent).toBeNull();
    });

    it('should handle null conversation IDs in agent status', () => {
      const agents = [createMockAgent('1')];
      useStore.getState().setAgents(agents);
      useStore.getState().setAgentStatus('1', { currentConversations: [] });

      const state = useStore.getState();
      const agentsInConversation = selectAgentsInConversation('any-id')(state);

      expect(agentsInConversation).toEqual([]);
    });

    it('should handle large datasets efficiently', () => {
      // Create 100 agents
      const largeAgentArray = Array.from({ length: 100 }, (_, i) =>
        createMockAgent(`agent-${i}`, { name: `Agent ${i}` }),
      );

      const startTime = performance.now();
      useStore.getState().setAgents(largeAgentArray);

      const state = useStore.getState();
      const agents = selectAgents(state);
      const agentCount = selectAgentCount(state);
      const endTime = performance.now();

      expect(agents).toHaveLength(100);
      expect(agentCount).toBe(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle concurrent active agent operations', () => {
      const agents = [createMockAgent('1'), createMockAgent('2'), createMockAgent('3')];

      useStore.getState().setAgents(agents);
      useStore.getState().setActiveAgents(['1', '2']);
      useStore.getState().addActiveAgent('3');
      useStore.getState().removeActiveAgent('1');

      const state = useStore.getState();
      const activeAgents = selectActiveAgents(state);
      const activeAgentObjects = selectActiveAgentObjects(state);

      expect(activeAgents).toEqual(['2', '3']);
      expect(activeAgentObjects).toHaveLength(2);
      expect(activeAgentObjects.map(a => a.id)).toEqual(['2', '3']);
    });

    it('should handle agent removal and active agent cleanup', () => {
      const agents = [createMockAgent('1'), createMockAgent('2')];

      useStore.getState().setAgents(agents);
      useStore.getState().setActiveAgents(['1', '2']);
      useStore.getState().removeAgent('1');

      const state = useStore.getState();
      const remainingAgents = selectAgents(state);
      const activeAgentObjects = selectActiveAgentObjects(state);

      expect(remainingAgents).toHaveLength(1);
      expect(remainingAgents[0].id).toBe('2');
      expect(activeAgentObjects).toHaveLength(1);
      expect(activeAgentObjects[0].id).toBe('2');
    });
  });

  describe('Performance and Stress Tests', () => {
    it('should handle frequent selector calls efficiently', () => {
      const agents = Array.from({ length: 50 }, (_, i) => createMockAgent(`${i}`));
      useStore.getState().setAgents(agents);

      const state = useStore.getState();
      const startTime = performance.now();

      // Call selectors multiple times
      for (let i = 0; i < 1000; i++) {
        selectAgents(state);
        selectAgentCount(state);
        selectActiveAgentObjects(state);
        selectOnlineAgents(state);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500); // Should complete in under 500ms
    });

    it('should handle complex filtering operations efficiently', () => {
      const agents = Array.from({ length: 200 }, (_, i) => createMockAgent(`${i}`));
      useStore.getState().setAgents(agents);

      // Set up complex status patterns
      agents.forEach((agent, index) => {
        useStore.getState().setAgentStatus(agent.id, {
          isOnline: index % 3 === 0,
          currentConversations: index % 2 === 0 ? ['conv-1'] : ['conv-2'],
        });
      });

      const state = useStore.getState();
      const startTime = performance.now();

      const onlineAgents = selectOnlineAgents(state);
      const agentsInConv1 = selectAgentsInConversation('conv-1')(state);
      const agentsInConv2 = selectAgentsInConversation('conv-2')(state);
      const onlineCount = selectOnlineAgentCount(state);

      const endTime = performance.now();

      expect(onlineAgents.length).toBeGreaterThan(0);
      expect(agentsInConv1.length).toBeGreaterThan(0);
      expect(agentsInConv2.length).toBeGreaterThan(0);
      expect(onlineCount).toBe(onlineAgents.length);
      expect(endTime - startTime).toBeLessThan(200); // Should complete in under 200ms
    });
  });
});
