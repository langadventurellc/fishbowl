/**
 * Result of processing a single agent during multi-agent conversation processing.
 */
export interface AgentProcessingResult {
  /** Conversation agent ID that was processed */
  agentId: string;

  /** Whether the agent processing completed successfully */
  success: boolean;

  /** The response content if successful, or undefined if failed */
  response?: string;

  /** The message ID if response was saved to database, or undefined if failed */
  messageId?: string;

  /** Error message if processing failed, or undefined if successful */
  error?: string;

  /** Processing duration in milliseconds */
  duration: number;
}
