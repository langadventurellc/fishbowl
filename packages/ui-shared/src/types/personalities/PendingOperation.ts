import { PersonalityViewModel } from "../settings/PersonalityViewModel";

export interface PendingOperation {
  id: string; // Unique operation ID for tracking
  type: "create" | "update" | "delete";
  personalityId: string;
  timestamp: string;
  rollbackData?: PersonalityViewModel; // For potential rollback on delete operations
  retryCount?: number;
  status?: "pending" | "saving" | "failed" | "completed";
}
