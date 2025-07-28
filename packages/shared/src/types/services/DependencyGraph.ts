/**
 * @fileoverview Dependency Graph Type
 */

export interface DependencyGraph {
  nodes: Array<{
    id: string;
    type: string;
    dependencies: string[];
    dependents: string[];
    metadata?: Record<string, unknown>;
  }>;
  circularReferences: string[][];
  integrity: {
    isValid: boolean;
    violations: Array<{
      sourceId: string;
      targetId: string;
      violation: string;
      severity: "error" | "warning";
    }>;
  };
}
