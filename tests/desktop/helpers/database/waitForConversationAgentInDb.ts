import type { TestElectronApplication } from "../TestElectronApplication";

import { queryConversationAgents } from "./queryConversationAgents";
import type { ConversationAgentDbRow } from "./ConversationAgentDbRow";

/**
 * Wait for a conversation agent to appear in the database
 * @param electronApp - The test electron application instance
 * @param conversationId - The conversation ID to check for
 * @param agentId - The agent ID to wait for
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 * @returns Promise resolving to the conversation agent database row when found
 * @throws Error if the agent is not found within the timeout period
 */
export async function waitForConversationAgentInDb(
  electronApp: TestElectronApplication,
  conversationId: string,
  agentId: string,
  timeout: number = 5000,
): Promise<ConversationAgentDbRow> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const conversationAgents = await queryConversationAgents(
        electronApp,
        conversationId,
      );

      const matchingAgent = conversationAgents.find(
        (agent) => agent.agent_id === agentId,
      );

      if (matchingAgent) {
        return matchingAgent;
      }
    } catch (error) {
      // Log the error but continue trying
      console.warn("Error querying conversation agents:", error);
    }

    // Wait a bit before trying again
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(
    `Conversation agent with conversation_id=${conversationId} and agent_id=${agentId} not found in database after ${timeout}ms timeout`,
  );
}
