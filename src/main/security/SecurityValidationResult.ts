export interface SecurityValidationResult {
  timestamp: string;
  duration: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  criticalFailures: number;
  overallPassed: boolean;
  results: Array<{
    testId: string;
    testName: string;
    category: string;
    severity: string;
    passed: boolean;
    message: string;
    details: unknown;
    duration: number;
  }>;
}
