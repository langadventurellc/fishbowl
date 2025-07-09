export interface SecurityTestCase {
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
  test: () => Promise<{
    passed: boolean;
    message: string;
    details?: unknown;
  }>;
}
