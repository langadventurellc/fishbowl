export interface OptimizationResult {
  channel: string;
  ruleName: string;
  applied: boolean;
  error?: string;
  improvement?: {
    beforeTime: number;
    afterTime: number;
    percentageImprovement: number;
  };
}
