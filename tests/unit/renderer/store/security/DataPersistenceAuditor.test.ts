/**
 * Test suite for DataPersistenceAuditor
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataPersistenceAuditor } from '../../../../../src/renderer/store/security/DataPersistenceAuditor';
import type { AppState } from '../../../../../src/renderer/store/types';

describe('DataPersistenceAuditor', () => {
  let auditor: DataPersistenceAuditor;
  let mockState: AppState;

  beforeEach(() => {
    auditor = DataPersistenceAuditor.getInstance();
    auditor.clearViolationLog();

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
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DataPersistenceAuditor.getInstance();
      const instance2 = DataPersistenceAuditor.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Field Classification', () => {
    it('should correctly identify sensitive fields', () => {
      expect(auditor.isSensitiveField('agents')).toBe(true);
      expect(auditor.isSensitiveField('conversations')).toBe(true);
      expect(auditor.isSensitiveField('agentStatuses')).toBe(true);
      expect(auditor.isSensitiveField('agentMetadata')).toBe(true);
      expect(auditor.isSensitiveField('loading')).toBe(true);
      expect(auditor.isSensitiveField('error')).toBe(true);
      expect(auditor.isSensitiveField('activeConversationId')).toBe(true);
      expect(auditor.isSensitiveField('activeModal')).toBe(true);
    });

    it('should correctly identify safe fields', () => {
      expect(auditor.isSafeToPerist('theme')).toBe(true);
      expect(auditor.isSafeToPerist('systemTheme')).toBe(true);
      expect(auditor.isSafeToPerist('sidebarCollapsed')).toBe(true);
      expect(auditor.isSafeToPerist('windowDimensions')).toBe(true);
      expect(auditor.isSafeToPerist('preferences')).toBe(true);
      expect(auditor.isSafeToPerist('configuration')).toBe(true);
    });

    it('should correctly reject unsafe fields', () => {
      expect(auditor.isSafeToPerist('agents')).toBe(false);
      expect(auditor.isSafeToPerist('conversations')).toBe(false);
      expect(auditor.isSafeToPerist('unknownField')).toBe(false);
    });
  });

  describe('localStorage Auditing', () => {
    it('should pass audit when localStorage is empty', () => {
      const result = auditor.auditLocalStorageData();
      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.warnings).toContain('No persisted data found in localStorage');
    });

    it('should pass audit when localStorage contains only safe data', () => {
      const safeData = {
        theme: 'dark',
        systemTheme: 'dark',
        sidebarCollapsed: true,
        windowDimensions: { width: 1400, height: 900 },
        preferences: { autoSave: false },
        configuration: { debugMode: true },
      };

      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: safeData,
          version: 1,
        }),
      );

      const result = auditor.auditLocalStorageData();
      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.metadata.persistedFields).toBe(6);
    });

    it('should fail audit when localStorage contains sensitive data', () => {
      const unsafeData = {
        theme: 'dark',
        agents: [{ id: '1', name: 'Agent 1' }],
        conversations: [{ id: '1', name: 'Conversation 1' }],
        agentStatuses: { '1': { isOnline: true } },
      };

      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: unsafeData,
          version: 1,
        }),
      );

      const result = auditor.auditLocalStorageData();
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(3);
      // Check that all expected violations are present without assuming order
      expect(result.violations.some(v => v.includes('agents'))).toBe(true);
      expect(result.violations.some(v => v.includes('conversations'))).toBe(true);
      expect(result.violations.some(v => v.includes('agentStatuses'))).toBe(true);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('fishbowl-store', 'invalid json');

      const result = auditor.auditLocalStorageData();
      expect(result.passed).toBe(true); // getPersistedData returns null on parse error
      expect(result.violations).toHaveLength(0);
      expect(result.warnings).toContain('No persisted data found in localStorage');

      // Check that the parse error was logged to violation log
      const violations = auditor.getViolationLog();
      expect(violations.some(v => v.message.includes('Failed to parse localStorage data'))).toBe(
        true,
      );
    });

    it('should warn about unexpected fields in localStorage', () => {
      const dataWithUnexpectedFields = {
        theme: 'dark',
        unknownField: 'value',
        anotherUnknownField: 'value',
      };

      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: dataWithUnexpectedFields,
          version: 1,
        }),
      );

      const result = auditor.auditLocalStorageData();
      expect(result.passed).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('unknownField'))).toBe(true);
    });

    it('should warn about large data sizes', () => {
      const largeData = {
        theme: 'dark',
        preferences: {
          largeField: 'x'.repeat(60000), // 60KB of data
        },
      };

      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: largeData,
          version: 1,
        }),
      );

      const result = auditor.auditLocalStorageData();
      expect(result.passed).toBe(true);
      expect(result.warnings.some(w => w.includes('exceeds recommended limit'))).toBe(true);
    });
  });

  describe('Store State Auditing', () => {
    it('should pass audit for valid store state', () => {
      const result = auditor.auditStoreState(mockState);
      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should warn about large arrays in memory', () => {
      const stateWithLargeArrays = {
        ...mockState,
        agents: Array(150)
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
        conversations: Array(60)
          .fill(null)
          .map((_, i) => ({
            id: `conv-${i}`,
            name: `Conversation ${i}`,
            description: `Test conversation ${i}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isActive: false,
          })),
      };

      const result = auditor.auditStoreState(stateWithLargeArrays);
      expect(result.passed).toBe(true);
      expect(result.warnings.some(w => w.includes('Large agent array'))).toBe(true);
      expect(result.warnings.some(w => w.includes('Large conversation array'))).toBe(true);
    });

    it('should warn about large agentStatuses object', () => {
      const stateWithLargeAgentStatuses = {
        ...mockState,
        agentStatuses: Object.fromEntries(
          Array(150)
            .fill(null)
            .map((_, i) => [
              `agent-${i}`,
              {
                id: `agent-${i}`,
                isOnline: true,
                lastActivity: Date.now(),
                currentConversations: [],
                participationCount: 1,
              },
            ]),
        ),
      };

      const result = auditor.auditStoreState(stateWithLargeAgentStatuses);
      expect(result.passed).toBe(true);
      expect(result.warnings.some(w => w.includes('Large agentStatuses object'))).toBe(true);
    });

    it('should warn about undefined critical fields', () => {
      const stateWithUndefinedFields = {
        ...mockState,
        theme: undefined,
        agents: undefined,
        conversations: undefined,
      } as unknown as AppState;

      const result = auditor.auditStoreState(stateWithUndefinedFields);
      expect(result.passed).toBe(true);
      expect(result.warnings.some(w => w.includes('Theme is undefined'))).toBe(true);
      expect(result.warnings.some(w => w.includes('Agents array is undefined'))).toBe(true);
      expect(result.warnings.some(w => w.includes('Conversations array is undefined'))).toBe(true);
    });

    it('should warn about sensitive information in error messages', () => {
      const stateWithSensitiveError = {
        ...mockState,
        error: 'Authentication failed: invalid password for user@example.com',
      };

      const result = auditor.auditStoreState(stateWithSensitiveError);
      expect(result.passed).toBe(true);
      expect(
        result.warnings.some(w => w.includes('Error message may contain sensitive information')),
      ).toBe(true);
    });

    it('should warn about tokens in preferences', () => {
      const stateWithTokens = {
        ...mockState,
        preferences: {
          ...mockState.preferences,
          apiKey: 'secret-key-123',
          userToken: 'bearer-token-456',
        },
      };

      const result = auditor.auditStoreState(stateWithTokens);
      expect(result.passed).toBe(true);
      expect(result.warnings.some(w => w.includes('may contain sensitive tokens'))).toBe(true);
    });
  });

  describe('Comprehensive Security Audit', () => {
    it('should generate comprehensive audit report', () => {
      const report = auditor.getSecurityAuditReport(mockState);
      expect(report).toHaveProperty('localStorageAudit');
      expect(report).toHaveProperty('storeStateAudit');
      expect(report).toHaveProperty('overallPassed');
      expect(report).toHaveProperty('recommendedActions');
      expect(Array.isArray(report.recommendedActions)).toBe(true);
    });

    it('should indicate overall pass when all audits pass', () => {
      // Set up localStorage with safe data to avoid "No persisted data found" warning
      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: {
            theme: 'light',
            sidebarCollapsed: false,
          },
          version: 1,
        }),
      );
      auditor.clearViolationLog(); // Clear any previous violations

      // Create a clean mock state without any potential warnings
      const cleanState = {
        ...mockState,
        agents: [], // Empty array to avoid warnings
        conversations: [], // Empty array to avoid warnings
        error: null, // No error messages
        preferences: {
          // Clean preferences without tokens
          autoSave: true,
          defaultProvider: 'openai',
          maxConversationHistory: 50,
          enableNotifications: true,
        },
      };

      const report = auditor.getSecurityAuditReport(cleanState);
      expect(report.overallPassed).toBe(true);
      expect(report.recommendedActions).toContain('No immediate security actions required');
    });

    it('should indicate overall fail when localStorage has violations', () => {
      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: { agents: [{ id: '1', name: 'Agent 1' }] },
          version: 1,
        }),
      );

      const report = auditor.getSecurityAuditReport(mockState);
      expect(report.overallPassed).toBe(false);
      expect(report.recommendedActions).toContain(
        'URGENT: Clear localStorage and fix persistence configuration',
      );
    });

    it('should provide appropriate recommendations for violations', () => {
      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: { agents: [{ id: '1', name: 'Agent 1' }] },
          version: 1,
        }),
      );

      const report = auditor.getSecurityAuditReport(mockState);
      expect(report.recommendedActions).toContain(
        'URGENT: Clear localStorage and fix persistence configuration',
      );
      expect(report.recommendedActions).toContain(
        'Review and update partialize function to exclude sensitive fields',
      );
    });
  });

  describe('Violation Logging', () => {
    it('should log violations during audits', () => {
      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: { agents: [{ id: '1', name: 'Agent 1' }] },
          version: 1,
        }),
      );

      auditor.auditLocalStorageData();

      const violations = auditor.getViolationLog();
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0]).toHaveProperty('timestamp');
      expect(violations[0]).toHaveProperty('severity');
      expect(violations[0]).toHaveProperty('message');
      expect(violations[0]).toHaveProperty('field');
    });

    it('should clear violation log', () => {
      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: { agents: [{ id: '1', name: 'Agent 1' }] },
          version: 1,
        }),
      );

      auditor.auditLocalStorageData();
      expect(auditor.getViolationLog().length).toBeGreaterThan(0);

      auditor.clearViolationLog();
      expect(auditor.getViolationLog()).toHaveLength(0);
    });

    it('should limit violation log size', () => {
      // Create many violations
      for (let i = 0; i < 150; i++) {
        localStorage.setItem(
          'fishbowl-store',
          JSON.stringify({
            state: { agents: [{ id: `${i}`, name: `Agent ${i}` }] },
            version: 1,
          }),
        );
        auditor.auditLocalStorageData();
      }

      const violations = auditor.getViolationLog();
      expect(violations.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle audit errors gracefully', () => {
      // This test verifies that the auditor doesn't crash when encountering errors
      // We already test corrupted JSON handling in another test, so this test
      // verifies the auditor continues to function after error conditions

      localStorage.clear();
      auditor.clearViolationLog();

      // First create a corrupted localStorage entry to generate an error
      localStorage.setItem('fishbowl-store', 'invalid json');

      // This should trigger error handling but not crash
      const result1 = auditor.auditLocalStorageData();
      expect(result1.passed).toBe(true); // getPersistedData returns null on error
      expect(result1.warnings).toContain('No persisted data found in localStorage');

      // Now test that the auditor can still function normally after the error
      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: { theme: 'dark' },
          version: 1,
        }),
      );

      const result2 = auditor.auditLocalStorageData();
      expect(result2.passed).toBe(true);
      expect(result2.violations).toHaveLength(0);
      expect(result2.metadata.persistedFields).toBe(1);

      // Verify error was logged from the first call
      const violations = auditor.getViolationLog();
      expect(violations.some(v => v.message.includes('Failed to parse localStorage data'))).toBe(
        true,
      );
    });

    it('should handle store state audit errors gracefully', () => {
      // Create a state that will cause processing to fail
      const problematicState = {
        ...mockState,
        // Make agents getter throw an error
        get agents(): typeof mockState.agents {
          throw new Error('State access error');
        },
      };

      const result = auditor.auditStoreState(problematicState);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('Store state audit error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty localStorage correctly', () => {
      localStorage.clear();
      const result = auditor.auditLocalStorageData();
      expect(result.passed).toBe(true);
      expect(result.warnings).toContain('No persisted data found in localStorage');
    });

    it('should handle localStorage with null state', () => {
      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: null,
          version: 1,
        }),
      );

      const result = auditor.auditLocalStorageData();
      expect(result.passed).toBe(true);
      expect(result.warnings).toContain('No persisted data found in localStorage');
    });

    it('should handle localStorage with empty object', () => {
      localStorage.setItem(
        'fishbowl-store',
        JSON.stringify({
          state: {},
          version: 1,
        }),
      );

      const result = auditor.auditLocalStorageData();
      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });
});
