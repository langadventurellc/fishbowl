/**
 * Test suite for RuntimeSecurityMonitor
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RuntimeSecurityMonitor } from '../../../../../src/renderer/store/security/RuntimeSecurityMonitor';
import type { AppState } from '../../../../../src/renderer/store/types';

describe('RuntimeSecurityMonitor', () => {
  let monitor: RuntimeSecurityMonitor;
  let mockState: AppState;
  let getStateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    monitor = RuntimeSecurityMonitor.getInstance();
    monitor.clearEventHistory();

    // Mock a complete AppState
    mockState = {
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
      layoutPreferences: { sidebarWidth: 250, mainContentHeight: 600 },
      setSidebarCollapsed: vi.fn(),
      toggleSidebar: vi.fn(),
      setActiveModal: vi.fn(),
      setWindowDimensions: vi.fn(),
      setLayoutPreferences: vi.fn(),

      // Settings slice
      preferences: {
        autoSave: true,
        defaultProvider: 'openai',
        maxConversationHistory: 50,
        enableNotifications: true,
      },
      configuration: {
        debugMode: false,
        performanceMode: false,
        maxAgents: 10,
      },
      setPreferences: vi.fn(),
      setConfiguration: vi.fn(),
      resetSettings: vi.fn(),

      // Agent slice (sensitive data)
      agents: [
        {
          id: '1',
          name: 'Agent 1',
          role: 'assistant',
          personality: 'helpful',
          isActive: true,
          createdAt: 123456789,
          updatedAt: 123456789,
        },
        {
          id: '2',
          name: 'Agent 2',
          role: 'user',
          personality: 'curious',
          isActive: false,
          createdAt: 123456789,
          updatedAt: 123456789,
        },
      ],
      activeAgents: ['1'],
      loading: false,
      error: null,
      agentStatuses: {
        '1': {
          id: '1',
          isOnline: true,
          lastActivity: 123456789,
          currentConversations: [],
          participationCount: 5,
        },
      },
      agentMetadata: {
        '1': { messageCount: 10, averageResponseTime: 1000 },
      },
      lastFetch: 123456789,
      cacheValid: true,
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

      // Conversation slice (sensitive data)
      conversations: [
        {
          id: '1',
          name: 'Conversation 1',
          description: 'Test conversation',
          createdAt: 123456789,
          updatedAt: 123456789,
          isActive: true,
        },
      ],
      activeConversationId: '1',
      setConversations: vi.fn(),
      addConversation: vi.fn(),
      updateConversation: vi.fn(),
      removeConversation: vi.fn(),
      setActiveConversation: vi.fn(),
    } as unknown as AppState;

    getStateMock = vi.fn(() => mockState);
  });

  afterEach(() => {
    monitor.stopMonitoring();
    monitor.clearEventHistory();
    localStorage.clear();
    vi.restoreAllMocks();

    // Reset singleton instance to prevent state leakage between tests
    (RuntimeSecurityMonitor as any).instance = undefined;
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = RuntimeSecurityMonitor.getInstance();
      const instance2 = RuntimeSecurityMonitor.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Monitor Configuration', () => {
    it('should have correct default configuration', () => {
      const status = monitor.getMonitoringStatus();
      expect(status.config.enabled).toBe(process.env.NODE_ENV === 'development');
      expect(status.config.auditInterval).toBe(30000);
      expect(status.config.maxEventHistory).toBe(100);
      expect(status.config.reportToConsole).toBe(true);
    });

    it('should update configuration correctly', () => {
      monitor.updateConfig({
        auditInterval: 10000,
        maxEventHistory: 50,
        reportToConsole: false,
      });

      const status = monitor.getMonitoringStatus();
      expect(status.config.auditInterval).toBe(10000);
      expect(status.config.maxEventHistory).toBe(50);
      expect(status.config.reportToConsole).toBe(false);
    });
  });

  describe('Monitoring Lifecycle', () => {
    it('should start monitoring successfully', () => {
      monitor.updateConfig({ enabled: true });
      const result = monitor.startMonitoring(getStateMock);
      expect(result).toBe(true);

      const status = monitor.getMonitoringStatus();
      expect(status.isMonitoring).toBe(true);
    });

    it('should stop monitoring successfully', () => {
      monitor.updateConfig({ enabled: true });
      monitor.startMonitoring(getStateMock);
      monitor.stopMonitoring();

      const status = monitor.getMonitoringStatus();
      expect(status.isMonitoring).toBe(false);
    });

    it('should not start monitoring if already monitoring', () => {
      monitor.updateConfig({ enabled: true });
      monitor.startMonitoring(getStateMock);
      const result = monitor.startMonitoring(getStateMock);
      expect(result).toBe(true); // Returns true but warns about already monitoring
    });

    it('should not start monitoring if disabled', () => {
      monitor.updateConfig({ enabled: false });
      const result = monitor.startMonitoring(getStateMock);
      expect(result).toBe(false);
    });
  });

  describe('Security Event Reporting', () => {
    it('should report security events to event history', () => {
      monitor.startMonitoring(getStateMock);

      // Trigger a security event by adding sensitive data to localStorage
      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: { agents: [{ id: '1', name: 'Agent 1' }] },
          version: 1,
        }),
      );

      monitor.performSecurityAudit(getStateMock);

      const events = monitor.getEventHistory();
      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty('type');
      expect(events[0]).toHaveProperty('timestamp');
      expect(events[0]).toHaveProperty('message');
      expect(events[0]).toHaveProperty('severity');
    });

    it('should clear event history', () => {
      monitor.startMonitoring(getStateMock);

      // Generate events
      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: { agents: [{ id: '1', name: 'Agent 1' }] },
          version: 1,
        }),
      );
      monitor.performSecurityAudit(getStateMock);

      expect(monitor.getEventHistory().length).toBeGreaterThan(0);

      monitor.clearEventHistory();
      expect(monitor.getEventHistory()).toHaveLength(0);
    });

    it('should limit event history size', () => {
      monitor.updateConfig({ maxEventHistory: 5 });

      // Generate many events
      for (let i = 0; i < 10; i++) {
        localStorage.setItem(
          'fishbowl-store',
          JSON.stringify({
            state: { agents: [{ id: `${i}`, name: `Agent ${i}` }] },
            version: 1,
          }),
        );
        monitor.performSecurityAudit(getStateMock);
      }

      const events = monitor.getEventHistory();
      expect(events.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Operation Monitoring', () => {
    it('should monitor store operations for security issues', () => {
      monitor.updateConfig({ enabled: true });

      const beforeState = { ...mockState };
      const afterState = {
        ...mockState,
        agents: Array(250)
          .fill(null)
          .map((_, i) => ({
            id: `agent-${i}`,
            name: `Agent ${i}`,
            role: 'assistant',
            personality: 'helpful',
            isActive: i % 2 === 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })),
      };

      monitor.monitorOperation('setAgents', beforeState, afterState);

      const events = monitor.getEventHistory();
      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.message.includes('resulted in 250 agents'))).toBe(true);
    });

    it('should detect memory usage spikes', () => {
      monitor.updateConfig({ enabled: true });

      const beforeState = { ...mockState };
      const afterState = {
        ...mockState,
        preferences: {
          ...mockState.preferences,
          largeField: 'x'.repeat(150000), // 150KB of data
        },
      };

      monitor.monitorOperation('setPreferences', beforeState, afterState);

      const events = monitor.getEventHistory();
      expect(events.some(e => e.message.includes('increased state size'))).toBe(true);
    });

    it('should handle operations with null/undefined states gracefully', () => {
      monitor.updateConfig({ enabled: true });

      expect(() => {
        monitor.monitorOperation('testOperation', mockState, null as unknown as AppState);
      }).not.toThrow();

      expect(() => {
        monitor.monitorOperation('testOperation', null as unknown as AppState, mockState);
      }).not.toThrow();
    });
  });

  describe('Security Audit Integration', () => {
    it('should perform security audit on demand', () => {
      monitor.updateConfig({ enabled: true });

      // Add sensitive data to localStorage
      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: { agents: [{ id: '1', name: 'Agent 1' }] },
          version: 1,
        }),
      );

      monitor.performSecurityAudit(getStateMock);

      const events = monitor.getEventHistory();
      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => String(e.type) === 'PERSISTENCE_VIOLATION')).toBe(true);
    });

    it('should detect suspicious patterns in store state', () => {
      monitor.updateConfig({ enabled: true });

      const suspiciousState = {
        ...mockState,
        agents: Array(1100)
          .fill(null)
          .map((_, i) => ({
            id: `agent-${i}`,
            name: `Agent ${i}`,
            role: 'assistant',
            personality: 'helpful',
            isActive: i % 2 === 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })),
      };

      getStateMock.mockReturnValue(suspiciousState);
      monitor.performSecurityAudit(getStateMock);

      const events = monitor.getEventHistory();
      expect(events.some(e => e.message.includes('Unusually large agent array'))).toBe(true);
    });

    it('should detect sensitive information in error messages', () => {
      monitor.updateConfig({ enabled: true });

      const stateWithSensitiveError = {
        ...mockState,
        error: 'Authentication failed: invalid password for user',
      };

      getStateMock.mockReturnValue(stateWithSensitiveError);
      monitor.performSecurityAudit(getStateMock);

      const events = monitor.getEventHistory();
      expect(
        events.some(e => e.message.includes('Error message may contain sensitive information')),
      ).toBe(true);
    });
  });

  describe('Security Summary', () => {
    it('should generate security summary with no events', () => {
      const summary = monitor.getSecuritySummary();
      expect(summary.status).toBe('SECURE');
      expect(summary.criticalEvents).toBe(0);
      expect(summary.highEvents).toBe(0);
      expect(summary.recommendations).toHaveLength(0);
    });

    it('should generate security summary with critical events', () => {
      monitor.updateConfig({ enabled: true });

      // Generate critical events
      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: { agents: [{ id: '1', name: 'Agent 1' }] },
          version: 1,
        }),
      );
      monitor.performSecurityAudit(getStateMock);

      const summary = monitor.getSecuritySummary();
      expect(summary.status).toBe('CRITICAL');
      expect(summary.criticalEvents).toBeGreaterThan(0);
      expect(summary.recommendations).toContain(
        'URGENT: Address critical security violations immediately',
      );
    });

    it('should generate security summary with warning status', () => {
      monitor.updateConfig({ enabled: true });

      const stateWithWarnings = {
        ...mockState,
        agents: Array(1100)
          .fill(null)
          .map((_, i) => ({
            id: `agent-${i}`,
            name: `Agent ${i}`,
            role: 'assistant',
            personality: 'helpful',
            isActive: i % 2 === 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })),
      };

      getStateMock.mockReturnValue(stateWithWarnings);

      // Generate multiple medium events to reach WARNING threshold (>3)
      for (let i = 0; i < 5; i++) {
        monitor.performSecurityAudit(getStateMock);
      }

      const summary = monitor.getSecuritySummary();
      expect(summary.status).toBe('WARNING');
      expect(summary.mediumEvents).toBeGreaterThan(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle audit errors gracefully', () => {
      monitor.updateConfig({ enabled: true });

      // Mock getState to throw an error
      const errorGetState = vi.fn().mockImplementation(() => {
        throw new Error('State access error');
      });

      expect(() => {
        monitor.performSecurityAudit(errorGetState);
      }).not.toThrow();

      const events = monitor.getEventHistory();
      expect(events.some(e => String(e.type) === 'AUDIT_FAILURE')).toBe(true);
    });

    it('should handle operation monitoring errors gracefully', () => {
      monitor.updateConfig({ enabled: true });

      // Create circular reference that will cause JSON.stringify to fail
      const circularState = { ...mockState };
      (circularState as Record<string, unknown>).circular = circularState;

      expect(() => {
        monitor.monitorOperation('testOperation', mockState, circularState);
      }).not.toThrow();
    });

    it('should handle monitoring start errors gracefully', () => {
      monitor.updateConfig({ enabled: true });
      const errorGetState = vi.fn().mockImplementation(() => {
        throw new Error('State access error');
      });

      const result = monitor.startMonitoring(errorGetState);
      expect(result).toBe(true); // Still returns true, but handles error gracefully

      // Verify that an audit failure event was reported
      const events = monitor.getEventHistory();
      expect(events.some(e => String(e.type) === 'AUDIT_FAILURE')).toBe(true);
    });
  });

  describe('Development vs Production Behavior', () => {
    it('should respect development/production configuration', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test production behavior
      process.env.NODE_ENV = 'production';
      // Reset singleton to pick up new env
      (RuntimeSecurityMonitor as any).instance = undefined;
      const prodMonitor = RuntimeSecurityMonitor.getInstance();
      expect(prodMonitor.getMonitoringStatus().config.enabled).toBe(false);

      // Test development behavior
      process.env.NODE_ENV = 'development';
      // Reset singleton to pick up new env
      (RuntimeSecurityMonitor as any).instance = undefined;
      const devMonitor = RuntimeSecurityMonitor.getInstance();
      expect(devMonitor.getMonitoringStatus().config.enabled).toBe(true);

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty event history gracefully', () => {
      const summary = monitor.getSecuritySummary();
      expect(summary).toBeDefined();
      expect(summary.status).toBe('SECURE');
    });

    it('should handle monitoring status when not initialized', () => {
      const status = monitor.getMonitoringStatus();
      expect(status.isMonitoring).toBe(false);
      expect(status.lastAuditTime).toBe(null);
    });

    it('should handle configuration updates when not monitoring', () => {
      expect(() => {
        monitor.updateConfig({ auditInterval: 5000 });
      }).not.toThrow();
    });
  });
});
