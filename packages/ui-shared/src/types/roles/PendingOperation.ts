import { RoleViewModel } from "../settings/RoleViewModel";

export interface PendingOperation {
  id: string; // Unique operation ID for tracking
  type: "create" | "update" | "delete";
  roleId: string;
  timestamp: string;
  rollbackData?: RoleViewModel; // For potential rollback on delete operations
  retryCount?: number;
  status?: "pending" | "saving" | "failed" | "completed";
}
