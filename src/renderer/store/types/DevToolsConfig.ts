/**
 * DevTools configuration type
 */

export interface DevToolsConfig {
  name: string;
  enabled: boolean;
  trace?: boolean;
  traceLimit?: number;
}
