import type { SecurityVulnerability } from './SecurityVulnerability';

export interface SecurityAuditResult {
  timestamp: string;
  duration: number;
  vulnerabilities: SecurityVulnerability[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  overallScore: number;
  recommendations: string[];
}
