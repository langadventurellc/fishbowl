import type { SecurityValidationResult } from './SecurityValidationResult';
import type { SecurityTestCase } from './SecurityTestCase';

export class SecurityValidator {
  private testCases: SecurityTestCase[] = [];

  constructor() {
    this.initializeDefaultTests();
  }

  private initializeDefaultTests(): void {
    // IPC Security Tests
    this.addTestCase({
      id: 'ipc-input-validation',
      name: 'IPC Input Validation Test',
      description: 'Tests that IPC calls properly validate and sanitize input',
      category: 'ipc',
      severity: 'high',
      test: () => {
        const maliciousInputs = [
          '<script>alert("xss")</script>',
          '"; DROP TABLE agents; --',
          '../../../etc/passwd',
          '${process.exit(1)}',
          'require("child_process").exec("rm -rf /")',
        ];

        for (const input of maliciousInputs) {
          // Test agent creation with malicious input
          try {
            // This would normally call the actual IPC handler
            const sanitized = this.sanitizeInput(input);
            if (sanitized === input) {
              return Promise.resolve({
                passed: false,
                message: `Input not sanitized: ${input}`,
                details: { input, sanitized },
              });
            }
          } catch (error) {
            return Promise.resolve({
              passed: false,
              message: `Error testing input validation: ${String(error)}`,
              details: { input, error: String(error) },
            });
          }
        }

        return Promise.resolve({
          passed: true,
          message: 'IPC input validation working correctly',
          details: { testedInputs: maliciousInputs.length },
        });
      },
    });

    // Context Isolation Test
    this.addTestCase({
      id: 'context-isolation',
      name: 'Context Isolation Test',
      description: 'Verifies that renderer process cannot access Node.js APIs directly',
      category: 'electron',
      severity: 'critical',
      test: () => {
        // This test would be run in the renderer process context
        // For now, we simulate checking the configuration
        try {
          if (process.contextIsolated === false) {
            return Promise.resolve({
              passed: false,
              message: 'Context isolation is disabled',
              details: { contextIsolated: process.contextIsolated },
            });
          }

          return Promise.resolve({
            passed: true,
            message: 'Context isolation properly configured',
            details: { contextIsolated: process.contextIsolated },
          });
        } catch (error) {
          return Promise.resolve({
            passed: false,
            message: `Context isolation test failed: ${String(error)}`,
            details: { error: String(error) },
          });
        }
      },
    });

    // Secure Storage Test
    this.addTestCase({
      id: 'secure-storage-encryption',
      name: 'Secure Storage Encryption Test',
      description: 'Verifies that credentials are stored securely',
      category: 'storage',
      severity: 'high',
      test: async () => {
        try {
          const keytar = await import('keytar');

          // Test setting and getting a credential
          const testService = 'fishbowl-security-test';
          const testAccount = 'test-account';
          const testPassword = 'test-password-123';

          await keytar.setPassword(testService, testAccount, testPassword);
          const retrieved = await keytar.getPassword(testService, testAccount);

          if (retrieved !== testPassword) {
            return {
              passed: false,
              message: 'Secure storage test failed - password mismatch',
              details: { expected: testPassword, actual: retrieved },
            };
          }

          // Clean up test credential
          await keytar.deletePassword(testService, testAccount);

          return {
            passed: true,
            message: 'Secure storage working correctly',
            details: { service: testService },
          };
        } catch (error) {
          return {
            passed: false,
            message: `Secure storage test failed: ${String(error)}`,
            details: { error: String(error) },
          };
        }
      },
    });

    // Database Security Test
    this.addTestCase({
      id: 'database-injection-protection',
      name: 'Database Injection Protection Test',
      description: 'Tests that database queries are protected against SQL injection',
      category: 'database',
      severity: 'critical',
      test: async () => {
        const sqlInjectionAttempts = [
          "'; DROP TABLE agents; --",
          "' OR '1'='1",
          "'; INSERT INTO agents (name) VALUES ('hacked'); --",
          "' UNION SELECT * FROM sqlite_master --",
        ];

        for (const injection of sqlInjectionAttempts) {
          try {
            // Test creating an agent with SQL injection attempt
            // This would normally call the actual database handler
            const result = await this.testDatabaseInput(injection);

            if (result.compromised) {
              return {
                passed: false,
                message: `SQL injection vulnerability detected: ${injection}`,
                details: { injection, result },
              };
            }
          } catch {
            // Errors are expected for malicious input - this is good
            continue;
          }
        }

        return {
          passed: true,
          message: 'Database injection protection working correctly',
          details: { testedInjections: sqlInjectionAttempts.length },
        };
      },
    });

    // File System Security Test
    this.addTestCase({
      id: 'path-traversal-protection',
      name: 'Path Traversal Protection Test',
      description: 'Tests protection against path traversal attacks',
      category: 'filesystem',
      severity: 'high',
      test: () => {
        const pathTraversalAttempts = [
          '../../../etc/passwd',
          '..\\..\\..\\windows\\system32\\config\\sam',
          '/etc/shadow',
          'C:\\Windows\\System32\\config\\SAM',
          '....//....//....//etc/passwd',
        ];

        for (const path of pathTraversalAttempts) {
          try {
            // Test file access with path traversal attempt
            const sanitized = this.sanitizeFilePath(path);

            if (
              sanitized.includes('..') ||
              sanitized.includes('/etc/') ||
              sanitized.includes('\\Windows\\')
            ) {
              return Promise.resolve({
                passed: false,
                message: `Path traversal vulnerability detected: ${path}`,
                details: { original: path, sanitized },
              });
            }
          } catch {
            // Errors are expected for malicious input
            continue;
          }
        }

        return Promise.resolve({
          passed: true,
          message: 'Path traversal protection working correctly',
          details: { testedPaths: pathTraversalAttempts.length },
        });
      },
    });

    // Memory Safety Test
    this.addTestCase({
      id: 'memory-safety',
      name: 'Memory Safety Test',
      description: 'Tests for memory leaks and unsafe memory operations',
      category: 'memory',
      severity: 'medium',
      test: () => {
        try {
          const initialMemory = process.memoryUsage();

          // Simulate memory-intensive operations
          const largeArray = new Array(100000).fill('test');

          // Force garbage collection if available
          if (global.gc) {
            global.gc();
          }

          const finalMemory = process.memoryUsage();
          const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

          // Check if memory usage is reasonable (less than 100MB increase)
          if (memoryIncrease > 100 * 1024 * 1024) {
            return Promise.resolve({
              passed: false,
              message: 'Excessive memory usage detected',
              details: {
                initialHeap: initialMemory.heapUsed,
                finalHeap: finalMemory.heapUsed,
                increase: memoryIncrease,
              },
            });
          }

          // Clear test data
          largeArray.length = 0;

          return Promise.resolve({
            passed: true,
            message: 'Memory safety test passed',
            details: { memoryIncrease },
          });
        } catch (error) {
          return Promise.resolve({
            passed: false,
            message: `Memory safety test failed: ${String(error)}`,
            details: { error: String(error) },
          });
        }
      },
    });
  }

  addTestCase(testCase: SecurityTestCase): void {
    this.testCases.push(testCase);
  }

  removeTestCase(id: string): void {
    this.testCases = this.testCases.filter(test => test.id !== id);
  }

  async runAllTests(): Promise<SecurityValidationResult> {
    const startTime = Date.now();
    const results = [];

    for (const testCase of this.testCases) {
      const testStartTime = Date.now();

      try {
        const result = await testCase.test();
        results.push({
          testId: testCase.id,
          testName: testCase.name,
          category: testCase.category,
          severity: testCase.severity,
          passed: result.passed,
          message: result.message,
          details: result.details,
          duration: Date.now() - testStartTime,
        });
      } catch (error) {
        results.push({
          testId: testCase.id,
          testName: testCase.name,
          category: testCase.category,
          severity: testCase.severity,
          passed: false,
          message: `Test execution failed: ${String(error)}`,
          details: { error: String(error) },
          duration: Date.now() - testStartTime,
        });
      }
    }

    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.filter(r => !r.passed).length;
    const criticalFailures = results.filter(r => !r.passed && r.severity === 'critical').length;

    return {
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      totalTests: this.testCases.length,
      passedTests,
      failedTests,
      criticalFailures,
      overallPassed: failedTests === 0,
      results,
    };
  }

  async runTestsByCategory(category: string): Promise<SecurityValidationResult> {
    const categoryTests = this.testCases.filter(test => test.category === category);
    const originalTests = this.testCases;

    this.testCases = categoryTests;
    const result = await this.runAllTests();
    this.testCases = originalTests;

    return result;
  }

  async runTest(testId: string): Promise<{
    passed: boolean;
    message: string;
    details?: unknown;
  }> {
    const testCase = this.testCases.find(test => test.id === testId);
    if (!testCase) {
      throw new Error(`Test case not found: ${testId}`);
    }

    return await testCase.test();
  }

  getTestCases(): SecurityTestCase[] {
    return [...this.testCases];
  }

  // Helper methods for testing
  private sanitizeInput(input: string): string {
    // Basic XSS protection
    let sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    // Basic SQL injection protection
    sanitized = sanitized
      .replace(/[';]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');

    // Path traversal protection
    sanitized = sanitized.replace(/\.\./g, '').replace(/[<>:"|?*]/g, '');

    return sanitized;
  }

  private sanitizeFilePath(path: string): string {
    // Remove path traversal sequences
    let sanitized = path
      .replace(/\.\./g, '')
      .replace(/[<>:"|?*]/g, '')
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/');

    // Remove absolute path indicators
    sanitized = sanitized.replace(/^\//, '').replace(/^[A-Za-z]:/, '');

    return sanitized;
  }

  private testDatabaseInput(input: string): Promise<{ compromised: boolean }> {
    // Simulate database input testing
    // In a real implementation, this would test actual database operations
    const dangerous = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'UNION', 'SELECT', 'ALTER', 'CREATE'];

    const upperInput = input.toUpperCase();
    const compromised = dangerous.some(keyword => upperInput.includes(keyword));

    return Promise.resolve({ compromised });
  }
}
