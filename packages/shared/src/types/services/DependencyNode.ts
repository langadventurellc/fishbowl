/**
 * @fileoverview Dependency Node Type
 */

export interface DependencyNode {
  id: string;
  type: string;
  dependencies: string[];
  dependents: string[];
  metadata?: Record<string, unknown>;
}
