import { SecurityAuditor } from './SecurityAuditor';
import { SecurityValidator } from './SecurityValidator';
import type { SecurityAuditConfig } from './SecurityAuditConfig';
import type { SecurityAuditResult } from './SecurityAuditResult';
import type { SecurityValidationResult } from './SecurityValidationResult';

class SecurityManager {
  private auditor: SecurityAuditor;
  private validator: SecurityValidator;
  private auditTimer?: NodeJS.Timeout;
  private config: SecurityAuditConfig;

  constructor() {
    this.config = {
      enabled: true,
      auditInterval: 3600000, // 1 hour
      includeFileSystemAudit: true,
      includeDependencyAudit: true,
      includeProcessAudit: true,
      includeNetworkAudit: false, // Disabled by default
      severityThreshold: 'medium',
      onVulnerabilityFound: (vulnerability: unknown) => {
        if (
          vulnerability &&
          typeof vulnerability === 'object' &&
          'severity' in vulnerability &&
          ((vulnerability as { severity: string }).severity === 'critical' ||
            (vulnerability as { severity: string }).severity === 'high')
        ) {
          console.warn('Security vulnerability found:', vulnerability);
        }
      },
      onAuditComplete: (result: unknown) => {
        if (
          result &&
          typeof result === 'object' &&
          'overallScore' in result &&
          'vulnerabilities' in result &&
          'criticalCount' in result &&
          'highCount' in result
        ) {
          const typedResult = result as {
            overallScore: number;
            vulnerabilities: unknown[];
            criticalCount: number;
            highCount: number;
          };
          console.info('Security audit completed:', {
            score: typedResult.overallScore,
            vulnerabilities: typedResult.vulnerabilities.length,
            criticalCount: typedResult.criticalCount,
            highCount: typedResult.highCount,
          });
        }
      },
    };

    this.auditor = new SecurityAuditor(this.config);
    this.validator = new SecurityValidator();

    if (this.config.enabled) {
      this.startAutomaticAudits();
    }
  }

  async performSecurityAudit(): Promise<SecurityAuditResult> {
    return await this.auditor.performSecurityAudit();
  }

  async runSecurityValidation(): Promise<SecurityValidationResult> {
    return await this.validator.runAllTests();
  }

  async runValidationByCategory(category: string): Promise<SecurityValidationResult> {
    return await this.validator.runTestsByCategory(category);
  }

  async runSingleValidationTest(testId: string): Promise<{
    passed: boolean;
    message: string;
    details?: unknown;
  }> {
    return await this.validator.runTest(testId);
  }

  async performFullSecurityScan(): Promise<{
    audit: SecurityAuditResult;
    validation: SecurityValidationResult;
    overallStatus: 'secure' | 'warning' | 'critical';
    recommendations: string[];
  }> {
    const [audit, validation] = await Promise.all([
      this.performSecurityAudit(),
      this.runSecurityValidation(),
    ]);

    let overallStatus: 'secure' | 'warning' | 'critical' = 'secure';
    const recommendations: string[] = [];

    // Determine overall status
    if (audit.criticalCount > 0 || validation.criticalFailures > 0) {
      overallStatus = 'critical';
      recommendations.push('Address critical security issues immediately');
    } else if (audit.highCount > 0 || validation.failedTests > 0) {
      overallStatus = 'warning';
      recommendations.push('Review and address high-priority security issues');
    }

    // Combine recommendations
    recommendations.push(...audit.recommendations);

    if (validation.failedTests > 0) {
      recommendations.push('Fix failing security validation tests');
    }

    return {
      audit,
      validation,
      overallStatus,
      recommendations,
    };
  }

  getSecurityStatus(): {
    lastAuditTime: number;
    vulnerabilityCount: number;
    vulnerabilitiesByType: Record<string, number>;
    validationTestCount: number;
    auditEnabled: boolean;
  } {
    return {
      lastAuditTime: this.auditor.getLastAuditTime(),
      vulnerabilityCount: this.auditor.getVulnerabilityCount(),
      vulnerabilitiesByType: this.auditor.getVulnerabilitiesByType(),
      validationTestCount: this.validator.getTestCases().length,
      auditEnabled: this.config.enabled,
    };
  }

  enableAutomaticAudits(): void {
    this.config.enabled = true;
    this.startAutomaticAudits();
  }

  disableAutomaticAudits(): void {
    this.config.enabled = false;
    this.stopAutomaticAudits();
  }

  private startAutomaticAudits(): void {
    if (this.auditTimer) {
      clearInterval(this.auditTimer);
    }

    this.auditTimer = setInterval(() => {
      this.performSecurityAudit()
        .then(result => {
          if (this.config.onAuditComplete) {
            this.config.onAuditComplete(result);
          }

          // Check for new vulnerabilities
          result.vulnerabilities.forEach(vulnerability => {
            if (this.config.onVulnerabilityFound) {
              this.config.onVulnerabilityFound(vulnerability);
            }
          });
        })
        .catch(error => {
          console.error('Automatic security audit failed:', error);
        });
    }, this.config.auditInterval);

    // Run initial audit
    setTimeout(() => {
      this.performSecurityAudit().catch(error => {
        console.error('Initial security audit failed:', error);
      });
    }, 5000); // 5 seconds after startup
  }

  private stopAutomaticAudits(): void {
    if (this.auditTimer) {
      clearInterval(this.auditTimer);
      this.auditTimer = undefined;
    }
  }

  updateConfig(newConfig: Partial<SecurityAuditConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.config.enabled) {
      this.startAutomaticAudits();
    } else {
      this.stopAutomaticAudits();
    }
  }

  addCustomValidationTest(testCase: {
    id: string;
    name: string;
    description: string;
    category:
      | 'ipc'
      | 'database'
      | 'storage'
      | 'filesystem'
      | 'memory'
      | 'network'
      | 'electron'
      | 'permissions';
    severity: 'low' | 'medium' | 'high' | 'critical';
    test: () => Promise<{ passed: boolean; message: string; details?: unknown }>;
  }): void {
    this.validator.addTestCase(testCase);
  }

  removeValidationTest(testId: string): void {
    this.validator.removeTestCase(testId);
  }

  // Utility methods for specific security checks
  async checkIpcSecurity(): Promise<SecurityValidationResult> {
    return await this.validator.runTestsByCategory('ipc');
  }

  async checkDatabaseSecurity(): Promise<SecurityValidationResult> {
    return await this.validator.runTestsByCategory('database');
  }

  async checkStorageSecurity(): Promise<SecurityValidationResult> {
    return await this.validator.runTestsByCategory('storage');
  }

  async checkFileSystemSecurity(): Promise<SecurityValidationResult> {
    return await this.validator.runTestsByCategory('filesystem');
  }

  // Cleanup method
  cleanup(): void {
    this.stopAutomaticAudits();
    this.auditor.clearVulnerabilities();
  }
}

// Create singleton instance
export const securityManager = new SecurityManager();
