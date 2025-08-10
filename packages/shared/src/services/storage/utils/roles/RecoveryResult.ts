import type { PersistedRolesSettingsData } from "../../../../types/settings";

export interface RecoveryResult {
  data: PersistedRolesSettingsData;
  recovered: boolean;
  recoveryType?: "full" | "partial" | "default";
  skippedRoles?: number;
  errors?: Array<{ path: string; message: string }>;
  backupCreated?: boolean;
  backupPath?: string;
}
