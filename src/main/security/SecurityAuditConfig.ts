export interface SecurityAuditConfig {
  enabled: boolean;
  auditInterval: number; // in milliseconds
  includeFileSystemAudit: boolean;
  includeDependencyAudit: boolean;
  includeProcessAudit: boolean;
  includeNetworkAudit: boolean;
  severityThreshold: 'low' | 'medium' | 'high' | 'critical';
  onVulnerabilityFound?: (vulnerability: unknown) => void;
  onAuditComplete?: (result: unknown) => void;
}
