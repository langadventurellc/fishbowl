/**
 * Store End-to-End Integration Tests
 *
 * Comprehensive tests for complete Zustand store functionality covering all slices
 * working together in realistic usage scenarios. This tests the full store as a
 * cohesive system beyond individual slice testing.
 *
 * Test Coverage:
 * - Complete store workflow (initialization → configuration → usage → restart)
 * - Cross-slice coordination and interactions
 * - Real-world multi-agent conversation scenarios
 * - Performance under realistic load with all slices active
 * - Error recovery across the entire store
 * - Complete persistence lifecycle coordination
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createThemeSlice } from '../../src/renderer/store/slices/theme';
import { createUISlice } from '../../src/renderer/store/slices/ui';
import { createSettingsSlice } from '../../src/renderer/store/slices/settings';
import { createAgentSlice } from '../../src/renderer/store/slices/agents';
import { createConversationSlice } from '../../src/renderer/store/slices/conversation';
import { storeConfig } from '../../src/renderer/store';
import type { AppState } from '../../src/renderer/store/types';
import type { Agent, Conversation } from '../../src/shared/types';

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock system theme detection
const mockMatchMedia = vi.fn();
global.matchMedia = mockMatchMedia;

/**
 * Creates a new store instance to simulate app restart
 */
const createNewStoreInstance = () => {
  return create<AppState>()(
    devtools(
      persist(
        immer((set, get, store) => ({
          ...createThemeSlice(set, get, store),
          ...createUISlice(set, get, store),
          ...createSettingsSlice(set, get, store),
          ...createAgentSlice(set, get, store),
          ...createConversationSlice(set, get, store),
        })),
        {
          name: storeConfig.persist.name,
          version: storeConfig.persist.version,
          partialize: storeConfig.persist.partialize,
          skipHydration: false,
        },
      ),
      {
        name: storeConfig.devtools.name,
        enabled: false, // Disable devtools in tests
      },
    ),
  );
};

/**
 * Waits for store hydration to complete
 */
const waitForHydration = async (store: ReturnType<typeof createNewStoreInstance>) => {
  return new Promise<void>(resolve => {
    if (store.persist.hasHydrated()) {
      resolve();
      return;
    }
    const unsubscribe = store.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
};

/**
 * Creates mock agents for testing
 */
const createMockAgents = (): Agent[] => [
  {
    id: 'agent-1',
    name: 'Alice Assistant',
    role: 'assistant',
    personality: 'helpful and friendly',
    isActive: true,
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 3600000, // 1 hour ago
  },
  {
    id: 'agent-2',
    name: 'Bob Analyst',
    role: 'analyst',
    personality: 'analytical and precise',
    isActive: true,
    createdAt: Date.now() - 172800000, // 2 days ago
    updatedAt: Date.now() - 7200000, // 2 hours ago
  },
  {
    id: 'agent-3',
    name: 'Charlie Creative',
    role: 'creative',
    personality: 'imaginative and inspiring',
    isActive: false,
    createdAt: Date.now() - 259200000, // 3 days ago
    updatedAt: Date.now() - 10800000, // 3 hours ago
  },
];

/**
 * Creates mock conversations for testing
 */
const createMockConversations = (): Conversation[] => [
  {
    id: 'conv-1',
    name: 'Project Planning Discussion',
    description: 'Planning the next phase of development',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 1800000,
    isActive: true,
  },
  {
    id: 'conv-2',
    name: 'Creative Brainstorming',
    description: 'Generating new ideas for features',
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 3600000,
    isActive: false,
  },
];

describe('Store End-to-End Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();

    // Setup default media query mock
    mockMatchMedia.mockReturnValue({
      matches: false, // Default to light theme
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Complete Store Workflow Integration', () => {
    it('should handle complete app initialization and configuration workflow', async () => {
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // 1. Initial app state should be properly initialized
      const initialState = store.getState();
      expect(initialState.theme).toBe('system');
      expect(initialState.sidebarCollapsed).toBe(false);
      expect(initialState.agents).toEqual([]);
      expect(initialState.conversations).toEqual([]);
      expect(initialState.activeConversationId).toBe(null);

      // 2. User configures app preferences
      store.getState().setTheme('dark');
      store.getState().setSidebarCollapsed(true);
      store.getState().setWindowDimensions({ width: 1440, height: 900 });
      store.getState().setPreferences({
        enableNotifications: true,
        autoSave: false,
        defaultProvider: 'openai',
      });

      // 3. User loads agents and conversations
      const mockAgents = createMockAgents();
      const mockConversations = createMockConversations();

      store.getState().setAgents(mockAgents);
      store.getState().setConversations(mockConversations);
      store.getState().setActiveConversation('conv-1');

      // 4. Verify all state is coordinated correctly
      const configuredState = store.getState();
      expect(configuredState.theme).toBe('dark');
      expect(configuredState.sidebarCollapsed).toBe(true);
      expect(configuredState.windowDimensions).toEqual({ width: 1440, height: 900 });
      expect(configuredState.agents).toHaveLength(3);
      expect(configuredState.conversations).toHaveLength(2);
      expect(configuredState.activeConversationId).toBe('conv-1');
      expect(configuredState.preferences.defaultProvider).toBe('openai');

      // 5. Verify caching state is updated
      expect(configuredState.cacheValid).toBe(true);
      expect(configuredState.lastFetch).toBeGreaterThan(0);
    });

    it('should handle app restart with complete state recovery', async () => {
      // 1. Set up initial app state
      const store1 = createNewStoreInstance();
      await waitForHydration(store1);

      store1.getState().setTheme('dark');
      store1.getState().setSidebarCollapsed(true);
      store1.getState().setLayoutPreferences({ sidebarWidth: 280 });
      store1.getState().setConfiguration({
        debugMode: true,
        performanceMode: false,
        experimentalFeatures: true,
      });

      // Load non-persistent data
      store1.getState().setAgents(createMockAgents());
      store1.getState().setConversations(createMockConversations());
      store1.getState().setActiveConversation('conv-1');
      store1.getState().setActiveModal('settings');

      // 2. Simulate app restart with new store instance
      const store2 = createNewStoreInstance();
      await waitForHydration(store2);

      const restoredState = store2.getState();

      // 3. Verify persistent state is restored
      expect(restoredState.theme).toBe('dark');
      expect(restoredState.sidebarCollapsed).toBe(true);
      expect(restoredState.layoutPreferences.sidebarWidth).toBe(280);
      expect(restoredState.configuration.debugMode).toBe(true);

      // 4. Verify non-persistent state is reset to defaults
      expect(restoredState.agents).toEqual([]);
      expect(restoredState.conversations).toEqual([]);
      expect(restoredState.activeConversationId).toBe(null);
      expect(restoredState.activeModal).toBe(null);
      expect(restoredState.cacheValid).toBe(false);
      expect(restoredState.lastFetch).toBe(null);
    });

    it('should handle complete workflow with multiple data updates', async () => {
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // Simulate complex user workflow
      const agents = createMockAgents();
      const conversations = createMockConversations();

      // 1. Initial setup
      store.getState().setTheme('light');
      store.getState().setAgents(agents);
      store.getState().setConversations(conversations);

      // 2. User starts working with first conversation
      store.getState().setActiveConversation('conv-1');
      store.getState().setSidebarCollapsed(false);

      // 3. User adds new agent mid-session
      const newAgent: Agent = {
        id: 'agent-4',
        name: 'Diana Expert',
        role: 'expert',
        personality: 'knowledgeable and thorough',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      store.getState().addAgent(newAgent);

      // 4. User switches theme during work
      store.getState().toggleTheme();

      // 5. User creates new conversation
      const newConversation: Conversation = {
        id: 'conv-3',
        name: 'Expert Consultation',
        description: 'Deep dive into technical topics',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
      };
      store.getState().addConversation(newConversation);
      store.getState().setActiveConversation('conv-3');

      // 6. User adjusts settings
      store.getState().setPreferences({
        enableNotifications: false,
        autoSave: true,
        defaultProvider: 'anthropic',
      });

      // 7. Verify final state reflects all changes
      const finalState = store.getState();
      expect(finalState.theme).toBe('dark'); // Toggled from light
      expect(finalState.agents).toHaveLength(4);
      expect(finalState.conversations).toHaveLength(3);
      expect(finalState.activeConversationId).toBe('conv-3');
      expect(finalState.preferences.defaultProvider).toBe('anthropic');
      expect(finalState.sidebarCollapsed).toBe(false);
    });
  });

  describe('Cross-Slice Coordination', () => {
    it('should coordinate theme changes with UI state', async () => {
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // Initial state
      expect(store.getState().theme).toBe('system');
      expect(store.getState().effectiveTheme).toBeDefined();

      // Change theme should update both theme and effective theme
      store.getState().setTheme('dark');
      expect(store.getState().theme).toBe('dark');
      expect(store.getState().effectiveTheme).toBe('dark');

      // UI state should remain independent
      store.getState().setSidebarCollapsed(true);
      expect(store.getState().sidebarCollapsed).toBe(true);
      expect(store.getState().theme).toBe('dark'); // Theme unchanged
    });

    it('should coordinate settings changes with agent behavior', async () => {
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // Set up agents
      const agents = createMockAgents();
      store.getState().setAgents(agents);

      // Change settings that might affect agent behavior
      store.getState().setConfiguration({
        debugMode: false,
        performanceMode: true,
        experimentalFeatures: false,
      });

      // Verify both states are maintained
      const state = store.getState();
      expect(state.agents).toHaveLength(3);
      expect(state.configuration.debugMode).toBe(false);
      expect(state.configuration.performanceMode).toBe(true);

      // Agent metadata should still be tracked
      expect(state.cacheValid).toBe(true);
      expect(Object.keys(state.agentMetadata)).toContain('agent-1');
    });

    it('should coordinate conversation state with UI layout', async () => {
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // Set up conversations
      const conversations = createMockConversations();
      store.getState().setConversations(conversations);

      // Set active conversation
      store.getState().setActiveConversation('conv-1');

      // Adjust UI for conversation view
      store.getState().setSidebarCollapsed(false);
      store.getState().setWindowDimensions({ width: 1600, height: 1000 });
      store.getState().setLayoutPreferences({
        sidebarWidth: 320,
        mainContentHeight: 120,
      });

      // Verify coordination
      const state = store.getState();
      expect(state.activeConversationId).toBe('conv-1');
      expect(state.sidebarCollapsed).toBe(false);
      expect(state.layoutPreferences.sidebarWidth).toBe(320);
      expect(state.windowDimensions.width).toBe(1600);

      // Switch conversation and UI state should remain
      store.getState().setActiveConversation('conv-2');
      const updatedState = store.getState();
      expect(updatedState.activeConversationId).toBe('conv-2');
      expect(state.layoutPreferences.sidebarWidth).toBe(320);
    });

    it('should handle cross-slice persistence coordination', async () => {
      const store1 = createNewStoreInstance();
      await waitForHydration(store1);

      // Configure multiple persistent slices
      store1.getState().setTheme('dark');
      store1.getState().setSidebarCollapsed(true);
      store1.getState().setPreferences({ enableNotifications: false, autoSave: true });
      store1.getState().setConfiguration({ debugMode: true });

      // Set non-persistent data
      store1.getState().setAgents(createMockAgents());
      store1.getState().setActiveConversation('conv-1');

      // Restart app
      const store2 = createNewStoreInstance();
      await waitForHydration(store2);

      const state = store2.getState();

      // Verify persistent coordination
      expect(state.theme).toBe('dark');
      expect(state.sidebarCollapsed).toBe(true);
      expect(state.preferences.enableNotifications).toBe(false);
      expect(state.configuration.debugMode).toBe(true);

      // Verify non-persistent reset
      expect(state.agents).toEqual([]);
      expect(state.activeConversationId).toBe(null);
    });
  });

  describe('Real-World Usage Scenarios', () => {
    it('should handle multi-agent conversation workflow', async () => {
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // 1. User sets up workspace
      store.getState().setTheme('light');
      store.getState().setSidebarCollapsed(false);
      store.getState().setLayoutPreferences({
        sidebarWidth: 300,
        mainContentHeight: 100,
      });

      // 2. Load agents with different roles
      const agents = createMockAgents();
      store.getState().setAgents(agents);

      // 3. Create conversation with multiple agents
      const conversation: Conversation = {
        id: 'multi-agent-conv',
        name: 'Multi-Agent Collaboration',
        description: 'Agents working together on a project',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
      };
      store.getState().addConversation(conversation);
      store.getState().setActiveConversation('multi-agent-conv');

      // 4. Activate specific agents for conversation
      store.getState().updateAgent('agent-1', { isActive: true });
      store.getState().updateAgent('agent-2', { isActive: true });
      store.getState().updateAgent('agent-3', { isActive: false });

      // 5. Update agent metadata during conversation
      const agentMetadata = {
        'agent-1': {
          conversationHistory: ['multi-agent-conv'],
          messageCount: 5,
          lastActiveAt: Date.now(),
          responseTime: 250,
        },
        'agent-2': {
          conversationHistory: ['multi-agent-conv'],
          messageCount: 3,
          lastActiveAt: Date.now() - 30000,
          responseTime: 400,
        },
      };

      // Simulate metadata updates
      Object.entries(agentMetadata).forEach(([agentId, metadata]) => {
        store.getState().setAgentMetadata(agentId, metadata);
      });

      // 6. Verify complete workflow state
      const state = store.getState();
      expect(state.activeConversationId).toBe('multi-agent-conv');
      expect(state.agents.filter(agent => agent.isActive)).toHaveLength(2);
      expect(state.agentMetadata['agent-1'].messageCount).toBe(5);
      expect(state.agentMetadata['agent-2'].messageCount).toBe(3);
      expect(state.cacheValid).toBe(true);
    });

    it('should handle rapid conversation switching with state consistency', async () => {
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // Set up multiple conversations
      const conversations = [
        ...createMockConversations(),
        {
          id: 'conv-3',
          name: 'Quick Chat',
          description: 'Brief discussion',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isActive: true,
        },
        {
          id: 'conv-4',
          name: 'Deep Dive',
          description: 'Detailed analysis',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isActive: true,
        },
      ];

      store.getState().setConversations(conversations);
      store.getState().setAgents(createMockAgents());

      // Rapidly switch between conversations
      const conversationIds = ['conv-1', 'conv-3', 'conv-2', 'conv-4', 'conv-1'];

      conversationIds.forEach((id, index) => {
        store.getState().setActiveConversation(id);

        // Verify state consistency after each switch
        const state = store.getState();
        expect(state.activeConversationId).toBe(id);
        expect(state.conversations).toHaveLength(4);
        expect(state.agents).toHaveLength(3);

        // Simulate some UI changes during switching
        if (index % 2 === 0) {
          store.getState().setSidebarCollapsed(!state.sidebarCollapsed);
        }
      });

      // Verify final state is consistent
      const finalState = store.getState();
      expect(finalState.activeConversationId).toBe('conv-1');
      expect(finalState.conversations).toHaveLength(4);
      expect(finalState.cacheValid).toBe(true);
    });

    it('should handle complex theme switching during active usage', async () => {
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // Set up active usage scenario
      store.getState().setAgents(createMockAgents());
      store.getState().setConversations(createMockConversations());
      store.getState().setActiveConversation('conv-1');
      store.getState().setActiveModal('settings');

      // Test all theme transitions during active usage
      const themeSequence = ['light', 'dark', 'system', 'light', 'dark'] as const;

      themeSequence.forEach((theme, index) => {
        store.getState().setTheme(theme);

        const state = store.getState();
        expect(state.theme).toBe(theme);
        expect(state.effectiveTheme).toBeDefined();

        // Verify other state remains stable during theme changes
        expect(state.activeConversationId).toBe('conv-1');
        expect(state.activeModal).toBe('settings');
        expect(state.agents).toHaveLength(3);
        expect(state.conversations).toHaveLength(2);

        // Do some operations during theme switching
        if (index % 2 === 0) {
          store.getState().updateConversation('conv-1', {
            updatedAt: Date.now(),
          });
        }
      });

      // Verify final state is consistent
      const finalState = store.getState();
      expect(finalState.theme).toBe('dark');
      expect(finalState.conversations.find(c => c.id === 'conv-1')?.updatedAt).toBeGreaterThan(0);
    });
  });

  describe('Performance Integration Testing', () => {
    it('should handle large datasets across all slices', async () => {
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // Create large datasets
      const largeAgentSet: Agent[] = Array.from({ length: 100 }, (_, i) => ({
        id: `agent-${i}`,
        name: `Agent ${i}`,
        role: i % 2 === 0 ? 'assistant' : 'analyst',
        personality: `Personality for agent ${i}`,
        isActive: i < 50, // Half active
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 500,
      }));

      const largeConversationSet: Conversation[] = Array.from({ length: 50 }, (_, i) => ({
        id: `conv-${i}`,
        name: `Conversation ${i}`,
        description: `Description for conversation ${i}`,
        createdAt: Date.now() - i * 2000,
        updatedAt: Date.now() - i * 1000,
        isActive: i < 25, // Half active
      }));

      // Measure performance of large data operations
      const startTime = performance.now();

      store.getState().setAgents(largeAgentSet);
      store.getState().setConversations(largeConversationSet);

      const endTime = performance.now();
      const operationTime = endTime - startTime;

      // Verify large datasets are handled correctly
      const state = store.getState();
      expect(state.agents).toHaveLength(100);
      expect(state.conversations).toHaveLength(50);
      expect(state.cacheValid).toBe(true);

      // Performance should be reasonable (under 100ms for large operations)
      expect(operationTime).toBeLessThan(100);

      // Test filtering performance with large datasets
      const activeAgents = state.agents.filter(agent => agent.isActive);
      expect(activeAgents).toHaveLength(50);

      const activeConversations = state.conversations.filter(conv => conv.isActive);
      expect(activeConversations).toHaveLength(25);
    });

    it('should handle rapid state updates efficiently', async () => {
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // Set up initial data
      store.getState().setAgents(createMockAgents());
      store.getState().setConversations(createMockConversations());

      // Perform rapid updates across multiple slices
      const updateCount = 50;
      const startTime = performance.now();

      for (let i = 0; i < updateCount; i++) {
        // Rapid theme toggling
        store.getState().toggleTheme();

        // Rapid UI updates
        store.getState().setSidebarCollapsed(i % 2 === 0);

        // Rapid conversation switching
        const convId = i % 2 === 0 ? 'conv-1' : 'conv-2';
        store.getState().setActiveConversation(convId);

        // Rapid agent updates
        store.getState().updateAgent('agent-1', {
          updatedAt: Date.now() + i,
        });

        // Rapid settings updates
        store.getState().setPreferences({
          enableNotifications: i % 2 === 0,
          autoSave: i % 3 === 0,
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Verify final state is consistent
      const state = store.getState();
      expect(state.agents).toHaveLength(3);
      expect(state.conversations).toHaveLength(2);
      expect(['conv-1', 'conv-2']).toContain(state.activeConversationId);

      // Performance should be reasonable for rapid updates
      expect(totalTime).toBeLessThan(500); // Under 500ms for 50 rapid updates
      expect(totalTime / updateCount).toBeLessThan(10); // Under 10ms per update
    });

    it('should handle memory usage efficiently during long sessions', async () => {
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // Simulate long session with many operations
      const initialMemory = (performance as any).memory?.usedJSHeapSize ?? 0;

      // Perform many operations that could cause memory leaks
      for (let session = 0; session < 10; session++) {
        // Load data
        store.getState().setAgents(createMockAgents());
        store.getState().setConversations(createMockConversations());

        // Perform operations
        for (let i = 0; i < 20; i++) {
          store.getState().setActiveConversation(`conv-${i % 2 === 0 ? '1' : '2'}`);
          store.getState().updateAgent('agent-1', { updatedAt: Date.now() + i });
          store.getState().toggleTheme();
        }

        // Clear data
        store.getState().setAgents([]);
        store.getState().setConversations([]);
        store.getState().setActiveConversation(null);
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize ?? 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (under 10MB for extended session)
      if ((performance as any).memory) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
      }

      // Verify store is still functional
      const state = store.getState();
      expect(state.agents).toEqual([]);
      expect(state.conversations).toEqual([]);
      expect(state.activeConversationId).toBe(null);
    });
  });

  describe('Error Recovery Integration', () => {
    it('should handle store initialization and remain functional', async () => {
      // Test normal store initialization and functionality
      const store = createNewStoreInstance();
      await waitForHydration(store);

      const state = store.getState();

      // Verify store initializes with proper defaults
      expect(['light', 'dark', 'system']).toContain(state.theme);
      expect(typeof state.sidebarCollapsed).toBe('boolean');
      expect(typeof state.preferences).toBe('object');
      expect(typeof state.configuration).toBe('object');
      expect(typeof state.windowDimensions.width).toBe('number');

      // Store should be fully functional
      store.getState().setAgents(createMockAgents());
      store.getState().setTheme('dark');
      store.getState().setSidebarCollapsed(true);

      const updatedState = store.getState();
      expect(updatedState.agents).toHaveLength(3);
      expect(updatedState.theme).toBe('dark');
      expect(updatedState.sidebarCollapsed).toBe(true);
    });

    it('should handle partial failures across slices', async () => {
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // Set up valid state
      store.getState().setTheme('dark');
      store.getState().setAgents(createMockAgents());
      store.getState().setConversations(createMockConversations());

      // Simulate error in one slice operation
      const originalConsoleError = console.error;
      console.error = vi.fn();

      try {
        // This should not break other slices
        store.getState().updateAgent('non-existent-agent', { name: 'Updated' });

        // Other slices should remain functional
        const state = store.getState();
        expect(state.theme).toBe('dark');
        expect(state.agents).toHaveLength(3);
        expect(state.conversations).toHaveLength(2);

        // Should still be able to perform other operations
        store.getState().setTheme('light');
        expect(store.getState().theme).toBe('light');
      } finally {
        console.error = originalConsoleError;
      }
    });

    it('should maintain data consistency during error scenarios', async () => {
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // Set up complex state
      const agents = createMockAgents();
      const conversations = createMockConversations();

      store.getState().setAgents(agents);
      store.getState().setConversations(conversations);
      store.getState().setActiveConversation('conv-1');
      store.getState().setTheme('dark');

      // Simulate rapid operations that could cause race conditions
      const promises = [];

      for (let i = 0; i < 20; i++) {
        promises.push(
          new Promise<void>(resolve => {
            setTimeout(() => {
              try {
                store.getState().updateAgent('agent-1', { updatedAt: Date.now() + i });
                store.getState().toggleTheme();
                store.getState().setSidebarCollapsed(i % 2 === 0);
              } catch {
                // Ignore errors for this test
              }
              resolve();
            }, Math.random() * 10);
          }),
        );
      }

      await Promise.all(promises);

      // Verify state consistency
      const state = store.getState();
      expect(state.agents).toHaveLength(3);
      expect(state.conversations).toHaveLength(2);
      expect(state.activeConversationId).toBe('conv-1');
      expect(['light', 'dark']).toContain(state.theme);
      expect(typeof state.sidebarCollapsed).toBe('boolean');
    });
  });
});
