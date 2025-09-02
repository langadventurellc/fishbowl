import { AgentSettingsViewModel } from "../settings/AgentSettingsViewModel";

export interface PendingOperation {
  id: string; // Unique operation ID for tracking
  type: "create" | "update" | "delete";
  agentId: string;
  timestamp: string;
  rollbackData?: AgentSettingsViewModel; // For potential rollback on delete operations
  retryCount?: number;
  status?: "pending" | "saving" | "failed" | "completed";
}
