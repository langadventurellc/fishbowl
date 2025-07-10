import type { SecurityAuditConfig } from './SecurityAuditConfig';
import type { SecurityAuditResult } from './SecurityAuditResult';
import type { SecurityVulnerability } from './SecurityVulnerability';

export class SecurityAuditor {
  private config: SecurityAuditConfig;
  private vulnerabilities: SecurityVulnerability[] = [];
  private lastAuditTime: number = 0;

  constructor(config: SecurityAuditConfig) {
    this.config = config;
  }

  async performSecurityAudit(): Promise<SecurityAuditResult> {
    const startTime = Date.now();
    this.vulnerabilities = [];

    const auditResults = await Promise.all([
      this.auditIpcSecurity(),
      this.auditDatabaseSecurity(),
      this.auditSecureStorageSecurity(),
      this.auditFileSystemSecurity(),
      this.auditProcessSecurity(),
      this.auditDependencySecurity(),
    ]);

    // Combine all vulnerabilities
    auditResults.forEach(result => {
      this.vulnerabilities.push(...result.vulnerabilities);
    });

    this.lastAuditTime = Date.now();

    const result: SecurityAuditResult = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      vulnerabilities: this.vulnerabilities,
      criticalCount: this.vulnerabilities.filter(v => v.severity === 'critical').length,
      highCount: this.vulnerabilities.filter(v => v.severity === 'high').length,
      mediumCount: this.vulnerabilities.filter(v => v.severity === 'medium').length,
      lowCount: this.vulnerabilities.filter(v => v.severity === 'low').length,
      overallScore: this.calculateSecurityScore(),
      recommendations: this.generateRecommendations(),
    };

    return result;
  }

  private async auditIpcSecurity(): Promise<{ vulnerabilities: SecurityVulnerability[] }> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check IPC channel validation
    try {
      // Simulate checking for proper validation
      const fs = await import('fs');
      const path = await import('path');

      // Check if preload script exists and has proper validation
      const preloadPath = path.join(process.cwd(), 'src/preload/index.ts');
      try {
        const preloadContent = fs.readFileSync(preloadPath, 'utf8');

        if (!preloadContent.includes('contextIsolated')) {
          vulnerabilities.push({
            id: 'ipc-context-isolation',
            type: 'configuration',
            severity: 'critical',
            title: 'Context isolation not enforced',
            description: 'Preload script does not enforce context isolation',
            impact: 'Renderer process can access Node.js APIs directly',
            recommendation: 'Ensure contextIsolated is set to true',
            cwe: 'CWE-94',
          });
        }

        if (!preloadContent.includes('validation') && !preloadContent.includes('sanitize')) {
          vulnerabilities.push({
            id: 'ipc-input-validation',
            type: 'validation',
            severity: 'high',
            title: 'Missing input validation in IPC',
            description: 'IPC calls do not appear to validate inputs',
            impact: 'Potential for injection attacks through IPC',
            recommendation: 'Implement comprehensive input validation and sanitization',
            cwe: 'CWE-20',
          });
        }
      } catch {
        vulnerabilities.push({
          id: 'preload-missing',
          type: 'configuration',
          severity: 'medium',
          title: 'Preload script not found',
          description: 'Cannot verify preload script security',
          impact: 'Unable to audit IPC security measures',
          recommendation: 'Ensure preload script exists and is properly configured',
          cwe: 'CWE-200',
        });
      }
    } catch (error) {
      vulnerabilities.push({
        id: 'ipc-audit-error',
        type: 'system',
        severity: 'low',
        title: 'IPC security audit failed',
        description: `Failed to audit IPC security: ${String(error)}`,
        impact: 'Cannot verify IPC security measures',
        recommendation: 'Investigate audit system issues',
        cwe: 'CWE-200',
      });
    }

    return { vulnerabilities };
  }

  private async auditDatabaseSecurity(): Promise<{ vulnerabilities: SecurityVulnerability[] }> {
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      // Check database file permissions and location
      const { app } = await import('electron');
      const fs = await import('fs');
      const path = await import('path');

      const dbPath = path.join(app.getPath('userData'), 'database.sqlite');

      try {
        const stats = fs.statSync(dbPath);
        const mode = stats.mode;

        // Check if database file is world-readable (basic check)
        if (mode & 0o004) {
          vulnerabilities.push({
            id: 'db-world-readable',
            type: 'permissions',
            severity: 'high',
            title: 'Database file is world-readable',
            description: 'Database file has overly permissive read permissions',
            impact: 'Sensitive data could be accessed by other users',
            recommendation: 'Restrict database file permissions to owner only',
            cwe: 'CWE-732',
          });
        }
      } catch {
        // Database file doesn't exist - not necessarily a vulnerability
      }

      // Check for SQL injection protection
      try {
        const fs2 = await import('fs');
        const path2 = await import('path');

        const queryPath = path2.join(process.cwd(), 'src/main/database/queries');
        try {
          const queryFiles = fs2.readdirSync(queryPath, { recursive: true });

          for (const file of queryFiles) {
            if (typeof file === 'string' && file.endsWith('.ts')) {
              const content = fs2.readFileSync(path2.join(queryPath, file), 'utf8');

              // Check for potential SQL injection vulnerabilities
              if (content.includes('${') && content.includes('sql')) {
                vulnerabilities.push({
                  id: `sql-injection-${file}`,
                  type: 'injection',
                  severity: 'critical',
                  title: 'Potential SQL injection vulnerability',
                  description: `File ${file} may contain SQL injection vulnerabilities`,
                  impact: 'Database could be compromised through malicious input',
                  recommendation: 'Use parameterized queries exclusively',
                  cwe: 'CWE-89',
                });
              }
            }
          }
        } catch {
          // Query directory doesn't exist or can't be read
        }
      } catch (error) {
        vulnerabilities.push({
          id: 'db-query-audit-error',
          type: 'system',
          severity: 'low',
          title: 'Database query audit failed',
          description: `Failed to audit database queries: ${String(error)}`,
          impact: 'Cannot verify SQL injection protection',
          recommendation: 'Investigate audit system issues',
          cwe: 'CWE-200',
        });
      }
    } catch (error) {
      vulnerabilities.push({
        id: 'db-audit-error',
        type: 'system',
        severity: 'medium',
        title: 'Database security audit failed',
        description: `Failed to audit database security: ${String(error)}`,
        impact: 'Cannot verify database security measures',
        recommendation: 'Investigate audit system issues',
        cwe: 'CWE-200',
      });
    }

    return { vulnerabilities };
  }

  private async auditSecureStorageSecurity(): Promise<{
    vulnerabilities: SecurityVulnerability[];
  }> {
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      // Check keytar availability and configuration
      const keytar = await import('keytar');

      // Test keytar functionality
      try {
        await keytar.findCredentials('fishbowl-security-test');
      } catch {
        vulnerabilities.push({
          id: 'keytar-unavailable',
          type: 'configuration',
          severity: 'high',
          title: 'Secure storage (keytar) unavailable',
          description: 'System keychain cannot be accessed',
          impact: 'Credentials may be stored in plaintext fallback',
          recommendation: 'Ensure system keychain is available and accessible',
          cwe: 'CWE-312',
        });
      }

      // Check for credential logging
      try {
        const fs = await import('fs');
        const path = await import('path');

        const secureStoragePath = path.join(process.cwd(), 'src/main/secure-storage');

        try {
          const files = fs.readdirSync(secureStoragePath);

          for (const file of files) {
            if (file.endsWith('.ts')) {
              const content = fs.readFileSync(path.join(secureStoragePath, file), 'utf8');

              // Check for potential credential logging
              if (
                (content.includes('console.log') || content.includes('console.info')) &&
                (content.includes('password') ||
                  content.includes('credential') ||
                  content.includes('key'))
              ) {
                vulnerabilities.push({
                  id: `credential-logging-${file}`,
                  type: 'information_disclosure',
                  severity: 'high',
                  title: 'Potential credential logging',
                  description: `File ${file} may log sensitive credentials`,
                  impact: 'Credentials could be exposed in logs',
                  recommendation: 'Remove or sanitize credential logging',
                  cwe: 'CWE-532',
                });
              }
            }
          }
        } catch {
          // Secure storage directory doesn't exist
        }
      } catch {
        vulnerabilities.push({
          id: 'secure-storage-audit-error',
          type: 'system',
          severity: 'low',
          title: 'Secure storage audit failed',
          description: 'Failed to audit secure storage',
          impact: 'Cannot verify secure storage security',
          recommendation: 'Investigate audit system issues',
          cwe: 'CWE-200',
        });
      }
    } catch {
      vulnerabilities.push({
        id: 'keytar-import-error',
        type: 'dependency',
        severity: 'critical',
        title: 'Keytar dependency not available',
        description: 'Cannot import keytar module for secure storage',
        impact: 'No secure credential storage available',
        recommendation: 'Install and configure keytar dependency',
        cwe: 'CWE-312',
      });
    }

    return { vulnerabilities };
  }

  private async auditFileSystemSecurity(): Promise<{ vulnerabilities: SecurityVulnerability[] }> {
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      const { app } = await import('electron');
      const fs = await import('fs');

      // Check user data directory permissions
      const userDataPath = app.getPath('userData');
      const stats = fs.statSync(userDataPath);
      const mode = stats.mode;

      // Check if user data directory is world-writable
      if (mode & 0o002) {
        vulnerabilities.push({
          id: 'userdata-world-writable',
          type: 'permissions',
          severity: 'critical',
          title: 'User data directory is world-writable',
          description: 'Application data directory has overly permissive write permissions',
          impact: 'Sensitive application data could be modified by other users',
          recommendation: 'Restrict user data directory permissions',
          cwe: 'CWE-732',
        });
      }

      // Check for sensitive files in temp directories
      const tempPath = app.getPath('temp');
      try {
        const tempFiles = fs.readdirSync(tempPath);

        const sensitivePatterns = ['password', 'key', 'token', 'credential', 'secret'];
        for (const file of tempFiles) {
          if (sensitivePatterns.some(pattern => file.toLowerCase().includes(pattern))) {
            vulnerabilities.push({
              id: `temp-sensitive-file-${file}`,
              type: 'information_disclosure',
              severity: 'medium',
              title: 'Sensitive file in temp directory',
              description: `File ${file} may contain sensitive information`,
              impact: 'Sensitive data could persist in temporary storage',
              recommendation: 'Ensure sensitive data is not written to temp directories',
              cwe: 'CWE-459',
            });
          }
        }
      } catch {
        // Cannot read temp directory - not necessarily a problem
      }
    } catch (error) {
      vulnerabilities.push({
        id: 'filesystem-audit-error',
        type: 'system',
        severity: 'low',
        title: 'File system security audit failed',
        description: `Failed to audit file system security: ${String(error)}`,
        impact: 'Cannot verify file system security measures',
        recommendation: 'Investigate audit system issues',
        cwe: 'CWE-200',
      });
    }

    return { vulnerabilities };
  }

  private auditProcessSecurity(): Promise<{ vulnerabilities: SecurityVulnerability[] }> {
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      // Check process permissions and capabilities
      if (process.getuid && process.getuid() === 0) {
        vulnerabilities.push({
          id: 'running-as-root',
          type: 'privilege',
          severity: 'critical',
          title: 'Application running as root',
          description: 'Application is running with root privileges',
          impact: 'Full system access if application is compromised',
          recommendation: 'Run application with minimal necessary privileges',
          cwe: 'CWE-250',
        });
      }

      // Check for debug/development features in production
      if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
        if (process.argv.includes('--inspect') || process.argv.includes('--inspect-brk')) {
          vulnerabilities.push({
            id: 'debug-enabled',
            type: 'configuration',
            severity: 'high',
            title: 'Debug mode enabled',
            description: 'Node.js inspector is enabled',
            impact: 'Remote code execution through debug interface',
            recommendation: 'Disable debug mode in production',
            cwe: 'CWE-489',
          });
        }
      }

      // Check environment variables for sensitive data
      const sensitiveEnvPatterns = ['password', 'key', 'token', 'secret', 'credential'];
      for (const [key, value] of Object.entries(process.env)) {
        if (
          sensitiveEnvPatterns.some(
            pattern =>
              key.toLowerCase().includes(pattern) || value?.toLowerCase().includes(pattern),
          )
        ) {
          vulnerabilities.push({
            id: `env-sensitive-${key}`,
            type: 'information_disclosure',
            severity: 'medium',
            title: 'Sensitive data in environment variables',
            description: `Environment variable ${key} may contain sensitive information`,
            impact: 'Sensitive data could be exposed through process information',
            recommendation: 'Use secure storage instead of environment variables for secrets',
            cwe: 'CWE-526',
          });
        }
      }
    } catch (error) {
      vulnerabilities.push({
        id: 'process-audit-error',
        type: 'system',
        severity: 'low',
        title: 'Process security audit failed',
        description: `Failed to audit process security: ${String(error)}`,
        impact: 'Cannot verify process security measures',
        recommendation: 'Investigate audit system issues',
        cwe: 'CWE-200',
      });
    }

    return Promise.resolve({ vulnerabilities });
  }

  private async auditDependencySecurity(): Promise<{ vulnerabilities: SecurityVulnerability[] }> {
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      const fs = await import('fs');
      const path = await import('path');

      // Check package.json for known vulnerable dependencies
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Check for known vulnerable packages (simplified check)
        const knownVulnerablePackages = [
          'lodash@4.17.4', // Example - would need real vulnerability database
          'moment@2.19.3',
        ];

        const allDependencies = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        for (const [pkg, version] of Object.entries(allDependencies)) {
          const pkgVersion = `${pkg}@${String(version)}`;
          if (knownVulnerablePackages.includes(pkgVersion)) {
            vulnerabilities.push({
              id: `vulnerable-dependency-${pkg}`,
              type: 'dependency',
              severity: 'high',
              title: 'Known vulnerable dependency',
              description: `Package ${pkg}@${String(version)} has known vulnerabilities`,
              impact: 'Application could be compromised through vulnerable dependency',
              recommendation: `Update ${pkg} to a secure version`,
              cwe: 'CWE-1104',
            });
          }
        }
      } catch {
        vulnerabilities.push({
          id: 'package-json-missing',
          type: 'configuration',
          severity: 'medium',
          title: 'Package.json not found',
          description: 'Cannot verify dependency security',
          impact: 'Unable to audit dependency vulnerabilities',
          recommendation: 'Ensure package.json exists and is readable',
          cwe: 'CWE-200',
        });
      }
    } catch (error) {
      vulnerabilities.push({
        id: 'dependency-audit-error',
        type: 'system',
        severity: 'low',
        title: 'Dependency security audit failed',
        description: `Failed to audit dependency security: ${String(error)}`,
        impact: 'Cannot verify dependency security',
        recommendation: 'Investigate audit system issues',
        cwe: 'CWE-200',
      });
    }

    return { vulnerabilities };
  }

  private calculateSecurityScore(): number {
    if (this.vulnerabilities.length === 0) {
      return 100;
    }

    const weights = {
      critical: 25,
      high: 10,
      medium: 5,
      low: 1,
    };

    const totalPenalty = this.vulnerabilities.reduce((sum, vuln) => {
      return sum + weights[vuln.severity];
    }, 0);

    // Start at 100 and subtract penalties
    const score = Math.max(0, 100 - totalPenalty);
    return Math.round(score);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.vulnerabilities.some(v => v.type === 'configuration')) {
      recommendations.push('Review and harden application configuration');
    }

    if (this.vulnerabilities.some(v => v.type === 'permissions')) {
      recommendations.push('Audit and restrict file system permissions');
    }

    if (this.vulnerabilities.some(v => v.type === 'injection')) {
      recommendations.push('Implement comprehensive input validation and parameterized queries');
    }

    if (this.vulnerabilities.some(v => v.type === 'information_disclosure')) {
      recommendations.push('Remove or sanitize sensitive information in logs and temporary files');
    }

    if (this.vulnerabilities.some(v => v.type === 'dependency')) {
      recommendations.push('Update dependencies and implement dependency vulnerability scanning');
    }

    if (this.vulnerabilities.some(v => v.severity === 'critical')) {
      recommendations.push('Address critical vulnerabilities immediately');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain current security practices and perform regular audits');
    }

    return recommendations;
  }

  getLastAuditTime(): number {
    return this.lastAuditTime;
  }

  getVulnerabilityCount(): number {
    return this.vulnerabilities.length;
  }

  getVulnerabilitiesByType(): Record<string, number> {
    const counts: Record<string, number> = {};

    this.vulnerabilities.forEach(vuln => {
      counts[vuln.type] = (counts[vuln.type] || 0) + 1;
    });

    return counts;
  }

  clearVulnerabilities(): void {
    this.vulnerabilities = [];
  }
}
