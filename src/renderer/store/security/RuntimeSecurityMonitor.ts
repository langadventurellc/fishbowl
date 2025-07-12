/**
 * Runtime security monitor for store operations
 *
 * Provides real-time monitoring of store operations to detect
 * potential security violations and data leakage patterns
 */

import { DataPersistenceAuditor } from './DataPersistenceAuditor';
import type { AppState } from '../types';

/**
 * Security event types for monitoring
 */
enum SecurityEventType {
  PERSISTENCE_VIOLATION = 'PERSISTENCE_VIOLATION',
  DATA_LEAKAGE = 'DATA_LEAKAGE',
  SUSPICIOUS_OPERATION = 'SUSPICIOUS_OPERATION',
  AUDIT_FAILURE = 'AUDIT_FAILURE',
}

/**
 * Security event interface
 */
interface SecurityEvent {
  type: SecurityEventType;
  timestamp: number;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  metadata?: Record<string, unknown>;
}

/**
 * Monitor configuration
 */
interface MonitorConfig {
  enabled: boolean;
  auditInterval: number; // milliseconds
  maxEventHistory: number;
  reportToConsole: boolean;
  reportToExtension: boolean;
}

/**
 * Runtime security monitor class
 */
export class RuntimeSecurityMonitor {
  private static instance: RuntimeSecurityMonitor;
  private auditor: DataPersistenceAuditor;
  private eventHistory: SecurityEvent[] = [];
  private intervalId: number | null = null;
  private config: MonitorConfig;
  private isMonitoring = false;

  private constructor() {
    this.auditor = DataPersistenceAuditor.getInstance();
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      auditInterval: 30000, // 30 seconds in development
      maxEventHistory: 100,
      reportToConsole: true,
      reportToExtension: process.env.NODE_ENV === 'development',
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(): RuntimeSecurityMonitor {
    if (!RuntimeSecurityMonitor.instance) {
      RuntimeSecurityMonitor.instance = new RuntimeSecurityMonitor();
    }
    return RuntimeSecurityMonitor.instance;
  }

  /**
   * Start security monitoring
   */
  startMonitoring(getState: () => AppState): boolean {
    if (!this.config.enabled) {
      console.warn('[Security Monitor] Monitoring disabled');
      return false;
    }

    if (this.isMonitoring) {
      console.warn('[Security Monitor] Already monitoring');
      return true;
    }

    try {
      // Perform initial audit
      this.performSecurityAudit(getState);

      // Set up periodic monitoring
      this.intervalId = window.setInterval(() => {
        this.performSecurityAudit(getState);
      }, this.config.auditInterval);

      this.isMonitoring = true;
      console.warn('[Security Monitor] Started monitoring');
      return true;
    } catch (error) {
      console.error('[Security Monitor] Failed to start monitoring:', error);

      // Still set up monitoring even if initial audit fails
      this.intervalId = window.setInterval(() => {
        this.performSecurityAudit(getState);
      }, this.config.auditInterval);

      this.isMonitoring = true;
      console.warn('[Security Monitor] Started monitoring (with initial audit failure)');
      return true;
    }
  }

  /**
   * Stop security monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isMonitoring = false;
    console.warn('[Security Monitor] Stopped monitoring');
  }

  /**
   * Perform immediate security audit
   */
  performSecurityAudit(getState: () => AppState): void {
    try {
      const state = getState();
      const auditReport = this.auditor.getSecurityAuditReport(state);

      // Report critical violations
      if (auditReport.localStorageAudit.violations.length > 0) {
        for (const violation of auditReport.localStorageAudit.violations) {
          this.reportSecurityEvent({
            type: SecurityEventType.PERSISTENCE_VIOLATION,
            timestamp: Date.now(),
            message: violation,
            severity: 'CRITICAL',
          });
        }
      }

      // Report warnings as medium severity events
      if (auditReport.storeStateAudit.warnings.length > 0) {
        for (const warning of auditReport.storeStateAudit.warnings) {
          this.reportSecurityEvent({
            type: SecurityEventType.DATA_LEAKAGE,
            timestamp: Date.now(),
            message: warning,
            severity: 'MEDIUM',
          });
        }
      }

      // Check for suspicious patterns
      this.checkSuspiciousPatterns(state);
    } catch (error) {
      this.reportSecurityEvent({
        type: SecurityEventType.AUDIT_FAILURE,
        timestamp: Date.now(),
        message: `Security audit failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'HIGH',
      });
    }
  }

  /**
   * Monitor a specific store operation for security issues
   */
  monitorOperation(operationName: string, beforeState: AppState, afterState: AppState): void {
    if (!this.config.enabled) return;

    try {
      // Check for sensitive data being added to persisted state
      this.checkForSensitiveDataChanges(operationName, beforeState, afterState);

      // Check for suspicious data patterns
      this.checkForSuspiciousDataPatterns(operationName, afterState);

      // Check for memory leaks
      this.checkForMemoryLeaks(operationName, beforeState, afterState);
    } catch (error) {
      this.reportSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_OPERATION,
        timestamp: Date.now(),
        message: `Operation monitoring failed for ${operationName}: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'MEDIUM',
      });
    }
  }

  /**
   * Get security event history
   */
  getEventHistory(): SecurityEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Clear security event history
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get current monitoring status
   */
  getMonitoringStatus(): {
    isMonitoring: boolean;
    config: MonitorConfig;
    eventCount: number;
    lastAuditTime: number | null;
  } {
    return {
      isMonitoring: this.isMonitoring,
      config: { ...this.config },
      eventCount: this.eventHistory.length,
      lastAuditTime:
        this.eventHistory.length > 0
          ? this.eventHistory[this.eventHistory.length - 1].timestamp
          : null,
    };
  }

  /**
   * Update monitor configuration
   */
  updateConfig(updates: Partial<MonitorConfig>): void {
    this.config = { ...this.config, ...updates };

    // Restart monitoring if interval changed
    if (updates.auditInterval && this.isMonitoring) {
      this.stopMonitoring();
      // Note: startMonitoring requires getState function, so we can't restart automatically
      console.warn('[Security Monitor] Configuration updated - restart monitoring manually');
    }
  }

  /**
   * Get security summary for development tools
   */
  getSecuritySummary(): {
    status: 'SECURE' | 'WARNING' | 'CRITICAL';
    criticalEvents: number;
    highEvents: number;
    mediumEvents: number;
    lowEvents: number;
    recommendations: string[];
  } {
    const criticalEvents = this.eventHistory.filter(e => e.severity === 'CRITICAL').length;
    const highEvents = this.eventHistory.filter(e => e.severity === 'HIGH').length;
    const mediumEvents = this.eventHistory.filter(e => e.severity === 'MEDIUM').length;
    const lowEvents = this.eventHistory.filter(e => e.severity === 'LOW').length;

    let status: 'SECURE' | 'WARNING' | 'CRITICAL' = 'SECURE';
    if (criticalEvents > 0) {
      status = 'CRITICAL';
    } else if (highEvents > 0 || mediumEvents > 3) {
      status = 'WARNING';
    }

    const recommendations: string[] = [];
    if (criticalEvents > 0) {
      recommendations.push('URGENT: Address critical security violations immediately');
    }
    if (highEvents > 0) {
      recommendations.push('Review high-severity security events');
    }
    if (mediumEvents > 5) {
      recommendations.push('Consider optimizing store operations to reduce warnings');
    }

    return {
      status,
      criticalEvents,
      highEvents,
      mediumEvents,
      lowEvents,
      recommendations,
    };
  }

  /**
   * Report a security event
   */
  private reportSecurityEvent(event: SecurityEvent): void {
    // Add to event history
    this.eventHistory.push(event);

    // Trim history to max size
    if (this.eventHistory.length > this.config.maxEventHistory) {
      this.eventHistory = this.eventHistory.slice(-this.config.maxEventHistory);
    }

    // Report to console if enabled
    if (this.config.reportToConsole) {
      const prefix = `[Security Monitor]`;
      const message = `${event.type}: ${event.message}`;

      if (event.severity === 'CRITICAL') {
        console.error(prefix, message);
      } else if (event.severity === 'HIGH') {
        console.error(prefix, message);
      } else if (event.severity === 'MEDIUM') {
        console.warn(prefix, message);
      } else {
        console.warn(prefix, message);
      }
    }

    // Report to Redux DevTools if enabled
    if (
      this.config.reportToExtension &&
      typeof window !== 'undefined' &&
      (window as unknown as { __REDUX_DEVTOOLS_EXTENSION__?: unknown }).__REDUX_DEVTOOLS_EXTENSION__
    ) {
      try {
        (
          window as unknown as {
            __REDUX_DEVTOOLS_EXTENSION__: { send: (action: string, data: unknown) => void };
          }
        ).__REDUX_DEVTOOLS_EXTENSION__.send(`SECURITY_EVENT_${event.type}`, {
          event,
          timestamp: new Date(event.timestamp).toISOString(),
        });
      } catch {
        // Silently ignore DevTools errors
      }
    }
  }

  /**
   * Check for suspicious patterns in store state
   */
  private checkSuspiciousPatterns(state: AppState): void {
    // Check for unusually large data structures
    if (state.agents && state.agents.length > 1000) {
      this.reportSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_OPERATION,
        timestamp: Date.now(),
        message: `Unusually large agent array: ${state.agents.length} items`,
        severity: 'MEDIUM',
      });
    }

    // Check for potential memory leaks in agent statuses
    if (state.agentStatuses && Object.keys(state.agentStatuses).length > 500) {
      this.reportSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_OPERATION,
        timestamp: Date.now(),
        message: `Unusually large agentStatuses object: ${Object.keys(state.agentStatuses).length} items`,
        severity: 'MEDIUM',
      });
    }

    // Check for error messages that might contain sensitive data
    if (state.error && (state.error.includes('password') || state.error.includes('token'))) {
      this.reportSecurityEvent({
        type: SecurityEventType.DATA_LEAKAGE,
        timestamp: Date.now(),
        message: 'Error message may contain sensitive information',
        severity: 'HIGH',
      });
    }
  }

  /**
   * Check for sensitive data changes during operations
   */
  private checkForSensitiveDataChanges(
    operationName: string,
    beforeState: AppState,
    afterState: AppState,
  ): void {
    // Check if any sensitive fields were modified in a way that could be persisted
    const sensitiveFields = ['agents', 'conversations', 'agentStatuses', 'agentMetadata'];

    for (const field of sensitiveFields) {
      const beforeValue = (beforeState as unknown as Record<string, unknown>)[field];
      const afterValue = (afterState as unknown as Record<string, unknown>)[field];

      if (beforeValue !== afterValue) {
        // This is normal behavior, but we log it for analysis
        if (this.config.reportToConsole && process.env.NODE_ENV === 'development') {
          console.warn(
            `[Security Monitor] Sensitive field '${field}' modified by operation '${operationName}'`,
          );
        }
      }
    }
  }

  /**
   * Check for suspicious data patterns in operation results
   */
  private checkForSuspiciousDataPatterns(operationName: string, state: AppState): void {
    // Check for operations that might be adding too much data
    if (operationName.includes('add') || operationName.includes('set')) {
      const agentCount = state.agents?.length || 0;
      const conversationCount = state.conversations?.length || 0;

      if (agentCount > 200) {
        this.reportSecurityEvent({
          type: SecurityEventType.SUSPICIOUS_OPERATION,
          timestamp: Date.now(),
          message: `Operation '${operationName}' resulted in ${agentCount} agents`,
          severity: 'MEDIUM',
        });
      }

      if (conversationCount > 100) {
        this.reportSecurityEvent({
          type: SecurityEventType.SUSPICIOUS_OPERATION,
          timestamp: Date.now(),
          message: `Operation '${operationName}' resulted in ${conversationCount} conversations`,
          severity: 'MEDIUM',
        });
      }
    }
  }

  /**
   * Check for memory leaks by comparing state sizes
   */
  private checkForMemoryLeaks(
    operationName: string,
    beforeState: AppState,
    afterState: AppState,
  ): void {
    try {
      const beforeSize = JSON.stringify(beforeState).length;
      const afterSize = JSON.stringify(afterState).length;
      const sizeDiff = afterSize - beforeSize;

      // Report if operation caused significant memory increase
      if (sizeDiff > 100000) {
        // 100KB threshold
        this.reportSecurityEvent({
          type: SecurityEventType.SUSPICIOUS_OPERATION,
          timestamp: Date.now(),
          message: `Operation '${operationName}' increased state size by ${sizeDiff} bytes`,
          severity: 'LOW',
        });
      }
    } catch {
      // Ignore JSON.stringify errors (circular references, etc.)
    }
  }
}
