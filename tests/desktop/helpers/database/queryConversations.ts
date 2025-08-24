import type { TestElectronApplication } from "../TestElectronApplication";

import { queryDatabase } from "./queryDatabase";

/**
 * Convenience function to query conversations table
 */
export async function queryConversations(
  electronApp: TestElectronApplication,
): Promise<
  Array<{ id: string; title: string; created_at: string; updated_at: string }>
> {
  return queryDatabase(
    electronApp,
    "SELECT * FROM conversations ORDER BY created_at DESC",
  );
}
