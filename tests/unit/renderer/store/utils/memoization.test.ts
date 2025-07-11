/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppState } from '../../../../../src/renderer/store/types';
import {
  SelectorPerformanceMonitor,
  createArraySelector,
  createCountSelector,
  createFindByIdSelector,
  createMemoizedSelector,
  createParameterizedSelector,
  getPerformanceMonitor,
  shallowEqual,
} from '../../../../../src/renderer/store/utils/memoization';

// Helper type for memoized selectors with methods
type MemoizedSelector<T> = ((state: AppState) => T) & {
  getMetrics(): any;
  clearCache(): void;
  getCacheSize(): number;
  getCacheHitRatio(): number;
};

// Helper type for array selectors with methods
type ArraySelector<T> = ((state: AppState) => T[]) & {
  getMetrics(): any;
  clearCache(): void;
  getCacheSize(): number;
};

// Helper type for parameterized selectors with methods
type ParameterizedSelector<P, T> = ((param: P) => (state: AppState) => T) & {
  getMetrics(): any;
  clearCache(): void;
  getCacheSize(): number;
};

// Mock AppState for testing
const createMockState = (overrides: Partial<AppState> = {}): AppState => ({
  // Theme slice
  theme: 'light',
  systemTheme: 'light',
  effectiveTheme: 'light',
  setTheme: vi.fn(),
  toggleTheme: vi.fn(),
  updateSystemTheme: vi.fn(),

  // UI slice
  sidebarCollapsed: false,
  activeModal: null,
  windowDimensions: { width: 1200, height: 800 },
  layoutPreferences: {
    sidebarWidth: 0,
    mainContentHeight: 0,
  },
  setSidebarCollapsed: vi.fn(),
  toggleSidebar: vi.fn(),
  setActiveModal: vi.fn(),
  setWindowDimensions: vi.fn(),
  setLayoutPreferences: vi.fn(),

  // Settings slice
  preferences: {
    autoSave: false,
    defaultProvider: '',
    maxConversationHistory: 0,
    enableNotifications: false,
  },
  configuration: {
    debugMode: false,
    performanceMode: false,
    experimentalFeatures: false,
  },
  setPreferences: vi.fn(),
  setConfiguration: vi.fn(),
  resetSettings: vi.fn(),

  // Agent slice
  agents: [],
  activeAgents: [],
  agentStatuses: {},
  agentMetadata: {},
  loading: false,
  error: null,
  cacheValid: false,
  lastFetch: 0,
  setAgents: vi.fn(),
  addAgent: vi.fn(),
  updateAgent: vi.fn(),
  removeAgent: vi.fn(),
  setActiveAgents: vi.fn(),
  addActiveAgent: vi.fn(),
  removeActiveAgent: vi.fn(),
  setAgentStatus: vi.fn(),
  updateAgentParticipation: vi.fn(),
  setAgentOnlineStatus: vi.fn(),
  setAgentMetadata: vi.fn(),
  updateAgentActivity: vi.fn(),
  clearAgentCache: vi.fn(),
  refreshAgentData: vi.fn(),
  setLoading: vi.fn(),
  setError: vi.fn(),
  clearError: vi.fn(),

  // Conversation slice
  conversations: [],
  activeConversationId: null,
  // Note: conversation slice has its own loading and error properties
  // but they conflict with agent slice properties, so using specific names
  setConversations: vi.fn(),
  addConversation: vi.fn(),
  updateConversation: vi.fn(),
  removeConversation: vi.fn(),
  setActiveConversation: vi.fn(),

  ...overrides,
});

describe('Memoization Utilities', () => {
  let mockState: AppState;

  beforeEach(() => {
    mockState = createMockState();
    // Reset performance monitor
    getPerformanceMonitor().disable();
    getPerformanceMonitor().resetMetrics();
  });

  afterEach(() => {
    getPerformanceMonitor().disable();
  });

  describe('shallowEqual', () => {
    it('should return true for identical values', () => {
      expect(shallowEqual(5, 5)).toBe(true);
      expect(shallowEqual('test', 'test')).toBe(true);
      expect(shallowEqual(null, null)).toBe(true);
      expect(shallowEqual(undefined, undefined)).toBe(true);
    });

    it('should return false for different primitive values', () => {
      expect(shallowEqual(5, 6)).toBe(false);
      expect(shallowEqual('test', 'other')).toBe(false);
      expect(shallowEqual(null, undefined)).toBe(false);
    });

    it('should compare arrays shallowly', () => {
      expect(shallowEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(shallowEqual([], [])).toBe(true);
      expect(shallowEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(shallowEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('should compare objects shallowly', () => {
      expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(shallowEqual({}, {})).toBe(true);
      expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
      expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    });

    it('should return false for nested objects with different values', () => {
      const obj1 = { a: { nested: 1 } };
      const obj2 = { a: { nested: 1 } };
      expect(shallowEqual(obj1, obj2)).toBe(false); // Different object references
    });
  });

  describe('createMemoizedSelector', () => {
    it('should memoize selector results', () => {
      const mockSelector = vi.fn((state: AppState) => state.agents.length);
      const memoizedSelector = createMemoizedSelector(mockSelector);

      // First call
      const result1 = memoizedSelector(mockState);
      expect(mockSelector).toHaveBeenCalledTimes(1);
      expect(result1).toBe(0);

      // Second call with same state
      const result2 = memoizedSelector(mockState);
      expect(mockSelector).toHaveBeenCalledTimes(1); // Should not call again
      expect(result2).toBe(0);

      // Call with different state
      const newState = createMockState({
        agents: [
          {
            id: '1',
            name: 'Agent 1',
            role: 'assistant',
            personality: 'helpful',
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      });
      const result3 = memoizedSelector(newState);
      expect(mockSelector).toHaveBeenCalledTimes(2); // Should call again
      expect(result3).toBe(1);
    });

    it('should use fallback value for undefined results', () => {
      const mockSelector = vi.fn(() => undefined);
      const memoizedSelector = createMemoizedSelector(mockSelector, { fallbackValue: 'fallback' });

      const result = memoizedSelector(mockState);
      expect(result).toBe('fallback');
    });

    it('should track performance metrics when enabled', () => {
      const mockSelector = vi.fn((state: AppState) => state.agents.length);
      const memoizedSelector = createMemoizedSelector(mockSelector, {
        enablePerformanceMonitoring: true,
      }) as MemoizedSelector<number>;

      memoizedSelector(mockState);
      memoizedSelector(mockState); // Cache hit

      const metrics = memoizedSelector.getMetrics();
      expect(metrics.totalCalls).toBe(2);
      expect(metrics.cacheHits).toBe(1);
      expect(metrics.cacheMisses).toBe(1);
    });

    it('should clear cache and reset metrics', () => {
      const mockSelector = vi.fn((state: AppState) => state.agents.length);
      const memoizedSelector = createMemoizedSelector(mockSelector) as MemoizedSelector<number>;

      memoizedSelector(mockState);
      expect(memoizedSelector.getCacheSize()).toBe(1);

      memoizedSelector.clearCache();
      expect(memoizedSelector.getCacheSize()).toBe(0);

      const metrics = memoizedSelector.getMetrics();
      expect(metrics.totalCalls).toBe(0);
    });
  });

  describe('createArraySelector', () => {
    it('should memoize array results with shallow equality', () => {
      const agents = [
        {
          id: '1',
          name: 'Agent 1',
          role: 'assistant' as const,
          personality: 'helpful',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: '2',
          name: 'Agent 2',
          role: 'user' as const,
          personality: 'curious',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const state1 = createMockState({ agents, activeAgents: ['1'] });
      const state2 = createMockState({ agents, activeAgents: ['1'] }); // Same data, different state object

      const mockSelector = vi.fn((state: AppState) =>
        state.agents.filter(agent => state.activeAgents.includes(agent.id)),
      );

      const arraySelector = createArraySelector(mockSelector);

      const result1 = arraySelector(state1);
      const result2 = arraySelector(state2);

      expect(mockSelector).toHaveBeenCalledTimes(2); // Called for each state
      expect(result1).toEqual(result2);
      expect(result1).toBe(result2); // Should return same reference due to memoization
    });

    it('should return stable empty array reference', () => {
      const mockSelector = vi.fn(() => []);
      const arraySelector = createArraySelector(mockSelector);

      const result1 = arraySelector(mockState);
      const result2 = arraySelector(createMockState());

      expect(result1).toBe(result2); // Same reference for empty arrays
      expect(result1).toEqual([]);
    });

    it('should track cache hit ratio', () => {
      const mockSelector = vi.fn(() => []);
      const arraySelector = createArraySelector(mockSelector, {
        enablePerformanceMonitoring: true,
      }) as ArraySelector<never>;

      arraySelector(mockState);
      arraySelector(mockState); // Cache hit

      const metrics = arraySelector.getMetrics();
      expect(metrics.cacheHitRatio).toBe(50); // 1 hit out of 2 calls
    });
  });

  describe('createCountSelector', () => {
    it('should memoize count calculations', () => {
      const agents = [
        {
          id: '1',
          name: 'Agent 1',
          role: 'assistant' as const,
          personality: 'helpful',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: '2',
          name: 'Agent 2',
          role: 'user' as const,
          personality: 'curious',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const agentStatuses = {
        '1': {
          id: '1',
          isOnline: true,
          currentConversations: [],
          lastSeen: Date.now(),
          lastActivity: Date.now(),
          participationCount: 0,
        },
        '2': {
          id: '2',
          isOnline: false,
          currentConversations: [],
          lastSeen: Date.now(),
          lastActivity: Date.now(),
          participationCount: 0,
        },
      };

      const mockGetArray = vi.fn((state: AppState) => state.agents);
      const mockPredicate = vi.fn((agent: any, state: AppState) => {
        const status = state.agentStatuses[agent.id];
        return status?.isOnline ?? false;
      });

      const countSelector = createCountSelector(mockGetArray, mockPredicate);

      const state = createMockState({ agents, agentStatuses });

      // First call
      const result1 = countSelector(state);
      expect(result1).toBe(1); // Only one agent is online
      expect(mockGetArray).toHaveBeenCalledTimes(1);
      expect(mockPredicate).toHaveBeenCalledTimes(2);

      // Second call with same state
      const result2 = countSelector(state);
      expect(result2).toBe(1);
      expect(mockGetArray).toHaveBeenCalledTimes(1); // Should not call again
      expect(mockPredicate).toHaveBeenCalledTimes(2); // Should not call again
    });

    it('should count array length without predicate', () => {
      const agents = [
        {
          id: '1',
          name: 'Agent 1',
          role: 'assistant' as const,
          personality: 'helpful',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: '2',
          name: 'Agent 2',
          role: 'user' as const,
          personality: 'curious',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const countSelector = createCountSelector((state: AppState) => state.agents);
      const state = createMockState({ agents });

      const result = countSelector(state);
      expect(result).toBe(2);
    });
  });

  describe('createParameterizedSelector', () => {
    it('should cache results for different parameter combinations', () => {
      const mockSelectorFactory = vi.fn(
        (id: string) => (state: AppState) => state.agents.find(agent => agent.id === id),
      );

      const parameterizedSelector = createParameterizedSelector(mockSelectorFactory);

      const agents = [
        {
          id: '1',
          name: 'Agent 1',
          role: 'assistant' as const,
          personality: 'helpful',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: '2',
          name: 'Agent 2',
          role: 'user' as const,
          personality: 'curious',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const state = createMockState({ agents });

      // Test different parameters
      const selector1 = parameterizedSelector('1');
      const selector2 = parameterizedSelector('2');
      const selector3 = parameterizedSelector('1'); // Same as first

      const result1 = selector1(state);
      const result2 = selector2(state);
      const result3 = selector3(state);

      expect(result1?.id).toBe('1');
      expect(result2?.id).toBe('2');
      expect(result3?.id).toBe('1');

      // Factory should be called for each unique parameter combination
      expect(mockSelectorFactory).toHaveBeenCalledTimes(2); // Only '1' and '2', not the duplicate '1'
    });

    it('should track cache statistics', () => {
      const mockSelectorFactory = vi.fn((id: string) => (_state: AppState) => id);
      const parameterizedSelector = createParameterizedSelector(mockSelectorFactory, {
        enablePerformanceMonitoring: true,
      }) as ParameterizedSelector<string, string>;

      const selector1 = parameterizedSelector('test1');
      const selector2 = parameterizedSelector('test2');

      selector1(mockState);
      selector2(mockState);
      selector1(mockState); // Cache hit

      const metrics = parameterizedSelector.getMetrics();
      expect(metrics.totalCalls).toBe(3);
      expect(metrics.cacheHits).toBe(1);
      expect(metrics.uniqueParameterCombinations).toBe(2);
    });

    it('should maintain cache size limit', () => {
      const mockSelectorFactory = vi.fn((id: string) => () => id);
      const parameterizedSelector = createParameterizedSelector(mockSelectorFactory, {
        maxCacheSize: 2,
      }) as ParameterizedSelector<string, string>;

      // Create more selectors than cache limit
      for (let i = 0; i < 5; i++) {
        const selector = parameterizedSelector(`test${i}`);
        selector(mockState);
      }

      expect(parameterizedSelector.getCacheSize()).toBe(2); // Should not exceed limit
    });
  });

  describe('createFindByIdSelector', () => {
    it('should find items by ID with memoization', () => {
      const agents = [
        {
          id: '1',
          name: 'Agent 1',
          role: 'assistant' as const,
          personality: 'helpful',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: '2',
          name: 'Agent 2',
          role: 'user' as const,
          personality: 'curious',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const findByIdSelector = createFindByIdSelector((state: AppState) => state.agents);
      const state = createMockState({ agents });

      const selector1 = findByIdSelector('1');
      const selector2 = findByIdSelector('2');
      const selector3 = findByIdSelector('nonexistent');

      const result1 = selector1(state);
      const result2 = selector2(state);
      const result3 = selector3(state);

      expect(result1?.id).toBe('1');
      expect(result2?.id).toBe('2');
      expect(result3).toBeUndefined();
    });
  });

  describe('SelectorPerformanceMonitor', () => {
    it('should be a singleton', () => {
      const monitor1 = SelectorPerformanceMonitor.getInstance();
      const monitor2 = SelectorPerformanceMonitor.getInstance();
      expect(monitor1).toBe(monitor2);
    });

    it('should register and unregister selectors', () => {
      const monitor = getPerformanceMonitor();
      const mockSelector = {
        getMetrics: () => ({
          totalCalls: 0,
          cacheHits: 0,
          cacheMisses: 0,
          averageExecutionTime: 0,
        }),
        clearCache: vi.fn(),
      };

      monitor.registerSelector('test', mockSelector);
      monitor.unregisterSelector('test');

      // Should not throw
      expect(() => monitor.resetMetrics()).not.toThrow();
    });

    it('should enable and disable monitoring', () => {
      const monitor = getPerformanceMonitor();

      monitor.enable(1000);
      expect(() => monitor.disable()).not.toThrow();
    });

    it('should generate performance reports', () => {
      const monitor = getPerformanceMonitor();

      // Enable monitoring before generating report
      monitor.enable(100);

      const report = monitor.getPerformanceReport();
      expect(typeof report).toBe('string');
      expect(report).toContain('Selector Performance Report');

      // Clean up
      monitor.disable();
    });

    it('should handle subscription and unsubscription', () => {
      const monitor = getPerformanceMonitor();
      const mockCallback = vi.fn();

      const unsubscribe = monitor.subscribe(mockCallback);
      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      expect(() => unsubscribe()).not.toThrow(); // Should handle double unsubscribe
    });
  });

  describe('Integration Tests', () => {
    it('should work with real selector patterns', () => {
      // Test a realistic selector pattern
      const agents = [
        {
          id: '1',
          name: 'Agent 1',
          role: 'assistant' as const,
          personality: 'helpful',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: '2',
          name: 'Agent 2',
          role: 'user' as const,
          personality: 'curious',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: '3',
          name: 'Agent 3',
          role: 'assistant' as const,
          personality: 'analytical',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const agentStatuses = {
        '1': {
          id: '1',
          isOnline: true,
          currentConversations: ['conv1'],
          lastSeen: Date.now(),
          lastActivity: Date.now(),
          participationCount: 1,
        },
        '2': {
          id: '2',
          isOnline: false,
          currentConversations: [],
          lastSeen: Date.now(),
          lastActivity: Date.now(),
          participationCount: 0,
        },
        '3': {
          id: '3',
          isOnline: true,
          currentConversations: ['conv1', 'conv2'],
          lastSeen: Date.now(),
          lastActivity: Date.now(),
          participationCount: 2,
        },
      };

      const state = createMockState({ agents, agentStatuses });

      // Test filtered array selector
      const onlineAgentsSelector = createArraySelector((state: AppState) =>
        state.agents.filter(agent => {
          const status = state.agentStatuses[agent.id];
          return status?.isOnline ?? false;
        }),
      );

      // Test count selector
      const onlineCountSelector = createCountSelector(
        (state: AppState) => state.agents,
        (agent, state) => {
          const status = state.agentStatuses[agent.id];
          return status?.isOnline ?? false;
        },
      );

      // Test parameterized selector
      const agentsInConversationSelector = createParameterizedSelector(
        (conversationId: string) => (state: AppState) =>
          state.agents.filter(agent => {
            const status = state.agentStatuses[agent.id];
            return status?.currentConversations.includes(conversationId) ?? false;
          }),
      );

      const onlineAgents = onlineAgentsSelector(state);
      const onlineCount = onlineCountSelector(state);
      const agentsInConv1 = agentsInConversationSelector('conv1')(state);

      expect(onlineAgents).toHaveLength(2);
      expect(onlineCount).toBe(2);
      expect(agentsInConv1).toHaveLength(2);

      // Test cache effectiveness
      const onlineAgents2 = onlineAgentsSelector(state);
      expect(onlineAgents2).toBe(onlineAgents); // Same reference due to memoization
    });

    it('should handle performance monitoring integration', () => {
      const monitor = getPerformanceMonitor();
      monitor.enable(100); // Short interval for testing

      const mockSelector = createMemoizedSelector((state: AppState) => state.agents.length, {
        enablePerformanceMonitoring: true,
      }) as MemoizedSelector<number>;

      monitor.registerSelector('test-selector', mockSelector);

      // Make some calls
      mockSelector(mockState);
      mockSelector(mockState);

      const metrics = monitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      if (metrics) {
        expect(metrics.totalSelectors).toBe(1);
      }

      monitor.disable();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined state gracefully', () => {
      const mockSelector = vi.fn(() => 'result');
      const memoizedSelector = createMemoizedSelector(mockSelector);

      // This would normally not happen in real usage, but test defensive behavior
      expect(() => memoizedSelector(undefined as unknown as AppState)).not.toThrow();
    });

    it('should handle selector errors gracefully', () => {
      const mockSelector = vi.fn(() => {
        throw new Error('Selector error');
      });
      const memoizedSelector = createMemoizedSelector(mockSelector);

      expect(() => memoizedSelector(mockState)).toThrow('Selector error');
    });

    it('should handle rapid state changes', () => {
      const mockSelector = vi.fn((state: AppState) => state.agents.length);
      const memoizedSelector = createMemoizedSelector(mockSelector);

      // Rapid calls with different states
      for (let i = 0; i < 100; i++) {
        const state = createMockState({
          agents: Array(i)
            .fill(null)
            .map((_, idx) => ({
              id: `${idx}`,
              name: `Agent ${idx}`,
              role: 'assistant' as const,
              personality: 'helpful',
              isActive: true,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })),
        });

        const result = memoizedSelector(state);
        expect(result).toBe(i);
      }

      expect(mockSelector).toHaveBeenCalledTimes(100);
    });
  });
});
