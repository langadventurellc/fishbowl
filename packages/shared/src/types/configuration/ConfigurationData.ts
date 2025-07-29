/**
 * Configuration data structure for configuration files
 */
export interface ConfigurationData {
  version: string;
  format: string;
  encoding: string;
  metadata: {
    createdAt: string;
    createdBy: string;
    lastModified?: string;
    description?: string;
    operation?: string;
  };
  data: {
    agents: Record<string, unknown>[];
    personalities: Record<string, unknown>[];
    roles: Record<string, unknown>[];
  };
}
