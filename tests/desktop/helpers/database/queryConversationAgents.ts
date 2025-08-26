import type { TestElectronApplication } from "../TestElectronApplication";

import { queryDatabase } from "./queryDatabase";
import type { ConversationAgentDbRow } from "./ConversationAgentDbRow";

/**
 * Query conversation agents from the database
 * @param electronApp - The test electron application instance
 * @param conversationId - Optional conversation ID to filter by specific conversation
 * @returns Promise resolving to array of conversation agent database rows
 */
export async function queryConversationAgents(
  electronApp: TestElectronApplication,
  conversationId?: string,
): Promise<ConversationAgentDbRow[]> {
  if (conversationId) {
    return queryDatabase<ConversationAgentDbRow>(
      electronApp,
      "SELECT * FROM conversation_agents WHERE conversation_id = ? ORDER BY display_order ASC, added_at ASC",
      [conversationId],
    );
  }

  return queryDatabase<ConversationAgentDbRow>(
    electronApp,
    "SELECT * FROM conversation_agents ORDER BY display_order ASC, added_at ASC",
  );
}
