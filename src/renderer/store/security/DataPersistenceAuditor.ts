/**
 * Data persistence security auditor
 *
 * Validates that sensitive data is excluded from localStorage persistence
 * and provides security auditing capabilities for store state
 */

import type { AppState } from '../types';

/**
 * Sensitive data fields that should NEVER be persisted to localStorage
 */
const SENSITIVE_FIELDS = [
  // Agent data - contains user interactions and system state
  'agents',
  'activeAgents',
  'agentStatuses',
  'agentMetadata',
  'lastFetch',
  'cacheValid',

  // Conversation data - contains private user conversations
  'conversations',
  'activeConversationId',

  // Runtime state - ephemeral data that should not persist
  'loading',
  'error',

  // Modal state - temporary UI state that should reset on restart
  'activeModal',
] as const;

/**
 * Fields that are safe to persist (UI preferences and settings)
 */
const SAFE_PERSISTED_FIELDS = [
  'theme',
  'systemTheme',
  'effectiveTheme',
  'sidebarCollapsed',
  'windowDimensions',
  'layoutPreferences',
  'preferences',
  'configuration',
] as const;

/**
 * Type definition for sensitive field names
 */
type SensitiveField = (typeof SENSITIVE_FIELDS)[number];

/**
 * Type definition for safe persisted field names
 */
type SafePersistedField = (typeof SAFE_PERSISTED_FIELDS)[number];

/**
 * Audit result interface
 */
interface AuditResult {
  passed: boolean;
  violations: string[];
  warnings: string[];
  metadata: {
    totalFields: number;
    sensitiveFields: number;
    persistedFields: number;
    auditTimestamp: number;
  };
}

/**
 * Security violation severity levels
 */
enum ViolationSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

/**
 * Data persistence security auditor class
 */
export class DataPersistenceAuditor {
  private static instance: DataPersistenceAuditor;
  private violationLog: Array<{
    timestamp: number;
    severity: ViolationSeverity;
    message: string;
    field?: string;
  }> = [];

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DataPersistenceAuditor {
    if (!DataPersistenceAuditor.instance) {
      DataPersistenceAuditor.instance = new DataPersistenceAuditor();
    }
    return DataPersistenceAuditor.instance;
  }

  /**
   * Audit localStorage data for security violations
   */
  auditLocalStorageData(): AuditResult {
    const violations: string[] = [];
    const warnings: string[] = [];

    try {
      // Get persisted data from localStorage
      const persistedData = this.getPersistedData();

      if (!persistedData) {
        return {
          passed: true,
          violations: [],
          warnings: ['No persisted data found in localStorage'],
          metadata: {
            totalFields: 0,
            sensitiveFields: 0,
            persistedFields: 0,
            auditTimestamp: Date.now(),
          },
        };
      }

      // Check for sensitive data in persisted state
      const persistedFields = Object.keys(persistedData);
      const sensitiveToPersistenceCount = this.checkSensitiveDataInPersistence(
        persistedData,
        violations,
      );

      // Check for unexpected fields
      this.checkUnexpectedFields(persistedFields, warnings);

      // Validate data integrity
      this.validateDataIntegrity(persistedData, warnings);

      // Log violations
      if (violations.length > 0) {
        this.logViolation(
          ViolationSeverity.CRITICAL,
          `Security audit failed: ${violations.length} violations found`,
        );
      }

      return {
        passed: violations.length === 0,
        violations,
        warnings,
        metadata: {
          totalFields: persistedFields.length,
          sensitiveFields: sensitiveToPersistenceCount,
          persistedFields: persistedFields.length,
          auditTimestamp: Date.now(),
        },
      };
    } catch (error) {
      const errorMessage = `Security audit error: ${error instanceof Error ? error.message : String(error)}`;
      this.logViolation(ViolationSeverity.HIGH, errorMessage);

      return {
        passed: false,
        violations: [errorMessage],
        warnings: [],
        metadata: {
          totalFields: 0,
          sensitiveFields: 0,
          persistedFields: 0,
          auditTimestamp: Date.now(),
        },
      };
    }
  }

  /**
   * Audit store state for potential security issues
   */
  auditStoreState(state: AppState): AuditResult {
    const violations: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for sensitive data in memory that could be accidentally persisted
      this.checkSensitiveDataInMemory(state, warnings);

      // Validate state structure
      this.validateStateStructure(state, warnings);

      // Check for potential data leakage patterns
      this.checkDataLeakagePatterns(state, warnings);

      return {
        passed: violations.length === 0,
        violations,
        warnings,
        metadata: {
          totalFields: Object.keys(state).length,
          sensitiveFields: SENSITIVE_FIELDS.length,
          persistedFields: SAFE_PERSISTED_FIELDS.length,
          auditTimestamp: Date.now(),
        },
      };
    } catch (error) {
      const errorMessage = `Store state audit error: ${error instanceof Error ? error.message : String(error)}`;
      this.logViolation(ViolationSeverity.HIGH, errorMessage);

      return {
        passed: false,
        violations: [errorMessage],
        warnings: [],
        metadata: {
          totalFields: 0,
          sensitiveFields: 0,
          persistedFields: 0,
          auditTimestamp: Date.now(),
        },
      };
    }
  }

  /**
   * Get comprehensive security audit report
   */
  getSecurityAuditReport(state: AppState): {
    localStorageAudit: AuditResult;
    storeStateAudit: AuditResult;
    overallPassed: boolean;
    recommendedActions: string[];
  } {
    const localStorageAudit = this.auditLocalStorageData();
    const storeStateAudit = this.auditStoreState(state);
    const overallPassed = localStorageAudit.passed && storeStateAudit.passed;

    const recommendedActions = this.generateRecommendedActions(localStorageAudit, storeStateAudit);

    return {
      localStorageAudit,
      storeStateAudit,
      overallPassed,
      recommendedActions,
    };
  }

  /**
   * Get violation log for debugging
   */
  getViolationLog(): Array<{
    timestamp: number;
    severity: ViolationSeverity;
    message: string;
    field?: string;
  }> {
    return [...this.violationLog];
  }

  /**
   * Clear violation log
   */
  clearViolationLog(): void {
    this.violationLog = [];
  }

  /**
   * Check if a field is considered sensitive
   */
  isSensitiveField(field: string): boolean {
    return SENSITIVE_FIELDS.includes(field as SensitiveField);
  }

  /**
   * Check if a field is safe to persist
   */
  isSafeToPerist(field: string): boolean {
    return SAFE_PERSISTED_FIELDS.includes(field as SafePersistedField);
  }

  /**
   * Get persisted data from localStorage
   */
  private getPersistedData(): Record<string, unknown> | null {
    try {
      const data = localStorage.getItem('fishbowl-store');
      if (!data) return null;

      const parsed = JSON.parse(data) as { state?: Record<string, unknown> };
      return parsed?.state ?? null;
    } catch (error) {
      this.logViolation(
        ViolationSeverity.MEDIUM,
        `Failed to parse localStorage data: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /**
   * Check for sensitive data in persisted state
   */
  private checkSensitiveDataInPersistence(
    persistedData: Record<string, unknown>,
    violations: string[],
  ): number {
    let sensitiveCount = 0;

    for (const field of SENSITIVE_FIELDS) {
      if (field in persistedData) {
        sensitiveCount++;
        violations.push(`CRITICAL: Sensitive field '${field}' found in localStorage persistence`);
        this.logViolation(ViolationSeverity.CRITICAL, `Sensitive data persisted: ${field}`, field);
      }
    }

    return sensitiveCount;
  }

  /**
   * Check for unexpected fields in persisted data
   */
  private checkUnexpectedFields(persistedFields: string[], warnings: string[]): void {
    for (const field of persistedFields) {
      if (!this.isSafeToPerist(field)) {
        warnings.push(
          `Unexpected field '${field}' found in persistence - verify if it should be persisted`,
        );
      }
    }
  }

  /**
   * Validate data integrity of persisted data
   */
  private validateDataIntegrity(persistedData: Record<string, unknown>, warnings: string[]): void {
    // Check for potentially large data structures
    const dataSize = JSON.stringify(persistedData).length;
    if (dataSize > 50000) {
      // 50KB threshold
      warnings.push(`Persisted data size (${dataSize} bytes) exceeds recommended limit (50KB)`);
    }

    // Check for circular references (would cause JSON.stringify to fail)
    try {
      JSON.stringify(persistedData);
    } catch (error) {
      warnings.push(
        `Data integrity issue: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Check for sensitive data in memory that could be accidentally persisted
   */
  private checkSensitiveDataInMemory(state: AppState, warnings: string[]): void {
    // Check for large arrays that might impact performance
    if (state.agents && state.agents.length > 100) {
      warnings.push(`Large agent array in memory (${state.agents.length} items)`);
    }

    if (state.conversations && state.conversations.length > 50) {
      warnings.push(`Large conversation array in memory (${state.conversations.length} items)`);
    }

    // Check for potential memory leaks
    if (state.agentStatuses && Object.keys(state.agentStatuses).length > 100) {
      warnings.push(
        `Large agentStatuses object in memory (${Object.keys(state.agentStatuses).length} items)`,
      );
    }
  }

  /**
   * Validate state structure for potential issues
   */
  private validateStateStructure(state: AppState, warnings: string[]): void {
    // Check for undefined or null critical fields
    if (state.theme === undefined) {
      warnings.push('Theme is undefined - could indicate state corruption');
    }

    if (state.agents === undefined) {
      warnings.push('Agents array is undefined - could indicate state corruption');
    }

    if (state.conversations === undefined) {
      warnings.push('Conversations array is undefined - could indicate state corruption');
    }
  }

  /**
   * Check for data leakage patterns
   */
  private checkDataLeakagePatterns(state: AppState, warnings: string[]): void {
    // Check for error messages that might contain sensitive information
    if (state.error?.includes('password')) {
      warnings.push('Error message may contain sensitive information');
    }

    // Check for potentially sensitive data in preferences
    if (state.preferences && typeof state.preferences === 'object') {
      const preferencesStr = JSON.stringify(state.preferences);
      if (preferencesStr.includes('token') || preferencesStr.includes('key')) {
        warnings.push('Preferences may contain sensitive tokens or keys');
      }
    }
  }

  /**
   * Generate recommended actions based on audit results
   */
  private generateRecommendedActions(
    localStorageAudit: AuditResult,
    storeStateAudit: AuditResult,
  ): string[] {
    const actions: string[] = [];

    if (localStorageAudit.violations.length > 0) {
      actions.push('URGENT: Clear localStorage and fix persistence configuration');
      actions.push('Review and update partialize function to exclude sensitive fields');
    }

    if (storeStateAudit.warnings.length > 0) {
      actions.push('Review store state for potential memory leaks or data issues');
    }

    if (localStorageAudit.warnings.length > 0) {
      actions.push('Review persisted data structure for optimization opportunities');
    }

    if (actions.length === 0) {
      actions.push('No immediate security actions required');
    }

    return actions;
  }

  /**
   * Log a security violation
   */
  private logViolation(severity: ViolationSeverity, message: string, field?: string): void {
    const violation = {
      timestamp: Date.now(),
      severity,
      message,
      field,
    };

    this.violationLog.push(violation);

    // Log to console based on severity
    if (severity === ViolationSeverity.CRITICAL) {
      console.error('[SECURITY CRITICAL]', message, field ? `Field: ${field}` : '');
    } else if (severity === ViolationSeverity.HIGH) {
      console.error('[SECURITY HIGH]', message, field ? `Field: ${field}` : '');
    } else if (severity === ViolationSeverity.MEDIUM) {
      console.warn('[SECURITY MEDIUM]', message, field ? `Field: ${field}` : '');
    } else {
      console.warn('[SECURITY LOW]', message, field ? `Field: ${field}` : '');
    }

    // Keep only last 100 violations to prevent memory leaks
    if (this.violationLog.length > 100) {
      this.violationLog = this.violationLog.slice(-100);
    }
  }
}
