import type { PersistedRoleData } from "../../../../types/settings/PersistedRoleData";

/**
 * Result of batch validation with comprehensive reporting.
 */
export interface BatchValidationResult {
  totalCount: number;
  validCount: number;
  invalidCount: number;
  validRoles: PersistedRoleData[];
  errors: Array<{
    index: number;
    role?: unknown;
    errors: Array<{ path: string; message: string }>;
  }>;
}
