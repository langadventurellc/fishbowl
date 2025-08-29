import type { AgentProcessingResult } from "./AgentProcessingResult";

/**
 * Overall result of processing a user message across multiple agents simultaneously.
 * Returned by ChatOrchestrationService.processUserMessage().
 */
export interface ProcessingResult {
  /** The user message ID that was processed */
  userMessageId: string;

  /** Number of agents that were enabled and attempted processing */
  totalAgents: number;

  /** Number of agents that completed successfully */
  successfulAgents: number;

  /** Number of agents that failed during processing */
  failedAgents: number;

  /** Detailed results for each agent that was processed */
  agentResults: AgentProcessingResult[];

  /** Total processing time in milliseconds (from start to last agent completion) */
  totalDuration: number;
}
