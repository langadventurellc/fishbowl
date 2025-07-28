/**
 * @fileoverview Reference Resolution Result Type
 */

export interface ReferenceResolutionResult {
  resolved: Array<{
    referenceId: string;
    targetId: string;
    data: unknown;
    cached: boolean;
  }>;
  failed: Array<{
    referenceId: string;
    error: string;
    code?: string;
  }>;
  performance: {
    totalTime: number;
    cacheHits: number;
    crossServiceCalls: number;
  };
}
